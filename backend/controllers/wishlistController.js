const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Lấy wishlist của user
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('items.product', 'name price comparePrice images rating numReviews');

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                data: {
                    user: req.user._id,
                    items: [],
                    totalItems: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Thêm sản phẩm vào wishlist
// @route   POST /api/wishlist/add
// @access  Private
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Lấy hoặc tạo wishlist
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, items: [] });
        }

        // Kiểm tra sản phẩm đã có trong wishlist chưa
        const existingItem = wishlist.items.find(item =>
            item.product.toString() === productId
        );

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm đã có trong wishlist'
            });
        }

        // Thêm sản phẩm mới
        wishlist.items.push({
            product: productId
        });

        await wishlist.save();
        await wishlist.populate('items.product', 'name price images');

        res.status(200).json({
            success: true,
            message: 'Thêm vào wishlist thành công',
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa sản phẩm khỏi wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist không tồn tại'
            });
        }

        // Xóa sản phẩm khỏi wishlist
        wishlist.items = wishlist.items.filter(item =>
            item.product.toString() !== productId
        );

        await wishlist.save();
        await wishlist.populate('items.product', 'name price images');

        res.status(200).json({
            success: true,
            message: 'Xóa khỏi wishlist thành công',
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Kiểm tra sản phẩm có trong wishlist không
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkInWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                data: {
                    inWishlist: false
                }
            });
        }

        const inWishlist = wishlist.items.some(item =>
            item.product.toString() === productId
        );

        res.status(200).json({
            success: true,
            data: {
                inWishlist
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa tất cả sản phẩm khỏi wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
exports.clearWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist không tồn tại'
            });
        }

        wishlist.items = [];
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Xóa wishlist thành công',
            data: {
                items: [],
                totalItems: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy số lượng sản phẩm trong wishlist
// @route   GET /api/wishlist/count
// @access  Private
exports.getWishlistCount = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        const count = wishlist ? wishlist.totalItems : 0;

        res.status(200).json({
            success: true,
            data: {
                count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Toggle sản phẩm trong wishlist (thêm nếu chưa có, xóa nếu có)
// @route   POST /api/wishlist/toggle/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Lấy hoặc tạo wishlist
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, items: [] });
        }

        // Kiểm tra sản phẩm đã có trong wishlist
        const existingItemIndex = wishlist.items.findIndex(item =>
            item.product.toString() === productId
        );

        let message = '';
        if (existingItemIndex > -1) {
            // Xóa nếu đã có
            wishlist.items.splice(existingItemIndex, 1);
            message = 'Xóa khỏi wishlist thành công';
        } else {
            // Thêm nếu chưa có
            wishlist.items.push({ product: productId });
            message = 'Thêm vào wishlist thành công';
        }

        await wishlist.save();
        await wishlist.populate('items.product', 'name price images');

        res.status(200).json({
            success: true,
            message,
            data: {
                wishlist,
                inWishlist: existingItemIndex === -1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Di chuyển sản phẩm từ wishlist sang giỏ hàng
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
exports.moveToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const Cart = require('../models/Cart');

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Lấy wishlist
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist không tồn tại'
            });
        }

        // Kiểm tra sản phẩm có trong wishlist không
        const wishlistItem = wishlist.items.find(item =>
            item.product.toString() === productId
        );

        if (!wishlistItem) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không có trong wishlist'
            });
        }

        // Lấy hoặc tạo cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Kiểm tra số lượng tồn kho
        if (product.stock < 1) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm hết hàng'
            });
        }

        // Kiểm tra sản phẩm đã có trong cart
        const cartItem = cart.items.find(item =>
            item.product.toString() === productId
        );

        if (cartItem) {
            cartItem.quantity += 1;
            cartItem.total = cartItem.price * cartItem.quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity: 1,
                price: product.price,
                total: product.price
            });
        }

        // Xóa từ wishlist
        wishlist.items = wishlist.items.filter(item =>
            item.product.toString() !== productId
        );

        await cart.save();
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Di chuyển sang giỏ hàng thành công',
            data: {
                cart,
                wishlist
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy wishlist với phân trang
// @route   GET /api/wishlist/paginated
// @access  Private
exports.getWishlistPaginated = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    currentPage: 1
                }
            });
        }

        // Populate products
        await wishlist.populate({
            path: 'items.product',
            select: 'name price comparePrice images rating numReviews category stock'
        });

        // Tính phân trang
        const total = wishlist.items.length;
        const items = wishlist.items.slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            data: items,
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