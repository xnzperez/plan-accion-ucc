/*
 * Archivo: backend/src/controllers/processController.js
 * (Añadida la función createProcess)
 */
const db = require('../db/index.js');

/**
 * Obtiene una lista de todos los procesos
 * Ruta: GET /api/processes
 */
const getAllProcesses = async (req, res) => {
  try {
    const query = 'SELECT id, name FROM processes ORDER BY name ASC';
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error en getAllProcesses:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Crea un nuevo Proceso
 * Ruta: POST /api/processes
 */
const createProcess = async (req, res) => {
  console.log('[createProcess] Creando nuevo proceso:', req.body);
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre (name) es obligatorio.' });
  }

  try {
    const text = 'INSERT INTO processes(name) VALUES($1) RETURNING *';
    const { rows } = await db.query(text, [name.trim()]);
    console.log('[createProcess] Proceso creado:', rows[0]);
    res.status(201).json(rows[0]); // Devuelve el nuevo proceso creado
  } catch (err) {
    // Manejar error si el nombre ya existe (violación de 'UNIQUE')
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Un proceso con ese nombre ya existe.' });
    }
    console.error('Error en createProcess:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllProcesses,
  createProcess, // <-- Exportamos la nueva función
};
