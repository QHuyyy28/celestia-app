import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="container py-5 text-center">
            <h1 className="display-1">❌ 404</h1>
            <h2 className="mb-4">Trang không tìm thấy</h2>
            <p className="text-muted mb-4">
                Xin lỗi, trang bạn tìm kiếm không tồn tại.
            </p>
            <Link to="/" className="btn btn-primary btn-lg">
                Quay lại trang chủ
            </Link>
        </div>
    );
}