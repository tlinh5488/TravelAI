<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', $path);
$id = isset($parts[count($parts) - 1]) && is_numeric($parts[count($parts) - 1]) ? $parts[count($parts) - 1] : null;

try {
    $pdo = getDatabaseConnection();
    
    if ($method === 'GET') {
        if ($id) {
            // Get itinerary with items
            $stmt = $pdo->prepare('SELECT * FROM itineraries WHERE id = ?');
            $stmt->execute([$id]);
            $itinerary = $stmt->fetch();
            
            if (!$itinerary) {
                respondError('Itinerary not found', 404);
            }
            
            // Get itinerary items
            $stmt = $pdo->prepare('SELECT ii.*, l.name, l.image_url FROM itinerary_items ii 
                                 JOIN locations l ON ii.location_id = l.id 
                                 WHERE ii.itinerary_id = ? 
                                 ORDER BY ii.day_number, ii.order_in_day');
            $stmt->execute([$id]);
            $items = $stmt->fetchAll();
            
            $itinerary['items'] = $items;
            respondJSON($itinerary);
        } else {
            // Get all itineraries or filter by user
            $user_id = $_GET['user_id'] ?? null;
            
            $query = 'SELECT * FROM itineraries WHERE is_public = 1';
            $params = [];
            
            if ($user_id) {
                $query = 'SELECT * FROM itineraries WHERE user_id = ?';
                $params[] = $user_id;
            }
            
            $query .= ' ORDER BY created_at DESC LIMIT 50';
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $itineraries = $stmt->fetchAll();
            
            respondJSON([
                'success' => true,
                'data' => $itineraries
            ]);
        }
    } 
    elseif ($method === 'POST') {
        // Create new itinerary
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['title']) || !isset($data['duration_days'])) {
            respondError('Missing required fields', 400);
        }
        
        $user_id = $data['user_id'] ?? 1;
        $title = $data['title'];
        $description = $data['description'] ?? '';
        $start_date = $data['start_date'] ?? date('Y-m-d');
        $end_date = $data['end_date'] ?? date('Y-m-d', strtotime("+{$data['duration_days']} days"));
        $duration_days = $data['duration_days'];
        $budget = $data['budget'] ?? 0;
        $travel_style = $data['travel_style'] ?? 'adventure';
        
        $stmt = $pdo->prepare('INSERT INTO itineraries 
                             (user_id, title, description, start_date, end_date, duration_days, budget, travel_style) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        
        $stmt->execute([$user_id, $title, $description, $start_date, $end_date, $duration_days, $budget, $travel_style]);
        
        $itinerary_id = $pdo->lastInsertId();
        
        respondJSON([
            'success' => true,
            'message' => 'Itinerary created',
            'id' => $itinerary_id
        ], 201);
    }
    elseif ($method === 'PUT') {
        if (!$id) {
            respondError('ID required', 400);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $updateFields = [];
        $params = [];
        
        foreach (['title', 'description', 'start_date', 'end_date', 'budget', 'travel_style', 'is_public'] as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($updateFields)) {
            respondError('No fields to update', 400);
        }
        
        $params[] = $id;
        $query = 'UPDATE itineraries SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        
        respondJSON(['success' => true, 'message' => 'Itinerary updated']);
    }
    elseif ($method === 'DELETE') {
        if (!$id) {
            respondError('ID required', 400);
        }
        
        $stmt = $pdo->prepare('DELETE FROM itineraries WHERE id = ?');
        $stmt->execute([$id]);
        
        respondJSON(['success' => true, 'message' => 'Itinerary deleted']);
    }
    else {
        respondError('Method not allowed', 405);
    }
} catch (Exception $e) {
    respondError($e->getMessage(), 500);
}
