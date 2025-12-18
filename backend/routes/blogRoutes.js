// const express = require('express');
// const {
//     getAllBlogs,
//     getBlogById,
//     getBlogBySlug,
//     createBlog,
//     updateBlog,
//     deleteBlog,
//     searchBlogs,
//     getBlogByCategory
// } = require('../controllers/blogController');
// const { protect, admin } = require('../middlewares/auth');

// const router = express.Router();

// // Public routes
// router.get('/', getAllBlogs);
// router.get('/slug/:slug', getBlogBySlug);
// router.get('/category/:category', getBlogByCategory);
// router.get('/search/:keyword', searchBlogs);
// router.get('/:id', getBlogById);

// // Protected routes (yêu cầu đăng nhập)
// router.post('/', protect, createBlog);
// router.put('/:id', protect, updateBlog);
// router.delete('/:id', protect, deleteBlog);

// module.exports = router;

const express = require('express');
const {
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
    searchBlogs,
    getBlogByCategory
} = require('../controllers/blogController');
const { protect } = require('../middlewares/auth');
const {
    validateCreateBlog,
    validateUpdateBlog,
    validateBlogId,
    validatePagination,
    handleValidationErrors
} = require('../middlewares/validators');

const router = express.Router();

// Public routes
router.get('/', validatePagination, handleValidationErrors, getAllBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/category/:category', validatePagination, handleValidationErrors, getBlogByCategory);
router.get('/search/:keyword', validatePagination, handleValidationErrors, searchBlogs);
router.get('/:id', validateBlogId, handleValidationErrors, getBlogById);

// Protected routes (yêu cầu đăng nhập)
router.post('/', protect, validateCreateBlog, handleValidationErrors, createBlog);
router.put('/:id', protect, validateBlogId, validateUpdateBlog, handleValidationErrors, updateBlog);
router.delete('/:id', protect, validateBlogId, handleValidationErrors, deleteBlog);

module.exports = router;