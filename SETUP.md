# 🚀 HƯỚNG DẪN CÀI ĐẶT NHANH

## 1️⃣ CHUẨN BỊ

### Yêu cầu hệ thống
- ✅ XAMPP (hoặc Apache + PHP + MySQL)
- ✅ PHP 7.4 trở lên
- ✅ MySQL 5.7 trở lên
- ✅ Trình duyệt hiện đại (Chrome, Firefox, Edge)

### Download & Cài đặt
1. Download XAMPP từ https://www.apachefriends.org
2. Cài đặt vào `C:\xampp\`
3. Chạy XAMPP Control Panel

## 2️⃣ COPY DỰ ÁN

Sao chép toàn bộ thư mục TravelAI vào:
```
C:\xampp\htdocs\TravelAI\
```

## 3️⃣ TẠO DATABASE

### Cách 1: Dùng phpMyAdmin (Đơn Giản)
1. Mở trình duyệt: http://localhost/phpmyadmin
2. Click menu "MySQL" → "Import"
3. Chọn file: `C:\xampp\htdocs\TravelAI\database\schema.sql`
4. Click "Go"
5. ✅ Database đã tạo xong!

### Cách 2: Dùng Command Line
```bash
cd C:\xampp\mysql\bin
mysql -u root -p < "C:\xampp\htdocs\TravelAI\database\schema.sql"
# Nếu MySQL không có password, bỏ -p
mysql -u root < "C:\xampp\htdocs\TravelAI\database\schema.sql"
```

## 4️⃣ CẤU HÌNH

### Kiểm tra database.php
Mở file: `C:\xampp\htdocs\TravelAI\backend\config\database.php`

Kiểm tra các thông số (mặc định đã đúng):
```php
$host = '127.0.0.1';      // ✅ Đúng
$dbName = 'travel_ai';    // ✅ Đúng
$username = 'root';       // ✅ Đúng
$password = '';           // ✅ Mặc định trống
```

## 5️⃣ KHỞI ĐỘNG

### Bước 1: Start Apache & MySQL
1. Mở XAMPP Control Panel
2. Click **Start** cho Apache
3. Click **Start** cho MySQL
4. Chờ đến khi chuyển sang **green**

### Bước 2: Kiểm tra Database
Vào http://localhost/phpmyadmin
- Kiểm tra database `travel_ai` có xuất hiện không
- Kiểm tra các bảng trong database

### Bước 3: Truy cập Ứng Dụng
Mở trình duyệt vào địa chỉ:
```
http://localhost/TravelAI/frontend/index.html
```

## 6️⃣ KIỂM TRA VÀ SỬ DỤNG

### ✅ Kiểm tra hoạt động
1. Bản đồ có hiển thị không?
2. Các marker địa điểm có xuất hiện không?
3. Có thể tìm kiếm địa điểm không?
4. Chat AI có hoạt động không?

### 🎯 Bắt đầu sử dụng
1. **Khám phá**: Click vào các địa điểm trên bản đồ
2. **Xem VR**: Nhấp nút "Xem 360°"
3. **Tạo lịch**: Nhấp "Tạo Lịch Trình Mới"
4. **Chat AI**: Hỏi AI gợi ý du lịch

## ⚠️ LỖI THƯỜNG GẶP

### ❌ "Cannot connect to database"
**Giải pháp:**
1. Kiểm tra MySQL có chạy không (xanh trong XAMPP)
2. Kiểm tra database có tồn tại không (phpMyAdmin)
3. Kiểm tra username/password trong `config/database.php`

### ❌ "Không load được locations"
**Giải pháp:**
1. Mở F12 → Console xem error gì
2. Kiểm tra Apache có chạy không
3. Kiểm tra API URL: http://localhost/TravelAI/backend/api/locations.php

### ❌ "Bản đồ không hiển thị"
**Giải pháp:**
1. Kiểm tra kết nối internet (Leaflet cần CDN)
2. Mở F12 → Networks xem có error không
3. Thử F5 refresh lại trang

### ❌ "CORS Error"
**Giải pháp:**
1. Mở DevTools (F12)
2. Kiểm tra lỗi CORS
3. Kiểm tra API headers (đã cấu hình trong API files)

## 📝 ĐIỂM QUAN TRỌNG

- ⚠️ **Luôn start Apache & MySQL trước khi dùng**
- 🔐 **Password mặc định của MySQL là rỗng** (an toàn khi cài mới)
- 📍 **Đảm bảo dữ liệu sample đã được import**
- 🌐 **Cần internet để tải Leaflet maps**

## 🆘 CẦN GIÚP?

### Debug Mode
1. Mở `frontend/src/app.js`
2. Thêm: `console.log(response)` sau mỗi API call
3. Mở F12 → Console xem output

### Check Logs
```bash
# PHP Error Log
C:\xampp\apache\logs\error.log

# MySQL Log (nếu có)
C:\xampp\mysql\data\error.log
```

### Reset Database
Nếu có lỗi, reset database:
1. phpMyAdmin → Database `travel_ai` → **Drop**
2. Chạy lại import file schema.sql

---

**✅ Xong! Ứng dụng sẵn sàng sử dụng.**

Vui vẻ khám phá Travel AI! 🌍✈️
