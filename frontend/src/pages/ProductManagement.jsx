import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { productService } from '../services/productService';
import api from '../services/api';
import './ProductManagement.css';

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
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
        images: []
    });

    useEffect(() => {
        fetchCategories();
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

    async function fetchCategories() {
        try {
            const response = await api.get('/categories');
            const data = response.data;
            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (err) {
            console.error('Lỗi tải danh mục:', err);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'images') {
            const imageArray = value.split(',').map(img => img.trim()).filter(img => img);
            setFormData({ ...formData, images: imageArray });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError(null);
            
            // Validate required fields
            if (!formData.name.trim()) {
                setError('❌ Tên sản phẩm không được để trống');
                return;
            }
            if (!formData.description.trim()) {
                setError('❌ Mô tả không được để trống (tối thiểu 10 ký tự)');
                return;
            }
            if (!formData.price || formData.price <= 0) {
                setError('❌ Giá phải lớn hơn 0');
                return;
            }
            if (!formData.stock || formData.stock < 0) {
                setError('❌ Số lượng không được để trống');
                return;
            }
            if (!formData.images || formData.images.length === 0) {
                setError('❌ Phải có ít nhất 1 ảnh');
                return;
            }
            
            // Prepare data - convert string numbers to actual numbers
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10)
            };
            
            if (editingProduct) {
                await productService.update(editingProduct._id, submitData);
                alert('✅ Cập nhật sản phẩm thành công');
            } else {
                await productService.create(submitData);
                alert('✅ Tạo sản phẩm thành công');
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                images: []
            });
            setEditingProduct(null);
            setShowForm(false);

            // Reload products
            fetchProducts();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Lỗi khi lưu sản phẩm';
            
            // Xử lý lỗi validation
            if (err.response?.status === 400) {
                const errors = err.response?.data?.errors || [];
                if (errors.length > 0) {
                    setError(`❌ ${errors.map(e => e.message).join(', ')}`);
                } else {
                    setError(`❌ ${errorMsg}`);
                }
            } else if (err.response?.status === 401) {
                setError('❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else if (err.response?.status === 403) {
                setError('❌ Bạn không có quyền thực hiện hành động này.');
            } else {
                setError(`❌ ${errorMsg}`);
            }
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
            images: product.images || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
            try {
                setError(null);
                await productService.delete(id);
                alert('✅ Xóa sản phẩm thành công');
                fetchProducts();
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Lỗi khi xóa sản phẩm';
                
                if (err.response?.status === 401) {
                    setError('❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                } else if (err.response?.status === 403) {
                    setError('❌ Bạn không có quyền xóa sản phẩm này.');
                } else {
                    setError(`❌ ${errorMsg}`);
                }
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
            images: []
        });
    };

    const pages = Math.ceil(total / limit);

    return (
        <AdminLayout>
            <div className="product-management">
                <h1 className="page-title">📦 Quản lý sản phẩm</h1>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: '#f8d7da',
                        color: '#721c24',
                        padding: '15px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        border: '1px solid #f5c6cb'
                    }}>
                        {error}
                    </div>
                )}

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
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Link ảnh (nhập nhiều URL, cách nhau bằng dấu phẩy) *</label>
                                    <textarea
                                        name="images"
                                        value={formData.images.join(', ')}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                        rows="2"
                                    ></textarea>
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
