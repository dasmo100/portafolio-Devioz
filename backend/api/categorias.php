<?php
require_once '../config/db.php';

// Endpoint para obtener categorías
header('Content-Type: application/json');

// Lógica para obtener categorías irá aquí
echo json_encode(["status" => "success", "message" => "Categorias endpoint"]);
