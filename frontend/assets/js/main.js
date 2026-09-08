// =========================================
// Portafolio Devioz — main.js
// Flujo Continuo de Proyectos + Animaciones de Scroll
// =========================================

// -----------------------------------------
// CATÁLOGO BASE DE PROYECTOS (Fallback / Cache en memoria)
// -----------------------------------------
const DEFAULT_PROJECTS = [
    {
        id: 1,
        titulo: 'Plataforma E-Commerce SaaS',
        categoria_nombre: 'Desarrollo Web',
        categoria_icono: '🌐',
        categoria_slug: 'desarrollo-web',
        imagen_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Sistema integral de comercio electrónico con pasarela de pagos, gestión de inventario en tiempo real y panel de analítica avanzada.',
        tecnologias_array: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap 5'],
        enlace_demo: null,
        destacado: 1
    },
    {
        id: 2,
        titulo: 'Neural Assistant & RAG Copilot',
        categoria_nombre: 'Inteligencia Artificial',
        categoria_icono: '🤖',
        categoria_slug: 'inteligencia-artificial',
        imagen_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Motor conversacional con embeddings vectoriales para consultas sobre documentación corporativa con respuestas precisas al instante.',
        tecnologias_array: ['Python', 'FastAPI', 'Gemini API', 'Vector DB'],
        enlace_demo: null,
        destacado: 1
    },
    {
        id: 3,
        titulo: 'Dashboard Ejecutivo BI & KPIs',
        categoria_nombre: 'Business Intelligence',
        categoria_icono: '📊',
        categoria_slug: 'business-intelligence',
        imagen_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Tableros de analítica interactiva y pronóstico de ventas con sincronización automatizada de bases de datos relacionales.',
        tecnologias_array: ['Power BI', 'PostgreSQL', 'Python', 'ETL Pipeline'],
        enlace_demo: null,
        destacado: 1
    },
    {
        id: 4,
        titulo: 'Spot Cinematográfico 4K',
        categoria_nombre: 'Spots Publicitarios',
        categoria_icono: '🎬',
        categoria_slug: 'spots-publicitarios',
        imagen_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Producción audiovisual publicitaria con modelado 3D, animación de marca y masterización de sonido envolvente para difusión digital.',
        tecnologias_array: ['After Effects', 'Premiere Pro', 'Blender 3D', 'VFX'],
        enlace_demo: null,
        destacado: 1
    },
    {
        id: 5,
        titulo: 'Identidad Visual & Branding',
        categoria_nombre: 'Diseño Gráfico',
        categoria_icono: '🎨',
        categoria_slug: 'diseno-grafico',
        imagen_url: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Diseño integral de marca corporativa, guías de estilo, kit de tipografía y papelería digital con altos estándares estéticos.',
        tecnologias_array: ['Figma', 'Illustrator', 'Photoshop', 'Brand Guidelines'],
        enlace_demo: null,
        destacado: 0
    },
    {
        id: 6,
        titulo: 'Portal Inmobiliario Smart & CRM',
        categoria_nombre: 'Desarrollo Web',
        categoria_icono: '🌐',
        categoria_slug: 'desarrollo-web',
        imagen_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Aplicación web interactiva con mapas dinámicos, tours virtuales 3D y administración automatizada de prospectos comerciales.',
        tecnologias_array: ['JavaScript ES6', 'PHP', 'Leaflet Maps', 'MySQL'],
        enlace_demo: null,
        destacado: 0
    },
    {
        id: 7,
        titulo: 'Clasificador de Imágenes CNN',
        categoria_nombre: 'Inteligencia Artificial',
        categoria_icono: '🤖',
        categoria_slug: 'inteligencia-artificial',
        imagen_url: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Red neuronal convolucional entrenada para el reconocimiento de defectos en líneas de producción automatizadas en tiempo real.',
        tecnologias_array: ['TensorFlow', 'Keras', 'Python', 'OpenCV'],
        enlace_demo: null,
        destacado: 0
    },
    {
        id: 8,
        titulo: 'Data Warehouse & Modelado Dimensional',
        categoria_nombre: 'Business Intelligence',
        categoria_icono: '📊',
        categoria_slug: 'business-intelligence',
        imagen_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Arquitectura analítica empresarial en la nube con pipelines de ingesta continua, transformaciones dbt y orquestación Airflow.',
        tecnologias_array: ['Snowflake', 'dbt', 'Airflow', 'SQL'],
        enlace_demo: null,
        destacado: 0
    },
    {
        id: 9,
        titulo: 'Animación de Producto 3D & Reels',
        categoria_nombre: 'Spots Publicitarios',
        categoria_icono: '🎬',
        categoria_slug: 'spots-publicitarios',
        imagen_url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1200&q=80',
        descripcion: 'Renders fotorrealistas y simulaciones de dinámica física optimizadas para campañas publicitarias de alto impacto en redes.',
        tecnologias_array: ['Blender 3D', 'Cinema 4D', 'After Effects'],
        enlace_demo: null,
        destacado: 0
    }
];

// Variable global en memoria para proyectos
let allLoadedProjects = [...DEFAULT_PROJECTS];
window.allLoadedProjects = allLoadedProjects;
let scrollObserver = null;

// -----------------------------------------
// MODAL DE DETALLE DE PROYECTO
// -----------------------------------------
function openProjectModal(data) {
    const modalEl = document.getElementById('projectDetailModal');
    if (!modalEl || typeof bootstrap === 'undefined') return;

    const titleEl = document.getElementById('projectDetailTitle');
    const badgeEl = document.getElementById('modalProjectCategoryBadge');
    const imgEl = document.getElementById('modalProjectImg');
    const descEl = document.getElementById('modalProjectDesc');
    const techListEl = document.getElementById('modalProjectTechList');
    const demoContainerEl = document.getElementById('modalProjectDemoContainer');

    if (titleEl) titleEl.textContent = data.title || 'Detalle del Proyecto';
    if (badgeEl) badgeEl.textContent = data.category || 'Proyecto';
    if (imgEl) {
        imgEl.src = data.img || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
        imgEl.alt = data.title || 'Proyecto';
    }
    if (descEl) descEl.textContent = data.desc || 'Proyecto en portafolio Devioz.';

    if (techListEl) {
        techListEl.innerHTML = '';
        if (Array.isArray(data.tech) && data.tech.length > 0) {
            data.tech.forEach(t => {
                const badge = document.createElement('span');
                badge.className = 'tech-badge';
                badge.textContent = t;
                techListEl.appendChild(badge);
            });
        }
    }

    if (demoContainerEl) {
        const hasExternalDemo = data.demo && 
                                typeof data.demo === 'string' && 
                                data.demo.startsWith('http') && 
                                !data.demo.includes('devioz.com');

        if (hasExternalDemo) {
            demoContainerEl.innerHTML = `
                <a href="${data.demo}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-main d-inline-flex align-items-center gap-1" style="font-size: 0.84rem; padding: 6px 14px;">
                    <span>Visitar Demo / Sitio</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            `;
        } else {
            demoContainerEl.innerHTML = `
                <span class="text-secondary small" style="color: #94a3b8 !important;">Proyecto de muestra del portafolio</span>
            `;
        }
    }

    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.show();
}

// Formateador robusto de URL de imágenes locales o externas
function formatProjectImageUrl(img) {
    if (!img) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
        return img;
    }
    const clean = img.replace(/^.*[\\\/]/, '');
    return `assets/img/uploads/${clean}`;
}

// Abrir modal buscando por ID de proyecto o título de respaldo
function openProjectModalById(projectId, fallbackTitle = '') {
    if (!projectId && projectId !== 0 && !fallbackTitle) return;

    const list = (window.allLoadedProjects && window.allLoadedProjects.length > 0)
        ? window.allLoadedProjects
        : (typeof allLoadedProjects !== 'undefined' && allLoadedProjects.length > 0 ? allLoadedProjects : (typeof DEFAULT_PROJECTS !== 'undefined' ? DEFAULT_PROJECTS : []));

    let project = null;

    // 1. Búsqueda por ID (manejando prefijos sintéticos como 'feat-')
    if (projectId || projectId === 0) {
        const rawStr = String(projectId);
        const cleanId = rawStr.replace(/^feat-/, '');
        project = list.find(p => String(p.id) === rawStr || String(p.id) === cleanId);
    }

    // 2. Búsqueda por coincidencia de título si no se localizó por ID
    if (!project && fallbackTitle) {
        const norm = fallbackTitle.toLowerCase().trim();
        project = list.find(p => {
            const pNorm = (p.titulo || '').toLowerCase().trim();
            return pNorm === norm || pNorm.includes(norm) || norm.includes(pNorm);
        });
    }

    if (project) {
        openProjectModal({
            id: project.id,
            title: project.titulo,
            category: (project.categoria_icono ? project.categoria_icono + ' ' : '') + (project.categoria_nombre || 'Proyecto Destacado'),
            img: formatProjectImageUrl(project.imagen_url || project.imagen),
            desc: project.descripcion,
            tech: project.tecnologias_array || (project.tecnologias ? project.tecnologias.split(',').map(s => s.trim()) : []),
            demo: project.enlace_demo || project.demo_url
        });

        // Resaltar la tarjeta correspondiente en la galería con resplandor cinemático
        const cardCol = document.querySelector(`.project-item[data-id="${project.id}"]`) ||
                        document.getElementById(`project-item-${project.id}`);
        if (cardCol) {
            cardCol.classList.add('revealed', 'is-visible');
            const cardInner = cardCol.querySelector('.project-card') || cardCol;
            cardInner.classList.add('project-card-highlight');
            setTimeout(() => cardInner.classList.remove('project-card-highlight'), 3500);
        }
    }
}

// Exponer funciones globalmente para componentes interactivos como Infinite Spiral
window.openProjectModal = openProjectModal;
window.openProjectModalById = openProjectModalById;
window.formatProjectImageUrl = formatProjectImageUrl;


// -----------------------------------------
// RENDERIZADO DINÁMICO EN FLUJO CONTINUO
// -----------------------------------------
function renderPublicProjectsGrid(projects) {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid || !Array.isArray(projects) || projects.length === 0) return;

    projectsGrid.innerHTML = '';

    projects.forEach((p, idx) => {
        const catSlug = p.categoria_slug || 'desarrollo-web';
        const catName = p.categoria_nombre || 'General';
        const catIcon = p.categoria_icono || '📁';
        const imgUrl = formatProjectImageUrl(p.imagen_url || p.imagen);
        const techs = p.tecnologias_array && p.tecnologias_array.length 
            ? p.tecnologias_array 
            : (p.tecnologias ? p.tecnologias.split(',').map(s => s.trim()) : []);

        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 project-item';
        col.setAttribute('data-category', catSlug);
        col.setAttribute('data-id', p.id);
        col.setAttribute('data-index', idx);
        col.id = `project-item-${p.id}`;

        col.innerHTML = `
            <div class="project-card">
                <div class="project-card-glow"></div>
                <div class="card-img-wrapper">
                    <img src="${imgUrl}" alt="${p.titulo}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="project-card-body">
                    <h3 class="project-card-title">${p.titulo}</h3>
                    <p class="project-card-desc">
                        ${p.descripcion || ''}
                    </p>
                    <div class="tech-badges-list">
                        ${techs.map(t => `<span class="tech-badge">${t}</span>`).join('')}
                    </div>
                    <button type="button" class="btn-card-action" data-id="${p.id || idx}">
                        <span>Ver Proyecto</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        projectsGrid.appendChild(col);
    });

    // Configurar animaciones de scroll y efectos visuales sobre las tarjetas renderizadas
    setupScrollAnimations();
}

// -----------------------------------------
// CARGA DE TODOS LOS PROYECTOS DESDE LA API
// -----------------------------------------
async function fetchPublicProjects() {
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

        let resData = null;
        for (const url of endpoints) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                if (!response.ok) continue;
                const txt = await response.text();
                if (txt.trim().startsWith('<?php')) continue;
                resData = JSON.parse(txt);
                if (resData && (Array.isArray(resData) || Array.isArray(resData.data))) break;
            } catch (ignore) {}
        }

        const projsList = resData 
            ? (Array.isArray(resData) ? resData : (resData.data || [])) 
            : [];

        if (projsList.length > 0) {
            allLoadedProjects = projsList;
            window.allLoadedProjects = projsList;
            renderPublicProjectsGrid(projsList);
            if (window.deviozSpiral && typeof window.deviozSpiral.updateProjectData === 'function') {
                window.deviozSpiral.updateProjectData(projsList);
            }
        } else {
            // Si la base de datos no está disponible o no tiene registros, renderizar catálogo base
            renderPublicProjectsGrid(DEFAULT_PROJECTS);
            if (window.deviozSpiral && typeof window.deviozSpiral.updateProjectData === 'function') {
                window.deviozSpiral.updateProjectData(DEFAULT_PROJECTS);
            }
        }
    } catch (err) {
        console.warn('Cargando proyectos por defecto en flujo continuo:', err);
        renderPublicProjectsGrid(DEFAULT_PROJECTS);
        if (window.deviozSpiral && typeof window.deviozSpiral.updateProjectData === 'function') {
            window.deviozSpiral.updateProjectData(DEFAULT_PROJECTS);
        }
    }
}

// -----------------------------------------
// ANIMACIONES DE SCROLL Y EFECTOS GLOW / PARALLAX
// -----------------------------------------
let scrollRevealObserver = null;

function setupScrollAnimations() {
    // 1. IntersectionObserver Reversible para Revelado Universal de Bloques y Encabezados (.scroll-reveal)
    const reveals = document.querySelectorAll('.scroll-reveal');
    if (reveals.length) {
        if ('IntersectionObserver' in window) {
            if (scrollRevealObserver) {
                scrollRevealObserver.disconnect();
            }
            scrollRevealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        // Si el elemento sale por la parte inferior de la ventana (el usuario subió)
                        if (entry.boundingClientRect.top > 0) {
                            entry.target.classList.remove('is-visible');
                        }
                    }
                });
            }, {
                root: null,
                rootMargin: '0px 0px -40px 0px',
                threshold: 0.08
            });

            reveals.forEach(el => scrollRevealObserver.observe(el));
        } else {
            reveals.forEach(el => el.classList.add('is-visible'));
        }
    }

    // 2. IntersectionObserver Reversible para Fade-Up, Scale-In y Revelado Progresivo de Tarjetas
    const items = document.querySelectorAll('.project-item');
    if (items.length) {
        if (scrollObserver) {
            scrollObserver.disconnect();
        }

        if ('IntersectionObserver' in window) {
            scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const el = entry.target;
                    if (entry.isIntersecting) {
                        const idx = parseInt(el.getAttribute('data-index') || '0', 10);
                        
                        // Retraso escalonado fluido (stagger) por columnas (110ms)
                        const staggerDelay = (idx % 3) * 110;
                        
                        clearTimeout(el._revealTimer);
                        el._revealTimer = setTimeout(() => {
                            el.classList.add('revealed');
                        }, staggerDelay);
                    } else {
                        // Si el elemento sale por la parte inferior de la pantalla (el usuario subió)
                        if (entry.boundingClientRect.top > 0) {
                            clearTimeout(el._revealTimer);
                            el.classList.remove('revealed');
                        }
                    }
                });
            }, {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.08
            });

            items.forEach(item => {
                scrollObserver.observe(item);
            });
        } else {
            items.forEach(item => item.classList.add('revealed'));
        }
    }

    // 3. Efecto de Resplandor Dinámico y Parallax 3D al interactuar con el mouse
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const percentX = Math.round((x / rect.width) * 100);
            const percentY = Math.round((y / rect.height) * 100);

            card.style.setProperty('--mouse-x', `${percentX}%`);
            card.style.setProperty('--mouse-y', `${percentY}%`);

            // Sutil inclinación 3D (tilt parallax)
            const tiltX = ((y / rect.height) - 0.5) * -7;
            const tiltY = ((x / rect.width) - 0.5) * 7;
            card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-6px) scale(1.015)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
            card.style.transform = '';
        });
    });
}

// -----------------------------------------
// CONTROL DE NAVEGACIÓN Y EVENTOS GENERALES
// -----------------------------------------
function initNavbarScrollEffect() {
    const navbar = document.querySelector('.custom-navbar');
    const headerWrapper = document.querySelector('.header-nav-container');
    const spiralSection = document.getElementById('spiral-showcase');
    const progressBar = document.getElementById('scrollProgressBar');

    const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Barra de progreso de lectura / scroll interactiva en tiempo real
        if (progressBar && scrollHeight > 0) {
            const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
            progressBar.style.width = `${pct}%`;
        }

        // Si el usuario regresa al tope de la página, resetear elementos inferiores para que vuelvan a animarse al bajar
        if (scrollTop < 80) {
            document.querySelectorAll('.scroll-reveal').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top > window.innerHeight * 0.4) {
                    el.classList.remove('is-visible');
                }
            });
            document.querySelectorAll('.project-item').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top > window.innerHeight * 0.4) {
                    clearTimeout(el._revealTimer);
                    el.classList.remove('revealed');
                }
            });
        }

        // Compactación y transición de la barra de navegación al bajar
        if (navbar) {
            let triggerOffset = 100;
            if (spiralSection) {
                triggerOffset = Math.max(60, spiralSection.offsetTop - 300);
            }

            const isScrolled = scrollTop >= triggerOffset;

            if (isScrolled) {
                navbar.classList.add('navbar-scrolled');
                if (headerWrapper) headerWrapper.classList.add('header-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
                if (headerWrapper) headerWrapper.classList.remove('header-scrolled');
            }
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Verificación inicial al cargar la página
    handleScroll();
}

function initNavigationEvents() {
    const brandLink = document.querySelector('.navbar-brand, .navbar-brand-standalone');
    const proyectosSec = document.getElementById('galeria-proyectos') || document.getElementById('proyectos');

    // Inicializar efecto de compactación al hacer scroll
    initNavbarScrollEffect();

    // Desplazamiento suave al hacer clic en "Inicio"
    document.querySelectorAll('.nav-link-glass[href="#"], .nav-link-glass[href="#inicio"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.resetParticleText) {
                window.resetParticleText();
            }
            // Resetear estados para que vuelvan a animarse fluidamente al volver a bajar
            setTimeout(() => {
                document.querySelectorAll('.scroll-reveal').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top > window.innerHeight * 0.2) el.classList.remove('is-visible');
                });
                document.querySelectorAll('.project-item').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top > window.innerHeight * 0.2) {
                        clearTimeout(el._revealTimer);
                        el.classList.remove('revealed');
                    }
                });
            }, 300);
        });
    });

    // Desplazamiento suave para enlaces con ancla a #destacados o #spiral-showcase
    document.querySelectorAll('a[href="#destacados"], a[href="#spiral-showcase"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('spiral-showcase') || document.getElementById('destacados');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Desplazamiento suave para enlaces con ancla a #proyectos o #galeria-proyectos
    document.querySelectorAll('a[href="#proyectos"], a[href="#galeria-proyectos"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('galeria-proyectos') || proyectosSec;
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Clic en el logotipo: volver suavemente al Hero superior
    if (brandLink) {
        brandLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.resetParticleText) {
                window.resetParticleText();
            }
            setTimeout(() => {
                document.querySelectorAll('.scroll-reveal').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top > window.innerHeight * 0.2) el.classList.remove('is-visible');
                });
                document.querySelectorAll('.project-item').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top > window.innerHeight * 0.2) {
                        clearTimeout(el._revealTimer);
                        el.classList.remove('revealed');
                    }
                });
            }, 300);
        });
    }

    // Delegación de clic en botones "Ver Proyecto" o en las tarjetas
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-card-action');
        if (!btn) return;
        e.preventDefault();

        const card = btn.closest('.project-card') || btn.closest('.project-item');
        if (card) {
            const title = card.querySelector('.project-card-title')?.textContent?.trim() || '';
            const projectId = btn.getAttribute('data-id');
            const matched = allLoadedProjects.find(p => String(p.id) === String(projectId) || p.titulo === title);
            const category = (matched && (matched.categoria_nombre || matched.categoria))
                ? (matched.categoria_nombre || matched.categoria)
                : (card.closest('.project-item')?.getAttribute('data-category') || 'Proyecto');
            const img = card.querySelector('.card-img-wrapper img')?.getAttribute('src') || '';
            const desc = card.querySelector('.project-card-desc')?.textContent?.trim() || '';
            const techEls = card.querySelectorAll('.tech-badges-list .tech-badge');
            const tech = Array.from(techEls).map(el => el.textContent.trim());

            const demo = (matched && matched.enlace_demo && !matched.enlace_demo.includes('devioz.com'))
                ? matched.enlace_demo
                : null;

            openProjectModal({
                title,
                category,
                img,
                desc,
                tech,
                demo
            });
        }
    });

    // Atajo de teclado discreto (Ctrl + Shift + A) para acceder al Login de Administrador
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            window.location.href = 'login.html';
        }
    });
}

// Sincronización de eventos para desenfoque cinemático del fondo al ver proyectos
function initModalBlurEvents() {
    const modalEl = document.getElementById('projectDetailModal');
    if (!modalEl) return;

    modalEl.addEventListener('show.bs.modal', () => {
        document.body.classList.add('project-modal-active');
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
        document.body.classList.remove('project-modal-active');
    });
}

// -----------------------------------------
// BOOTSTRAP INICIAL
// -----------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Asegurar que el scroll del documento esté habilitado sin bloqueos
    document.body.classList.remove('no-scroll');

    initNavigationEvents();
    initModalBlurEvents();
    setupScrollAnimations();
    fetchPublicProjects();
});

