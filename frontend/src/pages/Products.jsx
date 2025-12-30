import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import './Products.css';

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
    }, [page, sort]);

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
            setError(err.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        setPage(1);
        fetchProducts();
    };

    const pages = Math.ceil(total / limit);

    return (
        <div className="products-page">
            {/* Hero */}
            <div className="products-hero">
                <h1 className="products-hero-title">Our Collection</h1>
                <p className="products-hero-subtitle">Handcrafted Luxury Candles</p>
            </div>

            {/* Filters */}
            <div className="products-filters">
                <div className="filters-container">
                    <div className="filter-group">
                        <label className="filter-label">Search</label>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Search candles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Min Price</label>
                        <input
                            type="number"
                            className="filter-input"
                            placeholder="$0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Max Price</label>
                        <input
                            type="number"
                            className="filter-input"
                            placeholder="$100"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Sort By</label>
                        <select
                            className="filter-select"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A-Z</option>
                        </select>
                    </div>
                    <button className="filter-btn" onClick={handleFilter}>
                        Apply
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="products-content">
                {loading && (
                    <div className="products-loading">
                        <div className="products-loading-spinner"></div>
                        <p className="products-loading-text">Loading our collection...</p>
                    </div>
                )}

                {error && (
                    <div className="products-error">
                        <div className="products-error-message">{error}</div>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="products-grid">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="products-pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                >
                                    ‹
                                </button>
                                {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (pages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= pages - 2) {
                                        pageNum = pages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    className="pagination-btn"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === pages}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}