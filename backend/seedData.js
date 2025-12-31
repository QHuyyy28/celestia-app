const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Blog = require('./models/Blog');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        // ============================================
        // 1. XÓA DỮ LIỆU CŨ
        // ============================================
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
        await Blog.deleteMany();

        console.log('🗑️  Đã xóa dữ liệu cũ');

        // ============================================
        // 2. TẠO USERS
        // ============================================
        const users = await User.create([
            {
                name: 'Admin',
                email: 'admin@example.com',
                password: '123456',
                role: 'admin',
                phone: '0901234567',
                address: '123 Đường ABC, Quận 1, TP.HCM'
            },
            {
                name: 'Nguyễn Văn A',
                email: 'user@example.com',
                password: '123456',
                role: 'user',
                phone: '0912345678',
                address: '456 Đường XYZ, Quận 3, TP.HCM'
            },
            {
                name: 'Trần Thị B',
                email: 'user2@example.com',
                password: '123456',
                role: 'user',
                phone: '0923456789',
                address: '789 Đường DEF, Quận 5, TP.HCM'
            }
        ]);

        console.log('✅ Đã tạo 3 Users');

        // ============================================
        // 3. TẠO CATEGORIES
        // ============================================
        const categories = await Category.create([
            {
                name: 'Điện thoại',
                description: 'Điện thoại thông minh các loại',
                image: 'https://via.placeholder.com/300/0000FF/FFFFFF?text=Dien+Thoai'
            },
            {
                name: 'Laptop',
                description: 'Laptop văn phòng, gaming, đồ họa',
                image: 'https://via.placeholder.com/300/FF0000/FFFFFF?text=Laptop'
            },
            {
                name: 'Phụ kiện',
                description: 'Tai nghe, sạc, ốp lưng, bao da',
                image: 'https://via.placeholder.com/300/00FF00/FFFFFF?text=Phu+Kien'
            },
            {
                name: 'Tablet',
                description: 'Máy tính bảng iPad, Samsung',
                image: 'https://via.placeholder.com/300/FFFF00/000000?text=Tablet'
            }
        ]);

        console.log('✅ Đã tạo 4 Categories');

        // ============================================
        // 4. TẠO PRODUCTS
        // ============================================
        const products = await Product.create([
            {
                name: 'iPhone 15 Pro Max',
                description: 'Điện thoại iPhone 15 Pro Max 256GB - Titan Tự Nhiên. Chip A17 Pro, Camera 48MP, màn hình Super Retina XDR 6.7 inch',
                price: 15000,
                comparePrice: 20000,
                category: categories[0]._id,
                stock: 50,
                images: [
                    'https://via.placeholder.com/500/0000FF/FFFFFF?text=iPhone+15+Pro',
                    'https://via.placeholder.com/500/0000AA/FFFFFF?text=iPhone+Back'
                ],
                featured: true,
                rating: 4.8,
                numReviews: 127,
                specifications: {
                    'Màn hình': '6.7 inch, Super Retina XDR',
                    'Chip': 'Apple A17 Pro',
                    'RAM': '8GB',
                    'Bộ nhớ': '256GB',
                    'Camera': '48MP + 12MP + 12MP',
                    'Pin': '4422 mAh'
                }
            },
            {
                name: 'Samsung Galaxy S24 Ultra',
                description: 'Samsung Galaxy S24 Ultra 512GB - Titan Gray. Snapdragon 8 Gen 3, Camera 200MP, màn hình Dynamic AMOLED 2X',
                price: 12000,
                comparePrice: 18000,
                category: categories[0]._id,
                stock: 35,
                images: [
                    'https://via.placeholder.com/500/FF0000/FFFFFF?text=Galaxy+S24',
                    'https://via.placeholder.com/500/AA0000/FFFFFF?text=S24+Back'
                ],
                featured: true,
                rating: 4.7,
                numReviews: 89
            },
            {
                name: 'MacBook Pro M3 16 inch',
                description: 'MacBook Pro M3 16GB 512GB - Space Gray. Chip M3 mạnh mẽ, màn hình Liquid Retina XDR, thời lượng pin 22 giờ',
                price: 20000,
                comparePrice: 25000,
                category: categories[1]._id,
                stock: 20,
                images: [
                    'https://via.placeholder.com/500/888888/FFFFFF?text=MacBook+Pro',
                    'https://via.placeholder.com/500/666666/FFFFFF?text=MacBook+Side'
                ],
                featured: true,
                rating: 5.0,
                numReviews: 56
            },
            {
                name: 'Dell XPS 15',
                description: 'Dell XPS 15 - Intel Core i7-13700H, RAM 16GB, SSD 512GB, RTX 4050, màn hình 15.6 inch FHD+',
                price: 18000,
                comparePrice: 22000,
                category: categories[1]._id,
                stock: 15,
                images: ['https://via.placeholder.com/500/0066CC/FFFFFF?text=Dell+XPS'],
                featured: false,
                rating: 4.6,
                numReviews: 34
            },
            {
                name: 'AirPods Pro Gen 2',
                description: 'Tai nghe Apple AirPods Pro Gen 2 - Chống ồn chủ động, âm thanh Adaptive, cổng sạc USB-C',
                price: 10000,
                comparePrice: 15000,
                category: categories[2]._id,
                stock: 100,
                images: ['https://via.placeholder.com/500/FFFFFF/000000?text=AirPods+Pro'],
                featured: false,
                rating: 4.9,
                numReviews: 203
            },
            {
                name: 'iPad Pro M2 11 inch',
                description: 'iPad Pro M2 11 inch 128GB WiFi - Space Gray. Chip M2, màn hình Liquid Retina',
                price: 15000,
                comparePrice: 20000,
                category: categories[3]._id,
                stock: 25,
                images: ['https://via.placeholder.com/500/333333/FFFFFF?text=iPad+Pro'],
                featured: true,
                rating: 4.8,
                numReviews: 71
            }
        ]);

        console.log('✅ Đã tạo 6 Products');

        // ============================================
        // 5. TẠO ORDERS (QUAN TRỌNG!)
        // ============================================
        const orders = await Order.create([
            {
                user: users[1]._id, // User "Nguyễn Văn A"
                orderItems: [
                    {
                        product: products[0]._id, // iPhone 15 Pro Max
                        name: products[0].name,
                        quantity: 1,
                        price: products[0].price,
                        image: products[0].images[0]
                    },
                    {
                        product: products[4]._id, // AirPods Pro
                        name: products[4].name,
                        quantity: 2,
                        price: products[4].price,
                        image: products[4].images[0]
                    }
                ],
                shippingAddress: {
                    fullName: 'Nguyễn Văn A',
                    phone: '0912345678',
                    address: '456 Đường XYZ',
                    district: 'Quận 3',
                    province: 'TP.HCM',
                    postalCode: '70000'
                },
                paymentMethod: 'VietQR',
                itemsPrice: 15000 + (10000 * 2),
                shippingPrice: 30000,
                totalPrice: 15000 + (10000 * 2) + 30000,
                isPaid: true,
                paidAt: new Date(),
                status: 'delivered'
            },
            {
                user: users[2]._id, // User "Trần Thị B"
                orderItems: [
                    {
                        product: products[2]._id, // MacBook Pro
                        name: products[2].name,
                        quantity: 1,
                        price: products[2].price,
                        image: products[2].images[0]
                    }
                ],
                shippingAddress: {
                    fullName: 'Trần Thị B',
                    phone: '0923456789',
                    address: '789 Đường DEF',
                    district: 'Quận 5',
                    province: 'TP.HCM',
                    postalCode: '70000'
                },
                paymentMethod: 'COD',
                itemsPrice: 20000,
                shippingPrice: 0, // Miễn phí ship
                totalPrice: 20000,
                isPaid: false,
                status: 'processing'
            },
            {
                user: users[1]._id,
                orderItems: [
                    {
                        product: products[5]._id, // iPad Pro
                        name: products[5].name,
                        quantity: 1,
                        price: products[5].price,
                        image: products[5].images[0]
                    }
                ],
                shippingAddress: {
                    fullName: 'Nguyễn Văn A',
                    phone: '0912345678',
                    address: '456 Đường XYZ',
                    district: 'Quận 3',
                    province: 'TP.HCM',
                    postalCode: '70000'
                },
                paymentMethod: 'COD',
                itemsPrice: 15000,
                shippingPrice: 30000,
                totalPrice: 15000 + 30000,
                isPaid: true,
                paidAt: new Date(),
                status: 'shipped'
            }
        ]);

        console.log('✅ Đã tạo 3 Orders');

        // ============================================
        // 6. TẠO BLOGS (QUAN TRỌNG!)
        // ============================================
        const blogs = await Blog.create([
            {
                title: '5 lý do nên mua iPhone 15 Pro Max năm 2024',
                content: `
          <h2>iPhone 15 Pro Max - Chiếc điện thoại đáng mua nhất năm</h2>
          <p>iPhone 15 Pro Max đã chính thức ra mắt với nhiều cải tiến vượt trội...</p>
          <h3>1. Chip A17 Pro mạnh mẽ</h3>
          <p>Chip A17 Pro được sản xuất trên tiến trình 3nm, mang lại hiệu năng vượt trội...</p>
          <h3>2. Camera 48MP chất lượng</h3>
          <p>Hệ thống camera 3 ống kính với cảm biến chính 48MP...</p>
        `,
                excerpt: 'Khám phá 5 lý do tại sao iPhone 15 Pro Max là chiếc điện thoại đáng mua nhất trong năm 2024',
                image: 'https://via.placeholder.com/800/0000FF/FFFFFF?text=iPhone+15+Blog',
                author: users[0]._id, // Admin
                category: 'Công nghệ',
                tags: ['iPhone', 'Apple', 'Điện thoại'],
                published: true,
                views: 1523
            },
            {
                title: 'So sánh MacBook Pro M3 vs Dell XPS 15',
                content: `
          <h2>Cuộc chiến giữa hai laptop cao cấp</h2>
          <p>MacBook Pro M3 và Dell XPS 15 đều là những chiếc laptop cao cấp...</p>
          <h3>Hiệu năng</h3>
          <p>MacBook Pro M3 với chip Apple Silicon vượt trội về hiệu năng...</p>
          <h3>Thiết kế</h3>
          <p>Cả hai đều có thiết kế sang trọng, bền bỉ...</p>
        `,
                excerpt: 'So sánh chi tiết giữa MacBook Pro M3 và Dell XPS 15 - Nên chọn laptop nào?',
                image: 'https://via.placeholder.com/800/888888/FFFFFF?text=MacBook+vs+Dell',
                author: users[0]._id,
                category: 'Review',
                tags: ['MacBook', 'Dell', 'Laptop', 'So sánh'],
                published: true,
                views: 892
            },
            {
                title: 'Top 5 phụ kiện cần có cho iPhone',
                content: `
          <h2>Những phụ kiện không thể thiếu</h2>
          <p>Sau khi mua iPhone, bạn cần trang bị những phụ kiện sau...</p>
          <ol>
            <li>AirPods Pro - Tai nghe chống ồn</li>
            <li>Ốp lưng chống sốc</li>
            <li>Cường lực bảo vệ màn hình</li>
            <li>Sạc nhanh 20W</li>
            <li>Gậy chụp ảnh Bluetooth</li>
          </ol>
        `,
                excerpt: 'Danh sách 5 phụ kiện cần thiết nhất cho người dùng iPhone',
                image: 'https://via.placeholder.com/800/00FF00/000000?text=iPhone+Accessories',
                author: users[0]._id,
                category: 'Hướng dẫn',
                tags: ['Phụ kiện', 'iPhone', 'AirPods'],
                published: true,
                views: 654
            },
            {
                title: 'Cách chọn laptop phù hợp với nhu cầu',
                content: `
          <h2>Hướng dẫn chọn laptop</h2>
          <p>Việc chọn laptop phù hợp phụ thuộc vào nhiều yếu tố...</p>
        `,
                excerpt: 'Hướng dẫn chi tiết cách chọn laptop phù hợp với từng nhu cầu sử dụng',
                image: 'https://via.placeholder.com/800/FF6600/FFFFFF?text=Laptop+Guide',
                author: users[0]._id,
                category: 'Hướng dẫn',
                tags: ['Laptop', 'Hướng dẫn'],
                published: false, // Bài nháp
                views: 0
            }
        ]);

        console.log('✅ Đã tạo 4 Blogs');

        // ============================================
        // 7. THỐNG KÊ
        // ============================================
        console.log('\n📊 TỔNG KẾT:');
        console.log('='.repeat(50));
        console.log(`👥 Users: ${users.length}`);
        console.log(`📁 Categories: ${categories.length}`);
        console.log(`📦 Products: ${products.length}`);
        console.log(`🛒 Orders: ${orders.length}`);
        console.log(`📝 Blogs: ${blogs.length}`);
        console.log('='.repeat(50));
        console.log('🎉 Hoàn thành! Tất cả dữ liệu mẫu đã được tạo');

        process.exit();
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

connectDB();
seedData();