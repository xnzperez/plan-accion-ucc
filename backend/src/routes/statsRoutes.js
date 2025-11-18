const express = require('express');
const router = express.Router();
const controller = require('../controllers/statsController');
const { checkRole } = require('../middleware/authMiddleware');

// GET /api/stats/admin - Solo para Administrador
router.get('/admin', checkRole(1), controller.getAdminStats);

module.exports = router;
