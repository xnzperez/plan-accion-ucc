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

// token jefe:

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZDZkYjFkMjktZmM2MC00YmQ4LWJmMTgtYzZkN2MxYmZmZGUyIiwicm9sZSI6Mn0sImlhdCI6MTc2Mjg4Njc5MiwiZXhwIjoxNzYyODkwMzkyfQ.2uoYnzjTB225BhRrsA4uCEADLOxFY4Lfjsu2qtjnbLY

//admin token:

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiY2M4MTA3NDktYzhiYy00NDhmLWE3NTItZDY0ODQwZDY5ZDgwIiwicm9sZSI6MX0sImlhdCI6MTc2Mjg4Njg4MiwiZXhwIjoxNzYyODkwNDgyfQ.3qrLyWpDKu5u3BpHAk7isVdBVyN_iPGeTDWvCRyr9Vw
