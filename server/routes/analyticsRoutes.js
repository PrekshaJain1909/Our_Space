const express = require('express');
const router = express.Router();
const analytics = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, analytics.getHabits);
router.post('/', authenticateToken, analytics.createHabit);
router.get('/:id', authenticateToken, analytics.getHabits); // optional: single habit via filter on client
router.patch('/:id', authenticateToken, analytics.updateHabit);
router.delete('/:id', authenticateToken, analytics.deleteHabit);
router.post('/:id/entry', authenticateToken, analytics.upsertEntry);

module.exports = router;
