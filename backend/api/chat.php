<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDatabaseConnection();
    
    if ($method === 'POST') {
        // Save chat message and generate AI response
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['message'])) {
            respondError('Missing message', 400);
        }
        
        $message = $data['message'];
        $days = max(1, min(7, (int)($data['days'] ?? 3)));
        $priorities = $data['priorities'] ?? [];
        $user_id = $data['user_id'] ?? 1;
        $itinerary_id = $data['itinerary_id'] ?? null;
        
        // Get location candidates based on priorities
        $sql = 'SELECT id, name, category, description, rating, image_url FROM locations WHERE is_active = 1';
        $params = [];
        
        if (!empty($priorities)) {
            $placeholders = array_fill(0, count($priorities), '?');
            $sql .= ' AND category IN (' . implode(',', $placeholders) . ')';
            $params = $priorities;
        }
        
        $sql .= ' ORDER BY rating DESC LIMIT 20';
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $candidates = $stmt->fetchAll();
        
        // Generate itinerary from candidates
        $itinerary = [];
        if (!empty($candidates)) {
            $perDay = max(2, min(4, (int)ceil(count($candidates) / $days)));
            $cursor = 0;
            
            for ($day = 1; $day <= $days; $day++) {
                $dayItems = [];
                for ($i = 0; $i < $perDay && $cursor < count($candidates); $i++, $cursor++) {
                    $dayItems[] = $candidates[$cursor];
                }
                if (count($dayItems) === 0) {
                    break;
                }
                $itinerary[] = [
                    'day' => $day,
                    'places' => $dayItems,
                ];
            }
        }
        
        $assistant_reply = "Mình đã gợi ý lịch trình {$days} ngày dựa trên yêu cầu: \"{$message}\". Bạn có thể bấm vào từng địa điểm để xem VR360 và thêm vào lịch trình.";
        
        respondJSON([
            'success' => true,
            'assistant_reply' => $assistant_reply,
            'itinerary' => $itinerary,
        ]);
    }
    elseif ($method === 'GET') {
        // Get chat history
        $itinerary_id = $_GET['itinerary_id'] ?? null;
        $user_id = $_GET['user_id'] ?? 1;
        
        if ($itinerary_id) {
            $stmt = $pdo->prepare('SELECT * FROM chat_messages 
                                 WHERE itinerary_id = ? 
                                 ORDER BY created_at ASC 
                                 LIMIT 100');
            $stmt->execute([$itinerary_id]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM chat_messages 
                                 WHERE user_id = ? 
                                 ORDER BY created_at DESC 
                                 LIMIT 50');
            $stmt->execute([$user_id]);
        }
        
        $messages = $stmt->fetchAll();
        
        respondJSON([
            'success' => true,
            'messages' => $messages
        ]);
    }
    else {
        respondError('Method not allowed', 405);
    }
} catch (Exception $e) {
    respondError($e->getMessage(), 500);
}
