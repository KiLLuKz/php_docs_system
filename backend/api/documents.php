<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

$dummy_documents = [
    [
        "id" => 1,
        "title" => "เกียรติบัตรการแข่งขันทักษะการเขียนโปรแกรม Web Development 2026",
        "description" => "เกียรติบัตรรางวัลชนะเลิศอันดับ 1 ระดับภูมิภาค",
        "category_name" => "เกียรติบัตร (Certificate)",
        "category_color" => "#ec4899",
        "file_name" => "cert_web_dev_2026.pdf",
        "file_size" => "2.4 MB",
        "download_count" => 128,
        "created_at" => "2026-08-15 10:30:00"
    ],
    [
        "id" => 2,
        "title" => "คู่มือการใช้งานระบบลงทะเบียนออนไลน์ v2.0",
        "description" => "เอกสารแนะนำขั้นตอนการใช้งานระบบสำหรับเจ้าหน้าที่",
        "category_name" => "เอกสารการอบรม (Training)",
        "category_color" => "#3b82f6",
        "file_name" => "user_manual_v2.pdf",
        "file_size" => "5.1 MB",
        "download_count" => 45,
        "created_at" => "2026-08-20 14:15:00"
    ],
    [
        "id" => 3,
        "title" => "คำสั่งแต่งตั้งคณะทำงานจัดงานสัปดาห์วิชาการ 2569",
        "description" => "ประกาศแต่งตั้งคณะกรรมการและผู้รับผิดชอบงาน",
        "category_name" => "คำสั่ง / ประกาศ (Announcement)",
        "category_color" => "#10b981",
        "file_name" => "appointment_order_2026.pdf",
        "file_size" => "1.2 MB",
        "download_count" => 89,
        "created_at" => "2026-09-01 09:00:00"
    ],
    [
        "id" => 4,
        "title" => "รายงานผลการดำเนินงานประจำปีงบประมาณ 2568",
        "description" => "สรุปภาพรวมและผลสัมฤทธิ์การดำเนินงานประจำปี",
        "category_name" => "รายงานประจำปี (Report)",
        "category_color" => "#f59e0b",
        "file_name" => "annual_report_2025.pdf",
        "file_size" => "12.8 MB",
        "download_count" => 210,
        "created_at" => "2026-07-10 11:45:00"
    ],
    [
        "id" => 5,
        "title" => "เกียรติบัตรผ่านการอบรมพัฒนาเว็บแอปพลิเคชันด้วย React & PHP",
        "description" => "มอบให้แก่ผู้เข้าร่วมการอบรมเชิงปฏิบัติการ 30 ชั่วโมง",
        "category_name" => "เกียรติบัตร (Certificate)",
        "category_color" => "#ec4899",
        "file_name" => "cert_react_php_workshop.pdf",
        "file_size" => "1.8 MB",
        "download_count" => 342,
        "created_at" => "2026-09-03 16:20:00"
    ]
];

if (!$pdo) {
    echo json_encode(["status" => "success", "source" => "fallback", "data" => $dummy_documents]);
    exit();
}

try {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;

    $sql = "SELECT d.*, c.name as category_name, c.color as category_color 
            FROM documents d 
            LEFT JOIN categories c ON d.category_id = c.id 
            WHERE 1=1";
    
    $params = [];

    if (!empty($search)) {
        $sql .= " AND (d.title LIKE ? OR d.description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    if ($category_id > 0) {
        $sql .= " AND d.category_id = ?";
        $params[] = $category_id;
    }

    $sql .= " ORDER BY d.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $documents = $stmt->fetchAll();

    echo json_encode(["status" => "success", "source" => "database", "data" => $documents]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage(), "data" => $dummy_documents]);
}
