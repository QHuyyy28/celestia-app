const express = require('express');
const {
    sendSaleNotification,
    updateNotificationSubscription
} = require('../controllers/saleController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Admin route - gửi thông báo sale
router.post('/notify', protect, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ admin có quyền gửi thông báo sale'
        });
    }
    next();
}, sendSaleNotification);

// User route - cập nhật đăng ký nhận thông báo
router.put('/subscription', protect, updateNotificationSubscription);

module.exports = router;
