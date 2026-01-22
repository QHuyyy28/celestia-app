import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { productService } from '../services/productService';
import api from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0
    });
    const [recentProducts, setRecentProducts] = useState([]);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [emailTemplate, setEmailTemplate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch tất cả stats song song
            const [productsRes, recentRes, orderStatsRes, userStatsRes, birthdaysRes] = await Promise.all([
                productService.getAll(1, 100),
                productService.getAll(1, 5),
                api.get('/orders/stats/overview'),
                api.get('/users/stats/count'),
                api.get('/admin/upcoming-birthdays?days=5')
            ]);

            const totalProducts = productsRes.data.total;
            const orderStats = orderStatsRes.data.data;
            const userStats = userStatsRes.data.data;

            setStats({
                totalProducts: totalProducts,
                totalOrders: orderStats.totalOrders,
                totalUsers: userStats.totalUsers,
                totalRevenue: orderStats.totalRevenue
            });

            setRecentProducts(recentRes.data.data);
            setUpcomingBirthdays(birthdaysRes.data.data);
        } catch (error) {
            console.error('Lỗi tải dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetEmailTemplate = async (user) => {
        try {
            const response = await api.get(`/admin/birthday-template/${user.name}`);
            setSelectedUser(user);
            setEmailTemplate(response.data.data);
        } catch (error) {
            console.error('Error getting email template:', error);
            alert('Lỗi khi lấy template email');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Đã copy vào clipboard!');
    };

    return (
        <AdminLayout>
            <div className="dashboard">
                <h1 className="dashboard-title">📊 Dashboard</h1>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Tổng sản phẩm</h3>
                            <p className="stat-value">{stats.totalProducts}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-content">
                            <h3>Tổng đơn hàng</h3>
                            <p className="stat-value">{stats.totalOrders}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Tổng người dùng</h3>
                            <p className="stat-value">{stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>Tổng doanh thu</h3>
                            <p className="stat-value">{stats.totalRevenue.toLocaleString()} đ</p>
                        </div>
                    </div>
                </div>

                {/* Upcoming Birthdays Section */}
                {upcomingBirthdays.length > 0 && (
                    <div className="dashboard-section birthday-section">
                        <h2>🎂 Sinh nhật sắp tới (5 ngày)</h2>
                        <div className="birthday-grid">
                            {upcomingBirthdays.map((user) => (
                                <div key={user._id} className="birthday-card">
                                    <div className="birthday-header">
                                        <img 
                                            src={user.avatar || 'https://via.placeholder.com/50'} 
                                            alt={user.name}
                                            className="birthday-avatar"
                                        />
                                        <div className="birthday-info">
                                            <h3>{user.name}</h3>
                                            <p className="birthday-email">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="birthday-details">
                                        <div className="birthday-date">
                                            🎂 {new Date(user.birthdayDate).toLocaleDateString('vi-VN', {
                                                day: 'numeric',
                                                month: 'long'
                                            })}
                                        </div>
                                        <div className="birthday-countdown">
                                            {user.daysUntilBirthday === 0 
                                                ? '🎉 Hôm nay!' 
                                                : `⏰ Còn ${user.daysUntilBirthday} ngày`
                                            }
                                        </div>
                                        <div className="birthday-age">
                                            Tuổi: {user.age}
                                        </div>
                                    </div>
                                    <div className="birthday-actions">
                                        <button 
                                            className="btn-copy-email"
                                            onClick={() => copyToClipboard(user.email)}
                                        >
                                            📋 Copy Email
                                        </button>
                                        <button 
                                            className="btn-get-template"
                                            onClick={() => handleGetEmailTemplate(user)}
                                        >
                                            📧 Lấy Template Email
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Email Template Modal */}
                {emailTemplate && (
                    <div className="modal-overlay" onClick={() => setEmailTemplate(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>📧 Email Template cho {selectedUser?.name}</h2>
                                <button className="modal-close" onClick={() => setEmailTemplate(null)}>✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="template-section">
                                    <div className="template-label">
                                        <strong>Subject:</strong>
                                        <button 
                                            className="btn-copy-small"
                                            onClick={() => copyToClipboard(emailTemplate.subject)}
                                        >
                                            📋 Copy
                                        </button>
                                    </div>
                                    <div className="template-text">{emailTemplate.subject}</div>
                                </div>
                                
                                <div className="template-section">
                                    <div className="template-label">
                                        <strong>HTML Body:</strong>
                                        <button 
                                            className="btn-copy-small"
                                            onClick={() => copyToClipboard(emailTemplate.html)}
                                        >
                                            📋 Copy HTML
                                        </button>
                                    </div>
                                    <textarea 
                                        className="template-html" 
                                        value={emailTemplate.html}
                                        readOnly
                                        rows="10"
                                    />
                                </div>

                                <div className="template-preview">
                                    <strong>Preview:</strong>
                                    <div 
                                        className="preview-iframe-container"
                                        dangerouslySetInnerHTML={{ __html: emailTemplate.html }}
                                    />
                                </div>

                                <div className="template-instructions">
                                    <h3>📝 Hướng dẫn gửi email:</h3>
                                    <ol>
                                        <li>Copy <strong>Subject</strong> ở trên</li>
                                        <li>Copy <strong>HTML Body</strong> ở trên</li>
                                        <li>Mở Gmail và soạn email mới</li>
                                        <li>Điền email người nhận: <code>{selectedUser?.email}</code></li>
                                        <li>Dán Subject vào tiêu đề</li>
                                        <li>Chuyển sang chế độ HTML (Ctrl+Shift+Alt+H)</li>
                                        <li>Dán HTML Body vào nội dung email</li>
                                        <li>Gửi email 🎉</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Products */}
                <div className="dashboard-section">
                    <h2>Sản phẩm gần đây</h2>
                    {loading ? (
                        <p>Đang tải...</p>
                    ) : (
                        <div className="recent-products">
                            {recentProducts.length === 0 ? (
                                <p>Chưa có sản phẩm</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Tên sản phẩm</th>
                                            <th>Giá</th>
                                            <th>Danh mục</th>
                                            <th>Kho</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentProducts.map((product) => (
                                            <tr key={product._id}>
                                                <td>
                                                    <strong>{product.name}</strong>
                                                </td>
                                                <td>{product.price.toLocaleString()} đ</td>
                                                <td>{product.category?.name || 'N/A'}</td>
                                                <td>{product.stock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
