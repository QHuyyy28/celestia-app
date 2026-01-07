import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import QRPayment from '../components/QRPayment';
import api from '../services/api';
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
    const [qrContent, setQrContent] = useState({
        type: 'text',
        content: '',
        description: '',
        isFile: false
    });
    const [showQRForm, setShowQRForm] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);

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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            alert('File quá lớn! Tối đa 100MB');
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/upload/qr-content', formData);

            const data = response.data;
            
            if (data.success) {
                // Lưu đường dẫn relative, không phải full URL
                setQrContent({
                    ...qrContent,
                    content: data.data.url, // Đã là "/uploads/qr-content/xxx"
                    isFile: true
                });
                alert('✓ Upload thành công!');
            } else {
                alert(data.message || 'Lỗi khi upload file');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Không thể upload file: ' + error.message);
        } finally {
            setUploadingFile(false);
        }
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

            // Thêm qrContent nếu có
            if (qrContent.content.trim()) {
                orderData.qrContent = qrContent;
            }

            const response = await api.post('/orders', orderData);
            const data = response.data;
            console.log('Response data:', data);

            if (data.success) {
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

                            {/* QR Content Section */}
                            <div className="qr-content-section">
                                <button 
                                    type="button"
                                    className="toggle-qr-form-btn"
                                    onClick={() => setShowQRForm(!showQRForm)}
                                >
                                    {showQRForm ? '❌ Đóng' : '📝 Gửi nội dung QR cho Admin'}
                                </button>
                                
                                {showQRForm && (
                                    <div className="qr-content-form">
                                        <h3>Nội dung QR Code</h3>
                                        <p className="qr-hint">Admin sẽ tạo QR code cho bạn dựa trên nội dung này</p>
                                        
                                        <div className="form-group">
                                            <label>Loại nội dung *</label>
                                            <select
                                                value={qrContent.type}
                                                onChange={(e) => setQrContent({...qrContent, type: e.target.value, content: '', isFile: false})}
                                                className="qr-type-select"
                                            >
                                                <option value="text">📝 Văn bản</option>
                                                <option value="url">🔗 Link (Website, YouTube, Nhạc, Video)</option>
                                                <option value="image">🖼️ Link hình ảnh</option>
                                                <option value="file-video">🎬 Upload Video từ máy</option>
                                                <option value="file-audio">🎵 Upload Nhạc từ máy</option>
                                                <option value="file-image">📸 Upload Hình ảnh từ máy</option>
                                            </select>
                                        </div>
                                        
                                        {/* Hiển thị input phù hợp */}
                                        {qrContent.type.startsWith('file-') ? (
                                            <div className="form-group">
                                                <label>Chọn file *</label>
                                                <input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    accept={
                                                        qrContent.type === 'file-video' ? 'video/*' :
                                                        qrContent.type === 'file-audio' ? 'audio/*' :
                                                        'image/*'
                                                    }
                                                    disabled={uploadingFile}
                                                    className="qr-file-input"
                                                />
                                                {uploadingFile && (
                                                    <p style={{ color: '#3498db', marginTop: '10px' }}>
                                                        ⏳ Đang upload...
                                                    </p>
                                                )}
                                                {qrContent.isFile && qrContent.content && (
                                                    <p style={{ color: '#27ae60', marginTop: '10px' }}>
                                                        ✓ File đã upload thành công
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="form-group">
                                                <label>Nội dung * {qrContent.type === 'url' || qrContent.type === 'image' ? '(Link)' : ''}</label>
                                                <textarea
                                                    value={qrContent.content}
                                                    onChange={(e) => setQrContent({...qrContent, content: e.target.value})}
                                                    placeholder={
                                                        qrContent.type === 'text' ? 'Nhập văn bản...' :
                                                        qrContent.type === 'url' ? 'https://example.com hoặc link YouTube, Spotify...' :
                                                        'https://example.com/image.jpg'
                                                    }
                                                    rows="4"
                                                    className="qr-content-input"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="form-group">
                                            <label>Mô tả (tùy chọn)</label>
                                            <input
                                                type="text"
                                                value={qrContent.description}
                                                onChange={(e) => setQrContent({...qrContent, description: e.target.value})}
                                                placeholder="Mô tả về nội dung QR..."
                                                className="qr-description-input"
                                            />
                                        </div>
                                        
                                        <div className="qr-form-note">
                                            ℹ️ Nội dung QR sẽ được gửi cùng đơn hàng. Admin sẽ tạo QR code và gửi lại cho bạn.
                                        </div>
                                    </div>
                                )}
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
