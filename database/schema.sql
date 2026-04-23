CREATE DATABASE IF NOT EXISTS travel_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_ai;

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng địa điểm du lịch
CREATE TABLE IF NOT EXISTS locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 4.0,
    review_count INT DEFAULT 0,
    price_range VARCHAR(50),
    image_url VARCHAR(255),
    thumbnail_url VARCHAR(255),
    vr360_url VARCHAR(500),
    address VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    opening_hours VARCHAR(200),
    best_season VARCHAR(100),
    duration_hours INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX (category),
    INDEX (latitude, longitude),
    FULLTEXT INDEX ft_search (name, description)
);

-- Bảng lịch trình
CREATE TABLE IF NOT EXISTS itineraries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    duration_days INT,
    budget INT,
    travel_style VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id)
);

-- Bảng chi tiết lịch trình
CREATE TABLE IF NOT EXISTS itinerary_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    itinerary_id INT NOT NULL,
    location_id INT NOT NULL,
    day_number INT,
    order_in_day INT,
    notes TEXT,
    estimated_duration INT,
    arrival_time TIME,
    departure_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX (itinerary_id),
    INDEX (location_id)
);

-- Bảng yêu thích
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, location_id)
);

-- Bảng chat / AI Assistant
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    itinerary_id INT,
    message_type ENUM('user', 'assistant'),
    content TEXT NOT NULL,
    suggestion_type VARCHAR(50),
    related_location_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    FOREIGN KEY (related_location_id) REFERENCES locations(id),
    INDEX (user_id),
    INDEX (itinerary_id)
);

-- Bảng routes
CREATE TABLE IF NOT EXISTS routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_location_id INT NOT NULL,
    to_location_id INT NOT NULL,
    distance_km DECIMAL(10, 2),
    duration_minutes INT,
    transport_type VARCHAR(50),
    route_coords LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_location_id) REFERENCES locations(id),
    FOREIGN KEY (to_location_id) REFERENCES locations(id)
);

-- Insert sample locations
INSERT INTO locations (name, slug, description, category, latitude, longitude, rating, review_count, price_range, image_url, thumbnail_url, vr360_url, address, phone, opening_hours, best_season, duration_hours) VALUES
('Kỳ Co', 'ky-co', 'Bãi biển nước xanh và cát trắng nổi tiếng ở Quy Nhơn.', 'beach', 13.8306700, 109.3659100, 4.8, 230, '< 100k', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=100&q=80', 'https://krpano.com/examples/google-street-view/', 'Xã Nhơn Hải, Quy Nhơn', '0254-3822522', '06:00 - 18:00', 'March - September', 3),
('Eo Gió', 'eo-gio', 'Danh thắng với vách đá hùng vĩ bao quanh bãi biển hoang sơ.', 'beach', 13.8254500, 109.3721800, 4.9, 340, '50,000', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=100&q=80', 'https://krpano.com/examples/google-street-view/', 'Quy Nhơn, Bình Định', '0254-3850000', '24/7', 'April - October', 4),
('Ghềnh Ráng Tiên Sa', 'ghenh-rang', 'Quần thể du lịch sinh thái nằm giữa các vách đá nguy nga.', 'temple', 13.7514300, 109.2211000, 4.8, 450, '100k-500k', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80', 'https://krpano.com/examples/google-street-view/', 'Quy Nhơn, Bình Định', '0254-3825888', '08:00 - 22:00', 'March - November', 5),
('Chùa Ông Núi', 'chua-ong-nui', 'Quần thể chùa với tượng Phật lớn và tầm nhìn toàn cảnh.', 'temple', 13.6754800, 109.0524600, 4.5, 220, '< 100k', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=100&q=80', 'https://krpano.com/examples/google-street-view/', 'Quy Nhơn, Bình Định', '0254-3821111', '06:00 - 18:00', 'Year-round', 2),
('Tháp Đôi', 'thap-doi', 'Di tích Chăm Pa ngay trung tâm thành phố.', 'temple', 13.7863400, 109.2270900, 4.3, 180, '< 100k', 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=100&q=80', 'https://krpano.com/examples/google-street-view/', 'Quy Nhơn, Bình Định', '0254-3823456', '06:00 - 18:00', 'Year-round', 2),
('Bãi biển Quy Nhơn', 'bai-bien-quy-nhon', 'Bãi biển trung tâm thành phố thuận tiện vui chơi về đêm.', 'beach', 13.7742200, 109.2305000, 4.7, 500, '< 100k', 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=100&q=80', 'https://krpano.com/examples/google-street-view/', 'Quy Nhơn, Bình Định', '0254-3811111', '06:00 - 22:00', 'Year-round', 3);
