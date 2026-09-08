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

    // 4. Limpieza preventiva de URLs inválidas
    $cleanCols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('enlace_demo', $cleanCols)) {
        $pdo->exec("UPDATE `proyectos` SET `enlace_demo` = NULL WHERE `enlace_demo` LIKE '%devioz.com%'");
    }
    if (in_array('demo_url', $cleanCols)) {
        $pdo->exec("UPDATE `proyectos` SET `demo_url` = NULL WHERE `demo_url` LIKE '%devioz.com%'");
    }

} catch (Exception $e) {
    error_log("Error de sincronización en BD: " . $e->getMessage());
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

            // Normalizar enlace demo tanto para demo_url como para enlace_demo
            $demo = $p['demo_url'] ?? ($p['enlace_demo'] ?? null);
            if (!empty($demo) && stripos($demo, 'devioz.com') !== false) {
                $demo = null;
            }
            $p['demo_url'] = $demo;
            $p['enlace_demo'] = $demo;

            // Convertir tecnologías a array para componentes interactivos
            $p['tecnologias_array'] = !empty($p['tecnologias']) 
                ? array_map('trim', explode(',', $p['tecnologias']))
                : [];
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
    $enlaceDemo   = trim($inputData['enlace_demo'] ?? ($inputData['demo_url'] ?? ($inputData['url'] ?? '')));
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

    // Procesar imagen (archivo subido o URL de imagen)
    $imagenRuta = procesarSubidaImagen('imagen', $uploadDir, $urlImagen);
    if (!$imagenRuta && isset($_FILES['projectImgFile'])) {
        $imagenRuta = procesarSubidaImagen('projectImgFile', $uploadDir, $urlImagen);
    }
    if (!$imagenRuta) {
        $imagenRuta = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
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
                'enlace_demo' => $enlaceDemo,
                'tecnologias' => $tecnologias,
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
    $enlaceDemo   = isset($inputData['enlace_demo']) ? trim($inputData['enlace_demo']) : (isset($inputData['demo_url']) ? trim($inputData['demo_url']) : ($proyectoActual['enlace_demo'] ?? $proyectoActual['demo_url'] ?? null));
    $tecnologias  = isset($inputData['tecnologias']) ? trim($inputData['tecnologias']) : (isset($inputData['tech']) ? trim($inputData['tech']) : ($proyectoActual['tecnologias'] ?? null));
    
    // categoria es opcional: si se envía, se actualiza; si no se envía, se mantiene la actual
    $tieneCatEnInput = array_key_exists('categoria', $inputData) || array_key_exists('categoria_nombre', $inputData) || array_key_exists('category', $inputData) || array_key_exists('categoria_id', $inputData);
    $categoriaRaw = $tieneCatEnInput 
        ? ($inputData['categoria'] ?? ($inputData['categoria_nombre'] ?? ($inputData['category'] ?? ($inputData['categoria_id'] ?? null))))
        : ($proyectoActual['categoria'] ?? 'General');
    $categoriaTexto = resolverCategoriaTexto($categoriaRaw);

    $urlImagen    = trim($inputData['imagen'] ?? ($inputData['imagen_url'] ?? ($inputData['img'] ?? '')));

    // Procesar nueva imagen si se subió
    $nuevaImagen = procesarSubidaImagen('imagen', $uploadDir, $urlImagen);
    if (!$nuevaImagen && isset($_FILES['projectImgFile'])) {
        $nuevaImagen = procesarSubidaImagen('projectImgFile', $uploadDir, $urlImagen);
    }

    $imagenFinal = $proyectoActual['imagen'] ?? ($proyectoActual['imagen_url'] ?? '');
    if ($nuevaImagen) {
        // Si la imagen anterior era un archivo subido en uploads, eliminarlo del disco
        if (!empty($imagenFinal) && str_contains($imagenFinal, 'uploads/')) {
            $archivoViejo = $uploadDir . basename($imagenFinal);
            if (is_file($archivoViejo)) {
                @unlink($archivoViejo);
            }
        }
        $imagenFinal = $nuevaImagen;
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
                'enlace_demo' => $enlaceDemo,
                'tecnologias' => $tecnologias,
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
        // Consultar el proyecto para obtener el nombre de su imagen
        $stmt = $pdo->prepare("SELECT `id`, `imagen` FROM `proyectos` WHERE `id` = :id LIMIT 1");
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

        // Remover archivo físico del disco si está almacenado en uploads/
        if (!empty($proyecto['imagen']) && str_contains($proyecto['imagen'], 'uploads/')) {
            $archivoAEliminar = $uploadDir . basename($proyecto['imagen']);
            if (is_file($archivoAEliminar)) {
                @unlink($archivoAEliminar);
            }
        }

        // Eliminar registro de la base de datos
        $delStmt = $pdo->prepare("DELETE FROM `proyectos` WHERE `id` = :id");
        $delStmt->execute([':id' => $id]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Proyecto eliminado exitosamente.',
            'id' => $id
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
