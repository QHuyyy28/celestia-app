const express = require('express');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    clearWishlist,
    getWishlistCount,
    toggleWishlist,
    moveToCart,
    getWishlistPaginated
} = require('../controllers/wishlistController');
const { protect } = require('../middlewares/auth');
const {
    validateWishlistProduct,
    handleValidationErrors,
    validatePagination
} = require('../middlewares/validators');

const router = express.Router();

// Protected routes (tất cả yêu cầu đăng nhập)
router.get('/', protect, getWishlist);
router.get('/paginated', protect, validatePagination, handleValidationErrors, getWishlistPaginated);
router.get('/count', protect, getWishlistCount);
router.get('/check/:productId', protect, validateWishlistProduct, handleValidationErrors, checkInWishlist);
router.post('/add', protect, validateWishlistProduct, handleValidationErrors, addToWishlist);
router.post('/toggle/:productId', protect, validateWishlistProduct, handleValidationErrors, toggleWishlist);
router.post('/move-to-cart/:productId', protect, validateWishlistProduct, handleValidationErrors, moveToCart);
router.delete('/remove/:productId', protect, validateWishlistProduct, handleValidationErrors, removeFromWishlist);
router.delete('/clear', protect, clearWishlist);

module.exports = router;