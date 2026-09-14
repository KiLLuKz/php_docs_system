<?php
require_once __DIR__ . '/backend/vendor/autoload.php';

use App\Config\Database;

try {
    $pdo = Database::getConnection();
    if (!$pdo) {
        echo "Failed to connect to database\n";
        exit;
    }
    
    $title = "Test Upload " . time();
    $description = "Test Desc";
    $filename = "test.pdf";
    $category_id = 1;
    $is_public = 1;
    $created_by = 1;
    $file_size = "1.5 MB";
    
    $stmt = $pdo->prepare("INSERT INTO documents (title, description, file_path, category_id, is_public, created_by, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $result = $stmt->execute([$title, $description, $filename, $category_id, $is_public, $created_by, $file_size]);
    
    echo "Insert Result: " . var_export($result, true) . "\n";
    
    $stmt = $pdo->query("SELECT * FROM documents ORDER BY id DESC LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Last Row: " . print_r($row, true) . "\n";
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
