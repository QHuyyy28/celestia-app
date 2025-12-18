import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService } from '../services/blogService';

export default function BlogDetail() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBlog();
    }, [slug]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const response = await blogService.getBySlug(slug);
            setBlog(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải bài viết');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning">Bài viết không tìm thấy</div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-lg-8">
                    <Link to="/blog" className="btn btn-outline-primary mb-4">
                        ← Quay lại
                    </Link>

                    <img
                        src={blog.image}
                        alt={blog.title}
                        className="img-fluid rounded mb-4"
                    />

                    <h1 className="mb-3">{blog.title}</h1>

                    <div className="mb-4">
                        <small className="text-muted">
                            👤 {blog.author?.name} • 📅 {new Date(blog.createdAt).toLocaleDateString('vi-VN')} • 👁️ {blog.views} lượt xem
                        </small>
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mb-4">
                            {blog.tags.map(tag => (
                                <span key={tag} className="badge bg-secondary me-2">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div
                        className="blog-content mb-4"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                        style={{ lineHeight: '1.8' }}
                    />

                    <div className="alert alert-info">
                        <strong>Danh mục:</strong> {blog.category}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Thông tin bài viết</h5>
                            <hr />
                            <p>
                                <strong>Tác giả:</strong> {blog.author?.name}
                            </p>
                            <p>
                                <strong>Danh mục:</strong> {blog.category}
                            </p>
                            <p>
                                <strong>Ngày đăng:</strong> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                            <p>
                                <strong>Lượt xem:</strong> {blog.views}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}