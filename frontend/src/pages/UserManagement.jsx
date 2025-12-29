import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import api from '../services/api';
import './UserManagement.css';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await api.get('/auth/users', {
                    params: {
                        page,
                        limit,
                        search,
                        role
                    }
                });

                setUsers(response.data.data || []);
                setTotal(response.data.total || 0);
            } catch {
                // If auth endpoint doesn't exist, fetch from users endpoint
                try {
                    const res = await api.get('/users', {
                        params: { page, limit, search, role }
                    });
                    setUsers(res.data.data || []);
                    setTotal(res.data.total || 0);
                } catch (error) {
                    setError(error.response?.data?.message || 'Lỗi tải người dùng');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [page, search, role]);

    const handleChangeRole = async (userId, newRole) => {
        try {
            await api.put(`/auth/assign-admin/${userId}`, { role: newRole });
            alert(`Thay đổi vai trò thành công: ${newRole}`);
            setPage(1);
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi thay đổi vai trò');
        }
    };

    const pages = Math.ceil(total / limit);

    return (
        <AdminLayout>
            <div className="user-management">
                <h1 className="page-title">👥 Quản lý người dùng</h1>

                {/* Search & Filter */}
                <div className="management-toolbar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        className="search-input"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    <select
                        className="role-filter"
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="users-table-container">
                    {loading ? (
                        <p className="loading">Đang tải...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : users.length === 0 ? (
                        <p className="no-data">Không có người dùng</p>
                    ) : (
                        <>
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Tên</th>
                                        <th>Email</th>
                                        <th>Điện thoại</th>
                                        <th>Vai trò</th>
                                        <th>Ngày tạo</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="user-info">
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="user-avatar"
                                                    />
                                                    <strong>{user.name}</strong>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>{user.phone || 'N/A'}</td>
                                            <td>
                                                <span
                                                    className={`role-badge role-${user.role}`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="action-buttons">
                                                {user.role === 'user' ? (
                                                    <button
                                                        className="btn-make-admin"
                                                        onClick={() => handleChangeRole(user._id, 'admin')}
                                                        title="Nâng lên Admin"
                                                    >
                                                        ⭐
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-make-user"
                                                        onClick={() => handleChangeRole(user._id, 'user')}
                                                        title="Hạ xuống User"
                                                    >
                                                        👤
                                                    </button>
                                                )}
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
            </div>
        </AdminLayout>
    );
}
