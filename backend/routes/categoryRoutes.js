// const express = require('express');
// const {
//     getCategories,
//     getCategoryById,
//     createCategory,
//     updateCategory,
//     deleteCategory
// } = require('../controllers/categoryController');
// const { protect, admin } = require('../middlewares/auth');

// const router = express.Router();

// // Public routes
// router.get('/', getCategories);
// router.get('/:id', getCategoryById);

// // Admin routes
// router.post('/', protect, admin, createCategory);
// router.put('/:id', protect, admin, updateCategory);
// router.delete('/:id', protect, admin, deleteCategory);

// module.exports = router;

const express = require('express');
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/auth');
const {
    validateCreateCategory,
    validateUpdateCategory,
    validateCategoryId,
    handleValidationErrors
} = require('../middlewares/validators');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', validateCategoryId, handleValidationErrors, getCategoryById);

// Admin routes
router.post('/', protect, admin, validateCreateCategory, handleValidationErrors, createCategory);
router.put('/:id', protect, admin, validateCategoryId, validateUpdateCategory, handleValidationErrors, updateCategory);
router.delete('/:id', protect, admin, validateCategoryId, handleValidationErrors, deleteCategory);

module.exports = router;