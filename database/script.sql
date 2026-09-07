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
    `nombre` VARCHAR(100) DEFAULT 'Admin Devioz',
    `email` VARCHAR(100) DEFAULT NULL UNIQUE,
    `clave` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) DEFAULT NULL,
    `rol` VARCHAR(30) NOT NULL DEFAULT 'administrador',
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Tabla de Categorías (Utilizadas por la Ruleta y Filtros)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(50) NOT NULL UNIQUE,
    `nombre` VARCHAR(100) NOT NULL,
    `icono` VARCHAR(50) DEFAULT NULL,
    `orden` INT DEFAULT 0,
    `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar categorías por defecto
INSERT IGNORE INTO `categorias` (`slug`, `nombre`, `icono`, `orden`) VALUES
('diseno-grafico', 'Diseño Gráfico', '🎨', 1),
('spots-publicitarios', 'Spots Publicitarios', '🎬', 2),
('business-intelligence', 'Business Intelligence', '📊', 3),
('desarrollo-web', 'Desarrollo Web', '🌐', 4),
('ia', 'Inteligencia Artificial', '🤖', 5);

-- ----------------------------------------------------------
-- 3. Tabla de Proyectos del Portafolio
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `proyectos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `categoria_id` INT DEFAULT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `descripcion` TEXT DEFAULT NULL,
    `imagen_url` VARCHAR(255) NOT NULL,
    `tecnologias` VARCHAR(255) DEFAULT NULL,
    `demo_url` VARCHAR(255) DEFAULT NULL,
    `github_url` VARCHAR(255) DEFAULT NULL,
    `destacado` TINYINT(1) DEFAULT 0,
    `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_proyectos_categoria` FOREIGN KEY (`categoria_id`) 
        REFERENCES `categorias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
