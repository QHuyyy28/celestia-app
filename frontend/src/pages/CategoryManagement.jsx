import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import api from '../services/api';
import './CategoryManagement.css';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await api.get('/categories');
                let data = response.data.data || response.data;
                
                if (search) {
                    data = data.filter(cat =>
                        cat.name.toLowerCase().includes(search.toLowerCase())
                    );
                }
                
                setCategories(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Lỗi tải danh mục');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [search]);

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
            if (editingCategory) {
                await api.put(`/categories/${editingCategory._id}`, formData);
                alert('Cập nhật danh mục thành công');
            } else {
                await api.post('/categories', formData);
                alert('Tạo danh mục thành công');
            }

            setFormData({
                name: '',
                description: '',
                image: ''
            });
            setEditingCategory(null);
            setShowForm(false);
            // Refetch categories after successful operation
            const response = await api.get('/categories');
            const data = response.data.data || response.data;
            setCategories(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi lưu danh mục');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            image: category.image
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn chắc chắn muốn xóa danh mục này?')) {
            try {
                await api.delete(`/categories/${id}`);
                alert('Xóa danh mục thành công');
                // Refetch categories after successful deletion
                const response = await api.get('/categories');
                const data = response.data.data || response.data;
                setCategories(data);
            } catch (err) {
                alert(err.response?.data?.message || 'Lỗi khi xóa danh mục');
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            image: ''
        });
    };

    return (
        <AdminLayout>
            <div className="category-management">
                <h1 className="page-title">📂 Quản lý danh mục</h1>

                {/* Search & Add Button */}
                <div className="management-toolbar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className="btn btn-success"
                        onClick={() => setShowForm(true)}
                        disabled={showForm}
                    >
                        + Thêm danh mục mới
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="form-container">
                        <h2>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên danh mục *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Link ảnh</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'Cập nhật' : 'Tạo mới'}
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

                {/* Categories Table */}
                <div className="categories-table-container">
                    {loading ? (
                        <p className="loading">Đang tải...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : categories.length === 0 ? (
                        <p className="no-data">Không có danh mục</p>
                    ) : (
                        <table className="categories-table">
                            <thead>
                                <tr>
                                    <th>Tên danh mục</th>
                                    <th>Mô tả</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category._id}>
                                        <td>
                                            <strong>{category.name}</strong>
                                        </td>
                                        <td>{category.description || 'N/A'}</td>
                                        <td className="action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(category)}
                                                title="Sửa"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(category._id)}
                                                title="Xóa"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
