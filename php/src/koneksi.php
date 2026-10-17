<?php
// koneksi.php - koneksi PDO (padanan Kode 8.8)
// Kredensial dibaca dari variabel lingkungan (diatur di docker-compose.yml).

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    $host = getenv('DB_HOST') ?: 'localhost';
    $port = getenv('DB_PORT') ?: '3306';
    $nama = getenv('DB_NAME') ?: 'db_kampus';
    $dsn  = "mysql:host=$host;port=$port;dbname=$nama;charset=utf8mb4";

    $pdo = new PDO($dsn, getenv('DB_USER') ?: 'app_kampus', getenv('DB_PASS') ?: '', [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,   // prepared statement asli
    ]);
    return $pdo;
}
