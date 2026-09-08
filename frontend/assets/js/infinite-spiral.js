/**
 * ========================================================
 * Portafolio Devioz — infinite-spiral.js
 * Componente 3D "Infinite Spiral" (Vanilla JS)
 * Showcase de Proyectos Más Destacados con Rotación Continua
 * ========================================================
 */

// Catálogo curado de los proyectos más destacados con imágenes y metadatos completos
const SPIRAL_FEATURED_CATALOG = [
    {
        id: 2,
        title: 'Neural Assistant & RAG Copilot',
        category: 'Inteligencia Artificial',
        categoryIcon: '🤖',
        url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Motor conversacional con embeddings vectoriales para consultas sobre documentación corporativa con respuestas precisas al instante.',
        tecnologias_array: ['Python', 'FastAPI', 'Gemini API', 'Vector DB'],
        enlace_demo: null
    },
    {
        id: 1,
        title: 'Plataforma E-Commerce SaaS',
        category: 'Desarrollo Web',
        categoryIcon: '🌐',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Sistema integral de comercio electrónico con pasarela de pagos, gestión de stock en tiempo real y panel de analítica avanzada.',
        tecnologias_array: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap 5'],
        enlace_demo: null
    },
    {
        id: 3,
        title: 'Dashboard Ejecutivo BI & KPIs',
        category: 'Business Intelligence',
        categoryIcon: '📊',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Tableros de analítica interactiva y pronóstico de ventas con sincronización automatizada de bases de datos relacionales.',
        tecnologias_array: ['Power BI', 'PostgreSQL', 'Python', 'ETL Pipeline'],
        enlace_demo: null
    },
    {
        id: 4,
        title: 'Spot Cinematográfico 4K',
        category: 'Spots Publicitarios',
        categoryIcon: '🎬',
        url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Producción audiovisual publicitaria con modelado 3D, animación de marca y masterización de sonido envolvente para difusión digital.',
        tecnologias_array: ['After Effects', 'Premiere Pro', 'Blender 3D', 'VFX'],
        enlace_demo: null
    },
    {
        id: 5,
        title: 'Identidad Visual & Branding',
        category: 'Diseño Gráfico',
        categoryIcon: '🎨',
        url: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Diseño integral de marca corporativa, guías de estilo, kit de tipografía y papelería digital con altos estándares estéticos.',
        tecnologias_array: ['Figma', 'Illustrator', 'Photoshop', 'Brand Guidelines'],
        enlace_demo: null
    },
    {
        id: 6,
        title: 'Portal Inmobiliario Smart & CRM',
        category: 'Desarrollo Web',
        categoryIcon: '🌐',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Aplicación web interactiva con mapas dinámicos, tours virtuales 3D y administración automatizada de prospectos comerciales.',
        tecnologias_array: ['JavaScript ES6', 'PHP', 'Leaflet Maps', 'MySQL'],
        enlace_demo: null
    },
    {
        id: 7,
        title: 'Clasificador de Imágenes CNN',
        category: 'Inteligencia Artificial',
        categoryIcon: '🤖',
        url: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Red neuronal convolucional entrenada para el reconocimiento de defectos en líneas de producción automatizadas en tiempo real.',
        tecnologias_array: ['TensorFlow', 'Keras', 'Python', 'OpenCV'],
        enlace_demo: null
    },
    {
        id: 8,
        title: 'Data Warehouse Cloud & BigQuery',
        category: 'Business Intelligence',
        categoryIcon: '📊',
        url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Arquitectura analítica empresarial en la nube con pipelines de ingesta continua, transformaciones dbt y orquestación Airflow.',
        tecnologias_array: ['Snowflake', 'dbt', 'Airflow', 'SQL'],
        enlace_demo: null
    },
    {
        id: 9,
        title: 'Animación de Producto 3D',
        category: 'Spots Publicitarios',
        categoryIcon: '🎬',
        url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Renders fotorrealistas y simulaciones de dinámica física optimizadas para campañas publicitarias de alto impacto en redes.',
        tecnologias_array: ['Blender 3D', 'Cinema 4D', 'After Effects'],
        enlace_demo: null
    }
];

class InfiniteSpiral {
    constructor(containerSelector = '#infiniteSpiralContainer', options = {}) {
        this.container = typeof containerSelector === 'string' 
            ? document.querySelector(containerSelector) 
            : containerSelector;

        if (!this.container) return;

        this.stage = this.container.querySelector('.infinite-spiral__stage') || this.createStage();

        // Configuración matemática de la curva S helicoidal ascendente
        this.options = Object.assign({
            itemCount: 9,               // Exactamente 9 tarjetas en la curva
            coils: 1.28,                // 1.28 vueltas: arco diagonal ribbon
            radius: 250,                // Radio de giro 3D ampliado
            radiusX: 230,               // Amplitud horizontal ampliada para mayor circunferencia
            radiusZ: 270,               // Profundidad en Z ampliada
            cardWidth: 160,             // Ancho de cada tarjeta (160px)
            cardHeight: 160,            // Alto de cada tarjeta (160px)
            verticalSpacing: 90,        // Espaciado vertical entre tarjetas adyacentes (~80px - 100px)
            verticalSpan: 810,          // Altura total del recorrido vertical (9 * 90px = 810px)
            autoSpeed: 0.00085,         // Velocidad de rotación constante y suave
            dragSensitivity: 0.0014     // Sensibilidad al arrastre manual
        }, options);

        // Estado interno de la animación
        this.progress = 0;
        this.velocity = 0;
        this.isDragging = false;
        this.hasMoved = false;
        this.justDragged = false;
        this.isHovered = false;
        this.mousePos = null;
        this.isRunning = false;
        this.isVisible = true;
        this.rafId = null;
        this.containerWidth = 1000;

        this.items = [];
        this.itemsData = [];

        // Inicializar
        this.init();
    }

    // -------------------------------------------------------------
    // Funciones Matemáticas Auxiliares (clamp, modulo, smoothstep)
    // -------------------------------------------------------------
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static modulo(value, max) {
        return ((value % max) + max) % max;
    }

    static smoothstep(min, max, value) {
        const x = InfiniteSpiral.clamp((value - min) / (max - min), 0, 1);
        return x * x * (3 - 2 * x);
    }

    createStage() {
        let stage = document.createElement('div');
        stage.className = 'infinite-spiral__stage';
        this.container.appendChild(stage);
        return stage;
    }

    updateDimensions() {
        if (this.container) {
            this.containerWidth = this.container.clientWidth || 1000;
        }
    }

    async init() {
        this.updateDimensions();
        this.setupEvents();
        this.setupLifecycle();
        await this.loadImages();
        this.render();
        this.start();
    }

    // Carga priorizada de los proyectos más destacados
    async loadImages() {
        let loadedProjects = [];

        try {
            const port = window.location.port;
            const isLiveDev = (port === '5500' || port === '5501' || port === '3000' || port === '5173' || window.location.protocol === 'file:');
            const host = window.location.hostname || 'localhost';

            const endpoints = [];
            if (isLiveDev) {
                endpoints.push(`http://${host}/portafolio-Devioz/backend/api/proyectos.php`);
                endpoints.push(`http://localhost/portafolio-Devioz/backend/api/proyectos.php`);
                endpoints.push(`http://127.0.0.1/portafolio-Devioz/backend/api/proyectos.php`);
            }
            endpoints.push(window.location.pathname.includes('/frontend/') ? '../backend/api/proyectos.php' : 'backend/api/proyectos.php');
            if (!isLiveDev) {
                endpoints.push(`http://localhost/portafolio-Devioz/backend/api/proyectos.php`);
            }

            for (const endpoint of endpoints) {
                try {
                    const res = await fetch(endpoint, {
                        headers: { 'Accept': 'application/json' }
                    });

                    if (res.ok) {
                        const txt = await res.text();
                        if (!txt.trim().startsWith('<?php')) {
                            const data = JSON.parse(txt);
                            loadedProjects = Array.isArray(data) ? data : (data.proyectos || data.data || []);
                            if (loadedProjects.length > 0) break;
                        }
                    }
                } catch (ignore) {}
            }
        } catch (err) {
            // Continuar con fallback
        }

        // Si la API no respondió pero los proyectos ya están en memoria
        if (loadedProjects.length === 0 && window.allLoadedProjects && Array.isArray(window.allLoadedProjects) && window.allLoadedProjects.length > 0) {
            loadedProjects = window.allLoadedProjects;
        }

        // 1. Filtrar únicamente proyectos destacados (destacado == 1)
        let featuredList = [];

        if (loadedProjects.length > 0) {
            featuredList = loadedProjects.filter(p => Number(p.destacado) === 1 || p.destacado === true || p.destacado === '1');
        }

        // 2. Si no hay proyectos con destacado == 1 en la BD, usar el catálogo de proyectos destacados curado
        if (featuredList.length === 0) {
            featuredList = SPIRAL_FEATURED_CATALOG.map((fallbackProj, i) => ({
                id: fallbackProj.id || (i + 1),
                titulo: fallbackProj.title,
                categoria_nombre: fallbackProj.category,
                categoria_icono: fallbackProj.categoryIcon,
                imagen_url: fallbackProj.url,
                imagen: fallbackProj.url,
                descripcion: fallbackProj.descripcion,
                tecnologias_array: fallbackProj.tecnologias_array,
                enlace_demo: fallbackProj.enlace_demo,
                destacado: 1
            }));
        }

        const total = this.options.itemCount; // 9
        this.itemsData = [];

        for (let i = 0; i < total; i++) {
            const proj = featuredList[i % featuredList.length];
            const fallback = SPIRAL_FEATURED_CATALOG[i % SPIRAL_FEATURED_CATALOG.length];

            let imgUrl = proj.imagen_url || proj.imagen;
            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
                imgUrl = 'assets/img/uploads/' + imgUrl.replace(/^.*[\\\/]/, '');
            }

            const catName = proj.categoria_nombre || fallback.category;
            const catIcon = proj.categoria_icono || fallback.categoryIcon || '⭐';

            this.itemsData.push({
                id: proj.id || fallback.id || (i + 1),
                url: imgUrl || fallback.url,
                fallbackUrl: fallback.url,
                title: proj.titulo || fallback.title,
                category: `${catIcon} ${catName}`,
                project: proj
            });
        }

        this.buildStage();
    }

    // Actualiza metadatos e imágenes de proyectos dinámicamente sin reiniciar la animación
    updateProjectData(projs) {
        if (!Array.isArray(projs) || projs.length === 0) return;

        // Filtrar únicamente proyectos destacados (destacado == 1)
        const ordered = projs.filter(p => Number(p.destacado) === 1 || p.destacado === true || p.destacado === '1');
        if (ordered.length === 0) return;

        this.itemsData.forEach((item, idx) => {
            const p = ordered[idx % ordered.length];
            if (p) {
                item.project = p;
                item.id = p.id;
                item.title = p.titulo || item.title;

                const catName = p.categoria_nombre || 'Destacado';
                const catIcon = p.categoria_icono || '⭐';
                item.category = `${catIcon} ${catName}`;

                let img = p.imagen_url || p.imagen;
                if (img) {
                    if (!img.startsWith('http') && !img.startsWith('data:')) {
                        img = 'assets/img/uploads/' + img.replace(/^.*[\\\/]/, '');
                    }
                    item.url = img;
                }

                const domItem = this.items[idx];
                if (domItem) {
                    domItem.setAttribute('data-id', p.id);
                    domItem.setAttribute('aria-label', item.title);
                    const imgEl = domItem.querySelector('.infinite-spiral__image');
                    if (imgEl && item.url) {
                        imgEl.src = item.url;
                        imgEl.alt = item.title;
                    }
                    const titleEl = domItem.querySelector('.infinite-spiral__title');
                    if (titleEl) titleEl.textContent = item.title;
                    const actionEl = domItem.querySelector('.infinite-spiral__action');
                    if (actionEl) actionEl.setAttribute('aria-label', `Ver detalles de ${item.title}`);
                }
            }
        });
    }

    buildStage() {
        this.stage.innerHTML = '';
        this.items = [];

        this.itemsData.forEach((data, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'infinite-spiral__item';
            itemEl.setAttribute('data-index', index);
            itemEl.setAttribute('data-id', (data.project && data.project.id) || data.id || (index + 1));
            itemEl.setAttribute('role', 'button');
            itemEl.setAttribute('tabindex', '0');
            itemEl.setAttribute('aria-label', data.title || 'Ver proyecto');

            // 1. Imagen del proyecto destacado en alta calidad
            const imgEl = document.createElement('img');
            imgEl.className = 'infinite-spiral__image';
            imgEl.src = data.url;
            imgEl.alt = data.title || 'Proyecto Destacado';
            imgEl.loading = index < 6 ? 'eager' : 'lazy';

            // Salvaguarda 404 ante imágenes rotas
            imgEl.addEventListener('error', () => {
                imgEl.src = data.fallbackUrl || SPIRAL_FEATURED_CATALOG[index % SPIRAL_FEATURED_CATALOG.length].url;
            });

            // 2. Overlay permanente con título del proyecto y acción "Ver Detalles"
            const overlayEl = document.createElement('div');
            overlayEl.className = 'infinite-spiral__overlay';

            const infoEl = document.createElement('div');
            infoEl.className = 'infinite-spiral__info';

            const titleEl = document.createElement('span');
            titleEl.className = 'infinite-spiral__title';
            titleEl.textContent = data.title || 'Proyecto Devioz';

            const actionEl = document.createElement('div');
            actionEl.className = 'infinite-spiral__action';
            actionEl.setAttribute('role', 'button');
            actionEl.setAttribute('tabindex', '0');
            actionEl.setAttribute('aria-label', `Ver detalles de ${data.title}`);
            actionEl.innerHTML = `
                <span>Ver Detalles</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                </svg>
            `;

            infoEl.appendChild(titleEl);
            infoEl.appendChild(actionEl);
            overlayEl.appendChild(infoEl);

            itemEl.style.width = `${this.options.cardWidth}px`;
            itemEl.style.height = `${this.options.cardHeight}px`;

            itemEl.appendChild(imgEl);
            itemEl.appendChild(overlayEl);
            this.stage.appendChild(itemEl);

            // Clic interactivo: desplazamiento suave al proyecto en la galería y apertura del modal
            const handleClick = (e) => {
                if (this.hasMoved || this.justDragged) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                e.preventDefault();
                e.stopPropagation();

                this.navigateToGalleryAndOpenModal(data.project, data);
            };

            itemEl.addEventListener('click', handleClick);
            actionEl.addEventListener('click', handleClick);

            // Accesibilidad por teclado (Enter / Espacio)
            const handleKey = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.navigateToGalleryAndOpenModal(data.project, data);
                }
            };
            itemEl.addEventListener('keydown', handleKey);
            actionEl.addEventListener('keydown', handleKey);

            this.items.push(itemEl);
        });
    }

    // -------------------------------------------------------------
    // Navegación suave hacia el proyecto en #galeria-proyectos y apertura del modal
    // -------------------------------------------------------------
    navigateToGalleryAndOpenModal(project, fallbackData = {}) {
        const proj = project || fallbackData.project || {};
        const title = proj.titulo || fallbackData.title || '';
        const rawId = proj.id !== undefined ? proj.id : fallbackData.id;
        const cleanId = rawId !== undefined ? String(rawId).replace(/^feat-/, '') : null;

        // 1. Encontrar el proyecto coincidente en allLoadedProjects o DEFAULT_PROJECTS
        const list = (window.allLoadedProjects && window.allLoadedProjects.length > 0)
            ? window.allLoadedProjects
            : (typeof DEFAULT_PROJECTS !== 'undefined' ? DEFAULT_PROJECTS : []);

        let matchedProj = null;
        if (cleanId) {
            matchedProj = list.find(p => String(p.id) === String(rawId) || String(p.id) === cleanId);
        }
        if (!matchedProj && title) {
            const norm = title.toLowerCase().trim();
            matchedProj = list.find(p => {
                const pNorm = (p.titulo || '').toLowerCase().trim();
                return pNorm === norm || pNorm.includes(norm) || norm.includes(pNorm);
            });
        }
        if (!matchedProj && proj.titulo) {
            matchedProj = proj;
        }

        const targetId = matchedProj ? matchedProj.id : (cleanId || rawId);

        // 2. Localizar la tarjeta del proyecto en el DOM de la galería (#projects-grid)
        let targetCard = null;
        if (targetId) {
            targetCard = document.querySelector(`.project-item[data-id="${targetId}"]`) ||
                         document.getElementById(`project-item-${targetId}`);
        }
        if (!targetCard && title) {
            const allTitles = document.querySelectorAll('.project-card-title');
            for (const tEl of allTitles) {
                const tText = tEl.textContent.trim().toLowerCase();
                const norm = title.toLowerCase().trim();
                if (tText === norm || tText.includes(norm) || norm.includes(tText)) {
                    targetCard = tEl.closest('.project-item');
                    break;
                }
            }
        }

        const gallerySection = document.getElementById('galeria-proyectos') || document.getElementById('proyectos');
        const scrollTarget = targetCard || gallerySection;

        // Función para aplicar resplandor dinámico y abrir el modal
        const activateProject = () => {
            if (targetCard) {
                targetCard.classList.add('revealed', 'is-visible');
                const innerCard = targetCard.querySelector('.project-card') || targetCard;
                innerCard.classList.add('project-card-highlight');
                setTimeout(() => {
                    innerCard.classList.remove('project-card-highlight');
                }, 3500);
            }

            // Abrir el modal de detalle del proyecto
            if (targetId && typeof window.openProjectModalById === 'function') {
                window.openProjectModalById(targetId, title);
            } else if (typeof window.openProjectModal === 'function') {
                const pData = matchedProj || proj || fallbackData;
                const pImg = (typeof window.formatProjectImageUrl === 'function')
                    ? window.formatProjectImageUrl(pData.imagen_url || pData.imagen || fallbackData.url)
                    : (pData.imagen_url || pData.imagen || fallbackData.url);

                window.openProjectModal({
                    id: targetId,
                    title: pData.titulo || fallbackData.title || title,
                    category: (pData.categoria_icono ? pData.categoria_icono + ' ' : '') + (pData.categoria_nombre || fallbackData.category || 'Proyecto Destacado'),
                    img: pImg,
                    desc: pData.descripcion || 'Detalle del proyecto en portafolio Devioz.',
                    tech: pData.tecnologias_array || (pData.tecnologias ? pData.tecnologias.split(',').map(s => s.trim()) : []),
                    demo: pData.enlace_demo || pData.demo_url
                });
            }
        };

        if (scrollTarget) {
            // Desplazamiento suave directamente hacia el proyecto seleccionado
            scrollTarget.scrollIntoView({
                behavior: 'smooth',
                block: targetCard ? 'center' : 'start'
            });

            // Si ya está en pantalla, activar de inmediato
            const rect = scrollTarget.getBoundingClientRect();
            if (Math.abs(rect.top - window.innerHeight / 2) < 200) {
                activateProject();
                return;
            }

            let triggered = false;
            const handleArrival = () => {
                if (triggered) return;
                triggered = true;
                activateProject();
            };

            // Evento nativo scrollend
            const onScrollEnd = () => {
                window.removeEventListener('scrollend', onScrollEnd);
                setTimeout(handleArrival, 80);
            };
            window.addEventListener('scrollend', onScrollEnd, { once: true });

            // Respaldo de tiempo sincronizado con la duración del desplazamiento suave
            setTimeout(handleArrival, 600);
        } else {
            activateProject();
        }
    }

    // -------------------------------------------------------------
    // Cálculo Matemático de la Curva S Ascendente (De Abajo hacia Arriba)
    // -------------------------------------------------------------
    render() {
        if (!this.items || this.items.length === 0) return;

        const N = this.items.length;
        const { coils, radiusX, radiusZ, verticalSpan, verticalSpacing } = this.options;

        const effectiveVerticalSpan = (verticalSpacing && N) ? (verticalSpacing * N) : verticalSpan;

        // Factor de escala responsive basado en ancho cacheado
        const width = this.containerWidth || 1000;
        const scaleFactor = Math.min(1.0, Math.max(0.72, width / 1100));
        const effectiveRadiusX = radiusX * scaleFactor;
        const effectiveRadiusZ = radiusZ * scaleFactor;
        const effectiveSpan = effectiveVerticalSpan * scaleFactor;

        for (let i = 0; i < N; i++) {
            const item = this.items[i];

            // 1. Posición cíclica normalizada u en [0, 1)
            const u = InfiniteSpiral.modulo(this.progress + (i / N), 1);

            // 2. Trayectoria ascendente continua (las imágenes suben de abajo para arriba):
            // En u = 0: y = +0.5 * span (inicia en la parte inferior)
            // En u = 0.5: y = 0 (centro exacto, hero protagonista)
            // En u = 1: y = -0.5 * span (culmina en la parte superior)
            const y = (0.5 - u) * effectiveSpan;

            // 3. Ángulo de la curva S:
            // En u = 0.5: theta = 0 (centro frontal)
            const d = u - 0.5; // Distancia al centro en [-0.5, 0.5]
            const theta = d * (coils * Math.PI * 2);

            const sinT = Math.sin(theta);
            const cosT = Math.cos(theta);

            // 4. Desplazamiento horizontal X:
            // Abajo (d < 0): sinT < 0 -> x es positivo (hacia la derecha)
            // Centro (d = 0): x = 0 (centro hero)
            // Arriba (d > 0): sinT > 0 -> x es negativo (hacia la izquierda)
            // En extremos (|theta| > pi/2): la curva regresa armónicamente
            const x = -sinT * effectiveRadiusX;

            // 5. Profundidad Z:
            // cosT = 1 en el centro (frente a la cámara, máxima proximidad)
            // cosT decrece hacia los extremos (fondo de la escena)
            const z = (cosT * effectiveRadiusZ) - 30;

            // 6. Proximidad al centro / protagonista (distancia normalizada de 0 a 1)
            const distFromCenter = Math.min(1.0, Math.abs(d) * 2.0);
            const frontness = Math.max(0, 1.0 - distFromCenter);

            // 7. Escala: 1.08x al frente protagonista, 0.72x en el fondo
            const scale = (0.72 + 0.36 * frontness) * scaleFactor;

            // 8. Zona focal nítida para las 3 tarjetas del frente:
            // Las 3 tarjetas principales del frente se mantienen 100% claras y nítidas (0px blur).
            // Para las tarjetas secundarias del fondo, el desenfoque bokeh aumenta de forma suave y progresiva hasta 14px.
            let blur = 0;
            const absD = Math.abs(d);
            if (absD > 0.18) {
                const excess = (absD - 0.18) / (0.5 - 0.18);
                blur = Math.pow(excess, 1.2) * 14;
            }

            // 9. Opacidad: las 3 tarjetas frontales tienen opacidad completa (1.0),
            // con desvanecimiento gradual únicamente en las tarjetas extremas del fondo
            const edgeFade = Math.min(
                InfiniteSpiral.smoothstep(0.0, 0.06, u),
                1.0 - InfiniteSpiral.smoothstep(0.94, 1.0, u)
            );
            const opacity = absD <= 0.18
                ? 1.0
                : edgeFade * (0.65 + 0.35 * frontness);

            // 10. Inclinación sutil casi plana al espectador (fiel a la foto)
            const rotateZ = -sinT * 2.2;

            // 11. Aplicación directa acelerada por hardware (GPU)
            item.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateZ(${rotateZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
            item.style.opacity = opacity.toFixed(3);
            item.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : 'none';

            // 12. Orden de apilamiento en 3D
            item.style.zIndex = Math.round(z + 1000);
        }
    }

    // -------------------------------------------------------------
    // Detección de Proximidad Focal:
    // Se detiene únicamente cuando el cursor está "bien cerca" (≤ 25px) de alguna tarjeta
    // -------------------------------------------------------------
    checkMouseProximity() {
        if (!this.mousePos || this.isDragging || !this.items || this.items.length === 0) {
            return false;
        }

        const { x, y } = this.mousePos;
        // Umbral de proximidad estrecho: solo cuando el cursor está realmente bien cerca
        const PROXIMITY_THRESHOLD = 25;

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const rect = item.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;

            const dx = Math.max(rect.left - x, 0, x - rect.right);
            const dy = Math.max(rect.top - y, 0, y - rect.bottom);

            if (dx <= PROXIMITY_THRESHOLD && dy <= PROXIMITY_THRESHOLD) {
                const dist = Math.hypot(dx, dy);
                if (dist <= PROXIMITY_THRESHOLD) {
                    return true;
                }
            }
        }

        return false;
    }

    // -------------------------------------------------------------
    // Bucle de Animación Continuo a Velocidad Constante
    // Se detiene al colocar el cursor bien cerca de la espiral
    // -------------------------------------------------------------
    animate() {
        if (!this.isRunning) return;

        // Comprobar si el cursor está realmente bien cerca de alguna tarjeta de la espiral
        this.isHovered = this.checkMouseProximity();

        // Solo avanza la rotación automática si el cursor NO está bien cerca ni se está arrastrando
        if (!this.isHovered && !this.isDragging) {
            this.progress += this.options.autoSpeed;
        }

        // Si hubo impulso por arrastre manual, decae suavemente con fricción
        if (this.velocity !== 0) {
            this.velocity *= 0.94;
            if (Math.abs(this.velocity) < 0.00003) {
                this.velocity = 0;
            }
            this.progress += this.velocity;
        }

        this.render();
        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    // -------------------------------------------------------------
    // Interacción de Arrastre (Drag) y Detección de Cursor Hover Cercano
    // targetProgress -= deltaY / verticalSpacing
    // -------------------------------------------------------------
    setupEvents() {
        let startX = 0;
        let startY = 0;
        let lastY = 0;

        // Rastrear posición del ratón para detección precisa de proximidad muy cercana
        const onMouseMove = (e) => {
            if (e.pointerType === 'mouse' || e.type === 'mousemove') {
                this.mousePos = { x: e.clientX, y: e.clientY };
            }
        };

        const onMouseLeave = () => {
            this.mousePos = null;
            this.isHovered = false;
        };

        this.container.addEventListener('pointermove', onMouseMove, { passive: true });
        this.container.addEventListener('mousemove', onMouseMove, { passive: true });
        this.container.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('blur', onMouseLeave);

        const onPointerDown = (e) => {
            // Permitir exclusivamente clic izquierdo para ratón (button === 0)
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            // En pantallas táctiles permitir el scroll vertical de la página
            if (e.pointerType === 'touch') return;

            this.isDragging = true;
            this.hasMoved = false;
            this.justDragged = false;
            startX = e.clientX;
            startY = e.clientY;
            lastY = e.clientY;
            this.velocity = 0;

            this.container.classList.add('is-dragging');
            // Nota: NO llamamos a setPointerCapture aquí para no interceptar ni anular clics en tarjetas hijas
        };

        const onPointerMove = (e) => {
            if (!this.isDragging) return;

            const deltaY = e.clientY - lastY;
            const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
            if (dist > 6) {
                if (!this.hasMoved) {
                    this.hasMoved = true;
                    try {
                        this.container.setPointerCapture(e.pointerId);
                    } catch (err) {}
                }
            }

            if (!this.hasMoved) return;

            // Desplazamiento y giro en tiempo real: targetProgress -= deltaY / verticalSpacing
            const verticalSpacing = this.options.verticalSpan;
            const progressDelta = deltaY / verticalSpacing;

            this.progress -= progressDelta;
            this.velocity = -progressDelta * 0.4;

            lastY = e.clientY;
        };

        const onPointerEnd = (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.container.classList.remove('is-dragging');
            this.velocity = InfiniteSpiral.clamp(this.velocity, -0.015, 0.015);

            if (e.clientX !== undefined && e.clientY !== undefined) {
                this.mousePos = (e.pointerType === 'mouse') ? { x: e.clientX, y: e.clientY } : null;
            }

            if (this.hasMoved) {
                this.justDragged = true;
                setTimeout(() => {
                    this.justDragged = false;
                    this.hasMoved = false;
                }, 220);
            }

            try {
                if (this.container.hasPointerCapture && this.container.hasPointerCapture(e.pointerId)) {
                    this.container.releasePointerCapture(e.pointerId);
                }
            } catch (err) {}
        };

        // Eventos Pointer vinculados únicamente al contenedor del área de la espiral
        this.container.addEventListener('pointerdown', onPointerDown);
        this.container.addEventListener('pointermove', onPointerMove);
        this.container.addEventListener('pointerup', onPointerEnd);
        this.container.addEventListener('pointercancel', onPointerEnd);

        // Delegación de clic de seguridad en el contenedor para máxima fiabilidad
        this.container.addEventListener('click', (e) => {
            if (this.hasMoved || this.justDragged) return;
            const itemEl = e.target.closest('.infinite-spiral__item');
            if (itemEl) {
                const idx = parseInt(itemEl.getAttribute('data-index'), 10);
                if (!isNaN(idx) && this.itemsData && this.itemsData[idx]) {
                    this.navigateToGalleryAndOpenModal(this.itemsData[idx].project, this.itemsData[idx]);
                }
            }
        });

        // Reajuste fluido en redimensionamiento de ventana
        window.addEventListener('resize', () => {
            this.updateDimensions();
            this.render();
        });
    }

    // -------------------------------------------------------------
    // Ciclo de Vida: Rotación Continua que no se interrumpe al hacer scroll
    // -------------------------------------------------------------
    setupLifecycle() {
        this.isVisible = true;

        // Pausar únicamente si el usuario cambia de pestaña para optimizar recursos
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const spiralEl = document.getElementById('infiniteSpiralContainer');
    if (spiralEl) {
        window.deviozSpiral = new InfiniteSpiral(spiralEl);
    }
});
