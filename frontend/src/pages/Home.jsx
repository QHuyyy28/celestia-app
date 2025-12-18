import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await productService.getFeatured();
                setProducts(response.data.data.slice(0, 6));
            } catch (err) {
                setError(err.response?.data?.message || 'Lỗi tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-light py-5">
                <div className="container text-center">
                    <h1 className="display-4 fw-bold mb-4">🛍️ Celestia Store</h1>
                    <p className="lead mb-4">Mua sắm hàng đầu với giá tốt nhất</p>
                    <Link to="/products" className="btn btn-primary btn-lg">
                        Xem tất cả sản phẩm
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-5">
                <div className="container">
                    <h2 className="mb-4">⭐ Sản phẩm nổi bật</h2>

                    {loading && (
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="row g-4">
                            {products.map(product => (
                                <div key={product._id} className="col-md-6 col-lg-4">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="bg-light py-5">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-4 mb-4">
                            <div className="h1 mb-3">🚚</div>
                            <h5>Giao hàng nhanh</h5>
                            <p className="text-muted">Giao hàng trong 24-48 giờ</p>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="h1 mb-3">💰</div>
                            <h5>Giá rẻ nhất</h5>
                            <p className="text-muted">Cam kết giá tốt nhất thị trường</p>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="h1 mb-3">🛡️</div>
                            <h5>An toàn mua sắm</h5>
                            <p className="text-muted">Thanh toán an toàn 100%</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}