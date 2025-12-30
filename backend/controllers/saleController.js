const User = require('../models/User');
const { sendSaleNotificationEmail } = require('../services/emailService');

// @desc    Gửi thông báo sale cho tất cả user
// @route   POST /api/sales/notify
// @access  Private/Admin
exports.sendSaleNotification = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            discountPercent, 
            conditions, 
            featuredProducts,
            countdownTime
        } = req.body;

        // Validate input
        if (!title || !discountPercent) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tiêu đề và phần trăm giảm giá'
            });
        }

        // Lấy tất cả user có email được verify
        const users = await User.find({ 
            isEmailVerified: true,
            isSubscribedToNotifications: { $ne: false }
        }).select('_id name email');

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có user nào để gửi thông báo'
            });
        }

        // Chuẩn bị dữ liệu sale
        const saleData = {
            title,
            description,
            discountPercent,
            conditions: conditions || 'Áp dụng cho tất cả sản phẩm có sàn giảm giá',
            countdownTime: countdownTime || '12:00:00',
            featuredProducts: featuredProducts || []
        };

        // Gửi email
        await sendSaleNotificationEmail(users, saleData);

        res.status(200).json({
            success: true,
            message: `Thông báo sale đã được gửi đến ${users.length} người dùng`,
            data: {
                recipientCount: users.length,
                saleTitle: title
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    User đăng ký/hủy đăng ký nhận thông báo
// @route   PUT /api/sales/subscription
// @access  Private
exports.updateNotificationSubscription = async (req, res) => {
    try {
        const { isSubscribed } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { isSubscribedToNotifications: isSubscribed },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: isSubscribed ? 'Đã đăng ký nhận thông báo' : 'Đã hủy đăng ký nhận thông báo',
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};
