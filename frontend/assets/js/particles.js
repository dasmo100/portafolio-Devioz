// =========================================
// Portafolio Devioz — particles.js
// Componente ParticleText (React Bits → Vanilla JS & HTML5 Canvas)
// =========================================

(function() {
    'use strict';

    let canvas = null;
    let ctx = null;
    let container = null;
    let particles = [];
    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const mouse = {
        x: -9999,
        y: -9999,
        hover: false
    };

    // Parámetros de configuración del componente React Bits
    const CONFIG = {
        text: 'Devioz',
        density: 4,          // Saltar cada 4 píxeles en el scan de ImageData
        particleSize: 2.0,   // Radio de partícula (~4px diámetro visible con glow)
        idleDrift: 0.7,      // Amplitud de flotación orgánica en reposo
        scatter: 165,        // Dispersión inicial armónica (sin recortar bordes)
        duration: 1500,      // Duración de la agrupación en ms
        stagger: 360,        // Retraso escalonado en ms
        repelRadius: 130,    // Radio de repulsión del cursor en px
        pointerRepel: 42,    // Fuerza de repulsión
        baseColor: '#ffffff',
        highlightColor: '#00e5d4',
        shadowColor: '#00b4a7',
        shadowBlur: 14
    };

    // Calcula el tamaño tipográfico armónico y responsivo
    function getResponsiveFontSize(canvasWidth) {
        const minSize = 60;
        const maxSize = 165;
        const vwSize = canvasWidth * 0.135;
        return Math.round(Math.max(minSize, Math.min(maxSize, vwSize)));
    }

    // Curva de aceleración/desaceleración cubic out
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Inicializa o recrea el arreglo de partículas leyendo los píxeles del texto
    function createParticles() {
        if (!ctx || width === 0 || height === 0) return;

        // Canvas auxiliar offscreen para rasterizar el texto
        const offscreen = document.createElement('canvas');
        offscreen.width = Math.round(width);
        offscreen.height = Math.round(height);
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!offCtx) return;

        const fontSize = getResponsiveFontSize(width);

        offCtx.clearRect(0, 0, width, height);
        // Tipografía elegante ultra-bold
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
                    // Dispersión radial suave (potencia 0.75 para nube orgánica sin cortes rectangulares)
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.pow(Math.random(), 0.75) * CONFIG.scatter;
                    const startX = x + Math.cos(angle) * dist;
                    const startY = y + Math.sin(angle) * dist;

                    // Asignación de color: resaltado cian/verde azulado (#00e5d4), menta (#2dd4bf) y base blanco (#ffffff)
                    const rand = Math.random();
                    let color;
                    if (rand < 0.65) {
                        color = CONFIG.highlightColor;
                    } else if (rand < 0.85) {
                        color = '#2dd4bf'; // Tono menta/verde azulado
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

    // Ajusta las dimensiones del canvas según el contenedor físico
    function resize() {
        if (!container || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        width = rect.width;
        height = rect.height;

        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        createParticles();
    }

    // Bucle de animación y física
    function animate(currentTime) {
        animationFrameId = requestAnimationFrame(animate);

        // Si el contenedor está oculto (Hero inactivo), pausar procesamiento
        if (!container || container.offsetParent === null) {
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // Configuración del resplandor glow
        ctx.shadowBlur = CONFIG.shadowBlur;
        ctx.shadowColor = CONFIG.shadowColor;

        const repelRadiusSq = CONFIG.repelRadius * CONFIG.repelRadius;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            let alpha = 1;

            if (!p.isGathered) {
                // Animación de entrada escalonada (scatter -> gather)
                if (currentTime < p.startTime) {
                    p.x = p.originX;
                    p.y = p.originY;
                    const elapsedSinceSpawn = Math.max(0, currentTime - p.spawnTime);
                    alpha = Math.min(elapsedSinceSpawn / 220, 1) * 0.85;
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
                // Movimiento flotante orgánico (idleDrift)
                p.idleAngle += p.idleSpeed;
                const homeX = p.targetX + Math.cos(p.idleAngle) * p.idleRadius;
                const homeY = p.targetY + Math.sin(p.idleAngle) * p.idleRadius;

                // Interacción de repulsión con el cursor (hover)
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

                // Resorte amortiguado hacia su posición de reposo
                const ax = (homeX - p.x) * 0.08;
                const ay = (homeY - p.y) * 0.08;

                p.vx += ax;
                p.vy += ay;
                p.vx *= 0.82; // Fricción
                p.vy *= 0.82;

                p.x += p.vx;
                p.y += p.vy;
            }

            // Renderizado de la partícula con transparencia suave
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    // Inicialización del sistema
    function init() {
        container = document.getElementById('particleTextContainer');
        canvas = document.getElementById('particleTextCanvas');
        if (!container || !canvas) return;

        ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Seguimiento del cursor global para no interferir con clicks de botones
        window.addEventListener('mousemove', function(e) {
            if (!canvas || !container || container.offsetParent === null) return;
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            if (mx >= 0 && mx <= rect.width && my >= 0 && my <= rect.height) {
                mouse.x = mx;
                mouse.y = my;
                mouse.hover = true;
            } else {
                mouse.hover = false;
            }
        }, { passive: true });

        window.addEventListener('mouseleave', function() {
            mouse.hover = false;
        });

        window.addEventListener('touchmove', function(e) {
            if (!canvas || !container || container.offsetParent === null) return;
            if (e.touches.length > 0) {
                const rect = canvas.getBoundingClientRect();
                const tx = e.touches[0].clientX - rect.left;
                const ty = e.touches[0].clientY - rect.top;
                if (tx >= 0 && tx <= rect.width && ty >= 0 && ty <= rect.height) {
                    mouse.x = tx;
                    mouse.y = ty;
                    mouse.hover = true;
                } else {
                    mouse.hover = false;
                }
            }
        }, { passive: true });

        window.addEventListener('touchend', function() {
            mouse.hover = false;
        });

        let resizeTimer = null;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 120);
        }, { passive: true });

        // Ajuste inicial
        resize();

        // En caso de que las fuentes del sistema/navegador terminen de cargar
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function() {
                resize();
            });
        }

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animate);
    }

    // Función pública para reiniciar la animación de ensamble
    window.resetParticleText = function() {
        if (!canvas || !container) return;
        createParticles();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
