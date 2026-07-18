document.addEventListener('DOMContentLoaded', () => {

    // --- Name handle: fuzzy/glitch bursts at irregular intervals ---
    const handle = document.querySelector('.profile-handle');

    function triggerHandleGlitch() {
        if (!handle) return;

        handle.classList.add('glitch-active');
        const burstDuration = 120 + Math.random() * 260; // 120–380ms burst
        setTimeout(() => handle.classList.remove('glitch-active'), burstDuration);

        const nextDelay = 2500 + Math.random() * 4500; // next burst in 2.5–7s
        setTimeout(triggerHandleGlitch, nextDelay);
    }

    if (handle) {
        setTimeout(triggerHandleGlitch, 1200); // let the page settle first
    }


    // --- Background: occasional "signal drop" jolt on top of the ---
    // --- always-on scanline/vignette/noise layers from effects.css ---
    function triggerSignalDrop() {
        document.body.classList.add('tv-glitch-active');
        setTimeout(() => document.body.classList.remove('tv-glitch-active'), 200);

        const nextDelay = 4000 + Math.random() * 6000; // every 4–10s
        setTimeout(triggerSignalDrop, nextDelay);
    }

    setTimeout(triggerSignalDrop, 2000);
});
