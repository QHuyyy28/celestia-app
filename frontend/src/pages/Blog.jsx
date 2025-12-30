import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../services/blogService';
import './Blog.css';

export default function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await blogService.getAll(1, 100, { published: true });
            setBlogs(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load stories');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="blog-page">
            {/* Hero */}
            <div className="blog-hero">
                <h1 className="blog-hero-title">Stories & Inspiration</h1>
                <p className="blog-hero-subtitle">
                    Discover the art of candle making, wellness tips, and stories behind our scents
                </p>
            </div>

            {/* Content */}
            <div className="blog-content">
                {loading && (
                    <div className="blog-loading">
                        <div className="blog-loading-spinner"></div>
                        <p className="blog-loading-text">Loading stories...</p>
                    </div>
                )}

                {error && (
                    <div className="blog-error">
                        <div className="blog-error-message">{error}</div>
                    </div>
                )}

                {!loading && !error && blogs.length === 0 && (
                    <div className="blog-empty">
                        <div className="blog-empty-icon">📖</div>
                        <h2 className="blog-empty-title">No Stories Yet</h2>
                        <p className="blog-empty-text">Check back soon for inspiring content</p>
                    </div>
                )}

                {!loading && !error && blogs.length > 0 && (
                    <div className="blog-grid">
                        {blogs.map(blog => (
                            <Link
                                key={blog._id}
                                to={`/blog/${blog.slug}`}
                                className="blog-card"
                            >
                                <div className="blog-card-image-container">
                                    <img
                                        src={blog.image || 'https://via.placeholder.com/400x280/e8dfd5/5d4e37?text=Celestia+Story'}
                                        alt={blog.title}
                                        className="blog-card-image"
                                    />
                                    <div className="blog-card-category">
                                        {blog.category || 'Lifestyle'}
                                    </div>
                                </div>
                                <div className="blog-card-content">
                                    <div className="blog-card-meta">
                                        <span>By {blog.author?.name || 'Celestia'}</span>
                                        <span>•</span>
                                        <span>{formatDate(blog.createdAt)}</span>
                                    </div>
                                    <h3 className="blog-card-title">{blog.title}</h3>
                                    <p className="blog-card-excerpt">{blog.excerpt}</p>
                                    <span className="blog-card-read-more">
                                        Read More →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
