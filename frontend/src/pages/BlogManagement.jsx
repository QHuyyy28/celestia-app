import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import api from '../services/api';
import './BlogManagement.css';

export default function BlogManagement() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        category: ''
    });

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const filters = {};
                if (search) filters.search = search;

                const response = await api.get('/blogs', {
                    params: {
                        page,
                        limit,
                        ...filters
                    }
                });

                setBlogs(response.data.data || []);
                setTotal(response.data.total || 0);
            } catch (err) {
                setError(err.response?.data?.message || 'Lỗi tải bài viết');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [page, search]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingBlog) {
                await api.put(`/blogs/${editingBlog._id}`, formData);
                alert('Cập nhật bài viết thành công');
            } else {
                await api.post('/blogs', formData);
                alert('Tạo bài viết thành công');
            }

            setFormData({
                title: '',
                content: '',
                image: '',
                category: ''
            });
            setEditingBlog(null);
            setShowForm(false);
            setPage(1);
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi lưu bài viết');
        }
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content,
            image: blog.image,
            category: blog.category || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn chắc chắn muốn xóa bài viết này?')) {
            try {
                await api.delete(`/blogs/${id}`);
                alert('Xóa bài viết thành công');
                setPage(1);
            } catch (err) {
                alert(err.response?.data?.message || 'Lỗi khi xóa bài viết');
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingBlog(null);
        setFormData({
            title: '',
            content: '',
            image: '',
            category: ''
        });
    };

    const pages = Math.ceil(total / limit);

    return (
        <AdminLayout>
            <div className="blog-management">
                <h1 className="page-title">📝 Quản lý bài viết</h1>

                {/* Search & Add Button */}
                <div className="management-toolbar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        className="search-input"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    <button
                        className="btn btn-success"
                        onClick={() => setShowForm(true)}
                        disabled={showForm}
                    >
                        + Viết bài mới
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="form-container">
                        <h2>{editingBlog ? 'Sửa bài viết' : 'Viết bài mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tiêu đề bài viết *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Nội dung *</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    rows="8"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Link ảnh bìa</label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Danh mục</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: Công nghệ"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingBlog ? 'Cập nhật' : 'Đăng bài'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Blogs Table */}
                <div className="blogs-table-container">
                    {loading ? (
                        <p className="loading">Đang tải...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : blogs.length === 0 ? (
                        <p className="no-data">Chưa có bài viết nào</p>
                    ) : (
                        <>
                            <table className="blogs-table">
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Tác giả</th>
                                        <th>Danh mục</th>
                                        <th>Ngày đăng</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blogs.map((blog) => (
                                        <tr key={blog._id}>
                                            <td>
                                                <strong>{blog.title}</strong>
                                            </td>
                                            <td>{blog.author?.name || 'N/A'}</td>
                                            <td>{blog.category || 'N/A'}</td>
                                            <td>
                                                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(blog)}
                                                    title="Sửa"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(blog._id)}
                                                    title="Xóa"
                                                >
                                                    🗑️
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
            </div>
        </AdminLayout>
    );
}
