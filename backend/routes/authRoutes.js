// const express = require('express');
// const {
//     register,
//     login,
//     getMe,
//     updateProfile,
//     changePassword
// } = require('../controllers/authController');
// const { protect } = require('../middlewares/auth');

// const router = express.Router();

// // Public routes (không cần đăng nhập)
// router.post('/register', register);
// router.post('/login', login);

// // Protected routes (phải đăng nhập)
// router.get('/me', protect, getMe);
// router.put('/update', protect, updateProfile);
// router.put('/change-password', protect, changePassword);

// module.exports = router;

const express = require('express');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
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

// Protected routes (phải đăng nhập)
router.get('/me', protect, getMe);
router.put('/update', protect, validateUpdateProfile, handleValidationErrors, updateProfile);
router.put('/change-password', protect, validateChangePassword, handleValidationErrors, changePassword);

module.exports = router;