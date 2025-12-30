// const nodemailer = require('nodemailer');

// // Tạo transporter dành cho Mailtrap (để test) hoặc Gmail
// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: process.env.EMAIL_PORT || 587,
//     secure: process.env.EMAIL_PORT == 465 ? true : false, // true for 465, false for other ports
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

// // Verify connection
// transporter.verify((error, success) => {
//     if (error) {
//         console.log('Email config error:', error);
//     } else {
//         console.log('Email service is ready to send messages');
//     }
// });

// const sendEmail = async (to, subject, html) => {
//     try {
//         const mailOptions = {
//             from: `"Celestia" <${process.env.EMAIL_USER}>`,
//             to,
//             subject,
//             html
//         };

//         const info = await transporter.sendMail(mailOptions);
//         console.log(`✓ Email sent to ${to} - Message ID: ${info.messageId}`);
//         return info;
//     } catch (error) {
//         console.error(`✗ Email error for ${to}:`, error.message);
//         throw error;
//     }
// };

// module.exports = { sendEmail };


require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // Mailtrap luôn false
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify SMTP
transporter.verify((error) => {
    if (error) {
        console.error('❌ Email config error:', error);
    } else {
        console.log('✅ Email service is ready');
    }
});

const sendEmail = async (to, subject, html) => {
    return transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Celestia" <no-reply@celestia.dev>',
        to,
        subject,
        html,
    });
};

console.log({
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS ? 'OK' : 'MISSING',
});


module.exports = { sendEmail };
