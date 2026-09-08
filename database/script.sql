-- ==========================================================
-- Base de Datos: portafolio_devioz
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `portafolio_devioz` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `portafolio_devioz`;

-- ----------------------------------------------------------
-- 1. Tabla de Usuarios (Acceso Administrativo y Roles)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario` VARCHAR(50) NOT NULL UNIQUE,
    `nombre_completo` VARCHAR(150) DEFAULT 'Admin Devioz',
    `nombre` VARCHAR(100) DEFAULT 'Admin Devioz',
    `email` VARCHAR(100) DEFAULT NULL UNIQUE,
    `clave` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) DEFAULT NULL,
    `rol` VARCHAR(30) NOT NULL DEFAULT 'administrador',
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Tabla de Proyectos del Portafolio
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `proyectos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `categoria` VARCHAR(100) DEFAULT 'General',
    `titulo` VARCHAR(150) NOT NULL,
    `descripcion` TEXT DEFAULT NULL,
    `imagen_url` VARCHAR(255) NOT NULL,
    `tecnologias` VARCHAR(255) DEFAULT NULL,
    `demo_url` VARCHAR(255) DEFAULT NULL,
    `github_url` VARCHAR(255) DEFAULT NULL,
    `destacado` TINYINT(1) DEFAULT 0,
    `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
