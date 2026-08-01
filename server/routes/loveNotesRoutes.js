const express = require('express');
const router = express.Router();
const loveNotesController = require('../controllers/loveNotesController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, loveNotesController.createNote);
router.get('/', authenticateToken, loveNotesController.getNotes);
router.get('/search', authenticateToken, loveNotesController.searchNotes);
router.get('/stats', authenticateToken, loveNotesController.getStats);
router.get('/:id', authenticateToken, loveNotesController.getNoteById);
router.put('/:id', authenticateToken, loveNotesController.updateNote);
router.delete('/:id', authenticateToken, loveNotesController.deleteNote);

module.exports = router;
