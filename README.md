# 🌐 Portafolio Web — Devioz

> Plataforma web interactiva de alto impacto visual y experiencia cinemática, diseñada para exhibir proyectos de software, diseño, inteligencia artificial y soluciones digitales corporativas. Incluye arquitectura Single Page Application (SPA), animaciones interactivas avanzadas y un completo panel administrativo (Dashboard CRUD).

---

## 🚀 Tecnologías Utilizadas

El proyecto está desarrollado con estándares modernos, priorizando el rendimiento, la estética prémium y la ausencia de dependencias innecesarias:

- **Frontend**:
  - **HTML5 Semántico**: Estructura limpia, accesible y optimizada para SEO.
  - **Vanilla CSS3**: Sistema de diseño con variables CSS (`:root`), efectos de *Glassmorphism*, gradientes cinemáticos y animaciones `@keyframes`.
  - **Vanilla JavaScript (ES6+)**: Lógica reactiva modular sin frameworks pesados.
  - **WebGL Shaders (GLSL)**: Fondo dinámico e interactivo de ondas luminosas (*Scanner Waves*).
  - **SVG Filters**: Filtro vectorial nativo para la animación de fusión líquida (*GooeyNav*).
  - **Bootstrap 5.3.3**: Utilidades de rejilla responsiva (*Grid System*) y componentes modales accesibles.

- **Backend**:
  - **PHP 8.x**: Arquitectura RESTful ligera con respuestas JSON, manejo estricto de sesiones y procesamiento seguro de subida de imágenes (`multipart/form-data`).
  - **PDO (PHP Data Objects)**: Conexión persistente, segura y protegida contra inyecciones SQL mediante sentencias preparadas.

- **Base de Datos**:
  - **MySQL 8.x / MariaDB**: Motor relacional InnoDB con codificación `utf8mb4_unicode_ci` y estructura optimizada.

---

## ✨ Características y Avances Implementados

### 1. 🖥️ Vista Principal en Arquitectura SPA (Single Page Application)
- Navegación fluida y desplazamiento suave (*smooth scrolling*) entre secciones (`#inicio`, `#destacados`, `#proyectos`).
- Barra de progreso superior interactiva que refleja el porcentaje de lectura de la página en tiempo real.
- Sincronización inteligente de desplazamiento (*ScrollSpy*) bidireccional que actualiza la sección activa tanto al bajar como al subir.

### 2. 🫧 Menú de Navegación Flotante con Componente GooeyNav
- Adaptación de la animación **Gooey Nav** de *React Bits* a **Vanilla JS puro**.
- Cálculo dinámico de dimensiones y coordenadas con `getBoundingClientRect()`.
- Generador polar de partículas orgánicas con dispersión matemática y tiempo de vida configurable.
- **Filtro SVG Nativo 100% Transparente**: Empleo de `feGaussianBlur` y `feColorMatrix` sobre el canal alfa, garantizando una fusión líquida orgánica sin superponer bloques ni sombras oscuras sobre el contenido de la web.
- Soporte reactivo con `ResizeObserver` para adaptarse dinámicamente a cualquier resolución de pantalla.

### 3. ✨ Canvas de Texto de Partículas Interactivas "Devioz" (ParticleText)
- Renderizado tipográfico rasterizado en tiempo real sobre `<canvas>`.
- **Calibración Cromática Corporativa de Alta Fidelidad**: Letra **"D"** con gradiente tridimensional continuo de 7 paradas (desde verde petróleo profundo hasta cian eléctrico luminoso, sin ruido ni puntos blancos) y letras **"evioz"** en blanco puro brillante cristalino.
- Física de dispersión radial, inercia, atracción elástica y repulsión reactiva ante el movimiento del cursor del mouse.

### 4. 🌀 Vitrina 3D Interactiva en Espiral Infinita (Infinite Spiral 3D)
- Exhibición tridimensional de proyectos destacados con transformación matricial en el espacio 3D.
- Controles táctiles y de mouse con soporte para arrastre (*drag & drop*), inercia suave y zoom cinemático con la rueda del ratón.

### 5. 📂 Galería de Proyectos Dinámica y Cinemática
- Carga automatizada desde la API REST de PHP.
- Animación escalonada de revelado al deslizarse (*Scroll Reveal Stagger*).
- **Ventana Modal con Desenfoque Cinemático de Fondo**: Al abrir el detalle de cualquier proyecto, todo el fondo del sitio web aplica un filtro de desenfoque profundo (`backdrop-filter: blur(14px)`), centrando la atención del usuario en el contenido multimedia.

### 6. 🔐 Panel de Administración Completo (Admin Dashboard)
- Interfaz moderna e independiente en `frontend/admin.html`.
- **Gestión CRUD Integral**: Creación, lectura, edición y eliminación de proyectos del portafolio.
- Subida física de imágenes con previsualización en vivo o vinculación mediante URLs externas.
- Control rápido de visibilidad y estado destacado con un solo clic.
- Tarjetas de estadísticas y métricas generales del portafolio en tiempo real.

### 7. 🛡️ Módulo de Autenticación y Seguridad
- Acceso administrativo exclusivo mediante `frontend/login.html`.
- Sesiones seguras en PHP (`$_SESSION`) con validación de roles y mitigación de acceso directo a endpoints.
- Hasheo robusto de contraseñas con el algoritmo nativo `PASSWORD_BCRYPT`.

### 8. 🗄️ Base de Datos Optimizada
- Estructura limpia y normalizada sin tablas obsoletas ni dependencias redundantes.
- Script de migración y sincronización automática desde el backend para garantizar compatibilidad inmediata en entornos limpios.

---

## 📁 Estructura del Proyecto

```plaintext
portafolio-Devioz/
├── .gitignore                     # Configuración de exclusión para Git
├── README.md                      # Documentación oficial del proyecto
│
├── database/
│   └── script.sql                 # Script SQL de creación e inicialización de la base de datos
│
├── backend/
│   ├── config/
│   │   └── db.php                 # Conexión PDO con manejo seguro de excepciones
│   ├── api/
│   │   ├── auth.php               # Endpoint de compatibilidad de autenticación
│   │   ├── check_session.php      # Verificación de sesión activa para el Admin Dashboard
│   │   ├── login.php              # Autenticación, validación de credenciales y creación de sesión
│   │   ├── proyectos.php          # API REST completa para operaciones CRUD de proyectos
│   │   └── registrar.php          # Registro seguro de administradores (acceso restringido)
│   └── crear_primer_admin.php     # Asistente web para inicializar el primer usuario administrador
│
└── frontend/
    ├── index.html                 # Página principal pública (SPA del portafolio)
    ├── login.html                 # Interfaz de inicio de sesión administrativa
    ├── admin.html                 # Panel de administración completo (Dashboard CRUD)
    └── assets/
        ├── css/
        │   ├── style.css          # Hoja de estilos principal, tokens y componentes
        │   └── infinite-spiral.css# Estilos y animaciones del componente 3D Espiral
        ├── js/
        │   ├── main.js            # Lógica principal, scroll, animaciones y renderizado público
        │   ├── particles.js       # Motor de partículas de texto interactivo "Devioz"
        │   ├── scanner.js         # Shader WebGL de ondas de fondo interactivas
        │   ├── infinite-spiral.js # Lógica 3D matemática y física de la espiral infinita
        │   ├── gooey-nav.js       # Lógica del menú Gooey Nav y sincronización de tabs
        │   └── admin.js           # Gestión del dashboard administrativo y operaciones CRUD
        └── img/
            ├── devioz-img.png     # Logotipo e isotipo oficial de la marca Devioz
            └── uploads/           # Directorio físico donde se almacenan las imágenes de proyectos
```

---

## 🛠️ Instalación y Despliegue Local

### Requisitos Previos
- Servidor web local: **XAMPP**, **WampServer**, **Laragon** o entorno **LAMP/LEMP**.
- **PHP 8.0** o superior (con extensiones `pdo`, `pdo_mysql`, `gd` o `fileinfo` habilitadas).
- **MySQL 5.7+** o **MariaDB 10.4+**.

---

### Paso a Paso

#### 1. Ubicar el proyecto en el servidor web
Copia o clona el repositorio dentro de la carpeta raíz de documentos de tu servidor local:
- Para **XAMPP**: `C:\xampp\htdocs\portafolio-Devioz\`

#### 2. Iniciar los servicios
Abre el panel de control de tu entorno (ej. XAMPP Control Panel) e inicia los módulos de **Apache** y **MySQL**.

#### 3. Importar la Base de Datos
1. Accede a phpMyAdmin en tu navegador: `http://localhost/phpmyadmin/`.
2. Crea una base de datos llamada `portafolio_devioz` o dirígete a la pestaña **Importar**.
3. Selecciona y ejecuta el archivo:
   ```plaintext
   database/script.sql
   ```
4. El script creará la base de datos, las tablas optimizadas y los datos iniciales de demostración.

#### 4. Verificar la Configuración de Conexión
Revisa el archivo `backend/config/db.php`. La configuración por defecto para entornos locales estándar es:
```php
$host = 'localhost';
$db   = 'portafolio_devioz';
$user = 'root';
$pass = ''; // Por defecto vacía en XAMPP
```

#### 5. Crear el Usuario Administrador Inicial
Abre en tu navegador la siguiente URL para configurar tu acceso de forma automática:
```plaintext
http://localhost/portafolio-Devioz/backend/crear_primer_admin.php
```
Este asistente verificará la base de datos, generará las credenciales maestras y te facilitará el botón directo de acceso.

---

## 🖥️ Enlaces de Acceso Local

| Sección | URL Local | Descripción |
| :--- | :--- | :--- |
| **Sitio Web Público** | [http://localhost/portafolio-Devioz/frontend/index.html](http://localhost/portafolio-Devioz/frontend/index.html) | Portafolio digital SPA completo con animaciones y proyectos |
| **Acceso Administrativo** | [http://localhost/portafolio-Devioz/frontend/login.html](http://localhost/portafolio-Devioz/frontend/login.html) | Formulario de autenticación para administradores |
| **Panel de Control** | [http://localhost/portafolio-Devioz/frontend/admin.html](http://localhost/portafolio-Devioz/frontend/admin.html) | Dashboard administrativo para gestión CRUD de proyectos |

---

## 🔒 Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123` *(configurable desde el asistente de creación)*

---

## 📄 Licencia y Créditos

Desarrollado con dedicación y excelencia visual para **Devioz**. Todos los derechos reservados.
