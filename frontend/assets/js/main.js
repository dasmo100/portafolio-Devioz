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
// MODAL DE DETALLE DE PROYECTO: VIDEO & FOTOS (ALTA GAMA)
// -----------------------------------------
let modalSlideshowInterval = null;
let modalCurrentSlideIndex = 0;
let modalCurrentImages = [];
let modalHasVideo = false;
let modalVideoUrl = null;
let modalActiveMediaMode = 'video'; // 'video' | 'slideshow'
let modalSlideshowPaused = false;
let modalKeydownHandler = null;

const MODAL_ICONS = {
    video: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    photo: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    soundMuted: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`,
    soundActive: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
    play: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
};

function openProjectModal(data) {
    const modalEl = document.getElementById('projectDetailModal');
    if (!modalEl || typeof bootstrap === 'undefined') return;

    const titleEl = document.getElementById('projectDetailTitle');
    const badgeEl = document.getElementById('modalProjectCategoryBadge');
    const mediaWrapper = document.getElementById('modalProjectMediaWrapper');
    const videoContainer = document.getElementById('modalVideoContainer');
    const videoEl = document.getElementById('modalProjectVideo');
    const videoPlayOverlay = document.getElementById('videoPlayOverlay');
    const videoPlayCircle = document.getElementById('videoPlayCircle');
    const imgEl = document.getElementById('modalProjectImg');
    const slideshowEl = document.getElementById('modalProjectSlideshow');
    const descEl = document.getElementById('modalProjectDesc');
    const techListEl = document.getElementById('modalProjectTechList');
    const demoContainerEl = document.getElementById('modalProjectDemoContainer');

    const statusBadge = document.getElementById('modalMediaStatusBadge');
    const statusIcon = document.getElementById('modalMediaStatusIcon');
    const statusText = document.getElementById('modalMediaStatusText');
    const soundBtn = document.getElementById('btnToggleVideoSound');
    const iconSound = document.getElementById('iconVideoSound');
    const textVideoSound = document.getElementById('textVideoSound');

    const segmentedSwitcher = document.getElementById('modalMediaSegmentedSwitcher');
    const btnSwitchToVideo = document.getElementById('btnSwitchToVideo');
    const btnSwitchToPhotos = document.getElementById('btnSwitchToPhotos');
    const textPhotosTab = document.getElementById('textPhotosTab');

    const prevBtn = document.getElementById('btnPrevSlide');
    const nextBtn = document.getElementById('btnNextSlide');
    const bottomBar = document.getElementById('modalMediaBottomBar');
    const indicatorsContainer = document.getElementById('modalMediaIndicators');
    const progressBar = document.getElementById('modalSlideshowProgressBar');

    // Detener intervalos previos
    stopAutoSlideshow();

    if (titleEl) titleEl.textContent = data.title || 'Detalle del Proyecto';
    if (badgeEl) badgeEl.textContent = data.category || 'Proyecto';
    if (descEl) descEl.textContent = data.desc || 'Proyecto en portafolio Devioz.';

    // Normalizar lista de imágenes (hasta 4 máximo)
    let imgs = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
        imgs = data.images.slice(0, 4);
    } else if (data.img) {
        imgs = [data.img];
    } else {
        imgs = ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'];
    }
    modalCurrentImages = imgs.map(formatProjectImageUrl);
    modalCurrentSlideIndex = 0;
    modalSlideshowPaused = false;

    // Normalizar video corto
    modalVideoUrl = null;
    const rawVid = data.video || data.video_url || null;
    if (rawVid && typeof rawVid === 'string' && rawVid.trim() !== '') {
        const trimmedVid = rawVid.trim();
        if (trimmedVid.startsWith('http://') || trimmedVid.startsWith('https://') || trimmedVid.startsWith('data:')) {
            modalVideoUrl = trimmedVid;
        } else {
            const cleanVid = trimmedVid.replace(/^.*[\\\/]/, '');
            modalVideoUrl = `assets/img/uploads/videos/${cleanVid}`;
        }
    }
    modalHasVideo = Boolean(modalVideoUrl);

    // Configurar Selector Segmentado superior
    if (segmentedSwitcher) {
        if (modalHasVideo && modalCurrentImages.length > 0) {
            segmentedSwitcher.classList.remove('d-none');
            if (textPhotosTab) {
                textPhotosTab.textContent = `Fotos (${modalCurrentImages.length})`;
            }
        } else {
            segmentedSwitcher.classList.add('d-none');
        }
    }

    function stopAutoSlideshow() {
        if (modalSlideshowInterval) {
            clearInterval(modalSlideshowInterval);
            modalSlideshowInterval = null;
        }
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
        }
    }

    function startAutoSlideshow() {
        stopAutoSlideshow();
        if (modalCurrentImages.length <= 1 || modalActiveMediaMode !== 'slideshow') return;

        const duration = 3500;
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            void progressBar.offsetWidth; // Forzar reflow
            progressBar.style.transition = `width ${duration}ms linear`;
            progressBar.style.width = '100%';
        }

        modalSlideshowInterval = setInterval(() => {
            if (!modalSlideshowPaused && modalActiveMediaMode === 'slideshow') {
                renderSlide(modalCurrentSlideIndex + 1);
            }
        }, duration);
    }

    function updateIndicators() {
        if (!indicatorsContainer) return;
        indicatorsContainer.innerHTML = '';

        if (modalActiveMediaMode === 'slideshow' && modalCurrentImages.length > 1) {
            modalCurrentImages.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = `media-dot-btn ${modalCurrentSlideIndex === idx ? 'active' : ''}`;
                dot.title = `Ver foto ${idx + 1}`;
                dot.onclick = (e) => {
                    e.stopPropagation();
                    renderSlide(idx);
                    startAutoSlideshow();
                };
                indicatorsContainer.appendChild(dot);
            });
            if (bottomBar) bottomBar.classList.remove('d-none');
        } else {
            if (bottomBar) bottomBar.classList.add('d-none');
        }
    }

    function renderSlide(index) {
        modalCurrentSlideIndex = (index + modalCurrentImages.length) % modalCurrentImages.length;
        if (imgEl) {
            imgEl.style.opacity = '0';
            imgEl.style.transform = 'scale(0.97)';
            setTimeout(() => {
                imgEl.src = modalCurrentImages[modalCurrentSlideIndex];
                imgEl.onload = () => {
                    imgEl.style.opacity = '1';
                    imgEl.style.transform = 'scale(1)';
                };
                if (imgEl.complete) {
                    imgEl.style.opacity = '1';
                    imgEl.style.transform = 'scale(1)';
                }
            }, 120);
        }

        if (statusIcon) statusIcon.innerHTML = MODAL_ICONS.photo;
        if (statusText) {
            const currentNum = String(modalCurrentSlideIndex + 1).padStart(2, '0');
            const totalNum = String(modalCurrentImages.length).padStart(2, '0');
            statusText.textContent = modalCurrentImages.length > 1 
                ? `${currentNum} / ${totalNum}`
                : 'Foto 01';
        }

        updateIndicators();

        if (modalActiveMediaMode === 'slideshow' && modalCurrentImages.length > 1 && !modalSlideshowPaused) {
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
                void progressBar.offsetWidth;
                progressBar.style.transition = 'width 3500ms linear';
                progressBar.style.width = '100%';
            }
        }
    }

    function switchToSlideshow() {
        modalActiveMediaMode = 'slideshow';
        stopAutoSlideshow();

        if (videoContainer) videoContainer.classList.add('d-none');
        if (videoEl) videoEl.pause();
        if (slideshowEl) slideshowEl.classList.remove('d-none');

        if (soundBtn) soundBtn.classList.add('d-none');
        if (prevBtn) prevBtn.classList.toggle('d-none', modalCurrentImages.length <= 1);
        if (nextBtn) nextBtn.classList.toggle('d-none', modalCurrentImages.length <= 1);

        if (btnSwitchToVideo) btnSwitchToVideo.classList.remove('active');
        if (btnSwitchToPhotos) btnSwitchToPhotos.classList.add('active');

        renderSlide(modalCurrentSlideIndex);
        if (modalCurrentImages.length > 1) {
            startAutoSlideshow();
        }
    }

    function updateSoundButtonUI() {
        if (!soundBtn || !iconSound || !videoEl) return;
        if (videoEl.muted) {
            iconSound.innerHTML = MODAL_ICONS.soundMuted;
            if (textVideoSound) textVideoSound.textContent = 'Silencio';
            soundBtn.title = 'Activar audio';
        } else {
            iconSound.innerHTML = MODAL_ICONS.soundActive;
            if (textVideoSound) textVideoSound.textContent = 'Sonido';
            soundBtn.title = 'Silenciar audio';
        }
    }

    function switchToVideo() {
        if (!modalHasVideo || !videoEl) {
            switchToSlideshow();
            return;
        }

        modalActiveMediaMode = 'video';
        stopAutoSlideshow();

        if (slideshowEl) slideshowEl.classList.add('d-none');
        if (videoContainer) videoContainer.classList.remove('d-none');

        if (prevBtn) prevBtn.classList.add('d-none');
        if (nextBtn) nextBtn.classList.add('d-none');
        if (bottomBar) bottomBar.classList.add('d-none');
        if (progressBar) progressBar.style.width = '0%';

        if (soundBtn) soundBtn.classList.remove('d-none');
        if (btnSwitchToVideo) btnSwitchToVideo.classList.add('active');
        if (btnSwitchToPhotos) btnSwitchToPhotos.classList.remove('active');

        if (statusIcon) statusIcon.innerHTML = MODAL_ICONS.video;
        if (statusText) statusText.textContent = 'Video Demostrativo';

        videoEl.muted = true;
        updateSoundButtonUI();
        videoEl.currentTime = 0;

        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (videoPlayOverlay) videoPlayOverlay.classList.remove('paused');
            }).catch(e => {
                console.log('Autoplay muted deferred:', e);
                if (videoPlayOverlay) videoPlayOverlay.classList.add('paused');
            });
        }
    }

    // Toggle de audio de video
    if (soundBtn && videoEl) {
        soundBtn.onclick = (e) => {
            e.stopPropagation();
            videoEl.muted = !videoEl.muted;
            updateSoundButtonUI();
        };
    }

    // Clic en contenedor de video para pausar/reproducir
    if (videoContainer && videoEl) {
        videoContainer.onclick = () => {
            if (videoEl.paused) {
                videoEl.play();
                if (videoPlayOverlay) videoPlayOverlay.classList.remove('paused');
            } else {
                videoEl.pause();
                if (videoPlayOverlay) videoPlayOverlay.classList.add('paused');
            }
        };
        videoEl.onplay = () => {
            if (videoPlayCircle) videoPlayCircle.innerHTML = MODAL_ICONS.pause;
            if (videoPlayOverlay) videoPlayOverlay.classList.remove('paused');
        };
        videoEl.onpause = () => {
            if (videoPlayCircle) videoPlayCircle.innerHTML = MODAL_ICONS.play;
            if (videoPlayOverlay) videoPlayOverlay.classList.add('paused');
        };
    }

    // Conexión del selector segmentado
    if (btnSwitchToVideo) {
        btnSwitchToVideo.onclick = (e) => {
            e.stopPropagation();
            switchToVideo();
        };
    }
    if (btnSwitchToPhotos) {
        btnSwitchToPhotos.onclick = (e) => {
            e.stopPropagation();
            switchToSlideshow();
        };
    }

    // Flechas de navegación lateral
    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            renderSlide(modalCurrentSlideIndex - 1);
            startAutoSlideshow();
        };
    }
    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            renderSlide(modalCurrentSlideIndex + 1);
            startAutoSlideshow();
        };
    }

    // Pausar rotación al pasar el mouse por encima
    if (mediaWrapper) {
        mediaWrapper.onmouseenter = () => {
            modalSlideshowPaused = true;
            if (progressBar && modalActiveMediaMode === 'slideshow') {
                const computed = window.getComputedStyle(progressBar).width;
                progressBar.style.transition = 'none';
                progressBar.style.width = computed;
            }
        };
        mediaWrapper.onmouseleave = () => {
            modalSlideshowPaused = false;
            if (modalActiveMediaMode === 'slideshow' && modalCurrentImages.length > 1) {
                startAutoSlideshow();
            }
        };
    }

    // Soporte para teclas (Flecha Izq / Der / Barra Espaciadora)
    if (modalKeydownHandler) {
        window.removeEventListener('keydown', modalKeydownHandler);
    }
    modalKeydownHandler = (e) => {
        if (!modalEl.classList.contains('show')) return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (modalActiveMediaMode === 'slideshow') {
                renderSlide(modalCurrentSlideIndex - 1);
                startAutoSlideshow();
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (modalActiveMediaMode === 'slideshow') {
                renderSlide(modalCurrentSlideIndex + 1);
                startAutoSlideshow();
            }
        } else if (e.key === ' ' && modalActiveMediaMode === 'video' && videoEl) {
            e.preventDefault();
            if (videoEl.paused) videoEl.play(); else videoEl.pause();
        }
    };
    window.addEventListener('keydown', modalKeydownHandler);

    // Inicialización según si tiene video o galería de fotos
    if (modalHasVideo && videoEl) {
        videoEl.src = modalVideoUrl;
        videoEl.onended = () => {
            // Al terminar el video corto, avanzar fluidamente a las fotos
            if (modalCurrentImages.length > 0) {
                switchToSlideshow();
            }
        };
        switchToVideo();
    } else {
        switchToSlideshow();
    }

    // Tecnologías
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

    // Botón Visitar Proyecto
    if (demoContainerEl) {
        let cleanDemo = '';
        if (data.demo && typeof data.demo === 'string' && data.demo.trim() !== '') {
            cleanDemo = data.demo.trim();
            if (!cleanDemo.startsWith('http://') && !cleanDemo.startsWith('https://')) {
                cleanDemo = 'https://' + cleanDemo;
            }
        }

        if (cleanDemo) {
            demoContainerEl.innerHTML = `
                <a href="${cleanDemo}" target="_blank" rel="noopener noreferrer" class="btn btn-main d-inline-flex align-items-center gap-2 px-3 py-2" style="font-size: 0.88rem; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 18px rgba(0, 229, 212, 0.35); text-decoration: none;">
                    <span>Visitar Web</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            `;
        } else {
            demoContainerEl.innerHTML = '';
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
        const galleryImgs = (project.imagenes && Array.isArray(project.imagenes) && project.imagenes.length > 0)
            ? project.imagenes.map(formatProjectImageUrl)
            : [formatProjectImageUrl(project.imagen_url || project.imagen)];

        openProjectModal({
            id: project.id,
            title: project.titulo,
            category: (project.categoria_icono ? project.categoria_icono + ' ' : '') + (project.categoria_nombre || 'Proyecto Destacado'),
            img: formatProjectImageUrl(project.imagen_url || project.imagen),
            images: galleryImgs,
            video: project.video_url || null,
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

        const rawLink = p.enlace_demo || p.demo_url || '';
        let promoLink = '';
        if (rawLink && typeof rawLink === 'string' && rawLink.trim() !== '') {
            let cl = rawLink.trim();
            if (!cl.startsWith('http://') && !cl.startsWith('https://')) {
                cl = 'https://' + cl;
            }
            promoLink = cl;
        }

        col.innerHTML = `
            <div class="project-card">
                <div class="project-card-glow"></div>
                <div class="card-img-wrapper position-relative">
                    <img src="${imgUrl}" alt="${p.titulo}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'">
                    ${promoLink ? `
                    <a href="${promoLink}" target="_blank" rel="noopener noreferrer" class="card-promo-badge" title="Visitar página web del proyecto">
                        <span>🌐 Sitio Web</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>` : ''}
                </div>
                <div class="project-card-body">
                    <h3 class="project-card-title">${p.titulo}</h3>
                    <p class="project-card-desc">
                        ${p.descripcion || ''}
                    </p>
                    <div class="tech-badges-list">
                        ${techs.map(t => `<span class="tech-badge">${t}</span>`).join('')}
                    </div>
                    <div class="card-action-group">
                        <button type="button" class="btn-card-action ${promoLink ? '' : 'w-100'}" data-id="${p.id || idx}">
                            <span>${promoLink ? 'Ver Detalle' : 'Ver Proyecto'}</span>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                        ${promoLink ? `
                        <a href="${promoLink}" target="_blank" rel="noopener noreferrer" class="btn-card-demo" title="Ir a la página principal donde se promociona este proyecto">
                            <span>Visitar</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>` : ''}
                    </div>
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

    // 3. Efecto de Resplandor Dinámico y Parallax 3D al interactuar con el mouse (optimizado sin reflows)
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');

        let cardRect = null;
        card.addEventListener('mouseenter', () => {
            cardRect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            if (!cardRect) cardRect = card.getBoundingClientRect();
            const w = cardRect.width || 1;
            const h = cardRect.height || 1;
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;

            const percentX = Math.round((x / w) * 100);
            const percentY = Math.round((y / h) * 100);

            card.style.setProperty('--mouse-x', `${percentX}%`);
            card.style.setProperty('--mouse-y', `${percentY}%`);

            // Sutil inclinación 3D (tilt parallax)
            const tiltX = ((y / h) - 0.5) * -5;
            const tiltY = ((x / w) - 0.5) * 5;
            card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-5px) scale(1.015)`;
        });

        card.addEventListener('mouseleave', () => {
            cardRect = null;
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
    const progressBar = document.getElementById('scrollProgressBar');

    const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Barra de progreso de lectura / scroll interactiva en tiempo real
        if (progressBar && scrollHeight > 0) {
            const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
            progressBar.style.width = `${pct}%`;
        }

        // Compactación y transición de la barra de navegación al bajar
        const isScrolled = scrollTop >= 60;
        if (headerWrapper) {
            if (isScrolled) {
                headerWrapper.classList.add('header-scrolled');
            } else {
                headerWrapper.classList.remove('header-scrolled');
            }
        }
        if (navbar) {
            if (isScrolled) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
    };

    let scrollTicking = false;
    const onScroll = () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                handleScroll();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
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

            const demo = (matched && (matched.enlace_demo || matched.demo_url))
                ? (matched.enlace_demo || matched.demo_url)
                : null;

            const galleryImgs = (matched && matched.imagenes && Array.isArray(matched.imagenes) && matched.imagenes.length > 0)
                ? matched.imagenes.map(formatProjectImageUrl)
                : (img ? [img] : []);

            openProjectModal({
                id: matched ? matched.id : projectId,
                title,
                category,
                img,
                images: galleryImgs,
                video: (matched && matched.video_url) ? matched.video_url : null,
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
        if (modalSlideshowInterval) {
            clearInterval(modalSlideshowInterval);
            modalSlideshowInterval = null;
        }
        if (modalKeydownHandler) {
            window.removeEventListener('keydown', modalKeydownHandler);
            modalKeydownHandler = null;
        }
        const progressBar = document.getElementById('modalSlideshowProgressBar');
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
        }
        const videoEl = document.getElementById('modalProjectVideo');
        if (videoEl) {
            videoEl.pause();
            videoEl.src = '';
        }
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

