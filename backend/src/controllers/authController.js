/*
 * Archivo: backend/src/controllers/authController.js
 * (LIMPIO: Solo Login y Activación Manual)
 */
const db = require('../db/index.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 1. LOGIN ---
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar si está activo
    if (user.is_active === false) {
      // Si tiene token de verificación, es que nunca activó la cuenta
      if (user.verification_token) {
        return res.status(403).json({
          error: 'Cuenta inactiva. Usa el código de activación para ingresar por primera vez.',
        });
      }
      return res.status(403).json({ error: 'Acceso denegado. Su cuenta ha sido deshabilitada.' });
    }

    // Verificar contraseña
    // (Si la contraseña es null porque es nuevo, fallará aquí, lo cual es correcto)
    if (!user.password_hash) {
      return res
        .status(400)
        .json({ error: 'Cuenta no activada. Usa la opción de Activar Cuenta.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { user: { id: user.id, role: user.role_id, name: user.name } },
      'secretkey',
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role_id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// --- 2. ACTIVAR CUENTA (Set Password con Código) ---
const activateAccount = async (req, res) => {
  const { email, code, password } = req.body;

  try {
    // Buscar usuario por email y código (Upper case para asegurar coincidencia)
    const query = 'SELECT * FROM users WHERE email = $1 AND verification_token = $2';
    const result = await db.query(query, [email, code ? code.toUpperCase() : '']);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Código de activación inválido o correo incorrecto.' });
    }

    const user = result.rows[0];

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Activar usuario: Poner Password, Activar, Borrar Token
    await db.query(
      'UPDATE users SET password_hash = $1, is_active = true, verification_token = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    res.json({ message: 'Cuenta activada correctamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error en activateAccount:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// --- 3. ACTUALIZAR PERFIL (Solo Nombre por ahora) ---
const updateProfile = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // Viene del token

  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' });

  try {
    const query = 'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role_id';
    const { rows } = await db.query(query, [name, userId]);

    // Devolvemos el usuario actualizado
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil.' });
  }
};

// --- 4. CAMBIAR CONTRASEÑA (Requiere password actual) ---
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // 1. Obtener usuario y su hash actual
    const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    // 2. Verificar que la contraseña actual sea correcta
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
    }

    // 3. Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // 4. Guardar
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cambiar contraseña.' });
  }
};

// --- EXPORTS ACTUALIZADOS ---
module.exports = {
  login,
  activateAccount,
  updateProfile, // <-- NUEVO
  changePassword, // <-- NUEVO
};
