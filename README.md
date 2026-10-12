# 🌐 Portafolio Web — Devioz

> Plataforma web interactiva de alto impacto visual y experiencia cinemática, diseñada para exhibir proyectos de software, desarrollo web, inteligencia artificial, diseño e innovación digital. Implementada bajo arquitectura SPA modular en Vanilla JavaScript, WebGL Shaders, animaciones interactivas 3D y un robusto panel administrativo (CRUD) respaldado por PHP y MySQL.

---
<img width="1899" height="942" alt="Captura de pantalla 2026-09-07 225133" src="https://github.com/user-attachments/assets/7a4cd92b-45a6-452f-9b57-7a885046a3c9" />

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
  - **PHP 8.x (PHP 8.2+ recomendado)**: Arquitectura RESTful ligera con respuestas en formato JSON, control estricto de sesiones y procesamiento de archivos multimedia (`multipart/form-data`).
  - **PDO (PHP Data Objects)**: Conexión segura y persistente con sentencias preparadas para protección total contra inyección SQL.
  - **Integración con IA (cURL)**: Conectores optimizados para consumo de APIs de modelos LLM con prompts de sistema estructurados y contexto dinámico del portafolio.

- **Inteligencia Artificial (IA)**:
  - **Groq Cloud API (LLaMA 3.3 70B Versatile / Mixtral)**: Inferencia conversacional de ultra baja latencia mediante unidades LPU (*Language Processing Units*) para el asistente virtual inteligente.

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

### 5. 📂 Galería de Proyectos Dinámica y Modal Multimedia
- Carga automatizada desde la API REST de PHP con catálogo de respaldo curado.
- Animación escalonada de revelado al deslizarse (*Scroll Reveal Stagger*).
- **Modal Cinemático con Desenfoque de Fondo**: Al abrir los detalles de un proyecto, el fondo aplica desenfoque profundo (`backdrop-filter: blur(14px)`), centrando la atención en el contenido multimedia y las especificaciones técnicas.
- **Controles Multimedia Avanzados**: Selector segmentado para alternar entre imagen y video de demostración, con botón dedicado para silenciar o activar el audio del video.

### 6. 🤖 Asistente Virtual Inteligente con IA (Devioz AI Chatbot)
- **Widget Flotante Interactivo**: Botón de apertura con avatar animado, pulso luminoso y burbuja de bienvenida inicial con cierre automático o manual.
- **Conexión con Groq Cloud (LLaMA 3.3)**: Respuestas fluidas y contextualizadas en tiempo real sobre tecnologías, experiencia, proyectos y formas de contacto de Devioz.
- **Sugerencias Rápidas (*Quick Pills*)**: Preguntas frecuentes listas para enviar con un solo clic (ej. "¿Qué servicios ofreces?", "¿Qué proyectos tienes?", "¿Cómo cotizar?").
- **Experiencia Enriquecida**: Indicador de escritura animado, renderizado de respuestas con formato enriquecido (Markdown), y botón de reinicio de conversación para limpiar el historial de chat.

### 7. 🔐 Panel de Administración (Admin Dashboard)
- Interfaz moderna e intuitiva en `frontend/admin.html` para la gestión de contenido.
- **Operaciones CRUD**: Creación, consulta, edición y eliminación de proyectos del portafolio.
- Gestión de imágenes locales con previsualización en vivo o vinculación mediante URLs remotas.
- Conmutación rápida de estado destacado y visibilidad pública con un clic.
- Métricas y estadísticas generales del portafolio en tiempo real.
- **Gestor de Configuración de IA**: Modal integrado para conectar y verificar la API Key de Groq, consultar modelos disponibles y supervisar el estado de la conexión con indicador visual en tiempo real.

### 8. 👤 Gestión de Perfil de Administrador
- Modal integrado en el panel para consultar y actualizar credenciales en caliente (nombre completo, usuario/correo y contraseña).
- Validación estricta en backend (`backend/api/perfil.php`) asegurando que solo la sesión activa pueda modificar sus datos.
- Encriptación robusta con el algoritmo nativo `PASSWORD_BCRYPT`.
- Botón animado de acceso a perfil en la barra superior con micro-interacciones.

### 9. 🛡️ Seguridad y Blindaje de Sesión
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
│   └── script.sql                 # Definición de esquema y tablas de la base de datos (MySQL/MariaDB)
│
├── backend/
│   ├── config/
│   │   ├── db.php                 # Conexión PDO, configuración CORS y auto-inicialización
│   │   ├── groq.php               # Lógica de conexión con Groq API
│   │   └── groq_config.json       # Configuración y almacenamiento de credenciales de Groq
│   ├── api/
│   │   ├── chatbot.php            # Endpoint principal para interactuar con el asistente IA
│   │   ├── chatbot_config.php     # Consulta, validación y almacenamiento de API Keys de IA
│   │   ├── proyectos.php          # API REST completa para operaciones CRUD de proyectos
│   │   ├── login.php              # Autenticación segura y destrucción de sesión (logout)
│   │   ├── check_session.php      # Verificación de estado de sesión activa
│   │   ├── perfil.php             # Consulta y actualización de credenciales del administrador
│   │   ├── auth.php               # Endpoint de compatibilidad de autenticación
│   │   └── registrar.php          # Registro seguro de administradores
│   ├── crear_primer_admin.php     # Asistente para inicialización segura del administrador inicial
│   └── storage/                   # Almacenamiento local del backend
│
└── frontend/
    ├── index.html                 # Página pública principal (SPA interactiva con Chatbot IA)
    ├── login.html                 # Pantalla de acceso al panel administrativo
    ├── admin.html                 # Panel de control administrativo protegido (CRUD y ajustes de IA)
    └── assets/
        ├── css/
        │   ├── style.css          # Estilos globales, tokens de diseño y componentes
        │   ├── infinite-spiral.css# Estilos, perspectivas y animaciones del componente 3D
        │   └── chatbot.css        # Estilos visuales del widget flotante del Chatbot IA
        ├── js/
        │   ├── main.js            # Lógica central del frontend, scroll y modal de proyectos
        │   ├── infinite-spiral.js # Motor 3D de la espiral infinita y navegación a galería
        │   ├── gooey-nav.js       # Componente de navegación líquida interactiva
        │   ├── particles.js       # Canvas de partículas tipográficas interactivas
        │   ├── scanner.js         # Shader WebGL de fondo dinámico
        │   ├── chatbot.js         # Controlador cliente del asistente virtual de IA
        │   ├── admin.js           # Lógica del panel administrativo y gestión de perfil / IA
        │   └── lottie.min.js      # Librería para animaciones vectoriales
        └── img/
            ├── devioz-img.png     # Logotipo oficial de la marca Devioz
            ├── bot.png            # Avatar oficial del Asistente Virtual
            └── uploads/           # Directorio para imágenes subidas de proyectos
```

---

## 📡 Endpoints de la API Backend

| Método | Endpoint | Descripción | Requiere Autenticación |
|---|---|---|---|
| `GET / POST` | `backend/api/proyectos.php` | Listar proyectos públicos o gestionar CRUD completo | Solo para acciones de escritura (POST/PUT/DELETE) |
| `POST` | `backend/api/chatbot.php` | Enviar mensajes y recibir respuestas del Asistente IA | No (Público) |
| `GET / POST` | `backend/api/chatbot_config.php` | Consultar estado, probar o guardar la API Key de IA | Sí (Admin o Localhost) |
| `POST` | `backend/api/login.php` | Iniciar o cerrar sesión administrativa | No |
| `GET` | `backend/api/check_session.php` | Verificar si existe una sesión activa | No |
| `GET / POST` | `backend/api/perfil.php` | Consultar y actualizar datos del administrador | Sí (Admin) |

---

## 🛠️ Instalación y Configuración Local

### Requisitos Previos

- Servidor web local compatible con PHP (ej. **XAMPP**, **Laragon**, **WampServer** o **Apache/Nginx**).
- **PHP 8.0** o superior (probado y 100% compatible con **PHP 8.2+**; extensiones requeridas: `pdo`, `pdo_mysql`, `curl`, `fileinfo`, `gd`, `mbstring`).
- **MySQL 5.7+** o **MariaDB 10.4+**.

---

### Pasos de Instalación

#### 1. Clonar o copiar el repositorio
Ubica los archivos del proyecto dentro del directorio raíz de tu servidor web:
- **XAMPP (Windows)**: `C:\xampp\htdocs\portafolio-Devioz\`
- **Laragon**: `C:\laragon\www\portafolio-Devioz\`
- **Linux (Apache)**: `/var/www/html/portafolio-Devioz/`

#### 2. Iniciar los servicios del servidor
Inicia los servicios de **Apache** y **MySQL** desde el panel de control de tu entorno local (ej. XAMPP Control Panel).

#### 3. Configuración de Base de Datos
1. Accede a tu gestor de base de datos (ej. phpMyAdmin en `http://localhost/phpmyadmin/`).
2. Importa el archivo del esquema ubicado en:
   ```plaintext
   database/script.sql
   ```
3. El script creará la base de datos `portafolio_devioz` y las tablas necesarias (`usuarios`, `proyectos`).

#### 4. Variables de Conexión (`backend/config/db.php`)
El archivo de conexión soporta variables de entorno del sistema o configuración local parametrizada:

```php
$host   = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_NAME') ?: 'nombre_de_tu_bd';
$user   = getenv('DB_USER') ?: 'tu_usuario_db';
$pass   = getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'tu_password_db';
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

#### 6. Configuración del Asistente Virtual con IA (Groq Cloud)
Para que el asistente conversacional responda consultas de tus visitantes:
1. Inicia sesión en el panel administrativo (`frontend/login.html`).
2. En la barra superior, haz clic en el botón con el ícono del **Chatbot IA** (o en la sección de Ajustes).
3. Ingresa tu API Key de **Groq Cloud** y haz clic en **Guardar / Probar Conexión**.
4. Una vez guardada, el indicador cambiará a color verde y el chatbot en `frontend/index.html` responderá al instante con ultra baja latencia.

> [!IMPORTANT]
> **Buenas prácticas de seguridad**:
> - En entornos de producción, asegúrate de restringir o eliminar el archivo `crear_primer_admin.php`.
> - Mantén tus contraseñas seguras y no compartas credenciales ni archivos de claves en repositorios públicos.

---

## 🧭 Visualización del Sitio

- **Página Pública**: `http://localhost/portafolio-Devioz/frontend/index.html`
- **Acceso Administrativo**: `http://localhost/portafolio-Devioz/frontend/login.html`
  - *(Atajo opcional para desarrolladores en la página principal: `Ctrl + Shift + A`)*

---

## 📄 Licencia y Autoría

Desarrollado con altos estándares estéticos y de ingeniería de software para **Devioz**. Todos los derechos reservados.
