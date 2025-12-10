// Fonction de remplacement pour GM_addStyle
function addStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// =================================================================
// PARTIE 1 : AUTOPLAY AGRESSIF (DANS L'IFRAME DU LECTEUR)
// =================================================================
if (window.self !== window.top) {
    const isVideoHost = /sibnet|sendvid|myvi|moon|stream|player/i.test(window.location.hostname);
    
    if (isVideoHost || document.querySelector('video')) {
        let attempts = 0;
        const autoPlayInterval = setInterval(() => {
            attempts++;
            const video = document.querySelector('video');
            const playBtn = document.querySelector('.vjs-big-play-button, .play-button, [aria-label="Play"], .fp-play');

            if (playBtn) playBtn.click();

            if (video) {
                if (video.paused) {
                    let playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            video.muted = true;
                            video.play();
                        });
                    }
                } else {
                    clearInterval(autoPlayInterval);
                }
            }
            if (attempts > 30) clearInterval(autoPlayInterval);
        }, 500);
    }
} else {

    // =================================================================
    // PARTIE 2 : INTERFACE CINÉMA (PAGE PRINCIPALE)
    // =================================================================

    const KEY_NEXT = 'n';
    const KEY_CINEMA = 'f';
    let uiTimer = null;

    addStyle(`
        /* 1. CONTENEUR BOUTONS */
        #as-controls-container {
            position: fixed; 
            bottom: 20px; 
            right: 20px;
            z-index: 2147483647 !important;
            display: flex; 
            gap: 10px; 
            align-items: center;
            pointer-events: none;
            opacity: 1; 
            transition: opacity 0.4s ease;
        }
        body.as-cinema-mode #as-controls-container.as-hidden { opacity: 0; }

        /* 2. STYLE DE BASE (Partagé par tous les boutons) */
        .as-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 0.6rem 1.2rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            pointer-events: auto;
            user-select: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            font-family: sans-serif;
            color: #e0f2fe;
        }

        /* STYLE SPÉCIFIQUE : BOUTON SUIVANT (Bleu) */
        .as-btn-next {
            border: 1px solid rgba(100, 120, 150, 0.3);
            background: linear-gradient(135deg, rgba(12, 74, 110, 0.85), rgba(7, 89, 133, 0.75));
        }
        .as-btn-next:hover {
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.8), rgba(2, 132, 199, 0.7));
            border-color: rgba(125, 211, 252, 0.5);
            transform: translateY(-2px);
            color: #ffffff;
        }

        /* STYLE SPÉCIFIQUE : BOUTON CINÉMA (Sombre - Ton code CSS demandé) */
        .as-btn-cinema {
            background: linear-gradient(135deg, rgba(41, 37, 36, 0.85), rgba(28, 25, 23, 0.75)); /* Opacité ajustée pour visibilité sur vidéo */
            border: 1px solid rgba(120, 113, 108, 0.3);
            color: #e7e5e4; /* Stone-200 */
        }
        .as-btn-cinema:hover {
            background: linear-gradient(135deg, rgba(60, 50, 40, 0.9), rgba(45, 40, 35, 0.8));
            border-color: rgba(168, 162, 158, 0.5);
            transform: translateY(-2px);
            color: #ffffff;
        }

        /* Icônes SVG */
        .nav-episode-icon { width: 20px; height: 20px; }
        
        /* 3. SENSOR */
        #as-sensor {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 2147483645 !important; background: transparent;
            display: none;
        }
        body.as-cinema-mode #as-sensor.active { display: block; pointer-events: auto; }
        body.as-cinema-mode #as-sensor.inactive { display: block; pointer-events: none; }

        /* 4. FULLSCREEN PLAYER */
        .as-fullscreen-player {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100vw !important; height: 100vh !important;
            max-width: none !important; max-height: none !important;
            margin: 0 !important; padding: 0 !important;
            z-index: 2147483640 !important; background: black !important; border: none !important;
        }

        /* 5. KILL LIST */
        body.as-cinema-mode nav, body.as-cinema-mode header, body.as-cinema-mode .navbar,
        body.as-cinema-mode #header, body.as-cinema-mode #scrollProgressWrapper, body.as-cinema-mode #topBtn {
            display: none !important; opacity: 0 !important; z-index: -9999 !important;
        }

        /* 6. SCROLLBAR KILLER */
        html.as-cinema-root, body.as-cinema-mode {
            overflow: hidden !important; scrollbar-width: none !important; -ms-overflow-style: none !important;
        }
        html.as-cinema-root::-webkit-scrollbar, body.as-cinema-mode::-webkit-scrollbar { 
            display: none !important; width: 0 !important; height: 0 !important;
        }

        /* 7. BACKDROP */
        #as-backdrop {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 2147483635 !important; display: none; pointer-events: none !important;
        }
    `);

    let nextLinkElement = null;
    let isCinemaActive = false;
    let savedStyles = '';

    function scanForNextLink() {
        if (document.getElementById('as-controls-container')) return;
        const currentUrl = window.location.href;

        if (currentUrl.includes('anime-sama')) {
            let potentialLinks = Array.from(document.querySelectorAll('a, button, div[onclick]'));
            nextLinkElement = potentialLinks.find(el => 
                el.textContent.toLowerCase().includes("suivant") && 
                !el.textContent.toLowerCase().includes("précédent")
            );
            if (!nextLinkElement) {
                const activeEp = document.querySelector('.bg-indigo-500, .bg-blue-500, .bg-indigo-600');
                if (activeEp && activeEp.nextElementSibling) nextLinkElement = activeEp.nextElementSibling;
            }
        } else if (currentUrl.includes('voiranime')) {
            nextLinkElement = document.querySelector('.nav-next a') || document.querySelector('a.next');
        }
        if (nextLinkElement) createInterface();
    }

    function createInterface() {
        if(!document.getElementById('as-backdrop')) {
            const bd = document.createElement('div'); bd.id = 'as-backdrop'; document.body.appendChild(bd);
        }
        if(!document.getElementById('as-sensor')) {
            const sensor = document.createElement('div'); sensor.id = 'as-sensor';
            sensor.addEventListener('mousemove', wakeUpUi); sensor.addEventListener('click', wakeUpUi);
            document.body.appendChild(sensor);
        }

        const container = document.createElement('div'); container.id = 'as-controls-container';
        
        // --- Bouton Cinéma (Style sombre) ---
        const cinemaBtn = document.createElement('div'); 
        // Application de la classe de base + la classe spécifique
        cinemaBtn.className = 'as-btn as-btn-cinema'; 
        cinemaBtn.innerHTML = '<span class="as-icon">⛶</span> Cinéma (F)'; 
        cinemaBtn.onclick = toggleCinemaMode;

        // --- Bouton Suivant (Style bleu) ---
        const nextBtn = document.createElement('div'); 
        nextBtn.id = 'as-next-btn'; 
        // Application de la classe de base + la classe spécifique
        nextBtn.className = 'as-btn as-btn-next'; 
        nextBtn.innerHTML = `
            <span>Suivant (N)</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="nav-episode-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"></path>
            </svg>
        `;
        
        nextBtn.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            if(nextLinkElement) nextLinkElement.click();
            if (nextLinkElement.href && !nextLinkElement.href.includes('javascript')) window.location.href = nextLinkElement.href;
        };

        container.appendChild(cinemaBtn); container.appendChild(nextBtn); document.body.appendChild(container);
        document.addEventListener('mousemove', wakeUpUi);
    }

    function wakeUpUi() {
        if (!isCinemaActive) return;
        const container = document.getElementById('as-controls-container');
        const sensor = document.getElementById('as-sensor');
        if (!container || !sensor) return;

        container.classList.remove('as-hidden');
        sensor.classList.remove('active'); sensor.classList.add('inactive');

        if (uiTimer) clearTimeout(uiTimer);
        uiTimer = setTimeout(() => {
            if (isCinemaActive) {
                container.classList.add('as-hidden');
                sensor.classList.remove('inactive'); sensor.classList.add('active');
            }
        }, 3000);
    }

    function toggleCinemaMode() {
        isCinemaActive = !isCinemaActive;
        const backdrop = document.getElementById('as-backdrop');
        const iframes = Array.from(document.querySelectorAll('iframe'));
        if (iframes.length === 0) return;
        const videoIframe = iframes.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0];
        const htmlRoot = document.documentElement;

        if (isCinemaActive) {
            savedStyles = videoIframe.getAttribute('style') || '';
            document.body.classList.add('as-cinema-mode');
            htmlRoot.classList.add('as-cinema-root');
            backdrop.style.display = 'block';
            videoIframe.classList.add('as-fullscreen-player');
            if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
            wakeUpUi();
        } else {
            document.body.classList.remove('as-cinema-mode');
            htmlRoot.classList.remove('as-cinema-root');
            backdrop.style.display = 'none';
            videoIframe.classList.remove('as-fullscreen-player');
            videoIframe.setAttribute('style', savedStyles);
            const container = document.getElementById('as-controls-container');
            if(container) container.classList.remove('as-hidden');
            if (document.fullscreenElement) document.exitFullscreen();
        }
    }

    document.addEventListener('keydown', (e) => {
        if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;
        if (e.key.toLowerCase() === KEY_NEXT && document.getElementById('as-next-btn')) document.getElementById('as-next-btn').click();
        if (e.key.toLowerCase() === KEY_CINEMA) toggleCinemaMode();
        wakeUpUi();
    });
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && isCinemaActive) toggleCinemaMode(); });
    setInterval(scanForNextLink, 2000);
}