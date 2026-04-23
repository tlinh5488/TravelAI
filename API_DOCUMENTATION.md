# API DOCUMENTATION

## Base URL
```
http://localhost/TravelAI/backend/api/
```

## Authentication
Hiện tại API không yêu cầu authentication (user_id được truyền qua request)

---

## 📍 LOCATIONS API

### GET /locations.php
Lấy danh sách tất cả địa điểm

**Query Parameters:**
```
category=beach        // Filter theo category
search=bãi          // Search text
```

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kỳ Co",
      "slug": "ky-co",
      "description": "Bãi biển nước xanh...",
      "category": "beach",
      "latitude": 13.83,
      "longitude": 109.37,
      "rating": 4.8,
      "review_count": 230,
      "price_range": "< 100k",
      "image_url": "https://...",
      "thumbnail_url": "https://...",
      "vr360_url": "https://krpano.com/...",
      "address": "Xã Nhơn Hải, Quy Nhơn",
      "phone": "0254-3822522",
      "opening_hours": "06:00 - 18:00",
      "best_season": "March - September",
      "duration_hours": 3
    }
  ],
  "total": 6
}
```

**Example Requests:**
```bash
# Tất cả địa điểm
curl http://localhost/TravelAI/backend/api/locations.php

# Lọc biển
curl "http://localhost/TravelAI/backend/api/locations.php?category=beach"

# Tìm kiếm
curl "http://localhost/TravelAI/backend/api/locations.php?search=bãi"
```

---

## 📅 ITINERARY API

### GET /itinerary.php
Lấy danh sách lịch trình công khai

**Query Parameters:**
```
user_id=1        // Filter theo user
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Du lịch Quy Nhơn 3 ngày",
      "description": "Khám phá biển Quy Nhơn",
      "start_date": "2024-03-15",
      "end_date": "2024-03-18",
      "duration_days": 3,
      "budget": 5000000,
      "travel_style": "adventure",
      "is_public": false,
      "created_at": "2024-03-10 10:30:00"
    }
  ]
}
```

### GET /itinerary.php?id={id}
Lấy chi tiết lịch trình với các địa điểm

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Du lịch Quy Nhơn 3 ngày",
  "items": [
    {
      "id": 1,
      "itinerary_id": 1,
      "location_id": 1,
      "day_number": 1,
      "order_in_day": 1,
      "name": "Kỳ Co",
      "image_url": "https://...",
      "notes": "Bãi biển đẹp",
      "estimated_duration": 180,
      "arrival_time": "08:00:00",
      "departure_time": "11:00:00"
    }
  ]
}
```

### POST /itinerary.php
Tạo lịch trình mới

**Body:**
```json
{
  "title": "Du lịch Quy Nhơn 3 ngày",
  "description": "Khám phá biển Quy Nhơn",
  "duration_days": 3,
  "start_date": "2024-03-15",
  "end_date": "2024-03-18",
  "budget": 5000000,
  "travel_style": "adventure",
  "user_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Itinerary created",
  "id": 1
}
```

### PUT /itinerary.php?id={id}
Cập nhật lịch trình

**Body:**
```json
{
  "title": "Tên mới",
  "description": "Mô tả mới",
  "is_public": true
}
```

### DELETE /itinerary.php?id={id}
Xóa lịch trình

---

## 🎯 PLACES API

### POST /places.php
Thêm địa điểm vào lịch trình

**Body:**
```json
{
  "itinerary_id": 1,
  "location_id": 5,
  "day_number": 1,
  "notes": "Ghé thăm vào sáng"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location added to itinerary",
  "id": 1
}
```

### DELETE /places.php
Xóa địa điểm khỏi lịch trình

**Body:**
```json
{
  "item_id": 1
}
```

---

## 💬 CHAT API

### GET /chat.php
Lấy lịch sử chat

**Query Parameters:**
```
itinerary_id=1    // Lấy chat của lịch trình
user_id=1         // Hoặc lấy chat của user
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "user_id": 1,
      "itinerary_id": 1,
      "message_type": "user",
      "content": "Gợi ý địa điểm biển",
      "created_at": "2024-03-10 10:30:00"
    },
    {
      "id": 2,
      "user_id": 1,
      "itinerary_id": 1,
      "message_type": "assistant",
      "content": "Tôi gợi ý các địa điểm tuyệt vời: Kỳ Co, Eo Gió...",
      "created_at": "2024-03-10 10:31:00"
    }
  ]
}
```

### POST /chat.php
Gửi tin nhắn và nhận gợi ý từ AI

**Body:**
```json
{
  "message": "Gợi ý lịch trình 3 ngày biển",
  "days": 3,
  "priorities": ["beach", "temple"],
  "user_id": 1,
  "itinerary_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "assistant_reply": "Mình đã gợi ý lịch trình 3 ngày dựa trên yêu cầu: 'Gợi ý lịch trình 3 ngày biển'...",
  "itinerary": [
    {
      "day": 1,
      "places": [
        {
          "id": 1,
          "name": "Kỳ Co",
          "category": "beach",
          "rating": 4.8
        }
      ]
    }
  ]
}
```

---

## 🛣️ ROUTE API

### GET /route.php
Tìm tuyến đường giữa hai địa điểm

**Query Parameters:**
```
from=1              // ID địa điểm đi từ
to=2                // ID địa điểm đi tới
transport=car       // Loại phương tiện (car, bike, bus, walk)
```

**Response:**
```json
{
  "success": true,
  "from": {
    "id": 1,
    "name": "Kỳ Co",
    "latitude": 13.83,
    "longitude": 109.37
  },
  "to": {
    "id": 2,
    "name": "Eo Gió",
    "latitude": 13.82,
    "longitude": 109.37
  },
  "distance_km": 2.5,
  "duration_minutes": 5,
  "transport_type": "car",
  "route_coords": [
    {"lat": 13.83, "lng": 109.37},
    {"lat": 13.8250, "lng": 109.3710},
    ...
  ]
}
```

---

## 🔍 HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request successful |
| 201 | Created | POST successfully created |
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | Location ID doesn't exist |
| 405 | Method Not Allowed | PUT on GET-only endpoint |
| 500 | Server Error | Database connection failed |

---

## 📋 Error Response Format

```json
{
  "error": "Mô tả lỗi chi tiết"
}
```

**Example:**
```json
{
  "error": "Missing required fields"
}
```

---

## 🧪 Test API với cURL

```bash
# Test locations
curl http://localhost/TravelAI/backend/api/locations.php

# Test itinerary
curl "http://localhost/TravelAI/backend/api/itinerary.php?user_id=1"

# Test route
curl "http://localhost/TravelAI/backend/api/route.php?from=1&to=2&transport=car"

# Test chat (POST)
curl -X POST http://localhost/TravelAI/backend/api/chat.php \
  -H "Content-Type: application/json" \
  -d '{"message":"Gợi ý địa điểm biển","days":3,"priorities":["beach"],"user_id":1}'
```

---

## 📱 API Client Examples

### JavaScript (Axios)
```javascript
// GET Request
axios.get('http://localhost/TravelAI/backend/api/locations.php')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// POST Request
axios.post('http://localhost/TravelAI/backend/api/itinerary.php', {
  title: "Du lịch 3 ngày",
  duration_days: 3,
  user_id: 1
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

### Python (Requests)
```python
import requests

# GET
response = requests.get('http://localhost/TravelAI/backend/api/locations.php')
print(response.json())

# POST
response = requests.post('http://localhost/TravelAI/backend/api/itinerary.php', 
  json={
    'title': 'Du lịch 3 ngày',
    'duration_days': 3,
    'user_id': 1
  }
)
print(response.json())
```

---

**Tên API Documentation - v1.0**
