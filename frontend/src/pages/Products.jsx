import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('newest');

    const limit = 12;

    useEffect(() => {
        fetchProducts();
    }, [page, search, minPrice, maxPrice, sort]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (search) filters.search = search;
            if (minPrice) filters.minPrice = minPrice;
            if (maxPrice) filters.maxPrice = maxPrice;
            if (sort) filters.sort = sort;

            const response = await productService.getAll(page, limit, filters);
            setProducts(response.data.data);
            setTotal(response.data.total);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const pages = Math.ceil(total / limit);

    return (
        <div className="container py-5">
            <h1 className="mb-4">📦 Tất cả sản phẩm</h1>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Giá tối thiểu"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Giá tối đa"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <select
                        className="form-select"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                        <option value="name_asc">Tên A-Z</option>
                    </select>
                </div>
                <div className="col-md-1">
                    <button className="btn btn-primary w-100" onClick={handleSearch}>
                        Lọc
                    </button>
                </div>
            </div>

            {/* Results */}
            {loading && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {!loading && !error && (
                <>
                    <div className="row g-4 mb-4">
                        {products.map(product => (
                            <div key={product._id} className="col-md-6 col-lg-4">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pages > 1 && (
                        <nav aria-label="Page navigation">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Trước
                                    </button>
                                </li>
                                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                                    <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Tiếp
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}