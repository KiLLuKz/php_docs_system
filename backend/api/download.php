<?php
require_once __DIR__ . '/../db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo "Invalid document ID";
    exit();
}

$title = "Document_$id";

if ($pdo) {
    try {
        $stmt = $pdo->prepare("UPDATE documents SET download_count = download_count + 1 WHERE id = ?");
        $stmt->execute([$id]);
        
        $stmt = $pdo->prepare("SELECT title, file_name FROM documents WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch();
        if ($doc && !empty($doc['title'])) {
            $title = $doc['title'];
        }
    } catch (Exception $e) {
        // Fallback
    }
}

$upload_dir = __DIR__ . '/../uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$sample_file = $upload_dir . "sample.pdf";
if (!file_exists($sample_file)) {
    $content = "%PDF-1.4 Mock Document Certificate - ID: $id\nTitle: $title\nGenerated for local testing.";
    file_put_contents($sample_file, $content);
}

header('Content-Description: File Transfer');
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . rawurlencode($title) . '.pdf"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($sample_file));
readfile($sample_file);
exit();
