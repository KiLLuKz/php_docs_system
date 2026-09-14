<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class AdminController {
    public function getDashboardStats() {
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
            // 1. Total users and admins
            $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
            $roles = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            
            $stmt = $pdo->query("SELECT COUNT(*) FROM users");
            $total_users = (int)$stmt->fetchColumn();
            $total_admins = (int)($roles['admin'] ?? 0);

            // 2. Downloads chart (dynamic period)
            $allowedDays = [7, 14, 30];
            $days = isset($_GET['days']) ? (int)$_GET['days'] : 7;
            if (!in_array($days, $allowedDays)) {
                $days = 7;
            }

            $downloads_chart = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-$i days"));
                $downloads_chart[$date] = ['date' => date('D', strtotime($date)), 'downloads' => 0, 'full_date' => $date];
            }

            $stmt = $pdo->query("
                SELECT DATE(downloaded_at) as dl_date, COUNT(*) as count 
                FROM download_logs 
                WHERE downloaded_at >= DATE(NOW() - INTERVAL {$days} DAY) 
                GROUP BY DATE(downloaded_at)
            ");
            while ($row = $stmt->fetch()) {
                if (isset($downloads_chart[$row['dl_date']])) {
                    $downloads_chart[$row['dl_date']]['downloads'] = (int)$row['count'];
                }
            }

            // 3. Documents category chart
            $stmt = $pdo->query("
                SELECT c.name as category, COUNT(d.id) as documents
                FROM categories c 
                LEFT JOIN documents d ON c.id = d.category_id 
                GROUP BY c.id, c.name
            ");
            $documents_category_chart = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($documents_category_chart as &$row) {
                $row['documents'] = (int)$row['documents'];
            }

            // 4. Storage category chart
            $stmt = $pdo->query("
                SELECT c.name as category, d.file_size 
                FROM categories c 
                JOIN documents d ON c.id = d.category_id
            ");
            $storage_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $storage_by_category = [];
            foreach ($storage_raw as $row) {
                $cat = $row['category'];
                if (!isset($storage_by_category[$cat])) {
                    $storage_by_category[$cat] = 0;
                }
                
                $size = strtoupper(trim($row['file_size']));
                $val = (float) preg_replace('/[^0-9.]/', '', $size);
                
                if (strpos($size, 'GB') !== false) {
                    $val *= 1024; // Convert to MB
                } elseif (strpos($size, 'KB') !== false) {
                    $val /= 1024; // Convert to MB
                } elseif (strpos($size, 'B') !== false && strpos($size, 'MB') === false && strpos($size, 'GB') === false && strpos($size, 'KB') === false) {
                    $val /= (1024 * 1024);
                }
                
                $storage_by_category[$cat] += $val;
            }

            $storage_category_chart = [];
            foreach ($storage_by_category as $cat => $size_mb) {
                $storage_category_chart[] = [
                    'category' => $cat,
                    'size_mb' => round($size_mb, 2)
                ];
            }

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'total_users' => $total_users,
                    'total_admins' => $total_admins,
                    'downloads_chart' => array_values($downloads_chart),
                    'documents_category_chart' => $documents_category_chart,
                    'storage_category_chart' => $storage_category_chart
                ]
            ]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function bulkDeleteDocuments() {
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

        $pdo = Database::getConnection();
        if (!$pdo) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
            return;
        }

        try {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("SELECT id, file_path FROM documents WHERE id IN ($placeholders)");
            $stmt->execute($ids);
            $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $deletedIds = [];
            foreach ($docs as $doc) {
                $filepath = __DIR__ . '/../../uploads/' . $doc['file_path'];
                if (file_exists($filepath) && !is_dir($filepath)) {
                    unlink($filepath);
                }
                $deletedIds[] = $doc['id'];
            }

            if (empty($deletedIds)) {
                echo json_encode(['status' => 'success', 'message' => 'No documents deleted']);
                return;
            }

            $delPlaceholders = implode(',', array_fill(0, count($deletedIds), '?'));
            $delStmt = $pdo->prepare("DELETE FROM documents WHERE id IN ($delPlaceholders)");
            $delStmt->execute($deletedIds);

            echo json_encode(['status' => 'success', 'message' => 'Documents deleted']);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
