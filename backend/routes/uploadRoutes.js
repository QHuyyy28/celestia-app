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

    if (extname) {
        return cb(null, true);
    } else {
        console.error('File bị từ chối do không đúng định dạng:', file.originalname, file.mimetype);
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
router.post('/qr-content', protect, (req, res) => {
    upload.single('file')(req, res, (err) => {
        // Xử lý lỗi multer (file filter, file size, etc)
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: 'Lỗi upload: ' + err.message
            });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Lỗi khi upload file'
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có file được upload'
                });
            }

            // Tạo full URL để có thể truy cập từ bên ngoài (mobile scan QR)
            // Production: dùng domain thực, Development: dùng ngrok hoặc public IP
            let backendUrl = process.env.BACKEND_URL;
            
            // Nếu không có BACKEND_URL, tự động detect
            if (!backendUrl) {
                const host = req.get('host');
                // Nếu là localhost, cảnh báo người dùng
                if (host.includes('localhost') || host.includes('127.0.0.1')) {
                    console.warn('⚠️  CẢNH BÁO: Đang dùng localhost, QR code sẽ không quét được từ điện thoại khác!');
                    console.warn('💡 Giải pháp: Cần deploy backend hoặc dùng ngrok/localtunnel để tạo URL public');
                }
                backendUrl = `${req.protocol}://${host}`;
            }
            
            // Tạo URL viewer để hiển thị media trên mobile browser
            const filePath = `/uploads/qr-content/${req.file.filename}`;
            const fileUrl = `${backendUrl}/qr-viewer.html?file=${filePath}`;
            const directUrl = `${backendUrl}${filePath}`;
            
            console.log('✅ File uploaded:', {
                filename: req.file.originalname,
                qrUrl: fileUrl,
                directUrl: directUrl
            });
            
            res.json({
                success: true,
                message: 'Upload thành công',
                data: {
                    url: fileUrl,
                    directUrl: directUrl,
                    filename: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    warning: backendUrl.includes('localhost') 
                        ? 'QR code chứa localhost, chỉ truy cập được từ máy này. Cần deploy backend để quét từ điện thoại khác.'
                        : null
                }
            });
        } catch (error) {
            console.error('Upload response error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi upload file: ' + error.message
            });
        }
    });
});

module.exports = router;
