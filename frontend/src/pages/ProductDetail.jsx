import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import './ProductDetail.css';

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
            <div className="product-detail-wrapper">
                <div className="product-detail-container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-detail-wrapper">
                <div className="product-detail-container">
                    <div className="error-message">⚠️ {error}</div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-wrapper">
                <div className="product-detail-container">
                    <div className="error-message">⚠️ Sản phẩm không tìm thấy</div>
                </div>
            </div>
        );
    }

    // Calculate discount percentage
    const discountPercent = product.comparePrice && product.comparePrice > 0 
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    return (
        <div className="product-detail-wrapper">
            <div className="product-detail-container">
                {/* Product Main Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
                    {/* Product Gallery */}
                    <div className="product-gallery">
                        <div className="product-gallery-main">
                            <img
                                src={product.images?.[0] || 'https://via.placeholder.com/500'}
                                alt={product.name}
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        <h1 className="product-title">{product.name}</h1>

                        {/* Rating Section */}
                        <div className="product-rating-section">
                            <span className="product-rating-badge">
                                ⭐ {product.rating || 0}
                            </span>
                            <span className="product-rating-count">
                                ({product.numReviews || 0} đánh giá)
                            </span>
                        </div>

                        {/* Price Section */}
                        <div className="product-price-section">
                            <div className="product-price">
                                ₫{product.price?.toLocaleString()}
                            </div>
                            {product.comparePrice && product.comparePrice > 0 && (
                                <div>
                                    <span className="product-compare-price">
                                        ₫{product.comparePrice?.toLocaleString()}
                                    </span>
                                    {discountPercent > 0 && (
                                        <span className="product-discount">
                                            -{discountPercent}%
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <p className="product-description">
                            {product.description}
                        </p>

                        {/* Quantity Section */}
                        <div className="quantity-section">
                            <label className="quantity-label">Số lượng</label>
                            <div className="quantity-control">
                                <button
                                    className="quantity-btn"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    className="quantity-input"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                />
                                <button
                                    className="quantity-btn"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="product-actions">
                            <button
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                            >
                                🛒 Thêm vào giỏ hàng
                            </button>
                            <button className="wishlist-btn">
                                ❤️ Yêu thích
                            </button>
                        </div>

                        {/* Stock Info */}
                        <div className={`stock-info ${product.stock <= 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : ''}`}>
                            <strong>📦 Tồn kho:</strong>{' '}
                            {product.stock > 0 
                                ? `${product.stock} sản phẩm`
                                : 'Hết hàng'
                            }
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <h2 className="reviews-title">💬 Đánh giá từ khách hàng</h2>
                    <div className="reviews-container">
                        {reviewLoading && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                Đang tải đánh giá...
                            </div>
                        )}

                        {!reviewLoading && reviews.length === 0 && (
                            <div className="no-reviews">
                                <p>Chưa có đánh giá nào</p>
                                {isAuthenticated && (
                                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                                        Hãy là người đầu tiên đánh giá sản phẩm này!
                                    </p>
                                )}
                            </div>
                        )}

                        {reviews.length > 0 && (
                            <div>
                                {reviews.map(review => (
                                    <div key={review._id} className="review-item">
                                        <div className="review-header">
                                            <div>
                                                <span className="review-author">
                                                    {review.user?.name}
                                                </span>
                                                {review.verified && (
                                                    <span className="review-verified-badge">
                                                        ✓ Đã mua
                                                    </span>
                                                )}
                                            </div>
                                            <span className="review-rating">
                                                {'⭐'.repeat(review.rating)}
                                            </span>
                                        </div>
                                        <div className="review-title">{review.title}</div>
                                        <p className="review-content">{review.comment}</p>
                                        <div className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isAuthenticated && (
                            <button
                                className="write-review-btn"
                                onClick={() => navigate(`/product/${id}#write-review`)}
                            >
                                ✏️ Viết đánh giá
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}