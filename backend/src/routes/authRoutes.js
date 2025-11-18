const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Rutas Públicas
router.post('/login', controller.login);
router.post('/activate', controller.activateAccount);

// Rutas Protegidas (Requieren Token)
// Usamos el middleware aquí explícitamente o confiamos en app.js
// (Para mayor seguridad, lo pongo aquí también por si acaso)
router.put('/profile', authMiddleware, controller.updateProfile);
router.put('/change-password', authMiddleware, controller.changePassword);

module.exports = router;
