import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';

export default function Wishlist() {
    const { wishlist, removeFromWishlist } = useWishlist();

    if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
        return (
            <div className="container py-5 text-center">
                <h2>❤️ Wishlist trống</h2>
                <p className="text-muted">Hãy thêm sản phẩm yêu thích của bạn</p>
                <Link to="/products" className="btn btn-primary">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">❤️ Danh sách yêu thích</h1>

            <div className="row g-4">
                {wishlist.items.map(item => (
                    <div key={item.product._id} className="col-md-6 col-lg-4">
                        <div className="card h-100">
                            <img
                                src={item.product.images?.[0] || 'https://via.placeholder.com/200'}
                                alt={item.product.name}
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{item.product.name}</h5>
                                <p className="card-text text-muted text-truncate">
                                    {item.product.description}
                                </p>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="h5 mb-0 text-danger">
                                        ₫{item.product.price?.toLocaleString()}
                                    </span>
                                    <span className="badge bg-warning text-dark">
                                        ⭐ {item.product.rating || 0}
                                    </span>
                                </div>
                                <div className="d-grid gap-2">
                                    <Link
                                        to={`/product/${item.product._id}`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Xem chi tiết
                                    </Link>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => removeFromWishlist(item.product._id)}
                                    >
                                        Xóa khỏi yêu thích
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}