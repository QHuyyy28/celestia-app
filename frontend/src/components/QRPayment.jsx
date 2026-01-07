import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './QRPayment.css';

const QRPayment = ({ paymentInfo, orderId, onPaymentComplete }) => {
    const [countdown, setCountdown] = useState(600); // 10 phút
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    };

    const handleConfirmTransfer = async () => {
        setChecking(true);
        try {
            const response = await api.put(`/orders/${orderId}/confirm-transfer`);
            const data = response.data;

            if (data.success) {
                alert('✓ Đã ghi nhận bạn chuyển khoản! Admin sẽ kiểm tra và xác nhận trong 1-2 phút.');
                onPaymentComplete?.();
            } else {
                alert('❌ Lỗi: ' + (data.message || 'Không thể ghi nhận chuyển khoản'));
            }
        } catch (error) {
            console.error('Error confirming transfer:', error);
            alert('❌ Lỗi kết nối: ' + error.message);
        } finally {
            setChecking(false);
        }
    };

    if (!paymentInfo) {
        return <div>Đang tải thông tin thanh toán...</div>;
    }

    return (
        <div className="qr-payment-container">
            <div className="qr-payment-header">
                <h2>💳 Thanh toán bằng QR Code</h2>
                <p className="order-id">Mã đơn hàng: <strong>{orderId}</strong></p>
            </div>

            <div className="qr-payment-content">
                <div className="qr-section">
                    <div className="qr-code-wrapper">
                        <img 
                            src={paymentInfo.qrCodeUrl} 
                            alt="QR Code thanh toán" 
                            className="qr-code-image"
                        />
                    </div>
                    <div className="qr-instructions">
                        <h3>📱 Cách thanh toán:</h3>
                        <ol>
                            <li>Mở app ngân hàng của bạn</li>
                            <li>Chọn <strong>Quét mã QR</strong></li>
                            <li>Quét mã QR bên trên</li>
                            <li>Kiểm tra thông tin và xác nhận chuyển khoản</li>
                        </ol>
                    </div>
                </div>

                <div className="payment-info">
                    <div className="info-card">
                        <h3>📋 Thông tin chuyển khoản</h3>
                        <div className="info-row">
                            <span className="label">Ngân hàng:</span>
                            <span className="value">{paymentInfo.bankInfo.bankName}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Số tài khoản:</span>
                            <span className="value">{paymentInfo.bankInfo.accountNo}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Chủ tài khoản:</span>
                            <span className="value">{paymentInfo.bankInfo.accountName}</span>
                        </div>
                        <div className="info-row highlight">
                            <span className="label">Số tiền gốc:</span>
                            <span className="value amount">{formatCurrency(paymentInfo.amount)}</span>
                        </div>
                        <div className="info-row test-amount">
                            <span className="label">⚡ Số tiền test:</span>
                            <span className="value test">{formatCurrency(paymentInfo.testAmount || paymentInfo.amount)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Nội dung:</span>
                            <span className="value content">{paymentInfo.content}</span>
                        </div>
                    </div>

                    <div className="timer-card">
                        <p className="timer-label">⏱️ Thời gian còn lại:</p>
                        <p className={`timer ${countdown < 60 ? 'warning' : ''}`}>
                            {formatTime(countdown)}
                        </p>
                        {countdown === 0 && (
                            <p className="expired-text">Mã QR đã hết hạn. Vui lòng tạo đơn hàng mới.</p>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button 
                            className="btn-check-payment"
                            onClick={handleConfirmTransfer}
                            disabled={checking || countdown === 0}
                        >
                            {checking ? '⏳ Đang xử lý...' : '✓ Đã chuyển khoản'}
                        </button>
                    </div>

                    <div className="payment-note">
                        <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
                        <ul>
                            <li>Đang ở chế độ TEST - Số tiền đã được giảm để test (tối đa 50,000₫)</li>
                            <li>Vui lòng chuyển khoản <strong>ĐÚNG số tiền TEST</strong> và <strong>ĐÚNG nội dung</strong></li>
                            <li>Đơn hàng sẽ tự động được xác nhận sau khi chuyển khoản thành công</li>
                            <li>Nếu có vấn đề, vui lòng liên hệ hotline: <strong>1900-xxxx</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRPayment;
