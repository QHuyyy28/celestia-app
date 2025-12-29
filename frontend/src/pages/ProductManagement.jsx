import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { productService } from '../services/productService';
import './ProductManagement.css';

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: ''
    });

    useEffect(() => {
        fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search]);

    async function fetchProducts() {
        try {
            setLoading(true);
            const filters = {};
            if (search) filters.search = search;

            const response = await productService.getAll(page, limit, filters);
            setProducts(response.data.data);
            setTotal(response.data.total);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải sản phẩm');
        } finally {
            setLoading(false);
        }
    }

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
            if (editingProduct) {
                // Update
                await productService.update(editingProduct._id, formData);
                alert('Cập nhật sản phẩm thành công');
            } else {
                // Create
                await productService.create(formData);
                alert('Tạo sản phẩm thành công');
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                image: ''
            });
            setEditingProduct(null);
            setShowForm(false);

            // Reload products
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category?._id || '',
            image: product.image
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await productService.delete(id);
                alert('Xóa sản phẩm thành công');
                fetchProducts();
            } catch (err) {
                alert(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            image: ''
        });
    };

    const pages = Math.ceil(total / limit);

    return (
        <AdminLayout>
            <div className="product-management">
                <h1 className="page-title">📦 Quản lý sản phẩm</h1>

                {/* Search & Add Button */}
                <div className="management-toolbar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
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
                        + Thêm sản phẩm mới
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="form-container">
                        <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên sản phẩm *</label>
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

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá (đ) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Số lượng tồn kho *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Danh mục</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="ID danh mục (nếu cần)"
                                    />
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
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Cập nhật' : 'Tạo mới'}
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

                {/* Products Table */}
                <div className="products-table-container">
                    {loading ? (
                        <p className="loading">Đang tải...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : products.length === 0 ? (
                        <p className="no-data">Không có sản phẩm</p>
                    ) : (
                        <>
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Tên sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Kho</th>
                                        <th>Danh mục</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id}>
                                            <td>
                                                <strong>{product.name}</strong>
                                            </td>
                                            <td>{product.price.toLocaleString()} đ</td>
                                            <td>
                                                <span
                                                    className={
                                                        product.stock > 0 ? 'stock-good' : 'stock-low'
                                                    }
                                                >
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td>{product.category?.name || 'N/A'}</td>
                                            <td className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(product)}
                                                    title="Sửa"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(product._id)}
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
