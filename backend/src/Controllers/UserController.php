<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class UserController {
    public function index() {
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

        try {
            $stmt = $pdo->prepare("SELECT id, username, full_name, email, role, profile_image, created_at FROM users ORDER BY CASE WHEN role = 'admin' THEN 1 ELSE 2 END ASC, full_name ASC");
            $stmt->execute();
            $users = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $users]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
    public function store() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
            return;
        }

        $username = $input['username'] ?? '';
        $email = $input['email'] ?? '';
        $fullName = $input['full_name'] ?? '';
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'user';

        $pdo = Database::getConnection();
        if (!$pdo) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
            return;
        }

        try {
            // Check for uniqueness
            $stmt = $pdo->prepare("SELECT username, email FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            $existing = $stmt->fetchAll();

            $errors = [];
            foreach ($existing as $row) {
                if (strtolower($row['username']) === strtolower($username)) {
                    $errors['username'] = 'ชื่อผู้ใช้งานนี้มีในระบบแล้ว';
                }
                if (strtolower($row['email']) === strtolower($email)) {
                    $errors['email'] = 'อีเมลนี้มีผู้ใช้งานแล้ว';
                }
            }

            if (!empty($errors)) {
                echo json_encode(['status' => 'error', 'errors' => $errors]);
                return;
            }

            // Insert new user
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, email, full_name, password, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$username, $email, $fullName, $hashedPassword, $role]);

            $newUser = [
                'id' => $pdo->lastInsertId(),
                'username' => $username,
                'email' => $email,
                'full_name' => $fullName,
                'role' => $role
            ];

            echo json_encode(['status' => 'success', 'data' => $newUser]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function update($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
            return;
        }

        $username = $input['username'] ?? '';
        $email = $input['email'] ?? '';
        $fullName = $input['full_name'] ?? '';
        $role = $input['role'] ?? 'user';
        $password = $input['password'] ?? '';

        $pdo = Database::getConnection();
        if (!$pdo) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
            return;
        }

        try {
            $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE (username = ? OR email = ?) AND id != ?");
            $stmt->execute([$username, $email, $id]);
            $existing = $stmt->fetchAll();

            $errors = [];
            foreach ($existing as $row) {
                if (strtolower($row['username']) === strtolower($username)) {
                    $errors['username'] = 'ชื่อผู้ใช้งานนี้มีในระบบแล้ว';
                }
                if (strtolower($row['email']) === strtolower($email)) {
                    $errors['email'] = 'อีเมลนี้มีผู้ใช้งานแล้ว';
                }
            }

            if (!empty($errors)) {
                echo json_encode(['status' => 'error', 'errors' => $errors]);
                return;
            }

            if (!empty($password)) {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE users SET username=?, email=?, full_name=?, role=?, password=? WHERE id=?");
                $stmt->execute([$username, $email, $fullName, $role, $hashedPassword, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET username=?, email=?, full_name=?, role=? WHERE id=?");
                $stmt->execute([$username, $email, $fullName, $role, $id]);
            }

            $stmt = $pdo->prepare("SELECT id, username, full_name, email, role, profile_image, created_at FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $updatedUser = $stmt->fetch();

            echo json_encode(['status' => 'success', 'data' => $updatedUser]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        // Prevent self-deletion
        if ($user->id == $id) {
            echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถลบบัญชีของตัวเองได้']);
            return;
        }

        $pdo = Database::getConnection();
        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'User deleted']);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function bulkDelete() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $ids = $input['ids'] ?? [];

        if (empty($ids)) {
            echo json_encode(['status' => 'error', 'message' => 'No IDs provided']);
            return;
        }

        // Filter out the current user's ID to prevent self-deletion in bulk
        $ids = array_filter($ids, function($id) use ($user) {
            return $id != $user->id;
        });

        if (empty($ids)) {
            echo json_encode(['status' => 'success', 'message' => 'No valid users to delete']);
            return;
        }

        $pdo = Database::getConnection();
        try {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("DELETE FROM users WHERE id IN ($placeholders)");
            $stmt->execute(array_values($ids));
            echo json_encode(['status' => 'success', 'message' => 'Users deleted']);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
