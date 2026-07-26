const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const forgivenessController = require('../controllers/forgivenessController');

router.post('/', authenticateToken, forgivenessController.createForgiveness);
router.get('/', authenticateToken, forgivenessController.getForgiveness);
router.get('/stats', authenticateToken, forgivenessController.getStats);
router.get('/original/:originalId', authenticateToken, forgivenessController.getByOriginalId);
router.patch('/:id/accept', authenticateToken, forgivenessController.acceptForgiveness);
router.patch('/:id/reject', authenticateToken, forgivenessController.rejectForgiveness);
router.patch('/:id/done', authenticateToken, forgivenessController.markForgivenessDone);
router.delete('/:id', authenticateToken, forgivenessController.deleteForgiveness);

module.exports = router;
