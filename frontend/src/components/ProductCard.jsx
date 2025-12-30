import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
    const { isAuthenticated } = useAuth();
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const isInWishlist = wishlist?.items?.some(item => {
        const itemId = typeof item.product === 'string' ? item.product : item.product?._id;
        return itemId === product._id;
    });

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await toggleWishlist(product._id);
        } catch (error) {
            console.error('Wishlist Error:', error);
            alert(error.response?.data?.message || 'Lỗi cập nhật wishlist');
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await addToCart(product._id, 1);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(i < Math.floor(rating) ? '★' : '☆');
        }
        return stars.join('');
    };

    return (
        <Link to={`/product/${product._id}`} className="product-card">
            <div className="product-image-container">
                <img
                    src={product.images?.[0] || 'https://via.placeholder.com/400x500/e8dfd5/5d4e37?text=Celestia+Candle'}
                    className="product-image"
                    alt={product.name}
                />
                {product.isFeatured && (
                    <div className="product-badge">Featured</div>
                )}
                <div className="product-overlay">
                    <div className="quick-actions">
                        <button
                            className="action-btn"
                            onClick={handleWishlist}
                            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {isInWishlist ? '♥' : '♡'}
                        </button>
                        <button
                            className="action-btn"
                            onClick={handleAddToCart}
                            title="Add to cart"
                        >
                            🛍
                        </button>
                    </div>
                </div>
            </div>
            <div className="product-info">
                <div>
                    <div className="product-category">
                        {product.category?.name || 'Scented Candle'}
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    {product.description && (
                        <p className="product-description">{product.description}</p>
                    )}
                    {product.rating > 0 && (
                        <div className="product-rating">
                            <span className="stars">{renderStars(product.rating)}</span>
                            <span className="rating-count">({product.reviewCount || 0})</span>
                        </div>
                    )}
                </div>
                <div>
                    <div className="product-price">
                        ${product.price?.toFixed(2)}
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="original-price">
                                ${product.originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                    {product.stock <= 0 ? (
                        <div className="stock-status">Out of Stock</div>
                    ) : product.stock < 10 ? (
                        <div className="stock-status" style={{ color: 'var(--gold-accent)' }}>
                            Only {product.stock} left
                        </div>
                    ) : null}
                </div>
            </div>
        </Link>
    );
};