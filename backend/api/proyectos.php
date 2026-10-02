<?php
header('Content-Type: application/json; charset=utf-8');

/**
 * Portafolio Devioz - API CRUD de Proyectos (Completamente autónomo sin dependencia de categorias)
 * 
 * Maneja operaciones completas:
 * GET: Obtener todos los proyectos o filtrados
 * POST: Crear nuevo proyecto (con subida de imagen local o URL)
 * PUT / POST (action=update): Editar proyecto existente
 * DELETE / POST (action=delete): Eliminar proyecto y remover imagen física
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuración CORS con soporte de credenciales (cookies de sesión)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if ($origin !== '*') {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'POST') {
    $action = $_POST['action'] ?? ($_GET['action'] ?? '');
    if ($action === 'update' || ($_POST['_method'] ?? '') === 'PUT') {
        $method = 'PUT';
    } else if ($action === 'delete' || ($_POST['_method'] ?? '') === 'DELETE') {
        $method = 'DELETE';
    }
}

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

// Directorio físico de uploads de imágenes
$uploadDir = realpath(__DIR__ . '/../../frontend/assets/img') . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
}

// Directorio físico de uploads de videos cortos
$videoUploadDir = $uploadDir . 'videos' . DIRECTORY_SEPARATOR;
if (!is_dir($videoUploadDir)) {
    @mkdir($videoUploadDir, 0777, true);
}

// Directorio privado y seguro para archivos ZIP de proyectos (Solo visible/descargable por el administrador)
$zipStorageDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'zips' . DIRECTORY_SEPARATOR;
if (!is_dir($zipStorageDir)) {
    @mkdir($zipStorageDir, 0777, true);
    $htaccessFile = $zipStorageDir . '.htaccess';
    if (!file_exists($htaccessFile)) {
        @file_put_contents($htaccessFile, "Deny from all\n");
    }
}

// -------------------------------------------------------------
// Sincronización de estructura en tabla proyectos (Sin dependencia de categorias)
// -------------------------------------------------------------
try {
    // 1. Eliminar cualquier restricción de clave foránea hacia categorias si estuviera presente
    try {
        $fks = $pdo->query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'proyectos' AND CONSTRAINT_NAME = 'fk_proyectos_categoria'")->fetchAll();
        if (!empty($fks)) {
            $pdo->exec("ALTER TABLE `proyectos` DROP FOREIGN KEY `fk_proyectos_categoria`");
        }
    } catch (Exception $fkEx) {
        // Ignorar si no existe restricción
    }

    // 2. Asegurar columnas en la tabla proyectos
    $projCols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);

    // Almacenar categoría directamente como texto plano en proyectos
    if (!in_array('categoria', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `categoria` VARCHAR(100) NULL DEFAULT 'General' AFTER `id`");
        $projCols[] = 'categoria';
    }

    // Si existe categoria_id, permitir que sea NULLABLE para máxima compatibilidad
    if (in_array('categoria_id', $projCols)) {
        try {
            $pdo->exec("ALTER TABLE `proyectos` MODIFY COLUMN `categoria_id` INT NULL DEFAULT NULL");
        } catch (Exception $alterEx) {}
    }

    if (!in_array('tecnologias', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `tecnologias` VARCHAR(255) NULL");
    }
    if (!in_array('imagen', $projCols) && in_array('imagen_url', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `imagen` VARCHAR(255) NULL");
        $pdo->exec("UPDATE `proyectos` SET `imagen` = `imagen_url` WHERE `imagen` IS NULL");
    }
    if (!in_array('imagen_url', $projCols) && in_array('imagen', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `imagen_url` VARCHAR(255) NULL");
        $pdo->exec("UPDATE `proyectos` SET `imagen_url` = `imagen` WHERE `imagen_url` IS NULL");
    }
    if (!in_array('enlace_demo', $projCols) && in_array('demo_url', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `enlace_demo` VARCHAR(255) NULL");
        $pdo->exec("UPDATE `proyectos` SET `enlace_demo` = `demo_url` WHERE `enlace_demo` IS NULL");
    }
    if (!in_array('demo_url', $projCols) && in_array('enlace_demo', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `demo_url` VARCHAR(255) NULL");
        $pdo->exec("UPDATE `proyectos` SET `demo_url` = `enlace_demo` WHERE `demo_url` IS NULL");
    }
    if (!in_array('usuario_id', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `usuario_id` INT NULL DEFAULT 1");
    }
    if (!in_array('estado', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `estado` TINYINT(1) DEFAULT 1");
    }
    if (!in_array('destacado', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `destacado` TINYINT(1) DEFAULT 0");
    }
    if (!in_array('fecha_creacion', $projCols) && in_array('creado_en', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        $pdo->exec("UPDATE `proyectos` SET `fecha_creacion` = `creado_en` WHERE `fecha_creacion` IS NULL");
    }
    if (!in_array('archivo_zip', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `archivo_zip` VARCHAR(255) NULL");
        $projCols[] = 'archivo_zip';
    }
    if (!in_array('video_url', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `video_url` VARCHAR(255) NULL");
        $projCols[] = 'video_url';
    }
    if (!in_array('imagenes', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `imagenes` TEXT NULL");
        $projCols[] = 'imagenes';
    }

    // 3. Proyectos iniciales en caso de base de datos vacía
    $countProjs = (int) $pdo->query("SELECT COUNT(*) FROM `proyectos`")->fetchColumn();
    if ($countProjs < 2) {
        $initialProjs = [
            [
                'titulo' => 'Plataforma E-Commerce SaaS',
                'descripcion' => 'Sistema integral de comercio electrónico con pasarela de pagos, gestión de stock en tiempo real y analítica avanzada.',
                'imagen' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'PHP, MySQL, JavaScript, Bootstrap 5',
                'categoria' => 'Desarrollo Web'
            ],
            [
                'titulo' => 'Identidad Visual & Branding',
                'descripcion' => 'Diseño integral de marca corporativa, guías de estilo, kit de tipografía y papelería digital con altos estándares estéticos.',
                'imagen' => 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'Figma, Illustrator, Photoshop, Brand Guidelines',
                'categoria' => 'Diseño Gráfico'
            ],
            [
                'titulo' => 'Spot Cinematográfico 4K',
                'descripcion' => 'Producción audiovisual publicitaria con modelado 3D, animación de marca y masterización de sonido envolvente.',
                'imagen' => 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'After Effects, Premiere Pro, Blender 3D, VFX',
                'categoria' => 'Spots Publicitarios'
            ],
            [
                'titulo' => 'Dashboard Ejecutivo BI & KPIs',
                'descripcion' => 'Tableros de analítica interactiva y pronóstico de ventas con sincronización automatizada de bases de datos.',
                'imagen' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'Power BI, PostgreSQL, Python, ETL Pipeline',
                'categoria' => 'Business Intelligence'
            ],
            [
                'titulo' => 'Neural Assistant & RAG Copilot',
                'descripcion' => 'Motor conversacional con embeddings vectoriales para consultas sobre documentación corporativa con respuestas precisas.',
                'imagen' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'Python, FastAPI, Gemini API, Vector DB',
                'categoria' => 'Inteligencia Artificial'
            ]
        ];

        $activeCols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);

        foreach ($initialProjs as $pData) {
            $checkP = $pdo->prepare("SELECT `id` FROM `proyectos` WHERE `titulo` = :t LIMIT 1");
            $checkP->execute([':t' => $pData['titulo']]);
            if (!$checkP->fetch()) {
                $insertCols = ['`titulo`', '`descripcion`'];
                $insertVals = [':t', ':d'];
                $insertParams = [':t' => $pData['titulo'], ':d' => $pData['descripcion']];

                if (in_array('categoria', $activeCols)) {
                    $insertCols[] = '`categoria`';
                    $insertVals[] = ':cat';
                    $insertParams[':cat'] = $pData['categoria'];
                }
                if (in_array('imagen', $activeCols)) {
                    $insertCols[] = '`imagen`';
                    $insertVals[] = ':img';
                    $insertParams[':img'] = $pData['imagen'];
                }
                if (in_array('imagen_url', $activeCols)) {
                    $insertCols[] = '`imagen_url`';
                    $insertVals[] = ':img_url';
                    $insertParams[':img_url'] = $pData['imagen'];
                }
                if (in_array('tecnologias', $activeCols)) {
                    $insertCols[] = '`tecnologias`';
                    $insertVals[] = ':tech';
                    $insertParams[':tech'] = $pData['tecnologias'];
                }
                if (in_array('usuario_id', $activeCols)) {
                    $insertCols[] = '`usuario_id`';
                    $insertVals[] = '1';
                }
                if (in_array('estado', $activeCols)) {
                    $insertCols[] = '`estado`';
                    $insertVals[] = '1';
                }

                $sqlIns = "INSERT INTO `proyectos` (" . implode(', ', $insertCols) . ") VALUES (" . implode(', ', $insertVals) . ")";
                $insP = $pdo->prepare($sqlIns);
                $insP->execute($insertParams);
            }
        }
    }
} catch (Exception $e) {
    error_log("Error de sincronización en BD: " . $e->getMessage());
}

function normalizarUrlWeb($url) {
    if ($url === null || $url === false) return null;
    $trimmed = trim((string)$url);
    if ($trimmed === '' || in_array(strtolower($trimmed), ['null', 'undefined', 'none', '#'], true)) {
        return null;
    }
    if (!preg_match('~^(?:f|ht)tps?://~i', $trimmed)) {
        $trimmed = 'https://' . $trimmed;
    }
    return $trimmed;
}

// -------------------------------------------------------------
// Función de verificación de sesión de administrador
// -------------------------------------------------------------
function verificarAdminAutenticado() {
    $rol = strtolower(trim($_SESSION['rol'] ?? ''));
    $esAdmin = !empty($_SESSION['usuario_id']) && in_array($rol, ['admin', 'administrador', 'superadmin'], true);

    // Soporte para entornos locales de desarrollo con token en cabeceras personalizadas o parámetros POST/GET
    if (!$esAdmin) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ($_SERVER['HTTP_X_AUTHORIZATION'] ?? '')));
        if (empty($authHeader) && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? ($headers['X-Admin-Token'] ?? ($headers['x-admin-token'] ?? '')));
        }
        $tokenParam = $_POST['admin_token'] ?? ($_GET['admin_token'] ?? ($_POST['token'] ?? ($_GET['token'] ?? '')));

        if ((!empty($authHeader) && stripos($authHeader, 'devioz_admin') !== false) || 
            (!empty($tokenParam) && stripos($tokenParam, 'devioz_admin') !== false)) {
            $esAdmin = true;
        }
    }

    if (!$esAdmin) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'code' => 403,
            'message' => 'Acceso denegado: Se requieren permisos de administrador activos para realizar esta operación.'
        ]);
        exit();
    }
}

function esAdminActivo() {
    $rol = strtolower(trim($_SESSION['rol'] ?? ''));
    if (!empty($_SESSION['usuario_id']) && in_array($rol, ['admin', 'administrador', 'superadmin'], true)) {
        return true;
    }
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ($_SERVER['HTTP_X_AUTHORIZATION'] ?? '')));
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? ($headers['X-Admin-Token'] ?? ($headers['x-admin-token'] ?? '')));
    }
    $tokenParam = $_POST['admin_token'] ?? ($_GET['admin_token'] ?? ($_POST['token'] ?? ($_GET['token'] ?? '')));

    if ((!empty($authHeader) && stripos($authHeader, 'devioz_admin') !== false) || 
        (!empty($tokenParam) && stripos($tokenParam, 'devioz_admin') !== false)) {
        return true;
    }
    return false;
}

// Detectar sobreescritura de método HTTP (común en formularios HTML y FormData)
if ($method === 'POST') {
    $action = $_POST['action'] ?? ($_GET['action'] ?? '');
    $overrideMethod = $_POST['_method'] ?? ($_GET['_method'] ?? '');

    if (strtoupper($overrideMethod) === 'PUT' || $action === 'update' || $action === 'edit') {
        $method = 'PUT';
    } else if (strtoupper($overrideMethod) === 'DELETE' || $action === 'delete') {
        $method = 'DELETE';
    }
}

// -------------------------------------------------------------
// Descarga de archivo ZIP del proyecto (Exclusiva para Administrador)
// -------------------------------------------------------------
$reqAction = $_GET['action'] ?? ($_POST['action'] ?? '');
if ($method === 'GET' && ($reqAction === 'download_zip' || isset($_GET['download_zip']))) {
    verificarAdminAutenticado();
    $id = (int)($_GET['id'] ?? ($_GET['download_zip'] ?? 0));
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de proyecto no válido para la descarga.']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT `id`, `titulo`, `archivo_zip` FROM `proyectos` WHERE `id` = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $proj = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$proj || empty($proj['archivo_zip'])) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Este proyecto no cuenta con un archivo ZIP adjunto o no fue encontrado.']);
        exit();
    }

    $zipFileName = basename($proj['archivo_zip']);
    $zipFilePath = $zipStorageDir . $zipFileName;

    if (!file_exists($zipFilePath)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'El archivo ZIP no se encuentra almacenado físicamente en el servidor.']);
        exit();
    }

    // Nombre descriptivo para la descarga (nombre original del ZIP o título del proyecto)
    $origNamePart = preg_replace('/^zip_\d{8}_\d{6}_/', '', $zipFileName);
    $origNamePart = preg_replace('/^proj_zip_\d{8}_\d{6}_[a-f0-9]+_?/', '', $origNamePart);
    if (!empty($origNamePart) && str_ends_with(strtolower($origNamePart), '.zip') && strlen($origNamePart) > 4) {
        $downloadName = $origNamePart;
    } else {
        $cleanTitle = preg_replace('/[^A-Za-z0-9_-]+/', '_', trim($proj['titulo']));
        $downloadName = (!empty($cleanTitle) ? $cleanTitle : 'proyecto') . '_v' . $proj['id'] . '.zip';
    }

    // Desactivar compresión de salida y limpiar búfer antes de enviar binario
    if (ini_get('zlib.output_compression')) {
        ini_set('zlib.output_compression', 'Off');
    }
    while (ob_get_level()) {
        ob_end_clean();
    }

    header('Content-Description: File Transfer');
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Content-Length: ' . filesize($zipFilePath));

    readfile($zipFilePath);
    exit();
}

// -------------------------------------------------------------
// Limpieza de almacenamiento y purga de archivos huérfanos (Solo Admin)
// -------------------------------------------------------------
if ($reqAction === 'limpiar_almacenamiento' || $reqAction === 'cleanup_storage') {
    verificarAdminAutenticado();
    $reporte = ejecutarLimpiezaAutomaticaHuerfanos($pdo, $uploadDir, $videoUploadDir, $zipStorageDir, 0);
    echo json_encode([
        'status' => 'success',
        'code' => 200,
        'message' => $reporte['total_eliminados'] > 0
            ? "Limpieza automática completada: se liberaron {$reporte['mb_liberados']} MB eliminando {$reporte['total_eliminados']} archivo(s) obsoleto(s)."
            : "El almacenamiento local está completamente limpio y optimizado. No hay archivos huérfanos.",
        'data' => $reporte
    ]);
    exit();
}

// -------------------------------------------------------------
// 1. GET: Consultar proyectos (totalmente desacoplado de categorias)
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        // Detectar columnas existentes en la tabla proyectos
        $projCols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);

        $selectFields = ['p.`id`'];
        $selectFields[] = 'p.`titulo`';

        if (in_array('categoria', $projCols)) {
            $selectFields[] = 'p.`categoria`';
            $selectFields[] = "COALESCE(p.`categoria`, 'General') AS `categoria_nombre`";
        } else {
            $selectFields[] = "'General' AS `categoria`";
            $selectFields[] = "'General' AS `categoria_nombre`";
        }
        $selectFields[] = "'general' AS `categoria_slug`";
        $selectFields[] = "'📁' AS `categoria_icono`";

        if (in_array('categoria_id', $projCols)) {
            $selectFields[] = 'p.`categoria_id`';
        }
        if (in_array('descripcion', $projCols)) {
            $selectFields[] = 'p.`descripcion`';
        }
        if (in_array('imagen_url', $projCols)) {
            $selectFields[] = 'p.`imagen_url`';
        }
        if (in_array('imagen', $projCols)) {
            $selectFields[] = 'p.`imagen`';
        }
        if (in_array('demo_url', $projCols)) {
            $selectFields[] = 'p.`demo_url`';
        }
        if (in_array('enlace_demo', $projCols)) {
            $selectFields[] = 'p.`enlace_demo`';
        }
        if (in_array('tecnologias', $projCols)) {
            $selectFields[] = 'p.`tecnologias`';
        }
        if (in_array('destacado', $projCols)) {
            $selectFields[] = 'p.`destacado`';
        }
        if (in_array('estado', $projCols)) {
            $selectFields[] = 'p.`estado`';
        }
        if (in_array('creado_en', $projCols)) {
            $selectFields[] = 'p.`creado_en`';
        }
        if (in_array('fecha_creacion', $projCols)) {
            $selectFields[] = 'p.`fecha_creacion`';
        }
        $isAdmin = esAdminActivo();
        if (in_array('archivo_zip', $projCols)) {
            if ($isAdmin) {
                $selectFields[] = 'p.`archivo_zip`';
            } else {
                $selectFields[] = 'NULL AS `archivo_zip`';
            }
        }
        if (in_array('video_url', $projCols)) {
            $selectFields[] = 'p.`video_url`';
        }
        if (in_array('imagenes', $projCols)) {
            $selectFields[] = 'p.`imagenes`';
        }

        // Lectura del parámetro de categoría opcional
        $catParam = isset($_GET['categoria']) ? trim($_GET['categoria']) : (isset($_GET['categoria_id']) ? trim($_GET['categoria_id']) : '');

        $whereClauses = [];
        $params = [];

        if ($catParam !== '' && strtolower($catParam) !== 'all' && strtolower($catParam) !== 'todos') {
            if (in_array('categoria', $projCols)) {
                $whereClauses[] = "(p.`categoria` = :cat OR LOWER(p.`categoria`) = LOWER(:cat) OR p.`categoria` LIKE :cat_like)";
                $params[':cat'] = $catParam;
                $params[':cat_like'] = '%' . $catParam . '%';
            } else if (is_numeric($catParam) && in_array('categoria_id', $projCols)) {
                $whereClauses[] = "p.`categoria_id` = :cat_id";
                $params[':cat_id'] = (int) $catParam;
            }
        }

        // Si la columna 'estado' existe, asegurar que se muestren los proyectos activos para el público
        if (in_array('estado', $projCols) && empty($_SESSION['usuario_id']) && !isset($_GET['all_status'])) {
            $whereClauses[] = "(p.`estado` = 1 OR p.`estado` IS NULL)";
        }

        $sql = "SELECT " . implode(', ', $selectFields) . " FROM `proyectos` p";

        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }

        if (in_array('destacado', $projCols)) {
            $sql .= " ORDER BY p.`destacado` DESC, p.`id` DESC";
        } else {
            $sql .= " ORDER BY p.`id` DESC";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $proyectos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$proyectos) {
            $proyectos = [];
        }

        // Formatear rutas de imagen y tecnologías para fácil consumo
        foreach ($proyectos as &$p) {
            $p['id'] = (int) $p['id'];
            if (isset($p['categoria_id'])) {
                $p['categoria_id'] = $p['categoria_id'] !== null ? (int)$p['categoria_id'] : null;
            }
            $catName = !empty($p['categoria']) ? trim($p['categoria']) : (!empty($p['categoria_nombre']) ? trim($p['categoria_nombre']) : 'General');
            $p['categoria'] = $catName;
            $p['categoria_nombre'] = $catName;
            $p['categoria_slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $catName), '-'));
            if (empty($p['categoria_slug'])) $p['categoria_slug'] = 'general';
            $p['categoria_icono'] = '📁';

            $p['estado'] = (int) ($p['estado'] ?? ($p['destacado'] ?? 1));
            
            // Normalizar imagen tanto para imagen_url como para imagen
            $img = $p['imagen_url'] ?? ($p['imagen'] ?? '');
            if (!empty($img) && !str_starts_with($img, 'http://') && !str_starts_with($img, 'https://') && !str_starts_with($img, 'data:')) {
                // Formato relativo estándar: assets/img/uploads/archivo.ext
                $img = 'assets/img/uploads/' . basename($img);
            }
            $p['imagen_url'] = $img;
            $p['imagen'] = $img;

            // Normalizar video corto (video_url)
            $vid = $p['video_url'] ?? null;
            if (!empty($vid)) {
                $vid = trim((string)$vid);
                if (!str_starts_with($vid, 'http://') && !str_starts_with($vid, 'https://') && !str_starts_with($vid, 'data:')) {
                    if (!str_starts_with($vid, 'assets/')) {
                        $vid = 'assets/img/uploads/videos/' . basename($vid);
                    }
                }
            } else {
                $vid = null;
            }
            $p['video_url'] = $vid;
            $p['tiene_video'] = !empty($vid);

            // Normalizar galería de imágenes (hasta 4 imágenes máximo)
            $imgsList = [];
            if (!empty($p['imagenes'])) {
                $decoded = json_decode($p['imagenes'], true);
                if (is_array($decoded)) {
                    $imgsList = $decoded;
                } else {
                    $imgsList = array_map('trim', explode(',', (string)$p['imagenes']));
                }
            }
            if (empty($imgsList) && !empty($img)) {
                $imgsList = [$img];
            }
            $normImgs = [];
            foreach ($imgsList as $imItem) {
                if (empty($imItem)) continue;
                $imItem = trim((string)$imItem);
                if (!str_starts_with($imItem, 'http://') && !str_starts_with($imItem, 'https://') && !str_starts_with($imItem, 'data:')) {
                    if (!str_starts_with($imItem, 'assets/')) {
                        $imItem = 'assets/img/uploads/' . basename($imItem);
                    }
                }
                $normImgs[] = $imItem;
                if (count($normImgs) >= 4) break;
            }
            $p['imagenes'] = $normImgs;
            $p['imagenes_array'] = $normImgs;
            if (!empty($normImgs)) {
                $p['imagen_url'] = $normImgs[0];
                $p['imagen'] = $normImgs[0];
            }

            // Normalizar enlace demo tanto para demo_url como para enlace_demo
            $demo = normalizarUrlWeb($p['demo_url'] ?? ($p['enlace_demo'] ?? null));
            $p['demo_url'] = $demo;
            $p['enlace_demo'] = $demo;

            // Convertir tecnologías a array para componentes interactivos
            $p['tecnologias_array'] = !empty($p['tecnologias']) 
                ? array_map('trim', explode(',', $p['tecnologias']))
                : [];

            // Archivo ZIP del proyecto (Privado: Solo visible y accesible para el administrador)
            if ($isAdmin && !empty($p['archivo_zip'])) {
                $zipBase = basename($p['archivo_zip']);
                $zipDiskPath = $zipStorageDir . $zipBase;
                $p['archivo_zip'] = $zipBase;
                $p['tiene_zip'] = true;
                $p['zip_size'] = file_exists($zipDiskPath) ? filesize($zipDiskPath) : null;
            } else {
                $p['archivo_zip'] = null;
                $p['tiene_zip'] = false;
                $p['zip_size'] = null;
            }
        }
        unset($p);

        http_response_code(200);
        echo json_encode($proyectos);
        exit();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => $e->getMessage()
        ]);
        exit();
    }
}

// -------------------------------------------------------------
// Función auxiliar para procesar subida de imagen
// -------------------------------------------------------------
function procesarSubidaImagen($fileField, $uploadDir, $urlFieldFallback = '') {
    if (isset($_FILES[$fileField]) && $_FILES[$fileField]['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES[$fileField];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

        if (!in_array($ext, $allowedExts, true)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'code' => 400,
                'message' => 'Formato de imagen no permitido. Usa JPG, PNG, WEBP, GIF o SVG.'
            ]);
            exit();
        }

        $newFileName = 'proj_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            return 'assets/img/uploads/' . $newFileName;
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'code' => 500,
                'message' => 'No se pudo guardar la imagen subida en el servidor.'
            ]);
            exit();
        }
    }

    // Si no hubo archivo pero se envió URL externa
    if (!empty($urlFieldFallback)) {
        return trim($urlFieldFallback);
    }

    return null;
}

// -------------------------------------------------------------
// Función auxiliar para procesar subida de video corto
// -------------------------------------------------------------
function procesarSubidaVideo($fileField, $videoUploadDir, $urlFieldFallback = '') {
    if (isset($_FILES[$fileField]) && $_FILES[$fileField]['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES[$fileField];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExts = ['mp4', 'webm', 'mov', 'm4v', 'ogv'];

        if (!in_array($ext, $allowedExts, true)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'code' => 400,
                'message' => 'Formato de video no permitido. Usa MP4, WebM, MOV, M4V u OGV.'
            ]);
            exit();
        }

        // Tamaño máximo para video corto: 80MB
        if ($file['size'] > 80 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'code' => 400,
                'message' => 'El video seleccionado excede el tamaño máximo permitido (80MB).'
            ]);
            exit();
        }

        $newFileName = 'proj_vid_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $videoUploadDir . $newFileName;

        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            return 'assets/img/uploads/videos/' . $newFileName;
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'code' => 500,
                'message' => 'No se pudo guardar el archivo de video en el servidor.'
            ]);
            exit();
        }
    }

    if (!empty($urlFieldFallback)) {
        $trimmed = trim($urlFieldFallback);
        if ($trimmed !== '' && !in_array(strtolower($trimmed), ['null', 'undefined', 'none', '#'], true)) {
            return $trimmed;
        }
    }

    return null;
}

// -------------------------------------------------------------
// Función auxiliar para procesar galería de hasta 4 imágenes
// -------------------------------------------------------------
function procesarGaleriaImagenes($uploadDir, $existingImages = [], $urlFallback = '') {
    $finalImages = [];
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

    // 1. Conservar imágenes existentes enviadas (máximo 4)
    if (is_string($existingImages)) {
        $decoded = json_decode($existingImages, true);
        if (is_array($decoded)) {
            $existingImages = $decoded;
        } else if (!empty($existingImages)) {
            $existingImages = array_map('trim', explode(',', $existingImages));
        } else {
            $existingImages = [];
        }
    }
    if (is_array($existingImages)) {
        foreach ($existingImages as $img) {
            if (empty($img)) continue;
            $img = trim((string)$img);
            if (!str_starts_with($img, 'http://') && !str_starts_with($img, 'https://') && !str_starts_with($img, 'data:')) {
                if (!str_starts_with($img, 'assets/')) {
                    $img = 'assets/img/uploads/' . basename($img);
                }
            }
            if (!in_array($img, $finalImages, true)) {
                $finalImages[] = $img;
            }
            if (count($finalImages) >= 4) break;
        }
    }

    // 2. Procesar subidas múltiples en $_FILES['imagenes'] o $_FILES['project_images']
    $multiFiles = null;
    if (isset($_FILES['imagenes']) && is_array($_FILES['imagenes']['name'])) {
        $multiFiles = $_FILES['imagenes'];
    } else if (isset($_FILES['project_images']) && is_array($_FILES['project_images']['name'])) {
        $multiFiles = $_FILES['project_images'];
    }

    if ($multiFiles && is_array($multiFiles['name'])) {
        $fileCount = count($multiFiles['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            if (count($finalImages) >= 4) break; // Límite estricto de 4 imágenes
            if ($multiFiles['error'][$i] === UPLOAD_ERR_OK) {
                $ext = strtolower(pathinfo($multiFiles['name'][$i], PATHINFO_EXTENSION));
                if (in_array($ext, $allowedExts, true)) {
                    $newFileName = 'proj_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                    $destPath = $uploadDir . $newFileName;
                    if (move_uploaded_file($multiFiles['tmp_name'][$i], $destPath)) {
                        $finalImages[] = 'assets/img/uploads/' . $newFileName;
                    }
                }
            }
        }
    }

    // 3. Procesar archivos individuales numerados (project_image_0, project_image_1...)
    for ($i = 0; $i < 4; $i++) {
        if (count($finalImages) >= 4) break;
        $fieldName = 'project_image_' . $i;
        if (isset($_FILES[$fieldName]) && $_FILES[$fieldName]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$fieldName];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (in_array($ext, $allowedExts, true)) {
                $newFileName = 'proj_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $destPath = $uploadDir . $newFileName;
                if (move_uploaded_file($file['tmp_name'], $destPath)) {
                    $finalImages[] = 'assets/img/uploads/' . $newFileName;
                }
            }
        }
    }

    // 4. Si aún hay espacio (< 4) y se envió campo individual tradicional ('imagen' o 'projectImgFile')
    if (count($finalImages) < 4) {
        $singleKeys = ['imagen', 'projectImgFile'];
        foreach ($singleKeys as $sk) {
            if (count($finalImages) >= 4) break;
            if (isset($_FILES[$sk]) && !is_array($_FILES[$sk]['name']) && $_FILES[$sk]['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES[$sk];
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                if (in_array($ext, $allowedExts, true)) {
                    $newFileName = 'proj_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                    $destPath = $uploadDir . $newFileName;
                    if (move_uploaded_file($file['tmp_name'], $destPath)) {
                        $finalImages[] = 'assets/img/uploads/' . $newFileName;
                    }
                }
            }
        }
    }

    // 5. Fallback con URL única si aún está vacío
    if (empty($finalImages) && !empty($urlFallback)) {
        $trimmedUrl = trim($urlFallback);
        if ($trimmedUrl !== '') {
            $finalImages[] = $trimmedUrl;
        }
    }

    // 6. Si aún está completamente vacío, usar imagen de respaldo
    if (empty($finalImages)) {
        $finalImages[] = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
    }

    // Límite inquebrantable de máximo 4 imágenes
    return array_slice($finalImages, 0, 4);
}

// -------------------------------------------------------------
// Función auxiliar para procesar subida de archivo ZIP (Exclusivo Admin)
// -------------------------------------------------------------
function procesarSubidaZip($fileField, $zipStorageDir) {
    if (isset($_FILES[$fileField]) && $_FILES[$fileField]['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES[$fileField];
        $origName = $file['name'];
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        if ($ext !== 'zip') {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'code' => 400,
                'message' => 'Solo se permiten archivos en formato comprimido .ZIP para el código fuente.'
            ]);
            exit();
        }

        // Sanitizar el nombre original para que en la base de datos se reconozca claramente el archivo subido
        $rawBase = pathinfo($origName, PATHINFO_FILENAME);
        $cleanBase = preg_replace('/[^A-Za-z0-9_-]+/', '_', trim($rawBase));
        if (empty($cleanBase)) {
            $cleanBase = 'codigo';
        }

        $newZipName = 'zip_' . date('Ymd_His') . '_' . $cleanBase . '.zip';
        $destPath = $zipStorageDir . $newZipName;

        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            return $newZipName;
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'code' => 500,
                'message' => 'Error al guardar el archivo ZIP en el almacenamiento del servidor.'
            ]);
            exit();
        }
    }
    return null;
}

// -------------------------------------------------------------
// Función auxiliar para normalizar el texto de categoría (Autónoma)
// -------------------------------------------------------------
function resolverCategoriaTexto($catRaw) {
    if ($catRaw === null || $catRaw === '' || $catRaw === false) {
        return 'General';
    }
    $str = trim((string) $catRaw);
    if (in_array(strtolower($str), ['null', 'undefined', 'none', '0'], true) || empty($str)) {
        return 'General';
    }
    return $str;
}

// -------------------------------------------------------------
// Función auxiliar para eliminar de forma segura un archivo físico local
// Comprueba que no sea remoto, que exista en el directorio base
// y que ningún otro proyecto en la base de datos lo esté usando.
// -------------------------------------------------------------
function eliminarArchivoFisicoSeguro($rutaOArchivo, $baseDir, $pdo = null, $excluirProyectoId = 0) {
    if (empty($rutaOArchivo) || !is_string($rutaOArchivo)) {
        return false;
    }

    $trimmed = trim($rutaOArchivo);
    // Ignorar URLs remotas o data URIs
    if (preg_match('~^(?:f|ht)tps?://~i', $trimmed) || str_starts_with($trimmed, 'data:')) {
        return false;
    }

    $fileName = basename($trimmed);
    if (empty($fileName) || $fileName === '.' || $fileName === '..' || $fileName === '.gitkeep' || $fileName === '.htaccess') {
        return false;
    }

    $baseReal = realpath($baseDir);
    if (!$baseReal) {
        $baseReal = rtrim($baseDir, '/\\');
    }
    $targetPath = $baseReal . DIRECTORY_SEPARATOR . $fileName;

    if (!is_file($targetPath)) {
        return false;
    }

    // Si tenemos conexión a PDO, verificar que ningún OTRO proyecto en la BD esté usando este archivo
    if ($pdo instanceof PDO) {
        try {
            $likeParam = '%' . $fileName . '%';
            $sql = "SELECT COUNT(*) FROM `proyectos` WHERE (`imagen` LIKE :like OR `imagen_url` LIKE :like OR `video_url` LIKE :like OR `archivo_zip` LIKE :like OR `imagenes` LIKE :like)";
            $params = [':like' => $likeParam];
            if ($excluirProyectoId > 0) {
                $sql .= " AND `id` != :exId";
                $params[':exId'] = (int) $excluirProyectoId;
            }
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $enUsoPorOtros = (int) $stmt->fetchColumn();

            if ($enUsoPorOtros > 0) {
                // El archivo aún es requerido por otro proyecto, no se borra
                return false;
            }
        } catch (Exception $e) {
            // Ante cualquier duda, ser conservador
        }
    }

    return @unlink($targetPath);
}

// -------------------------------------------------------------
// Función de Limpieza Automática de Archivos Huérfanos (Garbage Collector)
// Escanea las carpetas locales de imágenes, videos y zips, y elimina
// los archivos que no estén asociados a ningún proyecto en la base de datos.
// -------------------------------------------------------------
function ejecutarLimpiezaAutomaticaHuerfanos($pdo, $uploadDir, $videoUploadDir, $zipStorageDir, $minAgeSeconds = 1800) {
    $reporte = [
        'imagenes_eliminadas' => 0,
        'videos_eliminados'   => 0,
        'zips_eliminados'     => 0,
        'total_eliminados'    => 0,
        'bytes_liberados'     => 0,
        'mb_liberados'        => 0.0
    ];

    if (!($pdo instanceof PDO)) {
        return $reporte;
    }

    try {
        // 1. Obtener todos los nombres de archivos que están actualmente en uso en la base de datos
        $stmt = $pdo->query("SELECT `imagen`, `imagen_url`, `video_url`, `archivo_zip`, `imagenes` FROM `proyectos`");
        $proyectos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $archivosActivos = [];
        foreach ($proyectos as $p) {
            if (!empty($p['imagen']) && !preg_match('~^https?://~i', $p['imagen'])) {
                $archivosActivos[basename($p['imagen'])] = true;
            }
            if (!empty($p['imagen_url']) && !preg_match('~^https?://~i', $p['imagen_url'])) {
                $archivosActivos[basename($p['imagen_url'])] = true;
            }
            if (!empty($p['video_url']) && !preg_match('~^https?://~i', $p['video_url'])) {
                $archivosActivos[basename($p['video_url'])] = true;
            }
            if (!empty($p['archivo_zip'])) {
                $archivosActivos[basename($p['archivo_zip'])] = true;
            }
            if (!empty($p['imagenes'])) {
                $dec = json_decode($p['imagenes'], true);
                if (is_array($dec)) {
                    foreach ($dec as $subImg) {
                        if (!empty($subImg) && !preg_match('~^https?://~i', $subImg)) {
                            $archivosActivos[basename($subImg)] = true;
                        }
                    }
                }
            }
        }

        $now = time();

        // 2. Limpieza de imágenes en uploads/ (archivos de subida de proyectos)
        if (is_dir($uploadDir)) {
            $archivosImg = scandir($uploadDir);
            if (is_array($archivosImg)) {
                foreach ($archivosImg as $file) {
                    if ($file === '.' || $file === '..' || $file === '.gitkeep' || is_dir($uploadDir . $file)) {
                        continue;
                    }
                    if (str_starts_with($file, 'proj_')) {
                        $fullFile = $uploadDir . $file;
                        if (!isset($archivosActivos[$file]) && is_file($fullFile)) {
                            $mtime = filemtime($fullFile);
                            if ($mtime && ($now - $mtime) >= $minAgeSeconds) {
                                $size = filesize($fullFile) ?: 0;
                                if (@unlink($fullFile)) {
                                    $reporte['imagenes_eliminadas']++;
                                    $reporte['bytes_liberados'] += $size;
                                }
                            }
                        }
                    }
                }
            }
        }

        // 3. Limpieza de videos en uploads/videos/ (videos cortos)
        if (is_dir($videoUploadDir)) {
            $archivosVid = scandir($videoUploadDir);
            if (is_array($archivosVid)) {
                foreach ($archivosVid as $file) {
                    if ($file === '.' || $file === '..' || $file === '.gitkeep' || is_dir($videoUploadDir . $file)) {
                        continue;
                    }
                    if (str_starts_with($file, 'proj_vid_')) {
                        $fullFile = $videoUploadDir . $file;
                        if (!isset($archivosActivos[$file]) && is_file($fullFile)) {
                            $mtime = filemtime($fullFile);
                            if ($mtime && ($now - $mtime) >= $minAgeSeconds) {
                                $size = filesize($fullFile) ?: 0;
                                if (@unlink($fullFile)) {
                                    $reporte['videos_eliminados']++;
                                    $reporte['bytes_liberados'] += $size;
                                }
                            }
                        }
                    }
                }
            }
        }

        // 4. Limpieza de archivos ZIP en storage/zips/ (archivos fuente obsoletos)
        if (is_dir($zipStorageDir)) {
            $archivosZip = scandir($zipStorageDir);
            if (is_array($archivosZip)) {
                foreach ($archivosZip as $file) {
                    if ($file === '.' || $file === '..' || $file === '.htaccess' || is_dir($zipStorageDir . $file)) {
                        continue;
                    }
                    if (str_ends_with(strtolower($file), '.zip')) {
                        $fullFile = $zipStorageDir . $file;
                        if (!isset($archivosActivos[$file]) && is_file($fullFile)) {
                            $mtime = filemtime($fullFile);
                            if ($mtime && ($now - $mtime) >= $minAgeSeconds) {
                                $size = filesize($fullFile) ?: 0;
                                if (@unlink($fullFile)) {
                                    $reporte['zips_eliminados']++;
                                    $reporte['bytes_liberados'] += $size;
                                }
                            }
                        }
                    }
                }
            }
        }

        $reporte['total_eliminados'] = $reporte['imagenes_eliminadas'] + $reporte['videos_eliminados'] + $reporte['zips_eliminados'];
        $reporte['mb_liberados'] = round($reporte['bytes_liberados'] / (1024 * 1024), 2);

    } catch (Exception $e) {
        // En limpiezas preventivas no interrumpir el flujo principal
    }

    return $reporte;
}

// -------------------------------------------------------------
// 2. POST: Crear nuevo proyecto
// -------------------------------------------------------------
if ($method === 'POST') {
    verificarAdminAutenticado();

    $inputData = $_POST;
    if (empty($inputData)) {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (is_array($json)) $inputData = $json;
    }

    $titulo       = trim($inputData['titulo'] ?? ($inputData['title'] ?? ''));
    $descripcion  = trim($inputData['descripcion'] ?? ($inputData['desc'] ?? ''));
    $enlaceDemo   = normalizarUrlWeb($inputData['enlace_demo'] ?? ($inputData['demo_url'] ?? ($inputData['url'] ?? '')));
    $tecnologias  = trim($inputData['tecnologias'] ?? ($inputData['tech'] ?? ''));
    $categoriaRaw = $inputData['categoria'] ?? ($inputData['categoria_nombre'] ?? ($inputData['category'] ?? ($inputData['categoria_id'] ?? null)));
    $urlImagen    = trim($inputData['imagen'] ?? ($inputData['imagen_url'] ?? ($inputData['img'] ?? '')));

    if ($titulo === '') {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'code' => 400,
            'message' => 'El título del proyecto es obligatorio.'
        ]);
        exit();
    }

    // Procesar galería de imágenes (máximo 4 imágenes)
    $imagenesArray = procesarGaleriaImagenes($uploadDir, $inputData['existing_images'] ?? [], $urlImagen);
    $imagenRuta = $imagenesArray[0] ?? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
    $imagenesJson = json_encode($imagenesArray);

    // Procesar video corto del proyecto si se adjuntó o ingresó URL
    $videoUrl = procesarSubidaVideo('video_file', $videoUploadDir, $inputData['video_url'] ?? ($inputData['video'] ?? ''));
    if (!$videoUrl && isset($_FILES['video'])) {
        $videoUrl = procesarSubidaVideo('video', $videoUploadDir, $inputData['video_url'] ?? '');
    }

    // Procesar archivo ZIP de proyecto si se adjuntó (Solo Admin)
    $zipGuardado = procesarSubidaZip('archivo_zip', $zipStorageDir);
    if (!$zipGuardado && isset($_FILES['project_zip'])) {
        $zipGuardado = procesarSubidaZip('project_zip', $zipStorageDir);
    }

    $categoriaTexto = resolverCategoriaTexto($categoriaRaw);
    $usuarioId      = (int) ($_SESSION['usuario_id'] ?? 1);

    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);
        $insertCols = ['`titulo`', '`descripcion`'];
        $insertVals = [':t', ':d'];
        $insertParams = [':t' => $titulo, ':d' => $descripcion];

        if (in_array('categoria', $cols)) {
            $insertCols[] = '`categoria`';
            $insertVals[] = ':cat';
            $insertParams[':cat'] = $categoriaTexto;
        }
        if (in_array('categoria_id', $cols)) {
            $insertCols[] = '`categoria_id`';
            $insertVals[] = 'NULL';
        }

        if (in_array('imagen', $cols)) {
            $insertCols[] = '`imagen`';
            $insertVals[] = ':img';
            $insertParams[':img'] = $imagenRuta;
        }
        if (in_array('imagen_url', $cols)) {
            $insertCols[] = '`imagen_url`';
            $insertVals[] = ':img_url';
            $insertParams[':img_url'] = $imagenRuta;
        }
        if (in_array('video_url', $cols) && $videoUrl) {
            $insertCols[] = '`video_url`';
            $insertVals[] = ':vid';
            $insertParams[':vid'] = $videoUrl;
        }
        if (in_array('imagenes', $cols)) {
            $insertCols[] = '`imagenes`';
            $insertVals[] = ':imgs';
            $insertParams[':imgs'] = $imagenesJson;
        }
        if (in_array('enlace_demo', $cols)) {
            $insertCols[] = '`enlace_demo`';
            $insertVals[] = ':demo';
            $insertParams[':demo'] = $enlaceDemo !== '' ? $enlaceDemo : null;
        }
        if (in_array('demo_url', $cols)) {
            $insertCols[] = '`demo_url`';
            $insertVals[] = ':demo_url';
            $insertParams[':demo_url'] = $enlaceDemo !== '' ? $enlaceDemo : null;
        }
        if (in_array('tecnologias', $cols)) {
            $insertCols[] = '`tecnologias`';
            $insertVals[] = ':tech';
            $insertParams[':tech'] = $tecnologias !== '' ? $tecnologias : null;
        }
        if (in_array('archivo_zip', $cols) && $zipGuardado) {
            $insertCols[] = '`archivo_zip`';
            $insertVals[] = ':zip';
            $insertParams[':zip'] = $zipGuardado;
        }
        if (in_array('usuario_id', $cols)) {
            $insertCols[] = '`usuario_id`';
            $insertVals[] = ':uid';
            $insertParams[':uid'] = $usuarioId;
        }
        if (in_array('estado', $cols)) {
            $insertCols[] = '`estado`';
            $insertVals[] = '1';
        }
        $destacado = (isset($inputData['destacado']) && ($inputData['destacado'] == '1' || $inputData['destacado'] === 'true' || $inputData['destacado'] === true || $inputData['destacado'] === 1)) ? 1 : 0;
        if (in_array('destacado', $cols)) {
            $insertCols[] = '`destacado`';
            $insertVals[] = ':dest';
            $insertParams[':dest'] = $destacado;
        }

        $sql = "INSERT INTO `proyectos` (" . implode(', ', $insertCols) . ") VALUES (" . implode(', ', $insertVals) . ")";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($insertParams);

        $nuevoId = (int) $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'code' => 201,
            'message' => 'Proyecto creado exitosamente.',
            'data' => [
                'id' => $nuevoId,
                'titulo' => $titulo,
                'descripcion' => $descripcion,
                'imagen' => $imagenRuta,
                'imagen_url' => $imagenRuta,
                'video_url' => $videoUrl,
                'tiene_video' => !empty($videoUrl),
                'imagenes' => $imagenesArray,
                'enlace_demo' => $enlaceDemo,
                'tecnologias' => $tecnologias,
                'archivo_zip' => $zipGuardado,
                'tiene_zip' => !empty($zipGuardado),
                'destacado' => $destacado,
                'categoria' => $categoriaTexto,
                'categoria_nombre' => $categoriaTexto,
                'categoria_slug' => strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $categoriaTexto), '-')),
                'categoria_icono' => '📁'
            ]
        ]);
        exit();

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al guardar el nuevo proyecto: ' . $e->getMessage()
        ]);
        exit();
    }
}

// -------------------------------------------------------------
// 3. PUT: Editar proyecto existente
// -------------------------------------------------------------
if ($method === 'PUT') {
    verificarAdminAutenticado();

    $inputData = $_POST;
    if (empty($inputData)) {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (is_array($json)) $inputData = $json;
    }

    $id = (int) ($inputData['id'] ?? ($_GET['id'] ?? 0));
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'code' => 400,
            'message' => 'Se requiere el ID del proyecto a editar.'
        ]);
        exit();
    }

    // Verificar existencia del proyecto
    $stmtCheck = $pdo->prepare("SELECT * FROM `proyectos` WHERE `id` = :id LIMIT 1");
    $stmtCheck->execute([':id' => $id]);
    $proyectoActual = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$proyectoActual) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'code' => 404,
            'message' => 'El proyecto solicitado no existe.'
        ]);
        exit();
    }

    $titulo       = isset($inputData['titulo']) ? trim($inputData['titulo']) : (isset($inputData['title']) ? trim($inputData['title']) : $proyectoActual['titulo']);
    $descripcion  = isset($inputData['descripcion']) ? trim($inputData['descripcion']) : (isset($inputData['desc']) ? trim($inputData['desc']) : $proyectoActual['descripcion']);
    $rawDemo      = array_key_exists('enlace_demo', $inputData) ? $inputData['enlace_demo'] : (array_key_exists('demo_url', $inputData) ? $inputData['demo_url'] : ($proyectoActual['enlace_demo'] ?? $proyectoActual['demo_url'] ?? null));
    $enlaceDemo   = normalizarUrlWeb($rawDemo);
    $tecnologias  = isset($inputData['tecnologias']) ? trim($inputData['tecnologias']) : (isset($inputData['tech']) ? trim($inputData['tech']) : ($proyectoActual['tecnologias'] ?? null));
    
    // categoria es opcional: si se envía, se actualiza; si no se envía, se mantiene la actual
    $tieneCatEnInput = array_key_exists('categoria', $inputData) || array_key_exists('categoria_nombre', $inputData) || array_key_exists('category', $inputData) || array_key_exists('categoria_id', $inputData);
    $categoriaRaw = $tieneCatEnInput 
        ? ($inputData['categoria'] ?? ($inputData['categoria_nombre'] ?? ($inputData['category'] ?? ($inputData['categoria_id'] ?? null))))
        : ($proyectoActual['categoria'] ?? 'General');
    $categoriaTexto = resolverCategoriaTexto($categoriaRaw);

    $urlImagen    = trim($inputData['imagen'] ?? ($inputData['imagen_url'] ?? ($inputData['img'] ?? '')));

    // Procesar imágenes existentes y galería (máximo 4 imágenes)
    $prevImages = [];
    if (!empty($proyectoActual['imagenes'])) {
        $dec = json_decode($proyectoActual['imagenes'], true);
        if (is_array($dec)) $prevImages = $dec;
    }
    if (empty($prevImages) && !empty($proyectoActual['imagen'])) {
        $prevImages = [$proyectoActual['imagen']];
    }

    $existingImagesInput = $inputData['existing_images'] ?? null;
    if ($existingImagesInput === null && !isset($_FILES['imagenes']) && !isset($_FILES['project_images']) && !isset($_FILES['projectImgFile']) && !isset($_FILES['imagen']) && empty($urlImagen)) {
        // No se envió cambio de imágenes, mantener las actuales
        $imagenesArray = $prevImages;
        $imagenFinal = $proyectoActual['imagen'] ?? ($proyectoActual['imagen_url'] ?? '');
    } else {
        $imagenesArray = procesarGaleriaImagenes($uploadDir, $existingImagesInput ?? $prevImages, $urlImagen);
        $imagenFinal = $imagenesArray[0] ?? ($proyectoActual['imagen'] ?? '');

        // Limpiar archivos viejos que ya no estén en la galería
        foreach ($prevImages as $prevImg) {
            if (!in_array($prevImg, $imagenesArray, true)) {
                eliminarArchivoFisicoSeguro($prevImg, $uploadDir, $pdo, $id);
            }
        }
    }
    $imagenesJson = json_encode($imagenesArray);

    // Procesar video corto o eliminación de video
    $nuevoVideo = procesarSubidaVideo('video_file', $videoUploadDir, $inputData['video_url'] ?? ($inputData['video'] ?? ''));
    if (!$nuevoVideo && isset($_FILES['video'])) {
        $nuevoVideo = procesarSubidaVideo('video', $videoUploadDir, $inputData['video_url'] ?? '');
    }
    $eliminarVideo = !empty($inputData['eliminar_video']) && ($inputData['eliminar_video'] == '1' || $inputData['eliminar_video'] === 'true' || $inputData['eliminar_video'] === true);

    $videoFinal = $proyectoActual['video_url'] ?? null;
    if ($nuevoVideo) {
        if (!empty($videoFinal)) {
            eliminarArchivoFisicoSeguro($videoFinal, $videoUploadDir, $pdo, $id);
        }
        $videoFinal = $nuevoVideo;
    } else if ($eliminarVideo) {
        if (!empty($videoFinal)) {
            eliminarArchivoFisicoSeguro($videoFinal, $videoUploadDir, $pdo, $id);
        }
        $videoFinal = null;
    }

    // Procesar nuevo archivo ZIP o eliminación del existente (Solo Admin)
    $nuevoZip = procesarSubidaZip('archivo_zip', $zipStorageDir);
    if (!$nuevoZip && isset($_FILES['project_zip'])) {
        $nuevoZip = procesarSubidaZip('project_zip', $zipStorageDir);
    }
    $eliminarZip = !empty($inputData['eliminar_zip']) && ($inputData['eliminar_zip'] == '1' || $inputData['eliminar_zip'] === 'true' || $inputData['eliminar_zip'] === true);

    $zipFinal = $proyectoActual['archivo_zip'] ?? null;
    if ($nuevoZip) {
        if (!empty($zipFinal)) {
            eliminarArchivoFisicoSeguro($zipFinal, $zipStorageDir, $pdo, $id);
        }
        $zipFinal = $nuevoZip;
    } else if ($eliminarZip) {
        if (!empty($zipFinal)) {
            eliminarArchivoFisicoSeguro($zipFinal, $zipStorageDir, $pdo, $id);
        }
        $zipFinal = null;
    }

    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);
        $upFields = ['`titulo` = :t', '`descripcion` = :d'];
        $upParams = [':t' => $titulo, ':d' => $descripcion, ':id' => $id];

        if (in_array('categoria', $cols)) {
            $upFields[] = '`categoria` = :cat';
            $upParams[':cat'] = $categoriaTexto;
        }

        if (in_array('imagen', $cols)) {
            $upFields[] = '`imagen` = :img';
            $upParams[':img'] = $imagenFinal;
        }
        if (in_array('imagen_url', $cols)) {
            $upFields[] = '`imagen_url` = :img_url';
            $upParams[':img_url'] = $imagenFinal;
        }
        if (in_array('video_url', $cols)) {
            $upFields[] = '`video_url` = :vid';
            $upParams[':vid'] = $videoFinal;
        }
        if (in_array('imagenes', $cols)) {
            $upFields[] = '`imagenes` = :imgs';
            $upParams[':imgs'] = $imagenesJson;
        }
        if (in_array('enlace_demo', $cols)) {
            $upFields[] = '`enlace_demo` = :demo';
            $upParams[':demo'] = $enlaceDemo !== '' ? $enlaceDemo : null;
        }
        if (in_array('demo_url', $cols)) {
            $upFields[] = '`demo_url` = :demo_url';
            $upParams[':demo_url'] = $enlaceDemo !== '' ? $enlaceDemo : null;
        }
        if (in_array('tecnologias', $cols)) {
            $upFields[] = '`tecnologias` = :tech';
            $upParams[':tech'] = $tecnologias !== '' ? $tecnologias : null;
        }
        if (in_array('archivo_zip', $cols)) {
            $upFields[] = '`archivo_zip` = :zip';
            $upParams[':zip'] = $zipFinal;
        }
        $destVal = null;
        if (in_array('destacado', $cols) && array_key_exists('destacado', $inputData)) {
            $destVal = ($inputData['destacado'] == '1' || $inputData['destacado'] === 'true' || $inputData['destacado'] === true || $inputData['destacado'] === 1) ? 1 : 0;
            $upFields[] = '`destacado` = :dest';
            $upParams[':dest'] = $destVal;
        }

        $sqlUpdate = "UPDATE `proyectos` SET " . implode(', ', $upFields) . " WHERE `id` = :id";
        $updateStmt = $pdo->prepare($sqlUpdate);
        $updateStmt->execute($upParams);

        echo json_encode([
            'status' => 'success',
            'message' => 'Proyecto actualizado exitosamente.',
            'data' => [
                'id' => $id,
                'titulo' => $titulo,
                'descripcion' => $descripcion,
                'imagen' => $imagenFinal,
                'imagen_url' => $imagenFinal,
                'video_url' => $videoFinal,
                'tiene_video' => !empty($videoFinal),
                'imagenes' => $imagenesArray,
                'enlace_demo' => $enlaceDemo,
                'tecnologias' => $tecnologias,
                'archivo_zip' => $zipFinal,
                'tiene_zip' => !empty($zipFinal),
                'destacado' => $destVal !== null ? $destVal : (int)($proyectoActual['destacado'] ?? 0),
                'categoria' => $categoriaTexto,
                'categoria_nombre' => $categoriaTexto,
                'categoria_slug' => strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $categoriaTexto), '-')),
                'categoria_icono' => '📁'
            ]
        ]);
        exit();

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al actualizar el proyecto: ' . $e->getMessage()
        ]);
        exit();
    }
}

// -------------------------------------------------------------
// 4. DELETE: Eliminar proyecto y remover imagen del servidor
// -------------------------------------------------------------
if ($method === 'DELETE') {
    verificarAdminAutenticado();

    $id = 0;
    if (isset($_GET['id'])) {
        $id = (int) $_GET['id'];
    } else if (isset($_POST['id'])) {
        $id = (int) $_POST['id'];
    } else {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (is_array($json) && isset($json['id'])) {
            $id = (int) $json['id'];
        }
    }

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'code' => 400,
            'message' => 'Se requiere el ID del proyecto para eliminarlo.'
        ]);
        exit();
    }

    try {
        // Consultar el proyecto para obtener sus imágenes, video y archivo ZIP
        $stmt = $pdo->prepare("SELECT `id`, `imagen`, `imagen_url`, `imagenes`, `video_url`, `archivo_zip` FROM `proyectos` WHERE `id` = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $proyecto = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$proyecto) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'code' => 404,
                'message' => 'El proyecto a eliminar no fue encontrado.'
            ]);
            exit();
        }

        // 1. Remover imágenes del disco si están en uploads/
        $imgsToDelete = [];
        if (!empty($proyecto['imagen'])) $imgsToDelete[] = $proyecto['imagen'];
        if (!empty($proyecto['imagen_url'])) $imgsToDelete[] = $proyecto['imagen_url'];
        if (!empty($proyecto['imagenes'])) {
            $dec = json_decode($proyecto['imagenes'], true);
            if (is_array($dec)) {
                $imgsToDelete = array_merge($imgsToDelete, $dec);
            }
        }
        foreach (array_unique($imgsToDelete) as $delImg) {
            if (!empty($delImg)) {
                eliminarArchivoFisicoSeguro($delImg, $uploadDir, $pdo, $id);
            }
        }

        // 2. Remover video corto físico si existía
        if (!empty($proyecto['video_url'])) {
            eliminarArchivoFisicoSeguro($proyecto['video_url'], $videoUploadDir, $pdo, $id);
        }

        // 3. Remover archivo ZIP físico si existía
        if (!empty($proyecto['archivo_zip'])) {
            eliminarArchivoFisicoSeguro($proyecto['archivo_zip'], $zipStorageDir, $pdo, $id);
        }

        // 4. Eliminar registro de la base de datos
        $delStmt = $pdo->prepare("DELETE FROM `proyectos` WHERE `id` = :id");
        $delStmt->execute([':id' => $id]);

        // 5. Barrido automático de limpieza profunda de huérfanos
        $reporteLimpieza = ejecutarLimpiezaAutomaticaHuerfanos($pdo, $uploadDir, $videoUploadDir, $zipStorageDir, 60);

        echo json_encode([
            'status' => 'success',
            'message' => 'Proyecto eliminado exitosamente.',
            'id' => $id,
            'limpieza_automatica' => $reporteLimpieza
        ]);
        exit();

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al eliminar el proyecto: ' . $e->getMessage()
        ]);
        exit();
    }
}

// Método no soportado
http_response_code(405);
echo json_encode([
    'status' => 'error',
    'code' => 405,
    'message' => 'Método HTTP no permitido.'
]);
exit();
