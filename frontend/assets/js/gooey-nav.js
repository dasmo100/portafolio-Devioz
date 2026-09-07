// =========================================
// Portafolio Devioz — gooey-nav.js
// Componente GooeyNav (React Bits → Vanilla JS)
// =========================================

(function() {
    'use strict';

    // Configuración del componente GooeyNav
    const CONFIG = {
        animationTime: 600,
        particleCount: 15,
        particleDistances: [90, 10],
        particleR: 100,
        timeVariance: 300,
        colors: [1, 2, 3, 1, 2, 3, 1, 4]
    };

    // Funciones matemáticas de ruido y dispersión polar
    const noise = (n = 1) => n / 2 - Math.random() * n;

    const getXY = (distance, pointIndex, totalPoints) => {
        const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
        return [distance * Math.cos(angle), distance * Math.sin(angle)];
    };

    const createParticle = (i, t, d, r) => {
        let rotate = noise(r / 10);
        return {
            start: getXY(d[0], CONFIG.particleCount - i, CONFIG.particleCount),
            end: getXY(d[1] + noise(7), CONFIG.particleCount - i, CONFIG.particleCount),
            time: t,
            scale: 1 + noise(0.2),
            color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
            rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
        };
    };

    // Generador dinámico de partículas con efecto de chicle (gooey)
    const makeParticles = element => {
        const d = CONFIG.particleDistances;
        const r = CONFIG.particleR;
        const bubbleTime = CONFIG.animationTime * 2 + CONFIG.timeVariance;
        element.style.setProperty('--time', `${bubbleTime}ms`);

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const t = CONFIG.animationTime * 2 + noise(CONFIG.timeVariance * 2);
            const p = createParticle(i, t, d, r);
            element.classList.remove('active');

            setTimeout(() => {
                const particle = document.createElement('span');
                const point = document.createElement('span');
                particle.classList.add('particle');
                particle.style.setProperty('--start-x', `${p.start[0]}px`);
                particle.style.setProperty('--start-y', `${p.start[1]}px`);
                particle.style.setProperty('--end-x', `${p.end[0]}px`);
                particle.style.setProperty('--end-y', `${p.end[1]}px`);
                particle.style.setProperty('--time', `${p.time}ms`);
                particle.style.setProperty('--scale', `${p.scale}`);
                particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
                particle.style.setProperty('--rotate', `${p.rotate}deg`);

                point.classList.add('point');
                particle.appendChild(point);
                element.appendChild(particle);

                requestAnimationFrame(() => {
                    element.classList.add('active');
                });

                setTimeout(() => {
                    try {
                        if (particle.parentNode === element) {
                            element.removeChild(particle);
                        }
                    } catch (err) {
                        // Silenciar error si ya fue removido
                    }
                }, t);
            }, 30);
        }
    };

    function initGooeyNav() {
        const container = document.getElementById('gooeyNavContainer');
        const list = document.getElementById('gooeyNavList');
        const filterEl = document.getElementById('gooeyFilter');
        const textEl = document.getElementById('gooeyText');

        if (!container || !list || !filterEl || !textEl) return;

        const items = list.querySelectorAll('li');
        if (!items.length) return;

        // Recalcular posición y dimensiones del efecto según el <li> activo
        function updateEffectPosition(liEl) {
            if (!container || !filterEl || !textEl || !liEl) return;
            const containerRect = container.getBoundingClientRect();
            const pos = liEl.getBoundingClientRect();

            const styles = {
                left: `${pos.x - containerRect.x}px`,
                top: `${pos.y - containerRect.y}px`,
                width: `${pos.width}px`,
                height: `${pos.height}px`
            };

            Object.assign(filterEl.style, styles);
            Object.assign(textEl.style, styles);

            const anchor = liEl.querySelector('a');
            textEl.innerText = anchor ? anchor.innerText : liEl.innerText;
        }

        // Actualizar opción activa y disparar partículas
        function setActiveItem(liEl, triggerParticles = true) {
            const currentActive = list.querySelector('li.active');
            if (currentActive === liEl && filterEl.classList.contains('active')) return;

            items.forEach(item => item.classList.remove('active'));
            liEl.classList.add('active');

            updateEffectPosition(liEl);

            // Eliminar partículas existentes
            const existingParticles = filterEl.querySelectorAll('.particle');
            existingParticles.forEach(p => p.remove());

            // Efecto sobre el texto superpuesto
            textEl.classList.remove('active');
            void textEl.offsetWidth; // Forzar reflow
            textEl.classList.add('active');

            if (triggerParticles) {
                makeParticles(filterEl);
            }
        }

        // Listener de clic sobre cada <li>
        items.forEach(li => {
            li.addEventListener('click', function(e) {
                const link = this.querySelector('a');
                const href = link ? link.getAttribute('href') : null;

                setActiveItem(this, true);

                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    if (href === '#inicio' || href === '#') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (window.resetParticleText) {
                            window.resetParticleText();
                        }
                    } else {
                        const target = document.querySelector(href) || document.getElementById(href.replace('#', ''));
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }
            });
        });

        // Inicialización inicial
        const initialActive = list.querySelector('li.active') || items[0];
        if (initialActive) {
            initialActive.classList.add('active');
            updateEffectPosition(initialActive);
            textEl.classList.add('active');
        }

        // ResizeObserver para mantener la posición perfecta ante cambios de pantalla
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                const activeLi = list.querySelector('li.active') || items[0];
                if (activeLi) {
                    updateEffectPosition(activeLi);
                }
            });
            ro.observe(container);
        } else {
            window.addEventListener('resize', () => {
                const activeLi = list.querySelector('li.active') || items[0];
                if (activeLi) {
                    updateEffectPosition(activeLi);
                }
            }, { passive: true });
        }

        // Sincronización suave con el desplazamiento de la página (ScrollSpy)
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const scrollPos = window.scrollY + 220;
                const spiralSec = document.getElementById('spiral-showcase');
                const projectsSec = document.getElementById('galeria-proyectos');

                let targetHref = '#inicio';
                if (projectsSec && scrollPos >= projectsSec.offsetTop) {
                    targetHref = '#proyectos';
                } else if (spiralSec && scrollPos >= spiralSec.offsetTop) {
                    targetHref = '#destacados';
                }

                const matchingLi = Array.from(items).find(li => {
                    const a = li.querySelector('a');
                    return a && a.getAttribute('href') === targetHref;
                });

                if (matchingLi && !matchingLi.classList.contains('active')) {
                    setActiveItem(matchingLi, true);
                }
            }, 90);
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGooeyNav);
    } else {
        initGooeyNav();
    }
})();
