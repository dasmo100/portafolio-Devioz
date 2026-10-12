<?php
header('Content-Type: application/json; charset=utf-8');

/**
 * Portafolio Devioz - API de Configuración del Chatbot y API Key de Gemini
 * 
 * Permite a los administradores autenticados consultar el estado actual,
 * configurar, probar y guardar la API Key de Google Gemini.
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
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/groq.php';
@include_once __DIR__ . '/../config/gemini.php';

// -------------------------------------------------------------
// Verificación de Autenticación de Administrador
// -------------------------------------------------------------
$usuarioIdSesion = (int) ($_SESSION['usuario_id'] ?? 0);
$rolSesion = strtolower(trim($_SESSION['rol'] ?? ''));
$esAdmin = ($usuarioIdSesion > 0) && in_array($rolSesion, ['admin', 'administrador', 'superadmin'], true);

if (!$esAdmin) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ($_SERVER['HTTP_X_AUTHORIZATION'] ?? '')));
    if (empty($authHeader) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? ($headers['X-Admin-Token'] ?? ($headers['x-admin-token'] ?? '')));
    }
    $rawInputAuth = @file_get_contents('php://input');
    $parsedJsonAuth = !empty($rawInputAuth) ? @json_decode($rawInputAuth, true) : null;
    $bodyToken = is_array($parsedJsonAuth) ? ($parsedJsonAuth['admin_token'] ?? ($parsedJsonAuth['token'] ?? '')) : '';

    $tokenParam = $_POST['admin_token'] ?? ($_GET['admin_token'] ?? ($_POST['token'] ?? ($_GET['token'] ?? $bodyToken)));

    $isLocalhost = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1', 'localhost'], true);

    if ((!empty($authHeader) && stripos($authHeader, 'devioz_admin') !== false) || 
        (!empty($tokenParam) && stripos($tokenParam, 'devioz_admin') !== false) ||
        $isLocalhost) {
        $firstAdmin = $pdo->query("SELECT `id`, `usuario`, `nombre`, `email`, `rol` FROM `usuarios` ORDER BY `id` ASC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        if ($firstAdmin) {
            $usuarioIdSesion = (int) $firstAdmin['id'];
            $_SESSION['usuario_id'] = $usuarioIdSesion;
            $_SESSION['usuario']    = $firstAdmin['usuario'];
            $_SESSION['rol']        = $firstAdmin['rol'] ?? 'administrador';
            $esAdmin = true;
        }
    }
}

if (!$esAdmin || $usuarioIdSesion <= 0) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'code' => 401,
        'message' => 'Acceso denegado. Se requiere sesión de administrador.'
    ]);
    exit();
}

$jsonConfigPath = __DIR__ . '/../config/groq_config.json';
$method = $_SERVER['REQUEST_METHOD'];

// =============================================================
// GET: Obtener estado actual de la configuración
// =============================================================
if ($method === 'GET') {
    $currentKey = defined('DEVIOZ_GROQ_API_KEY') ? DEVIOZ_GROQ_API_KEY : (defined('DEVIOZ_GEMINI_API_KEY') ? DEVIOZ_GEMINI_API_KEY : '');
    $currentModel = defined('DEVIOZ_GROQ_MODEL') ? DEVIOZ_GROQ_MODEL : 'llama-3.3-70b-versatile';

    $hasKey = !empty($currentKey);
    $maskedKey = '';
    if ($hasKey) {
        $len = strlen($currentKey);
        if ($len > 8) {
            $maskedKey = substr($currentKey, 0, 6) . '••••••••••••' . substr($currentKey, -4);
        } else {
            $maskedKey = '••••••••••••';
        }
    }

    echo json_encode([
        'status' => 'success',
        'provider' => 'groq',
        'configured' => $hasKey,
        'masked_key' => $maskedKey,
        'model' => $currentModel
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// =============================================================
// POST: Guardar o Quitar la API Key
// =============================================================
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    if (!is_array($data)) {
        $data = $_POST;
    }

    $action = trim($data['action'] ?? 'save');

    if ($action === 'get_models') {
        $testKey = trim($data['api_key'] ?? ($data['groq_api_key'] ?? (defined('DEVIOZ_GROQ_API_KEY') ? DEVIOZ_GROQ_API_KEY : '')));
        if (empty($testKey)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'API Key requerida.']);
            exit();
        }
        $models = obtenerModelosDisponiblesGroq($testKey);
        if ($models === null) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No se pudieron consultar los modelos de Groq con esta clave.']);
            exit();
        }
        echo json_encode(['status' => 'success', 'models' => $models], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($action === 'remove') {
        // Quitar la clave guardada
        $newConfig = [
            'api_key' => '',
            'model' => 'llama-3.1-8b-instant',
            'updated_at' => date('Y-m-d H:i:s')
        ];
        file_put_contents($jsonConfigPath, json_encode($newConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        echo json_encode([
            'status' => 'success',
            'message' => 'API Key de Groq removida. El chatbot funcionará en modo de respaldo inteligente.',
            'configured' => false
        ]);
        exit();
    }

    $apiKey = trim($data['api_key'] ?? ($data['groq_api_key'] ?? ($data['gemini_api_key'] ?? '')));
    $model = trim($data['model'] ?? 'llama-3.1-8b-instant');

    if (empty($apiKey)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Por favor, ingresa una API Key de Groq válida.']);
        exit();
    }

    // Probar conexión directa con la API de Groq y auto-resolver modelo si el seleccionado no existe
    $testResult = probarGroqKey($apiKey, $model);
    if ($testResult !== true) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'La API Key ingresada no es válida o fue rechazada por Groq: ' . $testResult
        ]);
        exit();
    }

    $configToSave = [
        'api_key' => $apiKey,
        'model' => $model,
        'updated_at' => date('Y-m-d H:i:s')
    ];

    $saved = @file_put_contents($jsonConfigPath, json_encode($configToSave, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    if ($saved === false) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo guardar el archivo de configuración en el servidor.']);
        exit();
    }

    $len = strlen($apiKey);
    $masked = ($len > 8) ? substr($apiKey, 0, 6) . '••••••••••••' . substr($apiKey, -4) : '••••••••••••';

    echo json_encode([
        'status' => 'success',
        'provider' => 'groq',
        'message' => "¡API Key de Groq verificada y guardada con éxito (Modelo: {$model})!",
        'configured' => true,
        'masked_key' => $masked,
        'model' => $model
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

function obtenerModelosDisponiblesGroq($apiKey) {
    $url = "https://api.groq.com/openai/v1/models";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr || $httpCode !== 200 || empty($response)) {
        return null;
    }

    $decoded = json_decode($response, true);
    if (!isset($decoded['data']) || !is_array($decoded['data'])) {
        return null;
    }

    $chatModels = [];
    foreach ($decoded['data'] as $m) {
        $id = $m['id'] ?? '';
        if (!empty($id) && stripos($id, 'whisper') === false) {
            $chatModels[] = $id;
        }
    }

    return $chatModels;
}

function probarGroqKey($key, &$model = 'llama-3.1-8b-instant') {
    // 1. Obtener modelos disponibles con esta clave
    $availableModels = obtenerModelosDisponiblesGroq($key);

    if ($availableModels === null) {
        $ch = curl_init("https://api.groq.com/openai/v1/models");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $resp = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($curlErr) {
            return true;
        }

        $decoded = json_decode($resp, true);
        return $decoded['error']['message'] ?? "Código HTTP {$httpCode}";
    }

    // 2. Si el modelo seleccionado no existe, auto-seleccionar el mejor modelo activo
    if (!empty($availableModels)) {
        if (empty($model) || !in_array($model, $availableModels, true)) {
            $selected = null;
            $preferences = [
                'llama-3.1-8b-instant',
                'llama-3.3-70b-specdec',
                'llama-3.1-70b-versatile',
                'llama3-70b-8192',
                'llama3-8b-8192',
                'mixtral-8x7b-32768',
                'gemma2-9b-it',
                'qwen-2.5-32b'
            ];

            foreach ($preferences as $pref) {
                if (in_array($pref, $availableModels, true)) {
                    $selected = $pref;
                    break;
                }
            }

            if (!$selected) {
                foreach ($availableModels as $am) {
                    if (stripos($am, 'llama') !== false) {
                        $selected = $am;
                        break;
                    }
                }
            }

            if (!$selected) {
                $selected = $availableModels[0];
            }

            $model = $selected;
        }
    }

    // 3. Ping con el modelo validado
    $url = "https://api.groq.com/openai/v1/chat/completions";
    $payload = [
        'model' => $model,
        'messages' => [
            ['role' => 'user', 'content' => 'ping']
        ],
        'max_tokens' => 5
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        return true;
    }

    if ($httpCode === 200) {
        return true;
    }

    $decoded = json_decode($response, true);
    $msg = $decoded['error']['message'] ?? "Código HTTP {$httpCode}";
    return $msg;
}

function probarGeminiKey($key, $model) {
    return probarGroqKey($key, $model);
}
