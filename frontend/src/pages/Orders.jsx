import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Orders.css';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/orders/my-orders');
            setOrders(response.data.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'Pending': '#ffc107',
            'Processing': '#17a2b8',
            'Shipped': '#007bff',
            'Delivered': '#28a745',
            'Cancelled': '#dc3545'
        };
        return statusColors[status] || '#6c757d';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            'Pending': 'Chờ xử lý',
            'Processing': 'Đang xử lý',
            'Shipped': 'Đang giao',
            'Delivered': 'Đã giao',
            'Cancelled': 'Đã hủy'
        };
        return statusTexts[status] || status;
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <div className="orders-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchOrders} className="retry-button">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h1>Lịch sử đặt hàng</h1>
                <p className="orders-subtitle">
                    Xem và quản lý tất cả đơn hàng của bạn
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="empty-orders">
                    <div className="empty-icon">📦</div>
                    <h2>Chưa có đơn hàng nào</h2>
                    <p>Hãy bắt đầu mua sắm và tạo đơn hàng đầu tiên của bạn!</p>
                    <Link to="/products" className="shop-now-button">
                        Mua sắm ngay
                    </Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header" onClick={() => toggleOrderDetails(order._id)}>
                                <div className="order-info">
                                    <div className="order-id">
                                        <strong>Đơn hàng #</strong>
                                        <span>{order._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                    <div className="order-date">
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>
                                <div className="order-status-info">
                                    <span 
                                        className="order-status"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {getStatusText(order.status)}
                                    </span>
                                    <span className="order-total">
                                        {formatPrice(order.totalPrice)}
                                    </span>
                                    <span className="expand-icon">
                                        {expandedOrder === order._id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {expandedOrder === order._id && (
                                <div className="order-details">
                                    <div className="order-items">
                                        <h3>Sản phẩm</h3>
                                        {order.orderItems.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <div className="item-image">
                                                    {item.product?.image ? (
                                                        <img src={item.product.image} alt={item.name} />
                                                    ) : (
                                                        <div className="no-image">📦</div>
                                                    )}
                                                </div>
                                                <div className="item-info">
                                                    <p className="item-name">{item.name}</p>
                                                    <p className="item-quantity">Số lượng: {item.quantity}</p>
                                                </div>
                                                <div className="item-price">
                                                    {formatPrice(item.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-summary">
                                        <div className="summary-row">
                                            <span>Tổng tiền hàng:</span>
                                            <span>{formatPrice(order.itemsPrice)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Phí vận chuyển:</span>
                                            <span>{formatPrice(order.shippingPrice)}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Tổng thanh toán:</span>
                                            <span>{formatPrice(order.totalPrice)}</span>
                                        </div>
                                    </div>

                                    <div className="order-info-details">
                                        <div className="info-section">
                                            <h4>Địa chỉ giao hàng</h4>
                                            <p>{order.shippingAddress.fullName}</p>
                                            <p>{order.shippingAddress.phone}</p>
                                            <p>{order.shippingAddress.address}</p>
                                            <p>
                                                {order.shippingAddress.ward}, {order.shippingAddress.district}
                                            </p>
                                            <p>{order.shippingAddress.city}</p>
                                        </div>

                                        <div className="info-section">
                                            <h4>Phương thức thanh toán</h4>
                                            <p>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'VietQR'}</p>
                                            {order.isPaid ? (
                                                <p className="paid-status">
                                                    ✓ Đã thanh toán lúc {formatDate(order.paidAt)}
                                                </p>
                                            ) : (
                                                <p className="unpaid-status">
                                                    Chưa thanh toán
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {order.status === 'Pending' && (
                                        <div className="order-actions">
                                            <button className="cancel-order-button">
                                                Hủy đơn hàng
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
