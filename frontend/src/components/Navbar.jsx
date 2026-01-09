import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import './Navbar.css';

export const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { cart } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const closeMenus = () => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    };

    return (
        <nav className="celestia-navbar">
            <div className="navbar-container">
                <Link className="navbar-logo" to="/">
                    <img src="/logo.png" alt="Celestia" className="logo-image" />
                    <span className="logo-text">Celestia</span>
                </Link>

                <button 
                    className="mobile-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    ☰
                </button>

                <ul className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <li><Link to="/" onClick={closeMenus}>Home</Link></li>
                    <li><Link to="/products" onClick={closeMenus}>Shop</Link></li>
                    <li><Link to="/blog" onClick={closeMenus}>Stories</Link></li>
                    <li><Link to="/products" onClick={closeMenus}>Collections</Link></li>
                </ul>

                <div className="navbar-icons">
                    {isAuthenticated ? (
                        <>
                            <Link to="/wishlist" className="icon-link">
                                ♡
                                {wishlist?.totalItems > 0 && (
                                    <span className="icon-badge">{wishlist.totalItems}</span>
                                )}
                            </Link>
                            <Link to="/cart" className="icon-link">
                                🛍
                                {cart?.totalItems > 0 && (
                                    <span className="icon-badge">{cart.totalItems}</span>
                                )}
                            </Link>
                            <div className="user-dropdown">
                                <div className="user-name" onClick={toggleDropdown}>
                                    {user?.name} ▾
                                </div>
                                <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
                                    <Link to="/profile" className="dropdown-item" onClick={closeMenus}>Profile</Link>
                                    <Link to="/orders" className="dropdown-item" onClick={closeMenus}>My Orders</Link>
                                    {user?.role === 'admin' && (
                                        <>
                                            <hr className="dropdown-divider" />
                                            <Link to="/admin/dashboard" className="dropdown-item" onClick={closeMenus}>
                                                Admin Panel
                                            </Link>
                                        </>
                                    )}
                                    <hr className="dropdown-divider" />
                                    <button onClick={handleLogout} className="dropdown-item">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="icon-link">👤</Link>
                            <Link to="/cart" className="icon-link">🛍</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};