import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import './Cart.css';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const [updating, setUpdating] = useState(null);

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛍️</div>
                        <h2 className="empty-cart-title">Your Cart is Empty</h2>
                        <p className="empty-cart-text">Discover our collection and find something special</p>
                        <Link to="/products" className="btn-celestia">
                            Explore Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdating(productId);
        try {
            await updateQuantity(productId, newQuantity);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            alert('Lỗi cập nhật số lượng');
        } finally {
            setUpdating(null);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await removeFromCart(productId);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            alert('Lỗi xóa sản phẩm');
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1 className="cart-title">Shopping Cart</h1>
                    <p className="cart-subtitle">{cart.totalItems} Item{cart.totalItems > 1 ? 's' : ''} in your cart</p>
                </div>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cart.items.map(item => (
                            <div key={item.product._id} className="cart-item">
                                <img
                                    src={item.product.images?.[0] || 'https://via.placeholder.com/120x150/e8dfd5/5d4e37?text=Celestia'}
                                    alt={item.product.name}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-details">
                                    <h3 className="cart-item-name">{item.product.name}</h3>
                                    <p className="cart-item-price">${item.price?.toFixed(2)}</p>
                                    <div className="cart-item-quantity">
                                        <span className="quantity-label">Quantity:</span>
                                        <div className="quantity-controls">
                                            <button
                                                className="quantity-btn"
                                                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                disabled={updating === item.product._id || item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                className="quantity-input"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value) || 1)}
                                                disabled={updating === item.product._id}
                                                min="1"
                                            />
                                            <button
                                                className="quantity-btn"
                                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                disabled={updating === item.product._id}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="cart-item-actions">
                                    <p className="cart-item-total">${item.total?.toFixed(2)}</p>
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemove(item.product._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="cart-actions">
                            <button
                                className="clear-cart-btn"
                                onClick={clearCart}
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary">
                        <h3 className="summary-title">Order Summary</h3>
                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">${cart.totalPrice?.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Shipping</span>
                            <span className="summary-value">Free</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Total</span>
                            <span className="summary-value summary-total">${cart.totalPrice?.toFixed(2)}</span>
                        </div>
                        <Link to="/checkout" className="checkout-btn">
                            Proceed to Checkout
                        </Link>
                        <Link to="/products" className="continue-shopping-btn">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}