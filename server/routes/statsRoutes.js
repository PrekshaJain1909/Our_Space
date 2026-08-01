const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/overview', authenticateToken, statsController.overview);
router.get('/trends', authenticateToken, statsController.trends);
router.get('/people', authenticateToken, statsController.people);

module.exports = router;
