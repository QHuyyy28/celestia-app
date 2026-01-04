require('dotenv').config();
const mongoose = require('mongoose');
const { sendBirthdayGreetings } = require('./services/birthdayService');
const connectDB = require('./config/db');

const testBirthday = async () => {
    try {
        // Kết nối database
        await connectDB();
        
        console.log('🎂 Testing birthday email sending...\n');
        
        // Gửi email sinh nhật
        await sendBirthdayGreetings();
        
        console.log('\n✓ Test completed!');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testBirthday();
