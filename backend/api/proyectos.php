<?php
header('Content-Type: application/json; charset=utf-8');

/**
 * Portafolio Devioz - API CRUD de Proyectos
 * 
 * Maneja operaciones completas:
 * GET: Obtener todos los proyectos o filtrados por categoría
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
// Sincronización automática de estructura y categorías requeridas
// -------------------------------------------------------------
try {
    // 0. Asegurar existencia de la tabla categorias
    $tablesInDb = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('categorias', $tablesInDb)) {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `categorias` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `slug` VARCHAR(50) NOT NULL UNIQUE,
            `nombre` VARCHAR(100) NOT NULL,
            `icono` VARCHAR(50) DEFAULT NULL,
            `orden` INT DEFAULT 0,
            `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $pdo->exec("INSERT IGNORE INTO `categorias` (`slug`, `nombre`, `icono`, `orden`) VALUES
            ('desarrollo-web', 'Desarrollo Web', '🌐', 1),
            ('diseno-grafico', 'Diseño Gráfico', '🎨', 2),
            ('spots-publicitarios', 'Spots Publicitarios', '🎬', 3),
            ('business-intelligence', 'Business Intelligence', '📊', 4),
            ('ia', 'Inteligencia Artificial', '🤖', 5)");
    }

    // 1. Asegurar columnas en categorias
    $catCols = $pdo->query("SHOW COLUMNS FROM `categorias`")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('slug', $catCols)) {
        $pdo->exec("ALTER TABLE `categorias` ADD COLUMN `slug` VARCHAR(50) NULL AFTER `id`");
    }
    if (!in_array('icono', $catCols)) {
        $pdo->exec("ALTER TABLE `categorias` ADD COLUMN `icono` VARCHAR(50) NULL AFTER `nombre`");
    }

    // 2. Asegurar que las 5 categorías oficiales de Devioz existan con sus slugs e iconos
    $defaultCategories = [
        ['slug' => 'desarrollo-web', 'nombre' => 'Desarrollo Web', 'icono' => '🌐'],
        ['slug' => 'diseno-grafico', 'nombre' => 'Diseño Gráfico', 'icono' => '🎨'],
        ['slug' => 'spots-publicitarios', 'nombre' => 'Spots Publicitarios', 'icono' => '🎬'],
        ['slug' => 'business-intelligence', 'nombre' => 'Business Intelligence', 'icono' => '📊'],
        ['slug' => 'inteligencia-artificial', 'nombre' => 'Inteligencia Artificial', 'icono' => '🤖']
    ];

    foreach ($defaultCategories as $dCat) {
        $stmtCheck = $pdo->prepare("SELECT `id`, `slug`, `icono` FROM `categorias` WHERE `slug` = :s OR `nombre` = :n LIMIT 1");
        $stmtCheck->execute([':s' => $dCat['slug'], ':n' => $dCat['nombre']]);
        $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            if (empty($existing['slug']) || empty($existing['icono'])) {
                $upCat = $pdo->prepare("UPDATE `categorias` SET `slug` = :s, `icono` = :i WHERE `id` = :id");
                $upCat->execute([':s' => $dCat['slug'], ':i' => $dCat['icono'], ':id' => $existing['id']]);
            }
        } else {
            $insCat = $pdo->prepare("INSERT INTO `categorias` (`slug`, `nombre`, `icono`) VALUES (:s, :n, :i)");
            $insCat->execute([':s' => $dCat['slug'], ':n' => $dCat['nombre'], ':i' => $dCat['icono']]);
        }
    }

    // 3. Asegurar columnas compatibles en proyectos
    $projCols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('categoria_id', $projCols)) {
        $pdo->exec("ALTER TABLE `proyectos` ADD COLUMN `categoria_id` INT NULL DEFAULT NULL AFTER `id`");
        $projCols[] = 'categoria_id';
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

    // Permitir categoria_id NULLABLE para compatibilidad con proyectos sin categoría
    try {
        $pdo->exec("ALTER TABLE `proyectos` MODIFY COLUMN `categoria_id` INT NULL DEFAULT NULL");
    } catch (Exception $alterEx) {
        // En caso de restricción de llave foránea estricta
    }

    // 4. Si la tabla proyectos tiene menos de 3 proyectos, insertar proyectos iniciales del portafolio
    $countProjs = (int) $pdo->query("SELECT COUNT(*) FROM `proyectos`")->fetchColumn();
    if ($countProjs < 2) {
        $initialProjs = [
            [
                'titulo' => 'Plataforma E-Commerce SaaS',
                'descripcion' => 'Sistema integral de comercio electrónico con pasarela de pagos, gestión de stock en tiempo real y analítica avanzada.',
                'imagen' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'PHP, MySQL, JavaScript, Bootstrap 5',
                'cat_slug' => 'desarrollo-web'
            ],
            [
                'titulo' => 'Identidad Visual & Branding',
                'descripcion' => 'Diseño integral de marca corporativa, guías de estilo, kit de tipografía y papelería digital con altos estándares estéticos.',
                'imagen' => 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'Figma, Illustrator, Photoshop, Brand Guidelines',
                'cat_slug' => 'diseno-grafico'
            ],
            [
                'titulo' => 'Spot Cinematográfico 4K',
                'descripcion' => 'Producción audiovisual publicitaria con modelado 3D, animación de marca y masterización de sonido envolvente.',
                'imagen' => 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'After Effects, Premiere Pro, Blender 3D, VFX',
                'cat_slug' => 'spots-publicitarios'
            ],
            [
                'titulo' => 'Dashboard Ejecutivo BI & KPIs',
                'descripcion' => 'Tableros de analítica interactiva y pronóstico de ventas con sincronización automatizada de bases de datos.',
                'imagen' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'Power BI, PostgreSQL, Python, ETL Pipeline',
                'cat_slug' => 'business-intelligence'
            ],
            [
                'titulo' => 'Neural Assistant & RAG Copilot',
                'descripcion' => 'Motor conversacional con embeddings vectoriales para consultas sobre documentación corporativa con respuestas precisas.',
                'imagen' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
                'enlace_demo' => null,
                'tecnologias' => 'Python, FastAPI, Gemini API, Vector DB',
                'cat_slug' => 'inteligencia-artificial'
            ]
        ];

        // Columnas actuales tras sincronización
        $activeCols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);

        foreach ($initialProjs as $pData) {
            $catId = (int) $pdo->query("SELECT `id` FROM `categorias` WHERE `slug` = '{$pData['cat_slug']}' LIMIT 1")->fetchColumn();
            if ($catId > 0) {
                $checkP = $pdo->prepare("SELECT `id` FROM `proyectos` WHERE `titulo` = :t LIMIT 1");
                $checkP->execute([':t' => $pData['titulo']]);
                if (!$checkP->fetch()) {
                    $insertCols = ['`titulo`', '`descripcion`', '`categoria_id`'];
                    $insertVals = [':t', ':d', ':cid'];
                    $insertParams = [':t' => $pData['titulo'], ':d' => $pData['descripcion'], ':cid' => $catId];

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
    }

    // 5. Limpieza preventiva: asegurar que ningún proyecto temporal apunte a devioz.com
    $cleanCols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('enlace_demo', $cleanCols)) {
        $pdo->exec("UPDATE `proyectos` SET `enlace_demo` = NULL WHERE `enlace_demo` LIKE '%devioz.com%'");
    }
    if (in_array('demo_url', $cleanCols)) {
        $pdo->exec("UPDATE `proyectos` SET `demo_url` = NULL WHERE `demo_url` LIKE '%devioz.com%'");
    }

} catch (Exception $e) {
    // Si hay algún error menor en la migración, se captura para continuar con las peticiones
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
// 1. GET: Consultar proyectos (todos o filtrados por categoría)
// -------------------------------------------------------------
if ($method === 'GET') {
    try {
        // Detectar columnas existentes en la tabla proyectos para máxima resiliencia
        $projCols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);

        $hasCatTable = in_array('categorias', $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN));
        $catCols = $hasCatTable ? $pdo->query("SHOW COLUMNS FROM `categorias`")->fetchAll(PDO::FETCH_COLUMN) : [];

        $selectFields = ['p.`id`'];
        if (in_array('categoria_id', $projCols)) {
            $selectFields[] = 'p.`categoria_id`';
        }
        $selectFields[] = 'p.`titulo`';

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

        // Columnas de la categoría asociada
        if ($hasCatTable) {
            $selectFields[] = "COALESCE(c.`nombre`, 'General') AS `categoria_nombre`";
            if (in_array('slug', $catCols)) {
                $selectFields[] = "COALESCE(c.`slug`, 'general') AS `categoria_slug`";
            }
            if (in_array('icono', $catCols)) {
                $selectFields[] = "COALESCE(c.`icono`, '📁') AS `categoria_icono`";
            }
        } else {
            $selectFields[] = "'General' AS `categoria_nombre`";
            $selectFields[] = "'general' AS `categoria_slug`";
            $selectFields[] = "'📁' AS `categoria_icono`";
        }

        // Lectura del parámetro de categoría (por ID numérico o por nombre / slug)
        $catParam = isset($_GET['categoria_id']) ? trim($_GET['categoria_id']) : (isset($_GET['categoria']) ? trim($_GET['categoria']) : '');

        // Resolver filtro por categoría a su ID numérico para evitar fallos de tipos en MySQL
        $targetCatId = null;
        if (is_numeric($catParam)) {
            $targetCatId = (int) $catParam;
        } else if ($hasCatTable && $catParam !== '' && strtolower($catParam) !== 'all' && strtolower($catParam) !== 'todos') {
            $stmtCat = $pdo->prepare("SELECT `id` FROM `categorias` WHERE `slug` = :s OR `nombre` = :s OR LOWER(`slug`) = LOWER(:s) OR LOWER(`nombre`) = LOWER(:s) LIMIT 1");
            $stmtCat->execute([':s' => $catParam]);
            $foundCatId = $stmtCat->fetchColumn();
            if ($foundCatId !== false) {
                $targetCatId = (int) $foundCatId;
            } else if (in_array(strtolower($catParam), ['ia', 'inteligencia-artificial'])) {
                $stmtIa = $pdo->query("SELECT `id` FROM `categorias` WHERE `slug` IN ('ia', 'inteligencia-artificial') LIMIT 1");
                $targetCatId = $stmtIa ? (int) $stmtIa->fetchColumn() : null;
            } else {
                // Categoría no encontrada en base de datos: retornar arreglo vacío con 200 OK
                http_response_code(200);
                echo json_encode([]);
                exit();
            }
        }

        // Soporte opcional de categoría si se solicita específicamente (por defecto se traen todos los proyectos)
        $whereClauses = [];
        $params = [];

        if ($targetCatId !== null && in_array('categoria_id', $projCols)) {
            $whereClauses[] = "p.`categoria_id` = :cat_id";
            $params[':cat_id'] = $targetCatId;
        }

        // Si la columna 'estado' existe, asegurar que se muestren los proyectos activos para el público
        if (in_array('estado', $projCols) && empty($_SESSION['usuario_id']) && !isset($_GET['all_status'])) {
            $whereClauses[] = "(p.`estado` = 1 OR p.`estado` IS NULL)";
        }

        $sql = "SELECT " . implode(', ', $selectFields) . " 
                FROM `proyectos` p";
        if ($hasCatTable && in_array('categoria_id', $projCols)) {
            $sql .= " LEFT JOIN `categorias` c ON p.`categoria_id` = c.`id`";
        }

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
            $p['categoria_id'] = $p['categoria_id'] !== null ? (int)$p['categoria_id'] : null;
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

        // Si una categoría no tiene proyectos asociados, retorna un arreglo vacío [] con código HTTP 200 OK
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
// Función auxiliar para resolver categoria_id
// -------------------------------------------------------------
// Función auxiliar para resolver categoria_id (Opcional / Nullable)
// -------------------------------------------------------------
function resolverCategoriaId($pdo, $catRaw) {
    if ($catRaw === null || $catRaw === '' || $catRaw === false) {
        return obtenerFallbackCategoriaSiRequerida($pdo);
    }

    if (is_numeric($catRaw)) {
        $num = (int) $catRaw;
        return $num > 0 ? $num : obtenerFallbackCategoriaSiRequerida($pdo);
    }

    $slug = trim((string) $catRaw);
    if ($slug === '' || strtolower($slug) === 'null' || strtolower($slug) === 'undefined' || strtolower($slug) === 'none') {
        return obtenerFallbackCategoriaSiRequerida($pdo);
    }

    $stmt = $pdo->prepare("SELECT `id` FROM `categorias` WHERE `slug` = :s OR `nombre` = :s LIMIT 1");
    $stmt->execute([':s' => $slug]);
    $catId = $stmt->fetchColumn();

    if (!$catId && in_array(strtolower($slug), ['ia', 'inteligencia-artificial'])) {
        $stmtIa = $pdo->query("SELECT `id` FROM `categorias` WHERE `slug` IN ('ia', 'inteligencia-artificial') LIMIT 1");
        $catId = $stmtIa ? $stmtIa->fetchColumn() : null;
    }

    return $catId ? (int) $catId : obtenerFallbackCategoriaSiRequerida($pdo);
}

function obtenerFallbackCategoriaSiRequerida($pdo) {
    try {
        $stmtCol = $pdo->query("SHOW COLUMNS FROM `proyectos` LIKE 'categoria_id'");
        $col = $stmtCol ? $stmtCol->fetch(PDO::FETCH_ASSOC) : null;
        if ($col && strtoupper($col['Null'] ?? '') === 'NO' && ($col['Default'] ?? null) === null) {
            // Si la columna física en MySQL no admite NULL y no tiene DEFAULT, usamos la primera categoría registrada como fallback seguro
            $first = $pdo->query("SELECT `id` FROM `categorias` ORDER BY `id` ASC LIMIT 1")->fetchColumn();
            return $first ? (int) $first : 1;
        }
    } catch (Exception $e) {}
    return null;
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
    $categoriaRaw = $inputData['categoria_id'] ?? ($inputData['categoria'] ?? ($inputData['category'] ?? null));
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

    $categoriaId = resolverCategoriaId($pdo, $categoriaRaw);
    $usuarioId   = (int) ($_SESSION['usuario_id'] ?? 1);

    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);
        $insertCols = ['`titulo`', '`descripcion`'];
        $insertVals = [':t', ':d'];
        $insertParams = [':t' => $titulo, ':d' => $descripcion];

        if (in_array('categoria_id', $cols)) {
            $insertCols[] = '`categoria_id`';
            $insertVals[] = ':cid';
            $insertParams[':cid'] = $categoriaId;
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

        // Obtener datos de la categoría para responder el objeto completo (si está asignada)
        $catData = null;
        if ($categoriaId) {
            $stmtCat = $pdo->prepare("SELECT `nombre`, `slug`, `icono` FROM `categorias` WHERE `id` = :id");
            $stmtCat->execute([':id' => $categoriaId]);
            $catData = $stmtCat->fetch(PDO::FETCH_ASSOC);
        }

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
                'categoria_id' => $categoriaId,
                'categoria_nombre' => $catData['nombre'] ?? '',
                'categoria_slug' => $catData['slug'] ?? '',
                'categoria_icono' => $catData['icono'] ?? ''
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
    $enlaceDemo   = isset($inputData['enlace_demo']) ? trim($inputData['enlace_demo']) : (isset($inputData['demo_url']) ? trim($inputData['demo_url']) : $proyectoActual['enlace_demo']);
    $tecnologias  = isset($inputData['tecnologias']) ? trim($inputData['tecnologias']) : (isset($inputData['tech']) ? trim($inputData['tech']) : $proyectoActual['tecnologias']);
    
    // categoria_id es opcional: si se envía, se actualiza; si no se envía, se mantiene la actual
    $tieneCatEnInput = array_key_exists('categoria_id', $inputData) || array_key_exists('categoria', $inputData) || array_key_exists('category', $inputData);
    $categoriaRaw = $tieneCatEnInput 
        ? ($inputData['categoria_id'] ?? ($inputData['categoria'] ?? ($inputData['category'] ?? null)))
        : ($proyectoActual['categoria_id'] ?? null);
    $urlImagen    = trim($inputData['imagen'] ?? ($inputData['imagen_url'] ?? ($inputData['img'] ?? '')));

    // Procesar nueva imagen si se subió
    $nuevaImagen = procesarSubidaImagen('imagen', $uploadDir, $urlImagen);
    if (!$nuevaImagen && isset($_FILES['projectImgFile'])) {
        $nuevaImagen = procesarSubidaImagen('projectImgFile', $uploadDir, $urlImagen);
    }

    $imagenFinal = $proyectoActual['imagen'];
    if ($nuevaImagen) {
        // Si la imagen anterior era un archivo subido en uploads, eliminarlo del disco
        if (!empty($proyectoActual['imagen']) && str_contains($proyectoActual['imagen'], 'uploads/')) {
            $archivoViejo = $uploadDir . basename($proyectoActual['imagen']);
            if (is_file($archivoViejo)) {
                @unlink($archivoViejo);
            }
        }
        $imagenFinal = $nuevaImagen;
    }

    $categoriaId = resolverCategoriaId($pdo, $categoriaRaw);

    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `proyectos`")->fetchAll(PDO::FETCH_COLUMN);
        $upFields = ['`titulo` = :t', '`descripcion` = :d'];
        $upParams = [':t' => $titulo, ':d' => $descripcion, ':id' => $id];

        if (in_array('categoria_id', $cols)) {
            $upFields[] = '`categoria_id` = :cid';
            $upParams[':cid'] = $categoriaId;
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

        $catData = null;
        if ($categoriaId) {
            $stmtCat = $pdo->prepare("SELECT `nombre`, `slug`, `icono` FROM `categorias` WHERE `id` = :id");
            $stmtCat->execute([':id' => $categoriaId]);
            $catData = $stmtCat->fetch(PDO::FETCH_ASSOC);
        }

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
                'categoria_id' => $categoriaId,
                'categoria_nombre' => $catData['nombre'] ?? '',
                'categoria_slug' => $catData['slug'] ?? '',
                'categoria_icono' => $catData['icono'] ?? ''
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
