const express = require('express');
const router = express.Router({ mergeParams: true });
const { checkRole } = require('../middleware/authMiddleware');
const controller = require('../controllers/actionController');

// --- Admin ---
router.get('/pending', checkRole(1), controller.getPendingActions);
router.post('/:id/review', checkRole(1), controller.reviewQuarter);
router.delete('/:id', checkRole(1), controller.deleteAction); // <-- NUEVO

// --- Jefe ---
router.get('/', controller.getActionsByGoal);
router.post('/', controller.createActionForGoal);
router.put('/:id', controller.updateActionFields);
router.post('/:id/send', controller.sendQuarterForReview);

module.exports = router;
