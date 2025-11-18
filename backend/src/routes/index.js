const { Router } = require('express');
const goalRoutes = require('./goalRoutes');

const router = Router();

router.use('/goals', goalRoutes);

module.exports = router;
