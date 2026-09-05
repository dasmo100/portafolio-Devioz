<?php
require_once '../config/db.php';

// Endpoint CRUD para proyectos
header('Content-Type: application/json');

// Lógica de CRUD irá aquí
echo json_encode(["status" => "success", "message" => "Proyectos endpoint"]);
