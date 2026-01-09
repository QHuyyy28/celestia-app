# 🚀 HƯỚNG DẪN DEPLOY PRODUCTION

## ⚠️ QUAN TRỌNG - Cấu hình biến môi trường

### Frontend (Vercel/Netlify)

Khi deploy trên Vercel hoặc hosting khác, **BẮT BUỘC** phải cấu hình biến môi trường:

**Cách 1: Dùng file `.env.production`** (khuyến nghị)
- Copy file `.env.production` vào server
- File này đã có sẵn cấu hình production

**Cách 2: Cấu hình trên Dashboard**
- Vào dashboard Vercel/Netlify
- Thêm Environment Variable:
  ```
  VITE_API_URL=https://celestia-backend.onrender.com/api
  ```

### Backend (Render.com)

Đảm bảo các biến môi trường sau được cấu hình trên Render:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/celestia_db
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://celestia.id.vn
```

## 🔧 Kiểm tra sau deploy

1. Mở Developer Console (F12) trên celestia.id.vn
2. Kiểm tra tab Console, phải thấy:
   ```
   Using VITE_API_URL: https://celestia-backend.onrender.com/api
   Final API_BASE_URL: https://celestia-backend.onrender.com/api
   ```
3. Kiểm tra tab Network, API calls phải gọi đến `celestia-backend.onrender.com`

## 📝 Build & Deploy

```bash
# Build frontend
cd frontend
npm run build

# Deploy (tự động build nếu dùng Vercel/Netlify)
git add .
git commit -m "Fix production API URL"
git push
```

## 🐛 Debug

Nếu vẫn lỗi "Unable to load products":
1. Kiểm tra backend có đang chạy: https://celestia-backend.onrender.com/api/products/featured
2. Kiểm tra CORS trong backend server.js có `celestia.id.vn`
3. Xóa cache browser (Ctrl+Shift+Delete)
4. Kiểm tra biến môi trường đã set đúng chưa
