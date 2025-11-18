const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const { checkRole } = require('../middleware/authMiddleware');

// GET /api/reports/excel?processId=X
// (Solo Admin puede descargar)
router.get('/excel', checkRole(1), controller.downloadProcessReport);

module.exports = router;
