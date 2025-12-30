const express = require('express');
const {
    getAllUsers,
    getUserById,
    getUserCount
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/auth');
const { validatePagination, handleValidationErrors } = require('../middlewares/validators');

const router = express.Router();

// Admin routes
router.get('/stats/count', protect, admin, getUserCount);
router.get('/', protect, admin, validatePagination, handleValidationErrors, getAllUsers);
router.get('/:id', protect, admin, getUserById);

module.exports = router;
