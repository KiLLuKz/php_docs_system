CREATE DATABASE IF NOT EXISTS doc_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doc_system;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6'
);

CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    file_path VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    is_public TINYINT(1) DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS download_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default Admin (Password: password123 -> Hash it)
-- Hash for 'password123' is $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (username, email, password, full_name, role) VALUES 
('admin', 'admin@docportal.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin'),
('user1', 'user1@docportal.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'user');

INSERT INTO categories (id, name, color) VALUES
(1, 'เกียรติบัตร (Certificate)', '#ec4899'),
(2, 'เอกสารการอบรม (Training)', '#3b82f6'),
(3, 'คำสั่ง / ประกาศ (Announcement)', '#10b981');

INSERT INTO documents (id, title, description, category_id, file_path, file_size, is_public, created_by) VALUES
(1, 'คู่มือการใช้งานระบบ (สาธารณะ)', 'เปิดให้ทุกคนอ่านได้', 2, 'user_manual.pdf', '1.5 MB', 1, 1),
(2, 'เกียรติบัตรการอบรม Web Dev ของ John Doe', 'ส่วนบุคคล ห้ามเผยแพร่', 1, 'cert_john_web.pdf', '2.1 MB', 0, 1);

INSERT INTO user_documents (user_id, document_id) VALUES (2, 2);

