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
        loginForm.addEventListener('submit', function(e) {
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

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Ingresando...';
            }

            setTimeout(function() {
                localStorage.setItem('devioz_admin_auth', 'true');
                window.location.href = 'admin.html';
            }, 600);
        });
    }

    // ==========================================================
    // 2. OPTIONWHEEL (adminCategoryWheel)
    // ==========================================================
    const container = document.getElementById('adminCategoryWheel');
    if (container) {
        const items = ['Diseño Gráfico', 'Spots Publicitarios', 'Business Intelligence', 'Desarrollo Web', 'IA'];
        
        // Configuración física
        const cfg = {
            fontSize: 1.85, spacing: 1.6, curve: 1, tilt: 6, blur: 2, fade: 0.25,
            minOpacity: 0.05, smoothing: 200, rowH: 0
        };
        
        // Estado
        let pos = 2; // Índice inicial por defecto
        let target = 2;
        let selectedIndex = 2;
        let lastTime = performance.now();
        let rafId = null;
        let itemEls = [];
        
        // Inicializar DOM
        const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        cfg.rowH = Math.max(cfg.fontSize * cfg.spacing * remPx, 1);
        
        items.forEach((label, i) => {
            const el = document.createElement('div');
            el.className = 'option-wheel__item';
            if (i === selectedIndex) el.classList.add('option-wheel__item--selected');
            el.textContent = label;
            el.addEventListener('click', () => applyTarget(i, true));
            container.appendChild(el);
            itemEls.push(el);
        });

        // Bucle de renderizado matemático (Física)
        function runFrame(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            const tau = Math.max(cfg.smoothing, 1) / 1000;
            const k = 1 - Math.exp(-dt / tau);

            let next = pos + (target - pos) * k;
            const settled = Math.abs(target - next) < 0.001;
            if (settled) next = target;
            pos = next;

            const tiltRad = (cfg.tilt * Math.PI) / 180;
            const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

            itemEls.forEach((el, i) => {
                const dist = Math.abs(i - next);
                let x = 0, y = (i - next) * cfg.rowH, rot = 0;
                
                if (R > 0) {
                    const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, (i - next) * tiltRad));
                    y = R * Math.sin(ang);
                    x = -R * (1 - Math.cos(ang)) * cfg.curve;
                    rot = (ang * 180) / Math.PI;
                }
                
                el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
                el.style.opacity = Math.max(cfg.minOpacity, 1 - dist * cfg.fade);
                el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
                el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
            });

            rafId = settled ? null : requestAnimationFrame(runFrame);
        }

        function applyTarget(val, snap) {
            let v = Math.min(Math.max(val, 0), items.length - 1);
            if (snap) v = Math.round(v);
            target = v;
            
            const idx = Math.round(v);
            if (idx !== selectedIndex) {
                itemEls[selectedIndex]?.classList.remove('option-wheel__item--selected');
                selectedIndex = idx;
                itemEls[selectedIndex]?.classList.add('option-wheel__item--selected');
                console.log('Categoría seleccionada:', items[idx]);
                // Disparar el filtrado de la tabla de proyectos
                filterProjectsByCategoryName(items[idx]);
            }
            
            if (!rafId) {
                lastTime = performance.now();
                rafId = requestAnimationFrame(runFrame);
            }
        }

        // Eventos de arrastre y Scroll
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const step = Math.max(-1, Math.min(1, e.deltaY / cfg.rowH));
            applyTarget(target + step, false);
            clearTimeout(container.wheelTimer);
            container.wheelTimer = setTimeout(() => applyTarget(target, true), 140);
        }, { passive: false });

        let drag = null;
        container.addEventListener('pointerdown', (e) => {
            drag = { y: e.clientY, start: target, id: e.pointerId, moved: false };
            container.classList.add('option-wheel--dragging');
        });
        
        window.addEventListener('pointermove', (e) => {
            if (!drag) return;
            const dy = e.clientY - drag.y;
            if (Math.abs(dy) > 4) drag.moved = true;
            if (drag.moved) applyTarget(drag.start - dy / cfg.rowH, false);
        });
        
        window.addEventListener('pointerup', () => {
            if (!drag) return;
            if (drag.moved) applyTarget(target, true);
            drag = null;
            container.classList.remove('option-wheel--dragging');
        });

        applyTarget(target, true);
    }

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
            let height = 150;
            let dpr = 1;

            const mouse = { x: -9999, y: -9999, hover: false };

            const CONFIG = {
                text: 'Devioz Admin',
                density: 3,         // Muestreo nítido de píxeles
                particleSize: 1.6,  // Tamaño de punto proporcionado a 150px
                scatter: 70,        // Dispersión dentro de los límites de 150px (sin recortar)
                duration: 1300,
                stagger: 300,
                idleDrift: 0.5,
                repelRadius: 90,
                pointerRepel: 30,
                baseColor: '#ffffff',
                highlightColor: '#00e5d4',
                shadowColor: '#00b4a7',
                shadowBlur: 10
            };

            function getFontSize(w) {
                // clamp(2rem, 5vw, 4rem) emulado en píxeles (32px a 56px)
                const min = 32;
                const max = 56;
                const calc = w * 0.045;
                return Math.round(Math.max(min, Math.min(max, calc)));
            }

            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            function createAdminParticles() {
                if (!ctx || width === 0 || height === 0) return;

                const offscreen = document.createElement('canvas');
                offscreen.width = Math.round(width);
                offscreen.height = Math.round(height);
                const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
                if (!offCtx) return;

                const fontSize = getFontSize(width);

                offCtx.clearRect(0, 0, width, height);
                offCtx.font = `800 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
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

                particles = [];
                const now = performance.now();

                for (let y = 0; y < height; y += CONFIG.density) {
                    for (let x = 0; x < width; x += CONFIG.density) {
                        const alpha = imgData[(y * width + x) * 4 + 3];
                        if (alpha > 120) {
                            const angle = Math.random() * Math.PI * 2;
                            const dist = Math.pow(Math.random(), 0.75) * CONFIG.scatter;
                            const startX = x + Math.cos(angle) * dist;
                            const startY = y + Math.sin(angle) * dist;

                            const rand = Math.random();
                            let color;
                            if (rand < 0.6) {
                                color = CONFIG.highlightColor;
                            } else if (rand < 0.8) {
                                color = '#5eead4';
                            } else {
                                color = CONFIG.baseColor;
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
                if (rect.width === 0) return;

                width = rect.width;
                height = 150;

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
                ctx.shadowBlur = CONFIG.shadowBlur;
                ctx.shadowColor = CONFIG.shadowColor;

                const repelRadiusSq = CONFIG.repelRadius * CONFIG.repelRadius;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    let alpha = 1;

                    if (!p.isGathered) {
                        if (currentTime < p.startTime) {
                            p.x = p.originX;
                            p.y = p.originY;
                            const timeSinceSpawn = Math.max(0, currentTime - p.spawnTime);
                            alpha = Math.min(timeSinceSpawn / 200, 1) * 0.85;
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
    const btnShowAllProjects = document.getElementById('btnShowAllProjects');
    const btnLogout = document.getElementById('btnLogout');
    const projectForm = document.getElementById('projectForm');
    const projectModalEl = document.getElementById('projectModal');
    let projectModal = null;

    if (typeof bootstrap !== 'undefined' && projectModalEl) {
        projectModal = new bootstrap.Modal(projectModalEl);
    }

    // Cerrar sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('devioz_admin_auth');
            window.location.href = 'login.html';
        });
    }

    const CATEGORY_SLUGS = {
        'Diseño Gráfico': 'diseno-grafico',
        'Spots Publicitarios': 'spots-publicitarios',
        'Business Intelligence': 'business-intelligence',
        'Desarrollo Web': 'desarrollo-web',
        'IA': 'inteligencia-artificial',
        'Inteligencia Artificial': 'inteligencia-artificial'
    };

    function filterProjectsByCategoryName(name) {
        const slug = CATEGORY_SLUGS[name] || '';
        filterProjectsByCategory({ name: name, id: slug });
    }

    // Filtra la tabla de proyectos según la categoría activa de la ruleta
    function filterProjectsByCategory(cat) {
        if (!projectsTableBody) return;

        const rows = projectsTableBody.querySelectorAll('tr[data-category]');
        let matchCount = 0;

        rows.forEach(row => {
            const rowCat = row.getAttribute('data-category');
            if (!cat || cat.id === 'all' || rowCat === cat.id) {
                row.style.display = '';
                matchCount++;
            } else {
                row.style.display = 'none';
            }
        });

        if (currentCategoryTitle) {
            currentCategoryTitle.textContent = cat ? cat.name : 'Todos los Proyectos';
        }
        if (currentCategoryDesc) {
            currentCategoryDesc.textContent = cat 
                ? `Mostrando proyectos correspondientes a "${cat.name}".`
                : 'Usa la ruleta 3D para filtrar o administra el catálogo completo.';
        }
        if (projectCountBadge) {
            projectCountBadge.textContent = `${matchCount} ${matchCount === 1 ? 'proyecto' : 'proyectos'}`;
        }
        if (btnShowAllProjects) {
            btnShowAllProjects.classList.remove('d-none');
        }
    }

    // Botón "Mostrar Todos"
    if (btnShowAllProjects) {
        btnShowAllProjects.addEventListener('click', function() {
            filterProjectsByCategory(null);
            btnShowAllProjects.classList.add('d-none');
        });
    }

    // Mapeo de badges para creación/edición
    const CATEGORY_MAP = {
        'desarrollo-web': { label: '🌐 Desarrollo Web', bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
        'diseno-grafico': { label: '🎨 Diseño Gráfico', bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
        'spots-publicitarios': { label: '🎬 Spots Publicitarios', bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: 'rgba(234, 179, 8, 0.3)' },
        'business-intelligence': { label: '📊 Business Intelligence', bg: 'rgba(34, 197, 94, 0.15)', color: '#86efac', border: 'rgba(34, 197, 94, 0.3)' },
        'inteligencia-artificial': { label: '🤖 Inteligencia Artificial', bg: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', border: 'rgba(168, 85, 247, 0.3)' }
    };

    // Guardar o Editar Proyecto (Modal Form)
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const idInput = document.getElementById('projectId');
            const titleInput = document.getElementById('projectTitle');
            const catInput = document.getElementById('projectCategory');
            const imgInput = document.getElementById('projectImg');
            const techInput = document.getElementById('projectTech');

            const id = idInput ? idInput.value : '';
            const title = titleInput.value.trim();
            const catKey = catInput.value;
            const img = imgInput.value.trim();
            const tech = techInput.value.trim();

            const catInfo = CATEGORY_MAP[catKey] || { label: catKey, bg: 'rgba(255,255,255,0.1)', color: '#ffffff', border: 'rgba(255,255,255,0.2)' };

            if (id) {
                const existingRow = projectsTableBody.querySelector(`tr[data-id="${id}"]`);
                if (existingRow) {
                    existingRow.setAttribute('data-category', catKey);
                    existingRow.querySelector('.admin-thumb-img').src = img;
                    existingRow.querySelector('.fw-semibold.text-white').textContent = title;
                    existingRow.querySelector('.small.text-secondary').textContent = tech || 'General';
                    const badge = existingRow.querySelector('td:nth-child(4) .badge');
                    if (badge) {
                        badge.textContent = catInfo.label;
                        badge.style.background = catInfo.bg;
                        badge.style.color = catInfo.color;
                        badge.style.borderColor = catInfo.border;
                    }
                }
            } else {
                const nextId = projectsTableBody.children.length + 1;
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-id', nextId);
                newRow.setAttribute('data-category', catKey);
                newRow.innerHTML = `
                    <td class="text-secondary fw-semibold">#${nextId}</td>
                    <td>
                        <img src="${img}" alt="${title}" class="admin-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80'">
                    </td>
                    <td>
                        <span class="fw-semibold text-white d-block">${title}</span>
                        <span class="small text-secondary" style="color: #94a3b8 !important;">${tech || 'General'}</span>
                    </td>
                    <td>
                        <span class="badge" style="background: ${catInfo.bg}; color: ${catInfo.color}; border: 1px solid ${catInfo.border}; font-weight: 500; font-size: 0.78rem; padding: 5px 12px; border-radius: 20px;">
                            ${catInfo.label}
                        </span>
                    </td>
                    <td class="text-end">
                        <div class="d-inline-flex gap-2">
                            <button type="button" class="btn-action btn-action-edit" title="Editar" data-id="${nextId}">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button type="button" class="btn-action btn-action-delete" title="Eliminar" data-id="${nextId}">
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
                projectsTableBody.prepend(newRow);
            }

            projectForm.reset();
            if (idInput) idInput.value = '';
            if (projectModal) projectModal.hide();
        });
    }

    // Acciones de Editar y Eliminar
    if (projectsTableBody) {
        projectsTableBody.addEventListener('click', function(e) {
            const deleteBtn = e.target.closest('.btn-action-delete');
            const editBtn = e.target.closest('.btn-action-edit');

            if (deleteBtn) {
                const row = deleteBtn.closest('tr');
                if (row && confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
                    row.style.opacity = '0';
                    row.style.transform = 'scale(0.95)';
                    row.style.transition = 'all 0.3s ease';
                    setTimeout(function() { row.remove(); }, 300);
                }
            } else if (editBtn) {
                const row = editBtn.closest('tr');
                if (!row) return;

                const id = row.getAttribute('data-id');
                const title = row.querySelector('.fw-semibold.text-white').textContent;
                const tech = row.querySelector('.small.text-secondary').textContent;
                const imgSrc = row.querySelector('.admin-thumb-img').src;
                const catKey = row.getAttribute('data-category');

                const modalTitle = document.getElementById('projectModalLabel');
                const idInput = document.getElementById('projectId');
                const titleInput = document.getElementById('projectTitle');
                const catInput = document.getElementById('projectCategory');
                const imgInput = document.getElementById('projectImg');
                const techInput = document.getElementById('projectTech');

                if (modalTitle) modalTitle.textContent = 'Editar Proyecto #' + id;
                if (idInput) idInput.value = id;
                if (titleInput) titleInput.value = title;
                if (catInput && catKey) catInput.value = catKey;
                if (imgInput) imgInput.value = imgSrc;
                if (techInput) techInput.value = tech;

                if (projectModal) projectModal.show();
            }
        });
    }

    // Botón "+ Nuevo Proyecto"
    const btnNewProject = document.getElementById('btnNewProject');
    if (btnNewProject) {
        btnNewProject.addEventListener('click', function() {
            const modalTitle = document.getElementById('projectModalLabel');
            const idInput = document.getElementById('projectId');
            if (modalTitle) modalTitle.textContent = 'Nuevo Proyecto';
            if (idInput) idInput.value = '';
            if (projectForm) projectForm.reset();
        });
    }
});
