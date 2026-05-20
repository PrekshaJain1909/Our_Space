const express = require('express');
const router = express.Router();
const punishmentController = require('../controllers/punishmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/generate', authenticateToken, punishmentController.generate);
router.post('/generate', authenticateToken, punishmentController.generateAndSave);
router.get('/history', authenticateToken, punishmentController.history);

module.exports = router;
