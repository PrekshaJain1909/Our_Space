const express = require('express');
const router = express.Router();
const healingController = require('../controllers/healingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Core routes
router.post('/', authenticateToken, healingController.createEntry);
router.get('/', authenticateToken, healingController.getEntries);
router.get('/search', authenticateToken, healingController.searchEntries);
router.get('/stats', authenticateToken, healingController.getStats);

// Frontend-friendly routes (static paths MUST come before dynamic ":id")
router.post('/entries', authenticateToken, healingController.createEntry);
router.get('/entries', authenticateToken, healingController.getEntries);
router.patch('/entries/:id/complete', authenticateToken, healingController.fulfillPromise);

router.post('/promises/request', authenticateToken, healingController.createPromiseRequest);
router.post('/promises', authenticateToken, healingController.createPromise);
router.get('/promises', authenticateToken, healingController.getPromises);
router.patch('/promises/:id/accept', authenticateToken, healingController.acceptPromise);
router.patch('/promises/:id/decline', authenticateToken, healingController.declinePromise);
router.patch('/promises/:id/fulfill', authenticateToken, healingController.fulfillPromise);
router.patch('/promises/:id/break', authenticateToken, healingController.breakPromise);
router.patch('/promises/:id/request-break', authenticateToken, healingController.requestBreakPromise);
router.patch('/promises/:id/agree-break', authenticateToken, healingController.agreeBreakPromise);
router.patch('/promises/:id/disagree-break', authenticateToken, healingController.disagreeBreakPromise);
router.put('/promises/:id', authenticateToken, healingController.updateEntry);
router.delete('/promises/:id', authenticateToken, healingController.deleteEntry);

router.post('/forgiveness', authenticateToken, healingController.createForgiveness);
router.get('/forgiveness', authenticateToken, healingController.getForgiveness);

// Dynamic id-based routes (declared after static routes)
router.get('/:id', authenticateToken, healingController.getEntryById);
router.put('/:id', authenticateToken, healingController.updateEntry);
router.delete('/:id', authenticateToken, healingController.deleteEntry);

module.exports = router;
