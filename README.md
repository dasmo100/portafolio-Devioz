# 🌐 Portafolio Web — Devioz

> Plataforma web interactiva de alto impacto visual y experiencia cinemática, diseñada para exhibir proyectos de software, desarrollo web, inteligencia artificial, diseño e innovación digital. Implementada bajo arquitectura SPA modular en Vanilla JavaScript, WebGL Shaders, animaciones interactivas 3D y un robusto panel administrativo (CRUD) respaldado por PHP y MySQL.

---

## 🚀 Tecnologías y Herramientas

El proyecto está construido priorizando el rendimiento, la accesibilidad, la estética visual prémium y la ausencia de dependencias externas pesadas:

- **Frontend**:
  - **HTML5 Semántico**: Marcado limpio, estructurado y optimizado para accesibilidad y SEO.
  - **Vanilla CSS3**: Sistema de diseño con variables CSS (`:root`), efectos de *Glassmorphism*, gradientes cinemáticos, filtros vectoriales y animaciones aceleradas por hardware (`@keyframes`).
  - **Vanilla JavaScript (ES6+)**: Lógica modular reactiva sin frameworks pesados, con observadores modernos (`IntersectionObserver`, `ResizeObserver`).
  - **WebGL Shaders (GLSL)**: Fondo dinámico de ondas luminosas interactivas (*Scanner Waves*).
  - **Canvas 2D**: Motor de partículas tipográficas con física de dispersión y atracción elástica.
  - **SVG Filters**: Filtro vectorial nativo para la animación de fusión líquida (*GooeyNav*).
  - **Bootstrap 5.3.3**: Utilidades de rejilla responsiva (*Grid System*) y componentes modales accesibles.

- **Backend**:
  - **PHP 8.x**: Arquitectura RESTful ligera con respuestas en formato JSON, control estricto de sesiones y procesamiento de archivos multimedia (`multipart/form-data`).
  - **PDO (PHP Data Objects)**: Conexión segura y persistente con sentencias preparadas para protección total contra inyección SQL.

- **Base de Datos**:
  - **MySQL 8.x / MariaDB**: Motor de almacenamiento relacional InnoDB con codificación `utf8mb4_unicode_ci`.

---

## ✨ Características Principales

### 1. 🖥️ Experiencia SPA (Single Page Application)
- Desplazamiento suave (*smooth scrolling*) entre secciones (`#inicio`, `#destacados`, `#proyectos`).
- Barra de progreso interactiva en la parte superior que mide el porcentaje de lectura en tiempo real.
- Sincronización inteligente de navegación (*ScrollSpy*) bidireccional que resalta la pestaña activa tanto al descender como al ascender.

### 2. 🌀 Vitrina 3D "Infinite Spiral" (Espiral Infinita)
- Exhibición tridimensional de proyectos destacados siguiendo una curva helicoidal ascendente (*S-ribbon*).
- **Interacción al pasar el cursor**: La opción **"Ver Detalles →"** permanece oculta por defecto y aparece suavemente con animación al colocar el cursor sobre la tarjeta del proyecto.
- **Navegación directa e inteligente**: Al hacer clic en una tarjeta o en "Ver Detalles", la página se desplaza suavemente hasta centrar el proyecto en la **Galería de Proyectos (`#galeria-proyectos`)**, resalta la tarjeta con un resplandor luminoso cian (`@keyframes pulseProjectCard`) y abre automáticamente el modal de detalle con la información completa.
- **Física e Inercia**: Soporte completo para arrastre con ratón (*drag & drop*), desaceleración inercial fluida y desenfoque bokeh progresivo en profundidad Z.

### 3. 🫧 Menú Flotante con Componente GooeyNav
- Barra de navegación flotante con efecto de fusión líquida orgánica (*Gooey*).
- Filtro SVG nativo con `feGaussianBlur` y `feColorMatrix` sobre canal alfa, garantizando transparencia absoluta sin artefactos visuales ni sombras parásitas.
- Cálculo dinámico de posición y tamaño mediante `getBoundingClientRect()` y adaptación responsive con `ResizeObserver`.

### 4. ✨ Tipografía de Partículas Interactivas "Devioz" (ParticleText)
- Renderizado de partículas tipográficas sobre `<canvas>`.
- Gradiente tridimensional continuo de alta fidelidad en la letra **"D"** (verde petróleo a cian eléctrico) y letras **"evioz"** en blanco cristalino puro.
- Dinámica física de dispersión radial, aceleración elástica y repulsión reactiva al movimiento del puntero.

### 5. 📂 Galería de Proyectos Dinámica
- Carga automatizada desde la API REST de PHP con catálogo de respaldo curado.
- Animación escalonada de revelado al deslizarse (*Scroll Reveal Stagger*).
- **Modal Cinemático con Desenfoque de Fondo**: Al abrir los detalles de un proyecto, el fondo aplica desenfoque profundo (`backdrop-filter: blur(14px)`), centrando la atención en el contenido multimedia y las especificaciones técnicas.

### 6. 🔐 Panel de Administración (Admin Dashboard)
- Interfaz moderna e intuitiva en `frontend/admin.html` para la gestión de contenido.
- **Operaciones CRUD**: Creación, consulta, edición y eliminación de proyectos del portafolio.
- Gestión de imágenes locales con previsualización en vivo o vinculación mediante URLs remotas.
- Conmutación rápida de estado destacado y visibilidad pública con un clic.
- Métricas y estadísticas generales del portafolio en tiempo real.

### 7. 👤 Gestión de Perfil de Administrador
- Modal integrado en el panel para consultar y actualizar credenciales en caliente (nombre completo, usuario/correo y contraseña).
- Validación estricta en backend (`backend/api/perfil.php`) asegurando que solo la sesión activa pueda modificar sus datos.
- Encriptación robusta con el algoritmo nativo `PASSWORD_BCRYPT`.
- Botón animado de acceso a perfil en la barra superior con micro-interacciones.

### 8. 🛡️ Seguridad y Blindaje de Sesión
- **Protección contra Retroceso de Historial (Anti-Back / BFCache Guard)**: Implementación de guardias de visibilidad y redirección inmediata en `admin.html` para impedir que usuarios desautenticados visualicen pantallas protegidas usando los botones de retroceso del navegador.
- **Cierre de Sesión Limpio y Seguro**: Destrucción integral de la sesión PHP (`session_destroy`), revocación de cookies y redirección mediante `window.location.replace` para evitar entradas residuales en el historial de navegación.
- **Consultas Preparadas PDO**: Mitigación sistemática contra ataques de inyección SQL.

---

## 📁 Estructura del Repositorio

```plaintext
portafolio-Devioz/
├── .gitignore                     # Archivos y carpetas excluidos del control de versiones
├── README.md                      # Documentación general del proyecto
│
├── database/
│   └── script.sql                 # Definición de esquema y tablas de la base de datos
│
├── backend/
│   ├── config/
│   │   └── db.php                 # Conexión PDO, configuración CORS y auto-inicialización
│   ├── api/
│   │   ├── auth.php               # Endpoint de compatibilidad de autenticación
│   │   ├── check_session.php      # Verificación de estado de sesión activa
│   │   ├── login.php              # Autenticación segura y destrucción de sesión (logout)
│   │   ├── perfil.php             # Consulta y actualización de credenciales del administrador
│   │   ├── proyectos.php          # API REST completa para operaciones CRUD de proyectos
│   │   └── registrar.php          # Registro seguro de administradores
│   └── crear_primer_admin.php     # Asistente para inicialización segura del administrador inicial
│
└── frontend/
    ├── index.html                 # Página pública principal (SPA interactiva)
    ├── login.html                 # Pantalla de acceso al panel administrativo
    ├── admin.html                 # Panel de control administrativo protegido
    └── assets/
        ├── css/
        │   ├── style.css          # Estilos globales, tokens de diseño y componentes
        │   └── infinite-spiral.css# Estilos, perspectivas y animaciones del componente 3D
        ├── js/
        │   ├── main.js            # Lógica central del frontend, scroll y modal de proyectos
        │   ├── infinite-spiral.js # Motor 3D de la espiral infinita y navegación a galería
        │   ├── gooey-nav.js       # Componente de navegación líquida interactiva
        │   ├── particles.js       # Canvas de partículas tipográficas interactivas
        │   ├── scanner.js         # Shader WebGL de fondo dinámico
        │   └── admin.js           # Lógica del panel administrativo y gestión de perfil
        └── img/
            ├── devioz-img.png     # Logotipo oficial de la marca Devioz
            └── uploads/           # Directorio para imágenes subidas de proyectos
```

---

## 🛠️ Instalación y Configuración Local

### Requisitos Previos

- Servidor web local compatible con PHP (ej. **XAMPP**, **Laragon**, **WampServer** o **Apache/Nginx**).
- **PHP 8.0** o superior (extensiones recomendadas: `pdo`, `pdo_mysql`, `fileinfo`, `gd`).
- **MySQL 5.7+** o **MariaDB 10.4+**.

---

### Pasos de Instalación

#### 1. Clonar o copiar el repositorio
Ubica los archivos del proyecto dentro del directorio raíz de tu servidor web:
- **XAMPP (Windows)**: `C:\xampp\htdocs\portafolio-Devioz\`
- **Laragon**: `C:\laragon\www\portafolio-Devioz\`
- **Linux (Apache)**: `/var/www/html/portafolio-Devioz/`

#### 2. Iniciar los servicios del servidor
Inicia los servicios de **Apache** y **MySQL** desde el panel de control de tu entorno local.

#### 3. Configuración de Base de Datos
1. Accede a tu gestor de base de datos (ej. phpMyAdmin en `http://localhost/phpmyadmin/`).
2. Importa el archivo del esquema ubicado en:
   ```plaintext
   database/script.sql
   ```
3. El script creará la base de datos `portafolio_devioz` y las tablas necesarias (`usuarios`, `proyectos`).

#### 4. Variables de Conexión (`backend/config/db.php`)
El archivo de conexión soporta variables de entorno del sistema o valores por defecto para entornos locales:

```php
$host   = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_NAME') ?: 'portafolio_devioz';
$user   = getenv('DB_USER') ?: 'root';
$pass   = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
```

> [!NOTE]
> Ajusta las credenciales de conexión según la configuración de tu motor MySQL local.

#### 5. Configuración de la Cuenta de Administrador
Para inicializar el primer usuario con acceso al panel de administración:
1. Abre en tu navegador el asistente de instalación local:
   ```plaintext
   http://localhost/portafolio-Devioz/backend/crear_primer_admin.php
   ```
2. Define las credenciales deseadas (nombre, usuario/correo y contraseña segura).
3. Una vez creado el usuario, el acceso estará disponible en:
   ```plaintext
   http://localhost/portafolio-Devioz/frontend/login.html
   ```

> [!IMPORTANT]
> **Buenas prácticas de seguridad**:
> - En entornos de producción, asegúrate de restringir o eliminar el archivo `crear_primer_admin.php`.
> - Mantén tus contraseñas seguras y no compartas credenciales ni archivos `.env` en repositorios públicos.

---

## 🧭 Visualización del Sitio

- **Página Pública**: `http://localhost/portafolio-Devioz/frontend/index.html`
- **Acceso Administrativo**: `http://localhost/portafolio-Devioz/frontend/login.html`
  - *(Atajo opcional para desarrolladores en la página principal: `Ctrl + Shift + A`)*

---

## 📄 Licencia y Autoría

Desarrollado con altos estándares estéticos y de ingeniería de software para **Devioz**. Todos los derechos reservados.
