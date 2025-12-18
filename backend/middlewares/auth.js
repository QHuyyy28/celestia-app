const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ route (phải đăng nhập)
exports.protect = async (req, res, next) => {
    let token;

    // Kiểm tra có token trong header không
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ header: "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin user từ token (không lấy password)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Cho phép đi tiếp
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để truy cập'
        });
    }
};

// Middleware kiểm tra role Admin
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Chỉ Admin mới có quyền truy cập'
        });
    }
};