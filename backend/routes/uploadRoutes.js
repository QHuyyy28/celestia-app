const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middlewares/auth');
const { uploadProductImages } = require('../config/cloudinary');

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../uploads/qr-content');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// File để lưu metadata (thông tin đơn hàng, user, etc)
const metadataFile = path.join(uploadDir, 'metadata.json');
if (!fs.existsSync(metadataFile)) {
    fs.writeFileSync(metadataFile, JSON.stringify({}));
}

// Helper functions cho metadata
const getMetadata = () => {
    try {
        const data = fs.readFileSync(metadataFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const saveMetadata = (metadata) => {
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
};

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Không thể lấy req.body ở đây vì multer chưa parse xong
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
            // Dùng BACKEND_URL từ env nếu có (production), nếu không fallback về localhost
            const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
            
            // Đổi tên file nếu có orderNumber
            const { orderNumber, orderId, customerName, note } = req.body;
            let finalFilename = req.file.filename;
            
            if (orderNumber) {
                const oldPath = req.file.path;
                const ext = path.extname(req.file.filename);
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                finalFilename = `order-${orderNumber}-${uniqueSuffix}${ext}`;
                const newPath = path.join(uploadDir, finalFilename);
                
                // Đổi tên file
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed file: ${req.file.filename} -> ${finalFilename}`);
            }
            
            // Lưu metadata (thông tin đơn hàng)
            const metadata = getMetadata();
            
            metadata[finalFilename] = {
                filename: finalFilename,
                originalname: req.file.originalname,
                orderId: orderId || null,
                orderNumber: orderNumber || null,
                customerName: customerName || null,
                note: note || null,
                uploadedBy: req.user._id,
                uploadedByName: req.user.name,
                uploadDate: new Date().toISOString(),
                size: req.file.size,
                mimetype: req.file.mimetype
            };
            saveMetadata(metadata);
            
            console.log('Saved metadata for:', finalFilename, {
                orderId,
                orderNumber,
                customerName
            });
            
            // Tạo URL viewer để hiển thị media trên mobile browser
            const filePath = `/uploads/qr-content/${finalFilename}`;
            const fileUrl = `${backendUrl}/qr-viewer.html?file=${filePath}`;
            
            res.json({
                success: true,
                message: 'Upload thành công',
                data: {
                    url: fileUrl,
                    directUrl: `${backendUrl}${filePath}`,
                    filename: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype
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

// @desc    Lấy danh sách tất cả file đã upload (cho Admin)
// @route   GET /api/upload/files?orderId=xxx&orderNumber=xxx
// @access  Private/Admin
router.get('/files', protect, async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ Admin mới có quyền xem danh sách file'
            });
        }

        const { orderId, orderNumber } = req.query;
        
        // Đọc metadata
        const metadata = getMetadata();

        // Đọc tất cả file trong thư mục uploads
        const files = fs.readdirSync(uploadDir).filter(f => f !== 'metadata.json');
        
        // Lấy thông tin chi tiết của từng file
        let fileDetails = files.map(filename => {
            const filePath = path.join(uploadDir, filename);
            
            // Skip nếu không phải file
            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
                return null;
            }
            
            const stats = fs.statSync(filePath);
            
            // Lấy metadata của file này
            const fileMeta = metadata[filename] || {};
            
            // Xác định loại file
            const ext = path.extname(filename).toLowerCase();
            let fileType = 'other';
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                fileType = 'image';
            } else if (['.mp4', '.avi', '.mov', '.webm'].includes(ext)) {
                fileType = 'video';
            } else if (['.mp3', '.wav', '.m4a', '.ogg'].includes(ext)) {
                fileType = 'audio';
            }
            
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            
            return {
                filename: filename,
                originalname: fileMeta.originalname || filename,
                fileType: fileType,
                size: stats.size,
                uploadDate: fileMeta.uploadDate || stats.birthtime,
                downloadUrl: `${backendUrl}/uploads/qr-content/${filename}`,
                viewUrl: `${backendUrl}/qr-viewer.html?file=/uploads/qr-content/${filename}`,
                // Thông tin đơn hàng
                orderId: fileMeta.orderId,
                orderNumber: fileMeta.orderNumber,
                customerName: fileMeta.customerName,
                note: fileMeta.note,
                uploadedBy: fileMeta.uploadedByName
            };
        }).filter(f => f !== null);
        
        // Filter theo orderId hoặc orderNumber nếu có
        console.log(`Filter params - orderId: ${orderId}, orderNumber: ${orderNumber}`);
        console.log(`Total files before filter: ${fileDetails.length}`);
        
        if (orderId) {
            fileDetails = fileDetails.filter(f => {
                const match = f.orderId === orderId;
                console.log(`Checking file ${f.filename}: orderId=${f.orderId}, match=${match}`);
                return match;
            });
        }
        if (orderNumber) {
            fileDetails = fileDetails.filter(f => {
                const match = f.orderNumber === orderNumber;
                console.log(`Checking file ${f.filename}: orderNumber=${f.orderNumber}, match=${match}`);
                return match;
            });
        }
        
        console.log(`Files after filter: ${fileDetails.length}`);
        
        // Sắp xếp theo ngày upload mới nhất
        fileDetails.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        res.json({
            success: true,
            count: fileDetails.length,
            data: fileDetails
        });
    } catch (error) {
        console.error('Error getting files:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách file: ' + error.message
        });
    }
});

// @desc    Cập nhật orderId cho file (khi tạo order xong)
// @route   PUT /api/upload/files/:filename/link-order
// @access  Private
router.put('/files/:filename/link-order', protect, async (req, res) => {
    try {
        const { filename } = req.params;
        const { orderId, orderNumber, customerName } = req.body;
        
        // Đọc metadata
        const metadata = getMetadata();
        
        // Kiểm tra file có tồn tại trong metadata không
        if (!metadata[filename]) {
            return res.status(404).json({
                success: false,
                message: 'File không tồn tại trong metadata'
            });
        }
        
        // Cập nhật thông tin đơn hàng
        metadata[filename].orderId = orderId;
        metadata[filename].orderNumber = orderNumber;
        metadata[filename].customerName = customerName || metadata[filename].customerName;
        metadata[filename].updatedAt = new Date().toISOString();
        
        // Đổi tên file nếu có orderNumber và file chưa có prefix order
        if (orderNumber && !filename.startsWith('order-')) {
            const oldPath = path.join(uploadDir, filename);
            const ext = path.extname(filename);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const newFilename = `order-${orderNumber}-${uniqueSuffix}${ext}`;
            const newPath = path.join(uploadDir, newFilename);
            
            try {
                // Đổi tên file
                fs.renameSync(oldPath, newPath);
                
                // Cập nhật metadata với tên mới
                metadata[newFilename] = metadata[filename];
                metadata[newFilename].filename = newFilename;
                delete metadata[filename];
                
                // Lưu metadata
                saveMetadata(metadata);
                
                console.log(`Linked file to order: ${filename} -> ${newFilename}, orderId: ${orderId}`);
                
                return res.json({
                    success: true,
                    message: 'Đã liên kết file với đơn hàng',
                    data: {
                        oldFilename: filename,
                        newFilename: newFilename,
                        orderId,
                        orderNumber
                    }
                });
            } catch (renameError) {
                console.error('Error renaming file:', renameError);
                // Nếu lỗi đổi tên, vẫn lưu metadata với tên cũ
                saveMetadata(metadata);
                
                return res.json({
                    success: true,
                    message: 'Đã liên kết file với đơn hàng (không đổi tên được)',
                    data: {
                        filename,
                        orderId,
                        orderNumber
                    }
                });
            }
        }
        
        // Lưu metadata
        saveMetadata(metadata);
        
        console.log(`Linked file to order: ${filename}, orderId: ${orderId}`);
        
        res.json({
            success: true,
            message: 'Đã liên kết file với đơn hàng',
            data: {
                filename,
                orderId,
                orderNumber
            }
        });
    } catch (error) {
        console.error('Error linking file to order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi liên kết file với đơn hàng: ' + error.message
        });
    }
});

// @desc    Xóa file đã upload (cho Admin)
// @route   DELETE /api/upload/files/:filename
// @access  Private/Admin
router.delete('/files/:filename', protect, async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ Admin mới có quyền xóa file'
            });
        }

        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);
        
        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File không tồn tại'
            });
        }
        
        // Xóa file
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: 'Xóa file thành công'
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa file: ' + error.message
        });
    }
});

// @desc    Upload ảnh sản phẩm lên Cloudinary
// @route   POST /api/upload/product-images
// @access  Private (Admin)
router.post('/product-images', protect, (req, res) => {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ Admin mới có quyền upload ảnh sản phẩm'
        });
    }

    // Upload tối đa 5 ảnh cùng lúc
    uploadProductImages.array('images', 5)(req, res, async (err) => {
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
                message: err.message || 'Lỗi khi upload ảnh'
            });
        }

        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có ảnh được upload'
                });
            }

            // Lấy URLs từ Cloudinary
            const imageUrls = req.files.map(file => file.path);

            res.json({
                success: true,
                message: `Upload thành công ${req.files.length} ảnh`,
                data: {
                    images: imageUrls,
                    count: req.files.length
                }
            });
        } catch (error) {
            console.error('Upload response error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi upload ảnh: ' + error.message
            });
        }
    });
});

// @desc    Upload 1 ảnh đơn lẻ lên Cloudinary
// @route   POST /api/upload/single-image
// @access  Private
router.post('/single-image', protect, (req, res) => {
    uploadProductImages.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'Lỗi upload: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Lỗi khi upload ảnh'
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Không có ảnh được upload'
                });
            }

            res.json({
                success: true,
                message: 'Upload ảnh thành công',
                data: {
                    url: req.file.path,
                    publicId: req.file.filename
                }
            });
        } catch (error) {
            console.error('Upload response error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi upload ảnh: ' + error.message
            });
        }
    });
});

module.exports = router;
