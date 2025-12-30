import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import './ProductDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, wishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: ''
    });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        // Scroll to top when product changes
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        // Kiểm tra xem sản phẩm có trong wishlist không
        if (wishlist && wishlist.items) {
            const inWish = wishlist.items.some(item => {
                const itemId = typeof item.product === 'string' ? item.product : item.product?._id;
                return itemId === id;
            });
            setIsInWishlist(inWish);
        }
    }, [wishlist, id]);

    useEffect(() => {
        // Re-fetch reviews khi user login/logout để cập nhật status review của user
        if (id) {
            fetchReviews();
        }
    }, [isAuthenticated, id]);

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
            // Fetch nhiều reviews hơn để đảm bảo tìm được review của user
            const response = await reviewService.getProductReviews(id, 1, 100);
            console.log('API Response:', response);
            console.log('Response data:', response.data);
            // API trả về: { success: true, data: reviews, pagination: {...} }
            const reviewsData = Array.isArray(response.data.data) ? response.data.data : [];
            console.log('Reviews after fetch:', reviewsData);
            setReviews(reviewsData);
            
            // Kiểm tra user đã review sản phẩm này chưa
            if (isAuthenticated && user && user._id && reviewsData.length > 0) {
                const myReview = reviewsData.find(review => {
                    if (!review.user || !review.user._id) return false;
                    // So sánh cả string và Object ID
                    const reviewUserId = typeof review.user._id === 'string' 
                        ? review.user._id 
                        : review.user._id.toString();
                    const currentUserId = typeof user._id === 'string' 
                        ? user._id 
                        : user._id.toString();
                    return reviewUserId === currentUserId;
                });
                if (myReview) {
                    setUserReview(myReview);
                }
            } else if (!isAuthenticated || !user) {
                setUserReview(null);
            }
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

    const handleToggleWishlist = async () => {
        try {
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
            setWishlistLoading(true);
            await toggleWishlist(id);
            setIsInWishlist(!isInWishlist);
        } catch (error) {
            console.error('Wishlist Error:', error);
            alert(error.response?.data?.message || 'Lỗi cập nhật wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReviewForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
            
            const titleTrimmed = reviewForm.title.trim();
            const commentTrimmed = reviewForm.comment.trim();

            if (!titleTrimmed) {
                alert('Vui lòng nhập tiêu đề đánh giá');
                return;
            }

            if (titleTrimmed.length < 5) {
                alert('Tiêu đề phải có ít nhất 5 ký tự');
                return;
            }

            if (!commentTrimmed) {
                alert('Vui lòng nhập nội dung đánh giá');
                return;
            }

            if (commentTrimmed.length < 10) {
                alert('Nội dung phải có ít nhất 10 ký tự');
                return;
            }

            setReviewSubmitting(true);
            const response = await reviewService.createReview(
                id,
                parseInt(reviewForm.rating),
                titleTrimmed,
                commentTrimmed
            );
            console.log('Review response:', response);
            
            // Thêm review mới vào đầu danh sách
            const newReview = response.data.data;
            console.log('New review:', newReview);
            setReviews(prevReviews => [newReview, ...prevReviews]);
            setUserReview(newReview);
            
            setReviewForm({ rating: 5, title: '', comment: '' });
            setShowReviewForm(false);
            
            alert('Đánh giá của bạn đã được gửi thành công!');
            
            // Scroll to reviews section
            setTimeout(() => {
                const reviewsSection = document.querySelector('.reviews-section');
                if (reviewsSection) {
                    reviewsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Lỗi gửi đánh giá';
            alert(errorMsg);
            console.error('Review error:', err);
        } finally {
            setReviewSubmitting(false);
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
                <div className="product-main-section">
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
                            <button 
                                className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                                onClick={handleToggleWishlist}
                                disabled={wishlistLoading}
                                title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                            >
                                {isInWishlist ? '❤️' : '🤍'} Yêu thích
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
                            <>
                                {userReview ? (
                                    <div style={{
                                        marginTop: '30px',
                                        padding: '15px',
                                        backgroundColor: '#e8f5e9',
                                        borderLeft: '4px solid #4caf50',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#2e7d32'
                                    }}>
                                        <strong>✓ Bạn đã đánh giá sản phẩm này</strong>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
                                            Cảm ơn bạn đã chia sẻ trải nghiệm của mình!
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {!showReviewForm && (
                                            <button
                                                className="write-review-btn"
                                                onClick={() => setShowReviewForm(true)}
                                            >
                                                ✏️ Viết đánh giá
                                            </button>
                                        )}

                                        {showReviewForm && (
                                            <div className="review-form-container" id="write-review">
                                                <h3 className="review-form-title">Viết đánh giá của bạn</h3>
                                                <form onSubmit={handleSubmitReview} className="review-form">
                                                    <div className="form-group">
                                                        <label>Đánh giá (sao)</label>
                                                        <div className="rating-selector">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    className={`star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                                                                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                                >
                                                                    ⭐
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <span className="rating-value">{reviewForm.rating} sao</span>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Tiêu đề đánh giá</label>
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            value={reviewForm.title}
                                                            onChange={handleReviewChange}
                                                            placeholder="Vd: Sản phẩm tuyệt vời!"
                                                            maxLength="100"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Bình luận chi tiết</label>
                                                        <textarea
                                                            name="comment"
                                                            value={reviewForm.comment}
                                                            onChange={handleReviewChange}
                                                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                                            rows="5"
                                                            maxLength="500"
                                                            required
                                                        />
                                                        <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                                            {reviewForm.comment.length}/500
                                                        </div>
                                                    </div>

                                                    <div className="form-actions">
                                                        <button
                                                            type="submit"
                                                            className="submit-review-btn"
                                                            disabled={reviewSubmitting}
                                                        >
                                                            {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="cancel-review-btn"
                                                            onClick={() => setShowReviewForm(false)}
                                                            disabled={reviewSubmitting}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}