# VIP Store Reset Key API

Base URL: https://vipstore.web.id/backend/api/reseller

Security: Every request must be created by your backend/server. Never expose API Secret in frontend source code. Signature = HMAC-SHA256(API Secret, timestamp + "." + nonce + "." + SHA256(raw request body)). For GET, raw body is an empty string. Timestamp uses UNIX seconds and is accepted for 5 minutes.

Endpoints:
- GET /reset-products.php: returns every active reset product automatically.
- POST /reset-key.php: body {"product_id":1,"key":"CUSTOMER-LICENSE-KEY"}.

The reset is accepted only when the exact key exists in the purchase history belonging to the account identified by X-API-Key. A key purchased by another API account is rejected.

Success response:
{"success":true,"ok":true,"message":"Reset key success.","key":"CUSTOMER-LICENSE-KEY","product":"AORUS"}

Common errors:
- 401 invalid/missing signature or timestamp
- 403 API disabled, account suspended, or key does not belong to this API account
- 409 the same key is already being processed
- 422 invalid input/product
- 429 too many requests
- 502 upstream reset provider rejected/failed the reset

PHP example:

<?php
function vipRequest(string $url, string $apiKey, string $apiSecret, string $method = 'GET', array $data = []): array {
    $body = $method === 'POST' ? json_encode($data, JSON_UNESCAPED_SLASHES) : '';
    $timestamp = (string) time();
    $nonce = bin2hex(random_bytes(16));
    $signature = hash_hmac('sha256', $timestamp.'.'.$nonce.'.'.hash('sha256', $body), $apiSecret);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_POSTFIELDS => $method === 'POST' ? $body : null,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json', 'X-API-Key: '.$apiKey,
            'X-Timestamp: '.$timestamp, 'X-Nonce: '.$nonce, 'X-Signature: '.$signature
        ],
        CURLOPT_TIMEOUT => 60,
    ]);
    $result = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['http_status' => $status, 'data' => json_decode((string)$result, true)];
}

$apiKey = 'YOUR_API_KEY';
$apiSecret = 'YOUR_API_SECRET';

// Load every reset product currently enabled in VIP Store.
$products = vipRequest('https://vipstore.web.id/backend/api/reseller/reset-products.php', $apiKey, $apiSecret);

// Reset a key. Never send API Secret to browser JavaScript; run this on your server.
$reset = vipRequest('https://vipstore.web.id/backend/api/reseller/reset-key.php', $apiKey, $apiSecret, 'POST', [
    'product_id' => 1,
    'key' => 'CUSTOMER-LICENSE-KEY'
]);
