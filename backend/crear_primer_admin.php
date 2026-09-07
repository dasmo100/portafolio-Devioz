<?php
/**
 * Portafolio Devioz - Script de primer uso para crear el Administrador inicial
 * 
 * ADVERTENCIA DE SEGURIDAD:
 * Este script solo debe ejecutarse una vez al instalar la aplicación.
 * Debe ser eliminado inmediatamente después de su uso.
 */

require_once __DIR__ . '/config/db.php';

// Asegurar que la tabla usuarios exista
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `usuarios` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `usuario` VARCHAR(50) NOT NULL UNIQUE,
        `email` VARCHAR(100) DEFAULT NULL,
        `clave` VARCHAR(255) NOT NULL,
        `rol` VARCHAR(30) NOT NULL DEFAULT 'administrador',
        `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
} catch (PDOException $e) {
    die("Error al verificar o crear la tabla 'usuarios': " . $e->getMessage());
}

// Comprobar si la tabla usuarios está vacía
try {
    $stmt = $pdo->query("SELECT COUNT(*) AS total FROM `usuarios`");
    $total = (int) $stmt->fetchColumn();
} catch (PDOException $e) {
    die("Error al consultar la tabla 'usuarios': " . $e->getMessage());
}

$isCli = (php_sapi_name() === 'cli');

// Si ya existen usuarios, permitir restablecimiento explícito o denegar ejecución por seguridad
if ($total > 0) {
    // Si el usuario solicita restablecer la contraseña del admin existente a admin123
    $doReset = (isset($_GET['reset']) && $_GET['reset'] === '1');

    if ($doReset) {
        $newHash = password_hash('admin123', PASSWORD_BCRYPT);
        $up = $pdo->prepare("UPDATE `usuarios` SET `clave` = :c, `rol` = 'administrador' WHERE `usuario` = 'admin'");
        $up->execute([':c' => $newHash]);

        if ($isCli) {
            echo "\n[ÉXITO] La contraseña del usuario 'admin' ha sido restablecida a 'admin123' (PASSWORD_BCRYPT).\n\n";
        } else {
            header('Content-Type: text/html; charset=utf-8');
            echo '<!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Contraseña Restablecida | Devioz</title>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; background: #06060e; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(0,229,212,0.3); border-radius: 16px; padding: 32px; max-width: 500px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                    h1 { color: #00e5d4; font-size: 1.5rem; margin-top: 0; }
                    p { line-height: 1.6; color: #94a3b8; }
                    .alert-box { background: rgba(0,229,212,0.12); color: #5eead4; padding: 14px; border-radius: 8px; font-weight: 500; margin: 20px 0; }
                    .btn { display: inline-block; background: #00e5d4; color: #06060e; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 8px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Contraseña de Admin Restablecida</h1>
                    <p>La clave del usuario <code>admin</code> se ha actualizado a <code>admin123</code> con <code>PASSWORD_BCRYPT</code>.</p>
                    <div class="alert-box">
                        Credenciales: <strong>admin</strong> / <strong>admin123</strong>
                    </div>
                    <a href="../frontend/login.html" class="btn">Iniciar Sesión</a>
                </div>
            </body>
            </html>';
        }
        exit(0);
    }

    if ($isCli) {
        echo "\n[ALERTA DE SEGURIDAD] La tabla 'usuarios' ya contiene registros ($total usuario(s)).\n";
        echo "No se ha creado ningun usuario adicional.\n";
        echo "Para restablecer la clave del admin existente a 'admin123', ejecuta: php backend/crear_primer_admin.php 1\n";
        echo "O bien, ELIMINA este archivo (backend/crear_primer_admin.php) inmediatamente.\n\n";
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Seguridad | Devioz</title>
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #06060e; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(239,68,68,0.3); border-radius: 16px; padding: 32px; max-width: 500px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                h1 { color: #f87171; font-size: 1.5rem; margin-top: 0; }
                p { line-height: 1.6; color: #94a3b8; }
                .alert-box { background: rgba(239,68,68,0.12); color: #fca5a5; padding: 14px; border-radius: 8px; font-weight: 500; margin: 20px 0; }
                .btn { display: inline-block; background: #00e5d4; color: #06060e; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 8px; margin: 6px; }
                .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Usuarios Detectados</h1>
                <p>La tabla <code>usuarios</code> ya cuenta con usuarios registrados en el sistema (' . $total . ' registro(s)).</p>
                <div class="alert-box">
                    Si no recuerdas la contraseña del administrador actual, puedes restablecerla a <code>admin123</code> con el siguiente botón:
                </div>
                <a href="crear_primer_admin.php?reset=1" class="btn">Restablecer clave admin a admin123</a>
                <a href="../frontend/login.html" class="btn btn-secondary">Ir al Login</a>
            </div>
        </body>
        </html>';
    }
    exit(0);
}

// Si está vacía: Crear el primer administrador con PASSWORD_BCRYPT
$defaultUser = 'admin';
$defaultEmail = 'admin@devioz.com';
$defaultPass = 'admin123';
$defaultRole = 'administrador';

$passwordHash = password_hash($defaultPass, PASSWORD_BCRYPT);

try {
    $insertStmt = $pdo->prepare("INSERT INTO `usuarios` (`usuario`, `email`, `clave`, `rol`) VALUES (:usuario, :email, :clave, :rol)");
    $insertStmt->execute([
        ':usuario' => $defaultUser,
        ':email'   => $defaultEmail,
        ':clave'   => $passwordHash,
        ':rol'     => $defaultRole
    ]);
} catch (PDOException $e) {
    die("Error al insertar el primer administrador: " . $e->getMessage());
}

if ($isCli) {
    echo "\n==========================================================\n";
    echo " ¡PRIMER ADMINISTRADOR CREADO CON ÉXITO!\n";
    echo "==========================================================\n";
    echo " Usuario:       $defaultUser\n";
    echo " Email:         $defaultEmail\n";
    echo " Clave temporal: $defaultPass\n";
    echo " Rol:           $defaultRole\n";
    echo "----------------------------------------------------------\n";
    echo " [AVISO CRÍTICO DE SEGURIDAD]:\n";
    echo " Por favor, ELIMINA este archivo (backend/crear_primer_admin.php)\n";
    echo " inmediatamente para evitar que terceros manipulen la cuenta.\n";
    echo "==========================================================\n\n";
} else {
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Primer Administrador Creado | Devioz</title>
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #06060e; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(0,229,212,0.3); border-radius: 16px; padding: 36px; max-width: 520px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
            h1 { color: #00e5d4; font-size: 1.6rem; margin-top: 0; }
            p { color: #94a3b8; line-height: 1.6; }
            .creds-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: rgba(0,0,0,0.4); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
            .creds-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .creds-table td.label { font-weight: bold; color: #cbd5e1; width: 40%; }
            .creds-table td.val { color: #5eead4; font-family: monospace; font-size: 1rem; }
            .alert-danger { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 16px; border-radius: 10px; margin: 24px 0 16px; text-align: left; font-size: 0.9rem; line-height: 1.5; }
            .alert-danger strong { color: #ef4444; display: block; margin-bottom: 6px; font-size: 0.95rem; }
            .btn { display: inline-block; background: #00e5d4; color: #06060e; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; transition: opacity 0.2s; }
            .btn:hover { opacity: 0.9; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Primer Administrador Creado con Éxito</h1>
            <p>Se ha configurado la cuenta de superadministrador en la base de datos con contraseña cifrada mediante <code>password_hash()</code>.</p>
            
            <table class="creds-table">
                <tr><td class="label">Usuario:</td><td class="val">' . htmlspecialchars($defaultUser) . '</td></tr>
                <tr><td class="label">Email:</td><td class="val">' . htmlspecialchars($defaultEmail) . '</td></tr>
                <tr><td class="label">Contraseña:</td><td class="val">' . htmlspecialchars($defaultPass) . '</td></tr>
                <tr><td class="label">Rol:</td><td class="val">' . htmlspecialchars($defaultRole) . '</td></tr>
            </table>

            <div class="alert-danger">
                <strong>⚠️ ACCIÓN DE SEGURIDAD OBLIGATORIA:</strong>
                Por favor, <u>elimina este archivo (<code>backend/crear_primer_admin.php</code>) inmediatamente</u> de tu servidor para evitar que nadie más intente ejecutarlo.
            </div>

            <a href="../frontend/login.html" class="btn">Iniciar Sesión en el Admin</a>
        </div>
    </body>
    </html>';
}
