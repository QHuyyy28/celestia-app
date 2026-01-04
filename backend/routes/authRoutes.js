const express = require('express');
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
    testBirthdayEmail
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

// Protected routes (phải đăng nhập)
router.get('/me', protect, getMe);
router.put('/update', protect, validateUpdateProfile, handleValidationErrors, updateProfile);
router.put('/change-password', protect, validateChangePassword, handleValidationErrors, changePassword);
router.post('/logout', protect, logout);

module.exports = router;