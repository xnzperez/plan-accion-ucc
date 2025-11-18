const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware.js');
const { uploadEvidence } = require('../controllers/evidenceController.js');

// Ruta para subir evidencia
router.post('/', upload.single('evidenceFile'), uploadEvidence);

module.exports = router;


