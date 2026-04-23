# TravelAI

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
│   └── src/
│       ├── app.js
│       └── styles.css
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
