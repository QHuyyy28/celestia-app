const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../services/emailService');
const vietqrService = require('../services/vietqrService');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        console.log('=== CREATE ORDER REQUEST ===');
        console.log('User:', req.user?._id);
        console.log('Payment Method:', req.body.paymentMethod);
        console.log('Total Price:', req.body.totalPrice);
        
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        // Kiểm tra giỏ hàng có sản phẩm không
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        // Kiểm tra số lượng tồn kho
        for (let item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy sản phẩm: ${item.name}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho`
                });
            }
        }

        // Tạo đơn hàng
        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice
        });

        // Trừ số lượng tồn kho
        for (let item of orderItems) {
            const product = await Product.findById(item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        // Tạo QR code VietQR nếu thanh toán bằng VietQR
        let paymentInfo = null;
        if (paymentMethod === 'VietQR') {
            try {
                paymentInfo = await vietqrService.createPaymentInfo(
                    order._id.toString(),
                    totalPrice,
                    `Thanh toan don hang ${order._id}`
                );
                console.log('QR Payment Info created:', paymentInfo);
            } catch (qrError) {
                console.error('Failed to generate QR code:', qrError);
                console.error('QR Error details:', qrError.stack);
                // Không throw error, chỉ log và tiếp tục
            }
        }

        // Gửi email xác nhận đơn hàng
        try {
            const customer = await User.findById(req.user._id);
            await sendOrderConfirmationEmail(order, customer);
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Vẫn trả về thành công dù email gửi không thành công
        }

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công. Email xác nhận đã được gửi',
            data: order,
            paymentInfo
        });
    } catch (error) {
        console.error('Create order error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Lấy đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra quyền xem đơn hàng
        if (
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem đơn hàng này'
            });
        }

        res.status(200).json({
            success: true,
            data: order
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

// @desc    Lấy danh sách đơn hàng của user hiện tại
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product', 'name image')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
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

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lọc theo trạng thái
        let query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Lọc theo phương thức thanh toán
        if (req.query.paymentMethod) {
            query.paymentMethod = req.query.paymentMethod;
        }

        // Lọc theo trạng thái thanh toán
        if (req.query.isPaid) {
            query.isPaid = req.query.isPaid === 'true';
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: orders
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

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, shippingProvider, trackingNumber, estimatedDelivery, note } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findById(req.params.id).populate('user');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        const oldStatus = order.status;
        const newStatus = status.toLowerCase();

        // Cập nhật trạng thái
        order.status = newStatus;

        // Thêm vào history
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            status: newStatus,
            note: note || '',
            updatedAt: Date.now()
        });

        // Nếu trạng thái là Delivered, cập nhật deliveredAt và isPaid
        if (newStatus === 'delivered') {
            order.deliveredAt = Date.now();
            order.isPaid = true;
            order.paidAt = Date.now();
        }

        // Nếu hủy đơn hàng, hoàn lại số lượng tồn kho
        if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
            for (let item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }

        await order.save();

        // Gửi email thông báo cập nhật trạng thái (async, không chặn response)
        if (order.user && order.user.email) {
            const statusData = {
                shippingProvider: shippingProvider || '',
                trackingNumber: trackingNumber || '',
                estimatedDelivery: estimatedDelivery || ''
            };
            // Không await, gửi async ở background
            sendOrderStatusUpdateEmail(order, order.user, statusData).catch(err => {
                console.error('Failed to send status update email:', err);
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            data: order
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

// @desc    Cập nhật đơn hàng thành đã thanh toán
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra quyền
        if (
            order.user.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật đơn hàng này'
            });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thanh toán thành công',
            data: updatedOrder
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

// @desc    Hủy đơn hàng
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra quyền
        if (
            order.user.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền hủy đơn hàng này'
            });
        }

        // Kiểm tra trạng thái đơn hàng
        if (order.status === 'Shipped' || order.status === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng đã giao hoặc đang giao'
            });
        }

        if (order.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã được hủy trước đó'
            });
        }

        // Hoàn lại số lượng tồn kho
        for (let item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = 'Cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Hủy đơn hàng thành công',
            data: order
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

// @desc    Xóa đơn hàng (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        await order.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Xóa đơn hàng thành công'
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

// @desc    Thống kê đơn hàng (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
    try {
        // Tổng số đơn hàng
        const totalOrders = await Order.countDocuments();

        // Tổng doanh thu
        const totalRevenue = await Order.aggregate([
            {
                $match: { isPaid: true }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        // Đơn hàng theo trạng thái
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Doanh thu theo tháng (6 tháng gần nhất)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const revenueByMonth = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$totalPrice' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
                ordersByStatus,
                revenueByMonth
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

// @desc    Xác nhận khách đã chuyển khoản (VietQR) - User action
// @route   PUT /api/orders/:id/confirm-transfer
// @access  Private
exports.confirmTransfer = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra quyền
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật đơn hàng này'
            });
        }

        // Chỉ cho phép VietQR
        if (order.paymentMethod !== 'VietQR') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có đơn hàng VietQR mới cần xác nhận chuyển khoản'
            });
        }

        // Cập nhật trạng thái thành "customer_transferred" - chờ admin xác nhận
        order.paymentStatus = 'customer_transferred';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Đã ghi nhận khách chuyển khoản. Admin sẽ kiểm tra trong 1-2 phút.',
            data: order
        });
    } catch (error) {
        console.error('Confirm transfer error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Admin xác nhận thanh toán VietQR
// @route   PUT /api/orders/:id/verify-payment
// @access  Private/Admin
exports.verifyPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Chỉ admin mới có quyền
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ admin mới có quyền xác nhận thanh toán'
            });
        }

        // Chỉ cho phép VietQR
        if (order.paymentMethod !== 'VietQR') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có đơn hàng VietQR mới cần xác nhận thanh toán'
            });
        }

        // Cập nhật thanh toán
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentStatus = 'admin_confirmed';
        order.paymentVerifiedAt = new Date();
        // Tự động chuyển sang "confirmed" để chuẩn bị giao hàng
        order.status = 'confirmed';

        await order.save();

        // Gửi email thông báo
        try {
            const customer = await User.findById(order.user);
            await sendOrderStatusUpdateEmail(order, customer);
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Đã xác nhận thanh toán. Đơn hàng sẵn sàng giao hàng.',
            data: order
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};