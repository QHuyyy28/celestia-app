/**
 * Script test upload ảnh sản phẩm lên Cloudinary
 * 
 * Cách dùng:
 * 1. Đảm bảo backend đang chạy (npm run dev)
 * 2. Thay YOUR_JWT_TOKEN bằng token của admin
 * 3. Thay đường dẫn ảnh
 * 4. Chạy: node test-upload-images.js
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// ===== CẤU HÌNH =====
const API_URL = 'http://localhost:5000';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Lấy từ localStorage sau khi login

// Đường dẫn đến ảnh cần upload (thay đổi theo máy bạn)
const imagePaths = [
    'C:/Users/YourName/Pictures/cake1.jpg',
    'C:/Users/YourName/Pictures/cake2.jpg',
    'C:/Users/YourName/Pictures/cake3.jpg'
];

// ===== FUNCTIONS =====

async function uploadImages() {
    console.log('🚀 Bắt đầu upload ảnh...\n');

    try {
        // Tạo FormData
        const formData = new FormData();
        
        // Thêm các file vào FormData
        for (const imagePath of imagePaths) {
            if (!fs.existsSync(imagePath)) {
                console.log(`❌ File không tồn tại: ${imagePath}`);
                continue;
            }

            const fileStream = fs.createReadStream(imagePath);
            const fileName = path.basename(imagePath);
            formData.append('images', fileStream, fileName);
            console.log(`📎 Đã thêm file: ${fileName}`);
        }

        console.log('\n⏳ Đang upload...');

        // Gửi request
        const response = await fetch(`${API_URL}/api/upload/product-images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            console.log('\n✅ Upload thành công!\n');
            console.log(`📊 Số ảnh: ${result.data.count}`);
            console.log('\n🔗 URLs của ảnh:\n');
            result.data.images.forEach((url, index) => {
                console.log(`${index + 1}. ${url}`);
            });

            console.log('\n📋 Copy đoạn JSON này để tạo product:');
            console.log(JSON.stringify({
                name: "Tên sản phẩm",
                description: "Mô tả sản phẩm",
                price: 250000,
                stock: 10,
                images: result.data.images
            }, null, 2));

        } else {
            console.log('\n❌ Upload thất bại!');
            console.log('Lỗi:', result.message);
        }

    } catch (error) {
        console.error('\n❌ Lỗi khi upload:', error.message);
        
        if (error.message.includes('ENOENT')) {
            console.log('\n💡 Tip: Kiểm tra lại đường dẫn file ảnh');
        } else if (error.message.includes('fetch')) {
            console.log('\n💡 Tip: Kiểm tra backend có đang chạy không (http://localhost:5000)');
        } else if (error.message.includes('401')) {
            console.log('\n💡 Tip: JWT Token không hợp lệ hoặc đã hết hạn');
        }
    }
}

// ===== MAIN =====

console.log('╔════════════════════════════════════════╗');
console.log('║   TEST UPLOAD ẢNH LÊN CLOUDINARY       ║');
console.log('╚════════════════════════════════════════╝\n');

// Validate config
if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('❌ Vui lòng thay JWT_TOKEN trong file này!');
    console.log('💡 Cách lấy token:');
    console.log('   1. Mở frontend (http://localhost:3000)');
    console.log('   2. Login với tài khoản admin');
    console.log('   3. Mở DevTools > Console');
    console.log('   4. Chạy: localStorage.getItem("token")');
    console.log('   5. Copy token và paste vào file này\n');
    process.exit(1);
}

// Kiểm tra có file nào tồn tại không
const validFiles = imagePaths.filter(p => fs.existsSync(p));
if (validFiles.length === 0) {
    console.log('❌ Không có file nào tồn tại!');
    console.log('💡 Vui lòng thay đổi đường dẫn ảnh trong file này\n');
    console.log('Ví dụ:');
    console.log('const imagePaths = [');
    console.log('    "D:/Pictures/cake1.jpg",');
    console.log('    "D:/Pictures/cake2.jpg"');
    console.log('];\n');
    process.exit(1);
}

// Chạy upload
uploadImages();
