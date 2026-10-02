<?php
/**
 * Configuración de Google Gemini API para el Chatbot de Devioz
 * 
 * Permite gestionar la API Key y modelo de Gemini mediante:
 * 1. El archivo dinámico gemini_config.json (administrado desde el panel de admin)
 * 2. Variables de entorno (GEMINI_API_KEY)
 * 3. Definición directa en este archivo
 */

$jsonConfigPath = __DIR__ . '/gemini_config.json';
$storedConfig = [];

if (file_exists($jsonConfigPath)) {
    $content = @file_get_contents($jsonConfigPath);
    if (!empty($content)) {
        $storedConfig = json_decode($content, true) ?: [];
    }
}

if (!defined('DEVIOZ_GEMINI_API_KEY')) {
    $savedKey = trim($storedConfig['api_key'] ?? '');
    $envKey = trim(getenv('GEMINI_API_KEY') ?: '');
    $finalKey = !empty($savedKey) ? $savedKey : (!empty($envKey) ? $envKey : '');
    define('DEVIOZ_GEMINI_API_KEY', $finalKey);
}

if (!defined('DEVIOZ_GEMINI_MODEL')) {
    $savedModel = trim($storedConfig['model'] ?? '');
    define('DEVIOZ_GEMINI_MODEL', !empty($savedModel) ? $savedModel : 'gemini-2.5-flash');
}
