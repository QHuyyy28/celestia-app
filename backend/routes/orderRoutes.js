// const express = require('express');
// const {
//     createOrder,
//     getOrderById,
//     getMyOrders,
//     getAllOrders,
//     updateOrderStatus,
//     updateOrderToPaid,
//     cancelOrder,
//     deleteOrder,
//     getOrderStats
// } = require('../controllers/orderController');
// const { protect, admin } = require('../middlewares/auth');

// const router = express.Router();

// // User routes (phải đăng nhập)
// router.post('/', protect, createOrder);
// router.get('/myorders', protect, getMyOrders);
// router.get('/:id', protect, getOrderById);
// router.put('/:id/pay', protect, updateOrderToPaid);
// router.put('/:id/cancel', protect, cancelOrder);

// // Admin routes
// router.get('/', protect, admin, getAllOrders);
// router.get('/stats', protect, admin, getOrderStats);
// router.put('/:id/status', protect, admin, updateOrderStatus);
// router.delete('/:id', protect, admin, deleteOrder);

// module.exports = router;

const express = require('express');
const {
    createOrder,
    getOrderById,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    confirmTransfer,
    verifyPayment
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/auth');
const {
    validateCreateOrder,
    validateOrderId,
    validatePagination,
    handleValidationErrors
} = require('../middlewares/validators');

const router = express.Router();

// Admin routes (đặt trước để tránh conflict với :id)
router.get('/stats/overview', protect, admin, getOrderStats);
router.get('/', protect, admin, validatePagination, handleValidationErrors, getAllOrders);

// Protected routes (phải đăng nhập)
router.post('/', protect, validateCreateOrder, handleValidationErrors, createOrder);
router.get('/my-orders', protect, validatePagination, handleValidationErrors, getMyOrders);
router.get('/:id', protect, validateOrderId, handleValidationErrors, getOrderById);
router.put('/:id/cancel', protect, validateOrderId, handleValidationErrors, cancelOrder);

// Payment verification routes
router.put('/:id/confirm-transfer', protect, validateOrderId, handleValidationErrors, confirmTransfer); // User action
router.put('/:id/verify-payment', protect, admin, validateOrderId, handleValidationErrors, verifyPayment); // Admin action

// Admin routes
router.put('/:id/status', protect, admin, validateOrderId, handleValidationErrors, updateOrderStatus);

module.exports = router;