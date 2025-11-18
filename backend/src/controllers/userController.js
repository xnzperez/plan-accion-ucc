/*
 * Archivo: backend/src/controllers/userController.js
 * (Versión Mejorada: Soporte para Desasignar y JSON Arrays)
 */
const db = require('../db/index.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// GET /api/users - Listar usuarios con Array de procesos
const getAllUsers = async (req, res) => {
  try {
    // CAMBIO CLAVE: Usamos json_agg para devolver un array real de objetos
    const query = `
      SELECT u.id, u.name, u.email, u.role_id, u.is_active, r.name as role_name,
             COALESCE(
               json_agg(json_build_object('id', p.id, 'name', p.name)) 
               FILTER (WHERE p.id IS NOT NULL), 
               '[]'
             ) as assigned_processes
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_process_assignments upa ON u.id = upa.user_id
      LEFT JOIN processes p ON upa.process_id = p.id
      GROUP BY u.id, u.name, u.email, u.role_id, u.is_active, r.name
      ORDER BY u.name ASC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// POST /api/users - Crear usuario (Flujo Código Manual)
const createUser = async (req, res) => {
  const { name, email, role_id } = req.body; // Ya no pedimos password

  if (!name || !email || !role_id) {
    return res.status(400).json({ error: 'Nombre, email y rol son obligatorios.' });
  }

  try {
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }

    // Generar código aleatorio de 6 caracteres (Ej. A1B2C3)
    const activationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Insertar (Sin password, inactivo, con código)
    const text = `
      INSERT INTO users (name, email, role_id, is_active, verification_token) 
      VALUES ($1, $2, $3, false, $4) 
      RETURNING id, name, email
    `;
    const values = [name, email, role_id, activationCode];

    await db.query(text, values);

    // Devolvemos el código al Admin para que se lo entregue al usuario
    res.status(201).json({
      message: 'Usuario creado.',
      activationCode: activationCode,
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// PATCH /api/users/:id/status - Bloquear/Desbloquear
const toggleUserStatus = async (req, res) => {
  const { id } = req.params; // El ID del usuario que queremos modificar
  const { is_active } = req.body;

  // req.user viene del authMiddleware (el usuario que está logueado haciendo la petición)
  const currentAdminId = req.user.id;

  // --- REGLA DE SEGURIDAD: NO AUTO-BLOQUEO ---
  // Si intentas poner is_active = false Y el ID es el tuyo...
  if (id === currentAdminId && is_active === false) {
    return res.status(400).json({ error: 'Por seguridad, no puedes bloquear tu propia cuenta.' });
  }
  // -------------------------------------------

  try {
    const text = 'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, is_active';
    const { rows } = await db.query(text, [is_active, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al cambiar estado:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// POST /api/users/:id/assign - Asignar Proceso
const assignProcess = async (req, res) => {
  const { id } = req.params;
  const { process_id } = req.body;

  if (!process_id) {
    return res.status(400).json({ error: 'Se requiere el process_id.' });
  }

  try {
    const query = `
      INSERT INTO user_process_assignments (user_id, process_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, process_id) DO NOTHING
    `;
    await db.query(query, [id, process_id]);
    res.json({ message: 'Proceso asignado correctamente.' });
  } catch (err) {
    console.error('Error al asignar proceso:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// DELETE /api/users/:id/processes/:processId - Desasignar Proceso (NUEVO)
const unassignProcess = async (req, res) => {
  const { id, processId } = req.params;

  try {
    const query = 'DELETE FROM user_process_assignments WHERE user_id = $1 AND process_id = $2';
    await db.query(query, [id, processId]);
    res.json({ message: 'Proceso desasignado correctamente.' });
  } catch (err) {
    console.error('Error al desasignar proceso:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// POST /api/users/:id/reset - Generar nuevo código de activación
const resetUserAccess = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Generar nuevo código
    const activationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // 2. Actualizar usuario: Desactivar y asignar nuevo token
    // (No borramos la contraseña vieja aún, se sobrescribirá cuando use el código)
    const query = `
      UPDATE users 
      SET is_active = false, verification_token = $1 
      WHERE id = $2 
      RETURNING name
    `;
    const { rows } = await db.query(query, [activationCode, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({
      message: 'Acceso restablecido.',
      activationCode,
    });
  } catch (err) {
    console.error('Error al restablecer acceso:', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  toggleUserStatus,
  assignProcess,
  unassignProcess,
  resetUserAccess,
};
