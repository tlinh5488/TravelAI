<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    $pdo = getDatabaseConnection();
    $body = readJsonBody();

    $message = trim((string)($body['message'] ?? ''));
    $days = max(1, min(7, (int)($body['days'] ?? 3)));
    $priorities = $body['priorities'] ?? [];

    if ($message === '') {
        jsonResponse(['message' => 'Bạn chưa nhập nội dung chat'], 400);
    }

    $allowedCategories = [];
    if (is_array($priorities) && count($priorities) > 0) {
        foreach ($priorities as $priority) {
            $value = trim((string)$priority);
            if ($value !== '') {
                $allowedCategories[] = $value;
            }
        }
    }

    $sql = 'SELECT id, name, category, region, rating, ticket_price
            FROM places';
    $params = [];

    if (count($allowedCategories) > 0) {
        $placeholders = [];
        foreach ($allowedCategories as $index => $category) {
            $key = ':cat_' . $index;
            $placeholders[] = $key;
            $params[$key] = $category;
        }
        $sql .= ' WHERE category IN (' . implode(',', $placeholders) . ')';
    }

    $sql .= ' ORDER BY rating DESC LIMIT 20';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $candidates = $stmt->fetchAll();

    if (count($candidates) === 0) {
        jsonResponse([
            'assistant_reply' => 'Mình chưa tìm thấy địa điểm phù hợp với bộ lọc của bạn.',
            'itinerary' => [],
        ]);
    }

    $itinerary = [];
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

    $intro = "Mình đã gợi ý lịch trình {$days} ngày dựa trên yêu cầu: \"{$message}\".";
    $hint = 'Bạn có thể bấm vào từng địa điểm trên bản đồ để xem VR360, vẽ tuyến đường và thêm vào lịch trình.';

    jsonResponse([
        'assistant_reply' => $intro . ' ' . $hint,
        'itinerary' => $itinerary,
    ]);
} catch (Throwable $exception) {
    jsonResponse([
        'message' => 'Không thể sinh lịch trình tự động',
        'error' => $exception->getMessage(),
    ], 500);
}
