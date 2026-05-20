const express = require('express');
const router = express.Router();
const tasks = require('../controllers/tasksController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, tasks.getTasks);
router.post('/', authenticateToken, tasks.createTask);
router.get('/stats', authenticateToken, tasks.getTasks); // placeholder
router.get('/:id', authenticateToken, tasks.getTaskById);
router.patch('/:id', authenticateToken, tasks.updateTask);
router.patch('/:id/complete', authenticateToken, tasks.completeTask);
router.patch('/:id/undo', authenticateToken, tasks.undoComplete);
router.patch('/:id/forgive', authenticateToken, tasks.forgiveTask);
router.delete('/:id', authenticateToken, tasks.deleteTask);

module.exports = router;
