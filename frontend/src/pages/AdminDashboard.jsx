import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { productService } from '../services/productService';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0
    });
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Lấy sản phẩm để đếm
            const productsRes = await productService.getAll(1, 1000);
            const totalProducts = productsRes.data.total;

            // Lấy 5 sản phẩm gần nhất
            const recentRes = await productService.getAll(1, 5);

            setStats({
                totalProducts: totalProducts,
                totalOrders: 0, // TODO: Từ API order
                totalUsers: 0, // TODO: Từ API user
                totalRevenue: 0 // TODO: Từ API order
            });

            setRecentProducts(recentRes.data.data);
        } catch (error) {
            console.error('Lỗi tải dashboard:', error);
        } finally {
            setLoading(false);
        }
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
