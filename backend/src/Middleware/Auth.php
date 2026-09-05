<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class Auth {
    public static function check() {
        $headers = function_exists('apache_request_headers') ? apache_request_headers() : getallheaders();
        $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader) {
            // Case-insensitive fallback
            foreach ($headers as $key => $value) {
                if (strtolower($key) === 'authorization' || strtolower($key) === 'http_authorization') {
                    $authHeader = $value;
                    break;
                }
            }
        }
        
        if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        // Fallback for shared hosting stripping Authorization header
        if (!$authHeader && isset($headers['X-Auth-Token'])) {
            $authHeader = 'Bearer ' . $headers['X-Auth-Token'];
        }
        if (!$authHeader && isset($_GET['token'])) {
            $authHeader = 'Bearer ' . $_GET['token'];
        }

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            header('HTTP/1.1 401 Unauthorized');
            // Log for debugging
            error_log("Failed to find token. Headers: " . json_encode($headers) . " SERVER: " . json_encode($_SERVER));
            echo json_encode(['status' => 'error', 'message' => 'Token not provided (Auth Header Missing in PHP)']);
            exit();
        }

        $token = $matches[1];
        $secretKey = $_SERVER['JWT_SECRET'] ?? $_ENV['JWT_SECRET'] ?? 'default_secret';

        try {
            $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
            // Save decoded user payload to request context (global for simplicity here)
            $GLOBALS['user'] = $decoded->data;
        } catch (Exception $e) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
            exit();
        }
    }
}
