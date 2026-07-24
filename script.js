document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Typewriter Customization Module ---
    const identityStrings = ["connect with me:", "math student", "knows nothing", "welcome to my space", "background: Look Back (2024)"];
    let phraseIdx = 0, characterIdx = 0, deleteStateActive = false;
    const targetOutputNode = document.getElementById('typewriter-target');

    function processTypewriterExecution() {
        const structuralPhrase = identityStrings[phraseIdx];
        
        if (deleteStateActive) {
            targetOutputNode.textContent = structuralPhrase.substring(0, characterIdx - 1);
            characterIdx--;
        } else {
            targetOutputNode.textContent = structuralPhrase.substring(0, characterIdx + 1);
            characterIdx++;
        }

        let standardDelayPace = deleteStateActive ? 35 : 80;

        if (!deleteStateActive && characterIdx === structuralPhrase.length) {
            standardDelayPace = 2000;
            deleteStateActive = true;
        } else if (deleteStateActive && characterIdx === 0) {
            deleteStateActive = false;
            phraseIdx = (phraseIdx + 1) % identityStrings.length;
            standardDelayPace = 350;
        }

        setTimeout(processTypewriterExecution, standardDelayPace);
    }
    if (targetOutputNode) processTypewriterExecution();


    // --- 2. Interactive Media Pipeline Elements & Control Loops ---
    const mediaChannel = document.getElementById('bg-audio');
    const gatewayOverlay = document.getElementById('enter-overlay');
    const playToggleBtn = document.getElementById('widget-play-toggle');
    const scrubTimelineBar = document.getElementById('media-scrub-bar');
    const currentStampLabel = document.getElementById('track-time-current');
    const runtimeDurationLabel = document.getElementById('track-time-duration');
    const systemVolSlider = document.getElementById('volume-slider-node');
    const volumeIconToggle = document.getElementById('volume-icon-toggle');
    const metricsViewer = document.getElementById('view-count-mock');

    // Live View Counter via Cloudflare Worker & KV Storage 
    if (metricsViewer) {
        const isOwner = window.location.search.includes("dev=true");
        const alreadyCounted = localStorage.getItem("hasViewedBio") === "true";
        
        // Skip incrementing if: owner in dev mode, OR this browser already counted once
        const shouldSkip = isOwner || alreadyCounted;

        const targetApiUrl = shouldSkip
            ? 'https://icy-moon-eb52.lehuyme9.workers.dev?skip=true'
            : 'https://icy-moon-eb52.lehuyme9.workers.dev';

        fetch(targetApiUrl)
            .then(res => {
                if (!res.ok) throw new Error('Network response failure');
                return res.json();
            })
            .then(data => {
                metricsViewer.textContent = data.count.toLocaleString();
                // Mark this browser as having counted, so future reloads skip
                if (!isOwner) {
                    localStorage.setItem("hasViewedBio", "true");
                }
            })
            .catch(err => {
                console.error('View counter fetch failed:', err);
                metricsViewer.textContent = '—';
            });
    }

    // --- Bio Card Tilt Effect (mouse-follow parallax) ---
    const bioCard = document.querySelector('.primary-bio-card');
    if (bioCard && window.gsap) {
        const maxTilt = 8;

        bioCard.addEventListener('mousemove', (e) => {
            const rect = bioCard.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const tiltX = ((e.clientY - centerY) / rect.height) * maxTilt;
            const tiltY = -((e.clientX - centerX) / rect.width) * maxTilt;

            gsap.to(bioCard, {
                rotationX: tiltX,
                rotationY: tiltY,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: 800
            });
        });

        bioCard.addEventListener('mouseleave', () => {
            gsap.to(bioCard, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    }

    // Process structured time stamp string modifications cleanly
    function evaluateAudioTimestamp(totalSecondsValue) {
        if (isNaN(totalSecondsValue) || totalSecondsValue === Infinity) return "0:00";
        const totalMinutes = Math.floor(totalSecondsValue / 60);
        const remainingSeconds = Math.floor(totalSecondsValue % 60);
        return `${totalMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // Explicit function to safety-check and set track duration parameters
    let durationPollHandle = null;

    function syncTrackDurationMetadata() {
        if (mediaChannel && mediaChannel.duration && !isNaN(mediaChannel.duration) && mediaChannel.duration !== Infinity) {
            scrubTimelineBar.max = Math.floor(mediaChannel.duration);
            runtimeDurationLabel.textContent = evaluateAudioTimestamp(mediaChannel.duration);
            if (durationPollHandle) {
                clearInterval(durationPollHandle);
                durationPollHandle = null;
            }
            return true;
        }
        return false;
    }

    // Safety-net poller: covers the case where every metadata event fires
    // before our listeners attach (fast/cached load) or gets dropped by the
    // browser. Cheap, self-clearing the moment duration data is available.
    function ensureDurationSynced() {
        if (syncTrackDurationMetadata()) return;
        if (durationPollHandle) return;
        durationPollHandle = setInterval(() => {
            if (syncTrackDurationMetadata() || !mediaChannel) {
                clearInterval(durationPollHandle);
                durationPollHandle = null;
            }
        }, 200);
        setTimeout(() => {
            if (durationPollHandle) {
                clearInterval(durationPollHandle);
                durationPollHandle = null;
            }
        }, 5000);
    }

    // Toggle Play/Pause execution and UI mutations synchronously
    function triggerAudioChannelState() {
        if (!mediaChannel) return;

        if (mediaChannel.paused) {
            mediaChannel.play()
                .then(() => {
                    ensureDurationSynced();
                })
                .catch(err => console.warn("Sandbox audio initiation halted: ", err));
        } else {
            mediaChannel.pause();
        }
    }

    if (mediaChannel) {
        // Primary Entry Portal Gateway Event Handling Hook
        if (gatewayOverlay) {
            gatewayOverlay.addEventListener('click', () => {
                gatewayOverlay.classList.add('screen-hidden');
                ensureDurationSynced();
                mediaChannel.play()
                    .catch(error => console.warn("Pipeline initiation tracking context block:", error));
            });
        }

        // Track control button event mappings
        if (playToggleBtn) {
            playToggleBtn.addEventListener('click', triggerAudioChannelState);
        }

        // Icon state is derived from the element's own play/pause events,
        // not set manually — this way it stays correct no matter what
        // triggered playback (overlay click, button click, media keys, etc.)
        if (playToggleBtn) {
            mediaChannel.addEventListener('play', () => { playToggleBtn.textContent = "⏸"; });
            mediaChannel.addEventListener('pause', () => { playToggleBtn.textContent = "▶"; });
        }

        // Target track layout sync checkpoints — redundant on purpose.
        // Any one of these firing is enough to recover from a missed event.
        mediaChannel.addEventListener('loadedmetadata', ensureDurationSynced);
        mediaChannel.addEventListener('durationchange', ensureDurationSynced);
        mediaChannel.addEventListener('canplay', ensureDurationSynced);
        mediaChannel.addEventListener('canplaythrough', ensureDurationSynced);

        // Cover the case where the browser already had metadata ready
        // (cached file) before any of the above listeners were attached.
        if (mediaChannel.readyState >= 1) {
            ensureDurationSynced();
        }

        // Continuous timeline stream tracker execution updates
        mediaChannel.addEventListener('timeupdate', () => {
            // Only move slider if the user isn't actively dragging it
            if (scrubTimelineBar && !scrubTimelineBar.matches(':focus')) { 
                scrubTimelineBar.value = Math.floor(mediaChannel.currentTime);
            }
            if (currentStampLabel) {
                currentStampLabel.textContent = evaluateAudioTimestamp(mediaChannel.currentTime);
            }
            
            // Fallback safety logic: Force track sync if metadata was initially missed
            if (runtimeDurationLabel && (runtimeDurationLabel.textContent === "0:00" || runtimeDurationLabel.textContent === "")) {
                syncTrackDurationMetadata();
            }
        });

        // Real-Time User Audio Scrubbing Input Calculations
        if (scrubTimelineBar) {
            scrubTimelineBar.addEventListener('input', () => {
                mediaChannel.currentTime = scrubTimelineBar.value;
                if (currentStampLabel) {
                    currentStampLabel.textContent = evaluateAudioTimestamp(mediaChannel.currentTime);
                }
            });
        }

        // Live Volume Slider Tracking Controls
        if (systemVolSlider) {
            systemVolSlider.addEventListener('input', (event) => {
                const newVolume = parseFloat(event.target.value);
                mediaChannel.volume = newVolume;
                // Dragging to 0 counts as muted; dragging back up un-mutes
                mediaChannel.muted = newVolume === 0;
            });
        }

        // Click-to-mute on the speaker icon. Uses the native `.muted`
        // property rather than zeroing volume, so the slider position
        // (and the last volume level) is preserved and restored on unmute.
        if (volumeIconToggle) {
            volumeIconToggle.addEventListener('click', () => {
                mediaChannel.muted = !mediaChannel.muted;
            });
        }

        // Single source of truth for the icon glyph — fires on both the
        // slider drag (via .volume/.muted changes above) and icon clicks,
        // so it can never drift out of sync with the actual audio state.
        function syncVolumeIcon() {
            if (!volumeIconToggle) return;
            if (mediaChannel.muted || mediaChannel.volume === 0) {
                volumeIconToggle.textContent = "🔇";
            } else if (mediaChannel.volume < 0.5) {
                volumeIconToggle.textContent = "🔉";
            } else {
                volumeIconToggle.textContent = "🔊";
            }
        }

        mediaChannel.addEventListener('volumechange', syncVolumeIcon);
        syncVolumeIcon(); // reflect whatever the initial state is on load
    }
});