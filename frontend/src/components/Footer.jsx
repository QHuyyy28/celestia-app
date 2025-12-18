import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-dark text-white mt-5">
            <div className="container py-5">
                <div className="row">
                    <div className="col-md-3 mb-4">
                        <h5 className="fw-bold mb-3">🛍️ Celestia</h5>
                        <p className="text-muted">
                            Mua sắm trực tuyến hàng đầu với sản phẩm chất lượng cao.
                        </p>
                    </div>
                    <div className="col-md-3 mb-4">
                        <h5 className="fw-bold mb-3">Liên kết</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
                            <li><Link to="/products" className="text-muted text-decoration-none">Sản phẩm</Link></li>
                            <li><Link to="/blog" className="text-muted text-decoration-none">Blog</Link></li>
                        </ul>
                    </div>
                    <div className="col-md-3 mb-4">
                        <h5 className="fw-bold mb-3">Hỗ trợ</h5>
                        <ul className="list-unstyled">
                            <li><a href="/" className="text-muted text-decoration-none">Liên hệ</a></li>
                            <li><a href="/" className="text-muted text-decoration-none">FAQ</a></li>
                            <li><a href="/" className="text-muted text-decoration-none">Điều khoản</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3 mb-4">
                        <h5 className="fw-bold mb-3">Theo dõi</h5>
                        <ul className="list-unstyled">
                            <li><a href="/" className="text-muted text-decoration-none">Facebook</a></li>
                            <li><a href="/" className="text-muted text-decoration-none">Instagram</a></li>
                            <li><a href="/" className="text-muted text-decoration-none">Twitter</a></li>
                        </ul>
                    </div>
                </div>
                <hr className="bg-secondary" />
                <div className="text-center text-muted">
                    <p>&copy; 2025 Celestia Store. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};