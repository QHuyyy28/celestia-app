const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Lấy tất cả review của một sản phẩm
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;
        const skip = (page - 1) * limit;

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Xây dựng sort object
        let sortBy = {};
        switch (sort) {
            case 'oldest':
                sortBy = { createdAt: 1 };
                break;
            case 'highest':
                sortBy = { rating: -1 };
                break;
            case 'lowest':
                sortBy = { rating: 1 };
                break;
            case 'helpful':
                sortBy = { helpful: -1 };
                break;
            default:
                sortBy = { createdAt: -1 };
        }

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name avatar')
            .sort(sortBy)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ product: productId });

        // Tính toán distribution (1-5 stars)
        const distribution = await Review.aggregate([
            { $match: { product: mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            },
            distribution,
            averageRating: product.rating,
            totalReviews: product.numReviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy review theo ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'name avatar email')
            .populate('product', 'name images');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review không tồn tại'
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Tạo review mới
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment, images } = req.body;

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Kiểm tra user đã review sản phẩm này chưa
        const existingReview = await Review.findOne({
            product: productId,
            user: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã review sản phẩm này rồi. Vui lòng chỉnh sửa review cũ.'
            });
        }

        // Kiểm tra user đã mua sản phẩm này chưa (verified badge)
        let verified = false;
        const order = await Order.findOne({
            user: req.user._id,
            'orderItems.product': productId
        });

        if (order) {
            verified = true;
        }

        // Tạo review
        const review = await Review.create({
            product: productId,
            user: req.user._id,
            rating,
            title,
            comment,
            images,
            verified
        });

        await review.populate('user', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'Tạo review thành công',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cập nhật review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review không tồn tại'
            });
        }

        // Kiểm tra quyền (chỉ tác giả hoặc admin mới được sửa)
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền sửa review này'
            });
        }

        // Cập nhật các field
        const updateFields = {};
        const allowedFields = ['rating', 'title', 'comment', 'images'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        review = await Review.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        ).populate('user', 'name avatar');

        res.status(200).json({
            success: true,
            message: 'Cập nhật review thành công',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review không tồn tại'
            });
        }

        // Kiểm tra quyền
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa review này'
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Xóa review thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review không tồn tại'
            });
        }

        review.helpful += 1;
        await review.save();

        res.status(200).json({
            success: true,
            message: 'Cảm ơn bạn đã đánh giá review hữu ích',
            data: {
                helpful: review.helpful
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy reviews của user hiện tại
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ user: req.user._id })
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ user: req.user._id });

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy reviews theo rating
// @route   GET /api/reviews/filter/rating/:rating
// @access  Public
exports.getReviewsByRating = async (req, res) => {
    try {
        const { rating } = req.params;
        const { productId, page = 1, limit = 10 } = req.query;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp productId'
            });
        }

        const skip = (page - 1) * limit;

        const reviews = await Review.find({
            product: productId,
            rating: parseInt(rating)
        })
            .populate('user', 'name avatar')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({
            product: productId,
            rating: parseInt(rating)
        });

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};