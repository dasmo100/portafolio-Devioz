// =========================================
// Portafolio Devioz — admin.js
// OptionWheel 3D, ParticleText ("Devioz Admin") y Gestión CRUD
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ==========================================================
    // 1. LÓGICA DE LOGIN (login.html)
    // ==========================================================
    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const submitBtn = document.getElementById('btnLoginSubmit');

            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!username || !password) {
                if (loginAlert) {
                    loginAlert.textContent = 'Por favor, completa todos los campos.';
                    loginAlert.classList.remove('d-none');
                }
                return;
            }

            if (loginAlert) {
                loginAlert.classList.add('d-none');
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Ingresando...';
            }

            try {
                // Función auxiliar para determinar la URL del endpoint:
                // Si se ejecuta desde Live Server (puertos 5500, 5501, etc.) o file://, Live Server solo sirve
                // archivos estáticos y devuelve 405 Method Not Allowed ante peticiones POST a archivos PHP.
                // En ese caso apuntamos directamente al servidor Apache de XAMPP.
                const port = window.location.port;
                const isLiveDev = (port === '5500' || port === '5501' || port === '3000' || port === '5173' || window.location.protocol === 'file:');
                const host = window.location.hostname || 'localhost';

                let loginEndpoint = isLiveDev
                    ? `http://${host}/portafolio-Devioz/backend/api/login.php`
                    : (window.location.pathname.includes('/admin/') ? '../../backend/api/login.php' : '../backend/api/login.php');

                let response;
                try {
                    response = await fetch(loginEndpoint, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ usuario: username, clave: password })
                    });
                } catch (fetchErr) {
                    // Si falló por URL relativa en un servidor estático, reintentar con la URL directa de Apache
                    if (!isLiveDev) {
                        const fallbackUrl = `http://localhost/portafolio-Devioz/backend/api/login.php`;
                        response = await fetch(fallbackUrl, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ usuario: username, clave: password })
                        });
                    } else {
                        throw fetchErr;
                    }
                }

                // Si Live Server devolvió 405 (Método no permitido para estáticos), reenviar a Apache
                if (response && response.status === 405) {
                    const fallbackUrl = `http://localhost/portafolio-Devioz/backend/api/login.php`;
                    response = await fetch(fallbackUrl, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ usuario: username, clave: password })
                    });
                }

                const data = await response.json();

                if (response.ok && (data.success === true || data.status === 'success')) {
                    localStorage.setItem('devioz_admin_auth', 'true');
                    localStorage.setItem('devioz_admin_user', data.usuario || username);
                    localStorage.setItem('devioz_admin_role', data.rol || 'administrador');
                    window.location.replace(data.redirect || 'admin.html');
                } else {
                    if (loginAlert) {
                        loginAlert.textContent = data.message || 'Credenciales inválidas. Verifica tus datos.';
                        loginAlert.classList.remove('d-none');
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Ingresar al Panel';
                    }
                }
            } catch (err) {
                console.warn('Aviso: Fallo de conexión con backend/api/login.php:', err);

                // Fallback de desarrollo para admin / admin123
                if ((username.toLowerCase() === 'admin' || username.toLowerCase() === 'admin@devioz.com') && (password === 'admin123' || password === 'password')) {
                    localStorage.setItem('devioz_admin_auth', 'true');
                    localStorage.setItem('devioz_admin_user', 'admin');
                    localStorage.setItem('devioz_admin_role', 'administrador');
                    window.location.replace('admin.html');
                    return;
                }

                if (loginAlert) {
                    loginAlert.innerHTML = 'Error de conexión con el backend PHP.<br><small style="display:block;margin-top:4px;opacity:0.9;">Verifica que Apache esté corriendo en XAMPP o accede a través de <a href="http://localhost/portafolio-Devioz/frontend/login.html" style="color:#5eead4;text-decoration:underline;">http://localhost/portafolio-Devioz/frontend/login.html</a></small>';
                    loginAlert.classList.remove('d-none');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Ingresar al Panel';
                }
            }
        });
    }

    // ==========================================================
    // 2. COMPATIBILIDAD GLOBAL (El sistema de categorías por ruleta fue removido)
    // ==========================================================
    window.setOptionWheelTarget = function() {
        // No-op: Flujo continuo de proyectos
    };

    // ==========================================================
    // 3. PARTICLETEXT EN EL ADMIN (adminParticleText)
    // ==========================================================
    const adminCanvas = document.getElementById('adminParticleText');
    if (adminCanvas) {
        (function initAdminParticles() {
            const ctx = adminCanvas.getContext('2d');
            if (!ctx) return;

            let particles = [];
            let animId = null;
            let width = 0;
            let height = 0;
            let dpr = 1;

            const mouse = { x: -9999, y: -9999, hover: false };

            const CONFIG = {
                text: 'Devioz Admin',
                density: 2,         // Muestreo denso de 2px: letras 100% legibles y definidas
                particleSize: 1.35, // Tamaño nítido tipo constelación sin pixelado
                scatter: 40,        // Dispersión contenida para reunión limpia
                duration: 1100,     // Duración de animación de agrupamiento
                stagger: 220,       // Retardo orgánico escalonado
                idleDrift: 0.3,     // Micromovimiento sutil de flotación viva
                repelRadius: 75,    // Radio de repulsión interactiva del mouse
                pointerRepel: 24,   // Fuerza de repulsión elástica
                baseColor: '#ffffff',
                highlightColor: '#00e5d4',
                accentColor: '#5eead4'
            };

            function getFontSize(w) {
                // Proporción ideal para 'Devioz Admin' centrado
                return Math.round(Math.max(26, Math.min(38, w * 0.08)));
            }

            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            function createAdminParticles() {
                if (!ctx || width === 0 || height === 0) return;

                const offscreen = document.createElement('canvas');
                offscreen.width = width;
                offscreen.height = height;
                const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
                if (!offCtx) return;

                const fontSize = getFontSize(width);

                offCtx.clearRect(0, 0, width, height);
                offCtx.font = `900 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                offCtx.textAlign = 'center';
                offCtx.textBaseline = 'middle';
                offCtx.fillStyle = '#ffffff';
                offCtx.fillText(CONFIG.text, width / 2, height / 2);

                let imgData;
                try {
                    imgData = offCtx.getImageData(0, 0, width, height).data;
                } catch (e) {
                    return;
                }

                const totalWidth = offCtx.measureText(CONFIG.text).width;
                const textStartX = (width - totalWidth) / 2;
                const dWidth = offCtx.measureText('D').width;
                const deviozWidth = offCtx.measureText('Devioz').width;

                const splitD = textStartX + dWidth * 1.05;
                const splitDevioz = textStartX + deviozWidth * 1.02;

                particles = [];
                const now = performance.now();

                for (let y = 0; y < height; y += CONFIG.density) {
                    for (let x = 0; x < width; x += CONFIG.density) {
                        const alpha = imgData[(y * width + x) * 4 + 3];
                        if (alpha > 130) {
                            const angle = Math.random() * Math.PI * 2;
                            const dist = Math.pow(Math.random(), 0.75) * CONFIG.scatter;
                            const startX = x + Math.cos(angle) * dist;
                            const startY = y + Math.sin(angle) * dist;

                            let color;
                            if (x < splitD) {
                                // 'D' del logotipo: gradiente continuo verde petróleo a cian luminoso (sin puntos blancos)
                                const tx = Math.max(0, Math.min(1, (x - textStartX) / Math.max(1, splitD - textStartX)));
                                const t = Math.max(0, Math.min(1, tx * 0.9 + (Math.random() - 0.5) * 0.04));
                                // Interpolación de paradas cromáticas: #00302e -> #00766e -> #00b4a5 -> #00eedc
                                if (t < 0.33) {
                                    const lt = t / 0.33;
                                    color = `rgb(0, ${Math.round(48 + 56 * lt)}, ${Math.round(46 + 50 * lt)})`;
                                } else if (t < 0.67) {
                                    const lt = (t - 0.33) / 0.34;
                                    color = `rgb(0, ${Math.round(104 + 76 * lt)}, ${Math.round(96 + 69 * lt)})`;
                                } else {
                                    const lt = (t - 0.67) / 0.33;
                                    color = `rgb(0, ${Math.round(180 + 58 * lt)}, ${Math.round(165 + 55 * lt)})`;
                                }
                            } else if (x < splitDevioz) {
                                // 'evioz' del logotipo: blanco puro brillante
                                color = Math.random() < 0.9 ? '#ffffff' : '#f1f5f9';
                            } else {
                                // 'Admin': acento cian / esmeralda tecnológico
                                color = Math.random() < 0.65 ? CONFIG.highlightColor : CONFIG.accentColor;
                            }

                            particles.push({
                                targetX: x,
                                targetY: y,
                                x: startX,
                                y: startY,
                                originX: startX,
                                originY: startY,
                                vx: 0,
                                vy: 0,
                                size: CONFIG.particleSize,
                                color: color,
                                baseAlpha: 0.9 + Math.random() * 0.1,
                                spawnTime: now,
                                startTime: now + Math.random() * CONFIG.stagger,
                                duration: CONFIG.duration,
                                idleAngle: Math.random() * Math.PI * 2,
                                idleSpeed: (Math.random() * 0.02 + 0.015),
                                idleRadius: (Math.random() * 0.5 + 0.5) * CONFIG.idleDrift,
                                isGathered: false
                            });
                        }
                    }
                }
            }

            function resize() {
                const rect = adminCanvas.getBoundingClientRect();
                if (!rect.width || !rect.height) return;

                width = Math.round(rect.width);
                height = Math.round(rect.height);

                dpr = Math.min(window.devicePixelRatio || 1, 2);
                adminCanvas.width = Math.round(width * dpr);
                adminCanvas.height = Math.round(height * dpr);

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);

                createAdminParticles();
            }

            function animate(currentTime) {
                animId = requestAnimationFrame(animate);

                ctx.clearRect(0, 0, width, height);
                // Resplandor sutil y nítido que no difumina las letras
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(0, 229, 212, 0.45)';

                const repelRadiusSq = CONFIG.repelRadius * CONFIG.repelRadius;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    let alpha = p.baseAlpha;

                    if (!p.isGathered) {
                        if (currentTime < p.startTime) {
                            p.x = p.originX;
                            p.y = p.originY;
                            const timeSinceSpawn = Math.max(0, currentTime - p.spawnTime);
                            alpha = Math.min(timeSinceSpawn / 180, 1) * 0.85;
                        } else {
                            const elapsed = currentTime - p.startTime;
                            const progress = Math.min(elapsed / p.duration, 1);
                            const ease = easeOutCubic(progress);

                            p.x = p.originX + (p.targetX - p.originX) * ease;
                            p.y = p.originY + (p.targetY - p.originY) * ease;
                            alpha = Math.min(0.85 + progress * 0.15, 1);

                            if (progress >= 1) {
                                p.isGathered = true;
                                p.x = p.targetX;
                                p.y = p.targetY;
                                alpha = 1;
                            }
                        }
                    } else {
                        p.idleAngle += p.idleSpeed;
                        const homeX = p.targetX + Math.cos(p.idleAngle) * p.idleRadius;
                        const homeY = p.targetY + Math.sin(p.idleAngle) * p.idleRadius;

                        if (mouse.hover) {
                            const dx = p.x - mouse.x;
                            const dy = p.y - mouse.y;
                            const distSq = dx * dx + dy * dy;

                            if (distSq < repelRadiusSq && distSq > 0) {
                                const dist = Math.sqrt(distSq);
                                const force = (1 - dist / CONFIG.repelRadius) * CONFIG.pointerRepel;
                                const angle = Math.atan2(dy, dx);
                                p.vx += Math.cos(angle) * force * 0.35;
                                p.vy += Math.sin(angle) * force * 0.35;
                            }
                        }

                        const ax = (homeX - p.x) * 0.08;
                        const ay = (homeY - p.y) * 0.08;

                        p.vx += ax;
                        p.vy += ay;
                        p.vx *= 0.82;
                        p.vy *= 0.82;

                        p.x += p.vx;
                        p.y += p.vy;
                    }

                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            }

            adminCanvas.addEventListener('mousemove', function(e) {
                const rect = adminCanvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
                mouse.hover = true;
            }, { passive: true });

            adminCanvas.addEventListener('mouseleave', function() {
                mouse.hover = false;
            });

            window.addEventListener('resize', function() {
                resize();
            }, { passive: true });

            resize();
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(resize);
            }

            if (animId) cancelAnimationFrame(animId);
            animId = requestAnimationFrame(animate);
        })();
    }

    // ==========================================================
    // 4. FILTRADO Y GESTIÓN CRUD DE PROYECTOS (admin.html)
    // ==========================================================
    const projectsTableBody = document.getElementById('projectsTableBody');
    const currentCategoryTitle = document.getElementById('currentCategoryTitle');
    const currentCategoryDesc = document.getElementById('currentCategoryDesc');
    const projectCountBadge = document.getElementById('projectCountBadge');
    const btnLogout = document.getElementById('btnLogout');
    const projectForm = document.getElementById('projectForm');
    const projectModalEl = document.getElementById('projectModal');
    let projectModal = null;

    function getAdminModal() {
        if (!projectModalEl) return null;
        if (!projectModal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            projectModal = bootstrap.Modal.getInstance(projectModalEl) || new bootstrap.Modal(projectModalEl);
        }
        return projectModal;
    }

    // Toast interactivo para notificaciones de estado en el panel
    function showAdminToast(message, type = 'success') {
        let container = document.getElementById('adminToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminToastContainer';
            container.style.cssText = 'position: fixed; bottom: 25px; right: 25px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; max-width: 380px; pointer-events: none;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const isSuccess = type === 'success';
        const icon = isSuccess ? '✅' : (type === 'warning' ? '⚠️' : '❌');
        const borderColor = isSuccess ? '#10b981' : (type === 'warning' ? '#f59e0b' : '#ef4444');

        toast.style.cssText = `
            background: rgba(18, 18, 30, 0.96);
            border: 1px solid ${borderColor};
            border-radius: 12px;
            padding: 12px 18px;
            color: #fff;
            font-size: 0.88rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
            backdrop-filter: blur(14px);
            display: flex;
            align-items: center;
            gap: 12px;
            pointer-events: auto;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        toast.innerHTML = `
            <span style="font-size: 1.25rem; line-height: 1;">${icon}</span>
            <div style="flex: 1; line-height: 1.35; font-weight: 500;">${message}</div>
        `;

        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(15px) scale(0.95)';
            setTimeout(() => toast.remove(), 320);
        }, 3600);
    }

    // Cerrar sesión
    // Cerrar sesión (delega a window.logoutAdmin blindado si está disponible)
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            if (typeof window.logoutAdmin === 'function') {
                window.logoutAdmin(e);
            } else {
                e.preventDefault();
                localStorage.removeItem('devioz_admin_auth');
                localStorage.removeItem('devioz_admin_user');
                localStorage.removeItem('devioz_admin_role');
                sessionStorage.clear();
                window.location.replace('login.html');
            }
        });
    }



    // Estado de proyectos en memoria del panel admin
    let adminProjectsList = [];
    let verifiedProjectsEndpoint = null;

    const adminProjectSearch = document.getElementById('adminProjectSearch');

    function getBackendProjectsEndpoint() {
        if (verifiedProjectsEndpoint) {
            return verifiedProjectsEndpoint;
        }
        const port = window.location.port;
        const isLiveDev = (port === '5500' || port === '5501' || port === '3000' || port === '5173' || window.location.protocol === 'file:');
        const host = window.location.hostname || 'localhost';

        if (isLiveDev) {
            return `http://${host}/portafolio-Devioz/backend/api/proyectos.php`;
        }
        return window.location.pathname.includes('/admin/') 
            ? '../../backend/api/proyectos.php' 
            : '../backend/api/proyectos.php';
    }

    // Función para consultar todos los proyectos del backend (flujo continuo sin categorías)
    async function loadAdminProjects() {
        if (!projectsTableBody) return;

        const port = window.location.port;
        const isLiveDev = (port === '5500' || port === '5501' || port === '3000' || port === '5173' || window.location.protocol === 'file:');
        const host = window.location.hostname || 'localhost';

        // Lista ordenada de endpoints a intentar según el entorno de ejecución
        const endpointsToTry = [];
        if (verifiedProjectsEndpoint) {
            endpointsToTry.push(verifiedProjectsEndpoint);
        }
        if (isLiveDev) {
            endpointsToTry.push(`http://${host}/portafolio-Devioz/backend/api/proyectos.php`);
            endpointsToTry.push(`http://localhost/portafolio-Devioz/backend/api/proyectos.php`);
            endpointsToTry.push(`http://127.0.0.1/portafolio-Devioz/backend/api/proyectos.php`);
            endpointsToTry.push(`../backend/api/proyectos.php`);
        } else {
            endpointsToTry.push(window.location.pathname.includes('/admin/') ? '../../backend/api/proyectos.php' : '../backend/api/proyectos.php');
            endpointsToTry.push(`http://${host}/portafolio-Devioz/backend/api/proyectos.php`);
            endpointsToTry.push(`http://localhost/portafolio-Devioz/backend/api/proyectos.php`);
            endpointsToTry.push(`http://127.0.0.1/portafolio-Devioz/backend/api/proyectos.php`);
        }

        const uniqueEndpoints = [...new Set(endpointsToTry)];
        const adminUser = localStorage.getItem('devioz_admin_user') || 'admin';

        let data = null;
        let lastError = null;

        for (const baseEndpoint of uniqueEndpoints) {
            try {
                // Petición continua sin filtrar por categoría: con token de administrador explícito
                const sep = baseEndpoint.includes('?') ? '&' : '?';
                const apiUrl = `${baseEndpoint}${sep}admin_token=devioz_admin_${encodeURIComponent(adminUser)}`;
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 
                        'Accept': 'application/json',
                        'X-Admin-Token': `devioz_admin_${adminUser}`,
                        'Authorization': `Bearer devioz_admin_${adminUser}`
                    }
                });

                const responseText = await response.text();

                if (responseText.trim().startsWith('<?php')) {
                    console.warn(`[Devioz Admin] Endpoint ${baseEndpoint} devolvió PHP estático sin procesar. Intentando siguiente...`);
                    continue;
                }

                try {
                    data = JSON.parse(responseText);
                } catch (jsonErr) {
                    console.warn(`[Devioz Admin] Respuesta no JSON de ${baseEndpoint}:`, responseText);
                    continue;
                }

                if (!response.ok) {
                    const errMsg = (data && data.error) ? data.error : 'Error en el servidor (' + response.status + ')';
                    throw new Error(errMsg);
                }

                verifiedProjectsEndpoint = baseEndpoint;
                lastError = null;
                break;
            } catch (fetchErr) {
                lastError = fetchErr;
                console.warn(`[Devioz Admin] Falló conexión con ${baseEndpoint}:`, fetchErr.message);
            }
        }

        if (lastError || data === null) {
            console.error('Error al obtener los proyectos del servidor:', lastError);
            const errDetail = lastError ? (lastError.message || 'Sin respuesta del servidor') : 'Respuesta no válida del servidor';
            projectsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-secondary">
                        <span class="text-danger d-block mb-1 fw-semibold">⚠️ Error al obtener los proyectos del servidor.</span>
                        <small class="d-block mb-2 text-muted">Asegúrate de que Apache y MySQL estén en ejecución en XAMPP.</small>
                        <small class="text-secondary d-block mb-3" style="font-size: 0.8rem; color: #f87171 !important;">Detalle: ${errDetail}</small>
                        <a href="http://localhost/portafolio-Devioz/frontend/admin.html" class="btn btn-sm btn-outline-info">
                            Abrir mediante Apache Localhost
                        </a>
                    </td>
                </tr>
            `;
            return;
        }

        console.log('[Devioz Admin] Proyectos recibidos (flujo continuo):', data);

        let projects = [];
        if (Array.isArray(data)) {
            projects = data;
        } else if (data && Array.isArray(data.data)) {
            projects = data.data;
        } else if (data && Array.isArray(data.proyectos)) {
            projects = data.proyectos;
        }

        adminProjectsList = projects;
        filterAndRenderProjects(adminProjectSearch ? adminProjectSearch.value : '');
    }

    // Filtra proyectos en tiempo real por término de búsqueda
    function filterAndRenderProjects(query = '') {
        const q = (query || '').toLowerCase().trim();
        if (!q) {
            renderAdminTable(adminProjectsList, '');
            return;
        }

        const filtered = adminProjectsList.filter(p => {
            const title = (p.titulo || '').toLowerCase();
            const tech = (p.tecnologias || '').toLowerCase();
            const desc = (p.descripcion || '').toLowerCase();
            return title.includes(q) || tech.includes(q) || desc.includes(q);
        });

        renderAdminTable(filtered, q);
    }

    // Listener para el buscador en tiempo real
    if (adminProjectSearch) {
        adminProjectSearch.addEventListener('input', function() {
            filterAndRenderProjects(this.value);
        });
    }

    // Normalizar ruta de imagen local o externa
    function formatProjectImageUrl(img) {
        if (!img) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
            return img;
        }
        const clean = img.replace(/^.*[\\\/]/, '');
        return `assets/img/uploads/${clean}`;
    }

    // Normalizar ruta de video local o externa
    function formatProjectVideoUrl(vid) {
        if (!vid) return '';
        if (vid.startsWith('http://') || vid.startsWith('https://') || vid.startsWith('blob:') || vid.startsWith('data:')) {
            return vid;
        }
        const clean = vid.replace(/^.*[\\\/]/, '');
        return `assets/img/uploads/videos/${clean}`;
    }

    // Renderizado de la tabla de proyectos en el Panel de Administración
    function renderAdminTable(projects, searchQuery = '') {
        if (!projectsTableBody) return;

        projectsTableBody.innerHTML = '';

        if (currentCategoryTitle) {
            currentCategoryTitle.textContent = 'Gestión de Proyectos';
        }
        if (currentCategoryDesc) {
            currentCategoryDesc.textContent = searchQuery 
                ? `Resultados para "${searchQuery}" (${projects.length} encontrados).`
                : 'Administra todos los proyectos registrados en el flujo continuo del portafolio.';
        }
        if (projectCountBadge) {
            const count = projects ? projects.length : 0;
            projectCountBadge.textContent = `${count} ${count === 1 ? 'proyecto' : 'proyectos'}`;
        }

        // Manejo del estado vacío
        if (!projects || projects.length === 0) {
            projectsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-secondary">
                        <div class="mb-2" style="font-size: 1.8rem; opacity: 0.7;">📂</div>
                        <span class="text-white fw-semibold d-block mb-1">
                            ${searchQuery ? `No se encontraron proyectos para "${searchQuery}"` : 'No hay proyectos registrados en el portafolio aún.'}
                        </span>
                        <small class="text-secondary d-block mb-3" style="color: #94a3b8 !important;">
                            ${searchQuery ? 'Intenta buscar con otros términos o limpia el buscador.' : 'Sé el primero en agregar un proyecto a la galería continua.'}
                        </small>
                        <button type="button" class="btn btn-sm btn-main" id="btnEmptyCreate">
                            + Nuevo Proyecto
                        </button>
                    </td>
                </tr>
            `;
            const emptyBtn = document.getElementById('btnEmptyCreate');
            if (emptyBtn) {
                emptyBtn.addEventListener('click', () => {
                    const mainNewBtn = document.getElementById('btnNewProject');
                    if (mainNewBtn) mainNewBtn.click();
                });
            }
            return;
        }

        projects.forEach(p => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', p.id);

            // Generar badges de tecnologías
            const techBadgesHtml = (p.tecnologias || '')
                .split(',')
                .map(t => t.trim())
                .filter(Boolean)
                .slice(0, 4)
                .map(t => `<span class="badge me-1 mb-1" style="background: rgba(0, 229, 212, 0.08); color: #5eead4; border: 1px solid rgba(0, 229, 212, 0.2); font-weight: 500; font-size: 0.74rem; padding: 4px 10px; border-radius: 12px;">${t}</span>`)
                .join('') || '<span class="text-secondary small">—</span>';

            const hasZip = Boolean(p.archivo_zip || p.tiene_zip);
            const adminUserToken = encodeURIComponent(localStorage.getItem('devioz_admin_user') || 'admin');
            const downloadZipUrl = `${verifiedProjectsEndpoint || getBackendProjectsEndpoint()}?action=download_zip&id=${p.id}&admin_token=devioz_admin_${adminUserToken}`;

            const zipCellHtml = hasZip ? `
                <td class="text-center">
                    <div class="d-inline-flex flex-column align-items-center gap-1">
                        <a href="${downloadZipUrl}" target="_blank" class="btn btn-sm d-inline-flex align-items-center gap-1 px-2 py-1 text-decoration-none" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.45); border-radius: 8px; font-size: 0.76rem; font-weight: 500; transition: all 0.2s;" title="Descargar archivo ZIP de este proyecto">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Descargar ZIP</span>
                        </a>
                        <small class="d-block text-truncate" style="max-width: 160px; font-size: 0.68rem; color: #a78bfa !important; font-family: monospace;" title="${p.archivo_zip || ''}">
                            💾 ${p.archivo_zip ? p.archivo_zip : (p.zip_size ? formatBytes(p.zip_size) : 'En Base de Datos')}
                        </small>
                    </div>
                </td>
            ` : `
                <td class="text-center">
                    <span class="badge" style="background: rgba(255, 255, 255, 0.05); color: #64748b; font-size: 0.72rem; border-radius: 6px; padding: 4px 8px;">
                        Sin ZIP
                    </span>
                </td>
            `;

            row.innerHTML = `
                <td class="text-center" style="width: 80px;">
                    <img src="${formatProjectImageUrl(p.imagen_url || p.imagen)}" alt="${p.titulo}" class="admin-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80'">
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <span class="fw-semibold text-white">${p.titulo}</span>
                        ${(p.tiene_video || p.video_url) ? '<span class="badge" style="background: rgba(0, 229, 212, 0.15); color: #5eead4; border: 1px solid rgba(0, 229, 212, 0.35); font-size: 0.7rem; padding: 2px 6px; border-radius: 6px;" title="Tiene Video Corto Intro">🎥 Video</span>' : ''}
                        ${(Number(p.destacado) === 1 || p.destacado === true || p.destacado === '1') ? '<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); font-size: 0.7rem; padding: 2px 6px; border-radius: 6px;" title="Destacado en la Espiral 3D">⭐ Espiral 3D</span>' : ''}
                        ${hasZip ? '<span class="badge" style="background: rgba(139, 92, 246, 0.18); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.4); font-size: 0.7rem; padding: 2px 6px; border-radius: 6px;" title="Código ZIP registrado en base de datos">📦 ZIP</span>' : ''}
                    </div>
                    <span class="small text-secondary" style="color: #94a3b8 !important;">${p.descripcion ? (p.descripcion.length > 60 ? p.descripcion.substring(0, 60) + '...' : p.descripcion) : ''}</span>
                </td>
                <td>
                    <div class="d-flex flex-wrap">${techBadgesHtml}</div>
                </td>
                ${zipCellHtml}
                <td class="text-end">
                    <div class="d-inline-flex gap-2">
                        ${p.enlace_demo ? `
                        <a href="${p.enlace_demo}" target="_blank" rel="noopener noreferrer" class="btn-action" title="Ver Demo Online" style="color: #5eead4;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>` : ''}
                        <button type="button" class="btn-action btn-action-edit" title="Editar" data-id="${p.id}">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button type="button" class="btn-action btn-action-delete" title="Eliminar" data-id="${p.id}">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            projectsTableBody.appendChild(row);
        });
    }

    // ==========================================================
    // 5. ESTUDIO Y DASHBOARD DE CREACIÓN / EDICIÓN DE PROYECTOS
    // ==========================================================
    const viewProjectsList = document.getElementById('viewProjectsList');
    const viewProjectEditor = document.getElementById('viewProjectEditor');
    const btnNewProject = document.getElementById('btnNewProject');
    const btnBackToProjects = document.getElementById('btnBackToProjects');
    const btnResetEditor = document.getElementById('btnResetEditor');
    const btnPublishProjectTop = document.getElementById('btnPublishProjectTop');
    const btnPublishProjectTopText = document.getElementById('btnPublishProjectTopText');

    const editorProjectForm = document.getElementById('editorProjectForm');
    const editorProjectId = document.getElementById('editorProjectId');
    const editorTechHidden = document.getElementById('editorTechHidden');
    const editorViewHeading = document.getElementById('editorViewHeading');
    const editorStatusBadge = document.getElementById('editorStatusBadge');

    const editorTitle = document.getElementById('editorTitle');
    const editorTitleCount = document.getElementById('editorTitleCount');

    // Fotos del Proyecto (hasta 4 fotos)
    const editorGalleryGrid = document.getElementById('editorGalleryGrid');
    const galleryCountBadge = document.getElementById('galleryCountBadge');
    const editorDropzone = document.getElementById('editorDropzone');
    const editorFileInput = document.getElementById('editorFileInput');
    const MAX_GALLERY_IMAGES = 4;
    let editorGalleryImages = []; // Cada item: { id, type: 'file'|'url', file, url, previewUrl }

    // Video Corto
    const editorVideoDropzone = document.getElementById('editorVideoDropzone');
    const editorVideoInput = document.getElementById('editorVideoInput');
    const editorVideoPreviewBox = document.getElementById('editorVideoPreviewBox');
    const editorVideoPreviewEl = document.getElementById('editorVideoPreviewEl');
    const editorVideoInfoDisplay = document.getElementById('editorVideoInfoDisplay');
    const btnRemoveVideo = document.getElementById('btnRemoveVideo');
    const editorEliminarVideo = document.getElementById('editorEliminarVideo');
    let editorSelectedVideoFile = null;
    let editorExistingVideoUrl = '';

    // Elementos de compatibilidad retroactiva
    const dropzoneFileSelected = document.getElementById('dropzoneFileSelected');
    const selectedFileName = document.getElementById('selectedFileName');
    const btnRemoveSelectedFile = document.getElementById('btnRemoveSelectedFile');
    const editorImgUrl = document.getElementById('editorImgUrl');
    const editorDemoUrl = document.getElementById('editorDemoUrl');

    const quickTechPills = document.getElementById('quickTechPills');
    const editorActiveTagsList = document.getElementById('editorActiveTagsList');
    const editorTechInput = document.getElementById('editorTechInput');
    const editorDesc = document.getElementById('editorDesc');
    const editorDescCount = document.getElementById('editorDescCount');
    const editorDestacado = document.getElementById('editorDestacado');

    // Elementos del Simulador en Vivo
    const liveCardImg = document.getElementById('liveCardImg');
    const liveCardTitle = document.getElementById('liveCardTitle');
    const liveCardDesc = document.getElementById('liveCardDesc');
    const liveCardTechList = document.getElementById('liveCardTechList');
    const liveCardDemoBtn = document.getElementById('liveCardDemoBtn');
    const liveCardVideoBadge = document.getElementById('liveCardVideoBadge');
    const liveCardImgCount = document.getElementById('liveCardImgCount');

    // Elementos del Módulo de Código ZIP Privado (Solo Admin)
    const editorZipDropzone = document.getElementById('editorZipDropzone');
    const editorZipInput = document.getElementById('editorZipInput');
    const editorEliminarZip = document.getElementById('editorEliminarZip');
    const dropzoneZipSelected = document.getElementById('dropzoneZipSelected');
    const selectedZipFileName = document.getElementById('selectedZipFileName');
    const selectedZipFileSize = document.getElementById('selectedZipFileSize');
    const btnRemoveSelectedZip = document.getElementById('btnRemoveSelectedZip');
    const existingZipBox = document.getElementById('existingZipBox');
    const existingZipSizeBadge = document.getElementById('existingZipSizeBadge');
    const existingZipFileNameDisplay = document.getElementById('existingZipFileNameDisplay');
    const btnDownloadCurrentZip = document.getElementById('btnDownloadCurrentZip');
    const btnDeleteCurrentZip = document.getElementById('btnDeleteCurrentZip');

    let editorSelectedZipFile = null;
    let editorCurrentProjectZip = null;

    function formatBytes(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function handleSelectedZipFile(file) {
        if (!file) return;
        const name = file.name || '';
        if (!name.toLowerCase().endsWith('.zip')) {
            showAdminToast('Solo se permiten archivos comprimidos en formato .ZIP.', 'warning');
            return;
        }
        editorSelectedZipFile = file;
        if (editorEliminarZip) editorEliminarZip.value = '0';
        if (selectedZipFileName) selectedZipFileName.textContent = name;
        if (selectedZipFileSize) selectedZipFileSize.textContent = formatBytes(file.size);
        if (dropzoneZipSelected) dropzoneZipSelected.classList.remove('d-none');
    }

    function clearSelectedZipFile() {
        editorSelectedZipFile = null;
        if (editorZipInput) editorZipInput.value = '';
        if (dropzoneZipSelected) dropzoneZipSelected.classList.add('d-none');
    }

    // Estado interno del Estudio
    let editorActiveTags = [];
    let editorSelectedFile = null;
    let editorExistingImgUrl = '';
    const DEFAULT_PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';

    // Función para cambiar de vista (Lista vs Dashboard de Creación vs Perfil de Administrador)
    function switchAdminView(viewName) {
        const mainContainer = document.querySelector('.admin-main-col');
        if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'smooth' });

        const btnProfileAvatar = document.getElementById('btnViewProfile');

        if (viewName === 'profile') {
            if (btnProfileAvatar) btnProfileAvatar.classList.add('is-active');
            if (viewProjectsList) viewProjectsList.classList.add('d-none');
            if (viewProjectEditor) viewProjectEditor.classList.add('d-none');
            if (viewAdminProfile) {
                viewAdminProfile.classList.remove('d-none');
                viewAdminProfile.classList.add('admin-view-container');
            }
        } else {
            if (btnProfileAvatar) btnProfileAvatar.classList.remove('is-active');
            if (viewName === 'editor') {
                if (viewProjectsList) viewProjectsList.classList.add('d-none');
                if (viewAdminProfile) viewAdminProfile.classList.add('d-none');
                if (viewProjectEditor) {
                    viewProjectEditor.classList.remove('d-none');
                    viewProjectEditor.classList.add('admin-view-container');
                }
            } else {
                if (viewProjectEditor) viewProjectEditor.classList.add('d-none');
                if (viewAdminProfile) viewAdminProfile.classList.add('d-none');
                if (viewProjectsList) {
                    viewProjectsList.classList.remove('d-none');
                    viewProjectsList.classList.add('admin-view-container');
                }
            }
        }
    }

    // Abrir el Dashboard en modo Creación o Edición
    function openProjectEditor(mode = 'create', project = null) {
        if (editorProjectForm) editorProjectForm.reset();
        editorSelectedFile = null;
        editorExistingImgUrl = '';
        if (dropzoneFileSelected) dropzoneFileSelected.classList.add('d-none');
        if (editorFileInput) editorFileInput.value = '';

        clearSelectedZipFile();
        if (editorEliminarZip) editorEliminarZip.value = '0';
        clearVideoFromEditor(false);
        if (editorEliminarVideo) editorEliminarVideo.value = '0';

        if (mode === 'edit' && project) {
            // Modo Edición
            if (editorProjectId) editorProjectId.value = project.id;
            if (editorViewHeading) editorViewHeading.textContent = `Editar: ${project.titulo}`;
            if (editorStatusBadge) {
                editorStatusBadge.textContent = 'Editando';
                editorStatusBadge.style.background = 'rgba(139, 92, 246, 0.15)';
                editorStatusBadge.style.color = '#c084fc';
                editorStatusBadge.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            }
            if (btnPublishProjectTopText) btnPublishProjectTopText.textContent = 'Guardar Cambios';

            if (editorTitle) editorTitle.value = project.titulo || '';
            if (editorDesc) editorDesc.value = project.descripcion || '';

            // Procesar tecnologías
            editorActiveTags = [];
            if (project.tecnologias) {
                editorActiveTags = project.tecnologias.split(',').map(t => t.trim()).filter(Boolean);
            }
            renderEditorTags();

            // Cargar Galería de Imágenes (Máximo 4)
            editorGalleryImages = [];
            let loadedImgs = [];
            if (project.imagenes) {
                if (Array.isArray(project.imagenes)) {
                    loadedImgs = project.imagenes;
                } else if (typeof project.imagenes === 'string') {
                    try {
                        const parsed = JSON.parse(project.imagenes);
                        if (Array.isArray(parsed)) loadedImgs = parsed;
                        else loadedImgs = [project.imagenes];
                    } catch(e) {
                        loadedImgs = project.imagenes.split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
            } else if (project.imagenes_array && Array.isArray(project.imagenes_array)) {
                loadedImgs = project.imagenes_array;
            } else if (project.imagen_url || project.imagen) {
                loadedImgs = [project.imagen_url || project.imagen];
            }

            loadedImgs.slice(0, MAX_GALLERY_IMAGES).forEach((imgSrc, idx) => {
                editorGalleryImages.push({
                    id: 'existing_' + idx + '_' + Date.now(),
                    type: 'url',
                    file: null,
                    url: imgSrc,
                    previewUrl: formatProjectImageUrl(imgSrc)
                });
            });
            renderEditorGallery();

            // Cargar Video Corto si existe
            if (project.video_url) {
                editorExistingVideoUrl = project.video_url;
                showVideoInEditor(formatProjectVideoUrl(project.video_url), project.video_url.replace(/^.*[\\\/]/, ''));
            } else {
                clearVideoFromEditor(false);
            }

            // Enlace de la página principal del proyecto (Promoción)
            if (editorDemoUrl) {
                editorDemoUrl.value = project.enlace_demo || project.demo_url || '';
            }

            // Estado de destacado (Espiral 3D)
            if (editorDestacado) {
                editorDestacado.checked = (Number(project.destacado) === 1 || project.destacado === true || project.destacado === '1');
            }

            // Archivo ZIP privado del proyecto (Solo Admin)
            editorCurrentProjectZip = project.archivo_zip || null;
            if (project.archivo_zip || project.tiene_zip) {
                if (existingZipBox) existingZipBox.classList.remove('d-none');
                if (existingZipFileNameDisplay) {
                    existingZipFileNameDisplay.textContent = project.archivo_zip || 'archivo_proyecto.zip';
                }
                if (existingZipSizeBadge) {
                    existingZipSizeBadge.textContent = project.zip_size ? formatBytes(project.zip_size) : 'En Base de Datos';
                }
            } else {
                if (existingZipBox) existingZipBox.classList.add('d-none');
            }

        } else {
            // Modo Creación
            if (editorProjectId) editorProjectId.value = '';
            if (editorDemoUrl) editorDemoUrl.value = '';
            if (editorViewHeading) editorViewHeading.textContent = 'Nuevo Proyecto';
            if (editorStatusBadge) {
                editorStatusBadge.textContent = 'Nuevo';
                editorStatusBadge.style.background = 'rgba(0, 229, 212, 0.12)';
                editorStatusBadge.style.color = '#00e5d4';
                editorStatusBadge.style.borderColor = 'rgba(0, 229, 212, 0.3)';
            }
            if (btnPublishProjectTopText) btnPublishProjectTopText.textContent = 'Guardar Proyecto';

            if (editorDestacado) {
                editorDestacado.checked = false;
            }

            editorGalleryImages = [];
            renderEditorGallery();
            clearVideoFromEditor(false);

            editorCurrentProjectZip = null;
            if (existingZipBox) existingZipBox.classList.add('d-none');

            // Tags sugeridos iniciales
            editorActiveTags = ['JavaScript', 'PHP', 'HTML5'];
            renderEditorTags();
        }

        updateEditorCounters();
        updateLiveCardPreview();
        switchAdminView('editor');

        if (editorTitle) setTimeout(() => editorTitle.focus(), 150);
    }

    // Regresar a la lista de proyectos
    function closeProjectEditor() {
        switchAdminView('list');
    }



    // Contadores de caracteres
    function updateEditorCounters() {
        if (editorTitle && editorTitleCount) {
            editorTitleCount.textContent = `${editorTitle.value.length} / 80`;
        }
        if (editorDesc && editorDescCount) {
            editorDescCount.textContent = `${editorDesc.value.length} / 700`;
        }
    }

    if (editorTitle) {
        editorTitle.addEventListener('input', () => {
            updateEditorCounters();
            updateLiveCardPreview();
            updateQualityChecklist();
        });
    }

    if (editorDesc) {
        editorDesc.addEventListener('input', () => {
            updateEditorCounters();
            updateLiveCardPreview();
            updateQualityChecklist();
        });
    }

    // Manejo de Tags y Tecnologías
    function renderEditorTags() {
        if (!editorActiveTagsList) return;
        editorActiveTagsList.innerHTML = '';

        editorActiveTags.forEach(tag => {
            const badge = document.createElement('span');
            badge.className = 'active-tag-badge';
            badge.innerHTML = `
                <span>${tag}</span>
                <button type="button" class="btn-tag-remove" data-tag="${tag}" title="Remover tag">×</button>
            `;
            editorActiveTagsList.appendChild(badge);
        });

        if (editorTechHidden) {
            editorTechHidden.value = editorActiveTags.join(', ');
        }

        // Sincronizar estado visual de los botones de sugerencia rápida
        if (quickTechPills) {
            quickTechPills.querySelectorAll('.quick-tech-btn').forEach(btn => {
                const tech = btn.getAttribute('data-tech');
                if (tech && editorActiveTags.some(t => t.toLowerCase() === tech.toLowerCase())) {
                    btn.classList.add('is-added');
                } else {
                    btn.classList.remove('is-added');
                }
            });
        }

        updateLiveCardPreview();
        updateQualityChecklist();
    }

    function addEditorTag(tagText) {
        const clean = tagText.trim().replace(/^,+|,+$/g, '');
        if (clean && !editorActiveTags.some(t => t.toLowerCase() === clean.toLowerCase())) {
            if (editorActiveTags.length < 8) {
                editorActiveTags.push(clean);
                renderEditorTags();
            } else {
                showAdminToast('Máximo 8 tecnologías recomendadas para la tarjeta.', 'info');
            }
        }
    }

    function removeEditorTag(tagText) {
        editorActiveTags = editorActiveTags.filter(t => t.toLowerCase() !== tagText.toLowerCase());
        renderEditorTags();
    }

    // Agregar tag mediante tecla Enter o coma
    if (editorTechInput) {
        editorTechInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addEditorTag(this.value);
                this.value = '';
            }
        });
        editorTechInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                addEditorTag(this.value);
                this.value = '';
            }
        });
    }

    if (editorActiveTagsList) {
        editorActiveTagsList.addEventListener('click', function(e) {
            const removeBtn = e.target.closest('.btn-tag-remove');
            if (removeBtn) {
                const tag = removeBtn.getAttribute('data-tag');
                if (tag) removeEditorTag(tag);
            }
        });
    }

    // Sugerencias rápidas de tecnologías clicables (Añadir o Alternar)
    if (quickTechPills) {
        quickTechPills.addEventListener('click', function(e) {
            const pillBtn = e.target.closest('.quick-tech-btn');
            if (pillBtn) {
                const tech = pillBtn.getAttribute('data-tech');
                if (tech) {
                    if (editorActiveTags.some(t => t.toLowerCase() === tech.toLowerCase())) {
                        removeEditorTag(tech);
                    } else {
                        addEditorTag(tech);
                    }
                }
            }
        });
    }

    // ==========================================================
    // GESTIÓN DE GALERÍA DE IMÁGENES (MÁXIMO 4 FOTOS POR PROYECTO)
    // ==========================================================
    function renderEditorGallery() {
        if (!editorGalleryGrid) return;
        editorGalleryGrid.innerHTML = '';

        if (galleryCountBadge) {
            const count = editorGalleryImages.length;
            galleryCountBadge.textContent = `${count} / ${MAX_GALLERY_IMAGES} fotos`;
            if (count >= MAX_GALLERY_IMAGES) {
                galleryCountBadge.style.background = 'rgba(239, 68, 68, 0.15)';
                galleryCountBadge.style.color = '#f87171';
                galleryCountBadge.style.borderColor = 'rgba(239, 68, 68, 0.35)';
            } else {
                galleryCountBadge.style.background = 'rgba(0, 229, 212, 0.12)';
                galleryCountBadge.style.color = '#5eead4';
                galleryCountBadge.style.borderColor = 'rgba(0, 229, 212, 0.3)';
            }
        }

        // Renderizar miniaturas de imágenes actuales
        editorGalleryImages.forEach((imgObj, idx) => {
            const card = document.createElement('div');
            card.className = 'editor-gallery-card';
            const isCover = idx === 0;
            const displayUrl = imgObj.previewUrl || formatProjectImageUrl(imgObj.url);

            card.innerHTML = `
                <img src="${displayUrl}" alt="Foto ${idx + 1}" onerror="this.src='${DEFAULT_PLACEHOLDER_IMG}'">
                <span class="gallery-card-badge-cover ${isCover ? 'is-cover' : ''}">${isCover ? '★ Portada' : '#' + (idx + 1)}</span>
                <div class="gallery-card-actions">
                    ${!isCover ? `<button type="button" class="btn-gallery-action" data-action="make-cover" data-index="${idx}" title="Convertir en Portada Principal">★</button>` : ''}
                    <button type="button" class="btn-gallery-action delete" data-action="delete" data-index="${idx}" title="Eliminar foto">✕</button>
                </div>
            `;
            editorGalleryGrid.appendChild(card);
        });

        // Ranura para agregar más fotos si no ha llegado al límite de 4
        if (editorGalleryImages.length < MAX_GALLERY_IMAGES) {
            const addSlot = document.createElement('div');
            addSlot.className = 'editor-gallery-add-slot';
            addSlot.innerHTML = `
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>+ Agregar Foto</span>
                <small style="font-size: 0.68rem; opacity: 0.7;">(${editorGalleryImages.length}/${MAX_GALLERY_IMAGES})</small>
            `;
            addSlot.addEventListener('click', () => {
                if (editorFileInput) editorFileInput.click();
            });
            editorGalleryGrid.appendChild(addSlot);
        }

        updateLiveCardPreview();
    }

    // Delegación de eventos en las tarjetas de la galería (Hacer portada / Eliminar)
    if (editorGalleryGrid) {
        editorGalleryGrid.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn-gallery-action');
            if (!btn) return;
            e.stopPropagation();

            const action = btn.getAttribute('data-action');
            const index = parseInt(btn.getAttribute('data-index'), 10);
            if (isNaN(index)) return;

            if (action === 'make-cover') {
                // Mover la imagen seleccionada a la primera posición (índice 0)
                const selected = editorGalleryImages.splice(index, 1)[0];
                editorGalleryImages.unshift(selected);
                renderEditorGallery();
                showAdminToast('Foto asignada como portada principal.', 'info');
            } else if (action === 'delete') {
                editorGalleryImages.splice(index, 1);
                renderEditorGallery();
                showAdminToast('Foto eliminada de la galería.', 'info');
            }
        });
    }

    // Procesar archivos de imagen agregados (con control estricto de máximo 4)
    function handleAddGalleryFiles(files) {
        if (!files || files.length === 0) return;

        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            showAdminToast('Por favor, selecciona archivos de imagen válidos (JPG, PNG, WEBP, GIF).', 'warning');
            return;
        }

        const currentCount = editorGalleryImages.length;
        const availableSlots = MAX_GALLERY_IMAGES - currentCount;

        if (availableSlots <= 0) {
            showAdminToast('Límite estricto: Solo se permite un máximo de 4 fotos por proyecto.', 'warning');
            return;
        }

        if (imageFiles.length > availableSlots) {
            showAdminToast(`Límite de 4 fotos: Solo se añadieron ${availableSlots} imagen(es).`, 'warning');
        }

        const filesToAdd = imageFiles.slice(0, availableSlots);
        filesToAdd.forEach(file => {
            const previewUrl = URL.createObjectURL(file);
            editorGalleryImages.push({
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: 'file',
                file: file,
                url: '',
                previewUrl: previewUrl
            });
        });

        renderEditorGallery();
    }

    // Eventos de Dropzone y Selección de Imágenes
    if (editorDropzone && editorFileInput) {
        editorDropzone.addEventListener('click', function(e) {
            if (e.target === editorFileInput) return;
            editorFileInput.click();
        });

        editorDropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        editorDropzone.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });

        editorDropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleAddGalleryFiles(e.dataTransfer.files);
            }
        });

        editorFileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                handleAddGalleryFiles(this.files);
                this.value = ''; // Permitir seleccionar los mismos archivos de nuevo si es necesario
            }
        });
    }

    // ==========================================================
    // GESTIÓN DE VIDEO CORTO DEL PROYECTO
    // ==========================================================
    function showVideoInEditor(src, label = 'video.mp4') {
        if (editorVideoPreviewBox) editorVideoPreviewBox.classList.remove('d-none');
        if (editorVideoPreviewEl) {
            editorVideoPreviewEl.src = src;
        }
        if (editorVideoInfoDisplay) {
            editorVideoInfoDisplay.textContent = label;
        }
        if (editorEliminarVideo) editorEliminarVideo.value = '0';
        updateLiveCardPreview();
    }

    function clearVideoFromEditor(markDeleted = true) {
        editorSelectedVideoFile = null;
        editorExistingVideoUrl = '';
        if (editorVideoInput) editorVideoInput.value = '';
        if (editorVideoPreviewEl) {
            try { editorVideoPreviewEl.pause(); } catch(e) {}
            editorVideoPreviewEl.src = '';
        }
        if (editorVideoPreviewBox) editorVideoPreviewBox.classList.add('d-none');
        if (markDeleted && editorEliminarVideo) {
            editorEliminarVideo.value = '1';
        }
        updateLiveCardPreview();
    }

    function handleSelectedVideoFile(file) {
        if (!file) return;
        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
        const name = file.name || '';
        const isValid = validTypes.includes(file.type) || name.match(/\.(mp4|webm|mov|ogg)$/i);
        if (!isValid) {
            showAdminToast('Por favor, selecciona un video en formato MP4 o WebM.', 'warning');
            return;
        }

        if (file.size > 85 * 1024 * 1024) {
            showAdminToast('El video no debe superar 80MB.', 'warning');
            return;
        }

        editorSelectedVideoFile = file;
        editorExistingVideoUrl = '';
        const videoBlobUrl = URL.createObjectURL(file);
        showVideoInEditor(videoBlobUrl, `${file.name} (${formatBytes(file.size)})`);
        showAdminToast('Video cargado para vista previa.', 'info');
    }

    // Dropzone de Video
    if (editorVideoDropzone && editorVideoInput) {
        editorVideoDropzone.addEventListener('click', function(e) {
            if (e.target === editorVideoInput) return;
            editorVideoInput.click();
        });

        editorVideoDropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        editorVideoDropzone.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });

        editorVideoDropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleSelectedVideoFile(e.dataTransfer.files[0]);
            }
        });

        editorVideoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleSelectedVideoFile(this.files[0]);
            }
        });
    }

    // Botón para quitar el video
    if (btnRemoveVideo) {
        btnRemoveVideo.addEventListener('click', function(e) {
            e.stopPropagation();
            clearVideoFromEditor(true);
            showAdminToast('El video se quitará al guardar el proyecto.', 'info');
        });
    }

    if (editorDemoUrl) {
        editorDemoUrl.addEventListener('input', () => {
            updateLiveCardPreview();
        });
    }

    // ==========================================================
    // ACTUALIZACIÓN DE LA TARJETA EN VIVO
    // ==========================================================
    function updateLiveCardPreview() {
        // 1. Título
        const titleVal = editorTitle ? editorTitle.value.trim() : '';
        if (liveCardTitle) {
            liveCardTitle.textContent = titleVal || 'Título del Proyecto';
        }

        // 2. Imagen de Portada (primera de la galería)
        if (liveCardImg) {
            if (editorGalleryImages.length > 0) {
                const coverObj = editorGalleryImages[0];
                liveCardImg.src = coverObj.previewUrl || formatProjectImageUrl(coverObj.url);
            } else {
                liveCardImg.src = DEFAULT_PLACEHOLDER_IMG;
            }
        }

        // 3. Contador de fotos en miniatura en la tarjeta
        if (liveCardImgCount) {
            const count = editorGalleryImages.length;
            liveCardImgCount.textContent = `${count} ${count === 1 ? 'foto' : 'fotos'}`;
        }

        // 4. Badge de Video en la tarjeta en vivo
        if (liveCardVideoBadge) {
            const hasVid = Boolean(editorSelectedVideoFile || editorExistingVideoUrl);
            if (hasVid) {
                liveCardVideoBadge.classList.remove('d-none');
            } else {
                liveCardVideoBadge.classList.add('d-none');
            }
        }

        // 5. Descripción
        const descVal = editorDesc ? editorDesc.value.trim() : '';
        if (liveCardDesc) {
            liveCardDesc.textContent = descVal || 'Descripción del proyecto...';
        }

        // 6. Tecnologías
        if (liveCardTechList) {
            liveCardTechList.innerHTML = '';
            if (editorActiveTags.length > 0) {
                editorActiveTags.forEach(tech => {
                    const badge = document.createElement('span');
                    badge.className = 'tech-badge';
                    badge.textContent = tech;
                    liveCardTechList.appendChild(badge);
                });
            } else {
                liveCardTechList.innerHTML = `
                    <span class="tech-badge" style="opacity: 0.5;">Tecnología 1</span>
                    <span class="tech-badge" style="opacity: 0.5;">Tecnología 2</span>
                `;
            }
        }

        // 7. Enlace de la página principal (promoción)
        if (liveCardDemoBtn) {
            const linkVal = editorDemoUrl ? editorDemoUrl.value.trim() : '';
            if (linkVal) {
                liveCardDemoBtn.classList.remove('d-none');
                liveCardDemoBtn.href = linkVal.startsWith('http') ? linkVal : ('https://' + linkVal);
            } else {
                liveCardDemoBtn.classList.add('d-none');
            }
        }
    }

    // Manejo de Dropzone & Subida de Archivo ZIP (Solo Admin)
    if (editorZipDropzone && editorZipInput) {
        editorZipDropzone.addEventListener('click', function(e) {
            if (e.target.closest('#btnRemoveSelectedZip') || e.target === editorZipInput) return;
            editorZipInput.click();
        });

        editorZipDropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        editorZipDropzone.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });

        editorZipDropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                try {
                    editorZipInput.files = e.dataTransfer.files;
                } catch (err) {}
                handleSelectedZipFile(e.dataTransfer.files[0]);
            }
        });

        editorZipInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleSelectedZipFile(this.files[0]);
            }
        });
    }

    if (btnRemoveSelectedZip) {
        btnRemoveSelectedZip.addEventListener('click', function(e) {
            e.stopPropagation();
            clearSelectedZipFile();
        });
    }

    if (btnDownloadCurrentZip) {
        btnDownloadCurrentZip.addEventListener('click', function() {
            const id = editorProjectId ? editorProjectId.value.trim() : '';
            if (!id) return;
            const adminUserToken = encodeURIComponent(localStorage.getItem('devioz_admin_user') || 'admin');
            const downloadUrl = `${verifiedProjectsEndpoint || getBackendProjectsEndpoint()}?action=download_zip&id=${encodeURIComponent(id)}&admin_token=devioz_admin_${adminUserToken}`;
            window.open(downloadUrl, '_blank');
        });
    }

    if (btnDeleteCurrentZip) {
        btnDeleteCurrentZip.addEventListener('click', function() {
            if (confirm('¿Deseas desvincular y eliminar el archivo ZIP de este proyecto al guardar?')) {
                if (editorEliminarZip) editorEliminarZip.value = '1';
                if (existingZipBox) existingZipBox.classList.add('d-none');
                showAdminToast('El archivo ZIP se eliminará cuando guardes o actualices el proyecto.', 'info');
            }
        });
    }

    function updateQualityChecklist() {
        // Módulo reemplazado por gestor privado de archivos ZIP
    }

    function setChecklistItem(element, isComplete) {
        if (!element) return;
        const bullet = element.querySelector('.chk-bullet');
        if (isComplete) {
            element.classList.add('completed');
            if (bullet) {
                bullet.textContent = '✔️';
                bullet.style.color = '#00e5d4';
            }
        } else {
            element.classList.remove('completed');
            if (bullet) {
                bullet.textContent = '⚪';
                bullet.style.color = '#64748b';
            }
        }
    }

    // Botones de Navegación del Estudio
    if (btnNewProject) {
        btnNewProject.addEventListener('click', () => openProjectEditor('create'));
    }

    if (btnBackToProjects) {
        btnBackToProjects.addEventListener('click', closeProjectEditor);
    }

    if (btnResetEditor) {
        btnResetEditor.addEventListener('click', () => {
            if (confirm('¿Deseas restablecer todos los campos del formulario?')) {
                openProjectEditor('create');
            }
        });
    }

    if (btnPublishProjectTop) {
        btnPublishProjectTop.addEventListener('click', () => {
            if (editorProjectForm) {
                if (typeof editorProjectForm.requestSubmit === 'function') {
                    editorProjectForm.requestSubmit();
                } else {
                    editorProjectForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
        });
    }

    // ==========================================================
    // Guardar / Publicar Proyecto (Submit del Formulario del Estudio)
    // ==========================================================
    if (editorProjectForm) {
        editorProjectForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = editorTitle ? editorTitle.value.trim() : '';
            if (!title) {
                showAdminToast('El título del proyecto es obligatorio.', 'warning');
                if (editorTitle) editorTitle.focus();
                return;
            }

            const id = editorProjectId ? editorProjectId.value.trim() : '';
            const isEditing = Boolean(id);

            // Estado de carga en ambos botones de publicación
            const setButtonsLoading = (loading) => {
                const topBtn = document.getElementById('btnPublishProjectTop');
                if (topBtn) {
                    topBtn.disabled = loading;
                    topBtn.innerHTML = loading 
                        ? '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'
                        : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg><span>${isEditing ? 'Guardar Cambios' : 'Publicar Proyecto'}</span>`;
                }
            };

            setButtonsLoading(true);

            try {
                const formData = new FormData(editorProjectForm);
                const adminUser = localStorage.getItem('devioz_admin_user') || 'admin';
                const adminToken = 'devioz_admin_' + adminUser;

                formData.append('admin_token', adminToken);
                if (isEditing) {
                    formData.append('id', id);
                    formData.append('action', 'update');
                }

                // Validar límite estricto de máximo 4 imágenes
                if (editorGalleryImages.length > MAX_GALLERY_IMAGES) {
                    showAdminToast(`Límite estricto: Solo se permiten hasta ${MAX_GALLERY_IMAGES} fotos por proyecto.`, 'warning');
                    setButtonsLoading(false);
                    return;
                }

                // Separar imágenes existentes retenidas y nuevos archivos a subir
                const retainedUrls = editorGalleryImages
                    .filter(item => item.type === 'url' && item.url)
                    .map(item => item.url);
                formData.set('existing_images', JSON.stringify(retainedUrls));

                // Adjuntar cada nuevo archivo de imagen en project_images[]
                const newImageFiles = editorGalleryImages
                    .filter(item => item.type === 'file' && item.file)
                    .map(item => item.file);
                
                // Limpiar posibles entradas previas de project_images
                formData.delete('project_images[]');
                newImageFiles.forEach(file => {
                    formData.append('project_images[]', file);
                });

                // Asignar portada principal para retrocompatibilidad directa
                if (editorGalleryImages.length > 0) {
                    const cover = editorGalleryImages[0];
                    if (cover.type === 'file' && cover.file) {
                        formData.set('imagen', cover.file);
                        formData.set('imagen_url', '');
                    } else if (cover.type === 'url' && cover.url) {
                        formData.set('imagen_url', cover.url);
                    }
                } else {
                    formData.set('imagen_url', '');
                }

                // Adjuntar video corto del proyecto (archivo)
                if (editorSelectedVideoFile) {
                    formData.set('video_file', editorSelectedVideoFile);
                    formData.set('video_url', '');
                }
                if (editorEliminarVideo && editorEliminarVideo.value === '1') {
                    formData.set('eliminar_video', '1');
                }

                // Asegurar tecnologías procesadas y estado destacado
                formData.set('tecnologias', editorActiveTags.join(', '));
                formData.set('destacado', editorDestacado && editorDestacado.checked ? '1' : '0');

                // Asegurar enlace de la página principal (promoción del proyecto)
                const promoLink = editorDemoUrl ? editorDemoUrl.value.trim() : '';
                formData.set('enlace_demo', promoLink);
                formData.set('demo_url', promoLink);

                // Asegurar que el archivo ZIP se adjunte si fue seleccionado (Solo Admin)
                if (editorSelectedZipFile) {
                    formData.set('archivo_zip', editorSelectedZipFile);
                } else if (editorZipInput && editorZipInput.files && editorZipInput.files[0]) {
                    formData.set('archivo_zip', editorZipInput.files[0]);
                }
                if (editorEliminarZip && editorEliminarZip.value === '1') {
                    formData.set('eliminar_zip', '1');
                }

                const endpoint = getBackendProjectsEndpoint();
                let response;
                try {
                    response = await fetch(endpoint, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                            'X-Admin-Token': adminToken
                        },
                        body: formData
                    });
                } catch (saveErr) {
                    const fallbackEndpoint = `http://localhost/portafolio-Devioz/backend/api/proyectos.php`;
                    response = await fetch(fallbackEndpoint, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                            'X-Admin-Token': adminToken
                        },
                        body: formData
                    });
                }

                const result = await response.json();

                if (response.ok && (result.status === 'success' || result.code === 200 || result.code === 201)) {
                    clearSelectedZipFile();
                    // Cerrar el dashboard y volver a la vista de lista
                    closeProjectEditor();

                    // Recargar inmediatamente todos los proyectos en flujo continuo
                    await loadAdminProjects();

                    showAdminToast(
                        isEditing ? '¡Proyecto actualizado con éxito!' : '¡Nuevo proyecto publicado exitosamente en tu portafolio!',
                        'success'
                    );
                } else {
                    showAdminToast(result.message || 'Ocurrió un error al guardar el proyecto.', 'error');
                }
            } catch (err) {
                console.error('[Devioz Admin] Error al guardar proyecto:', err);
                showAdminToast('Error de conexión al guardar el proyecto. Verifica que Apache esté en ejecución.', 'error');
            } finally {
                setButtonsLoading(false);
            }
        });
    }

    // ==========================================================
    // Acciones en la Tabla de Proyectos (Editar y Eliminar)
    // ==========================================================
    if (projectsTableBody) {
        projectsTableBody.addEventListener('click', async function(e) {
            const deleteBtn = e.target.closest('.btn-action-delete');
            const editBtn = e.target.closest('.btn-action-edit');

            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (!id) return;

                const project = adminProjectsList.find(p => String(p.id) === String(id));
                const projectTitle = project ? project.titulo : ('#' + id);

                if (confirm(`¿Estás seguro de que deseas eliminar el proyecto "${projectTitle}" (#${id})? Esta acción removerá el registro y sus archivos asociados.`)) {
                    try {
                        const adminUser = localStorage.getItem('devioz_admin_user') || 'admin';
                        const adminToken = 'devioz_admin_' + adminUser;
                        const deleteEndpoint = getBackendProjectsEndpoint() + `?action=delete&id=${encodeURIComponent(id)}&admin_token=${encodeURIComponent(adminToken)}`;
                        let response;
                        try {
                            response = await fetch(deleteEndpoint, {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Authorization': `Bearer ${adminToken}`,
                                    'X-Admin-Token': adminToken
                                }
                            });
                        } catch (delErr) {
                            const fallbackDelete = `http://localhost/portafolio-Devioz/backend/api/proyectos.php?action=delete&id=${encodeURIComponent(id)}&admin_token=${encodeURIComponent(adminToken)}`;
                            response = await fetch(fallbackDelete, {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Authorization': `Bearer ${adminToken}`,
                                    'X-Admin-Token': adminToken
                                }
                            });
                        }

                        const resData = await response.json();
                        if (response.ok && (resData.status === 'success')) {
                            const row = deleteBtn.closest('tr');
                            if (row) {
                                row.style.opacity = '0';
                                row.style.transform = 'scale(0.95)';
                                row.style.transition = 'all 0.25s ease';
                                setTimeout(() => {
                                    loadAdminProjects();
                                }, 260);
                            } else {
                                loadAdminProjects();
                            }
                            showAdminToast(`El proyecto "${projectTitle}" ha sido eliminado.`, 'success');
                        } else {
                            showAdminToast(resData.message || 'No se pudo eliminar el proyecto.', 'error');
                        }
                    } catch (err) {
                        console.error('[Devioz Admin] Error al eliminar proyecto:', err);
                        showAdminToast('Error de conexión al eliminar el proyecto.', 'error');
                    }
                }
            } else if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const project = adminProjectsList.find(p => String(p.id) === String(id));
                if (project) {
                    openProjectEditor('edit', project);
                }
            }
        });
    }

    // ==========================================================
    // 6. GESTIÓN DE PERFIL DEL ADMINISTRADOR (Ver Perfil & Editar)
    // ==========================================================
    const viewAdminProfile = document.getElementById('viewAdminProfile');
    const btnViewProfile = document.getElementById('btnViewProfile');
    const btnBackToProjectsFromProfile = document.getElementById('btnBackToProjectsFromProfile');
    const btnCancelProfile = document.getElementById('btnCancelProfile');
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    const btnSaveProfileText = document.getElementById('btnSaveProfileText');
    const adminProfileForm = document.getElementById('adminProfileForm');
    const profileAlert = document.getElementById('profileAlert');
    const profileAlertIcon = document.getElementById('profileAlertIcon');
    const profileAlertText = document.getElementById('profileAlertText');

    // Inputs del Formulario de Perfil
    const profileNombreCompleto = document.getElementById('profileNombreCompleto');
    const profileUsuario = document.getElementById('profileUsuario');
    const profileEmail = document.getElementById('profileEmail');
    const profileClaveActual = document.getElementById('profileClaveActual');
    const profileNuevaClave = document.getElementById('profileNuevaClave');
    const profileConfirmarClave = document.getElementById('profileConfirmarClave');

    // Elementos del Resumen de Perfil (Sidebar)
    const profileAvatarInitials = document.getElementById('profileAvatarInitials');
    const profileSummaryName = document.getElementById('profileSummaryName');
    const profileSummaryUser = document.getElementById('profileSummaryUser');
    const profileSummaryEmail = document.getElementById('profileSummaryEmail');
    const profileSummaryRole = document.getElementById('profileSummaryRole');

    function getBackendProfileEndpoint() {
        const port = window.location.port;
        const isLiveDev = (port === '5500' || port === '5501' || port === '3000' || port === '5173' || window.location.protocol === 'file:');
        const host = window.location.hostname || 'localhost';

        if (isLiveDev) {
            return `http://${host}/portafolio-Devioz/backend/api/perfil.php`;
        }
        return window.location.pathname.includes('/admin/') 
            ? '../../backend/api/perfil.php' 
            : '../backend/api/perfil.php';
    }

    function showProfileAlert(message, type = 'success') {
        if (!profileAlert) return;
        profileAlert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} mb-4 d-flex align-items-center gap-2`;
        if (profileAlertIcon) {
            profileAlertIcon.textContent = type === 'success' ? '✅' : '⚠️';
        }
        if (profileAlertText) {
            profileAlertText.textContent = message;
        }
        profileAlert.classList.remove('d-none');
        profileAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideProfileAlert() {
        if (profileAlert) profileAlert.classList.add('d-none');
    }

    // Toggle de visibilidad de contraseñas (ojito 👁️)
    document.querySelectorAll('.btn-toggle-pw').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                this.textContent = '🙈';
                this.title = 'Ocultar contraseña';
            } else {
                targetInput.type = 'password';
                this.textContent = '👁️';
                this.title = 'Ver contraseña';
            }
        });
    });

    // Cargar información del perfil desde el backend
    async function loadAdminProfile() {
        hideProfileAlert();
        if (profileClaveActual) profileClaveActual.value = '';
        if (profileNuevaClave) profileNuevaClave.value = '';
        if (profileConfirmarClave) profileConfirmarClave.value = '';

        const endpoint = getBackendProfileEndpoint();
        const adminUser = localStorage.getItem('devioz_admin_user') || 'admin';

        try {
            let response = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer devioz_admin_${adminUser}`,
                    'X-Admin-Token': `devioz_admin_${adminUser}`
                }
            });

            // Si Live Server devuelve 405 o ruta relativa falla, intentar localhost de Apache
            if (!response.ok && !endpoint.includes('http://localhost')) {
                response = await fetch(`http://localhost/portafolio-Devioz/backend/api/perfil.php`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer devioz_admin_${adminUser}`,
                        'X-Admin-Token': `devioz_admin_${adminUser}`
                    }
                });
            }

            const resData = await response.json();
            if (response.ok && resData.status === 'success' && resData.data) {
                const u = resData.data;

                // Actualizar inputs del formulario
                const displayName = u.nombre_completo || u.nombre || 'Admin Devioz';
                if (profileNombreCompleto) profileNombreCompleto.value = displayName;
                if (profileUsuario) profileUsuario.value = u.usuario || '';
                if (profileEmail) profileEmail.value = u.email || '';

                // Actualizar tarjeta lateral de resumen
                if (profileSummaryName) profileSummaryName.textContent = displayName;
                if (profileSummaryUser) profileSummaryUser.textContent = u.usuario || 'admin';
                if (profileSummaryEmail) profileSummaryEmail.textContent = u.email || '—';
                if (profileSummaryRole) profileSummaryRole.textContent = u.rol_nombre || 'Administrador';

                // Generar iniciales para el avatar
                if (profileAvatarInitials) {
                    const parts = displayName.trim().split(/\s+/);
                    const initials = parts.length > 1 
                        ? (parts[0][0] + parts[1][0]).toUpperCase()
                        : (displayName.substring(0, 2)).toUpperCase();
                    profileAvatarInitials.textContent = initials || 'AD';
                }
            } else {
                showProfileAlert(resData.message || 'No se pudieron cargar los datos del perfil.', 'error');
            }
        } catch (err) {
            console.error('[Devioz Admin] Error al cargar perfil:', err);
            showProfileAlert('Error de conexión al cargar la información del perfil.', 'error');
        }
    }

    // ==========================================================
    // Animación Lottie para el Botón "Ver Perfil" del Administrador
    // ==========================================================
    const USER_PROFILE_ANIM_DATA = {"v":"5.12.2","fr":29.9700012207031,"ip":0,"op":45.0000018328876,"w":48,"h":48,"nm":"user profile","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"user-outline-bot_s1g1_s2g2_s3g1_s4g1 Outlines","parent":2,"sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[21.28,38.663,0],"ix":2,"l":2},"a":{"a":0,"k":[15.007,30.709,0],"ix":1,"l":2},"s":{"a":0,"k":[100,100,100],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,3.112],[-3.111,0],[0,-3.112],[3.112,0]],"o":[[0,-3.112],[3.112,0],[0,3.112],[-3.111,0]],"v":[[-5.635,0],[-0.001,-5.634],[5.635,0],[-0.001,5.634]],"c":true},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0,0.8980392156862745,0.6],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":1,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":1,"k":[{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":0,"s":[15.007,10.634],"to":[0,-0.274],"ti":[0,0.741]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":3,"s":[15.007,8.955],"to":[0,-1.345],"ti":[0,0]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":7,"s":[15.007,8.509],"to":[0,0],"ti":[0,0.741]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":10,"s":[15.007,8.955],"to":[0,-1.345],"ti":[0,-0.28]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":13.6,"s":[15.007,10.634],"to":[0,0],"ti":[0,0.771]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":20.4,"s":[15.007,10.634],"to":[0,-0.274],"ti":[0,0.741]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":24,"s":[15.007,8.955],"to":[0,-1.345],"ti":[0,0]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":27,"s":[15.007,8.509],"to":[0,0],"ti":[0,0.741]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":31,"s":[15.007,8.955],"to":[0,-1.345],"ti":[0,-0.28]},{"t":34.0000013848484,"s":[15.007,10.634]}],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":3,"s":[100,100]},{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":7,"s":[100,66.631]},{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":10,"s":[100,100]},{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":24,"s":[100,100]},{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":27,"s":[100,66.631]},{"t":31.0000012626559,"s":[100,100]}],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,-4.95],[0,0],[1.103,0],[0,0],[0,1.104],[0,0],[-4.95,0],[0,0]],"o":[[0,0],[0,1.104],[0,0],[-1.103,0],[0,0],[0,-4.95],[0,0],[4.95,0]],"v":[[10.007,3.245],[10.007,3.719],[8.008,5.718],[-8.008,5.718],[-10.007,3.719],[-10.007,3.245],[-1.044,-5.718],[1.044,-5.718]],"c":true},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0,0.8980392156862745,0.6],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":1,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[15.007,30.45],"ix":2},"a":{"a":0,"k":[0,5.25],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":0,"s":[100,100]},{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":7,"s":[100,128.521]},{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":13.6,"s":[100,100]},{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":20.4,"s":[100,100]},{"i":{"x":[0.667,0.667],"y":[1,1]},"o":{"x":[0.333,0.333],"y":[0,0]},"t":27,"s":[100,128.521]},{"t":34.0000013848484,"s":[100,100]}],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":2,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":45.0000018328876,"st":0,"ct":1,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"user-outline-top_s1g1_s2g1_s3g1_s4g1_background Outlines","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":1,"k":[{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":3,"s":[24,24.571,0],"to":[0,-0.25,0],"ti":[0,0,0]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":7,"s":[24,23.071,0],"to":[0,0,0],"ti":[0,-0.25,0]},{"i":{"x":0.667,"y":0.667},"o":{"x":0.333,"y":0.333},"t":10,"s":[24,24.571,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":24,"s":[24,24.571,0],"to":[0,-0.25,0],"ti":[0,0,0]},{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":27,"s":[24,23.071,0],"to":[0,0,0],"ti":[0,-0.25,0]},{"t":31.0000012626559,"s":[24,24.571,0]}],"ix":2,"l":2},"a":{"a":0,"k":[21.28,21.936,0],"ix":1,"l":2},"s":{"a":0,"k":[100,100,100],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,4.276],[0,0],[-4.276,0],[0,0],[0,-4.277],[0,0],[4.276,0],[0,0]],"o":[[0,0],[0,-4.277],[0,0],[4.276,0],[0,0],[0,4.276],[0,0],[-4.276,0]],"v":[[-16.28,9.193],[-16.28,-9.191],[-8.537,-16.936],[8.537,-16.936],[16.28,-9.191],[16.28,9.193],[8.537,16.936],[-8.537,16.936]],"c":true},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0,0,0],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":1,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"fl","c":{"a":0,"k":[1,1,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[21.28,21.936],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":45.0000018328876,"st":0,"ct":1,"bm":0}],"markers":[],"props":{}};

    let profileLottieInstance = null;

    function initAdminProfileAnimation() {
        const iconContainer = document.getElementById('btnProfileAnimIcon');
        const btnProfile = document.getElementById('btnViewProfile');
        if (!iconContainer || !btnProfile) return;

        if (typeof lottie === 'undefined') {
            console.warn('[Devioz Admin] Lottie no cargado aún; se mantiene el SVG estático.');
            return;
        }

        try {
            iconContainer.innerHTML = '';

            profileLottieInstance = lottie.loadAnimation({
                container: iconContainer,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                animationData: USER_PROFILE_ANIM_DATA
            });

            let isHovering = false;

            // Reproducción inicial suave al cargar el panel
            setTimeout(() => {
                if (profileLottieInstance) {
                    profileLottieInstance.goToAndPlay(0, true);
                }
            }, 550);

            // Efecto interactivo al pasar el cursor (hover)
            btnProfile.addEventListener('mouseenter', () => {
                isHovering = true;
                if (profileLottieInstance) {
                    profileLottieInstance.goToAndPlay(0, true);
                }
            });

            btnProfile.addEventListener('mouseleave', () => {
                isHovering = false;
            });

            // Si el cursor permanece sobre el botón, repite el ciclo suavemente
            profileLottieInstance.addEventListener('complete', () => {
                if (isHovering && profileLottieInstance) {
                    profileLottieInstance.goToAndPlay(0, true);
                }
            });

            // Al hacer clic, también reacciona con la animación
            btnProfile.addEventListener('click', () => {
                if (profileLottieInstance) {
                    profileLottieInstance.goToAndPlay(0, true);
                }
            });

        } catch (err) {
            console.error('[Devioz Admin] Error al iniciar animación Lottie de perfil:', err);
        }
    }

    // Botones para navegar a Ver Perfil
    if (btnViewProfile) {
        btnViewProfile.addEventListener('click', () => {
            switchAdminView('profile');
            loadAdminProfile();
        });
    }

    // Inicializar animación del icono de perfil
    initAdminProfileAnimation();

    if (btnBackToProjectsFromProfile) {
        btnBackToProjectsFromProfile.addEventListener('click', () => {
            switchAdminView('list');
        });
    }

    if (btnCancelProfile) {
        btnCancelProfile.addEventListener('click', () => {
            switchAdminView('list');
        });
    }

    // Envío del formulario de perfil
    if (adminProfileForm) {
        adminProfileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            hideProfileAlert();

            const nombre = profileNombreCompleto ? profileNombreCompleto.value.trim() : '';
            const usuario = profileUsuario ? profileUsuario.value.trim() : '';
            const email = profileEmail ? profileEmail.value.trim() : '';
            const claveActual = profileClaveActual ? profileClaveActual.value : '';
            const nuevaClave = profileNuevaClave ? profileNuevaClave.value : '';
            const confirmarClave = profileConfirmarClave ? profileConfirmarClave.value : '';

            // Validaciones locales
            if (!nombre) {
                showProfileAlert('Por favor, ingresa tu nombre completo.', 'error');
                if (profileNombreCompleto) profileNombreCompleto.focus();
                return;
            }

            if (!usuario || usuario.length < 3) {
                showProfileAlert('El nombre de usuario debe contener al menos 3 caracteres.', 'error');
                if (profileUsuario) profileUsuario.focus();
                return;
            }

            if (!email || !email.includes('@')) {
                showProfileAlert('Por favor, ingresa un correo electrónico válido.', 'error');
                if (profileEmail) profileEmail.focus();
                return;
            }

            if (nuevaClave) {
                if (!claveActual) {
                    showProfileAlert('Para establecer una nueva contraseña, debes ingresar tu contraseña actual.', 'error');
                    if (profileClaveActual) profileClaveActual.focus();
                    return;
                }
                if (nuevaClave.length < 6) {
                    showProfileAlert('La nueva contraseña debe tener como mínimo 6 caracteres.', 'error');
                    if (profileNuevaClave) profileNuevaClave.focus();
                    return;
                }
                if (nuevaClave !== confirmarClave) {
                    showProfileAlert('La nueva contraseña y su confirmación no coinciden.', 'error');
                    if (profileConfirmarClave) profileConfirmarClave.focus();
                    return;
                }
            }

            // Estado de carga en botón
            const originalBtnText = btnSaveProfileText ? btnSaveProfileText.textContent : 'Guardar Credenciales';

            if (btnSaveProfile) {
                btnSaveProfile.disabled = true;
                if (btnSaveProfileText) btnSaveProfileText.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Guardando...';
            }

            const adminUser = localStorage.getItem('devioz_admin_user') || 'admin';
            const endpoint = getBackendProfileEndpoint();

            const payload = {
                action: 'update',
                nombre_completo: nombre,
                nombre: nombre,
                usuario: usuario,
                email: email,
                clave_actual: claveActual,
                nueva_clave: nuevaClave,
                confirmar_clave: confirmarClave,
                admin_token: `devioz_admin_${adminUser}`
            };

            try {
                let response = await fetch(endpoint, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer devioz_admin_${adminUser}`,
                        'X-Admin-Token': `devioz_admin_${adminUser}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok && !endpoint.includes('http://localhost')) {
                    response = await fetch(`http://localhost/portafolio-Devioz/backend/api/perfil.php`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer devioz_admin_${adminUser}`,
                            'X-Admin-Token': `devioz_admin_${adminUser}`
                        },
                        body: JSON.stringify(payload)
                    });
                }

                const resData = await response.json();

                if (response.ok && resData.status === 'success') {
                    showProfileAlert(resData.message || 'Credenciales actualizadas exitosamente.', 'success');
                    if (typeof showAdminToast === 'function') {
                        showAdminToast('Credenciales actualizadas correctamente.', 'success');
                    }

                    // Actualizar localStorage y resumen visual
                    localStorage.setItem('devioz_admin_user', usuario);
                    if (profileSummaryName) profileSummaryName.textContent = nombre;
                    if (profileSummaryUser) profileSummaryUser.textContent = usuario;
                    if (profileSummaryEmail) profileSummaryEmail.textContent = email;

                    // Actualizar iniciales de avatar
                    if (profileAvatarInitials) {
                        const parts = nombre.trim().split(/\s+/);
                        const initials = parts.length > 1 
                            ? (parts[0][0] + parts[1][0]).toUpperCase()
                            : (nombre.substring(0, 2)).toUpperCase();
                        profileAvatarInitials.textContent = initials || 'AD';
                    }

                    // Limpiar campos de contraseñas por seguridad
                    if (profileClaveActual) profileClaveActual.value = '';
                    if (profileNuevaClave) profileNuevaClave.value = '';
                    if (profileConfirmarClave) profileConfirmarClave.value = '';
                } else {
                    showProfileAlert(resData.message || 'Error al guardar los cambios.', 'error');
                }

            } catch (err) {
                console.error('[Devioz Admin] Error al guardar perfil:', err);
                showProfileAlert('Error de conexión al servidor al actualizar el perfil.', 'error');
            } finally {
                if (btnSaveProfile) {
                    btnSaveProfile.disabled = false;
                    if (btnSaveProfileText) btnSaveProfileText.textContent = originalBtnText;
                }
            }
        });
    }

    // ==========================================================
    // CONFIGURACIÓN DE CHATBOT IA & API KEY DE GEMINI (MODAL)
    // ==========================================================
    function initChatbotAdminConfig() {
        const btnOpen = document.getElementById('btnOpenChatbotModal');
        const modalEl = document.getElementById('chatbotConfigModal');
        if (!modalEl) return;

        function getModalInstance() {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                return bootstrap.Modal.getOrCreateInstance(modalEl);
            }
            return null;
        }

        const form = document.getElementById('chatbotConfigForm');
        const keyInput = document.getElementById('geminiApiKeyInput');
        const modelSelect = document.getElementById('geminiModelSelect');
        const btnToggleKey = document.getElementById('btnToggleGeminiKey');
        const btnSave = document.getElementById('btnSaveGeminiKey');
        const btnSaveText = document.getElementById('btnSaveGeminiKeyText');
        const btnRemove = document.getElementById('btnRemoveGeminiKey');
        const alertBox = document.getElementById('geminiConfigAlert');
        const statusIcon = document.getElementById('geminiStatusIcon');
        const statusTitle = document.getElementById('geminiStatusTitle');
        const statusDesc = document.getElementById('geminiStatusDesc');
        const statusBadge = document.getElementById('geminiStatusBadge');
        const indicatorDot = document.getElementById('chatbotKeyIndicatorDot');

        function getChatbotConfigEndpoint() {
            const port = window.location.port;
            const isLiveDev = (port === '5500' || port === '5501' || port === '3000' || port === '5173' || window.location.protocol === 'file:');
            const host = window.location.hostname || 'localhost';
            return isLiveDev 
                ? `http://${host}/portafolio-Devioz/backend/api/chatbot_config.php`
                : 'backend/api/chatbot_config.php';
        }

        function showConfigAlert(msg, type = 'success') {
            if (!alertBox) return;
            alertBox.className = `alert alert-${type === 'success' ? 'success' : 'danger'} py-2 px-3 mb-0 small`;
            alertBox.textContent = msg;
            alertBox.classList.remove('d-none');
        }

        function hideConfigAlert() {
            if (alertBox) alertBox.classList.add('d-none');
        }

        async function fetchChatbotConfigStatus() {
            try {
                const adminUser = encodeURIComponent(localStorage.getItem('devioz_admin_user') || 'admin');
                const endpoint = `${getChatbotConfigEndpoint()}?admin_token=devioz_admin_${adminUser}`;
                const res = await fetch(endpoint, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 
                        'Accept': 'application/json',
                        'Authorization': `Bearer devioz_admin_${adminUser}`,
                        'X-Admin-Token': `devioz_admin_${adminUser}`
                    }
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.status === 'success') {
                    updateStatusUI(data);
                }
            } catch (err) {
                console.error('[Devioz Admin] Error consultando estado de Gemini:', err);
            }
        }

        function updateStatusUI(data) {
            const isConfigured = Boolean(data.configured);
            if (indicatorDot) {
                if (isConfigured) {
                    indicatorDot.classList.remove('d-none');
                } else {
                    indicatorDot.classList.add('d-none');
                }
            }

            if (statusTitle && statusDesc && statusBadge) {
                if (isConfigured) {
                    if (statusIcon) statusIcon.textContent = '✅';
                    statusTitle.textContent = 'Google Gemini Activo';
                    statusDesc.textContent = `Clave: ${data.masked_key || '••••••••'} | Modelo: ${data.model || 'gemini-2.5-flash'}`;
                    statusBadge.textContent = 'Conectado';
                    statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
                    statusBadge.style.color = '#34d399';
                    statusBadge.style.border = '1px solid rgba(16, 185, 129, 0.4)';
                    if (btnRemove) btnRemove.classList.remove('d-none');
                } else {
                    if (statusIcon) statusIcon.textContent = '⚡';
                    statusTitle.textContent = 'Modo Respaldo Inteligente';
                    statusDesc.textContent = 'El chatbot responde consultas con su base interna (sin API Key de Gemini)';
                    statusBadge.textContent = 'Respaldo';
                    statusBadge.style.background = 'rgba(234, 179, 8, 0.15)';
                    statusBadge.style.color = '#facc15';
                    statusBadge.style.border = '1px solid rgba(234, 179, 8, 0.3)';
                    if (btnRemove) btnRemove.classList.add('d-none');
                }
            }

            if (modelSelect && data.model) {
                modelSelect.value = data.model;
            }
        }

        // Listener nativo de Bootstrap cuando el modal se abre
        modalEl.addEventListener('show.bs.modal', () => {
            hideConfigAlert();
            if (keyInput) keyInput.value = '';
            fetchChatbotConfigStatus();
        });

        // Soporte adicional por clic en el botón con fallback garantizado
        if (btnOpen) {
            btnOpen.addEventListener('click', (e) => {
                hideConfigAlert();
                if (keyInput) keyInput.value = '';
                fetchChatbotConfigStatus();

                const m = getModalInstance();
                if (m) {
                    m.show();
                } else {
                    // Fallback visual si Bootstrap JS fallase
                    modalEl.classList.add('show');
                    modalEl.style.display = 'block';
                    modalEl.removeAttribute('aria-hidden');
                    let backdrop = document.getElementById('chatbotConfigBackdrop');
                    if (!backdrop) {
                        backdrop = document.createElement('div');
                        backdrop.id = 'chatbotConfigBackdrop';
                        backdrop.className = 'modal-backdrop fade show';
                        document.body.appendChild(backdrop);
                    }
                }
            });
        }

        // Soporte de cierre para botones data-bs-dismiss
        modalEl.querySelectorAll('[data-bs-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const m = getModalInstance();
                if (m) m.hide();
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                modalEl.setAttribute('aria-hidden', 'true');
                const backdrop = document.getElementById('chatbotConfigBackdrop');
                if (backdrop) backdrop.remove();
            });
        });

        if (btnToggleKey && keyInput) {
            btnToggleKey.addEventListener('click', () => {
                const isPass = keyInput.type === 'password';
                keyInput.type = isPass ? 'text' : 'password';
                btnToggleKey.textContent = isPass ? '🔒' : '👁️';
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                hideConfigAlert();

                const key = keyInput ? keyInput.value.trim() : '';
                const model = modelSelect ? modelSelect.value : 'gemini-2.5-flash';

                if (!key) {
                    showConfigAlert('Por favor, ingresa una API Key de Google Gemini.', 'error');
                    if (keyInput) keyInput.focus();
                    return;
                }

                if (btnSave) btnSave.disabled = true;
                if (btnSaveText) btnSaveText.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Verificando...';

                try {
                    const adminUser = encodeURIComponent(localStorage.getItem('devioz_admin_user') || 'admin');
                    const endpoint = `${getChatbotConfigEndpoint()}?admin_token=devioz_admin_${adminUser}`;

                    const res = await fetch(endpoint, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer devioz_admin_${adminUser}`,
                            'X-Admin-Token': `devioz_admin_${adminUser}`
                        },
                        body: JSON.stringify({
                            action: 'save',
                            api_key: key,
                            model: model,
                            admin_token: `devioz_admin_${adminUser}`
                        })
                    });

                    const resData = await res.json();

                    if (res.ok && resData.status === 'success') {
                        showConfigAlert(resData.message || 'API Key guardada exitosamente.', 'success');
                        updateStatusUI(resData);
                        if (keyInput) keyInput.value = '';
                        if (typeof showAdminToast === 'function') {
                            showAdminToast('¡Chatbot potenciado con Google Gemini!', 'success');
                        }
                        setTimeout(() => {
                            const m = getModalInstance();
                            if (m) m.hide();
                            modalEl.classList.remove('show');
                            modalEl.style.display = 'none';
                            const backdrop = document.getElementById('chatbotConfigBackdrop');
                            if (backdrop) backdrop.remove();
                        }, 1200);
                    } else {
                        showConfigAlert(resData.message || 'La API Key fue rechazada.', 'error');
                    }
                } catch (err) {
                    console.error('[Devioz Admin] Error al guardar API Key:', err);
                    showConfigAlert('Error de conexión al servidor al guardar la clave.', 'error');
                } finally {
                    if (btnSave) btnSave.disabled = false;
                    if (btnSaveText) btnSaveText.textContent = 'Guardar API Key';
                }
            });
        }

        if (btnRemove) {
            btnRemove.addEventListener('click', async () => {
                if (!confirm('¿Deseas desvincular la API Key de Gemini? El chatbot volverá al modo de respuesta inteligente de respaldo.')) {
                    return;
                }

                hideConfigAlert();
                try {
                    const adminUser = encodeURIComponent(localStorage.getItem('devioz_admin_user') || 'admin');
                    const endpoint = `${getChatbotConfigEndpoint()}?admin_token=devioz_admin_${adminUser}`;

                    const res = await fetch(endpoint, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer devioz_admin_${adminUser}`,
                            'X-Admin-Token': `devioz_admin_${adminUser}`
                        },
                        body: JSON.stringify({ 
                            action: 'remove',
                            admin_token: `devioz_admin_${adminUser}`
                        })
                    });

                    const resData = await res.json();
                    if (res.ok && resData.status === 'success') {
                        showConfigAlert(resData.message, 'success');
                        updateStatusUI({ configured: false });
                        if (keyInput) keyInput.value = '';
                        if (typeof showAdminToast === 'function') {
                            showAdminToast('API Key de Gemini removida.', 'info');
                        }
                    }
                } catch (err) {
                    showConfigAlert('Error al intentar desvincular la clave.', 'error');
                }
            });
        }

        // Consulta inicial silenciosa para el indicador visual
        fetchChatbotConfigStatus();
    }

    // ==========================================================
    // LIMPIEZA AUTOMÁTICA DE ALMACENAMIENTO (Archivos Huérfanos)
    // ==========================================================
    function initStorageCleanupAdmin() {
        const btnCleanStorage = document.getElementById('btnCleanStorage');
        if (!btnCleanStorage) return;

        btnCleanStorage.addEventListener('click', async function() {
            if (btnCleanStorage.disabled) return;

            const originalHtml = btnCleanStorage.innerHTML;
            btnCleanStorage.disabled = true;
            btnCleanStorage.style.opacity = '0.7';
            btnCleanStorage.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="width: 18px; height: 18px; border-width: 2px; color: #00e5d4;"></span>';

            try {
                const adminUser = localStorage.getItem('devioz_admin_user') || 'admin';
                const adminToken = 'devioz_admin_' + adminUser;
                const endpoint = `${getBackendProjectsEndpoint()}?action=limpiar_almacenamiento&admin_token=${encodeURIComponent(adminToken)}`;

                const response = await fetch(endpoint, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Admin-Token': adminToken,
                        'Authorization': `Bearer ${adminToken}`
                    }
                });

                const data = await response.json();
                if (response.ok && data.status === 'success') {
                    showAdminToast(data.message || 'Limpieza automática ejecutada correctamente.', 'success');
                } else {
                    showAdminToast(data.message || 'No se pudo completar la limpieza.', 'warning');
                }
            } catch (err) {
                console.error('[Devioz Admin] Error al ejecutar limpieza:', err);
                showAdminToast('Error de conexión al limpiar almacenamiento.', 'error');
            } finally {
                btnCleanStorage.disabled = false;
                btnCleanStorage.style.opacity = '1';
                btnCleanStorage.innerHTML = originalHtml;
            }
        });
    }

    // Inicializar configuración del Chatbot
    initChatbotAdminConfig();

    // Inicializar botón de Limpieza de Almacenamiento
    initStorageCleanupAdmin();

    // Carga inicial al cargar el DOM del admin (flujo continuo de todos los proyectos)
    if (projectsTableBody) {
        loadAdminProjects();
    }
});
