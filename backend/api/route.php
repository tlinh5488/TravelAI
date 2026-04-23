<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$fromLat = $_GET['from_lat'] ?? '';
$fromLng = $_GET['from_lng'] ?? '';
$toLat = $_GET['to_lat'] ?? '';
$toLng = $_GET['to_lng'] ?? '';

if ($fromLat === '' || $fromLng === '' || $toLat === '' || $toLng === '') {
    jsonResponse(['message' => 'Thiếu tham số tọa độ'], 400);
}

$osrmUrl = sprintf(
    'https://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=full&geometries=geojson',
    urlencode((string)$fromLng),
    urlencode((string)$fromLat),
    urlencode((string)$toLng),
    urlencode((string)$toLat)
);

$response = @file_get_contents($osrmUrl);

if ($response === false) {
    jsonResponse(['message' => 'Không lấy được tuyến đường từ OSRM'], 502);
}

$payload = json_decode($response, true);
if (!is_array($payload) || ($payload['code'] ?? '') !== 'Ok') {
    jsonResponse(['message' => 'OSRM trả dữ liệu không hợp lệ'], 502);
}

$route = $payload['routes'][0] ?? null;
if (!is_array($route)) {
    jsonResponse(['message' => 'Không tìm thấy tuyến đường'], 404);
}

jsonResponse([
    'distance_m' => $route['distance'],
    'duration_s' => $route['duration'],
    'geometry' => $route['geometry'],
]);
