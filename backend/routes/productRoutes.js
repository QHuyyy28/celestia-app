// const express = require('express');
// const {
//     getProducts,
//     getProductById,
//     createProduct,
//     updateProduct,
//     deleteProduct,
//     getFeaturedProducts,
//     getRelatedProducts
// } = require('../controllers/productController');
// const { protect, admin } = require('../middlewares/auth');

// const router = express.Router();

// // Public routes
// router.get('/', getProducts);
// router.get('/featured', getFeaturedProducts); // Phải đặt trước /:id
// router.get('/:id', getProductById);
// router.get('/:id/related', getRelatedProducts);

// // Admin routes
// router.post('/', protect, admin, createProduct);
// router.put('/:id', protect, admin, updateProduct);
// router.delete('/:id', protect, admin, deleteProduct);

// module.exports = router;

const express = require('express');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getRelatedProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/auth');
const {
    validateCreateProduct,
    validateUpdateProduct,
    validateProductId,
    validatePagination,
    validatePriceRange,
    handleValidationErrors
} = require('../middlewares/validators');

const router = express.Router();

// Public routes
router.get('/', validatePagination, validatePriceRange, handleValidationErrors, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', validateProductId, handleValidationErrors, getProductById);
router.get('/:id/related', validateProductId, handleValidationErrors, getRelatedProducts);

// Admin routes
router.post('/', protect, admin, validateCreateProduct, handleValidationErrors, createProduct);
router.put('/:id', protect, admin, validateProductId, validateUpdateProduct, handleValidationErrors, updateProduct);
router.delete('/:id', protect, admin, validateProductId, handleValidationErrors, deleteProduct);

module.exports = router;