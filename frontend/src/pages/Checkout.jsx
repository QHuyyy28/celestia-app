import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import QRPayment from '../components/QRPayment';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showQRPayment, setShowQRPayment] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [orderId, setOrderId] = useState(null);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        address: '',
        ward: '',
        district: '',
        province: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('COD');

    useEffect(() => {
        if (!cart || !cart.items || cart.items.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    const handleInputChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || 
            !shippingInfo.district || !shippingInfo.province) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            // Prepare order data
            const orderData = {
                orderItems: cart.items.filter(item => item && item.product && item.product._id).map(item => ({
                    product: item.product._id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.product.images?.[0] || ''
                })),
                shippingAddress: shippingInfo,
                paymentMethod: paymentMethod,
                itemsPrice: cart.totalPrice,
                shippingPrice: 0, // Free shipping
                totalPrice: cart.totalPrice
            };

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.success) {
                // Nếu thanh toán VietQR, hiển thị màn hình QR
                if (paymentMethod === 'VietQR' && data.paymentInfo) {
                    console.log('Showing QR payment with info:', data.paymentInfo);
                    setPaymentInfo(data.paymentInfo);
                    setOrderId(data.data._id);
                    setShowQRPayment(true);
                } else {
                    // Clear cart
                    await clearCart();
                    
                    // Show success message
                    alert('Đặt hàng thành công! Mã đơn hàng: ' + data.data._id);
                    
                    // Navigate to profile/orders
                    navigate('/profile');
                }
            } else {
                console.error('Order failed:', data);
                alert(data.message || 'Có lỗi xảy ra khi đặt hàng');
            }
        } catch (error) {
            console.error('Order error:', error);
            alert('Không thể kết nối đến server: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return null;
    }

    // Hiển thị màn hình QR Payment nếu đã tạo đơn với VietQR
    if (showQRPayment && paymentInfo) {
        return (
            <div className="checkout-page">
                <QRPayment 
                    paymentInfo={paymentInfo}
                    orderId={orderId}
                    onPaymentComplete={async () => {
                        await clearCart();
                        alert('Cảm ơn bạn đã thanh toán! Đơn hàng đang được xử lý.');
                        navigate('/profile');
                    }}
                />
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1 className="checkout-title">Checkout</h1>
                
                <div className="checkout-content">
                    {/* Left side - Shipping & Payment */}
                    <div className="checkout-forms">
                        <form onSubmit={handleSubmitOrder}>
                            {/* Shipping Information */}
                            <div className="form-section">
                                <h2 className="section-title">Shipping Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name *</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={shippingInfo.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={shippingInfo.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address">Address *</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        placeholder="Street address, building, apartment"
                                        required
                                    />
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="ward">Ward</label>
                                        <input
                                            type="text"
                                            id="ward"
                                            name="ward"
                                            value={shippingInfo.ward}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="district">District *</label>
                                        <input
                                            type="text"
                                            id="district"
                                            name="district"
                                            value={shippingInfo.district}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="province">Province/City *</label>
                                    <input
                                        type="text"
                                        id="province"
                                        name="province"
                                        value={shippingInfo.province}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="form-section">
                                <h2 className="section-title">Payment Method</h2>
                                <div className="payment-methods">
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="payment-label">
                                            <span className="payment-name">Cash on Delivery (COD)</span>
                                            <span className="payment-desc">Pay when you receive the order</span>
                                        </span>
                                    </label>

                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="VNPay"
                                            checked={paymentMethod === 'VNPay'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="payment-label">
                                            <span className="payment-name">VNPay</span>
                                            <span className="payment-desc">Pay via VNPay e-wallet</span>
                                        </span>
                                    </label>

                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Momo"
                                            checked={paymentMethod === 'Momo'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="payment-label">
                                            <span className="payment-name">Momo</span>
                                            <span className="payment-desc">Pay via Momo e-wallet</span>
                                        </span>
                                    </label>

                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="VietQR"
                                            checked={paymentMethod === 'VietQR'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="payment-label">
                                            <span className="payment-name">💳 VietQR</span>
                                            <span className="payment-desc">Quét mã QR chuyển khoản ngân hàng</span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="place-order-btn"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </form>
                    </div>

                    {/* Right side - Order Summary */}
                    <div className="checkout-summary">
                        <h2 className="summary-title">Order Summary</h2>
                        
                        <div className="summary-items">
                            {cart.items.filter(item => item && item.product && item.product._id).map(item => (
                                <div key={item.product._id} className="summary-item">
                                    <img 
                                        src={item.product.images?.[0] || 'https://via.placeholder.com/60/e8dfd5/5d4e37?text=Product'} 
                                        alt={item.product.name}
                                        className="summary-item-image"
                                    />
                                    <div className="summary-item-info">
                                        <p className="summary-item-name">{item.product.name}</p>
                                        <p className="summary-item-qty">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="summary-item-price">{new Intl.NumberFormat('vi-VN').format(item.total)}₫</p>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">{new Intl.NumberFormat('vi-VN').format(cart.totalPrice)}₫</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Shipping</span>
                            <span className="summary-value summary-free">Free</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row summary-total">
                            <span className="summary-label">Total</span>
                            <span className="summary-value">{new Intl.NumberFormat('vi-VN').format(cart.totalPrice)}₫</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
