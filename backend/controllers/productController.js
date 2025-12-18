const Product = require('../models/Product');

// @desc    Lấy tất cả sản phẩm (có phân trang, tìm kiếm, lọc)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        // Lấy query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Tạo query object
        let query = {};

        // Tìm kiếm theo tên
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        // Lọc theo danh mục
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Lọc theo khoảng giá
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = Number(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                query.price.$lte = Number(req.query.maxPrice);
            }
        }

        // Lọc sản phẩm nổi bật
        if (req.query.featured) {
            query.featured = req.query.featured === 'true';
        }

        // Sắp xếp
        let sortBy = {};
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'price_asc':
                    sortBy = { price: 1 };
                    break;
                case 'price_desc':
                    sortBy = { price: -1 };
                    break;
                case 'name_asc':
                    sortBy = { name: 1 };
                    break;
                case 'name_desc':
                    sortBy = { name: -1 };
                    break;
                case 'newest':
                    sortBy = { createdAt: -1 };
                    break;
                default:
                    sortBy = { createdAt: -1 };
            }
        } else {
            sortBy = { createdAt: -1 };
        }

        // Thực hiện query
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        // Đếm tổng số sản phẩm
        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: products
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

// @desc    Lấy 1 sản phẩm theo ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate(
            'category',
            'name slug'
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        res.status(200).json({
            success: true,
            data: product
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

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            comparePrice,
            category,
            stock,
            images,
            featured,
            specifications
        } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            comparePrice,
            category,
            stock,
            images,
            featured,
            specifications
        });

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: product
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

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product
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

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm thành công'
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

// @desc    Lấy sản phẩm nổi bật
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ featured: true })
            .populate('category', 'name')
            .limit(8)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
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

// @desc    Lấy sản phẩm liên quan
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Lấy sản phẩm cùng danh mục, khác ID
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        })
            .populate('category', 'name')
            .limit(4);

        res.status(200).json({
            success: true,
            count: relatedProducts.length,
            data: relatedProducts
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