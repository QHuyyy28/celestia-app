const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads/products nếu chưa có
const uploadDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

// Chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// @desc    Upload nhiều ảnh lên server
// @route   POST /api/upload/images
// @access  Public
router.post('/images', (req, res) => {
    upload.array('images', 10)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'Lỗi upload: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có ảnh được upload'
                });
            }

            // Tạo URLs cho các ảnh
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            const urls = req.files.map(file => {
                return `${backendUrl}/uploads/products/${file.filename}`;
            });

            res.json({
                success: true,
                message: `Upload thành công ${urls.length} ảnh`,
                urls: urls,
                count: urls.length
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    });
});

// @desc    Upload 1 ảnh đơn lẻ
// @route   POST /api/upload/single-image
// @access  Public
router.post('/single-image', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'Lỗi upload: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có ảnh được upload'
                });
            }

            const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            const url = `${backendUrl}/uploads/products/${req.file.filename}`;

            res.json({
                success: true,
                message: 'Upload ảnh thành công',
                url: url
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server: ' + error.message
            });
        }
    });
});

// @desc    Xóa ảnh
// @route   DELETE /api/upload/image/:filename
// @access  Public (nên thêm auth trong production)
router.delete('/image/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy file'
            });
        }

        fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: 'Xóa ảnh thành công'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa ảnh: ' + error.message
        });
    }
});

module.exports = router;
