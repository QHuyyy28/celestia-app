const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình storage cho product images
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'celestia/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Giới hạn kích thước max
            { quality: 'auto' } // Tự động optimize
        ]
    }
});

// Cấu hình storage cho thumbnails/avatars
const thumbnailStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'celestia/thumbnails',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' }
        ]
    }
});

// Multer upload instances
const uploadProductImages = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB mỗi file
    }
});

const uploadThumbnail = multer({
    storage: thumbnailStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

module.exports = {
    cloudinary,
    uploadProductImages,
    uploadThumbnail
};
