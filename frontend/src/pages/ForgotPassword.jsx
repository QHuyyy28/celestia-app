import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await authService.forgotPassword(email);
            setSuccess(true);
            setEmail('');
            // Redirect sau 3 giây
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-icon">✓</div>
                    <h1 className="auth-title">Email Sent!</h1>
                    <p className="auth-subtitle">Check your email for password reset instructions</p>
                    
                    <div className="success-message">
                        <p>
                            We've sent a password reset link to your email address. 
                            Please check your inbox and click the link to reset your password.
                        </p>
                        <p style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
                            Redirecting to login page in 3 seconds...
                        </p>
                    </div>

                    <Link to="/login" className="auth-button" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-icon">🔐</div>
                <h1 className="auth-title">Forgot Password?</h1>
                <p className="auth-subtitle">Enter your email to reset your password</p>

                {error && (
                    <div className="error-alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            id="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <div className="auth-link">
                    Remember your password?{' '}
                    <Link to="/login">Sign in here</Link>
                </div>
                
                <div className="auth-link">
                    Don't have an account?{' '}
                    <Link to="/register">Create one now</Link>
                </div>
            </div>
        </div>
    );
}
