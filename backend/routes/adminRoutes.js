const express = require('express');
const { getUpcomingBirthdays, getBirthdayTemplate } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// Protected routes - Admin only
router.get('/upcoming-birthdays', protect, admin, getUpcomingBirthdays);
router.get('/birthday-template/:userName', protect, admin, getBirthdayTemplate);

module.exports = router;
