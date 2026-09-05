<?php
namespace App\Config;

use PDO;
use PDOException;

class Database {
    private static $instance = null;

    public static function getConnection() {
        if (self::$instance === null) {
            $host = $_ENV['DB_HOST'] ?? 'mariadb';
            $db   = $_ENV['DB_NAME'] ?? 'doc_system';
            $user = $_ENV['DB_USER'] ?? 'doc_user';
            $pass = $_ENV['DB_PASS'] ?? 'doc_password';
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                // Return null instead of throwing in API to gracefully fail
                self::$instance = null; 
            }
        }
        return self::$instance;
    }
}
