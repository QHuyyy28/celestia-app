import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for subscribing!');
        setEmail('');
    };

    return (
        <footer className="celestia-footer">
            <div className="footer-container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <h3 className="footer-logo">✨ Celestia</h3>
                        <p className="footer-description">
                            Handcrafted luxury candles that transform your space into a sanctuary. 
                            Every candle tells a story of elegance and serenity.
                        </p>
                        <div className="social-links">
                            <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">f</a>
                            <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">📷</a>
                            <a href="https://pinterest.com" className="social-link" target="_blank" rel="noopener noreferrer">P</a>
                            <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">🐦</a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Shop</h4>
                        <ul className="footer-links">
                            <li><Link to="/products">All Products</Link></li>
                            <li><Link to="/products?category=floral">Floral Collection</Link></li>
                            <li><Link to="/products?category=woody">Woody Collection</Link></li>
                            <li><Link to="/products?category=citrus">Citrus Collection</Link></li>
                            <li><Link to="/products?featured=true">Featured</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Information</h4>
                        <ul className="footer-links">
                            <li><Link to="/blog">Our Stories</Link></li>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#shipping">Shipping Info</a></li>
                            <li><a href="#returns">Returns & Exchanges</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Newsletter</h4>
                        <p className="footer-description">
                            Subscribe to receive updates, access to exclusive deals, and more.
                        </p>
                        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                className="newsletter-input"
                                placeholder="Your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="newsletter-btn">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="copyright">
                        © 2025 Celestia Candles. All rights reserved.
                    </div>
                    <div className="payment-methods">
                        <span className="payment-icon">💳</span>
                        <span className="payment-icon">💰</span>
                        <span className="payment-icon">🏦</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};