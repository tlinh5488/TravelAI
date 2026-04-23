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
            // Get single location
            $stmt = $pdo->prepare('SELECT * FROM locations WHERE id = ?');
            $stmt->execute([$id]);
            $location = $stmt->fetch();
            
            if (!$location) {
                respondError('Location not found', 404);
            }
            
            respondJSON($location);
        } else {
            // Get all locations with optional filters
            $category = $_GET['category'] ?? null;
            $search = $_GET['search'] ?? null;
            
            $query = 'SELECT * FROM locations WHERE is_active = 1';
            $params = [];
            
            if ($category) {
                $query .= ' AND category = ?';
                $params[] = $category;
            }
            
            if ($search) {
                $query .= ' AND (MATCH(name, description) AGAINST(? IN BOOLEAN MODE) OR name LIKE ?)';
                $params[] = $search;
                $params[] = '%' . $search . '%';
            }
            
            $query .= ' ORDER BY rating DESC LIMIT 100';
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $locations = $stmt->fetchAll();
            
            respondJSON([
                'success' => true,
                'data' => $locations,
                'total' => count($locations)
            ]);
        }
    } else {
        respondError('Method not allowed', 405);
    }
} catch (Exception $e) {
    respondError($e->getMessage(), 500);
}
