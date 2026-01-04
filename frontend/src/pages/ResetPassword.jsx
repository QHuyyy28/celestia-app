import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [invalidToken, setInvalidToken] = useState(false);
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setInvalidToken(true);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await authService.resetPassword(token, newPassword, confirmPassword);
            setSuccess(true);
            // Redirect sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Link có thể đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    if (invalidToken) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-icon">❌</div>
                    <h1 className="auth-title">Invalid Link</h1>
                    <p className="auth-subtitle">This password reset link is invalid or has expired</p>
                    
                    <div className="error-alert" style={{ marginTop: '20px' }}>
                        <p>Please request a new password reset link.</p>
                    </div>

                    <Link to="/forgot-password" className="auth-button" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-block', width: '100%', boxSizing: 'border-box', marginTop: '20px' }}>
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-icon">✓</div>
                    <h1 className="auth-title">Password Reset Successfully!</h1>
                    <p className="auth-subtitle">Your password has been changed</p>
                    
                    <div className="success-message">
                        <p>You can now sign in with your new password.</p>
                        <p style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
                            Redirecting to login page in 2 seconds...
                        </p>
                    </div>

                    <Link to="/login" className="auth-button" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-icon">🔐</div>
                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">Enter your new password</p>

                {error && (
                    <div className="error-alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="newPassword" className="form-label">
                            New Password
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            id="newPassword"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            id="confirmPassword"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="auth-link" style={{ marginTop: '20px' }}>
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}
