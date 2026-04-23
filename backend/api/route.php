<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDatabaseConnection();
    
    if ($method === 'GET') {
        $from_id = $_GET['from'] ?? null;
        $to_id = $_GET['to'] ?? null;
        $transport = $_GET['transport'] ?? 'car';
        
        if (!$from_id || !$to_id) {
            respondError('Missing from or to location', 400);
        }
        
        // Get locations
        $stmt = $pdo->prepare('SELECT * FROM locations WHERE id = ?');
        $stmt->execute([$from_id]);
        $from_location = $stmt->fetch();
        
        $stmt->execute([$to_id]);
        $to_location = $stmt->fetch();
        
        if (!$from_location || !$to_location) {
            respondError('Location not found', 404);
        }
        
        // Calculate distance using Haversine formula
        $distance_km = calculateDistance(
            $from_location['latitude'],
            $from_location['longitude'],
            $to_location['latitude'],
            $to_location['longitude']
        );
        
        // Calculate duration based on transport type
        $duration_minutes = calculateDuration($distance_km, $transport);
        
        // Generate route coordinates
        $route_coords = generateRouteCoords($from_location, $to_location);
        
        respondJSON([
            'success' => true,
            'from' => $from_location,
            'to' => $to_location,
            'distance_km' => $distance_km,
            'duration_minutes' => $duration_minutes,
            'transport_type' => $transport,
            'route_coords' => $route_coords
        ]);
    }
    else {
        respondError('Method not allowed', 405);
    }
} catch (Exception $e) {
    respondError($e->getMessage(), 500);
}

function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $lat1 = deg2rad($lat1);
    $lon1 = deg2rad($lon1);
    $lat2 = deg2rad($lat2);
    $lon2 = deg2rad($lon2);
    
    $dlat = $lat2 - $lat1;
    $dlon = $lon2 - $lon1;
    
    $a = sin($dlat / 2) * sin($dlat / 2) +
         cos($lat1) * cos($lat2) *
         sin($dlon / 2) * sin($dlon / 2);
    
    $c = 2 * asin(sqrt($a));
    $distance_km = 6371 * $c;
    
    return round($distance_km, 2);
}

function calculateDuration($distance_km, $transport) {
    switch ($transport) {
        case 'walk':
            return round($distance_km / 5 * 60); // ~5 km/h
        case 'bike':
            return round($distance_km / 20 * 60); // ~20 km/h
        case 'bus':
            return round($distance_km / 40 * 60); // ~40 km/h with stops
        case 'car':
        default:
            return round($distance_km / 50 * 60); // ~50 km/h average
    }
}

function generateRouteCoords($from, $to) {
    $points = [];
    $steps = 10;
    
    for ($i = 0; $i <= $steps; $i++) {
        $t = $i / $steps;
        $lat = $from['latitude'] + ($to['latitude'] - $from['latitude']) * $t;
        $lng = $from['longitude'] + ($to['longitude'] - $from['longitude']) * $t;
        $points[] = ['lat' => $lat, 'lng' => $lng];
    }
    
    return $points;
}
