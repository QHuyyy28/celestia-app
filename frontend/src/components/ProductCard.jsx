import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';

export const ProductCard = ({ product }) => {
    const { isAuthenticated } = useAuth();
    const { wishlist, toggleWishlist } = useWishlist();

    const isInWishlist = wishlist?.items?.some(item => item.product._id === product._id);

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập');
            return;
        }
        try {
            await toggleWishlist(product._id);
        } catch (error) {
            console.error('Lỗi:', error);
        }
    };

    return (
        <div className="card h-100 product-card">
            <div className="position-relative">
                <img
                    src={product.images?.[0] || 'https://via.placeholder.com/200'}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                />
                <button
                    className={`btn btn-sm position-absolute top-0 end-0 m-2 ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'
                        }`}
                    onClick={handleWishlist}
                    title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                    ❤️
                </button>
            </div>
            <div className="card-body">
                <h5 className="card-title text-truncate">{product.name}</h5>
                <p className="card-text text-muted text-truncate">
                    {product.description}
                </p>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="h5 mb-0 text-danger">
                        ₫{product.price?.toLocaleString()}
                    </span>
                    <span className="badge bg-warning text-dark">
                        ⭐ {product.rating || 0}
                    </span>
                </div>
                <Link
                    to={`/product/${product._id}`}
                    className="btn btn-primary btn-sm w-100"
                >
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
};