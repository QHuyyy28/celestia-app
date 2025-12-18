import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productService.getById(id);
            setProduct(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setReviewLoading(true);
            const response = await reviewService.getProductReviews(id, 1, 5);
            setReviews(response.data.data);
        } catch (err) {
            console.error('Lỗi tải reviews:', err);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleAddToCart = async () => {
        try {
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
            await addToCart(id, quantity);
            alert('Thêm vào giỏ hàng thành công!');
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi thêm vào giỏ');
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning">Sản phẩm không tìm thấy</div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                {/* Product Image */}
                <div className="col-md-6 mb-4">
                    <img
                        src={product.images?.[0] || 'https://via.placeholder.com/500'}
                        alt={product.name}
                        className="img-fluid rounded"
                    />
                </div>

                {/* Product Info */}
                <div className="col-md-6">
                    <h1 className="mb-3">{product.name}</h1>

                    <div className="mb-3">
                        <span className="badge bg-warning text-dark">
                            ⭐ {product.rating || 0} ({product.numReviews || 0} đánh giá)
                        </span>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-danger">₫{product.price?.toLocaleString()}</h2>
                        {product.comparePrice > 0 && (
                            <del className="text-muted">₫{product.comparePrice?.toLocaleString()}</del>
                        )}
                    </div>

                    <p className="mb-4">{product.description}</p>

                    <div className="mb-4">
                        <label className="form-label">Số lượng</label>
                        <div className="input-group" style={{ maxWidth: '150px' }}>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                className="form-control text-center"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-lg w-100 mb-2"
                        onClick={handleAddToCart}
                    >
                        🛒 Thêm vào giỏ hàng
                    </button>

                    <div className="alert alert-info">
                        <strong>Tồn kho:</strong> {product.stock || 0} sản phẩm
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="row mt-5">
                <div className="col-12">
                    <h3>💬 Đánh giá từ khách hàng</h3>

                    {reviewLoading && <p>Đang tải đánh giá...</p>}

                    {reviews.length === 0 ? (
                        <p className="text-muted">Chưa có đánh giá nào</p>
                    ) : (
                        <div>
                            {reviews.map(review => (
                                <div key={review._id} className="card mb-3">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <h5 className="card-title">
                                                {review.user?.name}
                                                {review.verified && (
                                                    <span className="badge bg-success ms-2">✓ Đã mua</span>
                                                )}
                                            </h5>
                                            <span className="badge bg-warning">
                                                {'⭐'.repeat(review.rating)}
                                            </span>
                                        </div>
                                        <h6 className="card-subtitle mb-2 text-muted">{review.title}</h6>
                                        <p className="card-text">{review.comment}</p>
                                        <small className="text-muted">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isAuthenticated && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/product/${id}#write-review`)}
                        >
                            Viết đánh giá
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}