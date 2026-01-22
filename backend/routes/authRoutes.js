const express = require('express');
const passport = require('passport');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    testBirthdayEmail,
    googleCallback
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const {
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword,
    handleValidationErrors
} = require('../middlewares/validators');

const router = express.Router();

// Public routes (không cần đăng nhập)
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/test-birthday', testBirthdayEmail); // Test birthday email

// Google OAuth routes - Only if Google OAuth is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    router.get('/google', 
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    router.get('/google/callback',
        passport.authenticate('google', { 
            failureRedirect: '/login',
            session: false 
        }),
        googleCallback
    );
} else {
    // Fallback routes when Google OAuth is not configured
    router.get('/google', (req, res) => {
        res.status(503).json({
            success: false,
            message: 'Google OAuth chưa được cấu hình. Vui lòng thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET vào file .env'
        });
    });
    
    router.get('/google/callback', (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_not_configured`);
    });
}

// Protected routes (phải đăng nhập)
router.get('/me', protect, getMe);
router.put('/update', protect, validateUpdateProfile, handleValidationErrors, updateProfile);
router.put('/change-password', protect, validateChangePassword, handleValidationErrors, changePassword);
router.post('/logout', protect, logout);

module.exports = router;