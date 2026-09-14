<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class Auth {
    public static function check() {
        $authHeader = '';
        
        // 1. Check $_SERVER for standard auth
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        
        // 2. Check $_SERVER for our custom X-Auth-Token
        elseif (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) $authHeader = 'Bearer ' . $_SERVER['HTTP_X_AUTH_TOKEN'];
        elseif (isset($_SERVER['REDIRECT_HTTP_X_AUTH_TOKEN'])) $authHeader = 'Bearer ' . $_SERVER['REDIRECT_HTTP_X_AUTH_TOKEN'];

        // 3. Fallback to apache_request_headers / getallheaders loop
        if (!$authHeader) {
            $headers = [];
            if (function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
            } elseif (function_exists('getallheaders')) {
                $headers = getallheaders();
            }
            if ($headers) {
                foreach ($headers as $key => $value) {
                    $lowerKey = strtolower($key);
                    if ($lowerKey === 'authorization' || $lowerKey === 'http_authorization') {
                        $authHeader = $value;
                        break;
                    }
                    if ($lowerKey === 'x-auth-token') {
                        $authHeader = 'Bearer ' . $value;
                        break;
                    }
                }
            }
        }

        // 4. Ultimate fallback: URL parameter (e.g. ?token=...)
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
