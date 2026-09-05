<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;
use Exception;

class DocumentController {
    
    public function index() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
            return;
        }

        $pdo = Database::getConnection();
        if (!$pdo) {
            // Dummy response
            echo json_encode(['status' => 'success', 'data' => []]);
            return;
        }

        try {
            if ($user->role === 'admin') {
                // Admins see all documents
                $sql = "SELECT d.*, c.name as category_name, c.color as category_color 
                        FROM documents d 
                        LEFT JOIN categories c ON d.category_id = c.id 
                        ORDER BY d.created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            } else {
                // Users see public docs OR docs assigned to them
                $sql = "SELECT d.*, c.name as category_name, c.color as category_color 
                        FROM documents d 
                        LEFT JOIN categories c ON d.category_id = c.id 
                        LEFT JOIN user_documents ud ON d.id = ud.document_id
                        WHERE d.is_public = 1 OR ud.user_id = ?
                        GROUP BY d.id
                        ORDER BY d.created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$user->id]);
            }
            
            $documents = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $documents]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function download($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || !$id) {
            header('HTTP/1.1 401 Unauthorized');
            return;
        }

        $pdo = Database::getConnection();
        if ($pdo) {
            // Verify permission
            if ($user->role !== 'admin') {
                $checkStmt = $pdo->prepare("SELECT d.id FROM documents d 
                                           LEFT JOIN user_documents ud ON d.id = ud.document_id 
                                           WHERE d.id = ? AND (d.is_public = 1 OR ud.user_id = ?)");
                $checkStmt->execute([$id, $user->id]);
                if (!$checkStmt->fetch()) {
                    header('HTTP/1.1 403 Forbidden');
                    echo "You do not have permission to download this document.";
                    return;
                }
            }

            // Log download
            $logStmt = $pdo->prepare("INSERT INTO download_logs (document_id, user_id, ip_address) VALUES (?, ?, ?)");
            $logStmt->execute([$id, $user->id, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
        }

        $upload_dir = __DIR__ . '/../../uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $sample_file = $upload_dir . "sample_$id.pdf";
        if (!file_exists($sample_file)) {
            $content = "%PDF-1.4 Mock Document Certificate\nGenerated for secure testing.\nDocument ID: $id\nDownloaded By: {$user->username}";
            file_put_contents($sample_file, $content);
        }

        header('Content-Description: File Transfer');
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="document_' . $id . '.pdf"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($sample_file));
        readfile($sample_file);
        exit();
    }

    public function upload() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        if (!isset($_FILES['file'])) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'No file uploaded']);
            return;
        }

        $title = $_POST['title'] ?? 'Untitled';
        $description = $_POST['description'] ?? '';
        $category_id = isset($_POST['category_id']) && $_POST['category_id'] !== '' ? (int)$_POST['category_id'] : null;
        $is_public = isset($_POST['is_public']) ? (int)$_POST['is_public'] : 0;

        $file = $_FILES['file'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('doc_') . '.' . $ext;
        
        $upload_dir = __DIR__ . '/../../uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $filepath = $upload_dir . $filename;
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO documents (title, description, file_path, category_id, is_public) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$title, $description, $filename, $category_id, $is_public]);
            
            echo json_encode(['status' => 'success', 'message' => 'Document uploaded successfully']);
        } else {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file']);
        }
    }

    public function delete($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT file_path FROM documents WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch();

        if ($doc) {
            $filepath = __DIR__ . '/../../uploads/' . $doc['file_path'];
            if (file_exists($filepath) && !is_dir($filepath)) {
                unlink($filepath);
            }
            
            $delStmt = $pdo->prepare("DELETE FROM documents WHERE id = ?");
            $delStmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Document deleted']);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['status' => 'error', 'message' => 'Document not found']);
        }
    }

    public function assign($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $data['user_id'] ?? null;

        if (!$userId) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'user_id is required']);
            return;
        }

        $pdo = Database::getConnection();
        
        // check if already assigned
        $check = $pdo->prepare("SELECT id FROM user_documents WHERE user_id = ? AND document_id = ?");
        $check->execute([$userId, $id]);
        if (!$check->fetch()) {
            $stmt = $pdo->prepare("INSERT INTO user_documents (user_id, document_id) VALUES (?, ?)");
            $stmt->execute([$userId, $id]);
        }

        echo json_encode(['status' => 'success', 'message' => 'Document assigned successfully']);
    }
}
