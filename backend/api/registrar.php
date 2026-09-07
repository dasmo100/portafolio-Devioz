<?php
/**
 * Portafolio Devioz - Endpoint protegido para registro de usuarios
 * 
 * Acceso EXCLUSIVO para administradores autenticados.
 * El registro público está deshabilitado.
 */

// Iniciar sesión para validar rol del usuario activo
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

// 1. Solo admitir método POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'code' => 405,
        'message' => 'Método no permitido. Se requiere petición POST.'
    ]);
    exit();
}

// 2. VALIDACIÓN DE SEGURIDAD ESTRICTA:
// Solo usuarios con sesión activa y rol administrador pueden registrar nuevas cuentas
$rolSesion = strtolower(trim($_SESSION['rol'] ?? ''));
if (empty($_SESSION['usuario_id']) || !in_array($rolSesion, ['admin', 'administrador', 'superadmin'], true)) {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'code' => 403,
        'message' => 'Acceso denegado: Se requieren privilegios de administrador para crear o gestionar usuarios en el sistema.'
    ]);
    exit();
}

// 3. Conexión a la base de datos (solo accesible para administradores autorizados)
require_once __DIR__ . '/../config/db.php';

// Obtener datos del cuerpo JSON o de $_POST
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$usuario = isset($data['usuario']) ? trim($data['usuario']) : (isset($data['username']) ? trim($data['username']) : '');
$clave   = isset($data['clave']) ? $data['clave'] : (isset($data['password']) ? $data['password'] : '');
$email   = isset($data['email']) ? trim($data['email']) : null;
$rol     = isset($data['rol']) ? trim($data['rol']) : 'administrador';

// Validar campos obligatorios
if ($usuario === '' || $clave === '') {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'code' => 400,
        'message' => 'Campos obligatorios faltantes: el usuario y la clave no pueden estar vacíos.'
    ]);
    exit();
}

// Validar formato de email si se proporciona
if ($email !== null && $email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'code' => 400,
        'message' => 'El correo electrónico proporcionado no tiene un formato válido.'
    ]);
    exit();
}

// Normalizar rol permitido
$rolesPermitidos = ['administrador', 'editor'];
if (!in_array($rol, $rolesPermitidos, true)) {
    $rol = 'administrador';
}

try {
    // Verificar si el usuario o email ya existen (buscando en usuario, nombre y email)
    $checkQuery = "SELECT `id` FROM `usuarios` WHERE `usuario` = :usuario OR `nombre` = :usuario";
    $params = [':usuario' => $usuario];
    if ($email !== null && $email !== '') {
        $checkQuery .= " OR `email` = :email";
        $params[':email'] = $email;
    }
    
    $checkStmt = $pdo->prepare($checkQuery);
    $checkStmt->execute($params);

    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'status' => 'error',
            'code' => 409,
            'message' => 'El nombre de usuario o correo electrónico ya se encuentra registrado.'
        ]);
        exit();
    }

    // Encriptar la contraseña de forma segura
    $passwordHash = password_hash($clave, PASSWORD_DEFAULT);

    // Insertar el nuevo usuario en la base de datos soportando ambas estructuras de columnas
    $insertStmt = $pdo->prepare("INSERT INTO `usuarios` (`usuario`, `nombre`, `email`, `clave`, `password`, `rol`) VALUES (:usuario, :nombre, :email, :clave, :password, :rol)");
    $insertStmt->execute([
        ':usuario'  => $usuario,
        ':nombre'   => $usuario,
        ':email'    => $email !== '' ? $email : null,
        ':clave'    => $passwordHash,
        ':password' => $passwordHash,
        ':rol'      => $rol
    ]);

    $newId = (int) $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'code' => 201,
        'message' => 'Usuario creado exitosamente.',
        'data' => [
            'id' => $newId,
            'usuario' => $usuario,
            'email' => $email,
            'rol' => $rol
        ]
    ]);
    exit();

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'code' => 500,
        'message' => 'Error en el servidor al registrar el usuario: ' . $e->getMessage()
    ]);
    exit();
}
