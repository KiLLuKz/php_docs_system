<?php
namespace App\Controllers;

use App\Config\Database;
use Firebase\JWT\JWT;
use PDO;

class AuthController {
    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if (!$username || !$password) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'Username and password required']);
            return;
        }

        $pdo = Database::getConnection();
        if (!$pdo) {
            // Dummy authentication for frontend testing if DB is down
            if ($username === 'admin' && $password === 'password') {
                $user = ['id' => 1, 'username' => 'admin', 'role' => 'admin', 'full_name' => 'Mock Admin'];
            } else {
                header('HTTP/1.1 401 Unauthorized');
                echo json_encode(['status' => 'error', 'message' => 'Invalid credentials (DB down)']);
                return;
            }
        } else {
            $stmt = $pdo->prepare("SELECT id, username, password, role, full_name FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($password, $user['password'])) {
                header('HTTP/1.1 401 Unauthorized');
                echo json_encode(['status' => 'error', 'message' => 'Invalid username or password']);
                return;
            }
        }

        $secretKey = $_SERVER['JWT_SECRET'] ?? $_ENV['JWT_SECRET'] ?? 'default_secret';
        $issuedAt = time();
        $expirationTime = $issuedAt + (60 * 60 * 24); // valid for 24 hours
        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'data' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'full_name' => $user['full_name']
            ]
        ];

        $jwt = JWT::encode($payload, $secretKey, 'HS256');

        echo json_encode([
            'status' => 'success',
            'token' => $jwt,
            'user' => $payload['data']
        ]);
    }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $full_name = $data['full_name'] ?? '';

        if (!$username || !$email || !$password || !$full_name) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ครบถ้วน']);
            return;
        }

        $pdo = Database::getConnection();
        if (!$pdo) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
            return;
        }

        // Check if exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'ชื่อผู้ใช้หรืออีเมลนี้มีในระบบแล้ว']);
            return;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, 'user')");
        if ($stmt->execute([$username, $email, $hash, $full_name])) {
            echo json_encode(['status' => 'success', 'message' => 'สมัครสมาชิกสำเร็จ']);
        } else {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถสมัครสมาชิกได้']);
        }
    }

    public function me() {
        // Auth middleware guarantees $GLOBALS['user'] is set
        echo json_encode([
            'status' => 'success',
            'user' => $GLOBALS['user']
        ]);
    }
}
