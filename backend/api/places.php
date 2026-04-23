<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDatabaseConnection();
    
    if ($method === 'GET') {
        // Get all places/locations with filters
        $category = $_GET['category'] ?? '';
        $search = $_GET['search'] ?? '';
        
        $sql = 'SELECT id, name, slug, description, category, latitude, longitude, rating, 
                review_count, price_range, image_url, thumbnail_url, vr360_url, address, phone
                FROM locations
                WHERE is_active = 1';
        $params = [];
        
        if ($category !== '') {
            $sql .= ' AND category = ?';
            $params[] = $category;
        }
        
        if ($search !== '') {
            $sql .= ' AND (MATCH(name, description) AGAINST(? IN BOOLEAN MODE) OR name LIKE ?)';
            $params[] = $search;
            $params[] = '%' . $search . '%';
        }
        
        $sql .= ' ORDER BY rating DESC, name ASC LIMIT 100';
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $locations = $stmt->fetchAll();
        
        // Get distinct categories
        $categories = $pdo->query('SELECT DISTINCT category FROM locations WHERE is_active = 1 ORDER BY category')->fetchAll();
        
        respondJSON([
            'success' => true,
            'locations' => $locations,
            'categories' => array_map(fn($item) => $item['category'], $categories),
        ]);
    }
    elseif ($method === 'POST') {
        // Add location to itinerary
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['itinerary_id']) || !isset($data['location_id'])) {
            respondError('Missing required fields', 400);
        }
        
        $itinerary_id = $data['itinerary_id'];
        $location_id = $data['location_id'];
        $day_number = $data['day_number'] ?? 1;
        $notes = $data['notes'] ?? '';
        
        // Get next order in day
        $stmt = $pdo->prepare('SELECT COALESCE(MAX(order_in_day), 0) + 1 AS next_order 
                             FROM itinerary_items 
                             WHERE itinerary_id = ? AND day_number = ?');
        $stmt->execute([$itinerary_id, $day_number]);
        $result = $stmt->fetch();
        $order_in_day = $result['next_order'];
        
        // Insert item
        $stmt = $pdo->prepare('INSERT INTO itinerary_items 
                             (itinerary_id, location_id, day_number, order_in_day, notes) 
                             VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$itinerary_id, $location_id, $day_number, $order_in_day, $notes]);
        
        respondJSON([
            'success' => true,
            'message' => 'Location added to itinerary',
            'id' => $pdo->lastInsertId()
        ], 201);
    }
    elseif ($method === 'DELETE') {
        // Remove location from itinerary
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['item_id'])) {
            respondError('Missing item_id', 400);
        }
        
        $stmt = $pdo->prepare('DELETE FROM itinerary_items WHERE id = ?');
        $stmt->execute([$data['item_id']]);
        
        respondJSON(['success' => true, 'message' => 'Location removed from itinerary']);
    }
    else {
        respondError('Method not allowed', 405);
    }
} catch (Exception $e) {
    respondError($e->getMessage(), 500);
}
