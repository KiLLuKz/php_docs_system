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
            $mode = $_GET['mode'] ?? 'personal';
            
            if ($user->role === 'admin' && $mode === 'admin') {
                // Admins see all documents in admin mode
                $sql = "SELECT d.*, c.name as category_name, c.color as category_color, 
                               creator.full_name as creator_name, creator.username as creator_username, creator.profile_image as creator_profile_image 
                        FROM documents d 
                        LEFT JOIN categories c ON d.category_id = c.id 
                        LEFT JOIN users creator ON d.created_by = creator.id
                        ORDER BY d.created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            } elseif ($mode === 'manage') {
                // Return ONLY documents created by the current user, REGARDLESS of admin status
                $sql = "SELECT d.*, c.name as category_name, c.color as category_color, 
                               creator.full_name as creator_name, creator.username as creator_username, creator.profile_image as creator_profile_image 
                        FROM documents d 
                        LEFT JOIN categories c ON d.category_id = c.id 
                        LEFT JOIN users creator ON d.created_by = creator.id
                        WHERE d.created_by = ?
                        ORDER BY d.created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$user->id]);
            } else {
                // Users (and admins in personal mode) see public docs OR docs assigned to them OR docs they created
                $sql = "SELECT d.*, c.name as category_name, c.color as category_color, 
                               creator.full_name as creator_name, creator.username as creator_username, creator.profile_image as creator_profile_image 
                        FROM documents d 
                        LEFT JOIN categories c ON d.category_id = c.id 
                        LEFT JOIN user_documents ud ON d.id = ud.document_id
                        LEFT JOIN users creator ON d.created_by = creator.id
                        WHERE d.is_public = 1 OR ud.user_id = ? OR d.created_by = ?
                        GROUP BY d.id
                        ORDER BY d.created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$user->id, $user->id]);
            }
            
            $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($documents)) {
                $docIds = array_column($documents, 'id');
                $placeholders = implode(',', array_fill(0, count($docIds), '?'));
                $sharedSql = "SELECT ud.document_id, u.id, u.full_name, u.username, u.profile_image 
                              FROM user_documents ud 
                              JOIN users u ON ud.user_id = u.id 
                              WHERE ud.document_id IN ($placeholders)";
                $sharedStmt = $pdo->prepare($sharedSql);
                $sharedStmt->execute($docIds);
                $sharedUsers = $sharedStmt->fetchAll(PDO::FETCH_ASSOC);
                
                $groupedUsers = [];
                foreach ($sharedUsers as $su) {
                    $docId = $su['document_id'];
                    unset($su['document_id']);
                    $groupedUsers[$docId][] = $su;
                }
                
                foreach ($documents as &$doc) {
                    $doc['shared_users'] = $groupedUsers[$doc['id']] ?? [];
                }
            }

            echo json_encode(['status' => 'success', 'data' => $documents]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function download($id) {
        $this->serveFile($id, true);
    }

    public function preview($id) {
        $this->serveFile($id, false);
    }

    private function serveFile($id, $isDownload) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || !$id) {
            header('HTTP/1.1 401 Unauthorized');
            return;
        }

        $pdo = Database::getConnection();
        if (!$pdo) {
            header('HTTP/1.1 500 Internal Server Error');
            return;
        }

        // Fetch document info
        $stmt = $pdo->prepare("SELECT * FROM documents WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch();

        if (!$doc) {
            header('HTTP/1.1 404 Not Found');
            echo "Document not found.";
            return;
        }

        // Verify permission
        if ($user->role !== 'admin') {
            $checkStmt = $pdo->prepare("SELECT d.id FROM documents d 
                                       LEFT JOIN user_documents ud ON d.id = ud.document_id 
                                       WHERE d.id = ? AND (d.is_public = 1 OR ud.user_id = ? OR d.created_by = ?)");
            $checkStmt->execute([$id, $user->id, $user->id]);
            if (!$checkStmt->fetch()) {
                header('HTTP/1.1 403 Forbidden');
                echo "You do not have permission to access this document.";
                return;
            }
        }

        if ($isDownload) {
            // Log download only on actual download, not preview
            $logStmt = $pdo->prepare("INSERT INTO download_logs (document_id, user_id, ip_address) VALUES (?, ?, ?)");
            $logStmt->execute([$id, $user->id, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
        }

        $upload_dir = __DIR__ . '/../../uploads/';
        $filepath = $upload_dir . $doc['file_path'];

        if (!file_exists($filepath)) {
            header('HTTP/1.1 404 Not Found');
            echo "File not found on server.";
            return;
        }

        $ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));
        $contentTypes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg'
        ];
        
        $contentType = $contentTypes[$ext] ?? 'application/octet-stream';
        $disposition = $isDownload ? 'attachment' : 'inline';
        $filename = $doc['title'] . '.' . $ext;
        // encode filename for headers
        $encodedFilename = rawurlencode($filename);

        header('Content-Description: File Transfer');
        header('Content-Type: ' . $contentType);
        header('Content-Disposition: ' . $disposition . '; filename="' . $filename . '"; filename*=UTF-8\'\'' . $encodedFilename);
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filepath));
        readfile($filepath);
        exit();
    }

    public function upload() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
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
        
        // Only admin can set is_public
        if ($user->role === 'admin') {
            $is_public = isset($_POST['is_public']) ? (int)$_POST['is_public'] : 0;
        } else {
            $is_public = 0;
        }
        
        $created_by = $user->id;

        $file = $_FILES['file'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('doc_') . '.' . $ext;
        
        $bytes = $file['size'];
        $decimals = 2;
        $sz = 'BKMGTP';
        $factor = floor((strlen($bytes) - 1) / 3);
        $file_size = sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . ' ' . @$sz[$factor] . 'B';
        if ($bytes == 0) $file_size = '0 B';
        
        $upload_dir = __DIR__ . '/../../uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $filepath = $upload_dir . $filename;
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO documents (title, description, file_path, category_id, is_public, created_by, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $description, $filename, $category_id, $is_public, $created_by, $file_size]);
            
            echo json_encode(['status' => 'success', 'message' => 'Document uploaded successfully']);
        } else {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file']);
        }
    }

    public function delete($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT file_path, created_by FROM documents WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch();

        if ($doc) {
            if ($user->role !== 'admin' && $doc['created_by'] !== $user->id) {
                header('HTTP/1.1 403 Forbidden');
                echo json_encode(['status' => 'error', 'message' => 'You do not have permission to delete this document']);
                return;
            }

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

    public function bulkDelete() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $ids = $input['ids'] ?? [];

        if (empty($ids)) {
            echo json_encode(['status' => 'error', 'message' => 'No IDs provided']);
            return;
        }

        $pdo = Database::getConnection();
        
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("SELECT id, file_path, created_by FROM documents WHERE id IN ($placeholders)");
        $stmt->execute($ids);
        $docs = $stmt->fetchAll();

        $deletedIds = [];
        foreach ($docs as $doc) {
            if ($user->role !== 'admin' && $doc['created_by'] !== $user->id) {
                continue; // skip if no permission
            }

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
    }

    public function assignedUsers($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
            return;
        }

        $pdo = Database::getConnection();
        
        // Verify ownership or admin
        $stmt = $pdo->prepare("SELECT created_by FROM documents WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch();

        if (!$doc) {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['status' => 'error', 'message' => 'Document not found']);
            return;
        }

        if ($user->role !== 'admin' && $doc['created_by'] !== $user->id) {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'You do not have permission to manage access for this document']);
            return;
        }

        $stmt = $pdo->prepare("SELECT user_id FROM user_documents WHERE document_id = ?");
        $stmt->execute([$id]);
        $assignedUsers = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode(['status' => 'success', 'data' => $assignedUsers]);
    }

    public function syncUsers($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $userIds = $input['user_ids'] ?? [];

        $pdo = Database::getConnection();
        
        // Verify ownership or admin
        $stmt = $pdo->prepare("SELECT created_by FROM documents WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch();

        if (!$doc) {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['status' => 'error', 'message' => 'Document not found']);
            return;
        }

        if ($user->role !== 'admin' && $doc['created_by'] !== $user->id) {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'You do not have permission to manage access for this document']);
            return;
        }

        $pdo->beginTransaction();
        try {
            // Clear existing assignments
            $delStmt = $pdo->prepare("DELETE FROM user_documents WHERE document_id = ?");
            $delStmt->execute([$id]);

            if (!empty($userIds)) {
                $insertStmt = $pdo->prepare("INSERT INTO user_documents (document_id, user_id) VALUES (?, ?)");
                foreach ($userIds as $uid) {
                    $insertStmt->execute([$id, $uid]);
                }
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Users synced successfully']);
        } catch (Exception $e) {
            $pdo->rollBack();
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => 'Failed to sync users: ' . $e->getMessage()]);
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

    public function update($id) {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
            return;
        }

        $pdo = Database::getConnection();
        
        // Verify ownership or admin
        $stmt = $pdo->prepare("SELECT created_by FROM documents WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch();

        if (!$doc) {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['status' => 'error', 'message' => 'Document not found']);
            return;
        }

        if ($user->role !== 'admin' && $doc['created_by'] !== $user->id) {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'You do not have permission to edit this document']);
            return;
        }

        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $category_id = isset($_POST['category_id']) && $_POST['category_id'] !== '' ? (int)$_POST['category_id'] : null;

        if (!$title) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['status' => 'error', 'message' => 'Title is required']);
            return;
        }

        if ($user->role === 'admin' && isset($_POST['is_public'])) {
            $is_public = (int)$_POST['is_public'];
            $updateStmt = $pdo->prepare("UPDATE documents SET title = ?, description = ?, category_id = ?, is_public = ? WHERE id = ?");
            $updateStmt->execute([$title, $description, $category_id, $is_public, $id]);
        } else {
            $updateStmt = $pdo->prepare("UPDATE documents SET title = ?, description = ?, category_id = ? WHERE id = ?");
            $updateStmt->execute([$title, $description, $category_id, $id]);
        }

        echo json_encode(['status' => 'success', 'message' => 'Document updated successfully']);
    }

    public function logs() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user || $user->role !== 'admin') {
            header('HTTP/1.1 403 Forbidden');
            echo json_encode(['status' => 'error', 'message' => 'Admin access required']);
            return;
        }

        $pdo = Database::getConnection();
        if (!$pdo) {
            header('HTTP/1.1 500 Internal Server Error');
            return;
        }

        try {
            $sql = "SELECT l.*, d.title as document_title, u.full_name as user_name, u.email as user_email 
                    FROM download_logs l
                    LEFT JOIN documents d ON l.document_id = d.id
                    LEFT JOIN users u ON l.user_id = u.id
                    ORDER BY l.downloaded_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['status' => 'success', 'data' => $logs]);
        } catch (Exception $e) {
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
