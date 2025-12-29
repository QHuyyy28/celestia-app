import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AdminLayout.css';

export const AdminLayout = ({ children }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect nếu không phải admin
    if (!isAuthenticated || user?.role !== 'admin') {
        navigate('/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3 className="sidebar-logo">⚙️ Admin Panel</h3>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin/dashboard" className="nav-link">
                        📊 Dashboard
                    </Link>
                    <Link to="/admin/products" className="nav-link">
                        📦 Quản lý sản phẩm
                    </Link>
                    <Link to="/admin/categories" className="nav-link">
                        📂 Quản lý danh mục
                    </Link>
                    <Link to="/admin/orders" className="nav-link">
                        📋 Quản lý đơn hàng
                    </Link>
                    <Link to="/admin/users" className="nav-link">
                        👥 Quản lý người dùng
                    </Link>
                    <Link to="/admin/blogs" className="nav-link">
                        📝 Quản lý bài viết
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <h2 className="topbar-title">Celestia Admin</h2>
                    </div>
                    <div className="topbar-right">
                        <div className="admin-user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">Admin</span>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
};
