const express = require('express');
const {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartStats
} = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');
const {
    validateAddToCart,
    validateUpdateQuantity,
    handleValidationErrors
} = require('../middlewares/validators');

const router = express.Router();

// Protected routes (tất cả yêu cầu đăng nhập)
router.get('/', protect, getCart);
router.get('/count', protect, getCartCount);
router.get('/stats', protect, getCartStats);
router.post('/add', protect, validateAddToCart, handleValidationErrors, addToCart);
router.put('/update/:productId', protect, validateUpdateQuantity, handleValidationErrors, updateQuantity);
router.delete('/remove/:productId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;