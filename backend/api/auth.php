<?php
require_once '../config/db.php';

// Endpoint para autenticación de administrador
header('Content-Type: application/json');

// Lógica de login irá aquí
echo json_encode(["status" => "success", "message" => "Auth endpoint"]);
