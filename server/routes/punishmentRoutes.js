const express = require('express');
const router = express.Router();
const punishmentController = require('../controllers/punishmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/generate', authenticateToken, punishmentController.generate);
router.post('/generate', authenticateToken, punishmentController.generateAndSave);
router.get('/history', authenticateToken, punishmentController.history);
router.post('/history', authenticateToken, punishmentController.saveHistory);
// Punishment templates CRUD for the wheel UI
router.get('/templates', authenticateToken, punishmentController.getTemplates);
router.post('/templates', authenticateToken, punishmentController.addTemplate);
router.delete('/templates/:id', authenticateToken, punishmentController.deleteTemplate);

// New Punishments API (wheel)
router.get('/', authenticateToken, punishmentController.getPunishments);
router.post('/', authenticateToken, punishmentController.addPunishment);
router.delete('/:id', authenticateToken, punishmentController.deletePunishment);
router.get('/spin', authenticateToken, punishmentController.spinPunishment);
router.post('/generated', authenticateToken, punishmentController.saveGeneratedPunishment);

module.exports = router;
