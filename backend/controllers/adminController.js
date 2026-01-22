const { getUpcomingBirthdays, getBirthdayEmailTemplate } = require('../services/birthdayService');

// @desc    Lấy danh sách users có sinh nhật sắp tới
// @route   GET /api/admin/upcoming-birthdays
// @access  Private/Admin
exports.getUpcomingBirthdays = async (req, res) => {
    try {
        const daysAhead = parseInt(req.query.days) || 5; // Default 5 ngày
        const upcomingBirthdays = await getUpcomingBirthdays(daysAhead);
        
        res.status(200).json({
            success: true,
            count: upcomingBirthdays.length,
            data: upcomingBirthdays
        });
    } catch (error) {
        console.error('Error getting upcoming birthdays:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sinh nhật',
            error: error.message
        });
    }
};

// @desc    Lấy email template cho sinh nhật
// @route   GET /api/admin/birthday-template/:userName
// @access  Private/Admin
exports.getBirthdayTemplate = async (req, res) => {
    try {
        const { userName } = req.params;
        const template = getBirthdayEmailTemplate(userName);
        
        res.status(200).json({
            success: true,
            data: {
                subject: `🎉 Sinh nhật vui vẻ ${userName}! 🎂 Celestia tặng bạn mã giảm giá đặc biệt`,
                html: template
            }
        });
    } catch (error) {
        console.error('Error getting birthday template:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy template',
            error: error.message
        });
    }
};
