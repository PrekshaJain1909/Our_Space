const express = require('express');
const router = express.Router();
const bucket = require('../controllers/bucketController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, bucket.getAll);
router.get('/:id', authenticateToken, bucket.getById);
router.post('/', authenticateToken, bucket.create);
router.post('/create', authenticateToken, bucket.create);
router.patch('/:id/complete', authenticateToken, bucket.complete);
router.patch('/:id/restore', authenticateToken, bucket.restore);
router.delete('/:id', authenticateToken, bucket.remove);
router.get('/filter/:status', authenticateToken, bucket.filterByStatus);

module.exports = router;
