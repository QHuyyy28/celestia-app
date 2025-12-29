import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

export const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { cart } = useCart();
    const { wishlist } = useWishlist();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    🛍️ Celestia
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">
                                Sản phẩm
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/blog">
                                Blog
                            </Link>
                        </li>
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/wishlist">
                                        ❤️ Wishlist ({wishlist?.totalItems || 0})
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/cart">
                                        🛒 Giỏ ({cart?.totalItems || 0})
                                    </Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        id="userDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        {user?.name}
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="userDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/profile">
                                                Hồ sơ
                                            </Link>
                                        </li>
                                        {user?.role === 'admin' && (
                                            <>
                                                <li>
                                                    <hr className="dropdown-divider" />
                                                </li>
                                                <li>
                                                    <Link className="dropdown-item" to="/admin/dashboard">
                                                        ⚙️ Admin Panel
                                                    </Link>
                                                </li>
                                            </>
                                        )}
                                        <li>
                                            <hr className="dropdown-divider" />
                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={logout}
                                            >
                                                Đăng xuất
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        Đăng nhập
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        Đăng ký
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};