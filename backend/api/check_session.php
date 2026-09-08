<?php
/**
 * Portafolio Devioz - Verificación de sesión activa de administrador
 * 
 * Usado por admin.html para validación estricta al cargar la página.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if ($origin !== '*') {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Validación de sesión de administrador (admite 'administrador', 'admin', 'superadmin')
$rol = strtolower(trim($_SESSION['rol'] ?? ''));
if (!empty($_SESSION['usuario_id']) && in_array($rol, ['admin', 'administrador', 'superadmin'], true)) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'usuario_id' => (int) $_SESSION['usuario_id'],
        'usuario' => $_SESSION['usuario'] ?? '',
        'rol' => $_SESSION['rol']
    ]);
    exit();
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'No existe una sesión PHP activa de administrador.'
    ]);
    exit();
}
