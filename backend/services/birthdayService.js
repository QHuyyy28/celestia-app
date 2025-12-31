const cron = require('node-cron');
const User = require('../models/User');
const { sendEmail } = require('../config/email');
const { renderTemplate } = require('./emailService');

// Danh sách lời chúc sinh nhật
const BIRTHDAY_GREETINGS = [
    (name) => `🎂 Hôm nay là sinh nhật của ${name}! Chúc bạn một ngày tuyệt vời đầy niềm vui và may mắn! 🎉`,
    (name) => `🌟 Sinh nhật vui vẻ ${name}! Chúc bạn sức khỏe, hạnh phúc và thành công! 🎊`,
    (name) => `🎈 Ngày sinh nhật của ${name} rồi! Mong bạn luôn tươi cười và có những điều tốt đẹp! 💝`,
    (name) => `🎁 Chúc mừng sinh nhật ${name}! Cảm ơn bạn đã tin tưởng Celestia! 🌹`,
    (name) => `🎀 Sinh nhật của ${name}! Mong bạn có một năm mới tuyệt vời, đầy yêu thương và thành công! ✨`,
];

/**
 * Gửi email lời chúc sinh nhật
 */
const sendBirthdayEmail = async (user) => {
    try {
        const greeting = BIRTHDAY_GREETINGS[Math.floor(Math.random() * BIRTHDAY_GREETINGS.length)](user.name);
        
        const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%); color: white; padding: 50px 20px; text-align: center; }
        .header h1 { font-size: 36px; margin-bottom: 10px; }
        .content { padding: 40px 30px; text-align: center; }
        .greeting { font-size: 18px; color: #333; line-height: 1.8; margin: 20px 0; font-weight: 500; }
        .cake { font-size: 60px; margin: 20px 0; }
        .discount-box { background: linear-gradient(135deg, #ffd6a5 0%, #ffb6a3 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #ff9a76; }
        .discount-text { font-size: 16px; color: #333; margin-bottom: 10px; }
        .discount-code { font-size: 24px; font-weight: bold; color: #c06c84; letter-spacing: 2px; font-family: monospace; }
        .note { background: #e8f4f8; border-left: 4px solid #3498db; padding: 12px; border-radius: 4px; font-size: 13px; color: #333; margin: 20px 0; }
        .shop-button { display: inline-block; background: linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%); color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin: 20px 0; font-weight: 600; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e8dfd5; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 SINH NHẬT VUI VẺ! 🎉</h1>
            <p>Ngày đặc biệt của bạn đã đến rồi!</p>
        </div>

        <div class="content">
            <div class="cake">🎂🎈🎁</div>
            
            <p class="greeting">
                ${greeting}
            </p>

            <div class="discount-box">
                <p class="discount-text">🎁 Quà tặng đặc biệt dành cho sinh nhật của bạn:</p>
                <p class="discount-code">BIRTHDAY10</p>
                <p style="font-size: 14px; color: #555; margin-top: 10px;">Giảm 10% cho tất cả sản phẩm!</p>
            </div>

            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" class="shop-button">
                🛍️ Mua sắm ngay
            </a>

            <div class="note">
                <strong>📌 Lưu ý:</strong> Mã giảm giá <strong>BIRTHDAY10</strong> có hiệu lực trong 24 giờ kể từ hôm nay. Chúc bạn mua sắm vui vẻ!
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 20px; line-height: 1.6;">
                Cảm ơn bạn đã là một phần của gia đình Celestia. Chúng tôi rất trân trọng sự tin tưởng của bạn!
            </p>
        </div>

        <div class="footer">
            <p style="margin-bottom: 10px;"><strong>Celestia - Nơi đẹp gặp gỡ chất lượng</strong></p>
            <p style="margin-top: 10px; opacity: 0.7;">© 2025 Celestia Store. Tất cả quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>
        `;

        await sendEmail(
            user.email,
            `🎉 Sinh nhật vui vẻ ${user.name}! 🎂 Celestia tặng bạn mã giảm giá đặc biệt`,
            html
        );

        console.log(`✓ Birthday email sent to ${user.name} (${user.email})`);
        return true;
    } catch (error) {
        console.error('Error sending birthday email:', error);
        throw error;
    }
};

/**
 * Tìm và gửi email lời chúc sinh nhật cho tất cả users có sinh nhật hôm nay
 */
const sendBirthdayGreetings = async () => {
    try {
        console.log('🎂 Starting birthday greeting task...');
        
        // Lấy tất cả users có birthday
        const users = await User.find({ birthday: { $exists: true, $ne: null } });
        
        const today = new Date();
        const birthdayUsers = users.filter(user => {
            const birthDate = new Date(user.birthday);
            return birthDate.getMonth() === today.getMonth() && 
                   birthDate.getDate() === today.getDate();
        });

        if (birthdayUsers.length === 0) {
            console.log('No birthday users today');
            return;
        }

        console.log(`🎉 Found ${birthdayUsers.length} users with birthday today`);

        // Gửi email cho tất cả users có sinh nhật
        for (const user of birthdayUsers) {
            try {
                await sendBirthdayEmail(user);
            } catch (error) {
                console.error(`Failed to send birthday email to ${user.email}:`, error);
            }
        }

        console.log(`✓ Birthday greeting task completed!`);
    } catch (error) {
        console.error('Error in birthday greeting task:', error);
    }
};

/**
 * Khởi động cron job để gửi lời chúc sinh nhật mỗi ngày vào 8:00 AM
 */
const initBirthdayScheduler = () => {
    try {
        // Chạy vào 8:00 AM mỗi ngày
        const task = cron.schedule('0 8 * * *', async () => {
            console.log('🎂 [CRON] Birthday greeting task started');
            await sendBirthdayGreetings();
        });

        console.log('✓ Birthday scheduler initialized - runs at 8:00 AM daily');
        return task;
    } catch (error) {
        console.error('Error initializing birthday scheduler:', error);
    }
};

module.exports = {
    sendBirthdayEmail,
    sendBirthdayGreetings,
    initBirthdayScheduler
};
