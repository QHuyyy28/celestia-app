// Test Birthday Feature - Chạy file này để tạo user test
// Chạy: node test-birthday-data.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const createTestUsers = async () => {
    try {
        await connectDB();

        // Tính ngày sinh nhật để test
        const today = new Date();
        
        // User 1: Sinh nhật hôm nay
        const todayBirthday = new Date(1995, today.getMonth(), today.getDate());
        
        // User 2: Sinh nhật ngày mai
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowBirthday = new Date(1996, tomorrow.getMonth(), tomorrow.getDate());
        
        // User 3: Sinh nhật 3 ngày nữa
        const in3days = new Date(today);
        in3days.setDate(in3days.getDate() + 3);
        const in3daysBirthday = new Date(1997, in3days.getMonth(), in3days.getDate());

        const testUsers = [
            {
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@test.com',
                password: '123456',
                birthday: todayBirthday,
                isEmailVerified: true
            },
            {
                name: 'Trần Thị B',
                email: 'tranthib@test.com',
                password: '123456',
                birthday: tomorrowBirthday,
                isEmailVerified: true
            },
            {
                name: 'Lê Văn C',
                email: 'levanc@test.com',
                password: '123456',
                birthday: in3daysBirthday,
                isEmailVerified: true
            }
        ];

        // Xóa user test cũ nếu có
        await User.deleteMany({ 
            email: { 
                $in: testUsers.map(u => u.email) 
            } 
        });

        // Tạo users mới
        for (const userData of testUsers) {
            const user = await User.create(userData);
            console.log(`✓ Created user: ${user.name} (Birthday: ${user.birthday.toLocaleDateString('vi-VN')})`);
        }

        console.log('\n✅ Test users created successfully!');
        console.log('📅 Hôm nay:', today.toLocaleDateString('vi-VN'));
        console.log('\nBây giờ:');
        console.log('1. Đăng nhập admin tại: http://localhost:3000/login');
        console.log('2. Vào Admin Dashboard: http://localhost:3000/admin/dashboard');
        console.log('3. Xem section "🎂 Sinh nhật sắp tới"');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestUsers();
