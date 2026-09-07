<?php
if (!headers_sent()) {
    $corsOrigin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    if ($corsOrigin !== '*' && !empty($corsOrigin)) {
        header("Access-Control-Allow-Origin: $corsOrigin");
        header('Access-Control-Allow-Credentials: true');
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Content-Type: application/json; charset=utf-8');
}

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_NAME') ?: 'portafolio_devioz';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : ''; // Cambia esto si tu MySQL tiene contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    if ($e->getCode() === 1049 || stripos($e->getMessage(), 'Unknown database') !== false) {
        try {
            $pdoInit = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
            $pdoInit->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdoInit->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            $sqlFile = realpath(__DIR__ . '/../../database/script.sql');
            if ($sqlFile && file_exists($sqlFile)) {
                $sqlCommands = file_get_contents($sqlFile);
                if (!empty($sqlCommands)) {
                    $pdo->exec($sqlCommands);
                }
            }
        } catch (PDOException $initEx) {
            if (!headers_sent()) {
                http_response_code(500);
            }
            die(json_encode(['error' => 'Error al inicializar la base de datos: ' . $initEx->getMessage()]));
        }
    } else {
        if (!headers_sent()) {
            http_response_code(500);
        }
        die(json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]));
    }
}
