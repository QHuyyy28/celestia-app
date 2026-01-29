import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Sync formData với user khi user thay đổi
    useEffect(() => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || '',
            birthday: user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ''
        });
    }, [user]);

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
            
            // Validasi client-side trước
            if (!formData.name?.trim()) {
                setError('Tên không được để trống');
                setLoading(false);
                return;
            }
            
            await updateProfile(formData);
            setSuccess('Cập nhật hồ sơ thành công!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Update profile error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Cập nhật thất bại';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ minHeight: '80vh', paddingTop: '40px', paddingBottom: '40px' }}>
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <div className="auth-icon"><i class="fa-solid fa-user"></i></div>
                <h1 className="auth-title">Hồ sơ cá nhân</h1>
                <p className="auth-subtitle">Quản lý thông tin tài khoản của bạn</p>

                {error && (
                    <div className="error-alert">{error}</div>
                )}
                {success && (
                    <div style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
                        ✓ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email (Không thể chỉnh sửa)
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            id="email"
                            value={user?.email || ''}
                            disabled
                            style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Tên
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nhập tên của bạn"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            className="form-input"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0123456789"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address" className="form-label">
                            Địa chỉ
                        </label>
                        <textarea
                            className="form-input"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ của bạn"
                            rows="4"
                            style={{ resize: 'vertical', minHeight: '100px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="birthday" className="form-label">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            id="birthday"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e8dfd5' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#5d4e37', marginBottom: '15px' }}><i class="fa-solid fa-circle-info"></i> Thông tin tài khoản</h3>
                    <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                        <p><strong>Vai trò:</strong> {user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                        <p><strong>Email xác nhận:</strong> {user?.isEmailVerified ? 'Đã xác nhận' : 'Chưa xác nhận'}</p>
                        <p><strong>Ngày tạo:</strong> {new Date(user?.createdAt).toLocaleDateString('vi-VN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</p>
                        <p><strong>Nhận thông báo:</strong> {user?.isSubscribedToNotifications ? 'Bật' : '🔇 Tắt'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}