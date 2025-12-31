const { body, param, query, validationResult } = require('express-validator');

// ============= VALIDATION MIDDLEWARE =============
// Middleware để catch validation errors
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// ============= AUTH VALIDATORS =============
exports.validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên không được để trống')
        .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa chữ hoa, chữ thường và số')
];

exports.validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
];

exports.validateUpdateProfile = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
    body('phone')
        .optional()
        .trim()
        .custom(value => {
            if (value && !/^[0-9]{10,11}$/.test(value)) {
                throw new Error('Số điện thoại không hợp lệ (10-11 chữ số)');
            }
            return true;
        }),
    body('address')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('Địa chỉ phải từ 5-200 ký tự')
];

exports.validateChangePassword = [
    body('currentPassword')
        .notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
    body('newPassword')
        .notEmpty().withMessage('Mật khẩu mới không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa chữ hoa, chữ thường và số'),
    body('confirmPassword')
        .notEmpty().withMessage('Xác nhận mật khẩu không được để trống')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }
            return true;
        })
];

// ============= PRODUCT VALIDATORS =============
exports.validateCreateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên sản phẩm không được để trống')
        .isLength({ min: 3, max: 200 }).withMessage('Tên phải từ 3-200 ký tự'),
    body('description')
        .trim()
        .notEmpty().withMessage('Mô tả không được để trống')
        .isLength({ min: 10, max: 5000 }).withMessage('Mô tả phải từ 10-5000 ký tự'),
    body('price')
        .notEmpty().withMessage('Giá không được để trống')
        .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
    body('comparePrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Giá so sánh phải là số dương'),
    body('category')
        .optional({ values: 'falsy' })
        .isMongoId().withMessage('ID danh mục không hợp lệ'),
    body('stock')
        .notEmpty().withMessage('Số lượng không được để trống')
        .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên dương'),
    body('images')
        .isArray({ min: 1 }).withMessage('Phải có ít nhất 1 ảnh')
        .custom((images) => {
            images.forEach(img => {
                if (!img.trim()) {
                    throw new Error('URL ảnh không được để trống');
                }
            });
            return true;
        })
];

exports.validateUpdateProduct = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Tên phải từ 3-200 ký tự'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 5000 }).withMessage('Mô tả phải từ 10-5000 ký tự'),
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
    body('comparePrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Giá so sánh phải là số dương'),
    body('category')
        .optional()
        .isMongoId().withMessage('ID danh mục không hợp lệ'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên dương'),
    body('images')
        .optional()
        .isArray({ min: 1 }).withMessage('Phải có ít nhất 1 ảnh')
];

exports.validateProductId = [
    param('id')
        .isMongoId().withMessage('ID sản phẩm không hợp lệ')
];

// ============= CATEGORY VALIDATORS =============
exports.validateCreateCategory = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên danh mục không được để trống')
        .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2-100 ký tự'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
    body('image')
        .optional()
        .trim()
        .isURL().withMessage('URL ảnh không hợp lệ')
];

exports.validateUpdateCategory = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2-100 ký tự'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
    body('image')
        .optional()
        .trim()
        .isURL().withMessage('URL ảnh không hợp lệ')
];

exports.validateCategoryId = [
    param('id')
        .isMongoId().withMessage('ID danh mục không hợp lệ')
];

// ============= BLOG VALIDATORS =============
exports.validateCreateBlog = [
    body('title')
        .trim()
        .notEmpty().withMessage('Tiêu đề không được để trống')
        .isLength({ min: 5, max: 200 }).withMessage('Tiêu đề phải từ 5-200 ký tự'),
    body('content')
        .trim()
        .notEmpty().withMessage('Nội dung không được để trống')
        .isLength({ min: 50 }).withMessage('Nội dung phải có ít nhất 50 ký tự'),
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Tóm tắt không được quá 500 ký tự'),
    body('image')
        .trim()
        .notEmpty().withMessage('Ảnh không được để trống')
        .isURL().withMessage('URL ảnh không hợp lệ'),
    body('category')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Danh mục phải từ 2-50 ký tự'),
    body('tags')
        .optional()
        .isArray().withMessage('Tags phải là một mảng')
        .custom((tags) => {
            if (tags && tags.length > 10) {
                throw new Error('Tối đa 10 tags');
            }
            return true;
        })
];

exports.validateUpdateBlog = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('Tiêu đề phải từ 5-200 ký tự'),
    body('content')
        .optional()
        .trim()
        .isLength({ min: 50 }).withMessage('Nội dung phải có ít nhất 50 ký tự'),
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Tóm tắt không được quá 500 ký tự'),
    body('image')
        .optional()
        .trim()
        .isURL().withMessage('URL ảnh không hợp lệ'),
    body('category')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Danh mục phải từ 2-50 ký tự'),
    body('tags')
        .optional()
        .isArray().withMessage('Tags phải là một mảng')
        .custom((tags) => {
            if (tags && tags.length > 10) {
                throw new Error('Tối đa 10 tags');
            }
            return true;
        })
];

exports.validateBlogId = [
    param('id')
        .isMongoId().withMessage('ID blog không hợp lệ')
];

// ============= ORDER VALIDATORS =============
exports.validateCreateOrder = [
    body('orderItems')
        .isArray({ min: 1 }).withMessage('Giỏ hàng phải có ít nhất 1 sản phẩm'),
    body('orderItems.*.product')
        .notEmpty().withMessage('ID sản phẩm không được để trống')
        .isMongoId().withMessage('ID sản phẩm không hợp lệ'),
    body('orderItems.*.quantity')
        .isInt({ min: 1 }).withMessage('Số lượng phải từ 1 trở lên'),
    body('shippingAddress.fullName')
        .notEmpty().withMessage('Họ tên không được để trống')
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự'),
    body('shippingAddress.phone')
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại phải có 10-11 số'),
    body('shippingAddress.address')
        .notEmpty().withMessage('Địa chỉ không được để trống')
        .isLength({ min: 10, max: 200 }).withMessage('Địa chỉ phải từ 10-200 ký tự'),
    body('shippingAddress.district')
        .notEmpty().withMessage('Quận/Huyện không được để trống'),
    body('shippingAddress.province')
        .notEmpty().withMessage('Tỉnh/Thành phố không được để trống'),
    body('paymentMethod')
        .notEmpty().withMessage('Phương thức thanh toán không được để trống')
        .isIn(['COD', 'VNPay', 'Momo', 'VietQR'])
        .withMessage('Phương thức thanh toán không hợp lệ'),
    body('totalPrice')
        .notEmpty().withMessage('Tổng giá không được để trống')
        .isFloat({ min: 0 }).withMessage('Tổng giá phải là số dương')
];

exports.validateOrderId = [
    param('id')
        .isMongoId().withMessage('ID đơn hàng không hợp lệ')
];

// ============= QUERY VALIDATORS =============
exports.validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Trang phải là số nguyên dương'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit phải từ 1-100')
];

exports.validatePriceRange = [
    query('minPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Min price phải là số dương'),
    query('maxPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Max price phải là số dương')
        .custom((value, { req }) => {
            if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
                throw new Error('Max price phải lớn hơn min price');
            }
            return true;
        })
];

exports.validateSearch = [
    query('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Tìm kiếm phải từ 1-100 ký tự')
];

// ============= CART VALIDATORS =============
exports.validateAddToCart = [
    body('productId')
        .notEmpty().withMessage('ID sản phẩm không được để trống')
        .isMongoId().withMessage('ID sản phẩm không hợp lệ'),
    body('quantity')
        .notEmpty().withMessage('Số lượng không được để trống')
        .isInt({ min: 1 }).withMessage('Số lượng phải từ 1 trở lên')
];

exports.validateUpdateQuantity = [
    param('productId')
        .notEmpty().withMessage('ID sản phẩm không được để trống')
        .isMongoId().withMessage('ID sản phẩm không hợp lệ'),
    body('quantity')
        .notEmpty().withMessage('Số lượng không được để trống')
        .isInt({ min: 1 }).withMessage('Số lượng phải từ 1 trở lên')
];

// ============= REVIEW VALIDATORS =============
exports.validateCreateReview = [
    body('productId')
        .notEmpty().withMessage('ID sản phẩm không được để trống')
        .isMongoId().withMessage('ID sản phẩm không hợp lệ'),
    body('rating')
        .notEmpty().withMessage('Rating không được để trống')
        .isInt({ min: 1, max: 5 }).withMessage('Rating phải từ 1-5'),
    body('title')
        .trim()
        .notEmpty().withMessage('Tiêu đề review không được để trống')
        .isLength({ min: 5, max: 100 }).withMessage('Tiêu đề phải từ 5-100 ký tự'),
    body('comment')
        .trim()
        .notEmpty().withMessage('Nội dung review không được để trống')
        .isLength({ min: 10, max: 1000 }).withMessage('Nội dung phải từ 10-1000 ký tự'),
    body('images')
        .optional()
        .isArray().withMessage('Images phải là một mảng')
        .custom((images) => {
            if (images && images.length > 5) {
                throw new Error('Tối đa 5 ảnh');
            }
            return true;
        })
];

exports.validateUpdateReview = [
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Rating phải từ 1-5'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 }).withMessage('Tiêu đề phải từ 5-100 ký tự'),
    body('comment')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage('Nội dung phải từ 10-1000 ký tự'),
    body('images')
        .optional()
        .isArray().withMessage('Images phải là một mảng')
        .custom((images) => {
            if (images && images.length > 5) {
                throw new Error('Tối đa 5 ảnh');
            }
            return true;
        })
];

exports.validateReviewId = [
    param('id')
        .isMongoId().withMessage('ID review không hợp lệ')
];

// ============= WISHLIST VALIDATORS =============
exports.validateWishlistProduct = [
    param('productId')
        .optional()
        .notEmpty().withMessage('ID sản phẩm không được để trống')
        .isMongoId().withMessage('ID sản phẩm không hợp lệ'),
    body('productId')
        .optional()
        .notEmpty().withMessage('ID sản phẩm không được để trống')
        .isMongoId().withMessage('ID sản phẩm không hợp lệ')
];