# 📱 HƯỚNG DẪN SỬA LỖI QR CODE - QUÉT ĐƯỢC TỪ ĐIỆN THOẠI

## ❌ VẤN ĐỀ HIỆN TẠI:
- QR code chứa URL `localhost:5000` hoặc `127.0.0.1:5000`
- Khi quét từ điện thoại → **KHÔNG truy cập được** vì localhost chỉ có trên máy tính

## ✅ GIẢI PHÁP:

### 🎯 CÁCH 1: Deploy Backend lên Render (Production - Khuyến nghị)

1. **Deploy backend lên Render.com**
2. **Thêm biến môi trường** trong Render:
   ```
   BACKEND_URL=https://your-backend.onrender.com
   ```
3. **QR code sẽ có URL public**, quét từ bất kỳ đâu đều được!

---

### 🎯 CÁCH 2: Dùng Ngrok (Test nhanh trên local)

**Ngrok** tạo URL public tạm thời trỏ về máy local của bạn.

#### Bước 1: Cài đặt Ngrok
```bash
# Download: https://ngrok.com/download
# Hoặc dùng npm
npm install -g ngrok
```

#### Bước 2: Chạy Backend (port 5000)
```bash
cd backend
npm start
```

#### Bước 3: Mở Ngrok
```bash
# Mở terminal mới
ngrok http 5000
```

Ngrok sẽ cho bạn URL kiểu: `https://abc123.ngrok.io`

#### Bước 4: Cập nhật .env backend
```env
BACKEND_URL=https://abc123.ngrok.io
```

#### Bước 5: Restart backend
- Stop backend (Ctrl+C)
- Start lại: `npm start`

✅ **Giờ tạo QR → Quét từ điện thoại → Thấy hình/video/audio!**

---

### 🎯 CÁCH 3: Dùng LocalTunnel (Giống Ngrok, free không cần đăng ký)

```bash
# Cài localtunnel
npm install -g localtunnel

# Chạy backend
cd backend
npm start

# Mở terminal mới, tạo tunnel
lt --port 5000

# Sẽ có URL: https://random-name.loca.lt
```

Cập nhật `.env`:
```env
BACKEND_URL=https://random-name.loca.lt
```

---

### 🎯 CÁCH 4: Dùng IP local (Chỉ trong cùng mạng WiFi)

**Điều kiện**: Máy tính và điện thoại cùng mạng WiFi.

#### Bước 1: Tìm IP máy tính
```bash
# Windows
ipconfig
# Tìm IPv4 Address: 192.168.x.x

# Mac/Linux  
ifconfig
# Tìm inet: 192.168.x.x
```

#### Bước 2: Cập nhật .env
```env
BACKEND_URL=http://192.168.1.100:5000
```
(Thay `192.168.1.100` bằng IP của bạn)

#### Bước 3: Restart backend

✅ **Quét QR từ điện thoại (cùng WiFi) → Xem được!**

---

## 🔧 KIỂM TRA SAU KHI SỬA:

### 1. Tạo QR code mới
- Upload file hình/video/audio
- Check console backend, phải thấy:
  ```
  ✅ File uploaded: {
    qrUrl: 'https://abc123.ngrok.io/qr-viewer.html?file=...'
  }
  ```
- **KHÔNG được** thấy `localhost` hay `127.0.0.1`

### 2. Quét QR từ điện thoại
- Mở camera hoặc app quét QR
- Quét → Mở link
- **Phải hiện**: Hình ảnh/Video/Audio đã upload

---

## 📝 PRODUCTION SETUP (Deploy lên Render)

### Backend Render - Environment Variables:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://celestia.id.vn
BACKEND_URL=https://your-backend.onrender.com
```

### ⚠️ LƯU Ý:
- **Render free tier**: Backend sleep sau 15 phút không dùng → Lần đầu truy cập chậm
- **Ngrok free**: URL thay đổi mỗi lần restart
- **LocalTunnel**: URL random, có thể chọn tên cố định với `lt --port 5000 --subdomain yourname`

---

## 🐛 DEBUG:

### Nếu vẫn không quét được:

1. **Check console backend** khi upload file
2. **Copy URL trong QR** (dùng app đọc QR text)
3. **Paste URL vào browser điện thoại** → Xem có mở được không?
4. **Nếu không mở được** → Backend URL sai hoặc backend chưa chạy
5. **Check firewall** Windows có block port 5000 không

### Test backend có public không:
```bash
# Từ điện thoại, mở browser
# Truy cập: http://192.168.x.x:5000 (hoặc ngrok URL)
# Phải thấy: {"message": "Server is running!"}
```

---

## 🎉 KẾT QUẢ MONG MUỐN:

✅ Tạo QR với hình ảnh  
✅ Quét từ điện thoại → Hiện hình ngay  
✅ Tạo QR với video → Quét → Video play  
✅ Tạo QR với audio → Quét → Nghe nhạc  

Giống y hệt **me-qr.com**!
