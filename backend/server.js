const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const saleRoutes = require('./routes/saleRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const uploadSimpleRoutes = require('./routes/uploadSimpleRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load biến môi trường từ file .env
dotenv.config();

// Kết nối MongoDB
connectDB();

// Khởi tạo Express app
const app = express();

// Middleware
// Cấu hình CORS cho development và production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://celestia.id.vn',
      'https://www.celestia.id.vn'
    ];
    
    // Cho phép request không có origin (mobile apps, Postman, etc)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // Cho phép Frontend gọi API
app.use(express.json()); // Cho phép nhận dữ liệu JSON
app.use(express.urlencoded({ extended: true }));

// Session middleware (cần cho passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'celestia_secret_key_2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true nếu HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files (uploaded files và public folder)
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Route test đơn giản
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload-simple', uploadSimpleRoutes);
app.use('/api/admin', adminRoutes);

// Lấy PORT từ .env hoặc dùng 5000 mặc định
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handler middleware (bắt lỗi toàn cục)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Có lỗi xảy ra!',
    error: err.message
  });
});