<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class UserController {
    public function index() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        $pdo = Database::getConnection();
        if (!$pdo) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
            return;
        }

        try {
            $stmt = $pdo->prepare("SELECT id, username, full_name, email, role, created_at FROM users ORDER BY full_name ASC");
            $stmt->execute();
            $users = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $users]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
