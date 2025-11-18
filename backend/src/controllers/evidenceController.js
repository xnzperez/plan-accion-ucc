const db = require('../db/index.js');

const uploadEvidence = async (req, res) => {
  const { description, quarter, action_id } = req.body; 
  const uploadedFile = req.file;
  const userId = req.user.id;

  if (!uploadedFile) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }
  if (!quarter || !action_id) {
      return res.status(400).json({ error: 'Faltan datos (trimestre o ID de la acción).' });
  }

  try {
    // --- CORRECCIÓN ---
    // Guardamos la ruta relativa 'uploads/nombre-archivo.jpg' en lugar de la ruta absoluta.
    // 'uploadedFile.filename' nos lo da multer (ej: 'evidenceFile-123456.jpg')
    const file_url = `uploads/${uploadedFile.filename}`; 

    const text = 'INSERT INTO evidences(file_url, description, quarter, action_id, uploaded_by_id) VALUES($1, $2, $3, $4, $5) RETURNING *';
    const values = [file_url, description, quarter, action_id, userId];

    const { rows } = await db.query(text, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error al guardar la evidencia:', err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  uploadEvidence,
};