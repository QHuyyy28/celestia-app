import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            await updateProfile(formData);
            setSuccess('Cập nhật hồ sơ thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body p-5">
                            <h1 className="card-title mb-4 text-center">👤 Hồ sơ cá nhân</h1>

                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={user?.email}
                                        disabled
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">
                                        Tên
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="address" className="form-label">
                                        Địa chỉ
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
                                </button>
                            </form>

                            <div className="mt-4">
                                <h5>Thông tin khác</h5>
                                <p>
                                    <strong>Vai trò:</strong> {user?.role === 'admin' ? '👨‍💼 Quản trị viên' : '👤 Khách hàng'}
                                </p>
                                <p>
                                    <strong>Ngày tạo:</strong> {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}