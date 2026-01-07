const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middlewares/auth');

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../uploads/qr-content');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'qr-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - chỉ cho phép video, audio, images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|m4a|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh, video hoặc audio!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max
    },
    fileFilter: fileFilter
});

// @desc    Upload file cho QR content
// @route   POST /api/upload/qr-content
// @access  Private
router.post('/qr-content', protect, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        // Trả về URL của file
        const fileUrl = `/uploads/qr-content/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Upload thành công',
            data: {
                url: fileUrl,
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi upload file: ' + error.message
        });
    }
});

module.exports = router;
