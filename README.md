<<<<<<< Updated upstream
# TravelAI
NCKH project
=======
# 🌍 Travel AI - Trợ Lý Du Lịch Thông Minh

Một ứng dụng web du lịch hiện đại với AI Assistant tích hợp, hiển thị VR 360°, tạo lịch trình tự động, và quản lý địa điểm yêu thích.

## ✨ Tính Năng Chính

### 🗺️ **Bản Đồ Tương Tác**
- Hiển thị địa điểm du lịch trên bản đồ Leaflet
- Phân loại theo loại hình (biển, chùa, núi, thành phố)
- Tìm kiếm địa điểm theo tên hoặc mô tả
- Thông tin chi tiết địa điểm với đánh giá sao

### 📸 **Xem VR 360°**
- Tích hợp Krpano cho trải nghiệm VR toàn cảnh
- Xem VR trực tiếp trong modal
- Hỗ trợ xoay xem 360 độ

### 📅 **Tạo Lịch Trình Tự Động**
- AI Assistant gợi ý lịch trình dựa trên sở thích
- Tạo lịch trình cho 1-30 ngày
- Quản lý chi tiết từng ngày
- Thêm/xóa địa điểm linh hoạt

### 💬 **AI Chat Assistant**
- Chat thời gian thực với AI Assistant
- Nhận gợi ý địa điểm theo sở thích
- Tạo lịch trình tự động từ chat
- Lưu lịch sử chat

### ❤️ **Quản Lý Yêu Thích**
- Thêm/xóa địa điểm yêu thích
- Xem danh sách yêu thích
- Lưu trên local storage

### 🛣️ **Tìm Tuyến Đường**
- Tính toán khoảng cách giữa địa điểm
- Ước tính thời gian dựa trên loại phương tiện
- Hiển thị tuyến đường trên bản đồ

## 📁 Cấu Trúc Thư Mục

```
TravelAI/
├── backend/
│   ├── api/
│   │   ├── bootstrap.php          # Hàm hỗ trợ chung
│   │   ├── locations.php          # API địa điểm
│   │   ├── itinerary.php          # API lịch trình
│   │   ├── places.php             # API quản lý địa điểm
│   │   ├── chat.php               # API chat AI
│   │   └── route.php              # API tuyến đường
│   └── config/
│       └── database.php           # Cấu hình database
├── frontend/
│   ├── index.html                 # Trang chính
│   └── src/
│       ├── app.js                 # Logic ứng dụng
│       └── styles.css             # Styling
├── database/
│   └── schema.sql                 # Schema database
└── README.md
```

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu
- PHP 7.4+
- MySQL 5.7+
- XAMPP hoặc tương tự
- Modern web browser

### Bước 1: Clone/Copy Dự Án
```bash
# Copy vào thư mục htdocs của XAMPP
cp -r TravelAI c:\xampp\htdocs\
```

### Bước 2: Tạo Database
1. Mở phpMyAdmin: `http://localhost/phpmyadmin`
2. Tạo database mới tên `travel_ai`
3. Chọn database và import file `database/schema.sql`

Hoặc chạy trực tiếp trong MySQL:
```sql
mysql -u root -p < database/schema.sql
```

### Bước 3: Cấu Hình Database
Sửa file `backend/config/database.php` nếu cần:
```php
$host = '127.0.0.1';      // Địa chỉ server
$dbName = 'travel_ai';     // Tên database
$username = 'root';        // Username MySQL
$password = '';            // Password MySQL
```

### Bước 4: Khởi Động Server
```bash
# Nếu dùng XAMPP, mở XAMPP Control Panel và start Apache + MySQL

# Hoặc dùng PHP built-in server
cd c:\xampp\htdocs\TravelAI
php -S localhost:8000
```

### Bước 5: Truy Cập Ứng Dụng
Mở browser và vào: `http://localhost/TravelAI/frontend/index.html`

## 🎯 Hướng Dẫn Sử Dụng

### 1. Khám Phá Địa Điểm
- **Tab Bản Đồ**: Xem tất cả địa điểm trên bản đồ
- **Bộ Lọc**: Chọn loại hình (biển, chùa, v.v.)
- **Tìm Kiếm**: Nhập tên địa điểm

### 2. Xem Chi Tiết Địa Điểm
- Nhấp vào marker trên bản đồ
- Chi tiết hiển thị ở panel bên phải
- Nhấp "Xem 360°" để xem VR toàn cảnh

### 3. Tạo Lịch Trình
- Nhấp "Tạo Lịch Trình Mới"
- Nhập tên, số ngày, sở thích
- Chọn categories bạn quan tâm
- Nhấp "Tạo Lịch Trình"

### 4. Sử Dụng AI Assistant
- Tab "Chat AI" ở panel phải
- Nhập yêu cầu hoặc câu hỏi
- AI sẽ gợi ý địa điểm và lịch trình
- Địa điểm sẽ được thêm tự động

### 5. Quản Lý Yêu Thích
- Nhấp nút ❤️ trên chi tiết địa điểm
- Xem danh sách ở tab "Yêu Thích"

## 📊 API Documentation

### GET /backend/api/locations.php
Lấy danh sách địa điểm
```
?category=beach    # Lọc theo loại
?search=bãi        # Tìm kiếm
```

### GET /backend/api/itinerary.php?id={id}
Lấy chi tiết lịch trình

### POST /backend/api/itinerary.php
Tạo lịch trình mới
```json
{
  "title": "Du lịch Quy Nhơn 3 ngày",
  "duration_days": 3,
  "description": "Khám phá biển Quy Nhơn",
  "user_id": 1
}
```

### POST /backend/api/chat.php
Chat với AI
```json
{
  "message": "Gợi ý địa điểm biển",
  "days": 3,
  "priorities": ["beach"],
  "user_id": 1
}
```

### GET /backend/api/route.php
Lấy tuyến đường
```
?from=1&to=2&transport=car
```

## 🎨 Tùy Chỉnh

### Thay Đổi Dữ Liệu Địa Điểm
Sửa file `database/schema.sql` hoặc thêm dữ liệu trực tiếp qua phpMyAdmin

### Thay Đổi Màu Sắc
Sửa CSS variables trong `frontend/src/styles.css`:
```css
:root {
    --primary-color: #007AFF;
    --secondary-color: #5AC8FA;
    /* ... */
}
```

### Tích Hợp Krpano VR
1. Tạo VR tour trên Krpano
2. Upload lên server
3. Cập nhật URL trong database field `vr360_url`

## 🔧 Troubleshooting

### Lỗi Connection Refused
- Kiểm tra MySQL có chạy không
- Kiểm tra username/password trong `config/database.php`

### API không hoạt động
- Kiểm tra cors headers trong API files
- Mở DevTools (F12) xem console errors

### Bản đồ không hiển thị
- Kiểm tra CDN Leaflet có tải được không
- Kiểm tra console errors

### Database errors
- Chạy lại `database/schema.sql`
- Kiểm tra quyền truy cập database

## 📱 Responsive Design
- 📱 Mobile: Sidebar và right panel chuyển thành tabs
- 💻 Tablet: Bố cục linh hoạt
- 🖥️ Desktop: Bố cục full

## 🚀 Deployment

### Deploy lên hosting
1. Upload toàn bộ thư mục lên server
2. Import database schema
3. Cấu hình `backend/config/database.php`
4. Cấu hình domain trong `frontend/src/app.js`

### Environment Variables
```php
define('API_BASE', 'https://yourdomain.com/backend/api');
```

## 📝 License
MIT License - Tự do sử dụng và modify

## 👨‍💻 Support
Liên hệ để hỗ trợ kỹ thuật

## 🙏 Credits
- Leaflet Maps
- Krpano VR
- OpenStreetMap
- FontAwesome Icons

---

**Happy Traveling with Travel AI! 🌍✈️**

Web du lịch động theo kiến trúc `frontend + backend + database`, gồm:
- Bản đồ địa điểm và filter động từ database.
- Click địa điểm để mở thẻ thông tin, xem VR360 (link krpano), vẽ tuyến đường.
- Chat box sinh lịch trình tự động theo số ngày và ưu tiên.
- Nút "Thêm vào lịch trình" lưu vào DB theo session người dùng (không set cứng).

## Cấu trúc thư mục

```text
TravelAI/
├── backend/
│   ├── api/
│   │   ├── bootstrap.php
│   │   ├── chat.php
│   │   ├── itinerary.php
│   │   ├── places.php
│   │   └── route.php
│   └── config/
│       └── database.php
├── database/
│   └── schema.sql
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
└── index.php
```

## Cách chạy

1. Đặt source tại `C:\xampp\htdocs\TravelAI`.
2. Mở `phpMyAdmin`, import file `database/schema.sql`.
3. Đảm bảo MySQL user `root` password rỗng (hoặc sửa trong `backend/config/database.php`).
4. Truy cập:
   - `http://localhost/TravelAI/` (tự chuyển về frontend).

## Gắn link VR360 krpano thật

Trong bảng `places`, cập nhật cột `vr_url` theo từng điểm:

```sql
UPDATE places SET vr_url = 'https://your-krpano-tour-link' WHERE slug = 'ky-co';
```
>>>>>>> Stashed changes
