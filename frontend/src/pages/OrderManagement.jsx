import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import api from '../services/api';
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
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
            alert('Cập nhật trạng thái đơn hàng thành công');
            setPage(1);
            setSelectedOrder(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi cập nhật');
        }
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
                                <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
                                <p><strong>Tổng tiền:</strong> {selectedOrder.totalPrice?.toLocaleString()} đ</p>
                                <p><strong>Trạng thái hiện tại:</strong> {selectedOrder.status}</p>

                                <div className="status-change">
                                    <label>Thay đổi trạng thái:</label>
                                    <div className="status-buttons">
                                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                            <button
                                                key={s}
                                                className={`status-btn ${selectedOrder.status === s ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(selectedOrder._id, s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
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
                                        {selectedOrder.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.productId?.name || 'N/A'}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.price?.toLocaleString()} đ</td>
                                                <td>{(item.quantity * item.price)?.toLocaleString()} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedOrder(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
