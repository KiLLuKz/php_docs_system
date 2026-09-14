SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `doc_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(20) DEFAULT '#3b82f6'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `color`) VALUES
(1, 'เกียรติบัตร', '#ec4899'),
(2, 'เอกสารการอบรม', '#3b82f6'),
(3, 'คำสั่ง / ประกาศ', '#10b981'),
(4, 'แบบฟอร์ม', '#f59e0b'),
(5, 'เอกสารทั่วไป', '#6366f1') ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE IF NOT EXISTS `documents` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` varchar(50) NOT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `title`, `description`, `category_id`, `file_path`, `file_size`, `is_public`, `created_by`, `created_at`) VALUES
(3, 'คู่มือการใช้งานเว็บไซต์ (สาธารณะ)', 'lorem ipsum', 3, 'doc_6a9ce81e7a1fc.png', '2.61 KB', 1, 1, '2026-09-06 04:12:14'),
(4, 'TEST PDF', 'lorem ipsum', 3, 'doc_6a9ce8d7d1be7.pdf', '60.41 KB', 1, 1, '2026-09-06 04:15:19'),
(9, 'อิสลาม', '', 5, 'doc_6a9e063d54ad8.jpg', '296.61 KB', 0, 3, '2026-09-07 00:33:00'),
(10, 'คู่มือการละหมาด', 'สำหรับอิสลาม', 5, 'doc_6a9e568944a84.jpeg', '71.23 KB', 1, 1, '2026-09-07 06:15:37'),
(12, 'คู่มือดุอาก่อนนอน', 'สำหรับอิสลาม', 5, 'doc_6a9e5739961fe.jpeg', '97.49 KB', 1, 1, '2026-09-07 06:18:33') ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- --------------------------------------------------------

--
-- Table structure for table `download_logs`
--

CREATE TABLE IF NOT EXISTS `download_logs` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `downloaded_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `download_logs`
--

INSERT IGNORE INTO `download_logs` (`id`, `document_id`, `user_id`, `ip_address`, `downloaded_at`) VALUES
(1, 12, 4, '49.237.40.38', '2026-09-07 06:21:54');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `role`, `created_at`) VALUES
(1, 'admin', 'admin@docportal.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', '2026-09-06 03:44:20'),
(3, 'user1', 'user@docsys.com', '$2y$10$ev/sEdpqSZLXHRUWe6e0QeVf8wH4C34noxHKlGGHcN4YbclGm1iBa', 'John Doe', 'user', '2026-09-07 00:28:43'),
(4, 'islam', 'yaaynucht@sunti.com', '$2y$10$Kty.slAHnuTM8dvNvUgVI.WsCuYivDmm/A/i7JBoUywyyYvV0R5DK', 'วีรนุช หุณฑะสมบัติศิริ', 'user', '2026-09-07 06:12:10') ON DUPLICATE KEY UPDATE `username`=VALUES(`username`);

-- --------------------------------------------------------

--
-- Table structure for table `user_documents`
--

CREATE TABLE IF NOT EXISTS `user_documents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY IF NOT EXISTS (`id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY IF NOT EXISTS (`id`),
  ADD KEY IF NOT EXISTS `category_id` (`category_id`),
  ADD KEY IF NOT EXISTS `created_by` (`created_by`);

--
-- Indexes for table `download_logs`
--
ALTER TABLE `download_logs`
  ADD PRIMARY KEY IF NOT EXISTS (`id`),
  ADD KEY IF NOT EXISTS `document_id` (`document_id`),
  ADD KEY IF NOT EXISTS `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY IF NOT EXISTS (`id`),
  ADD UNIQUE KEY IF NOT EXISTS `username` (`username`),
  ADD UNIQUE KEY IF NOT EXISTS `email` (`email`);

--
-- Indexes for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD PRIMARY KEY IF NOT EXISTS (`id`),
  ADD KEY IF NOT EXISTS `user_id` (`user_id`),
  ADD KEY IF NOT EXISTS `document_id` (`document_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `download_logs`
--
ALTER TABLE `download_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_documents`
--
ALTER TABLE `user_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `download_logs`
--
ALTER TABLE `download_logs`
  ADD CONSTRAINT `download_logs_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `download_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD CONSTRAINT `user_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_documents_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
