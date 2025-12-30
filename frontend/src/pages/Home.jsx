import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import './Home.css';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await productService.getFeatured();
                setProducts(response.data.data.slice(0, 6));
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-icon">
                        <img src="/logo.png" alt="Celestia" style={{width: '120px', height: '120px'}} />
                    </div>
                    <h1 className="hero-title">Celestia Candles</h1>
                    <p className="hero-subtitle">Handcrafted Luxury</p>
                    <p className="hero-description">
                        Discover our collection of artisanal scented candles, 
                        carefully crafted to transform your space into a sanctuary of serenity.
                    </p>
                    <Link to="/products" className="btn-celestia">
                        Shop Collection
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section">
                <div className="section-header">
                    <h2 className="section-title">Featured Candles</h2>
                    <p className="section-subtitle">Our Most Loved Collection</p>
                </div>

                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading our finest candles...</p>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="products-grid">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                        <div className="view-all-container">
                            <Link to="/products" className="btn-outline-celestia">
                                View All Products
                            </Link>
                        </div>
                    </>
                )}
            </section>

            {/* Collection Showcase */}
            <section className="collection-showcase">
                <div className="collection-grid">
                    <Link to="/products?category=floral" className="collection-card">
                        <div className="collection-content">
                            <h3 className="collection-title">Floral</h3>
                            <p className="collection-description">
                                Delicate botanical fragrances
                            </p>
                            <span className="btn-outline-celestia">Explore</span>
                        </div>
                    </Link>
                    <Link to="/products?category=woody" className="collection-card">
                        <div className="collection-content">
                            <h3 className="collection-title">Woody</h3>
                            <p className="collection-description">
                                Warm earthy scents
                            </p>
                            <span className="btn-outline-celestia">Explore</span>
                        </div>
                    </Link>
                    <Link to="/products?category=citrus" className="collection-card">
                        <div className="collection-content">
                            <h3 className="collection-title">Citrus</h3>
                            <p className="collection-description">
                                Fresh energizing aromas
                            </p>
                            <span className="btn-outline-celestia">Explore</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Story Section */}
            <section className="story-section">
                <div className="story-content">
                    <h2 className="story-title">Our Story</h2>
                    <p className="story-text">
                        At Celestia, we believe in the power of scent to transform spaces and elevate moments. 
                        Each candle is thoughtfully hand-poured using premium soy wax and carefully selected 
                        fragrances, creating an experience that engages the senses and soothes the soul.
                    </p>
                    <Link to="/blog" className="btn-celestia">
                        Read More
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon">🌿</div>
                        <h3 className="feature-title">Natural Ingredients</h3>
                        <p className="feature-text">
                            Made with 100% natural soy wax and premium essential oils
                        </p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🤲</div>
                        <h3 className="feature-title">Hand Poured</h3>
                        <p className="feature-text">
                            Each candle is carefully crafted by hand in small batches
                        </p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">♻️</div>
                        <h3 className="feature-title">Eco Friendly</h3>
                        <p className="feature-text">
                            Sustainable packaging and recyclable materials
                        </p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🚚</div>
                        <h3 className="feature-title">Free Shipping</h3>
                        <p className="feature-text">
                            Complimentary delivery on orders over $50
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}