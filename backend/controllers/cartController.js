const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Lấy giỏ hàng của user
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price images');

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    user: req.user._id,
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Kiểm tra số lượng tồn kho
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Chỉ còn ${product.stock} sản phẩm trong kho`
            });
        }

        // Lấy hoặc tạo giỏ hàng
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const existingItem = cart.items.find(item =>
            item.product.toString() === productId
        );

        if (existingItem) {
            // Cập nhật số lượng
            const newQuantity = existingItem.quantity + quantity;

            if (product.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Chỉ còn ${product.stock} sản phẩm trong kho`
                });
            }

            existingItem.quantity = newQuantity;
            existingItem.total = existingItem.price * newQuantity;
        } else {
            // Thêm sản phẩm mới
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                total: product.price * quantity
            });
        }

        await cart.save();
        await cart.populate('items.product', 'name price images');

        res.status(200).json({
            success: true,
            message: 'Thêm vào giỏ hàng thành công',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Giỏ hàng không tồn tại'
            });
        }

        // Xóa sản phẩm khỏi giỏ
        cart.items = cart.items.filter(item =>
            item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.product', 'name price images');

        res.status(200).json({
            success: true,
            message: 'Xóa khỏi giỏ hàng thành công',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cập nhật số lượng sản phẩm
// @route   PUT /api/cart/update/:productId
// @access  Private
exports.updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // Kiểm tra quantity hợp lệ
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải từ 1 trở lên'
            });
        }

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Kiểm tra số lượng tồn kho
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Chỉ còn ${product.stock} sản phẩm trong kho`
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Giỏ hàng không tồn tại'
            });
        }

        // Tìm sản phẩm trong giỏ
        const cartItem = cart.items.find(item =>
            item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không có trong giỏ hàng'
            });
        }

        // Cập nhật số lượng
        cartItem.quantity = quantity;
        cartItem.total = cartItem.price * quantity;

        await cart.save();
        await cart.populate('items.product', 'name price images');

        res.status(200).json({
            success: true,
            message: 'Cập nhật giỏ hàng thành công',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa tất cả sản phẩm khỏi giỏ hàng
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Giỏ hàng không tồn tại'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Xóa giỏ hàng thành công',
            data: {
                items: [],
                totalItems: 0,
                totalPrice: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy số lượng sản phẩm trong giỏ hàng
// @route   GET /api/cart/count
// @access  Private
exports.getCartCount = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        const count = cart ? cart.totalItems : 0;

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

// @desc    Lấy thống kê giỏ hàng
// @route   GET /api/cart/stats
// @access  Private
exports.getCartStats = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    totalItems: 0,
                    totalPrice: 0,
                    itemsCount: 0,
                    averagePrice: 0
                }
            });
        }

        const itemsCount = cart.items.length;
        const averagePrice = itemsCount > 0 ? cart.totalPrice / cart.totalItems : 0;

        res.status(200).json({
            success: true,
            data: {
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice,
                itemsCount,
                averagePrice: Math.round(averagePrice)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};