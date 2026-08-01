const express = require('express');
const moodController = require('../controllers/moodController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, moodController.createMood);
router.get('/calendar', authenticateToken, moodController.getCalendar);
router.get('/date/:date', authenticateToken, moodController.getDateDetails);
router.put('/:id', authenticateToken, moodController.updateMood);
router.delete('/:id', authenticateToken, moodController.deleteMood);
router.get('/stats/month', authenticateToken, moodController.getMonthlyStats);
// Legacy helper: allow clients to call /stats
router.get('/stats', authenticateToken, moodController.getMonthlyStats);
// Minimal upset endpoints (frontend currently only reads upset list)
router.get('/upset', authenticateToken, moodController.getUpset);
router.post('/upset', authenticateToken, moodController.createUpset);
router.delete('/upset/:id', authenticateToken, moodController.deleteUpset);
router.get('/summary', authenticateToken, moodController.getSummary);
router.get('/trend', authenticateToken, moodController.getTrend);
router.get('/distribution', authenticateToken, moodController.getDistribution);
router.get('/comparison', authenticateToken, moodController.getComparison);
router.get('/recent', authenticateToken, moodController.getRecentActivity);

module.exports = router;
