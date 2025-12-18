const Category = require('../models/Category');

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
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

// @desc    Lấy 1 danh mục theo ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        res.status(200).json({
            success: true,
            data: category
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

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        // Kiểm tra tên danh mục đã tồn tại chưa
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục đã tồn tại'
            });
        }

        const category = await Category.create({
            name,
            description,
            image
        });

        res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            data: category
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

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        // Cập nhật
        category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, image },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: category
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

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Xóa danh mục thành công'
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