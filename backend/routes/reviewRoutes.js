const express = require('express');
const {
    getProductReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getMyReviews,
    getReviewsByRating
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');
const {
    validateCreateReview,
    validateUpdateReview,
    validateReviewId,
    validatePagination,
    handleValidationErrors
} = require('../middlewares/validators');

const router = express.Router();

// Public routes
router.get('/product/:productId', validatePagination, handleValidationErrors, getProductReviews);
router.get('/filter/rating/:rating', validatePagination, handleValidationErrors, getReviewsByRating);
router.get('/:id', validateReviewId, handleValidationErrors, getReviewById);

// Protected routes
router.post('/', protect, validateCreateReview, handleValidationErrors, createReview);
router.get('/my-reviews', protect, validatePagination, handleValidationErrors, getMyReviews);
router.put('/:id', protect, validateReviewId, validateUpdateReview, handleValidationErrors, updateReview);
router.delete('/:id', protect, validateReviewId, handleValidationErrors, deleteReview);
router.put('/:id/helpful', protect, validateReviewId, handleValidationErrors, markHelpful);

module.exports = router;