import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import api, { getBackendUrl } from '../services/api';
import QRCode from 'qrcode';
import './OrderManagement.css';

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [generatingQR, setGeneratingQR] = useState(false);
    const limit = 10;

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const filters = {};
            if (search) filters.search = search;
            if (status) filters.status = status;

            const response = await api.get('/orders', {
                params: {
                    page,
                    limit,
                    ...filters
                }
            });

            setOrders(response.data.data || []);
            setTotal(response.data.total || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        if (newStatus === selectedOrder.status) return; // Không thay đổi
        
        setStatusUpdating(true);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            // Cập nhật order được chọn để hiển thị trạng thái mới ngay
            const updatedOrders = orders.map(order => 
                order._id === orderId ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi cập nhật');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleVerifyPayment = async (orderId) => {
        try {
            // Verify endpoint: PUT /orders/:id/verify-payment (admin required)
            const response = await api.put(`/orders/${orderId}/verify-payment`);
            if (response.data.success) {
                alert('✓ Đã xác nhận thanh toán VietQR!');
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (err) {
            console.error('Verify payment error:', err);
            alert(err.response?.data?.message || 'Lỗi khi xác nhận thanh toán');
        }
    };

    const handleGenerateQR = async () => {
        if (!selectedOrder?.qrContent?.content) {
            alert('Không có nội dung QR để tạo!');
            return;
        }

        setGeneratingQR(true);
        try {
            let qrContent = selectedOrder.qrContent.content;
            
            // Nếu là file upload, tạo QR từ URL file hoặc tên file
            if (selectedOrder.qrContent.type === 'video' || selectedOrder.qrContent.type === 'image' || selectedOrder.qrContent.type === 'audio' || selectedOrder.qrContent.type === 'file-image' || selectedOrder.qrContent.type === 'file-video' || selectedOrder.qrContent.type === 'file-audio') {
                // QR sẽ chứa URL của file (không phải content của file)
                if (qrContent.startsWith('/uploads/')) {
                    // Dùng hostname thực (không localhost) để điện thoại có thể truy cập
                    const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
                    const backendUrl = `http://${hostname}:5000`;
                    qrContent = `${backendUrl}${qrContent}`;
                }
            }
            
            // Generate QR code with error handling
            let qrDataUrl;
            try {
                qrDataUrl = await QRCode.toDataURL(qrContent, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
            } catch (qrError) {
                console.warn('QR generation error:', qrError);
                // Fallback: tạo QR từ text thay vì URL
                qrDataUrl = await QRCode.toDataURL(`QR Content: ${selectedOrder.qrContent.content}`, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                alert('⚠️ Tạo QR thành công (từ text thay vì file)');
            }
            
            setQrCodeUrl(qrDataUrl);
            
            // QR code created successfully - no need to update database
            // (QR code is generated on-the-fly, not stored in DB)
            
            alert('✓ QR Code đã được tạo thành công!');
        } catch (err) {
            console.error('Error generating QR:', err);
            alert('Lỗi khi tạo QR code: ' + err.message);
        } finally {
            setGeneratingQR(false);
        }
    };

    const handleDownloadQR = () => {
        if (!qrCodeUrl) return;
        
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `QR_Order_${selectedOrder._id}.png`;
        link.click();
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setQrCodeUrl(null);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f39c12',
            confirmed: '#3498db',
            shipped: '#9b59b6',
            delivered: '#27ae60',
            cancelled: '#e74c3c'
        };
        return colors[status] || '#95a5a6';
    };

    const getPaymentStatusColor = (paymentStatus) => {
        const colors = {
            pending: '#95a5a6',
            customer_transferred: '#f39c12',
            admin_confirmed: '#27ae60',
            failed: '#e74c3c'
        };
        return colors[paymentStatus] || '#95a5a6';
    };

    const getPaymentStatusLabel = (paymentStatus) => {
        const labels = {
            pending: '⏳ Chưa thanh toán',
            customer_transferred: '🔄 Khách đã chuyển (chờ xác nhận)',
            admin_confirmed: '✓ Đã xác nhận',
            failed: '❌ Thất bại'
        };
        return labels[paymentStatus] || 'Không xác định';
    };

    const pages = Math.ceil(total / limit);

    return (
        <AdminLayout>
            <div className="order-management">
                <h1 className="page-title">📋 Quản lý đơn hàng</h1>

                {/* Search & Filter */}
                <div className="management-toolbar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        className="search-input"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    <select
                        className="status-filter"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipped">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>

                {/* Orders Table */}
                <div className="orders-table-container">
                    {loading ? (
                        <p className="loading">Đang tải...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : orders.length === 0 ? (
                        <p className="no-data">Không có đơn hàng</p>
                    ) : (
                        <>
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <strong>{order._id?.slice(-8).toUpperCase()}</strong>
                                            </td>
                                            <td>{order.user?.name || 'N/A'}</td>
                                            <td>
                                                <strong>{order.totalPrice?.toLocaleString()} đ</strong>
                                            </td>
                                            <td>
                                                <span
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="action-buttons">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => setSelectedOrder(order)}
                                                    title="Chi tiết"
                                                >
                                                    👁️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {pages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="pagination-btn"
                                    >
                                        ← Trước
                                    </button>
                                    <span className="pagination-info">
                                        Trang {page} / {pages}
                                    </span>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === pages}
                                        className="pagination-btn"
                                    >
                                        Sau →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Chi tiết đơn hàng</h2>
                            <div className="order-details">
                                <p><strong>Mã đơn:</strong> {selectedOrder._id}</p>
                                <p><strong>Khách hàng:</strong> {selectedOrder.user?.name}</p>
                                <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                                <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}</p>
                                <p><strong>SĐT:</strong> {selectedOrder.shippingAddress?.phone}</p>
                                <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}</p>
                                
                                {/* Payment Status Section */}
                                <div className="payment-status-section" style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginTop: '15px', marginBottom: '15px' }}>
                                    <p><strong>Trạng thái thanh toán:</strong> 
                                        <span style={{ color: getPaymentStatusColor(selectedOrder.paymentStatus), fontWeight: 'bold', marginLeft: '10px' }}>
                                            {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                                        </span>
                                    </p>
                                    
                                    {selectedOrder.paymentMethod === 'VietQR' && selectedOrder.paymentStatus === 'customer_transferred' && (
                                        <button
                                            className="btn-verify-payment"
                                            onClick={() => handleVerifyPayment(selectedOrder._id)}
                                            style={{ 
                                                backgroundColor: '#27ae60', 
                                                color: 'white', 
                                                padding: '10px 20px', 
                                                border: 'none', 
                                                borderRadius: '5px', 
                                                cursor: 'pointer',
                                                marginTop: '10px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ✓ Xác nhận thanh toán VietQR
                                        </button>
                                    )}
                                </div>

                                <p><strong>Tổng tiền:</strong> {selectedOrder.totalPrice?.toLocaleString()} đ</p>
                                <p><strong>Trạng thái đơn hàng:</strong> <span style={{color: getStatusColor(selectedOrder.status), fontWeight: 'bold', fontSize: '16px'}}>{selectedOrder.status.toUpperCase()}</span></p>

                                <div className="status-change">
                                    <label>Thay đổi trạng thái:</label>
                                    <select 
                                        className="status-select"
                                        value={selectedOrder.status}
                                        onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                                        disabled={statusUpdating}
                                        style={{
                                            padding: '10px 15px',
                                            borderRadius: '5px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            cursor: statusUpdating ? 'not-allowed' : 'pointer',
                                            width: '100%',
                                            marginTop: '10px',
                                            opacity: statusUpdating ? 0.6 : 1,
                                            backgroundColor: '#f9f9f9'
                                        }}
                                    >
                                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                            <option key={s} value={s}>
                                                {s.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <h3>Sản phẩm:</h3>
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                            <th>Tổng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.orderItems?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name || 'N/A'}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.price?.toLocaleString()} đ</td>
                                                <td>{(item.quantity * item.price)?.toLocaleString()} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* QR Content Section */}
                                {selectedOrder.qrContent && selectedOrder.qrContent.content && (
                                    <div className="qr-content-section" style={{ 
                                        backgroundColor: '#f0f8ff', 
                                        padding: '20px', 
                                        borderRadius: '10px', 
                                        marginTop: '20px',
                                        border: '2px solid #3498db'
                                    }}>
                                        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                                            📱 Nội dung QR từ khách hàng
                                        </h3>
                                        
                                        <div style={{ marginBottom: '15px' }}>
                                            <p><strong>Loại:</strong> {
                                                selectedOrder.qrContent.type === 'text' ? '📝 Văn bản' :
                                                selectedOrder.qrContent.type === 'url' ? '🔗 Link' :
                                                selectedOrder.qrContent.type === 'video' ? '🎬 Video' :
                                                '🖼️ Hình ảnh'
                                            }</p>
                                            
                                            {/* Hiển thị preview nếu là file */}
                                            {(selectedOrder.qrContent.type === 'video' || selectedOrder.qrContent.type === 'image') && (
                                                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                                                    <strong>Preview:</strong><br/>
                                                    {selectedOrder.qrContent.type === 'video' ? (
                                                        <video 
                                                            controls 
                                                            style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px', borderRadius: '5px' }}
                                                            src={`${getBackendUrl()}${selectedOrder.qrContent.content}`}
                                                            onError={(e) => console.error('Video load error:', e)}
                                                        />
                                                    ) : (
                                                        <img 
                                                            src={`${getBackendUrl()}${selectedOrder.qrContent.content}`}
                                                            onError={(e) => console.error('Image load error:', e)}
                                                            alt="Uploaded content"
                                                            style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px', borderRadius: '5px' }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            
                                            <p style={{ marginTop: '10px' }}>
                                                <strong>Nội dung QR sẽ chứa:</strong><br/>
                                                <textarea 
                                                    readOnly 
                                                    value={
                                                        selectedOrder.qrContent.content.startsWith('/uploads/') 
                                                            ? `${getBackendUrl()}${selectedOrder.qrContent.content}`
                                                            : selectedOrder.qrContent.content
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '80px',
                                                        padding: '10px',
                                                        borderRadius: '5px',
                                                        border: '1px solid #ccc',
                                                        fontSize: '14px',
                                                        marginTop: '5px',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                            </p>
                                            {selectedOrder.qrContent.description && (
                                                <p style={{ marginTop: '10px' }}>
                                                    <strong>Mô tả:</strong> {selectedOrder.qrContent.description}
                                                </p>
                                            )}
                                            
                                            <p style={{ 
                                                marginTop: '10px', 
                                                padding: '10px', 
                                                backgroundColor: '#fff3cd', 
                                                borderRadius: '5px',
                                                fontSize: '13px',
                                                color: '#856404'
                                            }}>
                                                ℹ️ <strong>Lưu ý:</strong> QR Code sẽ chứa <strong>link đến file</strong> đã upload, không phải file gốc.
                                            </p>
                                        </div>

                                        {!qrCodeUrl ? (
                                            <button
                                                onClick={handleGenerateQR}
                                                disabled={generatingQR}
                                                style={{
                                                    backgroundColor: generatingQR ? '#95a5a6' : '#3498db',
                                                    color: 'white',
                                                    padding: '12px 24px',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: generatingQR ? 'not-allowed' : 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                    width: '100%'
                                                }}
                                            >
                                                {generatingQR ? '⏳ Đang tạo QR...' : '🎨 Tạo QR Code'}
                                            </button>
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ 
                                                    backgroundColor: 'white', 
                                                    padding: '20px', 
                                                    borderRadius: '10px',
                                                    display: 'inline-block',
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                }}>
                                                    <img 
                                                        src={qrCodeUrl} 
                                                        alt="Generated QR Code" 
                                                        style={{ 
                                                            maxWidth: '300px',
                                                            display: 'block'
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={handleDownloadQR}
                                                        style={{
                                                            backgroundColor: '#27ae60',
                                                            color: 'white',
                                                            padding: '10px 20px',
                                                            border: 'none',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        💾 Tải xuống QR
                                                    </button>
                                                    <button
                                                        onClick={() => setQrCodeUrl(null)}
                                                        style={{
                                                            backgroundColor: '#e74c3c',
                                                            color: 'white',
                                                            padding: '10px 20px',
                                                            border: 'none',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        🔄 Tạo lại
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button
                                    className="btn btn-close"
                                    onClick={closeModal}
                                    style={{
                                        backgroundColor: '#27ae60',
                                        color: 'white',
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '14px'
                                    }}
                                >
                                    ✓ Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
