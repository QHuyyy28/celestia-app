const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const User = require('../models/User');

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy - Only initialize if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Kiểm tra xem user đã tồn tại với Google ID chưa
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // User đã tồn tại, return user
                return done(null, user);
            }

            // Kiểm tra xem email đã tồn tại chưa (user đăng ký bằng email/password trước đó)
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // User đã tồn tại với email này, link Google account
                user.googleId = profile.id;
                user.isGoogleAccount = true;
                user.isEmailVerified = true; // Google đã verify email rồi
                if (!user.avatar || user.avatar === 'https://via.placeholder.com/150') {
                    user.avatar = profile.photos[0]?.value || user.avatar;
                }
                await user.save();
                return done(null, user);
            }

            // Tạo user mới với Google account
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0]?.value || 'https://via.placeholder.com/150',
                isGoogleAccount: true,
                isEmailVerified: true, // Google đã verify email
                password: crypto.randomBytes(32).toString('hex') // Random password (sẽ không được sử dụng)
            });

            done(null, user);
        } catch (error) {
            console.error('Google OAuth Error:', error);
            done(error, null);
        }
    }));
    
    console.log('✓ Google OAuth Strategy initialized');
} else {
    console.log('⚠ Google OAuth not configured - login with Google disabled');
    console.log('  Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env to enable');
}

module.exports = passport;
