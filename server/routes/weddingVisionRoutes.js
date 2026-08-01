const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const weddingVisionController = require('../controllers/weddingVisionController');
const { authenticateToken } = require('../middleware/authMiddleware');

const uploadPath = path.join(__dirname, '..', 'uploads', 'wedding');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const cleanName = file.originalname
            .toLowerCase()
            .replace(/[^a-z0-9\.\-\_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        cb(null, `${timestamp}-${cleanName}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) return cb(null, true);
        cb(new Error('Only JPG, JPEG, PNG and WEBP files are allowed.'));
    },
});

router.post('/upload', authenticateToken, upload.single('image'), weddingVisionController.uploadImage);
router.post('/', authenticateToken, weddingVisionController.createVisionItem);
router.get('/', authenticateToken, weddingVisionController.getVisionItems);
router.put('/:id', authenticateToken, weddingVisionController.updateVisionItem);
router.delete('/:id', authenticateToken, weddingVisionController.deleteVisionItem);

module.exports = router;
