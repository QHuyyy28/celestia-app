const Blog = require('../models/Blog');

// @desc    Lấy tất cả blog
// @route   GET /api/blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, published } = req.query;
        const skip = (page - 1) * limit;

        // Xây dựng filter
        let filter = {};
        if (category) filter.category = category;
        if (published !== undefined) filter.published = published === 'true';

        const blogs = await Blog.find(filter)
            .populate('author', 'name email avatar')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy blog theo ID
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'name email avatar');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog không tồn tại'
            });
        }

        // Tăng lượt xem
        blog.views += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy blog theo slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug })
            .populate('author', 'name email avatar');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog không tồn tại'
            });
        }

        // Tăng lượt xem
        blog.views += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Tạo blog mới
// @route   POST /api/blogs
// @access  Private (chỉ admin/author)
exports.createBlog = async (req, res) => {
    try {
        const { title, content, excerpt, image, category, tags, published } = req.body;

        // Validate fields
        if (!title || !content || !image) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ tiêu đề, nội dung và ảnh'
            });
        }

        // Kiểm tra slug đã tồn tại
        const existingSlug = await Blog.findOne({
            slug: title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
        });

        if (existingSlug) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề blog này đã tồn tại'
            });
        }

        const blog = await Blog.create({
            title,
            content,
            excerpt,
            image,
            category,
            tags,
            published,
            author: req.user.id // Lấy từ token
        });

        res.status(201).json({
            success: true,
            message: 'Tạo blog thành công',
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cập nhật blog
// @route   PUT /api/blogs/:id
// @access  Private (chỉ tác giả/admin)
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog không tồn tại'
            });
        }

        // Kiểm tra quyền (chỉ tác giả hoặc admin mới được sửa)
        if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật blog này'
            });
        }

        // Cập nhật các field
        const updateFields = {};
        const allowedFields = ['title', 'content', 'excerpt', 'image', 'category', 'tags', 'published'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        blog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        ).populate('author', 'name email avatar');

        res.status(200).json({
            success: true,
            message: 'Cập nhật blog thành công',
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa blog
// @route   DELETE /api/blogs/:id
// @access  Private (chỉ tác giả/admin)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog không tồn tại'
            });
        }

        // Kiểm tra quyền
        if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa blog này'
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Xóa blog thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Tìm kiếm blog
// @route   GET /api/blogs/search/:keyword
// @access  Public
exports.searchBlogs = async (req, res) => {
    try {
        const { keyword } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } },
                { tags: { $in: [new RegExp(keyword, 'i')] } }
            ],
            published: true
        })
            .populate('author', 'name email avatar')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } },
                { tags: { $in: [new RegExp(keyword, 'i')] } }
            ],
            published: true
        });

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy blog theo category
// @route   GET /api/blogs/category/:category
// @access  Public
exports.getBlogByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find({ category, published: true })
            .populate('author', 'name email avatar')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments({ category, published: true });

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};