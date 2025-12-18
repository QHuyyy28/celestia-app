import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../services/blogService';

export default function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const limit = 10;

    useEffect(() => {
        fetchBlogs();
    }, [page]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await blogService.getAll(page, limit, { published: true });
            setBlogs(response.data.data);
            setTotal(response.data.pagination.total);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải blog');
        } finally {
            setLoading(false);
        }
    };

    const pages = Math.ceil(total / limit);

    return (
        <div className="container py-5">
            <h1 className="mb-4">📝 Blog</h1>

            {loading && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {!loading && !error && (
                <>
                    <div className="row g-4 mb-4">
                        {blogs.map(blog => (
                            <div key={blog._id} className="col-md-6 col-lg-4">
                                <div className="card h-100">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="card-img-top"
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{blog.title}</h5>
                                        <p className="card-text text-muted">{blog.excerpt}</p>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                👤 {blog.author?.name}
                                            </small>
                                            <small className="text-muted">
                                                👁️ {blog.views}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-white">
                                        <Link
                                            to={`/blog/${blog.slug}`}
                                            className="btn btn-primary btn-sm w-100"
                                        >
                                            Đọc thêm
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pages > 1 && (
                        <nav aria-label="Page navigation">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Trước
                                    </button>
                                </li>
                                {Array.from({ length: Math.min(pages, 5) }, (_, i) => page + i - 2).filter(p => p > 0 && p <= pages).map(p => (
                                    <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Tiếp
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}