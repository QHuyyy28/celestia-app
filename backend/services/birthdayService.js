const User = require('../models/User');

const getUpcomingBirthdays = async (daysAhead = 5) => {
    try {
        const users = await User.find({ 
            birthday: { $exists: true, $ne: null },
            isEmailVerified: true
        }).select('name email birthday avatar createdAt');

        const today = new Date();
        const upcomingBirthdays = [];

        users.forEach(user => {
            const birthDate = new Date(user.birthday);
            const thisYearBirthday = new Date(
                today.getFullYear(),
                birthDate.getMonth(),
                birthDate.getDate()
            );

            const diffTime = thisYearBirthday - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays <= daysAhead) {
                upcomingBirthdays.push({
                    ...user.toObject(),
                    daysUntilBirthday: diffDays,
                    birthdayDate: thisYearBirthday,
                    age: today.getFullYear() - birthDate.getFullYear()
                });
            }
        });

        upcomingBirthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
        return upcomingBirthdays;
    } catch (error) {
        console.error('Error getting upcoming birthdays:', error);
        throw error;
    }
};

const getBirthdayEmailTemplate = (userName) => {
    return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><style>* { margin: 0; padding: 0; box-sizing: border-box; }body { font-family: Arial, sans-serif; background: #f5f5f5; }.container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }.header { background: linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%); color: white; padding: 50px 20px; text-align: center; }.header h1 { font-size: 36px; }.content { padding: 40px 30px; text-align: center; }.cake { font-size: 60px; margin: 20px 0; }.discount-box { background: linear-gradient(135deg, #ffd6a5 0%, #ffb6a3 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #ff9a76; }.discount-code { font-size: 24px; font-weight: bold; color: #c06c84; letter-spacing: 2px; }.footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }</style></head>
<body>
<div class="container">
<div class="header"><h1>🎉 SINH NHẬT VUI VẺ! 🎉</h1><p>Ngày đặc biệt của bạn đã đến rồi!</p></div>
<div class="content">
<div class="cake">🎂🎈🎁</div>
<p>🎂 Hôm nay là sinh nhật của ${userName}! Chúc bạn một ngày tuyệt vời đầy niềm vui và may mắn! 🎉</p>
<div class="discount-box"><p>🎁 Quà tặng đặc biệt:</p><p class="discount-code">BIRTHDAY10</p><p>Giảm 10% cho tất cả sản phẩm!</p></div>
<p>Cảm ơn bạn đã là một phần của gia đình Celestia!</p>
</div>
<div class="footer"><p><strong>Celestia - Nơi đẹp gặp gỡ chất lượng</strong></p></div>
</div>
</body>
</html>`;
};

module.exports = {
    getUpcomingBirthdays,
    getBirthdayEmailTemplate
};
