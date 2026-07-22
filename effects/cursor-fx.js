/* ============================================================
   cursor-fx.js
   Firework-style particle trail that follows the mouse. Runs on
   a full-screen canvas layered above the page (pointer-events:
   none, so it never blocks clicks/drags on real UI elements).
   Self-contained — safe to remove by deleting this file and its
   <script> tag in index.html.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-fx-canvas';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '10000' // above content, above the click-to-enter overlay too
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Firework spark palette — warm + neon accent mix
    const sparkColors = ['#ff5e5e', '#ffd93d', '#00ff96', '#00e5ff', '#ff8dfa'];

    let particles = [];
    let lastX = null, lastY = null;

    function spawnBurst(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02 + Math.random() * 0.025,
                size: 1.5 + Math.random() * 2,
                color: sparkColors[Math.floor(Math.random() * sparkColors.length)]
            });
        }
    }

    // Spawn sparks proportional to how fast the mouse is moving —
    // a still cursor produces nothing, a fast swipe produces a burst.
    document.addEventListener('mousemove', (e) => {
        if (lastX !== null) {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const count = Math.min(Math.floor(dist / 4), 6);
            if (count > 0) spawnBurst(e.clientX, e.clientY, count);
        }
        lastX = e.clientX;
        lastY = e.clientY;
    });

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter'; // additive glow where sparks overlap

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.03; // gentle gravity, like real firework sparks falling
            p.vx *= 0.98; // air drag
            p.life -= p.decay;

            if (p.life > 0) {
                ctx.globalAlpha = Math.max(p.life, 0);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        });

        particles = particles.filter(p => p.life > 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        requestAnimationFrame(tick);
    }
    tick();
});
