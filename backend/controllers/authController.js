const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService');

// Tạo JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token hết hạn sau 30 ngày
    });
};

// @desc    Đăng ký user mới
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Kiểm tra các field bắt buộc
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Tạo user mới
        const user = await User.create({
            name,
            email,
            password // Password sẽ tự động được hash bởi middleware trong User model
        });

        // Tạo verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 giờ
        await user.save();

        // Gửi email xác nhận
        try {
            await sendVerificationEmail(user, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Vẫn cho phép đăng ký dù email gửi không thành công
        }

        // Trả về thông tin user và token
        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công. Vui lòng check email để xác nhận tài khoản',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                avatar: user.avatar,
                isEmailVerified: user.isEmailVerified,
                isSubscribedToNotifications: user.isSubscribedToNotifications,
                createdAt: user.createdAt,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra email và password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        // Tìm user theo email (phải select password vì mặc định nó bị ẩn)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Đăng nhập thành công
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                avatar: user.avatar,
                isEmailVerified: user.isEmailVerified,
                isSubscribedToNotifications: user.isSubscribedToNotifications,
                createdAt: user.createdAt,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private (phải đăng nhập)
exports.getMe = async (req, res) => {
    try {
        // req.user được gán bởi middleware protect
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Cập nhật thông tin user
// @route   PUT /api/auth/update
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        // Cập nhật thông tin (chỉ cập nhật nếu có giá trị mới)
        if (name) user.name = name;
        if (phone !== undefined && phone !== '') user.phone = phone;
        if (address !== undefined && address !== '') user.address = address;

        await user.save();

        // Trả về user đầy đủ thông tin
        const userData = {
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            address: user.address,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isSubscribedToNotifications: user.isSubscribedToNotifications,
            createdAt: user.createdAt
        };

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Xác nhận email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token xác nhận không được tìm thấy'
            });
        }

        // Hash token để so sánh
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Tìm user có token này và token chưa hết hạn
        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Cập nhật user
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email xác nhận thành công. Bạn có thể đăng nhập ngay'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Quên mật khẩu - gửi email reset
// @route   POST /api/auth/forgot-password
// @access  Public
// exports.forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Vui lòng nhập email'
//             });
//         }

//         // Tìm user
//         const user = await User.findOne({ email });

//         if (!user) {
//             // Không tiết lộ email có tồn tại không
//             return res.status(200).json({
//                 success: true,
//                 message: 'Nếu email tồn tại, chúng tôi sẽ gửi link reset mật khẩu'
//             });
//         }

//         // Tạo reset token
//         const resetToken = crypto.randomBytes(32).toString('hex');
//         user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//         user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 giờ
//         await user.save();

//         // Gửi email
//         try {
//             await sendResetPasswordEmail(user, resetToken);
//         } catch (emailError) {
//             // Xóa token nếu gửi email thất bại
//             user.resetPasswordToken = undefined;
//             user.resetPasswordExpires = undefined;
//             await user.save();

//             return res.status(500).json({
//                 success: false,
//                 message: 'Không thể gửi email reset mật khẩu'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Chúng tôi đã gửi link reset mật khẩu đến email của bạn'
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: 'Lỗi server',
//             error: error.message
//         });
//     }
// };

exports.forgotPassword = async (req, res) => {
    try {
        // ✅ FIX QUAN TRỌNG
        if (!req.body || !req.body.email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email'
            });
        }

        const email = req.body.email;

        // Tìm user
        const user = await User.findOne({ email });

        // ⚠️ Không tiết lộ email có tồn tại hay không
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'Nếu email tồn tại, chúng tôi sẽ gửi link reset mật khẩu'
            });
        }

        // Tạo reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 giờ
        await user.save({ validateBeforeSave: false });

        // Gửi email
        try {
            await sendResetPasswordEmail(user, resetToken);
        } catch (emailError) {
            console.error('EMAIL ERROR:', emailError);

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Không thể gửi email reset mật khẩu',
                error: emailError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Chúng tôi đã gửi link reset mật khẩu đến email của bạn'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};


// @desc    Đặt lại mật khẩu
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp'
            });
        }

        // Hash token để so sánh
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Tìm user
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Cập nhật mật khẩu
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// @desc    Đăng xuất
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công'
    });
};
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        // Lấy user với password
        const user = await User.findById(req.user._id).select('+password');

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save(); // Sẽ tự động hash nhờ middleware

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};