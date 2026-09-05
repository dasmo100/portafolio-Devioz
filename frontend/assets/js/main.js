// =========================================
// Portafolio Devioz — main.js
// GooeyNav + AccordionGallery (React Bits → Vanilla JS)
// =========================================

// -----------------------------------------
// DATOS DE PROYECTOS POR CATEGORÍA
// -----------------------------------------
const PROJECT_DATA = {
    'diseno-grafico': [
        {
            title: 'Identidad Visual & Branding',
            category: '🎨 Diseño Gráfico',
            img: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=1200&q=80',
            tech: ['Figma', 'Illustrator', 'Photoshop', 'Brand Guidelines'],
        },
        {
            title: 'Sistema de Iconografía UI',
            category: '🎨 Diseño Gráfico',
            img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
            tech: ['Figma', 'SVG', 'Design Tokens'],
        },
        {
            title: 'Packaging & Print Design',
            category: '🎨 Diseño Gráfico',
            img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80',
            tech: ['Illustrator', 'InDesign', 'CMYK'],
        },
        {
            title: 'Motion Graphics & Reel',
            category: '🎨 Diseño Gráfico',
            img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
            tech: ['After Effects', 'Premiere', 'Lottie'],
        },
        {
            title: 'Editorial & Infografías',
            category: '🎨 Diseño Gráfico',
            img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
            tech: ['InDesign', 'Illustrator', 'Data Viz'],
        },
    ],
    'spots-publicitarios': [
        {
            title: 'Spot Cinematográfico 4K',
            category: '🎬 Spots Publicitarios',
            img: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
            tech: ['After Effects', 'Premiere Pro', 'Blender 3D', 'VFX'],
        },
        {
            title: 'Campaña Social Media 360°',
            category: '🎬 Spots Publicitarios',
            img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
            tech: ['Premiere', 'DaVinci Resolve', 'CapCut Pro'],
        },
        {
            title: 'Animación de Producto 3D',
            category: '🎬 Spots Publicitarios',
            img: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1200&q=80',
            tech: ['Blender 3D', 'Cinema 4D', 'After Effects'],
        },
        {
            title: 'Documental Corporativo',
            category: '🎬 Spots Publicitarios',
            img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=80',
            tech: ['Sony FX3', 'Premiere', 'Color Grade'],
        },
        {
            title: 'Reels & TikTok Ads',
            category: '🎬 Spots Publicitarios',
            img: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80',
            tech: ['CapCut', 'Canva Pro', 'Meta Ads'],
        },
    ],
    'business-intelligence': [
        {
            title: 'Dashboard Ejecutivo BI & KPIs',
            category: '📊 Business Intelligence',
            img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
            tech: ['Power BI', 'PostgreSQL', 'Python', 'ETL Pipeline'],
        },
        {
            title: 'Data Warehouse & Modelado',
            category: '📊 Business Intelligence',
            img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80',
            tech: ['Snowflake', 'dbt', 'Airflow', 'SQL'],
        },
        {
            title: 'Análisis Predictivo de Ventas',
            category: '📊 Business Intelligence',
            img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80',
            tech: ['Python', 'Scikit-learn', 'Tableau'],
        },
        {
            title: 'Reportes Automatizados',
            category: '📊 Business Intelligence',
            img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            tech: ['Power Automate', 'Excel VBA', 'SharePoint'],
        },
        {
            title: 'Segmentación & Clustering',
            category: '📊 Business Intelligence',
            img: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?auto=format&fit=crop&w=1200&q=80',
            tech: ['Python', 'K-Means', 'Power BI', 'Pandas'],
        },
    ],
    'desarrollo-web': [
        {
            title: 'Plataforma E-Commerce SaaS',
            category: '🌐 Desarrollo Web',
            img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            tech: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap 5'],
        },
        {
            title: 'Portal Inmobiliario Smart & CRM',
            category: '🌐 Desarrollo Web',
            img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
            tech: ['JavaScript ES6', 'PHP', 'Leaflet Maps', 'MySQL'],
        },
        {
            title: 'API REST Microservicios',
            category: '🌐 Desarrollo Web',
            img: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80',
            tech: ['Node.js', 'Express', 'MongoDB', 'Docker'],
        },
        {
            title: 'Dashboard Admin Next.js',
            category: '🌐 Desarrollo Web',
            img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
            tech: ['Next.js', 'TypeScript', 'Tailwind', 'Prisma'],
        },
        {
            title: 'Landing Page de Alto Impacto',
            category: '🌐 Desarrollo Web',
            img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80',
            tech: ['HTML5', 'CSS3', 'GSAP', 'Vanilla JS'],
        },
    ],
    'inteligencia-artificial': [
        {
            title: 'Neural Assistant & RAG Copilot',
            category: '🤖 Inteligencia Artificial',
            img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
            tech: ['Python', 'FastAPI', 'Gemini API', 'Vector DB'],
        },
        {
            title: 'Clasificador de Imágenes CNN',
            category: '🤖 Inteligencia Artificial',
            img: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=1200&q=80',
            tech: ['TensorFlow', 'Keras', 'Python', 'OpenCV'],
        },
        {
            title: 'Generador de Contenido IA',
            category: '🤖 Inteligencia Artificial',
            img: 'https://images.unsplash.com/photo-1686191129009-79e6fef1c047?auto=format&fit=crop&w=1200&q=80',
            tech: ['Gemini API', 'LangChain', 'FastAPI', 'React'],
        },
        {
            title: 'Detección de Anomalías',
            category: '🤖 Inteligencia Artificial',
            img: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=1200&q=80',
            tech: ['PyTorch', 'Scikit-learn', 'Pandas', 'Grafana'],
        },
        {
            title: 'Chatbot Multicanal NLP',
            category: '🤖 Inteligencia Artificial',
            img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1200&q=80',
            tech: ['Dialogflow', 'Node.js', 'WhatsApp API', 'GCP'],
        },
    ],
};

// -----------------------------------------
// ACORDEÓN GALLERY
// -----------------------------------------
function buildAccordionGallery(category) {
    const gallery = document.getElementById('accordionGallery');
    if (!gallery) return;

    const projects = PROJECT_DATA[category] || [];
    gallery.innerHTML = '';

    projects.forEach((project, idx) => {
        const item = document.createElement('div');
        item.className = 'accordion-item' + (idx === 0 ? ' active' : '');

        const techHTML = project.tech
            .map(t => `<span class="accordion-tech-badge">${t}</span>`)
            .join('');

        item.innerHTML =
            '<span class="accordion-index">0' + (idx + 1) + '</span>' +
            '<img src="' + project.img + '" alt="' + project.title + '" loading="lazy">' +
            '<div class="accordion-label">' +
                '<span class="accordion-category-tag">' + project.category + '</span>' +
                '<h3 class="accordion-title">' + project.title + '</h3>' +
                '<div class="accordion-tech-row">' + techHTML + '</div>' +
            '</div>';

        // Hover expande el ítem activo
        item.addEventListener('mouseenter', () => {
            gallery.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
        });

        gallery.appendChild(item);
    });

    // Al salir del gallery completo, restaurar el primero como activo
    gallery.addEventListener('mouseleave', () => {
        const items = gallery.querySelectorAll('.accordion-item');
        items.forEach((el, i) => el.classList.toggle('active', i === 0));
    });
}

// -----------------------------------------
// FILTRADO UNIFICADO (Grid ↔ Acordeón) Y VISIBILIDAD DE BARRA
// -----------------------------------------
function initFilter() {
    const navButtons    = document.querySelectorAll('.nav-category-btn');
    const projectsGrid  = document.getElementById('projects-grid');
    const accordionGall = document.getElementById('accordionGallery');
    const navWrapper    = document.getElementById('nav-categories-wrapper');
    const heroContent   = document.querySelector('.hero-content');
    const btnExplorar   = document.getElementById('btn-explorar');
    const brandLink     = document.querySelector('.navbar-brand');
    const proyectosSec  = document.getElementById('proyectos');

    if (!navButtons.length || !projectsGrid || !accordionGall || !navWrapper) return;

    let hideTimeout = null;
    let isManualNavigating = false;

    // --------------------------------------------------
    // Muestra suavemente la barra de categorías
    // --------------------------------------------------
    function showCategoriesBar() {
        clearTimeout(hideTimeout);

        if (navWrapper.classList.contains('nav-categories-visible') && !navWrapper.classList.contains('d-none')) {
            const activeBtn = navWrapper.querySelector('.nav-category-btn.active') || navButtons[0];
            if (activeBtn && window.updateGooeyNav) {
                window.updateGooeyNav(activeBtn, false);
            }
            return;
        }

        navWrapper.classList.remove('d-none');
        requestAnimationFrame(() => {
            navWrapper.classList.add('nav-categories-visible');
            setTimeout(() => {
                const activeBtn = navWrapper.querySelector('.nav-category-btn.active') || navButtons[0];
                if (activeBtn && window.updateGooeyNav) {
                    window.updateGooeyNav(activeBtn, false);
                }
            }, 60);
        });
    }

    // --------------------------------------------------
    // Oculta suavemente la barra de categorías
    // --------------------------------------------------
    function hideCategoriesBar() {
        if (!navWrapper.classList.contains('nav-categories-visible') && navWrapper.classList.contains('d-none')) {
            return;
        }
        navWrapper.classList.remove('nav-categories-visible');
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (!navWrapper.classList.contains('nav-categories-visible')) {
                navWrapper.classList.add('d-none');
            }
        }, 400);
    }

    // --------------------------------------------------
    // Evalúa si el usuario está en la sección de proyectos
    // --------------------------------------------------
    function checkCategoryBarVisibility() {
        if (isManualNavigating || !proyectosSec) return;

        // Si el Hero ya fue ocultado, la sección de proyectos es la vista activa permanente
        if (heroContent && (heroContent.classList.contains('d-none') || heroContent.style.display === 'none')) {
            showCategoriesBar();
            return;
        }

        // Si el Hero está visible y estamos cerca de la parte superior, ocultar barra
        if (window.scrollY < 120) {
            hideCategoriesBar();
            return;
        }

        const rect = proyectosSec.getBoundingClientRect();
        // La sección de proyectos está visible si su parte superior ya alcanzó el área de vista
        // y su parte inferior no ha quedado atrás por completo
        const inProjects = (rect.top <= 160 && rect.bottom >= 80);

        if (inProjects) {
            showCategoriesBar();
        } else if (rect.top > 160) {
            hideCategoriesBar();
        }
    }

    // --------------------------------------------------
    // Aplica el filtro de categoría (Grilla vs Acordeón)
    // --------------------------------------------------
    function applyFilter(category) {
        const isAll = (category === 'all' || category === 'todos');

        // Sincronizar botón activo + GooeyNav pill
        navButtons.forEach(btn => {
            const href     = btn.getAttribute('href').replace('#', '');
            const isActive = isAll ? (href === 'todos' || href === 'all') : (href === category);
            btn.classList.toggle('active', isActive);
            if (isActive && window.updateGooeyNav) {
                window.updateGooeyNav(btn, true);
            }
        });

        if (isAll) {
            // "Todos": mostrar grilla completa de proyectos y ocultar acordeón
            projectsGrid.classList.remove('hidden-view');
            projectsGrid.style.display = '';
            accordionGall.style.display = 'none';
            document.querySelectorAll('.project-item').forEach(el => {
                el.style.display = '';
            });
        } else {
            // Categoría específica: ocultar grilla, mostrar acordeón interactivo
            projectsGrid.classList.add('hidden-view');
            projectsGrid.style.display = 'none';
            accordionGall.style.display = 'flex';
            buildAccordionGallery(category);
        }
    }

    // --------------------------------------------------
    // Botón "Explorar Proyectos" — punto de entrada principal
    // --------------------------------------------------
    if (btnExplorar) {
        btnExplorar.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Quitar la clase .no-scroll del <body> para habilitar el desplazamiento
            document.body.classList.remove('no-scroll');

            // 2. Ocultar la sección Hero completamente del flujo del documento
            if (heroContent) {
                heroContent.classList.add('d-none');
                heroContent.style.display = 'none';
            }

            // 3. Ajustar la vista inmediatamente a la parte superior de la página
            window.scrollTo(0, 0);

            // 4. Mostrar la barra superior de categorías (activando opción "Todos" por defecto)
            applyFilter('all');
            showCategoriesBar();
        });
    }

    // --------------------------------------------------
    // Click en botones de categoría del navbar
    // --------------------------------------------------
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            let category = btn.getAttribute('href').replace('#', '');
            if (category === 'todos') category = 'all';

            // Filtrar proyectos (grilla para "Todos" o galería acordeón para individual)
            applyFilter(category);

            // Mantener la vista enfocada exclusivamente en la sección de proyectos
            if (proyectosSec) {
                proyectosSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --------------------------------------------------
    // Logo "Devioz" — Volver al Dashboard (Hero)
    // --------------------------------------------------
    if (brandLink) {
        brandLink.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Volver a mostrar la sección principal (Hero)
            if (heroContent) {
                heroContent.classList.remove('d-none');
                heroContent.style.display = '';
            }

            // 2. Ocultar la barra superior de categorías
            hideCategoriesBar();

            // 3. Restablecer la página al tope superior
            window.scrollTo(0, 0);

            // 4. Volver a agregar la clase .no-scroll al <body>
            document.body.classList.add('no-scroll');

            // 5. Reanimar las partículas al volver al Hero
            if (window.resetParticleText) {
                window.resetParticleText();
            }
        });
    }

    // --------------------------------------------------
    // Control de visibilidad según la posición del scroll
    // --------------------------------------------------
    window.addEventListener('scroll', checkCategoryBarVisibility, { passive: true });
    window.addEventListener('resize', checkCategoryBarVisibility, { passive: true });

    // Observador para transiciones precisas al entrar/salir de #proyectos
    if (proyectosSec && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(() => {
                checkCategoryBarVisibility();
            });
        }, {
            rootMargin: '-90px 0px -50px 0px',
            threshold: [0, 0.1, 0.5]
        });
        observer.observe(proyectosSec);
    }

    // Verificación de estado inicial
    document.body.classList.add('no-scroll');
    checkCategoryBarVisibility();
}

// -----------------------------------------
// GOOEY NAV
// -----------------------------------------
function initGooeyNav() {
    const wrapper    = document.querySelector('.gooey-nav-wrapper');
    const pill       = document.getElementById('gooey-pill');
    const bubblesEl  = document.getElementById('gooey-bubbles');
    const navList    = document.getElementById('nav-categories-list');
    const navButtons = document.querySelectorAll('.nav-category-btn');

    if (!wrapper || !pill || !navButtons.length) return;

    let currentActiveBtn = document.querySelector('.nav-category-btn.active') || navButtons[0];
    let prevPos = null;

    // Obtiene la posición y tamaño del botón respecto al contenedor directo sin usar getBoundingClientRect
    function getButtonPosition(targetBtn) {
        let x = 0;
        let y = 0;
        let el = targetBtn;

        while (el && el !== wrapper && wrapper.contains(el)) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }

        if (navList && navList.scrollLeft) {
            x -= navList.scrollLeft;
        }

        return {
            x: x,
            y: y,
            width: targetBtn.offsetWidth,
            height: targetBtn.offsetHeight
        };
    }

    function movePill(targetBtn, spawnBubbles) {
        if (!targetBtn) return;
        const width  = targetBtn.offsetWidth;
        const height = targetBtn.offsetHeight;
        if (width === 0 && height === 0) return;

        const pos = getButtonPosition(targetBtn);
        const x = pos.x;
        const y = pos.y;

        pill.style.width     = width  + 'px';
        pill.style.height    = height + 'px';
        pill.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        pill.style.opacity   = '1';

        if (spawnBubbles && prevPos && bubblesEl) {
            const fromX = prevPos.x + prevPos.width  / 2;
            const fromY = prevPos.y + prevPos.height / 2;
            const toX   = x + width  / 2;
            const toY   = y + height / 2;
            for (var i = 0; i < 15; i++) createBubble(fromX, fromY, toX, toY, i, 15);
        }
        prevPos = { x: x, y: y, width: width, height: height };
    }

    function createBubble(startX, startY, endX, endY, index, total) {
        var bubble = document.createElement('div');
        bubble.className = 'gooey-bubble';
        var size  = Math.random() * 12 + 10;
        var initX = startX + (Math.random() - 0.5) * 25;
        var initY = startY + (Math.random() - 0.5) * 14;
        bubble.style.cssText = 'width:' + size + 'px;height:' + size + 'px;transform:translate3d(' + (initX - size / 2) + 'px,' + (initY - size / 2) + 'px,0) scale(1);opacity:1;';
        bubblesEl.appendChild(bubble);
        var progress = (index + 1) / total;
        var tX = initX + (endX - initX) * progress + (Math.random() - 0.5) * 20;
        var tY = initY + (endY - initY) * progress + (Math.random() - 0.5) * 14;
        requestAnimationFrame(function() {
            bubble.style.transform = 'translate3d(' + (tX - size / 2) + 'px,' + (tY - size / 2) + 'px,0) scale(0.2)';
            bubble.style.opacity   = '0';
        });
        setTimeout(function() { bubble.remove(); }, 550);
    }

    requestAnimationFrame(function() {
        setTimeout(function() { movePill(currentActiveBtn, false); }, 80);
    });

    navButtons.forEach(function(btn) {
        btn.addEventListener('mouseenter', function() { movePill(btn, true); });
        btn.addEventListener('click', function() {
            navButtons.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentActiveBtn = btn;
            movePill(btn, true);
        });
    });

    wrapper.addEventListener('mouseleave', function() {
        if (currentActiveBtn) movePill(currentActiveBtn, true);
    });

    window.addEventListener('resize', function() {
        if (currentActiveBtn) movePill(currentActiveBtn, false);
    });

    if (navList) {
        navList.addEventListener('scroll', function() {
            if (currentActiveBtn) movePill(currentActiveBtn, false);
        });
    }

    window.updateGooeyNav = function(btn, spawnBubbles) {
        if (btn) {
            currentActiveBtn = btn;
            movePill(btn, spawnBubbles !== undefined ? spawnBubbles : true);
        }
    };
}

// -----------------------------------------
// BOOTSTRAP
// -----------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    initGooeyNav();
    initFilter();
});

