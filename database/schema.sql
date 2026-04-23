CREATE DATABASE IF NOT EXISTS travel_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_ai;

CREATE TABLE IF NOT EXISTS places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  region VARCHAR(80) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
  ticket_price INT NOT NULL DEFAULT 0,
  image_url VARCHAR(255) NOT NULL,
  vr_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itinerary_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(80) NOT NULL,
  place_id INT NOT NULL,
  day_number TINYINT NOT NULL DEFAULT 1,
  order_in_day SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_itinerary_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);

INSERT INTO places (name, slug, description, category, region, latitude, longitude, rating, ticket_price, image_url, vr_url) VALUES
('Kỳ Co', 'ky-co', 'Bãi biển nước xanh và cát trắng nổi tiếng ở Quy Nhơn.', 'Biển', 'Khu Bắc', 13.8306700, 109.3659100, 4.8, 150000, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80', 'https://krpano.com'),
('Eo Gió', 'eo-gio', 'Danh thắng với vách đá và đường đi ven biển đẹp.', 'Check-in', 'Khu Bắc', 13.8254500, 109.3721800, 4.9, 25000, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80', 'https://krpano.com'),
('Ghềnh Ráng Tiên Sa', 'ghenh-rang', 'Quần thể du lịch sát biển, nổi tiếng với bãi tắm Hoàng Hậu.', 'Văn hóa', 'Trung tâm', 13.7514300, 109.2211000, 4.6, 20000, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', 'https://krpano.com'),
('Chùa Ông Núi', 'chua-ong-nui', 'Quần thể chùa với tượng Phật lớn và tầm nhìn toàn cảnh.', 'Văn hóa', 'Khu Nam', 13.6754800, 109.0524600, 4.5, 0, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80', 'https://krpano.com'),
('Tháp Đôi', 'thap-doi', 'Di tích Chăm pa ngay trung tâm thành phố.', 'Văn hóa', 'Trung tâm', 13.7863400, 109.2270900, 4.3, 20000, 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80', 'https://krpano.com'),
('Bãi biển Quy Nhơn', 'bai-bien-quy-nhon', 'Bãi biển trung tâm thành phố thuận tiện vui chơi về đêm.', 'Biển', 'Trung tâm', 13.7742200, 109.2305000, 4.7, 0, 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80', 'https://krpano.com');
