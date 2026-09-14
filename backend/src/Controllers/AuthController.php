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
            $stmt = $pdo->prepare("SELECT id, username, email, password, role, full_name, profile_image FROM users WHERE username = ?");
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
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'profile_image' => $user['profile_image']
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
        $jwtUser = $GLOBALS['user'];
        
        $pdo = Database::getConnection();
        if ($pdo) {
            $stmt = $pdo->prepare("SELECT id, username, email, role, full_name, profile_image FROM users WHERE id = ?");
            $stmt->execute([$jwtUser->id]);
            $freshUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($freshUser) {
                echo json_encode([
                    'status' => 'success',
                    'user' => $freshUser
                ]);
                return;
            }
        }
        
        // Fallback to JWT payload if DB fails or user not found
        echo json_encode([
            'status' => 'success',
            'user' => $jwtUser
        ]);
    }

    public function updateProfile() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            return;
        }

        $pdo = Database::getConnection();
        if (!$pdo) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
            return;
        }

        $full_name = $_POST['full_name'] ?? '';
        $email = $_POST['email'] ?? '';
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if (!$full_name || !$email || !$username) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'ข้อมูลที่จำเป็นไม่ครบถ้วน (ชื่อ, อีเมล, ชื่อผู้ใช้)']);
            return;
        }

        // Check if username or email already taken by someone else
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
        $checkStmt->execute([$username, $email, $user->id]);
        if ($checkStmt->fetch()) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว']);
            return;
        }

        // Handle profile image upload
        $profile_image = null;
        if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['profile_image'];
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            
            if (in_array(strtolower($ext), $allowedExts)) {
                $filename = 'profile_' . $user->id . '_' . time() . '.' . $ext;
                $upload_dir = __DIR__ . '/../../uploads/profiles/';
                
                if (!is_dir($upload_dir)) {
                    @mkdir($upload_dir, 0777, true);
                }

                $filepath = $upload_dir . $filename;
                if (@move_uploaded_file($file['tmp_name'], $filepath)) {
                    $profile_image = $filename;
                    
                    // delete old image
                    $stmt = $pdo->prepare("SELECT profile_image FROM users WHERE id = ?");
                    $stmt->execute([$user->id]);
                    $oldImage = $stmt->fetchColumn();
                    if ($oldImage && file_exists($upload_dir . $oldImage)) {
                        unlink($upload_dir . $oldImage);
                    }
                } else {
                    header('HTTP/1.1 500 Internal Server Error');
                    $errorMsg = 'ไม่สามารถบันทึกไฟล์รูปภาพได้ (Permission/Path Error): ' . $filepath;
                    echo json_encode(['status' => 'error', 'message' => $errorMsg]);
                    return;
                }
            } else {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['status' => 'error', 'message' => 'ไฟล์รูปภาพไม่รองรับ (เฉพาะ JPG, PNG, GIF, WEBP เท่านั้น)']);
                return;
            }
        } elseif (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] !== UPLOAD_ERR_NO_FILE) {
             header('HTTP/1.1 400 Bad Request');
             echo json_encode(['status' => 'error', 'message' => 'อัปโหลดไฟล์ไม่สำเร็จ (Error Code: ' . $_FILES['profile_image']['error'] . ')']);
             return;
        }

        // Update database
        if ($password) {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            if ($profile_image) {
                $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ?, username = ?, password = ?, profile_image = ? WHERE id = ?");
                $stmt->execute([$full_name, $email, $username, $hash, $profile_image, $user->id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ?, username = ?, password = ? WHERE id = ?");
                $stmt->execute([$full_name, $email, $username, $hash, $user->id]);
            }
        } else {
            if ($profile_image) {
                $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ?, username = ?, profile_image = ? WHERE id = ?");
                $stmt->execute([$full_name, $email, $username, $profile_image, $user->id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ?, username = ? WHERE id = ?");
                $stmt->execute([$full_name, $email, $username, $user->id]);
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'อัปเดตโปรไฟล์สำเร็จ']);
    }
}
