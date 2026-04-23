<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    $pdo = getDatabaseConnection();
    $sessionId = $_GET['session_id'] ?? ($_POST['session_id'] ?? '');

    if ($sessionId === '') {
        jsonResponse(['message' => 'Thiếu session_id'], 400);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT ii.id, ii.day_number, ii.order_in_day, p.id AS place_id, p.name, p.category, p.region
             FROM itinerary_items ii
             INNER JOIN places p ON p.id = ii.place_id
             WHERE ii.session_id = :session_id
             ORDER BY ii.day_number ASC, ii.order_in_day ASC'
        );
        $stmt->execute([':session_id' => $sessionId]);

        jsonResponse(['items' => $stmt->fetchAll()]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = readJsonBody();
        $sessionId = (string)($body['session_id'] ?? '');
        $placeId = (int)($body['place_id'] ?? 0);
        $day = (int)($body['day_number'] ?? 1);

        if ($sessionId === '' || $placeId <= 0) {
            jsonResponse(['message' => 'Thiếu session_id hoặc place_id'], 400);
        }

        $orderStmt = $pdo->prepare('SELECT COALESCE(MAX(order_in_day), 0) + 1 AS next_order
                                    FROM itinerary_items
                                    WHERE session_id = :session_id AND day_number = :day_number');
        $orderStmt->execute([
            ':session_id' => $sessionId,
            ':day_number' => $day,
        ]);
        $nextOrder = (int)$orderStmt->fetch()['next_order'];

        $insert = $pdo->prepare(
            'INSERT INTO itinerary_items(session_id, place_id, day_number, order_in_day)
             VALUES(:session_id, :place_id, :day_number, :order_in_day)'
        );
        $insert->execute([
            ':session_id' => $sessionId,
            ':place_id' => $placeId,
            ':day_number' => $day,
            ':order_in_day' => $nextOrder,
        ]);

        jsonResponse(['message' => 'Đã thêm vào lịch trình']);
    }

    jsonResponse(['message' => 'Method không hỗ trợ'], 405);
} catch (Throwable $exception) {
    jsonResponse([
        'message' => 'Không thể xử lý lịch trình',
        'error' => $exception->getMessage(),
    ], 500);
}
