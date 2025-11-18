const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const actionController = require('../controllers/actionController');
const { checkRole } = require('../middleware/authMiddleware');

// --- Admin ---
router.post('/', checkRole(1), goalController.createGoal);
router.get('/by-process', checkRole(1), goalController.getGoalsByProcess);
router.delete('/:id', checkRole(1), goalController.deleteGoal); // <-- NUEVO

// --- Jefe ---
router.get('/', checkRole(2), goalController.getGoalsForJefe);
router.put('/:id', checkRole(2), goalController.updateGoal);

// --- Acciones ---
router.get('/:goalId/actions', actionController.getActionsByGoal);
router.post('/:goalId/actions', actionController.createActionForGoal);

module.exports = router;
