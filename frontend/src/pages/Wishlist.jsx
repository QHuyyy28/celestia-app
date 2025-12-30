import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import './Wishlist.css';

export default function Wishlist() {
    const { wishlist, removeFromWishlist } = useWishlist();

    if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
        return (
            <div className="wishlist-container">
                <div className="container py-5">
                    <div className="wishlist-empty">
                        <h2>❤️ Wishlist trống</h2>
                        <p className="text-muted">Hãy thêm sản phẩm yêu thích của bạn</p>
                        <Link to="/products" className="btn btn-primary" style={{ backgroundColor: '#5d4e37', borderColor: '#5d4e37' }}>
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-container">
            <div className="container py-5">
                <h1 className="wishlist-header">❤️ Danh sách yêu thích</h1>

                <div className="row g-4">
                    {wishlist.items.map(item => (
                        <div key={item.product._id} className="col-md-6 col-lg-4">
                            <div className="card wishlist-card h-100">
                                <img
                                    src={item.product.images?.[0] || 'https://via.placeholder.com/200'}
                                    alt={item.product.name}
                                    className="wishlist-card-img"
                                />
                                <div className="wishlist-card-body">
                                    <h5 className="wishlist-product-name">{item.product.name}</h5>
                                    <p className="wishlist-product-description">
                                        {item.product.description}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="wishlist-price">
                                            ₫{item.product.price?.toLocaleString()}
                                        </span>
                                        <span className="wishlist-rating">
                                            ⭐ {item.product.rating || 0}
                                        </span>
                                    </div>
                                    <div className="wishlist-btn-container">
                                        <Link
                                            to={`/product/${item.product._id}`}
                                            className="btn wishlist-btn-view"
                                        >
                                            Xem chi tiết
                                        </Link>
                                        <button
                                            className="btn wishlist-btn-remove"
                                            onClick={() => removeFromWishlist(item.product._id)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}