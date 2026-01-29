# Hướng dẫn Upload Ảnh Sản Phẩm lên MongoDB Atlas

## 🎯 Tổng quan
App đã được setup để upload ảnh lên **Cloudinary** (cloud storage miễn phí), sau đó lưu URL vào MongoDB Atlas. Đây là best practice cho production.

## 📋 Bước 1: Đăng ký Cloudinary (MIỄN PHÍ)

1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí (có 25GB storage & 25GB bandwidth/tháng)
3. Sau khi đăng ký, vào Dashboard: https://console.cloudinary.com/console
4. Copy 3 thông tin sau:
   - **Cloud Name**: (Ví dụ: celestia-shop)
   - **API Key**: (Ví dụ: 123456789012345)
   - **API Secret**: (Ví dụ: abcdefghijklmnopqrstuvwxyz)

## 📋 Bước 2: Cấu hình Backend

Mở file `backend/.env` và điền thông tin Cloudinary:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = your_cloud_name_here
CLOUDINARY_API_KEY = your_api_key_here  
CLOUDINARY_API_SECRET = your_api_secret_here
```

**Ví dụ thực tế:**
```env
CLOUDINARY_CLOUD_NAME = celestia-shop
CLOUDINARY_API_KEY = 123456789012345
CLOUDINARY_API_SECRET = abcXYZ123randomString
```

## 🚀 Bước 3: Sử dụng trong Code

### A. Upload từ Frontend (React Component)

```jsx
import ImageUploader from '../components/ImageUploader';

function ProductForm() {
    const [images, setImages] = useState([]);

    const handleImagesUploaded = (uploadedImages) => {
        setImages(uploadedImages);
        console.log('Uploaded images:', uploadedImages);
    };

    return (
        <form>
            <ImageUploader 
                onImagesUploaded={handleImagesUploaded}
                maxImages={5}
                existingImages={images}
            />
            {/* Rest of form */}
        </form>
    );
}
```

### B. Upload bằng API trực tiếp (Postman/Thunder Client)

**Endpoint:** `POST http://localhost:5000/api/upload/product-images`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**
```
images: [file1.jpg]
images: [file2.jpg]
images: [file3.jpg]
```

**Response:**
```json
{
    "success": true,
    "message": "Upload thành công 3 ảnh",
    "data": {
        "images": [
            "https://res.cloudinary.com/celestia-shop/image/upload/v1234567890/celestia/products/abc123.jpg",
            "https://res.cloudinary.com/celestia-shop/image/upload/v1234567890/celestia/products/def456.jpg",
            "https://res.cloudinary.com/celestia-shop/image/upload/v1234567890/celestia/products/ghi789.jpg"
        ],
        "count": 3
    }
}
```

### C. Tạo sản phẩm với ảnh đã upload

**Endpoint:** `POST http://localhost:5000/api/products`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
    "name": "Bánh Kem Sinh Nhật",
    "description": "Bánh kem tươi ngon, trang trí hoa quả và socola",
    "price": 250000,
    "comparePrice": 300000,
    "stock": 10,
    "category": "6594d8e1a85c5503049f5e1b",
    "images": [
        "https://res.cloudinary.com/celestia-shop/image/upload/v1234567890/celestia/products/abc123.jpg",
        "https://res.cloudinary.com/celestia-shop/image/upload/v1234567890/celestia/products/def456.jpg"
    ],
    "featured": true
}
```

## 📱 Bước 4: Test Upload

### Option 1: Dùng Thunder Client (VS Code Extension)

1. Cài extension "Thunder Client"
2. Tạo request mới:
   - Method: POST
   - URL: `http://localhost:5000/api/upload/product-images`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Body > Form: Chọn "Form-Data"
     - Key: `images` (type: File)
     - Value: Chọn ảnh từ máy tính
   - Click Send

### Option 2: Dùng Frontend Component

1. Vào trang Admin > Product Management
2. Click "Thêm sản phẩm mới"
3. Kéo thả hoặc click chọn ảnh trong ImageUploader
4. Ảnh sẽ tự động upload lên Cloudinary
5. Điền thông tin còn lại và Submit

## 🎨 Với 3 ảnh bánh bạn đã chụp

Để upload 3 ảnh bánh đó:

1. **Cách nhanh nhất - Dùng Postman/Thunder Client:**
   ```
   POST http://localhost:5000/api/upload/product-images
   Authorization: Bearer YOUR_TOKEN
   
   Form-data:
   images: cake1.jpg
   images: cake2.jpg  
   images: cake3.jpg
   ```

2. **Copy URLs từ response và tạo sản phẩm:**
   ```json
   POST http://localhost:5000/api/products
   {
       "name": "Bánh Kem Valentine",
       "description": "Bánh kem trang trí hoa hồng và socola",
       "price": 350000,
       "stock": 5,
       "images": [
           "https://res.cloudinary.com/...cake1.jpg",
           "https://res.cloudinary.com/...cake2.jpg",
           "https://res.cloudinary.com/...cake3.jpg"
       ]
   }
   ```

## 🔧 Troubleshooting

### Lỗi: "Invalid API credentials"
- Kiểm tra lại Cloud Name, API Key, API Secret trong `.env`
- Restart backend server sau khi thay đổi `.env`

### Lỗi: "File too large"
- Ảnh phải < 5MB
- Resize ảnh trước khi upload

### Lỗi: "Only Admin can upload"
- Phải login với account role='admin'
- Check token trong localStorage

## 💡 Tips

1. **Tối ưu ảnh trước khi upload:**
   - Dùng TinyPNG.com để giảm dung lượng
   - Recommended: 1200x1200px, < 1MB

2. **Ảnh đầu tiên trong array sẽ là ảnh chính (thumbnail)**

3. **Cloudinary tự động optimize:**
   - Tự động resize về 1200x1200px max
   - Tự động chọn quality phù hợp
   - Tự động convert sang WebP nếu browser support

4. **View ảnh đã upload:**
   - Vào Cloudinary Dashboard > Media Library
   - Folder: `celestia/products`

## 📊 MongoDB Atlas sẽ lưu gì?

Trong collection `products`:
```json
{
    "_id": "6594d8e1a85c5503049f5e24",
    "name": "Bánh Kem Valentine",
    "description": "...",
    "price": 350000,
    "images": [
        "https://res.cloudinary.com/celestia-shop/image/upload/v1738123456/celestia/products/xyz123.jpg",
        "https://res.cloudinary.com/celestia-shop/image/upload/v1738123457/celestia/products/xyz124.jpg"
    ]
}
```

**Lưu ý:** MongoDB chỉ lưu URLs (strings), không lưu binary data của ảnh.

## 🎯 Next Steps

1. Đăng ký Cloudinary
2. Điền credentials vào `.env`
3. Restart backend: `npm run dev`
4. Test upload với Thunder Client
5. Upload 3 ảnh bánh của bạn
6. Tạo product với URLs đã upload

## 📞 Cần hỗ trợ?

Nếu gặp lỗi, check:
- Backend logs trong terminal
- Network tab trong Browser DevTools
- Cloudinary Dashboard > Usage & Analytics
