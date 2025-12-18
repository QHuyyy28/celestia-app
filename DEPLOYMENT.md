# 🚀 HƯỚNG DẪN DEPLOY DỰ ÁN CELESTIA

## ✅ Checklist Deploy

### 1. Database Setup (MongoDB Atlas)
- [ ] Tạo tài khoản MongoDB Atlas
- [ ] Tạo Cluster miễn phí
- [ ] Tạo Database User (username/password)
- [ ] Whitelist IP: 0.0.0.0/0
- [ ] Copy Connection String

### 2. Backend Deploy (Render.com)
- [ ] Push code lên GitHub
- [ ] Tạo Web Service trên Render
- [ ] Cấu hình Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Thêm Environment Variables:
  - `MONGO_URI`: MongoDB connection string
  - `JWT_SECRET`: chuỗi bí mật (ví dụ: myJWT2025SecretKey!@#)
  - `PORT`: 5000
  - `NODE_ENV`: production
  - `FRONTEND_URL`: URL frontend sau khi deploy
- [ ] Deploy và lấy Backend URL

### 3. Frontend Deploy (Vercel)
- [ ] Cập nhật file api.js đã xong ✓
- [ ] Deploy trên Vercel
- [ ] Cấu hình Root Directory: `frontend`
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Thêm Environment Variables:
  - `VITE_API_URL`: Backend URL + `/api`
- [ ] Deploy và lấy Frontend URL

### 4. Cấu hình CORS
- [ ] Update `FRONTEND_URL` trên Render với URL Vercel
- [ ] Redeploy backend trên Render

### 5. Custom Domain
- [ ] Thêm domain trên Vercel Settings → Domains
- [ ] Cấu hình DNS tại nhà cung cấp domain:
  - A Record hoặc CNAME Record
  - Trỏ về Vercel servers
- [ ] Đợi DNS propagate (5-48 giờ)
- [ ] Update `FRONTEND_URL` với domain mới
- [ ] Kiểm tra SSL certificate tự động

### 6. Seed Data (Optional)
- [ ] Nếu cần data mẫu, chạy seedData.js local và data sẽ lên MongoDB Atlas

### 7. Testing
- [ ] Test đăng ký/đăng nhập
- [ ] Test các API endpoints
- [ ] Test responsive trên mobile
- [ ] Test HTTPS hoạt động
- [ ] Test CORS không bị lỗi

## 📝 Environment Variables Summary

### Backend (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/celestia?retryWrites=true&w=majority
JWT_SECRET=myJWT2025SecretKey!@#
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env)
```
VITE_API_URL=https://celestia-backend.onrender.com/api
```

## 🔗 URLs Template

- MongoDB Atlas: https://cloud.mongodb.com
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Backend URL: `https://your-backend.onrender.com`
- Frontend URL: `https://your-domain.com`

## ⚠️ Lưu ý quan trọng

1. **Free Tier Render**: Backend sẽ sleep sau 15 phút không hoạt động, request đầu tiên sẽ mất 30-50 giây để wake up

2. **CORS**: Nhớ cập nhật FRONTEND_URL sau khi có domain chính thức

3. **MongoDB Connection String**: 
   - Thay `<username>` và `<password>` bằng user đã tạo
   - Thay `<dbname>` thành tên database (ví dụ: celestia)

4. **JWT_SECRET**: Tạo một chuỗi ngẫu nhiên mạnh, không được để lộ

5. **DNS Propagation**: Có thể mất vài giờ đến 48 giờ để domain hoạt động toàn cầu

6. **SSL Certificate**: Vercel tự động cấp SSL miễn phí cho custom domain

## 🆘 Troubleshooting

### Lỗi CORS
- Kiểm tra `FRONTEND_URL` trên Render
- Kiểm tra CORS config trong server.js

### Backend không kết nối MongoDB
- Kiểm tra `MONGO_URI` đúng format
- Kiểm tra Network Access trên MongoDB Atlas (0.0.0.0/0)
- Kiểm tra Database User có quyền read/write

### Frontend không gọi được API
- Kiểm tra `VITE_API_URL` trên Vercel
- Check Network tab trong DevTools
- Kiểm tra Backend có đang chạy không

### Domain không hoạt động
- Đợi DNS propagate (có thể mất 48 giờ)
- Kiểm tra DNS config bằng: https://dnschecker.org
- Verify domain trên Vercel

## 📚 Tài liệu tham khảo

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Chúc bạn deploy thành công! 🎉**
