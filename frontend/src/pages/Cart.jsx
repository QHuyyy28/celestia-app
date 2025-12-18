import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const [updating, setUpdating] = useState(null);

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container py-5 text-center">
                <h2>🛒 Giỏ hàng trống</h2>
                <p className="text-muted">Hãy thêm sản phẩm để bắt đầu mua sắm</p>
                <Link to="/products" className="btn btn-primary">
                    Tiếp tục mua sắm
                </Link>
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
        <div className="container py-5">
            <h1 className="mb-4">🛒 Giỏ hàng</h1>

            <div className="row">
                {/* Cart Items */}
                <div className="col-lg-8">
                    {cart.items.map(item => (
                        <div key={item.product._id} className="card mb-3">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-2">
                                        <img
                                            src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                                            alt={item.product.name}
                                            className="img-fluid rounded"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <h5 className="card-title">{item.product.name}</h5>
                                        <p className="text-danger fw-bold">
                                            ₫{item.price?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="input-group" style={{ maxWidth: '120px' }}>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                disabled={updating === item.product._id}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-center"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value))}
                                                disabled={updating === item.product._id}
                                            />
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                disabled={updating === item.product._id}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-2 text-end">
                                        <p className="fw-bold">₫{item.total?.toLocaleString()}</p>
                                    </div>
                                    <div className="col-md-1">
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemove(item.product._id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        className="btn btn-outline-danger"
                        onClick={clearCart}
                    >
                        Xóa tất cả
                    </button>
                </div>

                {/* Cart Summary */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Tóm tắt đơn hàng</h5>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>Số sản phẩm:</span>
                                <strong>{cart.totalItems}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tổng tiền:</span>
                                <strong className="text-danger h5">
                                    ₫{cart.totalPrice?.toLocaleString()}
                                </strong>
                            </div>
                            <hr />
                            <button className="btn btn-primary w-100 mb-2">
                                Thanh toán
                            </button>
                            <Link to="/products" className="btn btn-outline-primary w-100">
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}