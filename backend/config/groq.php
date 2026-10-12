<?php
/**
 * Configuración de Groq API para el Chatbot de Devioz
 * 
 * Permite gestionar la API Key y el modelo de lenguaje de Groq mediante:
 * 1. El archivo dinámico groq_config.json (administrado desde el panel de admin)
 * 2. Variables de entorno (GROQ_API_KEY)
 * 3. Definición directa en este archivo
 * 
 * Endpoint oficial: https://api.groq.com/openai/v1/chat/completions
 * Modelos destacados:
 * - llama-3.3-70b-versatile (Recomendado - 70B versátil, alta inteligencia y español natural)
 * - llama-3.1-8b-instant (Ultra rápido - baja latencia)
 * - mixtral-8x7b-32768 (MoE con 32k de contexto)
 * - gemma2-9b-it (Google Gemma 2 9B en infraestructura Groq)
 */

$jsonConfigPath = __DIR__ . '/groq_config.json';
$storedConfig = [];

if (file_exists($jsonConfigPath)) {
    $content = @file_get_contents($jsonConfigPath);
    if (!empty($content)) {
        $storedConfig = json_decode($content, true) ?: [];
    }
}

// Clave API de Groq
if (!defined('DEVIOZ_GROQ_API_KEY')) {
    $savedKey = trim($storedConfig['api_key'] ?? '');
    $envKey = trim(getenv('GROQ_API_KEY') ?: '');
    $finalKey = !empty($savedKey) ? $savedKey : (!empty($envKey) ? $envKey : '');
    define('DEVIOZ_GROQ_API_KEY', $finalKey);
}

// Modelo de Groq por defecto
if (!defined('DEVIOZ_GROQ_MODEL')) {
    $savedModel = trim($storedConfig['model'] ?? '');
    define('DEVIOZ_GROQ_MODEL', !empty($savedModel) ? $savedModel : 'llama-3.1-8b-instant');
}

// Compatibilidad retroactiva si algún componente aún referencia GEMINI
if (!defined('DEVIOZ_GEMINI_API_KEY')) {
    define('DEVIOZ_GEMINI_API_KEY', DEVIOZ_GROQ_API_KEY);
}
if (!defined('DEVIOZ_GEMINI_MODEL')) {
    define('DEVIOZ_GEMINI_MODEL', DEVIOZ_GROQ_MODEL);
}
