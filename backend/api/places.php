<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    $pdo = getDatabaseConnection();

    $category = $_GET['category'] ?? '';
    $region = $_GET['region'] ?? '';

    $sql = 'SELECT id, name, slug, description, category, region, latitude, longitude, rating, ticket_price, image_url, vr_url
            FROM places
            WHERE 1 = 1';
    $params = [];

    if ($category !== '') {
        $sql .= ' AND category = :category';
        $params[':category'] = $category;
    }

    if ($region !== '') {
        $sql .= ' AND region = :region';
        $params[':region'] = $region;
    }

    $sql .= ' ORDER BY rating DESC, name ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $places = $stmt->fetchAll();

    $categories = $pdo->query('SELECT DISTINCT category FROM places ORDER BY category')->fetchAll();
    $regions = $pdo->query('SELECT DISTINCT region FROM places ORDER BY region')->fetchAll();

    jsonResponse([
        'places' => $places,
        'categories' => array_map(fn($item) => $item['category'], $categories),
        'regions' => array_map(fn($item) => $item['region'], $regions),
    ]);
} catch (Throwable $exception) {
    jsonResponse([
        'message' => 'Không thể lấy danh sách địa điểm',
        'error' => $exception->getMessage(),
    ], 500);
}
