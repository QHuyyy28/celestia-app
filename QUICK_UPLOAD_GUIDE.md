# ⚡ HƯỚNG DẪN NHANH - Upload Ảnh Lên MongoDB

## 🎯 Các Bước Thực Hiện

### 1️⃣ Đăng ký Cloudinary (1 phút)
- Vào: https://cloudinary.com/users/register/free
- Đăng ký FREE (không cần credit card)
- Vào Dashboard lấy: **Cloud Name**, **API Key**, **API Secret**

### 2️⃣ Config file `.env` (backend/.env)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3️⃣ Chạy Server
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 4️⃣ Upload Ảnh
Mở: **http://localhost:3000/test-upload**

1. Click "📁 Chọn ảnh" → Chọn ảnh từ máy (có thể chọn nhiều)
2. Click "🚀 Upload lên Cloudinary"
3. Đợi upload xong
4. Click "📋 Copy tất cả URLs"

### 5️⃣ Paste vào MongoDB Atlas
1. Vào: https://cloud.mongodb.com/
2. Browse Collections → products
3. Tìm product → Edit
4. Paste URLs vào field **images**:
```json
{
  "images": [
    "https://res.cloudinary.com/.../image1.jpg",
    "https://res.cloudinary.com/.../image2.jpg"
  ]
}
```
5. Click Update

### 6️⃣ Kiểm tra
Vào: http://localhost:3000/products → Xem ảnh hiển thị

---

## ❌ Lỗi thường gặp

**"Error configuring Cloudinary"**
→ Sai credentials trong .env → Restart backend

**"Cannot connect"**  
→ Backend chưa chạy → Check port 5000

**Ảnh không hiển thị**
→ Ctrl + F5 clear cache → Check URLs trong MongoDB

---

## ✅ Done!

Giờ ảnh của bạn sẽ load từ CDN Cloudinary, nhanh và tối ưu! 🎉
