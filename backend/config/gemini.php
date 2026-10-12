<?php
/**
 * Configuración de Google Gemini API para el Chatbot de Devioz
 * 
 * Permite gestionar la API Key y modelo de Gemini mediante:
 * 1. El archivo dinámico gemini_config.json (administrado desde el panel de admin)
 * 2. Variables de entorno (GEMINI_API_KEY)
 * 3. Definición directa en este archivo
 */

require_once __DIR__ . '/groq.php';

