const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { checkRole } = require('../middleware/authMiddleware');

// Rutas protegidas (Solo Admin - Rol 1)
router.get('/', checkRole(1), controller.getAllUsers);
router.post('/', checkRole(1), controller.createUser);
router.patch('/:id/status', checkRole(1), controller.toggleUserStatus);

// Asignación
router.post('/:id/assign', checkRole(1), controller.assignProcess);

// Desasignación (NUEVO)

// ...
// ...
router.delete('/:id/processes/:processId', checkRole(1), controller.unassignProcess);

// ESTA ES LA LÍNEA QUE FALTA O NO SE LEYÓ:
router.post('/:id/reset', checkRole(1), controller.resetUserAccess);

module.exports = router;
