<?php
namespace App\Controllers;

use App\Config\Database;
use Exception;
use PDO;

class CategoryController {
    public function index() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            return;
        }

        $pdo = Database::getConnection();
        if (!$pdo) {
            echo json_encode(['status' => 'success', 'data' => []]);
            return;
        }

        try {
            $stmt = $pdo->prepare("
                SELECT c.*, COUNT(d.id) as document_count 
                FROM categories c 
                LEFT JOIN documents d ON c.id = d.category_id 
                GROUP BY c.id 
                ORDER BY c.id ASC
            ");
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['status' => 'success', 'data' => $categories]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function store() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
            return;
        }

        $pdo = Database::getConnection();
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'] ?? null;
        $color = $data['color'] ?? '#3b82f6';

        if (!$name) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'Category name is required']);
            return;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO categories (name, color) VALUES (?, ?)");
            $stmt->execute([$name, $color]);
            echo json_encode(['status' => 'success', 'message' => 'Category created successfully']);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function update($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
            return;
        }

        $pdo = Database::getConnection();
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'] ?? null;
        $color = $data['color'] ?? '#3b82f6';

        if (!$name) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'Category name is required']);
            return;
        }

        try {
            $stmt = $pdo->prepare("UPDATE categories SET name = ?, color = ? WHERE id = ?");
            $stmt->execute([$name, $color, $id]);
            echo json_encode(['status' => 'success', 'message' => 'Category updated successfully']);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function bulkDelete() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
            return;
        }

        $pdo = Database::getConnection();
        $data = json_decode(file_get_contents("php://input"), true);
        $ids = $data['ids'] ?? [];

        if (empty($ids) || !is_array($ids)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'Invalid or empty IDs provided.']);
            return;
        }

        try {
            $pdo->beginTransaction();

            $placeholders = implode(',', array_fill(0, count($ids), '?'));

            // Set category_id to NULL for any attached documents
            $updateStmt = $pdo->prepare("UPDATE documents SET category_id = NULL WHERE category_id IN ($placeholders)");
            $updateStmt->execute($ids);

            // Delete categories
            $deleteStmt = $pdo->prepare("DELETE FROM categories WHERE id IN ($placeholders)");
            $deleteStmt->execute($ids);

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Categories deleted successfully.']);
        } catch (Exception $e) {
            $pdo->rollBack();
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
