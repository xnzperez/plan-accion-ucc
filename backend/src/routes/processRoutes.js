/*
 * Archivo: backend/src/routes/processRoutes.js
 * (Añadida la ruta POST para crear procesos)
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/processController');
const { checkRole } = require('../middleware/authMiddleware');

// GET /api/processes
// (Abierto para todos los usuarios logueados)
router.get('/', controller.getAllProcesses); 

// POST /api/processes
// (Protegido - Solo el Admin (Rol 1) puede crear procesos)
router.post('/', checkRole(1), controller.createProcess);

module.exports = router;
