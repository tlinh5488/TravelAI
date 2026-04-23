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
│   ├── schema.sql
│   └── migrations/
│       └── 2026_04_23_add_vr_scene.sql
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── vtour/
│   ├── index.html
│   ├── tour.xml
│   ├── skin/
│   ├── plugins/
│   └── panos/
└── index.php
```

## Cách chạy

1. Đặt source tại `C:\xampp\htdocs\TravelAI`.
2. Mở `phpMyAdmin`, import file `database/schema.sql`.
3. Nếu bạn đã có DB cũ, chạy thêm `database/migrations/2026_04_23_add_vr_scene.sql`.
4. Đảm bảo MySQL user `root` password rỗng (hoặc sửa trong `backend/config/database.php`).
5. Truy cập:
   - `http://localhost/TravelAI/` (tự chuyển về frontend).

## VR360 krpano + hotspot

- Hệ thống ưu tiên `places.vr_url` nếu có.
- Nếu `vr_url` rỗng, hệ thống tự mở `vtour/index.html?startscene=<vr_scene>`.
- Hotspot điều hướng scene được lấy từ `vtour/tour.xml` (đã có sẵn).

Cập nhật scene cho từng địa điểm:

```sql
UPDATE places SET vr_scene = 'scene_thanhpho360' WHERE slug = 'ghenh-rang';
```
