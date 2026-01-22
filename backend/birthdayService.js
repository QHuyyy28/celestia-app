const User = require('../models/User');

const getUpcomingBirthdays = async (daysAhead = 5) => {
    try {
        const users = await User.find({ birthday: { $exists: true, $ne: null }, isEmailVerified: true }).select('name email birthday avatar createdAt');
        const today = new Date();
        const upcomingBirthdays = [];
        users.forEach(user => {
            const birthDate = new Date(user.birthday);
            const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            const diffTime = thisYearBirthday - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= daysAhead) {
                upcomingBirthdays.push({ ...user.toObject(), daysUntilBirthday: diffDays, birthdayDate: thisYearBirthday, age: today.getFullYear() - birthDate.getFullYear() });
            }
        });
        upcomingBirthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
        return upcomingBirthdays;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const getBirthdayEmailTemplate = (userName) => '<!DOCTYPE html><html><body><h1>Happy Birthday ' + userName + '</h1></body></html>';

module.exports = { getUpcomingBirthdays, getBirthdayEmailTemplate };
