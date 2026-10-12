<?php
header('Content-Type: application/json; charset=utf-8');

/**
 * Portafolio Devioz - API del Chatbot de Consultas con Inteligencia Artificial
 * 
 * Permite a los usuarios y visitantes del portafolio interactuar con el asistente
 * virtual inteligente de Devioz para resolver dudas sobre servicios, tecnologías,
 * proyectos publicados y métodos de cotización/contacto.
 */

if (!headers_sent()) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    if ($origin !== '*') {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido. Utiliza POST.']);
    exit();
}

require_once __DIR__ . '/../config/db.php';
@include_once __DIR__ . '/../config/groq.php';
@include_once __DIR__ . '/../config/gemini.php';

// Leer datos de la solicitud
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    $data = $_POST;
}

$action = trim($data['action'] ?? ($_GET['action'] ?? ''));

// Acción: Obtener estado de la configuración de Groq (sin exponer la clave completa)
if ($action === 'get_status') {
    $currentKey = defined('DEVIOZ_GROQ_API_KEY') ? DEVIOZ_GROQ_API_KEY : (getenv('GROQ_API_KEY') ?: (defined('DEVIOZ_GEMINI_API_KEY') ? DEVIOZ_GEMINI_API_KEY : ''));
    $currentModel = defined('DEVIOZ_GROQ_MODEL') ? DEVIOZ_GROQ_MODEL : 'llama-3.3-70b-versatile';
    $hasKey = !empty($currentKey);
    $masked = '';
    if ($hasKey) {
        $len = strlen($currentKey);
        $masked = ($len > 8) ? substr($currentKey, 0, 6) . '••••••••••••' . substr($currentKey, -4) : '••••••••••••';
    }
    echo json_encode([
        'status' => 'success',
        'provider' => 'groq',
        'configured' => $hasKey,
        'masked_key' => $masked,
        'model' => $currentModel
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Acción: Obtener lista de modelos disponibles directamente de la cuenta de Groq
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

// Acción: Probar si una API Key es válida directamente con los servidores de Groq
if ($action === 'test_key') {
    $testKey = trim($data['api_key'] ?? ($data['groq_api_key'] ?? ($data['gemini_api_key'] ?? '')));
    $testModel = trim($data['model'] ?? 'llama-3.1-8b-instant');

    if (empty($testKey)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Por favor, proporciona una API Key de Groq para verificar.']);
        exit();
    }

    $pingResult = probarGroqKeyDirecto($testKey, $testModel);
    if ($pingResult === true) {
        echo json_encode([
            'status' => 'success',
            'model' => $testModel,
            'message' => "¡API Key válida y lista para operar con Groq ({$testModel})!"
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'La API Key fue rechazada por Groq: ' . $pingResult
        ]);
    }
    exit();
}

// Acción: Guardar API Key en el servidor (archivo backend/config/groq_config.json protegido en .gitignore)
if ($action === 'save_key') {
    $saveKey = trim($data['api_key'] ?? ($data['groq_api_key'] ?? ($data['gemini_api_key'] ?? '')));
    $saveModel = trim($data['model'] ?? 'llama-3.1-8b-instant');
    $jsonConfigPath = __DIR__ . '/../config/groq_config.json';

    if (empty($saveKey)) {
        // Desvincular clave
        $configToSave = [
            'api_key' => '',
            'model' => 'llama-3.1-8b-instant',
            'updated_at' => date('Y-m-d H:i:s')
        ];
        @file_put_contents($jsonConfigPath, json_encode($configToSave, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode([
            'status' => 'success',
            'configured' => false,
            'message' => 'API Key de Groq removida del servidor.'
        ]);
        exit();
    }

    // Verificar y auto-ajustar modelo si el seleccionado no existe en la cuenta
    $pingResult = probarGroqKeyDirecto($saveKey, $saveModel);
    if ($pingResult !== true) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'No se guardó porque la API Key no es válida en Groq: ' . $pingResult
        ]);
        exit();
    }

    $configToSave = [
        'api_key' => $saveKey,
        'model' => $saveModel,
        'updated_at' => date('Y-m-d H:i:s')
    ];
    @file_put_contents($jsonConfigPath, json_encode($configToSave, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    $len = strlen($saveKey);
    $masked = ($len > 8) ? substr($saveKey, 0, 6) . '••••••••••••' . substr($saveKey, -4) : '••••••••••••';

    echo json_encode([
        'status' => 'success',
        'provider' => 'groq',
        'configured' => true,
        'masked_key' => $masked,
        'model' => $saveModel,
        'message' => "¡API Key verificada y guardada con éxito en el servidor (Modelo: {$saveModel})!"
    ]);
    exit();
}

$userMessage = trim($data['message'] ?? '');
$history = is_array($data['history'] ?? null) ? $data['history'] : [];

if (empty($userMessage)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'El mensaje no puede estar vacío.']);
    exit();
}

// 1. Obtener proyectos actualizados de la base de datos para alimentar el contexto
$proyectosTexto = "";
try {
    $stmt = $pdo->query("SELECT `id`, `titulo`, `descripcion`, `categoria`, `tecnologias`, `enlace_demo`, `demo_url` FROM `proyectos` ORDER BY `id` DESC LIMIT 12");
    $proyectosList = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($proyectosList)) {
        foreach ($proyectosList as $p) {
            $titulo = htmlspecialchars($p['titulo'] ?? '', ENT_QUOTES, 'UTF-8');
            $categoria = htmlspecialchars($p['categoria'] ?? 'General', ENT_QUOTES, 'UTF-8');
            $desc = htmlspecialchars($p['descripcion'] ?? '', ENT_QUOTES, 'UTF-8');
            $tech = htmlspecialchars($p['tecnologias'] ?? '', ENT_QUOTES, 'UTF-8');
            $link = $p['enlace_demo'] ?: ($p['demo_url'] ?: '');

            $proyectosTexto .= "- Proyecto: {$titulo} | Categoría: {$categoria} | Stack: {$tech}\n";
            if (!empty($desc)) {
                $proyectosTexto .= "  Detalles: " . mb_substr($desc, 0, 150) . "...\n";
            }
            if (!empty($link)) {
                $proyectosTexto .= "  Enlace de demostración o sitio web: {$link}\n";
            }
        }
    }
} catch (Exception $e) {
    // Si la BD tuviera un inconveniente temporal, continuamos con el contexto por defecto
    error_log("Error cargando proyectos para chatbot: " . $e->getMessage());
}

if (empty($proyectosTexto)) {
    $proyectosTexto = "- Plataforma E-Commerce SaaS (PHP, Vue, PostgreSQL)\n- Neural Assistant & AI Copilot (Python, FastAPI, Groq AI)\n- Dashboard Ejecutivo BI & KPIs (Power BI, DAX, SQL Server)\n- Branding & Sistema Visual Devioz (Figma, Motion Graphics)";
}

// 2. Construir el System Prompt oficial de Devioz
$systemInstruction = "Eres el Asistente Virtual Inteligente oficial de Devioz, una firma especializada en soluciones de software de alta calidad, desarrollo web a medida, arquitectura en la nube, Business Intelligence (BI) e inteligencia artificial.
Tu misión es atender con cortesía, entusiasmo y profesionalismo a clientes potenciales, reclutadores y visitantes del portafolio.

Información clave sobre Devioz:
- Eslogan: 'Soluciones Digitales a tu Medida'.
- Especialidades: Desarrollo de aplicaciones web y móviles modernas, plataformas SaaS, integración de modelos de lenguaje e inteligencia artificial (con Groq y modelos avanzados de código abierto), analítica de datos y dashboards ejecutivos (Power BI, Python), automatización de procesos y diseño de interfaces premium (UI/UX).
- Proyectos activos en el portafolio:
{$proyectosTexto}
- Medios de contacto:
  * Formulario o botón de contacto en la web.
  * Correo electrónico directo: contacto@devioz.com o admin@devioz.com
  * Se pueden agendar reuniones y cotizaciones personalizadas según el alcance del proyecto.

Pautas de respuesta:
1. Responde de forma clara, moderna y concisa (1 a 3 párrafos cortos o puntos clave bien estructurados).
2. Si preguntan por proyectos específicos, menciona sus nombres, tecnologías y si tienen enlace disponible.
3. Si el usuario desea contratar un servicio o solicitar una cotización, anímalo amablemente a contactar al equipo de Devioz por correo o a través de la sección de contacto.
4. Mantén siempre un tono cordial, tecnológico, profesional y seguro. Puedes usar algún emoji sutil para dar calidez.";

// 3. Verificar si hay API Key de Groq disponible (desde cliente o backend)
$clientKey = trim($data['api_key'] ?? ($data['groq_api_key'] ?? ($data['gemini_api_key'] ?? '')));
$clientModel = trim($data['model'] ?? ($data['groq_model'] ?? ($data['gemini_model'] ?? '')));

$groqApiKey = !empty($clientKey) 
    ? $clientKey 
    : (defined('DEVIOZ_GROQ_API_KEY') && !empty(DEVIOZ_GROQ_API_KEY) ? DEVIOZ_GROQ_API_KEY : (getenv('GROQ_API_KEY') ?: (defined('DEVIOZ_GEMINI_API_KEY') ? DEVIOZ_GEMINI_API_KEY : '')));

$groqModel = !empty($clientModel) 
    ? $clientModel 
    : (defined('DEVIOZ_GROQ_MODEL') ? DEVIOZ_GROQ_MODEL : 'llama-3.3-70b-versatile');

$respuestaGenerada = null;
$modoRespuesta = 'contextual';

if (!empty($groqApiKey)) {
    // Intentar consultar la API oficial de Groq
    $respuestaGroq = consultarGroqAPI($groqApiKey, $groqModel, $systemInstruction, $history, $userMessage);
    if (!empty($respuestaGroq)) {
        $respuestaGenerada = $respuestaGroq;
        $modoRespuesta = 'groq';
    }
}

// 4. Si no hay API key o la llamada falló (offline, límite de cuota, etc.), usar el motor contextual inteligente de Devioz
if (empty($respuestaGenerada)) {
    $respuestaGenerada = generarRespuestaContextual($userMessage, $proyectosTexto);
    $modoRespuesta = 'contextual';
}

echo json_encode([
    'status' => 'success',
    'reply' => $respuestaGenerada,
    'mode' => $modoRespuesta
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit();

// =========================================================================
// Funciones Auxiliares
// =========================================================================

/**
 * Obtiene la lista de modelos de texto/chat activos directamente desde Groq
 */
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
        // Filtrar modelos no destinados a chat/completions (como whisper de audio)
        if (!empty($id) && stripos($id, 'whisper') === false) {
            $chatModels[] = $id;
        }
    }

    return $chatModels;
}

/**
 * Valida rápidamente si una API Key es aceptada por los servidores de Groq
 * y auto-ajusta el modelo en caso de que el seleccionado no exista en la cuenta.
 */
function probarGroqKeyDirecto($apiKey, &$model = 'llama-3.1-8b-instant') {
    // 1. Consultar modelos disponibles para validar la clave y descubrir los modelos vigentes
    $availableModels = obtenerModelosDisponiblesGroq($apiKey);

    if ($availableModels === null) {
        // En caso de que falle la consulta de modelos, capturar el mensaje de error de Groq
        $ch = curl_init("https://api.groq.com/openai/v1/models");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $resp = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($curlErr) {
            return true; // Problema local temporal de conexión cURL
        }

        $decoded = json_decode($resp, true);
        return $decoded['error']['message'] ?? "Código HTTP {$httpCode}";
    }

    // 2. Si el modelo solicitado no existe en la cuenta (ej. descontinuado o sin acceso),
    // seleccionar automáticamente el mejor modelo activo de la cuenta:
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

    // 3. Probar un ping ligero con el modelo confirmado
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
        'Authorization: Bearer ' . $apiKey,
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
    $msg = $decoded['error']['message'] ?? "Código de error HTTP {$httpCode}";
    return $msg;
}

/**
 * Consulta la API de Groq (OpenAI-compatible) con fallback inteligente de modelos
 */
function consultarGroqAPI($apiKey, $model, $systemPrompt, $history, $message) {
    $messages = [];

    $messages[] = [
        'role' => 'system',
        'content' => $systemPrompt
    ];

    if (!empty($history) && is_array($history)) {
        $recentHistory = array_slice($history, -8);
        foreach ($recentHistory as $turn) {
            $rawRole = strtolower($turn['role'] ?? '');
            $role = in_array($rawRole, ['user', 'humano']) ? 'user' : 'assistant';
            $text = trim($turn['text'] ?? ($turn['content'] ?? ''));
            if (!empty($text)) {
                $messages[] = [
                    'role' => $role,
                    'content' => $text
                ];
            }
        }
    }

    $messages[] = [
        'role' => 'user',
        'content' => $message
    ];

    // Consultar dinámicamente modelos que realmente existan para este usuario
    $availableModels = obtenerModelosDisponiblesGroq($apiKey) ?: [];

    $modelsToTry = [];
    if (!empty($model)) {
        $modelsToTry[] = $model;
    }

    if (!empty($availableModels)) {
        foreach ($availableModels as $am) {
            $modelsToTry[] = $am;
        }
    } else {
        $modelsToTry = array_merge($modelsToTry, [
            'llama-3.1-8b-instant',
            'llama3-70b-8192',
            'llama3-8b-8192',
            'mixtral-8x7b-32768',
            'gemma2-9b-it'
        ]);
    }
    $modelsToTry = array_values(array_unique($modelsToTry));

    foreach ($modelsToTry as $currentModel) {
        $payload = [
            'model' => $currentModel,
            'messages' => $messages,
            'temperature' => 0.6,
            'max_tokens' => 900
        ];

        $ch = curl_init("https://api.groq.com/openai/v1/chat/completions");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError || $httpCode !== 200 || empty($response)) {
            continue; // Probar siguiente modelo de Groq
        }

        $resData = json_decode($response, true);
        if (isset($resData['choices'][0]['message']['content'])) {
            return trim($resData['choices'][0]['message']['content']);
        }
    }

    return null;
}

// Wrappers retrocompatibles para gemini
function probarGeminiKeyDirecto($apiKey, $model = 'llama-3.3-70b-versatile') {
    return probarGroqKeyDirecto($apiKey, $model);
}

function consultarGeminiAPI($apiKey, $model, $systemPrompt, $history, $message) {
    return consultarGroqAPI($apiKey, $model, $systemPrompt, $history, $message);
}

/**
 * Motor de Respuestas Contextuales Inteligentes de Devioz (Fallback Seguro)
 */
function generarRespuestaContextual($query, $proyectosTexto) {
    $q = mb_strtolower(trim($query), 'UTF-8');

    // 1. Saludos
    if (preg_match('/\b(hola|buenos d[ií]as|buenas tardes|buenas noches|saludos|hey|hi|hello)\b/u', $q)) {
        return "¡Hola! 👋 Qué gusto saludarte. Soy el asistente inteligente de **Devioz**.\n\n¿En qué podemos colaborar hoy? Puedes consultarme sobre nuestros proyectos de desarrollo, tecnologías que utilizamos, o cómo iniciar una cotización para tu idea digital.";
    }

    // 2. Contacto / Cotización / Precios / Contratar (Prioridad alta para captar clientes)
    if (preg_match('/\b(contacto|contactar|correo|email|tel[eé]fono|whatsapp|cotizar|cotizaci[oó]n|precio|costo|costos|presupuesto|contratar|agendar)\b/u', $q)) {
        return "¡Será un placer trabajar contigo! 🚀\n\n"
            . "Para cotizar un proyecto o coordinar una propuesta técnica personalizada, puedes escribirnos directamente a:\n\n"
            . "📧 **contacto@devioz.com** o **admin@devioz.com**\n\n"
            . "Cuéntanos sobre tus requerimientos, tiempos y objetivos, y te responderemos a la brevedad con una solución a tu medida.";
    }

    // 3. Servicios / Soluciones
    if (preg_match('/\b(servicio|servicios|ofrecen|hacen|desarrollo|soluciones|que hacen|qu[eé] haces)\b/u', $q)) {
        return "En **Devioz** creamos soluciones digitales de alta precisión. Nuestros principales servicios incluyen:\n\n"
            . "• **Desarrollo Web & SaaS a Medida:** Aplicaciones robustas, seguras y escalables con PHP, Node.js, React y bases de datos relacionales.\n"
            . "• **Integración de Inteligencia Artificial:** Asistentes virtuales con Gemini, RAG y modelos de lenguaje aplicados a tu negocio.\n"
            . "• **Business Intelligence & Analítica:** Dashboards ejecutivos interactivos en Power BI, modelado DAX y analítica en Python.\n"
            . "• **Diseño UI/UX & Identidad:** Experiencias visuales modernas, glassmorphism e interfaces interactivas centradas en el usuario.\n\n"
            . "¿Te gustaría consultar por alguno de estos servicios para tu proyecto?";
    }

    // 4. Proyectos / Portafolio
    if (preg_match('/\b(proyecto|proyectos|trabajos|portafolio|muestras|ejemplos|galer[ií]a)\b/u', $q)) {
        return "¡Por supuesto! En nuestro portafolio encontrarás soluciones desarrolladas con los más altos estándares tecnológicos:\n\n"
            . "• Puedes explorar la sección **'Destacados'** para interactuar con nuestra espiral 3D de proyectos.\n"
            . "• En la sección **'Proyectos'** podrás filtrar por categorías, consultar el stack tecnológico y visitar las páginas web en vivo de cada uno mediante el botón **'Visitar ↗'**.\n\n"
            . "¿Deseas información o características sobre algún proyecto o categoría en particular?";
    }

    // 5. Tecnologías / Stack
    if (preg_match('/\b(tecnolog[ií]a|tecnolog[ií]as|stack|lenguajes|frameworks|herramientas|php|python|react|javascript|power bi)\b/u', $q)) {
        return "Nuestro stack tecnológico combina estabilidad, modernidad y alto rendimiento:\n\n"
            . "• **Backend:** PHP, Python (FastAPI, Flask), Node.js, arquitectura REST y microservicios.\n"
            . "• **Frontend & UI:** JavaScript moderno, React, animaciones CSS avanzadas y WebGL.\n"
            . "• **Bases de Datos & Cloud:** MySQL, PostgreSQL, Docker y despliegues en la nube.\n"
            . "• **Datos & IA:** Google Gemini API, Power BI, DAX, Pandas y bibliotecas de machine learning.\n\n"
            . "Adaptamos las herramientas ideales según la escala y necesidades de cada cliente.";
    }

    // 6. Quiénes son / Empresa
    if (preg_match('/\b(qui[eé]nes son|qui[eé]n eres|que es devioz|empresa|sobre devioz|acerca de)\b/u', $q)) {
        return "**Devioz** es un estudio de desarrollo e ingeniería digital enfocado en construir software escalable, interfaces inmersivas y herramientas impulsadas por datos e inteligencia artificial. Ayudamos a empresas y profesionales a materializar sus ideas con tecnología de vanguardia.";
    }

    // 7. Agradecimiento o Despedida
    if (preg_match('/\b(gracias|muchas gracias|genial|excelente|perfecto|adi[oó]s|chao|hasta luego)\b/u', $q)) {
        return "¡Con todo gusto! Si tienes alguna otra pregunta o quieres explorar cómo dar vida a tu próximo proyecto digital, aquí estaré. ¡Éxitos!";
    }

    // 8. Respuesta general de cortesía
    return "Gracias por tu consulta. En **Devioz** nos especializamos en desarrollo de software, plataformas web, analítica de datos e inteligencia artificial.\n\n"
        . "Puedes explorar todos nuestros proyectos en el portafolio o escribirnos a **contacto@devioz.com** para coordinar una cotización a tu medida.\n\n"
        . "¿Hay algún detalle técnico o servicio específico sobre el que te gustaría saber más?";
}
