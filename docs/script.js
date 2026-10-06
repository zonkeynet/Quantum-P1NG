(() => {
  const memory = Number(navigator.deviceMemory || 8);
  const cores = Number(navigator.hardwareConcurrency || 8);
  const narrow = window.matchMedia('(max-width: 760px)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  if (narrow || saveData || memory <= 4 || cores <= 4) {
    document.documentElement.classList.add('perf-lite');
  }
  window.__qpDpr = () => Math.min(window.devicePixelRatio || 1, document.documentElement.classList.contains('perf-lite') ? 1.15 : 1.5);

  // Global pause state & visibility dispatcher
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
    window.dispatchEvent(new CustomEvent('qp:visibility', { detail: { hidden: document.hidden } }));
  });
})();
(() => {
  // =========================================
  // 1. MOBILE MENU LOGIC
  // =========================================
  const burger = document.querySelector(".burger");
  const mobileMenu = document.querySelector(".mobilemenu");

  const toggleMenu = (forceClose = false) => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    const shouldOpen = forceClose ? false : !isOpen;

    burger.setAttribute("aria-expanded", String(shouldOpen));
    mobileMenu.setAttribute("aria-hidden", String(!shouldOpen));
    
    if (shouldOpen) {
      mobileMenu.classList.add("is-open");
      document.body.style.overflow = "hidden"; 
    } else {
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = ""; 
    }
  };

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => toggleMenu());

    mobileMenu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => toggleMenu(true));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080) {
        toggleMenu(true);
      }
    }, { passive: true });
  }

  // =========================================
  // 1B. DESKTOP HUD DROPDOWNS & SCROLLSPY
  // =========================================
  const navGroups = document.querySelectorAll('.nav-group');
  
  const closeAllDropdowns = () => {
    navGroups.forEach(g => {
      g.classList.remove('is-open');
      const btn = g.querySelector('.nav-trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  };

  navGroups.forEach(group => {
    const trigger = group.querySelector('.nav-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = group.classList.contains('is-open');
      closeAllDropdowns();
      if (!isOpen) {
        group.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    group.querySelectorAll('.nav-drop-item').forEach(item => {
      item.addEventListener('click', () => {
        closeAllDropdowns();
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-group')) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  const categoryMap = {
    'mission': 'architecture',
    'stack': 'architecture',
    'protocols': 'architecture',
    'roadmap': 'architecture',
    'security': 'security',
    'anti-forensic': 'security',
    'air-gap': 'security',
    'data-sanitizer': 'security',
    'finance': 'security',
    'lora-nexus': 'rf',
    'q-sdr': 'rf',
    'q-sat': 'rf',
    'radio-bridge': 'rf',
    'q-call': 'rf',
    'stt': 'tools',
    'q-ai': 'tools',
    'action-forge': 'tools',
    'q-geo': 'tools',
    'q-feed': 'tools',
    'q-cam': 'tools',
    'games': 'games'
  };

  const sectionsToWatch = Object.keys(categoryMap)
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sectionsToWatch.length > 0) {
    const gamesLink = document.querySelector('.nav-link--games');
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cat = categoryMap[entry.target.id];
          navGroups.forEach(g => {
            if (g.dataset.navCategory === cat) {
              g.classList.add('is-active');
            } else {
              g.classList.remove('is-active');
            }
          });
          if (gamesLink) {
            gamesLink.classList.toggle('is-active', cat === 'games');
          }
        }
      });
    }, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    });

    sectionsToWatch.forEach(s => spyObserver.observe(s));
  }

  // =========================================
  // 2. HACKER TYPEWRITER EFFECT
  // =========================================
  const typeWriter = async (element, text) => {
    element.innerHTML = ""; // Clear
    element.classList.add("typing-cursor");
    
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Coloring logic
        if(line.includes("$")) line = `<span style="color:#fff">${line}</span>`;
        if(line.includes("OK") || line.includes("connected")) {
            line = line.replace("OK", "<span style='color:#0aff84'>OK</span>")
                        .replace("connected", "<span style='color:#0aff84'>connected</span>");
        }
        
        const lineEl = document.createElement('div');
        element.appendChild(lineEl);
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = line;
        const plainText = tempDiv.textContent;
        
        lineEl.innerHTML = ""; 
        
        for (let j = 0; j < plainText.length; j++) {
            lineEl.textContent += plainText[j];
            await new Promise(r => setTimeout(r, Math.random() * 30 + 10));
        }
        
        lineEl.innerHTML = line; 
        
        await new Promise(r => setTimeout(r, 100));
        
        element.scrollTop = element.scrollHeight;
    }
  };

  const terminalOutput = document.getElementById("typewriter-output");
  const sourceText = document.getElementById("terminal-text");
  
  if (terminalOutput && sourceText) {
      setTimeout(() => {
          typeWriter(terminalOutput, sourceText.textContent.trim());
      }, 500);
  }

  // =========================================
  // 3. COPY BUTTON LOGIC
  // =========================================
  document.querySelectorAll(".copybtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-copy");
      const el = document.getElementById(id);
      if(!el) return;
      try {
        await navigator.clipboard.writeText(el.textContent.trim());
        const old = btn.textContent;
        btn.textContent = "COPIED";
        btn.style.color = "var(--acc)";
        setTimeout(() => {
            btn.textContent = old;
            btn.style.color = "";
        }, 1500);
      } catch(e) {}
    });
  });

  // =========================================
  // 4. ROADMAP SCROLL OBSERVER
  // =========================================
  const roadmapItems = document.querySelectorAll('.rm-node'); 

  if (roadmapItems.length > 0) {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
      };

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('in-view');
            }, index * 150); 
            
            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      roadmapItems.forEach(item => {
        observer.observe(item);
      });
  }

  // =========================================
  // 5. INTERACTIVE CARDS LOGIC (Nuova Sezione)
  // =========================================
  const cards = document.querySelectorAll('.interactive-card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      
      if (card.classList.contains('is-open')) {
        card.classList.remove('is-open');
      } else {
        card.classList.add('is-open');
      }
      
    });
  });
// =========================================================================
// 6. CINEMATIC GAMES
// =========================================================================
const terminal = document.getElementById('games-terminal');
const gamesGrid = document.getElementById('cyber-games-grid');
const glitchText = terminal ? terminal.querySelector('.glitch-text') : null;

if (terminal && gamesGrid) {
  const noise = document.createElement('div');
  noise.className = 'glitch-noise';
  document.body.appendChild(noise);

  let unlockSound = null;
  const playUnlockSound = () => {
    try {
      if (!unlockSound) {
        unlockSound = new Audio('assets/audio/glitch.mp3');
        unlockSound.volume = 0.6;
      }
      unlockSound.currentTime = 0;
      playUnlockSound();
    } catch (e) {}
  };

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>";
  let scrambleInterval;

  terminal.addEventListener('click', () => {
    // Disabilita ulteriori click durante l'animazione
    terminal.style.pointerEvents = 'none';

    // --- FASE 1: DECRIPTAZIONE & ANTICIPAZIONE (0.0s - 0.6s) ---
    unlockSound.play().catch(() => {});

    if (window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30]); // Feedback tattile leggero ("calcolo in corso")
    }

    // Effetto Scramble sul testo "[ INITIALIZE_ARCADE ]"
    if (glitchText) {
      let iterations = 0;
      const originalText = glitchText.dataset.text || "[ INITIALIZE_ARCADE ]";
      
      scrambleInterval = setInterval(() => {
        glitchText.innerText = originalText.split('')
          .map((char, index) => {
            if(index < iterations) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
        iterations += 1/2; // Velocità di decriptazione
      }, 30);
    }

    // Distorsione del terminale in preparazione alla "rottura"
    terminal.style.transform = "scale(0.97)";
    terminal.style.filter = "brightness(2.5) contrast(1.5) hue-rotate(90deg) blur(2px)";
    terminal.style.transition = "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    // --- FASE 2: LA BRECCIA (0.6s) ---
    setTimeout(() => {
      clearInterval(scrambleInterval); // Ferma lo scramble
      if (glitchText) glitchText.innerText = "[ ACCESS GRANTED ]"; // Messaggio finale rapido
      
      noise.classList.add('active'); // Attiva rumore bianco totale

      if (window.navigator.vibrate) {
        window.navigator.vibrate([200, 100, 300]); // Feedback tattile pesante ("esplosione")
      }

      // Effetto di tremolio su tutto il corpo della pagina
      document.body.style.animation = "screenShake 0.4s ease-out";

      // --- FASE 3: RIVELAZIONE A CASCATA (0.8s) ---
      setTimeout(() => {
        terminal.style.display = 'none';
        gamesGrid.classList.remove('hidden');
        gamesGrid.classList.add('revealed');

        // Iniettiamo un ritardo a cascata per ogni singola card
        const cards = gamesGrid.querySelectorAll('.cyber-card');
        cards.forEach((card, index) => {
          card.style.opacity = '0'; // Partono invisibili per far lavorare l'animazione
          card.style.animation = `cinematicReveal 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards`;
          // Il cuore dell'effetto wow: la prima card appare subito, la seconda dopo 0.15s, ecc.
          card.style.animationDelay = `${index * 0.15}s`; 
        });
      }, 200); // Breve ritardo dopo il glitch massimo

    }, 600); // Durata della decriptazione iniziale

    // --- FASE 4: CLEANUP & STABILIZZAZIONE (2.5s) ---
    setTimeout(() => {
      noise.classList.remove('active');
      document.body.style.animation = "none"; // Ferma il tremolio

      // Rimuoviamo le animazioni dalle card per evitare problemi di hover/interazione successivi
      const cards = gamesGrid.querySelectorAll('.cyber-card');
      cards.forEach(card => {
        card.style.animation = "none";
        card.style.opacity = "1";
        card.style.transform = "none";
        card.style.filter = "none";
      });

      gamesGrid.style.animation = "none";
      gamesGrid.style.opacity = "1";
    }, 2500);

  });
}
// =========================================
// 7. LORA NEXUS MESH ENGINE & SIMULATION (QUANTUM FIELD EDITION)
// =========================================
(() => {
    const canvas = document.getElementById('mesh-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d');
    const container = canvas.parentElement;
    const input = document.getElementById('lora-input');
    const btn = document.getElementById('lora-transmit-btn');
    const terminal = document.getElementById('lora-terminal');
    const svgGlitchId = 'url(#cyber-glitch)';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const liteMode = document.documentElement.classList.contains('perf-lite');
    let sceneVisible = false;
    let sceneRaf = 0;
    let lastFrameTs = 0;
    const targetFrameMs = liteMode ? 1000 / 24 : 1000 / 30;

    let width, height;
    let nodes = [];
    let packets = [];
    const NUM_NODES = liteMode ? 24 : 34; 
    const CONNECTION_DIST = liteMode ? 108 : 124;

    // --- Colori Spettrali e Interpolazione (Lerp) ---
    const SPECTRUM = [
        [10, 255, 132],   // 0: Verde Neon (Sorgente)
        [0, 243, 255],    // 1: Ciano
        [255, 0, 222],    // 2: Magenta
        [157, 107, 255]   // 3: Viola (Destinazione)
    ];

    function getSpectralColor(progress) {
        const p = Math.max(0, Math.min(1, progress)) * (SPECTRUM.length - 1);
        const i = Math.floor(p);
        const j = Math.min(i + 1, SPECTRUM.length - 1);
        const t = p - i;
        const r = Math.round(SPECTRUM[i][0] * (1 - t) + SPECTRUM[j][0] * t);
        const g = Math.round(SPECTRUM[i][1] * (1 - t) + SPECTRUM[j][1] * t);
        const b = Math.round(SPECTRUM[i][2] * (1 - t) + SPECTRUM[j][2] * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // --- Campo Elettromagnetico Globale (Griglia RF) ---
    const CELL_SIZE = liteMode ? 34 : 30;
    let cols, rows;
    let rfField = [];

    function initRFGrid() {
        cols = Math.ceil(width / CELL_SIZE);
        rows = Math.ceil(height / CELL_SIZE);
        rfField = Array.from({length: cols}, () => new Float32Array(rows));
    }

    function injectRF(x, y, amount) {
        const cx = Math.floor(x / CELL_SIZE);
        const cy = Math.floor(y / CELL_SIZE);
        // Diffusione Gaussiana (3x3)
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nx = cx + i; const ny = cy + j;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    const dist = i*i + j*j;
                    rfField[nx][ny] += amount / (1 + dist * 2);
                }
            }
        }
    }

    let globalFlash = 0; // Per le collisioni
    const spectrumBins = new Array(64).fill(0);

    function triggerGlitch(duration) {
        canvas.style.filter = svgGlitchId;
        setTimeout(() => canvas.style.filter = 'none', duration);
    }

    // --- NODE CLASS (Entità con Z-Depth e Implosione) ---
    class Node {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.z = Math.random() * 0.8 + 0.2; // Parallasse (0.2 = lontano, 1.0 = vicino)
            
            // Velocità scalata per parallasse
            this.vx = (Math.random() - 0.5) * 0.4 * this.z;
            this.vy = (Math.random() - 0.5) * 0.4 * this.z;
            
            this.baseRadius = (Math.random() * 1.5 + 1) * this.z;
            this.radius = this.baseRadius;
            
            this.isPulsing = false;
            this.pulseRadius = 0;
            this.phase = Math.random() * Math.PI * 2;
            
            this.isDead = false;
            this.deadTimer = 0;

            // Stato di Assorbimento (0: Idle, 1: Implosione, 2: Esplosione)
            this.absorptionState = 0;
            this.absorptionTimer = 0;
        }
        
        update() {
            if (this.isDead) {
                this.deadTimer--;
                if (this.deadTimer <= 0) this.isDead = false;
                return;
            }

            if (Math.random() < 0.0002) {
                this.isDead = true;
                this.deadTimer = Math.floor(Math.random() * 150) + 50; 
            }

            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            this.phase += 0.03 * this.z;

            if (this.isPulsing) {
                this.pulseRadius += 3 * this.z;
                if (this.pulseRadius > 80 * this.z) {
                    this.isPulsing = false;
                    this.pulseRadius = 0;
                }
            }

            // Cinematica dell'Assorbimento
            if (this.absorptionState === 1) { // Implosione
                this.absorptionTimer -= 0.15;
                this.radius = this.baseRadius * Math.max(0.1, this.absorptionTimer);
                if (this.absorptionTimer <= 0) {
                    this.absorptionState = 2; // Passa all'esplosione
                    this.pulse(); 
                    injectRF(this.x, this.y, 15); // Esplosione di campo RF
                }
            } else if (this.absorptionState === 2) { // Esplosione
                this.absorptionTimer += 0.05;
                this.radius = this.baseRadius * (1 + Math.sin(this.absorptionTimer * Math.PI) * 2);
                if (this.absorptionTimer >= 1) {
                    this.absorptionState = 0;
                    this.radius = this.baseRadius;
                }
            }
        }
        
        draw() {
            if (this.isDead) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(26, 16, 37, ${this.z})`;
                ctx.fill();
                return;
            }

            // Depth fading color
            const r = Math.floor(157 * this.z);
            const g = Math.floor(107 * this.z);
            const b = Math.floor(255); // Mantiene il blu profondo in lontananza
            const nodeColor = `${r}, ${g}, ${b}`;

            const energy = Math.sin(this.phase) * 0.5 + 0.5;
            const haloRadius = this.radius * (4 + energy * 3);
            
            // Render Halo
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, haloRadius);
            gradient.addColorStop(0, `rgba(${nodeColor}, ${0.8 + energy * 0.2})`);
            gradient.addColorStop(1, `rgba(${nodeColor}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, haloRadius, 0, Math.PI * 2);
            ctx.fill();

            // Render Core
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.z})`;
            ctx.fill();

            // Concentric Wavefronts
            if (this.isPulsing && !this.isDead) {
                for (let w = 0; w < 3; w++) {
                    let rad = this.pulseRadius - (w * 15 * this.z);
                    if (rad > 0) {
                        const intensity = 1 / (1 + (rad * rad * 0.001));
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(10, 255, 132, ${intensity * (1 - w * 0.2) * this.z})`;
                        ctx.lineWidth = 1 * this.z;
                        ctx.stroke();
                    }
                }
            }
        }
        
        pulse() { if (!this.isDead) { this.isPulsing = true; this.pulseRadius = 0; } }
        absorb() { this.absorptionState = 1; this.absorptionTimer = 1; }
    }

    // --- PACKET CLASS (Onda AM con Doppler) ---
// --- PACKET CLASS (Onda AM con Doppler e Solitone EM) ---
    class Packet {
        constructor(path) {
            this.path = path;
            this.currentStep = 0;
            const startNode = nodes[path[0]];
            this.x = startNode.x; this.y = startNode.y;
            this.speed = 4;
            this.arrived = false;
            
            // Distanza totale per calcolo spettrale
            this.totalDist = 0;
            this.traveledDist = 0;
            for(let i = 0; i < path.length - 1; i++) {
                const n1 = nodes[path[i]], n2 = nodes[path[i+1]];
                this.totalDist += Math.sqrt((n2.x - n1.x)**2 + (n2.y - n1.y)**2);
            }
            
            this.hopEnergy = 0;
            startNode.pulse();
        }
        
        update() {
            if (this.arrived) return;
            const prevNode = nodes[this.path[this.currentStep]];
            const targetNode = nodes[this.path[this.currentStep + 1]];
            
            if (!targetNode || targetNode.isDead) { 
                this.arrived = true; 
                logTerm('>> COLLISION: Link severed. Entropy absorbed.', 'error');
                triggerGlitch(150); 
                return; 
            }

            const dx = targetNode.x - this.x;
            const dy = targetNode.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            this.hopEnergy = dist;

            // Inietta energia RF nella griglia
            injectRF(this.x, this.y, 0.5);

            const speed = this.speed * prevNode.z; // Parallasse velocità

            if (dist < speed) {
                this.currentStep++;
                this.x = targetNode.x; this.y = targetNode.y;
                
                if (this.currentStep >= this.path.length - 1) {
                    this.arrived = true;
                    this.hopEnergy = 0;
                    targetNode.absorb(); // Innesca Implosione Target
                    logTerm('>> Payload Grounded. Decrypting Buffer.', 'success');
                    triggerGlitch(120);
                } else {
                    targetNode.pulse();
                }
            } else {
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
                this.traveledDist += speed;
            }
        }
        
        draw() {
            if (this.arrived) return;
            const prevNode = nodes[this.path[this.currentStep]];
            const targetNode = nodes[this.path[this.currentStep + 1]];
            if (!targetNode) return;

            const dx = targetNode.x - prevNode.x;
            const dy = targetNode.y - prevNode.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);
            
            const trX = this.x - prevNode.x;
            const trY = this.y - prevNode.y;
            // Progress locale dell'hop (0 -> 1)
            const progress = Math.min(1, Math.sqrt(trX*trX + trY*trY) / dist);

            // Interpolazione Cromatica Totale
            const globalProgress = this.traveledDist / this.totalDist;
            const waveColor = getSpectralColor(globalProgress);

            // Calcolo Effetto DOPPLER
            const relVel = (targetNode.vx * Math.cos(angle) + targetNode.vy * Math.sin(angle));
            const dopplerShift = 1 + relVel * 1.5;

            ctx.save();
            ctx.translate(prevNode.x, prevNode.y);
            ctx.rotate(angle);
            
            const time = performance.now() * 0.02;
            const distortion = globalFlash > 0 ? (Math.random()*6 - 3) : 0;
            
            // Calcolo della dimensione del "Solitone" (la lunghezza della cometa)
            const tailLength = 0.3; // Il pacchetto occupa il 30% del link visivamente
            const tailX = Math.max(0, (progress - tailLength) * dist);
            const headX = progress * dist;

            ctx.globalCompositeOperation = 'lighter'; // Effetto plasma sovrapposto

            // --- 1. CORE BEAM (Spina dorsale dati) ---
            const coreGrad = ctx.createLinearGradient(tailX, 0, headX, 0);
            coreGrad.addColorStop(0, 'rgba(255,255,255,0)');
            coreGrad.addColorStop(0.7, waveColor);
            coreGrad.addColorStop(1, '#ffffff');

            ctx.beginPath();
            ctx.moveTo(tailX, distortion);
            ctx.lineTo(headX, distortion);
            ctx.strokeStyle = coreGrad;
            ctx.lineWidth = 2.5 * prevNode.z;
            ctx.shadowBlur = 15;
            ctx.shadowColor = waveColor;
            ctx.stroke();

            // --- 2. DUAL EM FIELDS (Onde intrecciate Seno/Coseno) ---
            const drawField = (phaseOffset, amplitude, isSecondary) => {
                ctx.beginPath();
                let started = false;
                
                // Disegna l'onda solo lungo il corpo del pacchetto
                for (let i = Math.floor(tailX); i <= headX; i += 2) { // Step 2 per performance
                    const localT = i / dist;
                    // Inviluppo per far gonfiare l'onda al centro e stringerla ai bordi
                    const tailProgress = (i - tailX) / (headX - tailX); 
                    const envelope = Math.sin(tailProgress * Math.PI) ** 1.5; 

                    const offset = Math.sin(localT * 40 * dopplerShift - time + phaseOffset) * amplitude * envelope * prevNode.z;
                    
                    if (!started) {
                        ctx.moveTo(i, offset + distortion);
                        started = true;
                    } else {
                        ctx.lineTo(i, offset + distortion);
                    }
                }
                ctx.strokeStyle = isSecondary ? 'rgba(255,255,255,0.7)' : waveColor;
                ctx.lineWidth = (isSecondary ? 1 : 1.5) * prevNode.z;
                ctx.shadowBlur = isSecondary ? 5 : 15;
                ctx.shadowColor = waveColor;
                ctx.stroke();
            };

            // Campo Primario
            drawField(0, 8, false);
            // Campo Secondario (Sfasato di 90 gradi per effetto 3D)
            drawField(Math.PI / 2, -6, true);

            // --- 3. THE PHOTON FLARE (Testa del pacchetto) ---
            // Un'ellisse orizzontale per dare senso di aerodinamicità/velocità
            ctx.beginPath();
            ctx.ellipse(headX, distortion, 8 * prevNode.z, 2 * prevNode.z, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 25;
            ctx.shadowColor = waveColor;
            ctx.fill();

            // Nucleo bianco puro al centro della testa
            ctx.beginPath();
            ctx.arc(headX, distortion, 2 * prevNode.z, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.fill();

            ctx.restore();
        }
    }

    // --- BFS Pathfinding ---
    function getAdjacencyList() {
        const adj = Array.from({length: nodes.length}, () => []);
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].isDead) continue;
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[j].isDead) continue;
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                // Nodi su piani Z diversi fanno più fatica a connettersi
                const dz = (nodes[i].z - nodes[j].z) * 100; 
                if (dx*dx + dy*dy + dz*dz < CONNECTION_DIST * CONNECTION_DIST) {
                    adj[i].push(j);
                    adj[j].push(i);
                }
            }
        }
        return adj;
    }

    function findPathBFS(start, end) {
        const adj = getAdjacencyList();
        const queue = [[start]];
        const visited = new Set([start]);

        while (queue.length > 0) {
            const path = queue.shift();
            const node = path[path.length - 1];
            if (node === end) return path;

            for (let neighbor of adj[node]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }
        return null;
    }

    function initNodes() {
        nodes = [];
        for (let i = 0; i < NUM_NODES; i++) {
            nodes.push(new Node(Math.random() * width, Math.random() * height));
        }
    }

    function resize() {
        const oldWidth = width;
        width = canvas.width = container.offsetWidth;
        height = canvas.height = container.offsetHeight;
        initRFGrid();
        if (nodes.length === 0 || Math.abs(oldWidth - width) > 50) {
            initNodes();
        } else {
            nodes.forEach(n => {
                if (n.x > width) n.x = width;
                if (n.y > height) n.y = height;
            });
        }
    }

    window.addEventListener('resize', () => { if (sceneVisible) resize(); }, { passive: true });

    // --- MAIN RENDER LOOP ---
    function drawScene(ts = 0) {
        if (!sceneVisible || reducedMotion.matches) return;
        if (ts - lastFrameTs < targetFrameMs) {
            sceneRaf = requestAnimationFrame(drawScene);
            return;
        }
        lastFrameTs = ts;
        // Plasma persistente (Inerzia)
        ctx.fillStyle = 'rgba(2, 1, 4, 0.12)';
        ctx.fillRect(0, 0, width, height);
        
        // 1. Render Campo RF Globale (Aria Ionizzata)
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (rfField[i][j] > 0.01) {
                    const alpha = Math.min(0.3, rfField[i][j]);
                    // Gradiente radiale per ogni cella attiva
                    const rg = ctx.createRadialGradient(
                        i*CELL_SIZE + CELL_SIZE/2, j*CELL_SIZE + CELL_SIZE/2, 0, 
                        i*CELL_SIZE + CELL_SIZE/2, j*CELL_SIZE + CELL_SIZE/2, CELL_SIZE
                    );
                    rg.addColorStop(0, `rgba(0, 243, 255, ${alpha})`);
                    rg.addColorStop(1, 'rgba(0, 243, 255, 0)');
                    ctx.fillStyle = rg;
                    ctx.fillRect(i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    
                    rfField[i][j] *= 0.85; // Decadimento campo
                }
            }
        }
        ctx.globalCompositeOperation = 'source-over';

        // 2. Controllo Collisioni Coerenti
        let collisionDetected = false;
        for (let i = 0; i < packets.length; i++) {
            for (let j = i + 1; j < packets.length; j++) {
                const dx = packets[i].x - packets[j].x;
                const dy = packets[i].y - packets[j].y;
                if (dx*dx + dy*dy < 400) { // Distanza 20px
                    collisionDetected = true;
                    injectRF(packets[i].x, packets[i].y, 20); // Spaccatura nel campo
                }
            }
        }
        
        if (collisionDetected && globalFlash === 0) {
            globalFlash = 1.0;
            logTerm('>> ANOMALY: Signal Interference Detected.', 'error');
            triggerGlitch(200);
        }

        // Render Flash di Collisione
        if (globalFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${globalFlash * 0.5})`;
            ctx.fillRect(0, 0, width, height);
            globalFlash -= 0.1;
        }

        // 3. Render Connessioni Parallasse
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].isDead) continue;
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[j].isDead) continue;
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dz = (nodes[i].z - nodes[j].z) * 100;
                const distSq = dx*dx + dy*dy + dz*dz;
                if (distSq < CONNECTION_DIST * CONNECTION_DIST) {
                    const opacity = 1 - (Math.sqrt(distSq) / CONNECTION_DIST);
                    const avgZ = (nodes[i].z + nodes[j].z) / 2;
                    // I link profondi sono più blu, quelli vicini più viola
                    const bColor = avgZ < 0.5 ? '4aa3ff' : '157, 107, 255'; 
                    ctx.strokeStyle = `rgba(${bColor}, ${opacity * 0.25 * avgZ})`;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
        
        // 4. Update & Render
        nodes.forEach(n => n.update());
        // Sort by Z to draw distant nodes first (Painter's algorithm)
        nodes.slice().sort((a,b) => a.z - b.z).forEach(n => n.draw()); 
        
        packets = packets.filter(p => !p.arrived);
        packets.forEach(p => { p.update(); p.draw(); });

        // 5. Spettro e Rumore
        let totalEnergy = globalFlash * 50; 
        packets.forEach(p => totalEnergy += p.hopEnergy);
        
        const binWidth = width / spectrumBins.length;
        ctx.fillStyle = 'rgba(10, 255, 132, 0.4)';
        for (let i = 0; i < spectrumBins.length; i++) {
            spectrumBins[i] *= 0.85; // Decadimento
            spectrumBins[i] += Math.random() * (globalFlash > 0 ? 30 : 5); // Esplosione di spettro su collisione
            
            if (totalEnergy > 0 && Math.random() < 0.1) {
                spectrumBins[i] += Math.random() * (totalEnergy * 0.15);
            }
            const barHeight = Math.min(spectrumBins[i], 40);
            ctx.fillRect(i * binWidth + 1, height - barHeight, binWidth - 2, barHeight);
        }

        sceneRaf = requestAnimationFrame(drawScene);
    }

    function startScene() {
        if (sceneVisible || reducedMotion.matches) return;
        sceneVisible = true;
        resize();
        sceneRaf = requestAnimationFrame(drawScene);
    }

    function stopScene() {
        sceneVisible = false;
        if (sceneRaf) cancelAnimationFrame(sceneRaf);
        sceneRaf = 0;
    }

    reducedMotion.addEventListener?.('change', () => {
        stopScene();
        if (!reducedMotion.matches && canvas.closest('section')?.classList.contains('is-lora-visible')) startScene();
    });

    const loraSection = canvas.closest('section') || container;
    if ('IntersectionObserver' in window && loraSection) {
        const meshObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loraSection.classList.add('is-lora-visible');
                    startScene();
                } else {
                    loraSection.classList.remove('is-lora-visible');
                    stopScene();
                }
            });
        }, { threshold: 0.08 });
        meshObserver.observe(loraSection);
    } else {
        startScene();
    }

    // Terminal Helper
    function logTerm(msg, type = 'cmd') {
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        line.innerText = msg;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
        while (terminal.childNodes.length > 30) terminal.removeChild(terminal.firstChild);
        return line;
    }

    const randHex = (bytes) => Array.from({length: bytes}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0')).join('').toUpperCase();

    // Transmission Sequence
    async function transmit() {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        logTerm(`> RAW_INPUT: "${text}"`, 'cmd');

        if (text.includes('IMG_DROP|') || text.includes('FILE_DROP|')) {
            logTerm('⚠️ LORA ABORT: Payload contains media metadata. Too heavy for radio.', 'error');
            return;
        }

        await new Promise(r => setTimeout(r, 400));
        logTerm(`> Applying ZLIB Compression + AES-256-GCM...`, 'cmd');
        
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>";
        const payloadLine = logTerm(`> ENCRYPTING: [ ]`, 'cmd');
        let iterations = 0;
        
        await new Promise((resolve) => {
            const scrambleInterval = setInterval(() => {
                const scrambled = text.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
                payloadLine.innerText = `> ENCRYPTING: [ ${scrambled} ]`;
                iterations++;
                
                if (iterations > 18) {
                    clearInterval(scrambleInterval);
                    const iv = randHex(12); 
                    const tag = randHex(16); 
                    const ctLength = Math.max(8, Math.floor(text.length * 0.8)); 
                    const ct = randHex(ctLength);
                    
                    payloadLine.className = 'term-line hex';
                    payloadLine.innerText = `> CIPHERTEXT: [ IV:${iv} | CT:${ct} | TAG:${tag} ]`;
                    resolve();
                }
            }, 35);
        });

        await new Promise(r => setTimeout(r, 300));
        logTerm(`> Plaintext wiped from memory.`, 'success');
        
        await new Promise(r => setTimeout(r, 400));
        logTerm(`> BLE GATT Write (MTU: 247). Effective ATT payload: 244 bytes.`, 'cmd');
        
        triggerGlitch(200); 

        // BFS Pathfinding
        const aliveNodes = nodes.map((n, i) => n.isDead ? -1 : i).filter(i => i !== -1);
        if (aliveNodes.length < 2) {
            logTerm('> ROUTE FAILED: Network collapsed. No alive nodes.', 'error');
            return;
        }

        const startIdx = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];
        let endIdx = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];
        while(endIdx === startIdx) endIdx = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];

        const path = findPathBFS(startIdx, endIdx);

        if (!path) {
            logTerm(`> ROUTE FAILED: No viable path to target node in current topology.`, 'error');
            nodes[startIdx].isPulsing = true;
            nodes[startIdx].pulseRadius = 0;
            triggerGlitch(150);
            return;
        }
        
        logTerm(`> Transmitting LoRa RF sequence (Hop Count: ${path.length - 1})...`, 'success');
        packets.push(new Packet(path));
    }

    btn.addEventListener('click', transmit);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') transmit(); });
})();

// =========================================================================
// 8. HARDWARE INJECTION & LIVE SERIAL MONITOR
// =========================================================================
(() => {
    const flasher = document.getElementById('esp-flasher');
    const flashConsole = document.getElementById('flash-console');
    const eraseToggle = document.getElementById('erase-toggle');
    const serialBtn = document.getElementById('open-serial-btn');

    if (!flasher || !flashConsole) return;

    // Funzione di utility per stampare nel terminale nero
    function logTerminal(msg, type = 'cmd') {
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        line.innerText = msg;
        flashConsole.appendChild(line);
        flashConsole.scrollTop = flashConsole.scrollHeight;
        while (flashConsole.childNodes.length > 150) flashConsole.removeChild(flashConsole.firstChild);
    }

    // --- GESTIONE FLASH & ERASE ---
    if (eraseToggle) {
        eraseToggle.addEventListener('change', (e) => {
            // Nota: esp-web-tools permette di passare 'eraseFirst' programmaticamente
            flasher.eraseFirst = e.target.checked;
            if (e.target.checked) {
                logTerminal('> ERASE POLICY: STRICT (Device will be wiped completely)', 'warn');
            } else {
                logTerminal('> ERASE POLICY: UPDATE ONLY (Existing NVS data preserved)', 'info');
            }
        });
    }

    flasher.addEventListener('state-changed', (e) => {
        const state = e.detail.state;
        flashConsole.classList.remove('hidden');

        switch (state) {
            case 'CONNECTING': logTerminal('> Opening Web Serial descriptor...', 'cmd'); break;
            case 'CONNECTED': logTerminal('> SERIAL LINK ESTABLISHED.', 'success'); break;
            case 'INITIALIZING': logTerminal('> Injecting flasher stub...', 'info'); break;
            case 'ERASING': logTerminal('> [WARNING] WIPING FLASH MEMORY...', 'critical'); break;
            case 'WRITING': logTerminal('> STREAMING UNIVERSAL BINARY PAYLOAD...', 'info'); break;
            case 'FINISHED': 
                logTerminal('> PAYLOAD COMMITTED TO SILICON.', 'success'); 
                logTerminal('> HARDWARE REBOOTING...', 'warn');
                logTerminal('> Click [OPEN LIVE SERIAL LINK] to monitor tactical telemetry.', 'info');
                break;
            case 'ERROR':
                logTerminal(`> [FATAL] OPERATION ABORTED: ${e.detail.message || "Hardware disconnect"}`, 'critical');
                break;
        }
    });

    // --- MONITOR SERIALE DAL VIVO (RAW USB-C) ---
    let port;
    let reader;
    let inputDone;

    async function openLiveSerial() {
        if (!('serial' in navigator)) {
            logTerminal('> [ERR] Web Serial API not supported by this browser.', 'critical');
            return;
        }

        try {
            flashConsole.classList.remove('hidden');
            
            if (port) {
                await closeSerial();
                return;
            }

            port = await navigator.serial.requestPort();
            // Il T-Deck usa i 115200 baud standard
            await port.open({ baudRate: 115200 });

            logTerminal('> ---------------------------------------', 'cmd');
            logTerminal('> LIVE SERIAL LINK ACTIVE @ 115200 BAUD', 'success');
            logTerminal('> ---------------------------------------', 'cmd');

            const decoder = new TextDecoderStream();
            inputDone = port.readable.pipeTo(decoder.writable);
            reader = decoder.readable.getReader();

            serialBtn.innerText = "> DISCONNECT SERIAL";
            serialBtn.style.color = "var(--warn)";
            serialBtn.style.borderColor = "var(--warn)";

            readLoop();

        } catch (err) {
            logTerminal(`> [SERIAL ERR]: ${err.message}`, 'error');
        }
    }

    async function readLoop() {
        let lineBuffer = '';
        while (true) {
            try {
                const { value, done } = await reader.read();
                if (value) {
                    lineBuffer += value;
                    const lines = lineBuffer.split('\n');
                    lineBuffer = lines.pop(); // Mantieni la riga incompleta nel buffer
                    
                    for (let line of lines) {
                        line = line.replace('\r', '').trim();
                        if (line.length > 0) {
                            // Colora in arancione i log che provengono dal tuo codice C++ (che iniziano con "> ")
                            if (line.startsWith('>')) {
                                logTerminal(`[T-DECK] ${line}`, 'hw');
                            } else {
                                logTerminal(`[T-DECK] ${line}`, 'info');
                            }
                        }
                    }
                }
                if (done) {
                    reader.releaseLock();
                    break;
                }
            } catch (err) {
                logTerminal(`> [SERIAL DISCONNECTED]: ${err.message}`, 'error');
                break;
            }
        }
    }

    async function closeSerial() {
        if (reader) {
            await reader.cancel();
            await inputDone.catch(() => {});
            reader = null;
            inputDone = null;
        }
        if (port) {
            await port.close();
            port = null;
        }
        logTerminal('> SERIAL LINK SEVERED.', 'warn');
        serialBtn.innerText = "> OPEN_LIVE_SERIAL_LINK";
        serialBtn.style.color = "var(--cyber-blue)";
        serialBtn.style.borderColor = "var(--cyber-blue)";
    }

    if (serialBtn) {
        serialBtn.addEventListener('click', openLiveSerial);
    }
})();
// 9. Q-MAP NEURAL DISPATCHER - CYBERPUNK ENGINE (v2)
// =========================================================================
(() => {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;

  // 2D context (try desynchronized if available)
  const ctx =
    canvas.getContext('2d', { alpha: true, desynchronized: true }) ||
    canvas.getContext('2d');

  const peerCounter = document.getElementById('peer-count');
  const statusLabel = document.getElementById('sync-status');
  const deltaRateLabel = document.getElementById('delta-rate');
  const pktCountLabel = document.getElementById('pkt-count');
  const integrityLabel = document.getElementById('integrity-status');
  const fpsLabel = document.getElementById('qmap-fps');
  const lastEvtLabel = document.getElementById('qmap-last');
  const modeLabel = document.getElementById('qmap-mode');

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX_DPR = reducedMotion ? 1 : 2;

  let W = 0, H = 0, dpr = 1;
  let running = false;
  let rafId = 0;
  let frozen = false;

  const pointer = { x: 0, y: 0, active: false, down: false };

  const DATA_TYPES = ['IMG', 'VID', 'TXT', 'VOX', 'MAP'];
  const TYPE_COLOR = {
    IMG: '#00f3ff', // cyan
    VID: '#0aff84', // neon green
    TXT: '#9d6bff', // purple
    VOX: '#ffbd2e', // gold
    MAP: '#ff0055'  // magenta
  };

  const nodes = [];
  const packets = [];
  const waves = [];
  const sessions = [];

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function setMode(text) {
    if (!modeLabel) return;
    modeLabel.textContent = text;
  }

  function setStatus(text, level = 'ok') {
    if (!statusLabel) return;
    statusLabel.textContent = text;

    const cls =
      level === 'bad' ? 'status-bad' :
      level === 'warn' ? 'status-warn' : 'status-ok';

    statusLabel.className = cls;
  }

  function setIntegrity(text, level = 'ok') {
    if (!integrityLabel) return;
    integrityLabel.textContent = text;

    const cls =
      level === 'bad' ? 'status-bad' :
      level === 'warn' ? 'status-warn' : 'status-ok';

    integrityLabel.className = cls;
  }

  function markLast(evt) {
    if (lastEvtLabel) lastEvtLabel.textContent = evt;
  }

  class PeerNode {
    constructor(id) {
      this.id = id;
      this.reset(true);
    }

    reset(hard) {
      this.x = Math.random() * W;
      this.y = Math.random() * H;

      if (hard) {
        this.vx = (Math.random() - 0.5) * 0.55;
        this.vy = (Math.random() - 0.5) * 0.55;
      }

      this.r = 2.8 + Math.random() * 0.9;
      this.state = 'IDLE';   // IDLE | HANDSHAKE | SYNCING
      this.linked = false;
      this.glow = 0;
    }

    update(dt) {
      // micro damping
      this.vx *= 0.996;
      this.vy *= 0.996;

      // pointer warp field (subtle)
      if (pointer.active) {
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < 190) {
          // swirl + push: gives "magnetic field" feeling
          const t = (1 - dist / 190);
          const swirl = 0.020 * t * (pointer.down ? 1.8 : 1.0);
          const push  = 0.015 * t * (pointer.down ? -1.2 : 1.0);

          // swirl component (perpendicular)
          this.vx += (-dy / dist) * swirl * (dt * 60);
          this.vy += ( dx / dist) * swirl * (dt * 60);

          // push component (radial)
          this.vx += (dx / dist) * push * (dt * 60);
          this.vy += (dy / dist) * push * (dt * 60);
        }
      }

      this.x += this.vx * (dt * 60);
      this.y += this.vy * (dt * 60);

      // edge bounce with slight friction
      if (this.x < 0) { this.x = 0; this.vx *= -0.95; }
      if (this.x > W) { this.x = W; this.vx *= -0.95; }
      if (this.y < 0) { this.y = 0; this.vy *= -0.95; }
      if (this.y > H) { this.y = H; this.vy *= -0.95; }

      // glow decay
      this.glow *= 0.92;
    }

    draw() {
      let color = '#00f3ff';
      let blur = 6;
      if (this.state === 'HANDSHAKE') { color = '#ffbd2e'; blur = 10; }
      if (this.state === 'SYNCING')   { color = '#ff0055'; blur = 16; }

      // core
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.globalAlpha = 0.95;
      ctx.fill();

      // halo ring
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 10 + this.glow * 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  class DataPacket {
    constructor(a, b, type) {
      this.ax = a.x; this.ay = a.y;
      this.x = a.x;  this.y = a.y;
      this.b = b;
      this.type = type;
      this.t = 0;
      this.speed = 0.85 + Math.random() * 0.55; // seconds-ish
      this.tail = [];
      this.color = TYPE_COLOR[type] || '#ff0055';
    }

    update(dt) {
      this.t += dt / this.speed;

      const k = clamp(this.t, 0, 1);
      // ease-in-out
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

      this.x = this.ax + (this.b.x - this.ax) * e;
      this.y = this.ay + (this.b.y - this.ay) * e;

      this.tail.push([this.x, this.y]);
      if (this.tail.length > 10) this.tail.shift();

      return k >= 1;
    }

    draw() {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // trail
      for (let i = 1; i < this.tail.length; i++) {
        const p0 = this.tail[i - 1];
        const p1 = this.tail[i];
        const a = i / this.tail.length;

        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + a * 0.18})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // head
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(this.x - 1.2, this.y - 1.2, 2.4, 2.4);

      // tiny tag
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.85;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(this.type, this.x + 6, this.y - 3);

      ctx.restore();
    }
  }

  class Wave {
    constructor(x, y, color) {
      this.x = x; this.y = y;
      this.r = 4;
      this.a = 0.55;
      this.color = color || '#00f3ff';
    }
    update(dt) {
      this.r += (dt * 60) * 2.4;
      this.a *= 0.93;
      return this.a < 0.03;
    }
    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${this.a * 0.25})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.shadowColor = this.color;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = `rgba(0,243,255,${this.a})`;
      ctx.stroke();
      ctx.restore();
    }
  }

  class Session {
    constructor(a, b, origin) {
      this.a = a;
      this.b = b;
      this.origin = origin || 'AUTO';
      this.phase = 'HANDSHAKE';
      this.t = 0;

      this.handshakeDur = 0.55 + Math.random() * 0.25;
      this.syncDur = 0.95 + Math.random() * 0.55;
      this.burstLeft = 2 + Math.floor(Math.random() * 4);
      this.burstCd = 0.10 + Math.random() * 0.10;

      // initial glow pulse
      this.a.glow = 1;
      this.b.glow = 1;

      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      waves.push(new Wave(mx, my, '#ffbd2e'));

      markLast(this.origin === 'OPERATOR' ? 'FORCED_HANDSHAKE' : 'HANDSHAKE_AUTH');
      setIntegrity('CHECKING', 'warn');
      setStatus('HANDSHAKE_AUTH', 'warn');
    }

    update(dt) {
      this.t += dt;

      if (this.phase === 'HANDSHAKE') {
        this.a.state = 'HANDSHAKE';
        this.b.state = 'HANDSHAKE';

        if (this.t >= this.handshakeDur) {
          this.phase = 'SYNCING';
          this.t = 0;
          markLast('TRANSFER');
          setStatus('TRANSFERRING', 'bad');
          setIntegrity('VERIFIED', 'ok');

          waves.push(new Wave(this.a.x, this.a.y, '#ff0055'));
          waves.push(new Wave(this.b.x, this.b.y, '#ff0055'));
        }
        return false;
      }

      if (this.phase === 'SYNCING') {
        this.a.state = 'SYNCING';
        this.b.state = 'SYNCING';

        // burst packets over time
        this.burstCd -= dt;
        if (this.burstLeft > 0 && this.burstCd <= 0) {
          this.burstCd = 0.10 + Math.random() * 0.12;
          this.burstLeft--;

          const type = DATA_TYPES[(Math.random() * DATA_TYPES.length) | 0];
          packets.push(new DataPacket(this.a, this.b, type));
          // extra flicker glow
          this.a.glow = 1;
          this.b.glow = 1;
          rateCounter++;
        }

        if (this.t >= this.syncDur) {
          this.phase = 'COMMIT';
          this.t = 0;
          markLast('COMMIT_ATOMIC');
          setStatus('COMMIT_ATOMIC', 'ok');
          waves.push(new Wave((this.a.x + this.b.x) / 2, (this.a.y + this.b.y) / 2, '#0aff84'));
        }
        return false;
      }

      // COMMIT (short)
      this.a.state = 'IDLE';
      this.b.state = 'IDLE';
      return this.t >= 0.20;
    }
  }

  function resize() {
    const wrapper = canvas.parentElement;
    if (!wrapper) return;

    W = Math.max(1, wrapper.clientWidth);
    H = Math.max(1, wrapper.clientHeight);

    dpr = Math.min(window.__qpDpr(), MAX_DPR);

    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    // Draw in CSS pixels, scale once
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    nodes.forEach(n => n.reset(true));
    markLast('RESIZE');
  }

  function nearestNodes(x, y) {
    let a = null, b = null;
    let da = Infinity, db = Infinity;

    for (const n of nodes) {
      const dx = n.x - x, dy = n.y - y;
      const d = dx * dx + dy * dy;
      if (d < da) {
        db = da; b = a;
        da = d;  a = n;
      } else if (d < db) {
        db = d; b = n;
      }
    }
    return [a, b];
  }

  function forceSession(origin) {
    const [a, b] = nearestNodes(pointer.x, pointer.y);
    if (!a || !b) return;

    // avoid stacking too many sessions
    if (sessions.length > 8) sessions.shift();

    sessions.push(new Session(a, b, origin || 'OPERATOR'));
    waves.push(new Wave(pointer.x, pointer.y, '#00f3ff'));
  }

  // Stats (EMA rate + FPS)
  let rateCounter = 0;
  let rateEMA = 0;
  let rateT = 0;

  let fpsFrames = 0;
  let fpsT = 0;
  let fps = 0;

  let lastFrame = performance.now();

  function loop(ts) {
    if (!running) return;

    const now = ts || performance.now();
    const dt = clamp((now - lastFrame) / 1000, 0, 0.05);
    lastFrame = now;

    // background trail (motion blur)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(2, 4, 8, 0.12)';
    ctx.fillRect(0, 0, W, H);

    // occasional micro-glitch flash
    if (!reducedMotion && Math.random() > 0.995) {
      ctx.fillStyle = 'rgba(255,0,85,0.03)';
      ctx.fillRect(0, 0, W, H);
    }

    // update nodes + sessions
    for (const n of nodes) n.linked = false;

    if (!frozen) {
      for (const n of nodes) n.update(dt);
    }

    // link drawing
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          a.linked = b.linked = true;
          const alpha = (1 - dist / 150) * 0.22;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);

          const isHot = (a.state === 'SYNCING' || b.state === 'SYNCING');
          ctx.strokeStyle = isHot
            ? `rgba(255, 0, 85, ${alpha})`
            : `rgba(0, 243, 255, ${alpha})`;

          ctx.lineWidth = 1;
          ctx.stroke();

          // auto handshakes (rare)
          if (!frozen && dist < 64 && Math.random() > (reducedMotion ? 0.9999 : 0.9987)) {
            sessions.push(new Session(a, b, 'AUTO'));
          }
        }
      }
    }
    ctx.restore();

    // update sessions
    for (let i = sessions.length - 1; i >= 0; i--) {
      const done = sessions[i].update(dt);
      if (done) sessions.splice(i, 1);
    }

    // draw nodes
    for (const n of nodes) n.draw();

    // packets
    for (let i = packets.length - 1; i >= 0; i--) {
      packets[i].draw();
      const finished = frozen ? false : packets[i].update(dt);
      if (finished) {
        // confirm flash at target
        waves.push(new Wave(packets[i].b.x, packets[i].b.y, '#0aff84'));
        packets[i].b.glow = 1;
        packets.splice(i, 1);
      }
    }

    // waves
    for (let i = waves.length - 1; i >= 0; i--) {
      waves[i].draw();
      if (frozen) continue;
      const dead = waves[i].update(dt);
      if (dead) waves.splice(i, 1);
    }

    // HUD updates
    if (peerCounter) {
      let linked = 0;
      for (const n of nodes) if (n.linked) linked++;
      peerCounter.textContent = String(linked);
    }

    if (pktCountLabel) pktCountLabel.textContent = String(packets.length);

    // rate update (EMA)
    rateT += dt;
    if (rateT >= 0.5) {
      const inst = rateCounter / rateT;
      rateEMA = rateEMA * 0.80 + inst * 0.20;
      rateCounter = 0;
      rateT = 0;

      if (deltaRateLabel) deltaRateLabel.textContent = rateEMA.toFixed(2);
    }

    // fps update
    fpsFrames++;
    fpsT += dt;
    if (fpsT >= 1.0) {
      fps = fpsFrames / fpsT;
      fpsFrames = 0;
      fpsT = 0;
      if (fpsLabel) fpsLabel.textContent = `${Math.round(fps)} fps`;
    }

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    setMode(frozen ? '[FROZEN]' : '[RUNNING]');
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    setMode('[PAUSED]');
  }

  // Pointer tracking
  function updatePointerFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = clamp(e.clientX - rect.left, 0, rect.width);
    pointer.y = clamp(e.clientY - rect.top, 0, rect.height);
  }

  canvas.addEventListener('pointerenter', () => { pointer.active = true; });
  canvas.addEventListener('pointerleave', () => { pointer.active = false; pointer.down = false; });

  canvas.addEventListener('pointermove', (e) => {
    updatePointerFromEvent(e);
  });

  canvas.addEventListener('pointerdown', (e) => {
    pointer.down = true;
    updatePointerFromEvent(e);
    forceSession('OPERATOR');
  });

  window.addEventListener('pointerup', () => { pointer.down = false; });

  // Start/Stop on visibility & Freeze toggle
  const deck = canvas.closest('.neural-container') || canvas.parentElement;

  // Freeze toggle (scoped: never blocks text inputs or general page scroll)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      const active = document.activeElement;
      const tag = active ? active.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || active?.isContentEditable) {
        return;
      }
      if (!running || (deck && !deck.classList.contains('is-visible') && !canvas.matches(':hover'))) {
        return;
      }
      e.preventDefault();
      frozen = !frozen;
      setMode(frozen ? '[FROZEN]' : '[RUNNING]');
      markLast(frozen ? 'FREEZE' : 'RESUME');
      setStatus(frozen ? 'PAUSED' : 'IDLE', frozen ? 'warn' : 'ok');
    }
  });

  // Resize
  window.addEventListener('resize', resize, { passive: true });

  // --- Public pulse hook (used by replay widget) ---
  function qmapPulse(evt, strength = 1.0){
    // add a few waves + a brief status tick
    const cx = W * 0.5;
    const cy = H * 0.5;
    const s = clamp(strength, 0.2, 1.2);

    waves.push(new Wave(cx, cy, '#00f3ff'));
    waves.push(new Wave(cx + (Math.random()*40-20), cy + (Math.random()*40-20), '#0aff84'));

    markLast(evt || 'PULSE');
    setStatus('PULSE', 'warn');

    // brief decay back
    setTimeout(() => setStatus(frozen ? 'PAUSED' : 'IDLE', frozen ? 'warn' : 'ok'), 420);
    // boost glow
    for (const n of nodes) n.glow = Math.max(n.glow, 0.6 * s);
  }

  window.__QMAP = window.__QMAP || {};
  window.__QMAP.pulse = qmapPulse;

  // Init nodes
  const baseCount = reducedMotion ? 12 : 18;
  for (let i = 0; i < baseCount; i++) nodes.push(new PeerNode(i));

  resize();

  if ('IntersectionObserver' in window && deck) {
    const io = new IntersectionObserver((entries) => {
      const vis = entries.some(e => e.isIntersecting);
      if (vis) start(); else stop();
    }, { threshold: 0.18 });
    io.observe(deck);
  } else {
    start();
  }
})();

// =========================================================================
// 9B. Q-MAP REPLAY WIDGET (VIDEO) - Lazy load + drag + resize + minimize
(() => {
  const section = document.getElementById('q-map-engine');
  const win = document.getElementById('qmap-replay');
  const phone = document.getElementById('qmap-phone');
  const video = document.getElementById('qmap-demo');
  const state = document.getElementById('qmap-replay-state');

  const openBtn = document.getElementById('qmap-replay-open');
  const modal = document.getElementById('qmap-modal');
  const modalBody = document.getElementById('qmap-modal-body');
  const closeBtn = document.getElementById('qmap-replay-close');

  if (!section || !win || !phone || !video) return;

  const wrapper = win.closest('.qmap-canvas-wrapper') || win.parentElement;
  if (!wrapper) return;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);

  // bump version key to ignore older cramped sizes and initialize enlarged proportions
  const KEY = 'qmapReplayWidget_v7_perfect';
  const PAD = 14;

  let loaded = false;
  let isMin = false;

  // widget state (px in wrapper coordinates)
  let x = 0, y = 0, w = 420;

  // drag/resize runtime
  let mode = null; // 'drag' | 'resize'
  let startX = 0, startY = 0;
  let startWX = 0, startWY = 0;
  let startW = 0, startWidgetX = 0, startWidgetY = 0;

  // raf batching
  let raf = 0;
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function setState(txt){ if (state) state.textContent = txt; }

  function widgetRect(){ return win.getBoundingClientRect(); }
  function wrapperRect(){ return wrapper.getBoundingClientRect(); }

  function apply(){
    win.style.width = `${Math.round(w)}px`;
    win.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  function clampIntoBounds(){
    const wr = wrapperRect();
    const r = widgetRect();

    const maxX = Math.max(PAD, wr.width - r.width - PAD);
    const maxY = Math.max(PAD, wr.height - r.height - PAD);

    x = clamp(x, PAD, maxX);
    y = clamp(y, PAD, maxY);

    // width bounds relative to wrapper with exact video aspect ratio 540 / 946 and phone bezels
    const vw = window.innerWidth;
    const isMobile = vw < 800;
    const isTablet = vw >= 800 && vw < 1180;
    const barH = 40;
    const padY = 20; // 10px top + 10px bottom bezel
    const padX = 16; // 8px left + 8px right bezel
    const availH = Math.max(220, wr.height - PAD * 2 - barH - padY);
    const heightCapW = Math.floor(availH * 540 / 946) + padX;
    const widthCapW = Math.floor(wr.width * (isMobile ? 0.94 : isTablet ? 0.68 : 0.55));
    const hardCapW = isMobile ? 380 : isTablet ? 450 : 500;
    const minW = isMobile ? 240 : 320;
    const maxW = Math.max(minW, Math.min(hardCapW, heightCapW, widthCapW, Math.floor(wr.width - PAD * 2)));
    w = clamp(w, minW, maxW);
  }

  function scheduleApply(){
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      clampIntoBounds();
      apply();
      save();
    });
  }

  function defaults(){
    const wr = wrapperRect();
    const vw = window.innerWidth;
    const isMobile = vw < 800;

    // Derived from available canvas HEIGHT using native aspect ratio 540 / 946 and phone bezels
    const BAR_H = 40;
    const PAD_Y = 20; // 10px top + 10px bottom bezel
    const PAD_X = 16; // 8px left + 8px right bezel
    const V_PAD = PAD * 2;
    const availH = Math.max(0, wr.height - V_PAD - BAR_H - PAD_Y);
    const targetW = Math.floor(availH * 540 / 946) + PAD_X;

    const isTablet = vw >= 800 && vw < 1180;
    const heightMax = Math.floor(Math.max(220, wr.height - PAD * 2 - BAR_H - PAD_Y) * 540 / 946) + PAD_X;
    const widthMax = Math.floor(wr.width * (isMobile ? 0.94 : isTablet ? 0.68 : 0.55));
    const hardMax = isMobile ? 380 : isTablet ? 450 : 500;
    const minW = isMobile ? 240 : 320;
    const maxW = Math.max(minW, Math.min(hardMax, heightMax, widthMax, Math.floor(wr.width - PAD * 2)));

    w = clamp(targetW, minW, maxW);

    win.style.width = `${w}px`;
    const r = widgetRect();

    if (isMobile) {
      // Centered horizontally below compact top telemetry HUD
      x = Math.max(PAD, Math.floor((wr.width - r.width) / 2));
      y = 46;
    } else {
      // Top-right corner: gives maximum unobstructed video height & visibility
      x = Math.floor(wr.width - r.width - PAD);
      y = PAD;
    }

    clampIntoBounds();

    isMin = (vw < 280 || wr.width < 180 || wr.height < 180);
    win.classList.toggle('is-minimized', isMin);

    apply();
    save();
  }

  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify({ x, y, w, isMin })); }catch(_){}
  }

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const obj = JSON.parse(raw);
      if (typeof obj.w === 'number') w = obj.w;
      if (typeof obj.x === 'number') x = obj.x;
      if (typeof obj.y === 'number') y = obj.y;
      isMin = !!obj.isMin;
      win.classList.toggle('is-minimized', isMin);
      clampIntoBounds();
      apply();
      return true;
    }catch(_){
      return false;
    }
  }

  // ---------- Lazy load video ----------
  function loadVideoSources(){
    if (loaded) return;
    const sources = video.querySelectorAll('source[data-src]');
    sources.forEach(s => { s.src = s.dataset.src; });
    video.load();
    loaded = true;
    setState('[BUFFERING]');

    const last = document.getElementById('qmap-last');
    if (last) last.textContent = 'REPLAY_BUFFER';
  }

  async function attemptPlay(){
    if (reducedMotion || saveData) return;
    try{
      await video.play();
      setState('[LIVE]');
      if (window.__QMAP && typeof window.__QMAP.pulse === 'function') {
        window.__QMAP.pulse('REPLAY_SYNC_PULSE', 1.0);
      }
    }catch(_){
      setState('[TAP]');
    }
  }

  function arm(){
    loadVideoSources();
    try { video.preload = 'metadata'; } catch(_){}

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => { attemptPlay(); }, { timeout: 1200 });
    } else {
      setTimeout(() => { attemptPlay(); }, 200);
    }
  }

  // Tapping/clicking video toggles play / pause with status update
  video.addEventListener('click', (e) => {
    e.stopPropagation();
    if (video.paused) {
      video.play().then(() => setState('[LIVE]')).catch(() => {});
    } else {
      video.pause();
      setState('[PAUSED]');
    }
  });

  video.addEventListener('pointerdown', () => {
    if (video.paused) attemptPlay();
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      const near = entries.some(e => e.isIntersecting);
      if (near) { arm(); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '650px 0px' });
    io.observe(section);
  } else {
    setTimeout(arm, 900);
  }

  video.addEventListener('canplay', () => {
    setState('[LIVE]');
    if (window.__QMAP && typeof window.__QMAP.pulse === 'function') {
      window.__QMAP.pulse('REPLAY_READY_PULSE', 0.85);
    }
  }, { once: true });

  video.addEventListener('error', () => {
    setState('[ERR]');
    const integrity = document.getElementById('integrity-status');
    if (integrity) { integrity.textContent = 'REPLAY_FAIL'; integrity.className = 'status-warn'; }
  });

  // ---------- Inject controls (min/reset) + resize handle ----------
  const bar = win.querySelector('.qmap-replay__bar');
  let resizeHandle = win.querySelector('.qmap-replay__resize');

  if (!resizeHandle){
    resizeHandle = document.createElement('div');
    resizeHandle.className = 'qmap-replay__resize';
    resizeHandle.setAttribute('aria-hidden', 'true');
    win.appendChild(resizeHandle);
  }

  let minBtn = win.querySelector('#qmap-replay-min');
  if (!minBtn && bar){
    minBtn = document.createElement('button');
    minBtn.id = 'qmap-replay-min';
    minBtn.type = 'button';
    minBtn.className = 'qmap-replay__btn mono';
    minBtn.textContent = 'MIN';
    if (openBtn) bar.insertBefore(minBtn, openBtn);
    else bar.appendChild(minBtn);
  }

  let resetBtn = win.querySelector('#qmap-replay-reset');
  if (!resetBtn && bar){
    resetBtn = document.createElement('button');
    resetBtn.id = 'qmap-replay-reset';
    resetBtn.type = 'button';
    resetBtn.className = 'qmap-replay__btn mono';
    resetBtn.textContent = 'RST';
    if (minBtn) bar.insertBefore(resetBtn, minBtn);
    else bar.appendChild(resetBtn);
  }

  function toggleMin(){
    isMin = !isMin;
    win.classList.toggle('is-minimized', isMin);
    setState(isMin ? '[MIN]' : '[LIVE]');
    scheduleApply();
  }

  if (minBtn) minBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleMin(); });

  if (resetBtn) resetBtn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    try{ localStorage.removeItem(KEY); }catch(_){}
    defaults();
  });

  if (bar) bar.addEventListener('dblclick', (e) => {
    if (e.target && e.target.closest('button')) return;
    toggleMin();
  });

  // ---------- Drag / Resize ----------
  function pointerToWrapper(e){
    const wr = wrapperRect();
    return { px: e.clientX - wr.left, py: e.clientY - wr.top };
  }

  function beginDrag(e){
    if (!bar) return;
    if (e.target && e.target.closest('button')) return;
    e.preventDefault();

    mode = 'drag';
    win.classList.add('is-active','is-dragging');

    const p = pointerToWrapper(e);
    startX = p.px; startY = p.py;
    startWidgetX = x; startWidgetY = y;

    bar.setPointerCapture && bar.setPointerCapture(e.pointerId);
  }

  function beginResize(e){
    e.preventDefault();

    mode = 'resize';
    win.classList.add('is-active','is-resizing');

    const p = pointerToWrapper(e);
    startWX = p.px; startWY = p.py;
    startW = w;

    resizeHandle.setPointerCapture && resizeHandle.setPointerCapture(e.pointerId);
  }

  function move(e){
    if (!mode) return;
    const p = pointerToWrapper(e);

    if (mode === 'drag'){
      const dx = p.px - startX;
      const dy = p.py - startY;
      x = startWidgetX + dx;
      y = startWidgetY + dy;
      scheduleApply();
      return;
    }

    if (mode === 'resize'){
      const dx = p.px - startWX;
      w = startW + dx;
      scheduleApply();
    }
  }

  function end(){
    if (!mode) return;
    mode = null;
    win.classList.remove('is-dragging','is-resizing');
    setTimeout(() => win.classList.remove('is-active'), 250);
    scheduleApply();
  }

  if (bar){
    bar.addEventListener('pointerdown', beginDrag);
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
  }

  if (resizeHandle){
    resizeHandle.addEventListener('pointerdown', (e) => { e.stopPropagation(); beginResize(e); });
    resizeHandle.addEventListener('pointermove', move);
    resizeHandle.addEventListener('pointerup', end);
    resizeHandle.addEventListener('pointercancel', end);
  }

  let dimT = 0;
  wrapper.addEventListener('pointermove', (e) => {
    if (e.target && e.target.closest && e.target.closest('#qmap-replay')) return;
    win.classList.add('dimmed');
    clearTimeout(dimT);
    dimT = setTimeout(() => win.classList.remove('dimmed'), 650);
  });

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => scheduleApply());
    ro.observe(wrapper);
  } else {
    window.addEventListener('resize', () => scheduleApply(), { passive: true });
  }

  // ---------- Fullscreen modal (teleport phone) ----------
  let homeParent = null;
  let homeNext = null;

  function openModal(){
    if (!modal || !modalBody) return;
    loadVideoSources();

    if (!homeParent) {
      homeParent = phone.parentElement;
      homeNext = phone.nextSibling;
    }

    modalBody.innerHTML = '';
    modalBody.appendChild(phone);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('qmap-modal-open');

    attemptPlay();
    if (window.__QMAP && typeof window.__QMAP.pulse === 'function') {
      window.__QMAP.pulse('REPLAY_FULLSCREEN_PULSE', 0.85);
    }
  }

  function closeModal(){
    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('qmap-modal-open');

    if (homeParent) {
      if (homeNext) homeParent.insertBefore(phone, homeNext);
      else homeParent.appendChild(phone);
    }
  }

  if (openBtn) openBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openModal(); });
  if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // ---------- Init layout ----------
  requestAnimationFrame(() => {
    const ok = load();
    if (!ok) defaults();
    scheduleApply();
  });
})();
// =========================================
// Q-MAP REPLAY VIDEO ENGINE
// =========================================

(() => {

  const video = document.getElementById('qmap-demo');
  const state = document.getElementById('qmap-replay-state');
  const win = document.getElementById('qmap-replay');

  if(!video) return;

  function setState(txt){
    if(state) state.textContent = txt;
  }

  // autoplay fallback
  function tryPlay(){

    video.play().then(()=>{

      setState('[LIVE]');

    }).catch(()=>{

      setState('[TAP]');
      video.addEventListener('pointerdown', ()=>video.play(), {once:true});

    });

  }

  // avvio video

  if(document.readyState === "complete"){

    setTimeout(tryPlay,300);

  }else{

    window.addEventListener('load', ()=>setTimeout(tryPlay,300));

  }

  // HUD pulse quando la rete QMAP manda eventi

  function hudPulse(){

    if(!win) return;

    win.style.boxShadow =
      "0 0 70px rgba(0,243,255,0.55), inset 0 0 20px rgba(0,0,0,0.8)";

    setTimeout(()=>{

      win.style.boxShadow =
      "0 0 35px rgba(0,243,255,0.15), inset 0 0 20px rgba(0,0,0,0.75)";

    },220);

  }

  // hook nella rete QMAP

  if(window.__QMAP){

    const oldPulse = window.__QMAP.pulse;

    window.__QMAP.pulse = function(){

      hudPulse();

      if(oldPulse) oldPulse.apply(this, arguments);

    }

  }

})();

// =========================================
// MISSION PRINCIPLES: SEAMLESS CLICK-TO-PLAY VIDEO CARDS & AUTO-PAUSE
// =========================================
(() => {
  let activeCardsCount = 0;

  function updateCardPlayingState() {
    if (activeCardsCount > 0) {
      document.documentElement.classList.add('video-card-playing');
    } else {
      document.documentElement.classList.remove('video-card-playing');
    }
  }

  function setupVideoCard(containerId, videoId, badgeId, activeText, defaultText) {
    const container = document.getElementById(containerId);
    const video = document.getElementById(videoId);
    const badge = document.getElementById(badgeId);

    if (!container || !video) return;

    video.muted = true;
    let isPlaying = false;

    function play() {
      if (!isPlaying) {
        isPlaying = true;
        activeCardsCount++;
        updateCardPlayingState();
      }
      container.classList.add('is-playing');
      if (badge) {
        const badgeLabel = badge.querySelector('.badge-label') || badge;
        badgeLabel.textContent = activeText;
        badge.classList.add('is-playing');
      }
      const pillText = container.querySelector('.qcam-play-text, .rb-play-text');
      if (pillText) pillText.textContent = 'PAUSE STREAM';
      const pillIcon = container.querySelector('.qcam-play-icon, .rb-play-icon');
      if (pillIcon) pillIcon.textContent = '■';
      video.muted = true;
      try {
        video.currentTime = 0;
      } catch (_) {}
      video.play().catch(() => {});
    }

    function pause() {
      if (isPlaying) {
        isPlaying = false;
        activeCardsCount = Math.max(0, activeCardsCount - 1);
        updateCardPlayingState();
      }
      container.classList.remove('is-playing');
      if (badge) {
        const badgeLabel = badge.querySelector('.badge-label') || badge;
        badgeLabel.textContent = defaultText;
        badge.classList.remove('is-playing');
      }
      const pillText = container.querySelector('.qcam-play-text, .rb-play-text');
      if (pillText) pillText.textContent = 'CLICK TO PLAY';
      const pillIcon = container.querySelector('.qcam-play-icon, .rb-play-icon');
      if (pillIcon) pillIcon.textContent = '▶';
      video.pause();
      // Reset to beginning after the card fade-out transition completes
      setTimeout(() => {
        if (!isPlaying) {
          try {
            video.currentTime = 0;
          } catch (_) {}
        }
      }, 360);
    }

    function toggle(e) {
      if (e) e.preventDefault();
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    }

    // Click on image container to toggle play / pause
    container.addEventListener('click', toggle);

    // Keyboard accessibility (Space / Enter / Escape)
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        toggle(e);
      } else if (e.key === 'Escape' && isPlaying) {
        e.preventDefault();
        pause();
      }
    });

    // Auto-pause when not visible to prevent GPU/CPU drain
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // Card scrolled out of view: pause immediately to release GPU resources
            if (!video.paused) {
              video.pause();
            }
          } else {
            // Card scrolled back into view: resume if active
            if (isPlaying && video.paused) {
              video.play().catch(() => {});
            }
          }
        });
      }, { threshold: 0.1 });

      observer.observe(container);
    }

    // Pause when browser tab/page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !video.paused) {
        video.pause();
      } else if (!document.hidden && isPlaying && video.paused) {
        video.play().catch(() => {});
      }
    });
  }

  // Principle 01: Decoupled Identity Video
  setupVideoCard('identityMediaContainer', 'identityVideo', 'identityBadge', 'ID::ANONYMOUS', 'ID::LOCAL');

  // Principle 02: Edge Tunnel Video
  setupVideoCard('torMediaContainer', 'torVideo', 'torBadge', 'ROUTE::TUNNEL', 'ROUTE::TOR');

  // Principle 03: Secure Vault Video
  setupVideoCard('vaultMediaContainer', 'vaultVideo', 'vaultBadge', 'VAULT::UNLOCKED', 'VAULT::LOCKED');

  // Principle 04: Whisper STT Video
  setupVideoCard('whisperMediaContainer', 'whisperVideo', 'whisperBadge', 'AI::ANIMATED', 'AI::GATED');

  // Principle 06: Ghost Mesh Radar Video
  setupVideoCard('meshMediaContainer', 'meshVideo', 'meshBadge', 'RADAR::ACTIVE', 'LAB::SAFE');

  // RadioBridge Field Video
  setupVideoCard('rbRadioMediaContainer', 'rbRadioVideo', 'rbRadioLinkBadge', 'RF LINK ACTIVE', 'RF LINK STANDBY');

  // Dynamic Telemetry HUD sync for RadioBridge Dual-Sequence (RF Link -> AIOC Hardware Rig)
  (() => {
    const rbVideo = document.getElementById('rbRadioVideo');
    const rbTitle = document.getElementById('rbRadioHudTitle');
    const rbBadge = document.getElementById('rbRadioLinkBadge');
    const rbBadgeLabel = rbBadge ? rbBadge.querySelector('.badge-label') : null;
    const rbBottom = document.getElementById('rbRadioHudBottom');
    const rbContainer = document.getElementById('rbRadioMediaContainer');

    if (!rbVideo || !rbTitle || !rbBottom) return;

    let currentPhase = -1; // 0 = RF link, 1 = Hardware AIOC

    function updateHud(phase) {
      if (currentPhase === phase) return;
      currentPhase = phase;

      if (phase === 1) {
        // AIOC Rig Hardware Phase
        rbTitle.innerHTML = '<span class="hud-sep">//</span> HARDWARE INTERFACE: AIOC ADAPTER &times; DIGITAL PTT';
        if (rbBadgeLabel && rbContainer && rbContainer.classList.contains('is-playing')) {
          rbBadgeLabel.textContent = 'AIOC RIG ACTIVE';
        }
        rbBottom.innerHTML = `
          <span class="rb-radio-spec-pill"><i class="pill-dot"></i> BAOFENG UV-5R TRANSCEIVER</span>
          <span class="rb-radio-spec-pill"><i class="pill-dot"></i> AIOC ALL-IN-ONE CABLE</span>
          <span class="rb-radio-spec-pill"><i class="pill-dot"></i> USB AUDIO CODEC + CM108</span>
          <span class="rb-radio-spec-pill"><i class="pill-dot"></i> OPTO-ISOLATED DIGITAL PTT</span>
        `;
      } else {
        // Wireless RF Link Phase
        rbTitle.innerHTML = '<span class="hud-sep">//</span> RF LINK MONITOR: BAOFENG UV-5R &times; SMARTPHONE';
        if (rbBadgeLabel && rbContainer && rbContainer.classList.contains('is-playing')) {
          rbBadgeLabel.textContent = 'RF LINK ACTIVE';
        }
        rbBottom.innerHTML = `
          <span class="rb-radio-spec-pill"><i class="pill-dot"></i> BAOFENG UV-5R TRANSCEIVER</span>
          <span class="rb-radio-spec-pill"><i class="pill-dot"></i> WIRELESS RF TRANSMISSION</span>
          <span class="rb-radio-spec-pill"><i class="pill-dot"></i> AFSK 1200 BELL 202</span>
          <span class="rb-radio-spec-pill"><i class="pill-dot"></i> HALF DUPLEX LAB LINK</span>
        `;
      }
    }

    rbVideo.addEventListener('timeupdate', () => {
      if (rbVideo.paused) return;
      // Sequence timing: 0.0s - 1.8s is RF Link, 1.8s - 11.3s is Hardware AIOC Connected Device
      if (rbVideo.currentTime >= 1.8 && rbVideo.currentTime < 11.3) {
        updateHud(1);
      } else {
        updateHud(0);
      }
    });

    rbVideo.addEventListener('pause', () => {
      updateHud(0);
    });
  })();

  // Q-CAM Field Video
  setupVideoCard('qcamMediaContainer', 'qcamVideo', 'qcamBadge', 'FEED::LIVE_STREAM', 'LIVE_DETECT');
})();

// =========================================
// DATA SANITIZER — 3D + Entrance + Counters
// =========================================
(() => {
  const section     = document.getElementById('data-sanitizer');
  const triggerArea = document.getElementById('scrubber-trigger');
  const fileStack   = document.getElementById('file-stack');
  const hint        = document.getElementById('hologramHint');

  if (!section) return;

  // ── Hover / tap per l'ologramma ──────────────────────────
  if (triggerArea && fileStack) {
    triggerArea.addEventListener('mouseenter', () => {
      fileStack.classList.remove('compressed');
      if (hint) hint.classList.add('is-hidden');
      if (window.navigator.vibrate) window.navigator.vibrate(15);
    });

    triggerArea.addEventListener('mouseleave', () => {
      fileStack.classList.add('compressed');
      if (hint) hint.classList.remove('is-hidden');
    });

    triggerArea.addEventListener('click', () => {
      fileStack.classList.toggle('compressed');
      if (hint) hint.classList.toggle('is-hidden', !fileStack.classList.contains('compressed'));
    });
  }

  // ── Counter animati per le stat ──────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 1200;
    const start    = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(p * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ── IntersectionObserver — reveal + auto-expand + counters ─
  let revealed = false;
  const scrubberObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !revealed) {
        revealed = true;
        section.classList.add('is-visible');

        // Auto-espande ologramma 0.8s dopo ingresso (solo desktop)
        if (window.innerWidth > 900 && fileStack) {
          setTimeout(() => {
            fileStack.classList.remove('compressed');
            if (hint) hint.classList.add('is-hidden');
          }, 800);
        }

        // Avvia contatori stat
        section.querySelectorAll('.stat-val[data-target]').forEach((el, i) => {
          setTimeout(() => animateCounter(el), 400 + i * 120);
        });
      }
    });
  }, { threshold: 0.18 });

  scrubberObserver.observe(section);
})();

// =========================================
// MANIFESTO SECTION — Reveal on scroll
// =========================================
(() => {
  const manifesto = document.querySelector('.manifesto-section');
  if (!manifesto) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        manifesto.classList.add('is-visible');
        obs.disconnect();
      }
    });
  }, { threshold: 0.15 });

  obs.observe(manifesto);
})();

// =========================================================================
// 10. CRYPTO TYPEWRITER REVEAL EFFECT (STT SECTION)
// =========================================================================
(() => {
    const reveals = document.querySelectorAll('.crypto-reveal');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>";

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                
                if (el.dataset.revealed === "true") return; 
                el.dataset.revealed = "true";
                
                const finalString = el.getAttribute('data-final');
                let iterations = 0;
                const duration = 35; 
                const maxIterations = finalString.length * 2; 

                const interval = setInterval(() => {
                    el.innerText = finalString.split('').map((char, index) => {
                        if (char === " ") return " ";
                        if (index < Math.floor(iterations / 2)) {
                            return finalString[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join('');

                    iterations++;
                    
                    if (iterations >= maxIterations) {
                        clearInterval(interval);
                        el.innerText = finalString;
                    }
                }, duration);
            }
        });
    }, { threshold: 0.5 });

    reveals.forEach(el => observer.observe(el));
})();

// =========================================
// Q-SDR MODULE — Radio Frequency Analysis
// =========================================
(function initQSDR() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sdrSection = document.getElementById('q-sdr');
  if (!sdrSection) return;

  let animating = false;
  let rafSpectrum = null, rafWaterfall = null, rafRadar = null, rafActivity = null, rafParticles = null;
  let liveInterval = null;

  // Stato condiviso tra moduli
  let gainLevel    = 28;   // valore default (0–49 dB)
  let activePreset = '2.4 GHz';  // preset selezionato

  // Mappa preset → dati frequenza + picchi da evidenziare nello spectrum
  const PRESETS = {
    '2.4 GHz': { freq: '2.412 000', unit: 'GHz', highlight: [0.52, 0.59] },
    '433 MHz':  { freq: '433.920',  unit: 'MHz',  highlight: [0.18] },
    '868 MHz':  { freq: '868.350',  unit: 'MHz',  highlight: [0.34] },
    'UHF/VHF':  { freq: '156.800',  unit: 'MHz',  highlight: [0.08] },
  };

  // IntersectionObserver: start/pause canvas loops when visible
  const sdrObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animating) {
        sdrSection.classList.add('is-visible');
        animating = true;
        startAll();
      } else if (!entry.isIntersecting && animating) {
        animating = false;
        stopAll();
      }
    });
  }, { threshold: 0.08 });

  sdrObserver.observe(sdrSection);

  function startAll() {
    if (!reducedMotion) {
      startSpectrum();
      startWaterfall();
      startRadar();
      startActivityRadar();
      startParticles();
    }
    startLiveUpdates();
  }

  function stopAll() {
    [rafSpectrum, rafWaterfall, rafRadar, rafActivity, rafParticles].forEach(id => id && cancelAnimationFrame(id));
    rafSpectrum = rafWaterfall = rafRadar = rafActivity = rafParticles = null;
    stopLiveUpdates();
  }

  // --------------------------------------------------
  // SPECTRUM CANVAS
  // --------------------------------------------------
  function startSpectrum() {
    const canvas = document.getElementById('spectrumCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d');
    let dpr = window.__qpDpr();

    function resize() {
      dpr = window.__qpDpr();
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      canvas.width  = r.width  * dpr;
      canvas.height = r.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Peaks: [normalised-x, height-fraction, peak-width, colour]
    const peaks = [
      { x: 0.18, h: 0.42, w: 0.018, c: '#00f2ff' },  // 433.92 MHz
      { x: 0.34, h: 0.32, w: 0.016, c: '#00e5c8' },  // 868.35 MHz
      { x: 0.52, h: 0.80, w: 0.024, c: '#35ff8a' },  // 2.412 GHz (primary)
      { x: 0.59, h: 0.52, w: 0.022, c: '#35ff8a' },  // 2.4 GHz side-lobe
      { x: 0.78, h: 0.28, w: 0.020, c: '#1d7cff' },  // 5.795 GHz
    ];

    const labels = [
      { x: 0.18, text: '433.92 MHz', color: 'rgba(0,242,255,0.55)' },
      { x: 0.34, text: '868.35 MHz', color: 'rgba(0,229,200,0.55)' },
      { x: 0.52, text: '2.412 GHz',  color: 'rgba(53,255,138,0.85)' },
      { x: 0.78, text: '5.795 GHz',  color: 'rgba(29,124,255,0.55)' },
    ];

    let t = 0;

    function drawSpectrum() {
      if (!animating) return;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(0,242,255,0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 1; i <= 5; i++) {
        const y = H * 0.05 + (H * 0.88 * i / 5);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let i = 1; i <= 7; i++) {
        const x = W * i / 8;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Highlighted 2.4 GHz band
      const bx = W * 0.465, bw = W * 0.17;
      ctx.fillStyle = 'rgba(53,255,138,0.04)';
      ctx.fillRect(bx, 0, bw, H);
      ctx.strokeStyle = 'rgba(53,255,138,0.2)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(bx,      0); ctx.lineTo(bx,      H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw, 0); ctx.lineTo(bx + bw, H); ctx.stroke();

      // Build spectrum points — ampiezza scalata dal gain (28 dB = 1.0x)
      const gainScale  = Math.max(0.3, gainLevel / 28);
      const floor = H * 0.90;
      const pts = [];
      const preset     = PRESETS[activePreset] || PRESETS['2.4 GHz'];
      for (let px = 0; px <= W; px++) {
        const nx = px / W;
        let val = Math.random() * 0.04 * H;
        for (let pi = 0; pi < peaks.length; pi++) {
          const p = peaks[pi];
          const d = nx - p.x;
          const g = Math.exp(-(d * d) / (2 * p.w * p.w));
          // Picco del preset attivo risaltato del 30%
          const presetBoost = preset.highlight.includes(p.x) ? 1.3 : 1.0;
          val += g * H * p.h * gainScale * presetBoost * (1 + 0.06 * Math.sin(t * (0.4 + pi * 0.25) + pi));
        }
        pts.push({ x: px, y: floor - val });
      }

      // Filled area gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0,   'rgba(53,255,138,0.16)');
      grad.addColorStop(0.45,'rgba(0,242,255,0.07)');
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (const p of pts) ctx.lineTo(p.x, p.y);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Spectrum line
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else         ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = '#00f2ff';
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = 7;
      ctx.shadowColor = '#00f2ff';
      ctx.stroke();

      // Peak markers (dots + vertical tick + label)
      ctx.shadowBlur = 0;
      for (const lbl of labels) {
        const px  = lbl.x * W;
        const py  = floor - (peaks.find(p => p.x === lbl.x)?.h || 0.3) * H;
        ctx.strokeStyle = lbl.color;
        ctx.lineWidth   = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(px, py + 6); ctx.lineTo(px, H); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle   = lbl.color;
        ctx.shadowBlur  = 10;
        ctx.shadowColor = lbl.color;
        ctx.fill();
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = lbl.color;
        ctx.font        = `9px var(--font-mono, monospace)`;
        ctx.textAlign   = 'center';
        ctx.fillText(lbl.text, px, H - 2);
      }
      ctx.textAlign = 'left';

      t += 0.022;
      rafSpectrum = requestAnimationFrame(drawSpectrum);
    }

    drawSpectrum();
  }

  // --------------------------------------------------
  // WATERFALL CANVAS
  // --------------------------------------------------
  function startWaterfall() {
    const canvas = document.getElementById('waterfallCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d');
    let dpr = window.__qpDpr();
    let imgData = null;

    function resize() {
      dpr = window.__qpDpr();
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      canvas.width  = Math.round(r.width  * dpr);
      canvas.height = Math.round(r.height * dpr);
      imgData = null; // trigger recreate
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Peak x-positions matching spectrum
    const peaksX = [0.18, 0.34, 0.52, 0.59, 0.78];

    function toRGB(v) {
      v = Math.max(0, Math.min(1, v));
      if (v < 0.22) {
        const t = v / 0.22;
        return [0, Math.round(t * 30), Math.round(20 + t * 65)];
      } else if (v < 0.52) {
        const t = (v - 0.22) / 0.3;
        return [0, Math.round(30 + t * 195), Math.round(85 - t * 60)];
      } else if (v < 0.76) {
        const t = (v - 0.52) / 0.24;
        return [Math.round(t * 80), Math.round(225 + t * 30), Math.round(25 - t * 15)];
      } else if (v < 0.92) {
        const t = (v - 0.76) / 0.16;
        return [Math.round(80 + t * 175), Math.round(255 - t * 90), 0];
      } else {
        return [255, Math.round(165 - (v - 0.92) / 0.08 * 165), 0];
      }
    }

    let lastTs = 0;
    const fps  = 18;
    const fpsInterval = 1000 / fps;

    function drawRow() {
      const W = canvas.width;
      const H = canvas.height;

      if (!imgData || imgData.width !== W || imgData.height !== H) {
        imgData = ctx.createImageData(W, H);
      }

      const data = imgData.data;
      const rowBytes = W * 4;

      // Shift all rows down by 1
      data.copyWithin(rowBytes, 0, (H - 1) * rowBytes);

      // Generate new top row
      const now = Date.now() * 0.001;
      for (let x = 0; x < W; x++) {
        const nx  = x / W;
        let   val = Math.random() * 0.07;
        for (let pi = 0; pi < peaksX.length; pi++) {
          const d  = nx - peaksX[pi];
          const pw = 0.018 + Math.random() * 0.004;
          const g  = Math.exp(-(d * d) / (2 * pw * pw));
          const tv = 0.55 + 0.45 * Math.abs(Math.sin(now * (0.3 + pi * 0.18) + pi * 1.3));
          val += g * 0.88 * tv;
        }
        const [r, g, b] = toRGB(val);
        const idx = x * 4;
        data[idx]     = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }

      ctx.putImageData(imgData, 0, 0);
    }

    function animateWF(ts) {
      if (!animating) return;
      if (ts - lastTs >= fpsInterval) { drawRow(); lastTs = ts; }
      rafWaterfall = requestAnimationFrame(animateWF);
    }
    rafWaterfall = requestAnimationFrame(animateWF);
  }

  // --------------------------------------------------
  // RADAR CANVAS (Signal Detection)
  // --------------------------------------------------
  function startRadar() {
    const canvas = document.getElementById('radarCanvas');
    if (!canvas) return;
    const dpr  = window.__qpDpr();
    const SIZE = 110;
    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const cx = SIZE / 2, cy = SIZE / 2, R = SIZE * 0.44;
    let sweep = 0;

    const blips = [
      { a: 0.7,  rf: 0.52, c: '#35ff8a', s: 3   },
      { a: 2.0,  rf: 0.70, c: '#35ff8a', s: 2.5 },
      { a: 3.3,  rf: 0.38, c: '#f5c55a', s: 2   },
      { a: 4.6,  rf: 0.62, c: '#ff7a3c', s: 2   },
      { a: 5.3,  rf: 0.80, c: '#9b5cff', s: 2.5 },
    ];

    function drawRadar() {
      if (!animating) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Concentric rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * i / 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,242,255,${0.07 + i * 0.03})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
      // Cross hairs
      ctx.strokeStyle = 'rgba(0,242,255,0.08)';
      ctx.lineWidth   = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

      // Sweep trail (filled arc)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sweep - 1.0, sweep);
      ctx.closePath();
      const trailGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      trailGrad.addColorStop(0, 'rgba(53,255,138,0.0)');
      trailGrad.addColorStop(1, 'rgba(53,255,138,0.14)');
      ctx.fillStyle = trailGrad;
      ctx.fill();

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      ctx.strokeStyle = 'rgba(53,255,138,0.9)';
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = '#35ff8a';
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // Blips with fade based on sweep distance
      for (const b of blips) {
        const diff    = ((b.a - sweep) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const opacity = Math.max(0.08, 1 - diff / (Math.PI * 2));
        const bx      = cx + Math.cos(b.a) * R * b.rf;
        const by      = cy + Math.sin(b.a) * R * b.rf;
        ctx.beginPath();
        ctx.arc(bx, by, b.s, 0, Math.PI * 2);
        ctx.fillStyle   = b.c;
        ctx.shadowBlur  = 12;
        ctx.shadowColor = b.c;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }

      sweep = (sweep + 0.03) % (Math.PI * 2);
      rafRadar = requestAnimationFrame(drawRadar);
    }

    drawRadar();
  }

  // --------------------------------------------------
  // ACTIVITY RADAR (small)
  // --------------------------------------------------
  function startActivityRadar() {
    const canvas = document.getElementById('activityRadar');
    if (!canvas) return;
    const dpr  = window.__qpDpr();
    const SIZE = 80;
    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const cx = SIZE / 2, cy = SIZE / 2, R = SIZE * 0.42;
    let sweep = Math.PI; // offset from main radar

    const blips = [
      { a: 1.3,  rf: 0.5,  c: '#35ff8a' },
      { a: 3.8,  rf: 0.68, c: '#00f2ff' },
      { a: 5.1,  rf: 0.33, c: '#9b5cff' },
    ];

    function drawSmallRadar() {
      if (!animating) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * i / 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,242,255,0.1)';
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      ctx.strokeStyle = 'rgba(0,229,200,0.85)';
      ctx.lineWidth   = 1.2;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = '#00e5c8';
      ctx.stroke();
      ctx.shadowBlur  = 0;

      for (const b of blips) {
        const bx = cx + Math.cos(b.a) * R * b.rf;
        const by = cy + Math.sin(b.a) * R * b.rf;
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle   = b.c;
        ctx.shadowBlur  = 9;
        ctx.shadowColor = b.c;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      sweep = (sweep + 0.04) % (Math.PI * 2);
      rafActivity = requestAnimationFrame(drawSmallRadar);
    }

    drawSmallRadar();
  }

  // --------------------------------------------------
  // BACKGROUND PARTICLES
  // --------------------------------------------------
  function startParticles() {
    const canvas = document.getElementById('qsdrParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d');
    let dpr = window.__qpDpr();

    function resize() {
      dpr = window.__qpDpr();
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      canvas.width  = r.width  * dpr;
      canvas.height = r.height * dpr;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const NUM = 45;
    const colors = ['#00f2ff', '#35ff8a', '#00e5c8', '#1d7cff'];
    const particles = Array.from({ length: NUM }, () => ({
      x:  Math.random(),
      y:  Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      r:  0.4 + Math.random() * 1.4,
      a:  0.15 + Math.random() * 0.5,
      c:  colors[Math.floor(Math.random() * colors.length)],
      ph: Math.random() * Math.PI * 2,
    }));

    function drawParticles() {
      if (!animating) return;
      const W = canvas.width  / dpr;
      const H = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const now = Date.now() * 0.001;
      for (const p of particles) {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle   = p.c;
        ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(now * 0.8 + p.ph));
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafParticles = requestAnimationFrame(drawParticles);
    }

    drawParticles();
  }

  // --------------------------------------------------
  // LIVE VALUE UPDATES (subtle jitter)
  // --------------------------------------------------
  function startLiveUpdates() {
    liveInterval = setInterval(() => {
      // Center frequency micro-jitter
      const fEl = document.getElementById('freqValue');
      if (fEl) {
        const noise = Math.floor(Math.random() * 10);
        fEl.textContent = `2.412 00${noise}`;
      }

      // Signal count ±1
      const cEl = document.getElementById('signalCount');
      const aEl = document.getElementById('activityStatus');
      if (cEl) {
        const base   = 7;
        const offset = Math.random() < 0.25 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        const count  = Math.max(1, base + offset);
        cEl.textContent = count;
        if (aEl) aEl.textContent = `${count} ACTIVE`;
      }
    }, 3200);
  }

  function stopLiveUpdates() {
    if (liveInterval) { clearInterval(liveInterval); liveInterval = null; }
  }

  // --------------------------------------------------
  // SLIDER CONTROLS
  // --------------------------------------------------
  const spanSlider    = document.getElementById('sdrSpanSlider');
  const gainSlider    = document.getElementById('sdrGainSlider');
  const squelchSlider = document.getElementById('sdrSquelchSlider');

  if (spanSlider) spanSlider.addEventListener('input', () => {
    const v = spanSlider.value;
    document.getElementById('spanDisplay').textContent = `${v}.0 MHz`;
    spanSlider.setAttribute('aria-valuetext', `${v} MHz`);
  });

  if (gainSlider) gainSlider.addEventListener('input', () => {
    const v = parseInt(gainSlider.value, 10);
    gainLevel = v;   // aggiorna il gain condiviso → lo spectrum lo legge in tempo reale
    document.getElementById('gainDisplay').textContent = `+${v} dB`;
    gainSlider.setAttribute('aria-valuetext', `${v} dB`);
  });

  if (squelchSlider) squelchSlider.addEventListener('input', () => {
    const v = squelchSlider.value;
    document.getElementById('squelchDisplay').textContent = `${v < 0 ? '−' : ''}${Math.abs(v)} dB`;
    squelchSlider.setAttribute('aria-valuetext', `${v} dB`);
  });

  // --------------------------------------------------
  // PRESET BUTTONS — aggiornano frequenza + spectrum highlight
  // --------------------------------------------------
  document.querySelectorAll('.sdr-preset:not(.sdr-preset--add)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sdr-preset').forEach(b => {
        b.classList.remove('sdr-preset--active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('sdr-preset--active');
      btn.setAttribute('aria-pressed', 'true');

      // Identifica il preset dalla label visibile
      const freqLabel = btn.querySelector('.sdr-preset-freq')?.textContent?.trim() || '';
      const key = Object.keys(PRESETS).find(k => freqLabel.startsWith(k.split(' ')[0])) || '2.4 GHz';
      activePreset = key;

      // Aggiorna il display della frequenza centrale
      const fEl = document.getElementById('freqValue');
      if (fEl && PRESETS[key]) fEl.textContent = PRESETS[key].freq;
    });
  });

  // --------------------------------------------------
  // SCAN BUTTON TOGGLE — pausa/riprende TUTTE le animazioni canvas
  // --------------------------------------------------
  const scanBtn   = document.getElementById('qsdrScanBtn');
  const dashboard = sdrSection.querySelector('.sdr-dashboard');

  if (scanBtn) {
    let scanning = true;
    scanBtn.addEventListener('click', () => {
      scanning = !scanning;
      const statusEl = scanBtn.querySelector('.scan-status');

      if (scanning) {
        // Riprende
        scanBtn.classList.add('sdr-action--scanning');
        scanBtn.setAttribute('aria-pressed', 'true');
        if (statusEl) statusEl.textContent = 'SCANNING';
        dashboard?.classList.remove('is-paused');
        if (!animating) { animating = true; startAll(); }
      } else {
        // Pausa reale: ferma i RAF e segna il dashboard
        scanBtn.classList.remove('sdr-action--scanning');
        scanBtn.setAttribute('aria-pressed', 'false');
        if (statusEl) statusEl.textContent = 'PAUSED';
        animating = false;
        stopAll();
        stopLiveUpdates();
        dashboard?.classList.add('is-paused');
      }
    });
  }

  // --------------------------------------------------
  // ALERT PERIODICO — segnale sconosciuto che appare/scompare
  // --------------------------------------------------
  function startAlertCycle() {
    const unknownItem = sdrSection.querySelector('.signal-item:last-child');
    if (!unknownItem) return;

    setInterval(() => {
      if (!animating) return;
      unknownItem.classList.add('is-alert');
      setTimeout(() => unknownItem.classList.remove('is-alert'), 2800);
    }, 8000 + Math.random() * 4000); // ogni 8-12 secondi
  }
  startAlertCycle();

  // Bootstrap if section already in viewport on load
  const initRect = sdrSection.getBoundingClientRect();
  if (initRect.top < window.innerHeight && initRect.bottom > 0) {
    sdrSection.classList.add('is-visible');
    animating = true;
    startAll();
  }
})();

})(); 

// =========================================
// Q-SDR COMPATIBLE HARDWARE VIEWER MODULE
// =========================================
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const viewButtons = document.querySelectorAll('.sdr-hw-view-btn');
    if (!viewButtons.length) return;

    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.sdr-hw-card');
        if (!card) return;

        const targetSrc = btn.getAttribute('data-src');
        const fallbackSrc = btn.getAttribute('data-fallback') || targetSrc;
        const img = card.querySelector('.sdr-hw-img');
        const picture = card.querySelector('picture');

        if (!img || !targetSrc) return;

        if (picture) {
          const source = picture.querySelector('source');
          if (source) {
            if (targetSrc.endsWith('.webp')) {
              source.srcset = targetSrc;
              source.type = 'image/webp';
            } else {
              source.srcset = '';
            }
          }
        }

        img.src = targetSrc.endsWith('.webp') ? fallbackSrc : targetSrc;

        card.querySelectorAll('.sdr-hw-view-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  });
})();

// =========================================
// LORA APEX PREDATOR T-DECK VIEWER MODULE
// =========================================
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const tdeckBtns = document.querySelectorAll('.tdeck-view-btn');
    if (!tdeckBtns.length) return;

    tdeckBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.tdeck-card') || btn.closest('.flasher-visual');
        if (!card) return;

        const targetSrc = btn.getAttribute('data-src');
        const fallbackSrc = btn.getAttribute('data-fallback') || targetSrc;
        const img = card.querySelector('.tdeck-img');
        const picture = card.querySelector('.tdeck-picture, picture');

        if (!img || !targetSrc) return;

        // Visual glitch/switch feedback
        img.style.opacity = '0.35';
        img.style.transform = 'scale(0.97)';

        setTimeout(() => {
          if (picture) {
            const source = picture.querySelector('source');
            if (source) {
              if (targetSrc.endsWith('.webp')) {
                source.srcset = targetSrc;
                source.type = 'image/webp';
              } else {
                source.srcset = '';
              }
            }
          }

          img.src = targetSrc.endsWith('.webp') ? fallbackSrc : targetSrc;
          img.style.opacity = '1';
          img.style.transform = '';
        }, 80);

        card.querySelectorAll('.tdeck-view-btn').forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      });
    });
  });
})();

// =========================================
// Q-CALL runtime module
// =========================================
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const section = document.getElementById('q-call');
    if (!section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const particlesCanvas = document.getElementById('qcallParticles');
    const waveformCanvas = document.getElementById('qcallWaveform');
    const radarCanvas = document.getElementById('qcallRiskRadar');
    const timer = document.getElementById('qcallTimer');
    const latency = document.getElementById('qcallLatency');
    const jitter = document.getElementById('qcallJitter');
    const pktLoss = document.getElementById('qcallPktLoss');
    const routeValue = document.getElementById('qcallRoute');
    const routeBtn = document.getElementById('qcallRouteBtn');
    const checklistItems = Array.from(section.querySelectorAll('.opsec-item'));

    let visible = false;
    let rafParticles = 0;
    let rafWaveform = 0;
    let rafRadar = 0;
    let timerInterval = 0;
    let elapsed = 12 * 60 + 48;

    const colors = ['#00f2ff', '#35ff8a', '#00e5c8', '#1d7cff', '#9b5cff'];

    function formatTime(totalSeconds) {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return h > 0
        ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function setupCanvas(canvas, defaultW, defaultH) {
      if (!canvas) return null;
      const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d');
      if (!ctx) return null;
      let dpr = window.__qpDpr();
      const resize = () => {
        dpr = window.__qpDpr();
        let displayW = 0;
        let displayH = 0;
        if (canvas.id === 'qcallRiskRadar') {
          const rect = canvas.getBoundingClientRect();
          displayW = Math.min(80, Math.max(50, rect.width || canvas.clientWidth || 80));
          displayH = displayW;
        } else if (canvas.id === 'qcallWaveform') {
          const rect = canvas.getBoundingClientRect();
          displayW = Math.min(220, Math.max(80, rect.width || canvas.clientWidth || 180));
          displayH = Math.min(50, Math.max(24, rect.height || canvas.clientHeight || 36));
        } else {
          const rect = canvas.getBoundingClientRect();
          displayW = rect.width || canvas.clientWidth || (canvas.parentElement ? canvas.parentElement.clientWidth : (defaultW || 300));
          displayH = rect.height || canvas.clientHeight || (canvas.parentElement ? canvas.parentElement.clientHeight : (defaultH || 150));
        }
        if (!displayW || !displayH) return;
        const targetW = Math.max(1, Math.floor(displayW * dpr));
        const targetH = Math.max(1, Math.floor(displayH * dpr));
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize, { passive: true });
      return { canvas, ctx, resize, get dpr() { return dpr; } };
    }

    const particles = setupCanvas(particlesCanvas);
    const waveform = setupCanvas(waveformCanvas, 180, 36);
    const radar = setupCanvas(radarCanvas, 80, 80);

    const particleSet = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00022,
      vy: (Math.random() - 0.5) * 0.00018,
      r: 0.45 + Math.random() * 1.4,
      a: 0.12 + Math.random() * 0.48,
      c: colors[Math.floor(Math.random() * colors.length)],
      p: Math.random() * Math.PI * 2
    }));

    function drawParticles() {
      if (!visible || reduceMotion.matches || !particles) return;
      const { canvas, ctx, dpr } = particles;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const now = performance.now() * 0.001;
      ctx.clearRect(0, 0, w, h);
      for (const p of particleSet) {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.globalAlpha = p.a * (0.5 + 0.5 * Math.sin(now + p.p));
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafParticles = requestAnimationFrame(drawParticles);
    }

    function drawWaveform() {
      if (!visible || reduceMotion.matches || !waveform) return;
      const { canvas, ctx, dpr } = waveform;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const now = performance.now() * 0.006;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00f2ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f2ff';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const amp = 6 + 5 * Math.sin(now * 0.7 + x * 0.025);
        const y = h / 2 + Math.sin(now + x * 0.16) * amp + Math.sin(now * 1.7 + x * 0.05) * 2;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      rafWaveform = requestAnimationFrame(drawWaveform);
    }

    function drawRadar() {
      if (!visible || reduceMotion.matches || !radar) return;
      const { canvas, ctx, dpr } = radar;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.44;
      const now = performance.now() * 0.001;
      ctx.clearRect(0, 0, w, h);

      // Range rings
      ctx.strokeStyle = 'rgba(0,242,255,0.22)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i += 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius * i) / 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.strokeStyle = 'rgba(0,242,255,0.12)';
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Radar sweep sector glow
      const angle = now * 1.35;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle - 0.45, angle);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
      sweepGrad.addColorStop(0, 'rgba(53,255,138,0.28)');
      sweepGrad.addColorStop(1, 'rgba(53,255,138,0.02)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Sweep leading beam
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.strokeStyle = '#35ff8a';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#35ff8a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Pulsing telemetry blips
      const blips = [0.7, 2.4, 4.1, 5.2];
      blips.forEach((a, i) => {
        const pulse = 0.55 + 0.45 * Math.sin(now * 2 + i);
        const bx = cx + Math.cos(a) * radius * (0.35 + i * 0.13);
        const by = cy + Math.sin(a) * radius * (0.35 + i * 0.13);
        ctx.fillStyle = i === 2 ? '#ffd166' : '#00f2ff';
        ctx.shadowColor = i === 2 ? '#ffd166' : '#00f2ff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(bx, by, 2 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      rafRadar = requestAnimationFrame(drawRadar);
    }

    function startTimer() {
      if (timerInterval || !timer) return;
      timerInterval = window.setInterval(() => {
        elapsed += 1;
        timer.textContent = formatTime(elapsed);
      }, 1000);
    }

    function stopTimer() {
      if (timerInterval) window.clearInterval(timerInterval);
      timerInterval = 0;
    }

    function start() {
      section.classList.add('is-visible');
      if (visible) return;
      visible = true;
      if (!reduceMotion.matches) {
        drawParticles();
        drawWaveform();
        drawRadar();
      }
      startTimer();
      checklistItems.forEach((item, index) => {
        window.setTimeout(() => item.classList.add('checked'), 160 + index * 150);
      });
    }

    function stop() {
      visible = false;
      cancelAnimationFrame(rafParticles);
      cancelAnimationFrame(rafWaveform);
      cancelAnimationFrame(rafRadar);
      stopTimer();
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start(); else stop();
        });
      }, { threshold: 0.16 });
      observer.observe(section);
    } else {
      start();
    }

    section.querySelectorAll('.qcall-ctrl[aria-pressed]').forEach((button) => {
      button.addEventListener('click', () => {
        const active = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('is-active', active);
      });
    });

    const routeModes = Array.from(section.querySelectorAll('.route-mode'));
    const routeProfiles = {
      direct: { label: 'Direct', latency: '42 ms', jitter: '8 ms', loss: '0.2%' },
      relay: { label: 'Relay', latency: '86 ms', jitter: '14 ms', loss: '0.4%' },
      tor: { label: 'Tor-ready', latency: '184 ms', jitter: '22 ms', loss: '0.8%' }
    };

    function setRoute(mode) {
      const profile = routeProfiles[mode] || routeProfiles.direct;
      routeModes.forEach((button) => {
        const active = button.dataset.route === mode;
        button.classList.toggle('route-mode--active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (routeValue) routeValue.textContent = profile.label;
      if (latency) latency.textContent = profile.latency;
      if (jitter) jitter.textContent = profile.jitter;
      if (pktLoss) pktLoss.textContent = profile.loss;
    }

    routeModes.forEach((button) => {
      button.addEventListener('click', () => setRoute(button.dataset.route || 'direct'));
    });

    if (routeBtn && routeModes.length) {
      routeBtn.addEventListener('click', () => {
        const currentIndex = Math.max(0, routeModes.findIndex((button) => button.classList.contains('route-mode--active')));
        const next = routeModes[(currentIndex + 1) % routeModes.length];
        setRoute(next?.dataset.route || 'direct');
      });
    }

    reduceMotion.addEventListener?.('change', () => {
      stop();
      if (section.classList.contains('is-visible')) start();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (section.classList.contains('is-visible')) start();
    });

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) start();
  });
})();

// =========================================
// Q-AI runtime module
// =========================================
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const section = document.getElementById('q-ai');
    if (!section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.getElementById('qaiNeuralCanvas');
    const activeModule = document.getElementById('qaiActiveModule');
    const scenarioTitle = document.getElementById('qaiScenarioTitle');
    const scenarioText = document.getElementById('qaiScenarioText');
    const terminalLine = document.getElementById('qaiTerminalLine');
    const meterFill = section.querySelector('.qai-risk-meter span');
    const tabs = Array.from(section.querySelectorAll('.qai-module-tab'));
    const cards = Array.from(section.querySelectorAll('.qai-tool-card'));
    const counters = Array.from(section.querySelectorAll('[data-qai-count]'));
    const qaiVideo = document.getElementById('qaiVideo');
    const qaiVideoBox = document.getElementById('qaiVideoBox');
    const qaiVideoHudText = document.getElementById('qaiVideoHudText');

    const modules = {
      brain: {
        title: 'Q-BRAIN LOCAL',
        brief: 'Private assistant runtime',
        text: 'Local Q-Brain generation, memory compression, vision intake and guarded tool calls run as scoped sessions with queue control.',
        cmd: 'qbrain.start --runtime local --tools governed',
        fill: '92%'
      },
      models: {
        title: 'MODEL MATRIX',
        brief: 'AiPack runtime catalog',
        text: 'LLM, embedding, STT, translation, TTS, multimodal vision and image generation packs expose runtime metadata, integrity checks and acceleration hints.',
        cmd: 'aipacks.scan --types llm,embedding,stt,tts,image,vision',
        fill: '88%'
      },
      tools: {
        title: 'TOOL ROUTER',
        brief: 'Typed actions with audit',
        text: 'Notes, vault knowledge, app feature controls, image prompt tools, LoRa and sandbox tools are routed through schema validation and risk policy.',
        cmd: 'tools.dispatch --risk-gate --confirm --audit',
        fill: '84%'
      },
      sandbox: {
        title: 'SANDBOX PRO',
        brief: 'Isolated command execution',
        text: 'Linux sandbox policy checks working directories, host paths, network mode, dangerous patterns and lab-only commands before execution.',
        cmd: 'sandbox.validate --mode ask_every_time --network allowlist',
        fill: '79%'
      },
      scenario: {
        title: 'Q-SCENARIO ENGINE',
        brief: 'Automation with manual review',
        text: 'Scenario actions can transform QVars, run ActionForge tools, ask Q-Brain, write vault logs, request Tor identity and send LoRa payloads with review gates.',
        cmd: 'qscenario.run --manual-review risky-actions',
        fill: '86%'
      },
      governance: {
        title: 'GOVERNANCE LAYER',
        brief: 'Skill policies and Ghost Mode',
        text: 'Skill profiles define allowed tools, blocked tools, confirmation lists and max tool steps. Ghost Mode denies dangerous categories by default.',
        cmd: 'governance.trace --dry-run --human-in-loop',
        fill: '96%'
      }
    };

    let visible = false;
    let raf = 0;
    let dpr = window.__qpDpr();
    let ctx = null;
    let nodes = [];
    let counterStarted = false;

    function resizeCanvas() {
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      dpr = window.__qpDpr();
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    }

    function seedNodes() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const lite = document.documentElement.classList.contains('perf-lite');
      const total = lite ? Math.max(22, Math.min(44, Math.floor(rect.width / 28))) : Math.max(38, Math.min(72, Math.floor(rect.width / 20)));
      nodes = Array.from({ length: total }, (_, index) => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1 + Math.random() * 1.7,
        hue: index % 5,
        phase: Math.random() * Math.PI * 2
      }));
    }

    function colorFor(index, alpha = 1) {
      const palette = [
        `rgba(0, 242, 255, ${alpha})`,
        `rgba(53, 255, 138, ${alpha})`,
        `rgba(155, 92, 255, ${alpha})`,
        `rgba(29, 124, 255, ${alpha})`,
        `rgba(255, 209, 102, ${alpha})`
      ];
      return palette[index % palette.length];
    }

    function drawNeural() {
      if (!visible || reduceMotion.matches || !ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const now = performance.now() * 0.001;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 132) {
            const alpha = (1 - dist / 132) * 0.22;
            ctx.strokeStyle = colorFor(a.hue + b.hue, alpha);
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const pulse = 0.55 + 0.45 * Math.sin(now * 1.7 + n.phase);
        ctx.fillStyle = colorFor(n.hue, 0.45 + pulse * 0.45);
        ctx.shadowBlur = 12;
        ctx.shadowColor = colorFor(n.hue, 0.8);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(drawNeural);
    }

    function setModule(key) {
      const resolvedKey = modules[key] ? key : 'brain';
      const data = modules[resolvedKey];
      tabs.forEach((tab) => {
        const active = tab.dataset.qaiModule === resolvedKey;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      cards.forEach((card) => {
        card.classList.toggle('is-active', card.dataset.qaiCard === resolvedKey);
      });
      if (activeModule) activeModule.textContent = data.title;
      if (scenarioTitle) scenarioTitle.textContent = data.brief;
      if (scenarioText) scenarioText.textContent = data.text;
      if (terminalLine) terminalLine.textContent = data.cmd;
      if (meterFill) meterFill.style.setProperty('--qai-fill', data.fill);
      if (qaiVideoHudText) {
        qaiVideoHudText.textContent = `Q-BRAIN // ${data.title.replace(/\s+/g, '_')}`;
      }
    }

    function animateCounters() {
      if (counterStarted) return;
      counterStarted = true;
      counters.forEach((counter, index) => {
        const target = Number(counter.dataset.qaiCount || 0);
        const duration = 900 + index * 160;
        const started = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          counter.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }

    function start() {
      section.classList.add('is-visible');
      animateCounters();
      if (qaiVideo && !reduceMotion.matches && qaiVideo.paused) {
        qaiVideo.play().catch(() => {});
      }
      if (visible) return;
      visible = true;
      if (!reduceMotion.matches) {
        resizeCanvas();
        drawNeural();
      }
    }

    function stop() {
      visible = false;
      cancelAnimationFrame(raf);
      if (qaiVideo && !qaiVideo.paused) {
        qaiVideo.pause();
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => setModule(tab.dataset.qaiModule || 'brain'));
    });

    cards.forEach((card) => {
      card.tabIndex = 0;
      card.addEventListener('click', () => setModule(card.dataset.qaiCard || 'brain'));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setModule(card.dataset.qaiCard || 'brain');
        }
      });
    });

    if (qaiVideoBox && qaiVideo) {
      qaiVideoBox.addEventListener('click', () => {
        if (qaiVideo.paused) {
          qaiVideo.play().catch(() => {});
        } else {
          qaiVideo.pause();
        }
      });
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    reduceMotion.addEventListener?.('change', () => {
      stop();
      if (section.classList.contains('is-visible')) start();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start(); else stop();
        });
      }, { threshold: 0.14 });
      observer.observe(section);
    } else {
      start();
    }

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) start();
    setModule('brain');
  });
})();

// =========================================
// GhostWave RadioBridge runtime module
// =========================================
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const section = document.getElementById('radio-bridge');
    if (!section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.getElementById('rbSignalCanvas');
    const tabs = Array.from(section.querySelectorAll('.rb-mode-tab'));
    const cards = Array.from(section.querySelectorAll('.rb-mode-card'));
    const activeMode = document.getElementById('rbActiveMode');
    const interfaceTitle = document.getElementById('rbInterfaceTitle');
    const interfaceText = document.getElementById('rbInterfaceText');
    const sequenceTitle = document.getElementById('rbSequenceTitle');
    const sequenceText = document.getElementById('rbSequenceText');
    const log1 = document.getElementById('rbLogLine1');
    const log2 = document.getElementById('rbLogLine2');
    const log3 = document.getElementById('rbLogLine3');

    const modes = {
      aioc: {
        title: 'AIOC SERIAL PTT',
        iface: 'AIOC',
        ifaceText: 'USB audio + serial DTR/RTS',
        sequenceTitle: 'Serial PTT guarded send',
        sequenceText: 'USB audio sends AFSK tones while DTR/RTS controls PTT. Stop, close and errors force PTT off.',
        logs: [
          'mode=AIOC_SERIAL_PTT sampleRate=48000',
          'ptt=DTR/RTS test=500ms forced_off=true',
          'packet=QGW TEST_CLEAR crc=CRC16/X25'
        ]
      },
      vox: {
        title: 'VOX LITE CM108',
        iface: 'CM108',
        ifaceText: 'USB audio + VOX pre-tone',
        sequenceTitle: 'VOX assisted clear packet',
        sequenceText: 'CM108 outputs stereo dual-mono audio: pre-tone, preamble, QGW frame and tail. Radio VOX opens from audio level.',
        logs: [
          'mode=VOX_LITE_CM108 preTone>=3500ms',
          'vox_kick=5s mic_path_test=12s stereo=true',
          'packet=QGW TEST_CLEAR secure_tx=disabled'
        ]
      }
    };

    let ctx = null;
    let raf = 0;
    let visible = false;
    let dpr = window.__qpDpr();

    function resizeCanvas() {
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      dpr = window.__qpDpr();
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawSignal() {
      if (!visible || reduceMotion.matches || !ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const t = performance.now() * 0.001;
      ctx.clearRect(0, 0, w, h);

      const lanes = [0.24, 0.42, 0.6, 0.78];
      lanes.forEach((lane, laneIndex) => {
        const y = h * lane;
        const amp = 12 + laneIndex * 4;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const phase = x * 0.022 + t * (1.2 + laneIndex * 0.18);
          const burst = Math.sin(x * 0.006 + laneIndex) > -0.15 ? 1 : 0.35;
          const yy = y + Math.sin(phase) * amp * burst + Math.sin(phase * 2.2) * 3;
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = laneIndex % 2 === 0 ? 'rgba(0, 242, 255, 0.28)' : 'rgba(53, 255, 138, 0.24)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      });

      for (let i = 0; i < 18; i += 1) {
        const x = ((t * 38 + i * 92) % (w + 80)) - 40;
        const y = h * (0.18 + ((i * 17) % 64) / 100);
        const length = 26 + (i % 4) * 12;
        const gradient = ctx.createLinearGradient(x, y, x + length, y);
        gradient.addColorStop(0, 'rgba(255, 209, 102, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 209, 102, 0.35)');
        gradient.addColorStop(1, 'rgba(0, 242, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + length, y);
        ctx.stroke();
      }

      raf = requestAnimationFrame(drawSignal);
    }

    function setMode(key) {
      const resolved = modes[key] ? key : 'aioc';
      const data = modes[resolved];
      tabs.forEach((tab) => {
        const active = tab.dataset.rbMode === resolved;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      cards.forEach((card) => {
        card.classList.toggle('is-active', card.dataset.rbModeCard === resolved);
      });
      if (activeMode) activeMode.textContent = data.title;
      if (interfaceTitle) interfaceTitle.textContent = data.iface;
      if (interfaceText) interfaceText.textContent = data.ifaceText;
      const nodeIcon = document.getElementById('rbNodeIcon');
      if (nodeIcon) nodeIcon.textContent = resolved === 'vox' ? 'CM' : 'AI';
      if (sequenceTitle) sequenceTitle.textContent = data.sequenceTitle;
      if (sequenceText) sequenceText.textContent = data.sequenceText;
      if (log1) log1.textContent = data.logs[0];
      if (log2) log2.textContent = data.logs[1];
      if (log3) log3.textContent = data.logs[2];
    }

    function start() {
      section.classList.add('is-visible');
      if (visible) return;
      visible = true;
      if (!reduceMotion.matches) {
        resizeCanvas();
        drawSignal();
      }
    }

    function stop() {
      visible = false;
      cancelAnimationFrame(raf);
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => setMode(tab.dataset.rbMode || 'aioc'));
    });

    cards.forEach((card) => {
      const mode = card.dataset.rbModeCard;
      if (mode === 'aioc' || mode === 'vox') {
        card.tabIndex = 0;
        card.addEventListener('click', () => setMode(mode));
        card.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setMode(mode);
          }
        });
      }
    });

    const rbViewBtns = section.querySelectorAll('.rb-view-btn');
    rbViewBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.rb-mode-card');
        if (!card) return;
        const targetSrc = btn.getAttribute('data-src');
        const fallbackSrc = btn.getAttribute('data-fallback') || targetSrc;
        const targetSrcK1 = btn.getAttribute('data-src-k1');
        const fallbackSrcK1 = btn.getAttribute('data-fallback-k1') || targetSrcK1;

        const pictures = card.querySelectorAll('picture');
        const imgs = card.querySelectorAll('.rb-card-img');

        if (pictures[0] && targetSrc) {
          const s0 = pictures[0].querySelector('source');
          if (s0 && targetSrc.endsWith('.webp')) s0.srcset = targetSrc;
          if (imgs[0]) imgs[0].src = targetSrc.endsWith('.webp') ? fallbackSrc : targetSrc;
        }

        if (pictures[1] && targetSrcK1) {
          const s1 = pictures[1].querySelector('source');
          if (s1 && targetSrcK1.endsWith('.webp')) s1.srcset = targetSrcK1;
          if (imgs[1]) imgs[1].src = targetSrcK1.endsWith('.webp') ? fallbackSrcK1 : targetSrcK1;
        }

        card.querySelectorAll('.rb-view-btn').forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      });
    });

    // Radio Targets wiring mode chips (USB-C + K1 vs Solo K1)
    const wiringChips = section.querySelectorAll('.rb-wiring-chip');
    const dualVisual = section.querySelector('.rb-card-visual--dual');
    if (wiringChips.length && dualVisual) {
      wiringChips.forEach((chip) => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          const mode = chip.getAttribute('data-mode'); // 'combo' or 'direct'
          wiringChips.forEach((c) => {
            c.classList.remove('is-active');
            c.setAttribute('aria-selected', 'false');
          });
          chip.classList.add('is-active');
          chip.setAttribute('aria-selected', 'true');
          dualVisual.setAttribute('data-dual-rig', mode);
        });
      });

      const slotUsbc = dualVisual.querySelector('.rb-slot--usbc');
      const slotK1 = dualVisual.querySelector('.rb-slot--k1');
      if (slotUsbc) {
        slotUsbc.addEventListener('click', (e) => {
          e.stopPropagation();
          const comboChip = section.querySelector('.rb-wiring-chip[data-mode="combo"]');
          if (comboChip) comboChip.click();
        });
      }
      if (slotK1) {
        slotK1.addEventListener('click', (e) => {
          e.stopPropagation();
          const currentMode = dualVisual.getAttribute('data-dual-rig');
          const targetMode = currentMode === 'direct' ? 'combo' : 'direct';
          const targetChip = section.querySelector(`.rb-wiring-chip[data-mode="${targetMode}"]`);
          if (targetChip) targetChip.click();
        });
      }
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    reduceMotion.addEventListener?.('change', () => {
      stop();
      if (section.classList.contains('is-visible')) start();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start(); else stop();
        });
      }, { threshold: 0.14 });
      observer.observe(section);
    } else {
      start();
    }

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) start();
    setMode('aioc');
  });
})();

// =========================================
// Secure Dictation runtime module
// =========================================
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const section = document.getElementById('stt');
    if (!section || !section.classList.contains('secure-dictation-section')) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.getElementById('sdWaveCanvas');
    const transcript = document.getElementById('sdTranscriptLine');
    const samples = [
      'Meet point confirmed. Convert this voice note into a clean secure message.',
      'Add this to Q-Notes and remove personal details before sharing.',
      'Draft a short field report with time, location and next action.'
    ];

    let ctx = null;
    let raf = 0;
    let visible = false;
    let dpr = window.__qpDpr();
    let sampleIndex = 0;
    let sampleTimer = 0;

    function resizeCanvas() {
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      dpr = window.__qpDpr();
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      if (!visible || reduceMotion.matches || !ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const t = performance.now() * 0.001;
      ctx.clearRect(0, 0, w, h);

      for (let lane = 0; lane < 4; lane += 1) {
        const y = h * (0.22 + lane * 0.18);
        const amp = 10 + lane * 4;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const phase = x * (0.014 + lane * 0.002) + t * (1.15 + lane * 0.2);
          const pulse = 0.55 + 0.45 * Math.sin(t * 1.8 + lane);
          const yy = y + Math.sin(phase) * amp * pulse + Math.sin(phase * 2.5) * 2;
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = lane % 2 === 0 ? 'rgba(155, 92, 255, 0.26)' : 'rgba(0, 242, 255, 0.24)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let i = 0; i < 22; i += 1) {
        const x = ((t * 32 + i * 76) % (w + 60)) - 30;
        const y = h * (0.12 + ((i * 13) % 76) / 100);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(53, 255, 138, 0.42)' : 'rgba(0, 242, 255, 0.34)';
        ctx.beginPath();
        ctx.arc(x, y, 1.4 + (i % 4) * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    function rotateSample() {
      if (!transcript || reduceMotion.matches) return;
      sampleIndex = (sampleIndex + 1) % samples.length;
      transcript.style.opacity = '0';
      window.setTimeout(() => {
        transcript.textContent = samples[sampleIndex];
        transcript.style.opacity = '1';
      }, 180);
    }

    function start() {
      section.classList.add('is-visible');
      if (!sampleTimer) sampleTimer = window.setInterval(rotateSample, 3600);
      if (visible) return;
      visible = true;
      if (!reduceMotion.matches) {
        resizeCanvas();
        draw();
      }
    }

    function stop() {
      visible = false;
      cancelAnimationFrame(raf);
      if (sampleTimer) {
        window.clearInterval(sampleTimer);
        sampleTimer = 0;
      }
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    reduceMotion.addEventListener?.('change', () => {
      stop();
      if (section.classList.contains('is-visible')) start();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start(); else stop();
        });
      }, { threshold: 0.14 });
      observer.observe(section);
    } else {
      start();
    }

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) start();
  });
})();

// =========================================
// Security Protocol runtime module
// =========================================
(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const section = document.getElementById('security');
    if (!section || !section.classList.contains('security-protocol-section')) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.getElementById('spProtocolCanvas');
    let ctx = null;
    let raf = 0;
    let visible = false;
    let dpr = window.__qpDpr();
    let nodes = [];

    function resizeCanvas() {
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      dpr = window.__qpDpr();
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    }

    function seedNodes() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const lite = document.documentElement.classList.contains('perf-lite');
      const total = lite ? Math.max(20, Math.min(40, Math.floor(rect.width / 30))) : Math.max(32, Math.min(64, Math.floor(rect.width / 22)));
      nodes = Array.from({ length: total }, (_, index) => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.16,
        r: 1 + Math.random() * 1.5,
        hue: index % 5,
        phase: Math.random() * Math.PI * 2
      }));
    }

    function colorFor(index, alpha = 1) {
      const palette = [
        `rgba(0, 242, 255, ${alpha})`,
        `rgba(53, 255, 138, ${alpha})`,
        `rgba(155, 92, 255, ${alpha})`,
        `rgba(255, 77, 109, ${alpha})`,
        `rgba(255, 209, 102, ${alpha})`
      ];
      return palette[index % palette.length];
    }

    function draw() {
      if (!visible || reduceMotion.matches || !ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const now = performance.now() * 0.001;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.18;
            ctx.strokeStyle = colorFor(a.hue + b.hue, alpha);
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const pulse = 0.55 + 0.45 * Math.sin(now * 1.6 + n.phase);
        ctx.fillStyle = colorFor(n.hue, 0.38 + pulse * 0.42);
        ctx.shadowBlur = 10;
        ctx.shadowColor = colorFor(n.hue, 0.76);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    }

    function start() {
      section.classList.add('is-visible');
      if (visible) return;
      visible = true;
      if (!reduceMotion.matches) {
        resizeCanvas();
        draw();
      }
    }

    function stop() {
      visible = false;
      cancelAnimationFrame(raf);
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    reduceMotion.addEventListener?.('change', () => {
      stop();
      if (section.classList.contains('is-visible')) start();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start(); else stop();
        });
      }, { threshold: 0.14 });
      observer.observe(section);
    } else {
      start();
    }

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) start();
  });
})();

(() => {
  const section = document.querySelector('.hero--definitive');
  const canvas = document.getElementById('heroSignalCanvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  let running = false;
  let nodes = [];
  let dpr = 1;

  const palette = [
    '0,242,255',
    '10,255,132',
    '255,0,85',
    '255,204,102'
  ];

  function color(index, alpha) {
    return `rgba(${palette[index % palette.length]}, ${alpha})`;
  }

  function buildNodes(width, height) {
    const count = document.documentElement.classList.contains('perf-lite') ? 18 : (width < 760 ? 22 : 34);
    nodes = Array.from({ length: count }, (_, index) => {
      const column = index % 7;
      const row = Math.floor(index / 7);
      return {
        x: (width * 0.08) + column * (width * 0.14) + Math.random() * 28,
        y: (height * 0.10) + row * (height / 7) + Math.random() * 34,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.22,
        phase: Math.random() * Math.PI * 2,
        tone: index % palette.length,
        radius: 1.4 + Math.random() * 1.8
      };
    });
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    dpr = Math.min(window.__qpDpr(), 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNodes(rect.width, rect.height);
  }

  function draw(timestamp) {
    if (!running) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const time = timestamp * 0.001;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < 5; i++) {
      const y = ((time * (28 + i * 9)) + i * height * 0.22) % height;
      ctx.strokeStyle = color(i, 0.10);
      ctx.lineWidth = i === 0 ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.28, y - 34, width * 0.62, y + 46, width, y - 14);
      ctx.stroke();
    }

    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
    }

    const maxDistance = width < 760 ? 104 : 138;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.16;
          ctx.strokeStyle = color(a.tone + b.tone, alpha);
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const node of nodes) {
      const pulse = 0.45 + 0.55 * Math.sin(time * 1.8 + node.phase);
      const r = node.radius + pulse * 0.8;
      // High-performance dual halo (eliminates expensive shadowBlur)
      ctx.fillStyle = color(node.tone, 0.12 + pulse * 0.16);
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color(node.tone, 0.55 + pulse * 0.35);
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(draw);
  }

  function start() {
    if (running || reduceMotion.matches) return;
    if (document.documentElement.classList.contains('intro-active')) return;
    running = true;
    resizeCanvas();
    raf = requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  reduceMotion.addEventListener?.('change', () => {
    stop();
    if (!reduceMotion.matches && section.classList.contains('is-hero-visible')) start();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!reduceMotion.matches && section.classList.contains('is-hero-visible')) start();
  });

  // Pause hero canvas while intro is active to guarantee full GPU resources for intro video
  if ('MutationObserver' in window) {
    const introWatcher = new MutationObserver(() => {
      const isIntro = document.documentElement.classList.contains('intro-active');
      if (isIntro && running) {
        stop();
      } else if (!isIntro && !running && section.classList.contains('is-hero-visible')) {
        start();
      }
    });
    introWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add('is-hero-visible');
          start();
        } else {
          section.classList.remove('is-hero-visible');
          stop();
        }
      });
    }, { threshold: 0.12 });
    observer.observe(section);
  } else {
    section.classList.add('is-hero-visible');
    start();
  }
})();
(() => {
  const section = document.querySelector('.mission-pro-section');
  if (!section) return;
  section.classList.add('mission-js-enabled');

  const revealItems = Array.from(section.querySelectorAll('[data-mission-reveal]'));
  if ('IntersectionObserver' in window && revealItems.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const canvas = document.getElementById('missionFieldCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  let running = false;
  let signals = [];
  let dpr = 1;

  const tones = ['0,242,255', '10,255,132', '255,0,85'];

  function rgba(index, alpha) {
    return `rgba(${tones[index % tones.length]}, ${alpha})`;
  }

  function seed(width, height) {
    const count = document.documentElement.classList.contains('perf-lite') ? 14 : (width < 760 ? 18 : 28);
    signals = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18,
      phase: Math.random() * Math.PI * 2,
      tone: index % tones.length,
      size: 1.2 + Math.random() * 1.8
    }));
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dpr = Math.min(window.__qpDpr(), 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed(rect.width, rect.height);
  }

  function frame(timeMs) {
    if (!running) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const time = timeMs * 0.001;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < 4; i++) {
      const x = ((time * (18 + i * 8)) + i * width * 0.24) % width;
      ctx.strokeStyle = rgba(i, 0.08);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 34, height * 0.28, x - 42, height * 0.62, x + 12, height);
      ctx.stroke();
    }

    for (const signal of signals) {
      signal.x += signal.vx;
      signal.y += signal.vy;
      if (signal.x < -20) signal.x = width + 20;
      if (signal.x > width + 20) signal.x = -20;
      if (signal.y < -20) signal.y = height + 20;
      if (signal.y > height + 20) signal.y = -20;
    }

    const maxDistance = width < 760 ? 96 : 132;
    for (let i = 0; i < signals.length; i++) {
      for (let j = i + 1; j < signals.length; j++) {
        const a = signals[i];
        const b = signals[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < maxDistance) {
          ctx.strokeStyle = rgba(a.tone + b.tone, (1 - distance / maxDistance) * 0.13);
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const signal of signals) {
      const pulse = 0.45 + 0.55 * Math.sin(time * 1.7 + signal.phase);
      const r = signal.size + pulse * 0.8;
      // High-performance dual halo (eliminates expensive shadowBlur)
      ctx.fillStyle = rgba(signal.tone, 0.12 + pulse * 0.16);
      ctx.beginPath();
      ctx.arc(signal.x, signal.y, r * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(signal.tone, 0.45 + pulse * 0.40);
      ctx.beginPath();
      ctx.arc(signal.x, signal.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion.matches) return;
    if (document.documentElement.classList.contains('intro-active') || document.documentElement.classList.contains('video-card-playing')) return;
    running = true;
    resize();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  window.addEventListener('resize', resize, { passive: true });
  reduceMotion.addEventListener?.('change', () => {
    stop();
    if (!reduceMotion.matches && section.classList.contains('is-mission-visible')) start();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!reduceMotion.matches && section.classList.contains('is-mission-visible')) start();
  });

  // Pause mission background canvas while card videos or intro are active to give 100% GPU to video
  if ('MutationObserver' in window) {
    const missionWatcher = new MutationObserver(() => {
      const isCardPlaying = document.documentElement.classList.contains('video-card-playing');
      const isIntro = document.documentElement.classList.contains('intro-active');
      if ((isCardPlaying || isIntro) && running) {
        stop();
      } else if (!isCardPlaying && !isIntro && !running && section.classList.contains('is-mission-visible')) {
        start();
      }
    });
    missionWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add('is-mission-visible');
          start();
        } else {
          section.classList.remove('is-mission-visible');
          stop();
        }
      });
    }, { threshold: 0.10 });
    observer.observe(section);
  } else {
    section.classList.add('is-mission-visible');
    start();
  }
})();
(() => {
  const section = document.querySelector('.stack-pro-section');
  if (!section) return;

  section.classList.add('stack-js-enabled');
  const items = Array.from(section.querySelectorAll('[data-stack-reveal]'));
  if (!items.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 80, 360)}ms`;
      observer.observe(item);
    });
  } else {
    items.forEach((item) => item.classList.add('is-visible'));
  }
})();

// =========================================
// Air-Gap & Off-Grid Transports Module
// =========================================
(() => {
  const section = document.getElementById('air-gap');
  if (!section) return;

  const canvas = document.getElementById('agStreamCanvas');
  const canvasBox = document.getElementById('agCanvasBox');
  const wifiVideoWrap = document.getElementById('agWifiVideoWrap');
  const wifiVideo = document.getElementById('agWifiVideo');
  const wifiPlayPill = document.getElementById('agWifiPlayPill');
  const wifiPlayPillText = wifiPlayPill ? wifiPlayPill.querySelector('.ag-play-text') : null;
  const wifiPlayPillIcon = wifiPlayPill ? wifiPlayPill.querySelector('.ag-play-icon') : null;
  const tabs = section.querySelectorAll('.ag-tab');
  const toggleBtn = document.getElementById('ag-toggle-stream');
  const cyclePayloadBtn = document.getElementById('ag-cycle-payload');
  const payloadTypeEl = document.getElementById('ag-payload-type');

  let isWifiVideoPlaying = false;

  function playWifiVideo() {
    if (!wifiVideo || !wifiVideoWrap) return;
    isWifiVideoPlaying = true;
    wifiVideoWrap.classList.add('is-playing');
    if (wifiPlayPillText) wifiPlayPillText.textContent = 'PAUSE STREAM';
    if (wifiPlayPillIcon) wifiPlayPillIcon.textContent = '■';
    if (toggleBtn) {
      const g = toggleBtn.querySelector('.ag-btn-glitch');
      if (g) g.textContent = '[ PAUSE STREAM ]';
    }
    wifiVideo.muted = true;
    wifiVideo.play().catch(() => {});
  }

  function pauseWifiVideo() {
    if (!wifiVideo || !wifiVideoWrap) return;
    isWifiVideoPlaying = false;
    wifiVideoWrap.classList.remove('is-playing');
    if (wifiPlayPillText) wifiPlayPillText.textContent = 'CLICK TO PLAY';
    if (wifiPlayPillIcon) wifiPlayPillIcon.textContent = '▶';
    if (toggleBtn) {
      const g = toggleBtn.querySelector('.ag-btn-glitch');
      if (g) g.textContent = '[ RESUME STREAM ]';
    }
    wifiVideo.pause();
  }

  function toggleWifiVideo(e) {
    if (e) e.preventDefault();
    if (isWifiVideoPlaying && !wifiVideo.paused) {
      pauseWifiVideo();
    } else {
      playWifiVideo();
    }
  }

  if (wifiVideoWrap) {
    wifiVideoWrap.addEventListener('click', toggleWifiVideo);
    wifiVideoWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        toggleWifiVideo(e);
      }
    });
  }

  if (wifiVideo) {
    wifiVideo.addEventListener('timeupdate', () => {
      if (activeMode !== 'wifi' || wifiVideo.paused) return;
      const t = wifiVideo.currentTime;
      const mbps = (47.8 + Math.sin(t * 2.8) * 4.6).toFixed(1);
      const chunks = Math.floor(1200 + Math.sin(t * 3.5) * 45);
      if (telemetryEl) {
        telemetryEl.textContent = `THROUGHPUT: ${mbps} MB/s | TLS 1.3 PINNED`;
      }
      if (rateStatEl) {
        rateStatEl.textContent = `${chunks.toLocaleString()} CHUNKS/SEC`;
      }
    });
  }
  
  const modeNameEl = document.getElementById('ag-deck-mode-name');
  const telemetryEl = document.getElementById('ag-deck-telemetry');
  const rfStatEl = document.getElementById('ag-rf-stat');
  const rateStatEl = document.getElementById('ag-rate-stat');
  const hashStatEl = document.getElementById('ag-hash-stat');
  
  const intelTagEl = document.getElementById('ag-intel-tag');
  const intelTitleEl = document.getElementById('ag-intel-title');
  const intelDescEl = document.getElementById('ag-intel-desc');
  const specMediumEl = document.getElementById('ag-spec-medium');
  const specDetectEl = document.getElementById('ag-spec-detect');
  const specAttackEl = document.getElementById('ag-spec-attack');
  const specClassEl = document.getElementById('ag-spec-class');
  const logTerminalEl = document.getElementById('ag-log-terminal');

  let ctx = canvas ? canvas.getContext('2d') : null;
  let activeMode = 'optical';
  let isRunning = true;
  let isVisible = false;
  let animId = 0;
  let frameCount = 0;
  let lastFrameTime = performance.now();
  let fps = 24;

  const payloads = [
    { label: 'ENCRYPTED_VAULT_BACKUP (1.4 MB)', size: 1468006, parts: 96, classStr: 'OpticalFountain.kt / OpticalQrStream.kt' },
    { label: 'DILITHIUM_IDENTITY_KEYRING (4.8 KB)', size: 4915, parts: 12, classStr: 'NfcIdentityManager.kt / OpticalPrivateFiles.kt' },
    { label: 'OFFLINE_MGRS_TACTICAL_MAP (8.2 MB)', size: 8598322, parts: 260, classStr: 'QGeoOfflineMapPack.kt / LocalLinkTransport.kt' },
    { label: 'EMERGENCY_FIELD_REPORT (18.5 KB)', size: 18944, parts: 32, classStr: 'QGeoReportWizard.kt / OfflineAcousticHandshakeManager.kt' }
  ];
  let currentPayloadIdx = 0;

  // Preset Mode Data
  const modeConfigs = {
    optical: {
      modeName: 'OPTICAL_FOUNTAIN_STREAM',
      telemetry: 'FPS: 24 | LOSS_REPAIR: ACTIVE',
      rfStat: '0.00 dBm (SILENT)',
      rfColor: 'var(--neon-green)',
      rateStat: '24 FRAMES/SEC',
      hashStat: 'SHA256::VERIFIED',
      intelTag: 'EMCON LEVEL: ABSOLUTE STEALTH',
      title: 'Animated Fountain Codes (Luby Transform)',
      desc: 'Direct camera-to-screen unidirectional data pipeline. Payloads are divided into 32 KiB pages with rateless erasure coding (Hummingbird core). The receiving device captures the stream with CameraX, reconstructing the encrypted file even with dropped or occluded frames without any backchannel RF handshake.',
      medium: 'Display Photons → Camera Sensor',
      detect: 'Zero RF Footprint (Imperceptible)',
      detectColor: 'var(--neon-green)',
      attack: 'Air-Gapped (No IP Stack, No Drivers)',
      log: [
        '> FOUNTAIN_PAGE_0: 32768 BYTES [SYSTEMATIC SWEEP: COMPLETE]',
        '> RATELESS_REPAIR_PART: BURST #12 TRANSMITTED (CRC32: 0x514F4631)',
        '> PERSPECTIVE_TRACKING: 4 CORNERS LOCKED // JITTER: 0.04ms'
      ]
    },
    wifi: {
      modeName: 'LOCAL_WIFI_HOTSPOT_P2P',
      telemetry: 'THROUGHPUT: 48.2 MB/s | TLS 1.3 PINNED',
      rfStat: '+14 dBm (2.4/5GHz LAN)',
      rfColor: 'var(--neon-amber)',
      rateStat: '1,200 CHUNKS/SEC',
      hashStat: 'BLAKE3::VERIFIED',
      intelTag: 'NETWORK: ISOLATED LAN // NO CLOUD',
      title: 'Local Wi-Fi & Hotspot Direct P2P (Iroh-Ready)',
      desc: 'Local peer-to-peer session with explicit QR pairing (IP + TLS pin + ephemeral secret). Full WebRTC audio/video signaling and verified file transfers up to 1 GiB without external STUN/TURN servers, DNS, or Tor triangulation. Designed for bunker LANs and mobile hotspots without Internet access.',
      medium: '802.11 Wi-Fi Direct / Local Hotspot',
      detect: 'Confined to Local RF Propagation Area',
      detectColor: 'var(--neon-amber)',
      attack: 'Pinned TLS 1.3 Handshake (No Open Ports)',
      log: [
        '> LOCAL_PEER_AUTH: 192.168.49.12 [PIN VALIDATED // 10 MIN LEASE]',
        '> WEBRTC_ICE_CANDIDATE: HOST_ONLY (STUN/TURN: DISABLED)',
        '> FILE_TRANSFER: 32 KiB CHUNKS // SHA-256 VERIFIED BEFORE PERSIST'
      ]
    },
    acoustic: {
      modeName: 'ACOUSTIC_ULTRASOUND_LINK',
      telemetry: 'CARRIER: 18.5 kHz - 19.8 kHz | SNR: +18 dB',
      rfStat: '0.00 dBm (ACOUSTIC SPEECH/MIC)',
      rfColor: 'var(--neon-green)',
      rateStat: '300 BPS (TACTICAL FSK)',
      hashStat: 'CRC16::VALIDATED',
      intelTag: 'ENVIRONMENT: FARADAY CAGE PROOF',
      title: 'Near-Ultrasound Acoustic Carrier (Faraday Fallback)',
      desc: 'Audio-frequency and near-ultrasonic acoustic FSK modulation. Designed for ultra-secure key exchanges and tactical emergency beacons inside RF-shielded rooms, Faraday bags, or during hostile electronic warfare when all wireless spectrum is jammed.',
      medium: 'Acoustic Sound Pressure (Speaker → Mic)',
      detect: 'Inaudible Near-Ultrasound (Zero RF Emitters)',
      detectColor: 'var(--neon-green)',
      attack: 'Acoustic Line-of-Hearing (Air-gapped)',
      log: [
        '> ACOUSTIC_CARRIER_DETECT: 18,500 Hz [SIGNAL LOCKED]',
        '> FSK_DEMODULATOR: SYNC TONES OK // BIT_ERRORS: 0',
        '> IDENTITY_EXCHANGE: ED25519 PUBKEY ACCEPTED IN FARADAY SHIELD'
      ]
    }
  };

  function updateUiForMode(mode) {
    const cfg = modeConfigs[mode];
    if (!cfg) return;

    if (modeNameEl) modeNameEl.textContent = cfg.modeName;
    if (telemetryEl) telemetryEl.textContent = cfg.telemetry;
    if (rfStatEl) {
      rfStatEl.textContent = cfg.rfStat;
      rfStatEl.style.color = cfg.rfColor;
    }
    if (rateStatEl) rateStatEl.textContent = cfg.rateStat;
    if (hashStatEl) hashStatEl.textContent = cfg.hashStat;

    if (intelTagEl) intelTagEl.textContent = cfg.intelTag;
    if (intelTitleEl) intelTitleEl.textContent = cfg.title;
    if (intelDescEl) intelDescEl.textContent = cfg.desc;
    if (specMediumEl) specMediumEl.textContent = cfg.medium;
    if (specDetectEl) {
      specDetectEl.textContent = cfg.detect;
      specDetectEl.style.color = cfg.detectColor;
    }
    if (specAttackEl) specAttackEl.textContent = cfg.attack;
    if (specClassEl) specClassEl.textContent = payloads[currentPayloadIdx].classStr;

    if (logTerminalEl) {
      logTerminalEl.innerHTML = cfg.log
        .map(l => `<div class="ag-log-line ${l.includes('OK') || l.includes('COMPLETE') || l.includes('VALIDATED') ? 'ok' : ''}">${l}</div>`)
        .join('');
    }

    if (mode === 'wifi') {
      if (canvasBox) canvasBox.classList.add('is-wifi-mode');
      if (isVisible) {
        playWifiVideo();
      }
    } else {
      if (canvasBox) canvasBox.classList.remove('is-wifi-mode');
      pauseWifiVideo();
      if (isRunning && isVisible && !animId) {
        lastFrameTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    }
  }

  // Tabs click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      activeMode = tab.dataset.agTab || 'optical';
      updateUiForMode(activeMode);
    });
  });

  // Toggle Stream
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (activeMode === 'wifi') {
        toggleWifiVideo();
        return;
      }
      isRunning = !isRunning;
      const g = toggleBtn.querySelector('.ag-btn-glitch');
      if (g) g.textContent = isRunning ? '[ PAUSE STREAM ]' : '[ RESUME STREAM ]';
      if (isRunning && isVisible) {
        lastFrameTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    });
  }

  // Cycle Payload
  if (cyclePayloadBtn) {
    cyclePayloadBtn.addEventListener('click', () => {
      currentPayloadIdx = (currentPayloadIdx + 1) % payloads.length;
      const p = payloads[currentPayloadIdx];
      if (payloadTypeEl) payloadTypeEl.textContent = p.label;
      if (specClassEl) specClassEl.textContent = p.classStr;
    });
  }

  // Canvas Procedural Rendering
  // Canvas Procedural Rendering: Cyberpunk Optical Fountain Matrix (29x29)
  const matrixSize = 29;

  function isFinder(r, c) {
    let lr = -1, lc = -1;
    if (r < 7 && c < 7) {
      lr = r; lc = c;
    } else if (r < 7 && c >= matrixSize - 7) {
      lr = r; lc = c - (matrixSize - 7);
    } else if (r >= matrixSize - 7 && c < 7) {
      lr = r - (matrixSize - 7); lc = c;
    }
    if (lr !== -1) {
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return 'border';
      if (lr === 1 || lr === 5 || lc === 1 || lc === 5) return 'space';
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return 'core';
    }
    return null;
  }

  function isTiming(r, c) {
    if (r === 6 && c >= 7 && c <= matrixSize - 8) return true;
    if (c === 6 && r >= 7 && r <= matrixSize - 8) return true;
    return false;
  }

  function isAlignment(r, c) {
    if (r >= 20 && r <= 24 && c >= 20 && c <= 24) {
      if (r === 20 || r === 24 || c === 20 || c === 24) return 'border';
      if (r === 21 || r === 23 || c === 21 || c === 23) return 'space';
      if (r === 22 && c === 22) return 'core';
    }
    return null;
  }

  function isCenterEmblem(r, c) {
    return r >= 12 && r <= 16 && c >= 12 && c <= 16;
  }

  function drawRoundedCell(ctx, x, y, size, rad) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, rad);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, size, size);
    }
  }

  function renderOpticalQr(time) {
    const w = canvas.width;
    const h = canvas.height;

    // 1. Deep Cybernetic Canvas Background
    ctx.fillStyle = '#020509';
    ctx.fillRect(0, 0, w, h);

    // Subtle radial backlight bloom
    const bgGlow = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, 230);
    bgGlow.addColorStop(0, 'rgba(0, 242, 255, 0.08)');
    bgGlow.addColorStop(0.55, 'rgba(5, 18, 30, 0.45)');
    bgGlow.addColorStop(1, 'rgba(2, 5, 9, 0.98)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, w, h);

    // 2. Holographic Matrix Dimensions (29x29, cell 13px = 377px)
    const qrSize = 377;
    const cell = 13;
    const ox = Math.round((w - qrSize) / 2);
    const oy = 48;

    // Background matrix mesh lines
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= matrixSize; i += 7) {
      const px = ox + i * cell;
      const py = oy + i * cell;
      ctx.beginPath();
      ctx.moveTo(px, oy - 6);
      ctx.lineTo(px, oy + qrSize + 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ox - 6, py);
      ctx.lineTo(ox + qrSize + 6, py);
      ctx.stroke();
    }

    // 3. Cyberpunk Reticle Calipers framing the QR matrix
    const pad = 12;
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.55)';
    ctx.lineWidth = 1.5;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(ox - pad, oy - pad + 16);
    ctx.lineTo(ox - pad, oy - pad);
    ctx.lineTo(ox - pad + 16, oy - pad);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(ox + qrSize + pad - 16, oy - pad);
    ctx.lineTo(ox + qrSize + pad, oy - pad);
    ctx.lineTo(ox + qrSize + pad, oy - pad + 16);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(ox - pad, oy + qrSize + pad - 16);
    ctx.lineTo(ox - pad, oy + qrSize + pad);
    ctx.lineTo(ox - pad + 16, oy + qrSize + pad);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(ox + qrSize + pad - 16, oy + qrSize + pad);
    ctx.lineTo(ox + qrSize + pad, oy + qrSize + pad);
    ctx.lineTo(ox + qrSize + pad, oy + qrSize + pad - 16);
    ctx.stroke();

    // Corner optical coordinates
    ctx.font = '8px monospace';
    ctx.fillStyle = 'rgba(0, 242, 255, 0.45)';
    ctx.fillText('0.0, 0.0', ox - pad, oy - pad - 4);
    ctx.fillText('29.0, 29.0', ox + qrSize - 20, oy + qrSize + pad + 12);

    // 4. Burst and Wave Calculation
    const burstNum = Math.floor(time * 24) % 96;
    const burstSeed = (burstNum * 1337) ^ 0x4D5A;
    const photonWave = (time * 16) % (matrixSize * 2);

    // 5. Render All QR Grid Modules
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        const x = ox + c * cell;
        const y = oy + r * cell;
        const cellPad = 1.4;
        const cellSize = cell - cellPad;

        if (isCenterEmblem(r, c)) continue;

        // A. Finder Patterns
        const finder = isFinder(r, c);
        if (finder !== null) {
          if (finder === 'border') {
            ctx.fillStyle = '#00f2ff';
            ctx.shadowColor = 'rgba(0, 242, 255, 0.6)';
            ctx.shadowBlur = 6;
            drawRoundedCell(ctx, x, y, cellSize, 2);
            ctx.shadowBlur = 0;
          } else if (finder === 'core') {
            const isCenterOfCore = (r % (matrixSize - 7) === 3 || r === 3) && (c % (matrixSize - 7) === 3 || c === 3);
            ctx.fillStyle = isCenterOfCore ? '#ffffff' : '#35ff8a';
            ctx.shadowColor = 'rgba(53, 255, 138, 0.85)';
            ctx.shadowBlur = isCenterOfCore ? 8 : 4;
            drawRoundedCell(ctx, x, y, cellSize, 1.5);
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#02070d';
            ctx.fillRect(x, y, cellSize, cellSize);
          }
          continue;
        }

        // B. Alignment Pattern
        const align = isAlignment(r, c);
        if (align !== null) {
          if (align === 'border') {
            ctx.fillStyle = '#00f2ff';
            drawRoundedCell(ctx, x, y, cellSize, 1.5);
          } else if (align === 'core') {
            ctx.fillStyle = '#35ff8a';
            ctx.shadowColor = 'rgba(53, 255, 138, 0.7)';
            ctx.shadowBlur = 5;
            drawRoundedCell(ctx, x, y, cellSize, 1);
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#02070d';
            ctx.fillRect(x, y, cellSize, cellSize);
          }
          continue;
        }

        // C. Timing Tracks
        if (isTiming(r, c)) {
          const isRow = r === 6;
          const coord = isRow ? c : r;
          const isPulseBit = coord % 2 === 0;
          const packetRunner = Math.floor(time * 26) % 15;
          const isRunner = (coord - 7) === packetRunner;

          if (isRunner) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00f2ff';
            ctx.shadowBlur = 10;
            drawRoundedCell(ctx, x, y, cellSize, 2);
            ctx.shadowBlur = 0;
          } else if (isPulseBit) {
            ctx.fillStyle = '#00f2ff';
            drawRoundedCell(ctx, x, y, cellSize, 1);
          } else {
            ctx.fillStyle = 'rgba(0, 242, 255, 0.08)';
            ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
          }
          continue;
        }

        // D. Fountain Code Data Bits
        const bitHash = Math.sin((r + 1) * 31.415 + (c + 1) * 65.358 + burstNum * 0.437) * 43758.5453;
        const randVal = bitHash - Math.floor(bitHash);
        const isOn = randVal > 0.42;

        const diag = r + c;
        const waveDist = Math.abs(diag - photonWave);
        const isWaveFront = waveDist < 1.6;

        if (isOn) {
          if (isWaveFront) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 242, 255, 0.95)';
            ctx.shadowBlur = 8;
            drawRoundedCell(ctx, x, y, cellSize, 2);
            ctx.shadowBlur = 0;
          } else {
            const isRepairBit = (r * 7 + c * 13 + burstNum) % 7 === 0;
            if (isRepairBit) {
              ctx.fillStyle = '#ffb800';
              ctx.shadowColor = 'rgba(255, 184, 0, 0.45)';
              ctx.shadowBlur = 3;
              drawRoundedCell(ctx, x, y, cellSize, 1.5);
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = '#35ff8a';
              ctx.shadowColor = 'rgba(53, 255, 138, 0.4)';
              ctx.shadowBlur = 2;
              drawRoundedCell(ctx, x, y, cellSize, 1.2);
              ctx.shadowBlur = 0;
            }
          }
        } else {
          ctx.fillStyle = 'rgba(0, 242, 255, 0.04)';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.fillStyle = 'rgba(0, 242, 255, 0.22)';
          ctx.fillRect(x + 5, y + 5, 2, 2);
        }
      }
    }

    // 6. Central Cyber Security Chip (Center Emblem at 12..16)
    const emX = ox + 12 * cell;
    const emY = oy + 12 * cell;
    const emW = 5 * cell - 1.4;
    const emH = 5 * cell - 1.4;
    const emCenterX = emX + emW / 2;
    const emCenterY = emY + emH / 2;

    ctx.fillStyle = '#02070e';
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 242, 255, 0.7)';
    ctx.shadowBlur = 8;
    drawRoundedCell(ctx, emX, emY, emW, 6);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rotating optical reticle ring
    ctx.save();
    ctx.translate(emCenterX, emCenterY);
    ctx.rotate(time * 0.9);
    ctx.strokeStyle = 'rgba(53, 255, 138, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();
    for (let a = 0; a < 4; a++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(21, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Central "Q" icon core
    ctx.fillStyle = '#00f2ff';
    ctx.shadowColor = '#00f2ff';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Q', emCenterX, emCenterY);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // 7. Dynamic Laser Scanning Sweep Beam
    const scanProgress = (time * 0.45) % 1;
    const scanLineY = oy + scanProgress * qrSize;
    const scanGrad = ctx.createLinearGradient(0, scanLineY - 18, 0, scanLineY + 6);
    scanGrad.addColorStop(0, 'rgba(0, 242, 255, 0)');
    scanGrad.addColorStop(0.75, 'rgba(0, 242, 255, 0.12)');
    scanGrad.addColorStop(1, 'rgba(53, 255, 138, 0.35)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(ox - 6, scanLineY - 18, qrSize + 12, 18);

    ctx.strokeStyle = '#35ff8a';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#35ff8a';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(ox - 10, scanLineY);
    ctx.lineTo(ox + qrSize + 10, scanLineY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox - 8, scanLineY - 2, 4, 4);
    ctx.fillRect(ox + qrSize + 4, scanLineY - 2, 4, 4);

    // 8. Top Tactical HUD Strip (y: 16 to 40)
    ctx.fillStyle = '#35ff8a';
    ctx.shadowColor = '#35ff8a';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(ox, 26, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '10px monospace';
    ctx.fillStyle = '#00f2ff';
    ctx.fillText('OPTICAL_FOUNTAIN_STREAM // TX_LOCK', ox + 10, 30);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`BURST #${(burstNum + 1).toString().padStart(2, '0')}/96 // 0x${burstSeed.toString(16).toUpperCase()}`, ox + qrSize, 30);
    ctx.textAlign = 'left';

    // 9. Bottom Tactical Telemetry & Reconstruct Bar (y: 440 to 468)
    const barY = 440;
    const barW = qrSize;
    const barH = 26;

    ctx.fillStyle = 'rgba(4, 14, 24, 0.85)';
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.28)';
    ctx.lineWidth = 1;
    drawRoundedCell(ctx, ox, barY, barW, 4);
    ctx.stroke();

    const totalSegs = 16;
    const activeSegs = Math.min(totalSegs, Math.floor(((burstNum + 1) / 96) * totalSegs) + 1);
    const segW = 6;
    const segH = 10;
    const segStartX = ox + 8;
    const segStartY = barY + 8;

    for (let s = 0; s < totalSegs; s++) {
      if (s < activeSegs) {
        ctx.fillStyle = (s === activeSegs - 1) ? '#ffffff' : '#35ff8a';
        ctx.shadowColor = '#35ff8a';
        ctx.shadowBlur = 4;
        ctx.fillRect(segStartX + s * 9, segStartY, segW, segH);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = 'rgba(0, 242, 255, 0.12)';
        ctx.fillRect(segStartX + s * 9, segStartY, segW, segH);
      }
    }

    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(0, 242, 255, 0.9)';
    ctx.fillText(`RECONSTRUCT: ${Math.round(((burstNum + 1) / 96) * 100)}%`, segStartX + totalSegs * 9 + 8, barY + 16);

    ctx.fillStyle = '#35ff8a';
    ctx.textAlign = 'right';
    ctx.fillText('EMCON: 0.00 dBm // ZERO_RF', ox + barW - 8, barY + 16);
    ctx.textAlign = 'left';
  }

  function renderWifiDirect(time) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#010306';
    ctx.fillRect(0, 0, w, h);

    const cx1 = w * 0.25;
    const cy1 = h * 0.5;
    const cx2 = w * 0.75;
    const cy2 = h * 0.5;

    // Direct peer link line
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.stroke();

    // Traveling packet waves
    const waveCount = 5;
    for (let i = 0; i < waveCount; i++) {
      const prog = ((time * 0.8) + i / waveCount) % 1;
      const px = cx1 + (cx2 - cx1) * prog;
      const py = cy1 + Math.sin(prog * Math.PI * 2) * 8;
      ctx.fillStyle = 'rgba(0, 242, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Peer 1: Host Hotspot
    ctx.fillStyle = 'rgba(53, 255, 138, 0.15)';
    ctx.strokeStyle = '#35ff8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx1, cy1, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#35ff8a';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PEER_A', cx1, cy1 - 36);
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('192.168.49.1', cx1, cy1 + 42);

    // Peer 2: Client
    ctx.fillStyle = 'rgba(0, 242, 255, 0.15)';
    ctx.strokeStyle = '#00f2ff';
    ctx.beginPath();
    ctx.arc(cx2, cy2, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#00f2ff';
    ctx.font = '11px monospace';
    ctx.fillText('PEER_B', cx2, cy2 - 36);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px monospace';
    ctx.fillText('192.168.49.12', cx2, cy2 + 42);
    ctx.textAlign = 'left';
  }

  function renderAcoustic(time) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#010306';
    ctx.fillRect(0, 0, w, h);

    // Ultrasonic frequency spectrum waterfall
    const bars = 48;
    const barW = (w - 40) / bars;
    const ox = 20;

    for (let i = 0; i < bars; i++) {
      const isCarrier = i >= 36 && i <= 40;
      const heightNoise = Math.sin(i * 0.4 + time * 3) * 0.3 + Math.random() * 0.2;
      const barH = isCarrier ? (h * 0.55 + Math.sin(time * 8 + i) * 35) : (h * 0.12 + heightNoise * 30);
      const by = h * 0.85 - barH;

      ctx.fillStyle = isCarrier ? 'rgba(53, 255, 138, 0.85)' : 'rgba(0, 242, 255, 0.2)';
      ctx.fillRect(ox + i * barW, by, barW - 2, barH);
    }

    // Carrier text label
    ctx.fillStyle = '#35ff8a';
    ctx.font = '10px monospace';
    ctx.fillText('ULTRASONIC CARRIER: 18,500 Hz (FSK MODULATED)', 24, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('HUMAN AUDIBLE CUTOFF: 16 kHz ──────┐', 24, 52);
  }

  function render(timestamp) {
    if (!isRunning || !isVisible || !ctx) return;
    const time = timestamp * 0.001;

    if (activeMode === 'optical') renderOpticalQr(time);
    else if (activeMode === 'acoustic') renderAcoustic(time);

    if (activeMode !== 'wifi') {
      animId = requestAnimationFrame(render);
    } else {
      animId = 0;
    }
  }

  function start() {
    if (isVisible) return;
    isVisible = true;
    if (activeMode === 'wifi') {
      playWifiVideo();
    } else if (isRunning) {
      animId = requestAnimationFrame(render);
    }
  }

  function stop() {
    isVisible = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = 0;
    }
    if (wifiVideo && !wifiVideo.paused) {
      wifiVideo.pause();
    }
  }

  // Observer
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    }, { threshold: 0.15 });
    obs.observe(section);
  } else {
    start();
  }

  // Global visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (section.getBoundingClientRect().top < window.innerHeight && section.getBoundingClientRect().bottom > 0) start();
  });

  // Initial UI state
  updateUiForMode('optical');
})();

// =========================================
// Tactical SIGINT Intelligence Module
// =========================================
(() => {
  const sigintDeck = document.querySelector('.q-sigint-deck');
  if (!sigintDeck) return;

  const canvas = document.getElementById('sigintScopeCanvas');
  const tabs = sigintDeck.querySelectorAll('.q-sigint-tab');
  const scopeTitleEl = document.getElementById('sigintScopeTitle');
  const scopeMetaEl = document.getElementById('sigintScopeMeta');
  const demodTypeEl = document.getElementById('sigintDemodType');
  const bandwidthEl = document.getElementById('sigintBandwidth');
  const engineClassEl = document.getElementById('sigintEngineClass');
  
  const tabTableBtn = document.getElementById('sigintViewTabTable');
  const tabRawBtn = document.getElementById('sigintViewTabRaw');
  const tableView = document.getElementById('sigintTableView');
  const rawView = document.getElementById('sigintRawView');
  const tableHeaders = document.getElementById('sigintTableHeaders');
  const tableBody = document.getElementById('sigintTableBody');

  let ctx = canvas ? canvas.getContext('2d') : null;
  let activeProtocol = 'adsb';
  let isRunning = true;
  let isVisible = false;
  let animId = 0;
  let sweepAngle = 0;

  // Real SIGINT data models directly matching the Kotlin/C++ decoders
  const protocolData = {
    adsb: {
      scopeTitle: 'AIRSPACE SECTOR RADAR // 1090 MHz',
      scopeMeta: 'TARGETS: 6 | RANGE: 120 NM',
      demod: 'PULSE POSITION (PPM)',
      bandwidth: '2.0 MHz',
      engineClass: 'AdsbAircraftTracker.kt • AdsbModeSDecoder.kt',
      headers: ['IDENT', 'ICAO HEX', 'ALTITUDE', 'SPEED', 'SIGNAL'],
      targets: [
        { c1: 'AZA421', c2: '4CA85D', c3: 'FL360 (36,000 ft)', c4: '478 kts', c5: '-12 dBm', lat: 0.35, lon: 0.42 },
        { c1: 'AFR1182', c2: '394A20', c3: 'FL340 (34,000 ft)', c4: '450 kts', c5: '-16 dBm', lat: -0.45, lon: 0.28 },
        { c1: 'DLH440', c2: '3C65B2', c3: 'FL380 (38,000 ft)', c4: '492 kts', c5: '-14 dBm', lat: 0.62, lon: -0.38 },
        { c1: 'NATO01', c2: 'AE01D4', c3: 'FL310 (AWACS SENTRY)', c4: '390 kts', c5: '-21 dBm', lat: -0.22, lon: -0.55 },
        { c1: 'RYR87KC', c2: '4CA211', c3: 'FL280 (28,000 ft)', c4: '430 kts', c5: '-11 dBm', lat: 0.18, lon: -0.15 },
        { c1: 'BAW552', c2: '40052F', c3: 'FL390 (39,000 ft)', c4: '505 kts', c5: '-18 dBm', lat: -0.58, lon: 0.64 }
      ],
      rawPackets: [
        '*8D4CA85D580B07A9A06C04123456; [DF17 TC=19 ALT=36000 SQUAWK=7000]',
        '*8D394A20994400288820A812C4EF; [DF17 TC=9 POS=41.8902N 012.4923E]',
        '*8D3C65B2588302A6A04C20188902; [DF17 TC=19 ALT=38000 SPEED=492]',
        '*8DAE01D45812B4C0A02844ABCDEF; [DF17 TC=19 MILITARY AWACS SECURE]',
        '*8D4CA211991204288018A4FE1204; [DF17 TC=9 CPR_EVEN AIRBORNE_POS]'
      ]
    },
    ais: {
      scopeTitle: 'MARITIME COASTAL RADAR // 162.025 MHz',
      scopeMeta: 'VESSELS: 5 | SECTOR: CH-87B/88B',
      demod: 'GMSK 9600 BAUD (NRZI)',
      bandwidth: '25.0 kHz',
      engineClass: 'AisGmsk9600Decoder.kt • AisMarineTracker.kt',
      headers: ['SHIP NAME', 'MMSI', 'STATUS / HEADING', 'SPEED', 'SIGNAL'],
      targets: [
        { c1: 'EVER GIVEN', c2: '353136000', c3: 'Underway (218°)', c4: '16.4 kts', c5: '-14 dBm', lat: 0.42, lon: 0.35 },
        { c1: 'MSC OSCAR', c2: '352210000', c3: 'Underway (042°)', c4: '18.1 kts', c5: '-18 dBm', lat: -0.32, lon: 0.52 },
        { c1: 'GUARDIA COSTIERA', c2: '247000100', c3: 'Patrol Active (110°)', c4: '28.5 kts', c5: '-08 dBm', lat: 0.15, lon: -0.25 },
        { c1: 'NORDIC BULKER', c2: '219018000', c3: 'At Anchor (Moored)', c4: '0.1 kts', c5: '-12 dBm', lat: -0.48, lon: -0.42 },
        { c1: 'GASLOG GLASGOW', c2: '310752000', c3: 'Underway (185°)', c4: '15.2 kts', c5: '-22 dBm', lat: 0.58, lon: -0.35 }
      ],
      rawPackets: [
        '!AIVDM,1,1,,B,13aEO:00000t088K>P&p4?vN0000,0*25 [MSG 1: POS REPORT]',
        '!AIVDM,1,1,,A,15N74F001wo?:f8K;2f<2?vN08<P,0*34 [MMSI: 353136000 SOG: 16.4]',
        '!AIVDM,1,1,,B,403Ovk1v=200088K;=g=2?vN0<10,0*2A [MSG 4: BASE STATION]',
        '!AIVDM,1,1,,A,55N74F024001==0000000000000000000000000000,0*18 [STATIC VOYAGE]'
      ]
    },
    acars: {
      scopeTitle: 'ACARS AVIATION TELETYPE // 131.550 MHz',
      scopeMeta: 'MESSAGES CAPTURED: 4 | AM-MSK 2400',
      demod: 'AM-MSK 2400 BAUD',
      bandwidth: '8.0 kHz',
      engineClass: 'AcarsAm2400Decoder.kt • AcarsMessageParser.kt',
      headers: ['FLIGHT', 'REG TAIL', 'MESSAGE TYPE', 'ROUTING / WPT', 'SIGNAL'],
      targets: [
        { c1: 'BAW249', c2: 'G-STBC', c3: 'POS REPORT', c4: 'WPT BPK FL340 M.78', c5: '-15 dBm', lat: 0.25, lon: 0.38 },
        { c1: 'AFR022', c2: 'F-GSQD', c3: 'METAR WX', c4: 'LFPG 300100Z CAVOK', c5: '-19 dBm', lat: -0.35, lon: 0.22 },
        { c1: 'DLH104', c2: 'D-AIGP', c3: 'ENGINE DATA', c4: 'EGT NORMAL N1 88.4%', c5: '-12 dBm', lat: 0.48, lon: -0.32 },
        { c1: 'UAE007', c2: 'A6-EEO', c3: 'ATC CLEARANCE', c4: 'CLEARED DIRECT ETENI', c5: '-20 dBm', lat: -0.15, lon: -0.48 }
      ],
      rawPackets: [
        'ACARS: .G-STBC /BAW249 [POS REPORT BPK 0122 FL340 M.78 FOB 14.8T]',
        'ACARS: .F-GSQD /AFR022 [WX REQ LFPG 300100Z 24008KT 9999 FEW030 14/09 Q1018]',
        'ACARS: .D-AIGP /DLH104 [PERF MON ENGINE REPORT VIB OK OIL_PRESS 64]',
        'ACARS: .A6-EEO /UAE007 [ATC CPDLC CONNECTION ESTABLISHED TO LIMM_CTR]'
      ]
    },
    aprs: {
      scopeTitle: 'APRS TACTICAL PACKET // 144.800 MHz',
      scopeMeta: 'NODES HEARD: 4 | AFSK 1200 BELL 202',
      demod: 'AFSK 1200 BAUD (BELL 202)',
      bandwidth: '12.5 kHz',
      engineClass: 'AprsAfsk1200Decoder.kt • Ax25Frame.kt',
      headers: ['CALLSIGN', 'SSID', 'BEACON TYPE', 'COORDINATES / COMMENT', 'SIGNAL'],
      targets: [
        { c1: 'IK0PQL', c2: '-9 (Mobile)', c3: 'MIC-E TACTICAL', c4: '41°53.41N 012°29.53E', c5: '-09 dBm', lat: 0.22, lon: 0.18 },
        { c1: 'IZ0BXZ', c2: '-7 (Handheld)', c3: 'POSITION BEACON', c4: '41°50.12N 012°31.40E (433MHz Mesh)', c5: '-14 dBm', lat: -0.28, lon: 0.35 },
        { c1: 'IR0UG', c2: '-1 (Digipeater)', c3: 'WIDE2-2 RELAY', c4: 'Monte Cavo Digipeater 950m ASL', c5: '-06 dBm', lat: 0.52, lon: 0.44 },
        { c1: 'IW0QMN', c2: '-3 (Weather)', c3: 'WX TELEMETRY', c4: 'Temp: 16.4°C Baro: 1018.2hPa', c5: '-18 dBm', lat: -0.42, lon: -0.28 }
      ],
      rawPackets: [
        'IK0PQL-9>APRS,WIDE1-1:!4153.41N/01229.53E#Tactical Mobile Node [SPD: 45 KM/H]',
        'IZ0BXZ-7>APRS,WIDE2-1:=4150.12N/01231.40E-Q-P1NG Field Operator in Sector 4',
        'IR0UG-1>APRS,WIDE2-2:;4145.00N/01242.00E*111111zMonte Cavo Voice Repeater 145.600',
        'IW0QMN-3>APRS,TCPIP*:@300120z4155.00N/01230.00E_000/000g000t061r000p000P000b10182'
      ]
    }
  };

  function updateSigintView(protocol) {
    const data = protocolData[protocol];
    if (!data) return;

    if (scopeTitleEl) scopeTitleEl.textContent = data.scopeTitle;
    if (scopeMetaEl) scopeMetaEl.textContent = data.scopeMeta;
    if (demodTypeEl) demodTypeEl.textContent = data.demod;
    if (bandwidthEl) bandwidthEl.textContent = data.bandwidth;
    if (engineClassEl) engineClassEl.textContent = data.engineClass;

    // Update table headers
    if (tableHeaders) {
      tableHeaders.innerHTML = data.headers.map(h => `<th>${h}</th>`).join('');
    }

    // Update table body
    if (tableBody) {
      tableBody.innerHTML = data.targets.map(t => `
        <tr>
          <td><strong style="color:var(--neon-green)">${t.c1}</strong></td>
          <td>${t.c2}</td>
          <td>${t.c3}</td>
          <td>${t.c4}</td>
          <td><span style="color:var(--neon-cyan)">${t.c5}</span></td>
        </tr>
      `).join('');
    }

    // Update raw packets
    if (rawView) {
      rawView.innerHTML = data.rawPackets.map(p => `<div>&gt; ${p}</div>`).join('');
    }
  }

  // Tabs click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      activeProtocol = tab.dataset.sigintTab || 'adsb';
      updateSigintView(activeProtocol);
    });
  });

  // Table vs Raw toggle
  if (tabTableBtn && tabRawBtn && tableView && rawView) {
    tabTableBtn.addEventListener('click', () => {
      tabTableBtn.classList.add('is-active');
      tabRawBtn.classList.remove('is-active');
      tableView.style.display = 'block';
      rawView.style.display = 'none';
    });
    tabRawBtn.addEventListener('click', () => {
      tabRawBtn.classList.add('is-active');
      tabTableBtn.classList.remove('is-active');
      tableView.style.display = 'none';
      rawView.style.display = 'flex';
    });
  }

  // Radar Canvas rendering
  function renderRadarScope(timestamp) {
    if (!isRunning || !isVisible || !ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(cx, cy) - 20;

    // Background
    ctx.fillStyle = '#01050a';
    ctx.fillRect(0, 0, w, h);

    // Concentric range rings
    const rings = 4;
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.16)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= rings; i++) {
      const r = (maxR / rings) * i;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Range text
      ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
      ctx.font = '8px monospace';
      ctx.fillText(`${(i * 30)} NM`, cx + 4, cy - r + 10);
    }

    // Crosshairs
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxR);
    ctx.lineTo(cx, cy + maxR);
    ctx.moveTo(cx - maxR, cy);
    ctx.lineTo(cx + maxR, cy);
    ctx.stroke();

    // Rotating Radar Sweep
    sweepAngle = (timestamp * 0.001 * 1.4) % (Math.PI * 2);

    const grad = ctx.createConicGradient(sweepAngle, cx, cy);
    grad.addColorStop(0, 'rgba(53, 255, 138, 0.35)');
    grad.addColorStop(0.12, 'rgba(0, 242, 255, 0.08)');
    grad.addColorStop(0.25, 'transparent');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fill();

    // Sweep line
    ctx.strokeStyle = '#35ff8a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
    ctx.stroke();

    // Target Blips
    const curData = protocolData[activeProtocol];
    if (curData && curData.targets) {
      curData.targets.forEach((t, idx) => {
        const tx = cx + t.lon * maxR * 0.85;
        const ty = cy + t.lat * maxR * 0.85;

        // Angle diff to sweep for blip glow persistence
        const targetAngle = Math.atan2(ty - cy, tx - cx);
        let diff = (sweepAngle - targetAngle) % (Math.PI * 2);
        if (diff < 0) diff += Math.PI * 2;
        const brightness = Math.max(0.2, 1 - diff / (Math.PI * 0.8));

        // Draw icon / blip
        ctx.fillStyle = `rgba(53, 255, 138, ${brightness})`;
        ctx.beginPath();
        if (activeProtocol === 'adsb') {
          // Airplane triangle
          ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
        } else if (activeProtocol === 'ais') {
          // Marine diamond
          ctx.rect(tx - 3, ty - 3, 6, 6);
        } else {
          ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        }
        ctx.fill();

        // Label
        if (brightness > 0.4) {
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
          ctx.font = '9px monospace';
          ctx.fillText(t.c1, tx + 6, ty - 2);
          ctx.fillStyle = `rgba(0, 242, 255, ${brightness * 0.8})`;
          ctx.font = '8px monospace';
          ctx.fillText(t.c2, tx + 6, ty + 8);
        }
      });
    }

    animId = requestAnimationFrame(renderRadarScope);
  }

  function start() {
    if (isVisible) return;
    isVisible = true;
    animId = requestAnimationFrame(renderRadarScope);
  }

  function stop() {
    isVisible = false;
    cancelAnimationFrame(animId);
  }

  // Observer
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    }, { threshold: 0.12 });
    obs.observe(sigintDeck);
  } else {
    start();
  }

  // Global visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (sigintDeck.getBoundingClientRect().top < window.innerHeight && sigintDeck.getBoundingClientRect().bottom > 0) start();
  });

  // Initial populate
  updateSigintView('adsb');
})();


/* ==========================================================================
   ANTI-FORENSIC DEFENSE & QUANTUM IME CONTROLLER
   ========================================================================== */
(function initAntiForensics() {
  const section = document.getElementById('anti-forensic');
  if (!section) return;

  // 1. TABS NAVIGATION
  const tabBtns = section.querySelectorAll('.af-tab-btn');
  const tabPanes = section.querySelectorAll('.af-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const activePane = document.getElementById('pane-' + tabTarget);
      if (activePane) activePane.classList.add('active');
    });
  });

  // 2. TAB 1: QUANTUM IME & CALCULATOR DISGUISE
  const btnModeHud = document.getElementById('btn-ime-mode-hud');
  const btnModeCalc = document.getElementById('btn-ime-mode-calc');
  const kbHud = document.getElementById('af-keyboard-hud');
  const kbCalc = document.getElementById('af-keyboard-calc');
  const toolCalc = document.getElementById('kb-tool-calc');
  const btnCalcBack = document.getElementById('btn-calc-back-hud');
  const typedOutput = document.getElementById('af-typed-output');

  function switchImeMode(mode) {
    if (mode === 'calc') {
      if (kbHud) kbHud.classList.add('hidden');
      if (kbCalc) kbCalc.classList.remove('hidden');
      if (btnModeCalc) btnModeCalc.classList.add('active');
      if (btnModeHud) btnModeHud.classList.remove('active');
    } else {
      if (kbCalc) kbCalc.classList.add('hidden');
      if (kbHud) kbHud.classList.remove('hidden');
      if (btnModeHud) btnModeHud.classList.add('active');
      if (btnModeCalc) btnModeCalc.classList.remove('active');
    }
  }

  if (btnModeHud) btnModeHud.addEventListener('click', () => switchImeMode('hud'));
  if (btnModeCalc) btnModeCalc.addEventListener('click', () => switchImeMode('calc'));
  if (toolCalc) toolCalc.addEventListener('click', () => switchImeMode('calc'));
  if (btnCalcBack) btnCalcBack.addEventListener('click', () => switchImeMode('hud'));

  // Keyboard typing interaction
  let currentTyped = 'CONFIDENTIAL_PAYLOAD_READY_';
  const keys = section.querySelectorAll('.af-key[data-k]');
  keys.forEach(k => {
    k.addEventListener('click', () => {
      if (currentTyped.endsWith('_')) currentTyped = currentTyped.slice(0, -1);
      currentTyped += k.getAttribute('data-k') + '_';
      if (typedOutput) typedOutput.textContent = currentTyped;
    });
  });

  const btnBackspace = document.getElementById('af-kb-backspace');
  if (btnBackspace) {
    btnBackspace.addEventListener('click', () => {
      let core = currentTyped.endsWith('_') ? currentTyped.slice(0, -1) : currentTyped;
      if (core.length > 0) core = core.slice(0, -1);
      currentTyped = core + '_';
      if (typedOutput) typedOutput.textContent = currentTyped;
    });
  }

  const btnSpace = document.getElementById('af-kb-space');
  if (btnSpace) {
    btnSpace.addEventListener('click', () => {
      let core = currentTyped.endsWith('_') ? currentTyped.slice(0, -1) : currentTyped;
      currentTyped = core + ' _';
      if (typedOutput) typedOutput.textContent = currentTyped;
    });
  }

  const btnEnter = document.getElementById('af-kb-enter');
  if (btnEnter) {
    btnEnter.addEventListener('click', () => {
      if (typedOutput) {
        typedOutput.textContent = '🔒 [MESSAGE_ENCRYPTED_AND_DISPATCHED]';
        setTimeout(() => {
          currentTyped = '_';
          typedOutput.textContent = currentTyped;
        }, 1600);
      }
    });
  }

  const toolWhisper = document.getElementById('kb-tool-whisper');
  if (toolWhisper) {
    toolWhisper.addEventListener('click', () => {
      let core = currentTyped.endsWith('_') ? currentTyped.slice(0, -1) : currentTyped;
      currentTyped = core + ' [WHISPER: "BEACON_COORDINATE_77"]_';
      if (typedOutput) typedOutput.textContent = currentTyped;
    });
  }

  const toolVault = document.getElementById('kb-tool-vault');
  if (toolVault) {
    toolVault.addEventListener('click', () => {
      let core = currentTyped.endsWith('_') ? currentTyped.slice(0, -1) : currentTyped;
      currentTyped = core + ' [NSEC1_SECRET_SNIPPET_INSERTED]_';
      if (typedOutput) typedOutput.textContent = currentTyped;
    });
  }

  // Ephemeral Clipboard Watchdog
  const clipContent = document.getElementById('af-clip-content');
  const clipBar = document.getElementById('af-clip-bar');
  const clipTimer = document.getElementById('af-clip-timer');
  const clipBadge = document.getElementById('af-clip-badge');
  const clipFlushBtn = document.getElementById('af-clip-flush-btn');
  const kbToolWipe = document.getElementById('kb-tool-wipe');

  let clipSeconds = 30;
  const clipSamples = [
    '[ENC_PAYLOAD: 8f2a...9c41]',
    '[NOSTR_KEY: nsec1ql4z...p99x]',
    '[BIP39_SEED: 7e93...11ba]',
    '[SESSION_KEY: ed25519...3f02]'
  ];
  let clipSampleIdx = 0;

  function flushClipboard() {
    clipSeconds = 30;
    if (clipContent) {
      clipContent.textContent = '[BUFFER_ZEROIZED: 00 00 00 00]';
      clipContent.style.color = 'var(--neon-red)';
    }
    if (clipBadge) {
      clipBadge.textContent = 'BUFFER: ZEROIZED';
      clipBadge.style.color = 'var(--neon-red)';
    }
    if (clipBar) clipBar.style.width = '0%';
    if (clipTimer) clipTimer.textContent = '0s';

    setTimeout(() => {
      clipSampleIdx = (clipSampleIdx + 1) % clipSamples.length;
      if (clipContent) {
        clipContent.textContent = clipSamples[clipSampleIdx];
        clipContent.style.color = 'var(--neon-green)';
      }
      if (clipBadge) {
        clipBadge.textContent = 'BUFFER: ENCRYPTED (AES-256)';
        clipBadge.style.color = 'var(--neon-cyan)';
      }
      clipSeconds = 30;
    }, 1800);
  }

  if (clipFlushBtn) clipFlushBtn.addEventListener('click', flushClipboard);
  if (kbToolWipe) kbToolWipe.addEventListener('click', flushClipboard);

  setInterval(() => {
    if (clipSeconds > 0) {
      clipSeconds--;
      if (clipTimer) clipTimer.textContent = clipSeconds + 's';
      if (clipBar) clipBar.style.width = ((clipSeconds / 30) * 100) + '%';
    } else {
      flushClipboard();
    }
  }, 1000);

  // Calculator Engine (KeyboardCalculator.kt Safe Evaluator)
  const calcExpr = document.getElementById('af-calc-expr');
  const calcResult = document.getElementById('af-calc-result');
  const ckeys = section.querySelectorAll('.af-ckey[data-c]');
  let currentExpr = '1337 * 42';

  function safeEvaluate(expr) {
    try {
      const sanitized = expr.replace(/\^/g, '**');
      if (!/^[0-9+\-*/().\s*]+$/.test(sanitized)) return 'ERR';
      // eslint-disable-next-line no-eval
      const val = Function('"use strict";return (' + sanitized + ')')();
      if (typeof val === 'number' && Number.isFinite(val)) {
        return Math.round(val * 100000) / 100000;
      }
      return 'ERR';
    } catch (e) {
      return 'ERR';
    }
  }

  ckeys.forEach(ck => {
    ck.addEventListener('click', () => {
      const c = ck.getAttribute('data-c');
      if (c === 'C') {
        currentExpr = '';
        if (calcExpr) calcExpr.textContent = '0';
        if (calcResult) calcResult.textContent = '0';
      } else if (c === '=') {
        if (!currentExpr) return;
        const res = safeEvaluate(currentExpr);
        if (calcResult) calcResult.textContent = res;
      } else {
        if (currentExpr === '0') currentExpr = '';
        currentExpr += c;
        if (calcExpr) calcExpr.textContent = currentExpr;
        const live = safeEvaluate(currentExpr);
        if (live !== 'ERR' && calcResult) calcResult.textContent = live;
      }
    });
  });

  // 3. TAB 2: DURESS PIN & PLAUSIBLE DENIABILITY ENGINE
  let enteredPin = '';
  const pinDots = section.querySelectorAll('#af-pin-dots .pin-dot');
  const pinFeedback = document.getElementById('af-pin-feedback');
  const screenStates = section.querySelectorAll('.af-screen-state');

  function updateDots() {
    pinDots.forEach((d, i) => {
      if (i < enteredPin.length) d.classList.add('filled');
      else d.classList.remove('filled');
    });
  }

  function setScreenState(stateId) {
    screenStates.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(stateId);
    if (target) target.classList.add('active');
  }

  function evaluatePin() {
    if (enteredPin === '1337') {
      setScreenState('state-master');
      if (pinFeedback) {
        pinFeedback.textContent = 'AUTH_GRANTED // MASTER ENCRYPTED VAULT';
        pinFeedback.style.color = 'var(--neon-green)';
      }
    } else if (enteredPin === '9999') {
      setScreenState('state-weather');
      if (pinFeedback) {
        pinFeedback.textContent = 'PLAUSIBLE DENIABILITY // DECOY WEATHER PRO';
        pinFeedback.style.color = 'var(--neon-cyan)';
      }
    } else if (enteredPin === '4040') {
      setScreenState('state-grocery');
      if (pinFeedback) {
        pinFeedback.textContent = 'PLAUSIBLE DENIABILITY // DECOY GROCERY CART';
        pinFeedback.style.color = 'var(--neon-amber)';
      }
    } else if (enteredPin === '0000') {
      setScreenState('state-duress-wipe');
      if (pinFeedback) {
        pinFeedback.textContent = 'SILENT_DURESS_TRIGGERED // ZEROIZING MASTER KEYS';
        pinFeedback.style.color = 'var(--neon-red)';
      }
    } else {
      if (pinFeedback) {
        pinFeedback.textContent = 'ERR: INVALID_PIN (REMAINING: 2)';
        pinFeedback.style.color = 'var(--neon-red)';
      }
      setTimeout(() => {
        enteredPin = '';
        updateDots();
      }, 700);
    }
  }

  // Keypad clicks
  const kpadBtns = section.querySelectorAll('.af-kpad-btn[data-n]');
  kpadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (enteredPin.length < 4) {
        enteredPin += btn.getAttribute('data-n');
        updateDots();
        if (enteredPin.length === 4) {
          setTimeout(evaluatePin, 200);
        }
      }
    });
  });

  const pinClear = document.getElementById('af-pin-clear');
  if (pinClear) {
    pinClear.addEventListener('click', () => {
      enteredPin = '';
      updateDots();
      if (pinFeedback) {
        pinFeedback.textContent = 'PIN BUFFER CLEARED';
        pinFeedback.style.color = 'rgba(255, 255, 255, 0.6)';
      }
    });
  }

  const pinSubmit = document.getElementById('af-pin-submit');
  if (pinSubmit) {
    pinSubmit.addEventListener('click', evaluatePin);
  }

  // Presets click
  const presetChips = section.querySelectorAll('.af-pin-chip[data-testpin]');
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      enteredPin = chip.getAttribute('data-testpin');
      updateDots();
      evaluatePin();
    });
  });

  // Decoy dismissal buttons
  function resetToLock() {
    enteredPin = '';
    updateDots();
    setScreenState('state-locked');
    if (pinFeedback) {
      pinFeedback.textContent = 'STANDBY // CLICK PRESETS OR KEYPAD';
      pinFeedback.style.color = 'rgba(255, 255, 255, 0.6)';
    }
  }

  const btnRelockMaster = document.getElementById('btn-relock-master');
  const btnExitWeather = document.getElementById('btn-exit-weather');
  const btnExitGrocery = document.getElementById('btn-exit-grocery');
  const btnResetDuress = document.getElementById('btn-reset-duress');

  if (btnRelockMaster) btnRelockMaster.addEventListener('click', resetToLock);
  if (btnExitWeather) btnExitWeather.addEventListener('click', resetToLock);
  if (btnExitGrocery) btnExitGrocery.addEventListener('click', resetToLock);
  if (btnResetDuress) btnResetDuress.addEventListener('click', resetToLock);

  // Grocery count update
  const groceryItems = section.querySelectorAll('#grocery-items input[type="checkbox"]');
  const groceryCount = document.getElementById('grocery-count');
  function updateGroceryCount() {
    let unchk = 0;
    groceryItems.forEach(i => { if (!i.checked) unchk++; });
    if (groceryCount) groceryCount.textContent = unchk + ' items left';
  }
  groceryItems.forEach(i => i.addEventListener('change', updateGroceryCount));

  // 4. TAB 3: 35-DOMAIN WIPE MATRIX & PIPELINE
  const profBtns = section.querySelectorAll('.af-prof-btn');
  const domCards = section.querySelectorAll('.af-dom-card');
  const btnRunWipe = document.getElementById('btn-run-wipe-sim');
  const seqSteps = section.querySelectorAll('#af-seq-steps .step-box');

  profBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      profBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const prof = btn.getAttribute('data-prof');

      domCards.forEach(card => {
        const sev = card.getAttribute('data-sev');
        if (prof === 'quick') {
          if (sev === 'CRITICAL') card.style.opacity = '1';
          else card.style.opacity = '0.3';
        } else if (prof === 'standard') {
          if (sev === 'CRITICAL' || sev === 'HIGH') card.style.opacity = '1';
          else card.style.opacity = '0.4';
        } else {
          card.style.opacity = '1';
        }
      });
    });
  });

  if (btnRunWipe) {
    btnRunWipe.addEventListener('click', () => {
      btnRunWipe.disabled = true;
      btnRunWipe.textContent = 'EXECUTING WIPE SEQUENCE...';

      let step = 0;
      function nextStep() {
        seqSteps.forEach(s => s.classList.remove('step-active'));
        if (step < seqSteps.length) {
          seqSteps[step].classList.add('step-active');
          step++;
          setTimeout(nextStep, 600);
        } else {
          btnRunWipe.disabled = false;
          btnRunWipe.textContent = 'SIMULATION COMPLETE // ENTROPY ZEROIZED';
          setTimeout(() => {
            seqSteps.forEach(s => s.classList.remove('step-active'));
            btnRunWipe.textContent = 'EXECUTE PIPELINE SIMULATION';
          }, 2400);
        }
      }
      nextStep();
    });
  }

  // 5. TAB 4: PROOT LINUX SANDBOX PRO
  const termScreen = document.getElementById('af-term-screen');
  const termCmdEcho = document.getElementById('af-term-cmd-echo');
  const btnTermRun = document.getElementById('btn-term-run');
  const btnTermClear = document.getElementById('btn-term-clear');
  const btnTermPy = document.getElementById('btn-term-py');
  const catTags = section.querySelectorAll('.cat-tag[data-cmd]');

  const commandDb = {
    'nmap': [
      'Starting Nmap 7.94 ( https://nmap.org ) at 2026-09-30 02:40 UTC',
      'Nmap scan report for gateway.lan (192.168.1.1)',
      'Host is up (0.0034s latency).',
      'PORT     STATE SERVICE',
      '22/tcp   open  ssh (Dropbear 2022.82)',
      '80/tcp   open  http (lighttpd 1.4.67)',
      '443/tcp  open  https',
      'MAC Address: 9C:35:EB:7A:41:22 (Hardware Bridge)',
      'Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds'
    ],
    'tshark': [
      'Capturing on eth0 (PRoot virtual socket bridge)',
      '  1 0.000000 192.168.1.42 -> 192.168.1.1 DNS Standard query 0x1a2b A encrypted.mesh',
      '  2 0.001210 192.168.1.1 -> 192.168.1.42 DNS Standard query response NXDOMAIN',
      '  3 0.015400 192.168.1.42 -> 10.0.0.2   TCP 54820 > 9050 [SYN] Seq=0 Win=64240',
      '  4 0.016800 10.0.0.2   -> 192.168.1.42 TCP 9050 > 54820 [SYN, ACK] Seq=0 Ack=1',
      '4 packets captured'
    ],
    'tcpdump': [
      'tcpdump: verbose output suppressed, use -v[v]... for full protocol decode',
      'listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes',
      '02:41:10.104 IP 192.168.1.105.53412 > 1.1.1.1.53: 42109+ A? torproject.org. (32)',
      '02:41:10.128 IP 1.1.1.1.53 > 192.168.1.105.53412: 42109 2/0/0 A 116.202.120.166 (64)',
      '4 packets captured, 4 packets received by filter, 0 packets dropped'
    ],
    'socat': [
      '2026/09/30 02:42:01 socat[14201] N listening on AF=2 0.0.0.0:8080',
      '2026/09/30 02:42:04 socat[14201] N accepting connection from AF=2 127.0.0.1:49182',
      '> RAW_HEX_STREAM: 41 49 52 47 41 50 20 4c 49 4e 4b 20 4f 4b [AIRGAP LINK OK]',
      '2026/09/30 02:42:04 socat[14201] N socket 1 (fd 5) successfully relayed to stdout'
    ],
    'sslscan': [
      'Testing SSL/TLS server https://check.torproject.org on port 443',
      '  TLSv1.3  256 bits  TLS_AES_256_GCM_SHA384        Curve 25519 DHE 253',
      '  TLSv1.3  128 bits  TLS_CHACHA20_POLY1305_SHA256  Curve 25519 DHE 253',
      '  TLS Fallback SCSV: Server supports TLS Fallback SCSV',
      '  Heartbleed: NOT vulnerable',
      '  Certificate: Subject: *.torproject.org / Issuer: Lets Encrypt'
    ],
    'yara': [
      'Scanning /workspace/target.bin against opsec.yar...',
      '0x12a0:rule_crypto_hardcoded_key /workspace/target.bin',
      '0x4100:rule_suspicious_anti_debug_flag /workspace/target.bin',
      'Scan complete: 2 rule matches identified.'
    ],
    'python3': [
      'Python 3.11.8 (main, Feb  7 2026, 04:12:11) [GCC 13.2.1 20231014] on linux',
      'Entropy: 8.00 bits/byte (Maximum Theoretical Randomness)',
      'HMAC-SHA256: 4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
    ],
    'ripgrep': [
      '/workspace/config.env:14:ENCRYPTION_LAYER=XCHACHA20_POLY1305',
      '/workspace/keys/seed.txt:1:CONFIDENTIAL_DESCRIPTOR_WP84',
      '/workspace/radio/sdr_profile.json:8:"frequency_khz": 1090000',
      '3 matches found across 18 files (0.004s)'
    ],
    'sqlite3': [
      'SQLite version 3.44.2 2023-11-24 11:41:44',
      'Encrypted schema detected. Decrypting with transient key...',
      'contacts           key_registry       messages           tor_sessions',
      'audit_log          sdr_bookmarks      vault_payloads     whisper_cache',
      '8 tables present in SQLCipher database.'
    ],
    'openssl': [
      'Generating 32 cryptographically secure pseudo-random bytes:',
      'e8 4c 19 9a bf 71 d0 3a f2 88 e1 04 6b 9d 3c 7f a1 0e 55 b8 24 d9 81 f0 32 c6 90 ee 1a 47 c8 22'
    ],
    'iperf3': [
      'Connecting to host 10.42.0.1, port 5201',
      '[  5] local 10.42.0.88 port 48122 connected to 10.42.0.1 port 5201',
      '[ ID] Interval           Transfer     Bitrate         Retr',
      '[  5]   0.00-1.00   sec  89.4 MBytes   750 Mbits/sec    0',
      '- - - - - - - - - - - - - - - - - - - - - - - - -',
      'Local Wi-Fi P2P Throughput: 750 Mbits/sec (Optimal RF path)'
    ],
    'jq': [
      '{',
      '  "node_id": "qp1ng-alpha-99",',
      '  "transport": "OPTICAL_FOUNTAIN_QR",',
      '  "mtu_bytes": 1024,',
      '  "fec_redundancy": "40%",',
      '  "status": "AIRGAP_OPERATIONAL"',
      '}'
    ]
  };

  let activeCmd = 'nmap -sT 192.168.1.1';

  function appendTerminal(lines, isCmd = false) {
    if (!termScreen) return;
    const actLine = termScreen.querySelector('.term-line-active');
    if (actLine) actLine.remove();

    if (isCmd) {
      const cmdDiv = document.createElement('div');
      cmdDiv.className = 'term-out term-out-info';
      cmdDiv.textContent = 'root@qp1ng-alpine:~# ' + isCmd;
      termScreen.appendChild(cmdDiv);
    }

    lines.forEach(l => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'term-out';
      if (l.includes('open') || l.includes('ACTIVE') || l.includes('COMPLETE') || l.includes('Optimal')) {
        lineDiv.classList.add('term-out-success');
      } else if (l.includes('WARN') || l.includes('Timeout') || l.includes('Retr')) {
        lineDiv.classList.add('term-out-warn');
      }
      lineDiv.textContent = l;
      termScreen.appendChild(lineDiv);
    });

    const newAct = document.createElement('div');
    newAct.className = 'term-line-active';
    newAct.innerHTML = '<span class="term-prompt">root@qp1ng-alpine:~#</span> <span class="term-input" id="af-term-cmd-echo">' + activeCmd + '</span> <span class="term-cursor"></span>';
    termScreen.appendChild(newAct);
    termScreen.scrollTop = termScreen.scrollHeight;
  }

  function executeTerminalCmd(cmd) {
    activeCmd = cmd;
    const key = Object.keys(commandDb).find(k => cmd.startsWith(k)) || 'nmap';
    const lines = commandDb[key] || ['Command completed with return code 0'];
    appendTerminal(lines, cmd);
  }

  catTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const cmd = tag.getAttribute('data-cmd');
      if (termCmdEcho) termCmdEcho.textContent = cmd;
      activeCmd = cmd;
      setTimeout(() => executeTerminalCmd(cmd), 150);
    });
  });

  if (btnTermRun) {
    btnTermRun.addEventListener('click', () => {
      executeTerminalCmd(activeCmd);
    });
  }

  if (btnTermClear) {
    btnTermClear.addEventListener('click', () => {
      if (termScreen) {
        termScreen.innerHTML = `
          <div class="term-out">Linux qp1ng-alpine 6.6.21-qp1ng-proot #1 SMP PREEMPT aarch64 Linux</div>
          <div class="term-out">Alpine Linux 3.19.1 - Userspace Container (Zero-Root required)</div>
          <div class="term-out">&nbsp;</div>
          <div class="term-line-active">
            <span class="term-prompt">root@qp1ng-alpine:~#</span>
            <span class="term-input" id="af-term-cmd-echo">nmap -sT 192.168.1.1</span>
            <span class="term-cursor"></span>
          </div>
        `;
      }
    });
  }

  if (btnTermPy) {
    btnTermPy.addEventListener('click', () => {
      const pyCmd = 'python3 -c "import hashlib, hmac; print(\'HMAC:\', hmac.new(b\'k\', b\'test\', hashlib.sha256).hexdigest())"';
      executeTerminalCmd(pyCmd);
    });
  }
})();


/* ==========================================================================
   Q-SAT SATELLITE INTELLIGENCE & GHOSTWAVE RIG CONTROLLER
   ========================================================================== */
(function initQSatController() {
  const section = document.getElementById('q-sat');
  if (!section) return;

  // 1. TAB NAVIGATION
  const tabBtns = section.querySelectorAll('.qsat-tab-btn');
  const tabPanes = section.querySelectorAll('.qsat-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const activePane = document.getElementById('qsat-pane-' + tabTarget);
      if (activePane) activePane.classList.add('active');
    });
  });

  // 2. SATELLITE DATA DATABASE
  const satelliteData = {
    'noaa19': {
      name: 'NOAA-19 [NORAD 33591]',
      status: 'LINK: EXCELLENT (74°)',
      freq: '137.100 MHz',
      freqHz: 137100000,
      pol: 'RHCP Circular',
      mod: 'Analog FM / APT (17 kHz BW)',
      alt: '842 km',
      aos: 'IN 03m 42s',
      el: '74.2° (ZENITH)',
      guidance: 'Point ENE 068° Azimuth, Raise 42° Elevation. Peak: 74° in 06m 12s.',
      az: 68,
      elevation: 42.5,
      range: '1,120 km',
      trajectory: { startAz: 195, peakAz: 68, peakEl: 74, endAz: 12 },
      streamType: 'NOAA APT LINE SYNC',
      streamLines: [
        '[SYNC A: 1040 Hz] [SYNC B: 832 Hz] LINE 0842/1200 LOCK',
        'CH1 (VIS 0.64um): 214 218 221 219 212 205 198 184 172',
        'CH2 (IR 10.8um):  042 045 049 052 056 061 068 074 081',
        'TEMP CALIBRATION: SENSOR_T = 281.4K // SPACE RADIATOR = 4.2K'
      ]
    },
    'noaa18': {
      name: 'NOAA-18 [NORAD 28654]',
      status: 'LINK: GOOD (58°)',
      freq: '137.9125 MHz',
      freqHz: 137912500,
      pol: 'RHCP Circular',
      mod: 'Analog FM / APT (17 kHz BW)',
      alt: '854 km',
      aos: 'IN 28m 10s',
      el: '58.0° (HIGH PASS)',
      guidance: 'Point SE 142° Azimuth, Raise 28° Elevation. Peak: 58° in 34m 00s.',
      az: 142,
      elevation: 28.0,
      range: '1,480 km',
      trajectory: { startAz: 210, peakAz: 142, peakEl: 58, endAz: 30 },
      streamType: 'NOAA-18 APT TELEMETRY',
      streamLines: [
        '[FRAME LOCK] AVHRR/3 APT Telemetry Frame 124',
        'CH1 (VIS): 198 202 208 214 210 205 194 182 170',
        'CH4 (IR):  065 068 072 075 080 084 089 095 101',
        'DEEP SPACE CLAMP: OK // LINE COUNTER = 0418'
      ]
    },
    'meteor': {
      name: 'METEOR-M2-4 [NORAD 58858]',
      status: 'LINK: EXCELLENT (68°)',
      freq: '137.100 MHz',
      freqHz: 137100000,
      pol: 'RHCP Circular',
      mod: 'Digital 72k QPSK / LRPT',
      alt: '825 km',
      aos: 'IN 14m 50s',
      el: '68.4° (ZENITH)',
      guidance: 'Point NNE 035° Azimuth, Raise 36° Elevation. Peak: 68° in 20m 30s.',
      az: 35,
      elevation: 36.2,
      range: '1,210 km',
      trajectory: { startAz: 180, peakAz: 35, peakEl: 68, endAz: 355 },
      streamType: 'METEOR LRPT DIGITAL QPSK',
      streamLines: [
        'VITERBI FEC LOCK: BER = 0.00000 // 72 kbps QPSK',
        'MSU-MR RGB PACKET #18442: 1280x1024 DECOMPRESSING',
        'REED-SOLOMON CHECK: OK (0 errors corrected in block)',
        'RADIOMETER CALIBRATION: ON-BOARD BLACKBODY = 289.1K'
      ]
    },
    'iss': {
      name: 'ISS (ZARYA) [NORAD 25544]',
      status: 'LINK: SUPERIOR (82°)',
      freq: '145.800 MHz',
      freqHz: 145800000,
      pol: 'Linear 5/8 Wave',
      mod: 'FM / APRS 1200 & SSTV',
      alt: '418 km',
      aos: 'IN 08m 15s',
      el: '82.1° (OVERHEAD)',
      guidance: 'Point SSW 210° Azimuth, Raise 54° Elevation. Peak: 82° in 11m 40s.',
      az: 210,
      elevation: 54.0,
      range: '540 km',
      trajectory: { startAz: 290, peakAz: 210, peakEl: 82, endAz: 110 },
      streamType: 'ISS AX.25 APRS PACKET',
      streamLines: [
        'RS0ISS-4>CQ,ARISS* [UI, C]: Hello from International Space Station!',
        'TELEMETRY: BATT=31.8V SOLAR_CURRENT=48.2A CABIN_P=101.3kPa',
        'APRS PACKET RELAYED: IK1XXX>APRS [MSG #42 RECEIVED IN ORBIT]',
        'SSTV TRANSPONDER: STANDBY // CAM STATUS: NOMINAL'
      ]
    },
    'so50': {
      name: 'SO-50 (SAUDISAT-1C) [NORAD 27607]',
      status: 'LINK: GOOD (44°)',
      freq: '145.850 MHz (Down)',
      freqHz: 145850000,
      pol: 'Linear / Polarization Drift',
      mod: 'V/U FM Voice Repeater',
      alt: '680 km',
      aos: 'IN 41m 20s',
      el: '44.5° (MID PASS)',
      guidance: 'Point NW 315° Azimuth, Raise 22° Elevation. Peak: 44° in 46m 10s.',
      az: 315,
      elevation: 22.0,
      range: '1,650 km',
      trajectory: { startAz: 240, peakAz: 315, peakEl: 44, endAz: 40 },
      streamType: 'SO-50 FM VOICE REPEATER',
      streamLines: [
        'CARRIER DETECTED: CTCSS 67.0 Hz ARMED',
        'UPLINK: 436.795 MHz FM // DOWNLINK: 145.850 MHz FM',
        'AUDIO LEVEL: -14 dBFS (NOISE FLOOR PENETRATED)',
        'REPEATER TIMER: 10-MINUTE ARMED TIMER ACTIVE'
      ]
    }
  };

  let currentSatKey = 'noaa19';

  // UI elements for telemetry
  const satBtns = section.querySelectorAll('.qsat-sat-btn[data-sat]');
  const satNameEl = document.getElementById('qsat-sat-name');
  const satStatusEl = document.getElementById('qsat-sat-status');
  const teleFreqEl = document.getElementById('qsat-tele-freq');
  const telePolEl = document.getElementById('qsat-tele-pol');
  const teleModEl = document.getElementById('qsat-tele-mod');
  const teleAltEl = document.getElementById('qsat-tele-alt');
  const teleAosEl = document.getElementById('qsat-tele-aos');
  const teleElEl = document.getElementById('qsat-tele-el');
  const guidanceEl = document.getElementById('qsat-antenna-guidance');
  const hudAzVal = document.getElementById('hud-az-val');
  const hudElVal = document.getElementById('hud-el-val');
  const hudDistVal = document.getElementById('hud-dist-val');

  // Doppler tab elements
  const freqNominalEl = document.getElementById('qsat-freq-nominal');
  const freqDeltaEl = document.getElementById('qsat-freq-delta');
  const freqActualEl = document.getElementById('qsat-freq-actual');
  const velocityValEl = document.getElementById('qsat-velocity-val');
  const passSlider = document.getElementById('qsat-pass-slider');
  const scrubLabel = document.getElementById('qsat-scrub-label');
  const streamTypeEl = document.getElementById('qsat-stream-type');
  const streamContentEl = document.getElementById('qsat-stream-content');

  function updateSatelliteView(key) {
    currentSatKey = key;
    const sat = satelliteData[key];
    if (!sat) return;

    satBtns.forEach(b => {
      if (b.getAttribute('data-sat') === key) b.classList.add('active');
      else b.classList.remove('active');
    });

    if (satNameEl) satNameEl.textContent = sat.name;
    if (satStatusEl) satStatusEl.textContent = sat.status;
    if (teleFreqEl) teleFreqEl.textContent = sat.freq;
    if (telePolEl) telePolEl.textContent = sat.pol;
    if (teleModEl) teleModEl.textContent = sat.mod;
    if (teleAltEl) teleAltEl.textContent = sat.alt;
    if (teleAosEl) teleAosEl.textContent = sat.aos;
    if (teleElEl) teleElEl.textContent = sat.el;
    if (guidanceEl) guidanceEl.textContent = sat.guidance;
    if (hudAzVal) hudAzVal.textContent = sat.az + '°';
    if (hudElVal) hudElVal.textContent = sat.elevation + '°';
    if (hudDistVal) hudDistVal.textContent = sat.range;

    if (freqNominalEl) freqNominalEl.textContent = (sat.freqHz / 1000000).toFixed(6) + ' MHz';
    if (streamTypeEl) streamTypeEl.textContent = sat.streamType;
    if (streamContentEl) {
      streamContentEl.innerHTML = sat.streamLines.map(l => {
        let cls = 'stream-line';
        if (l.includes('LOCK') || l.includes('OK')) cls += ' txt-green';
        else if (l.includes('CALIBRATION') || l.includes('TIMER')) cls += ' txt-amber';
        return '<div class="' + cls + '">' + l + '</div>';
      }).join('');
    }

    updateDopplerCalculation();
  }

  satBtns.forEach(b => {
    b.addEventListener('click', () => {
      updateSatelliteView(b.getAttribute('data-sat'));
    });
  });

  // 3. DOPPLER CALCULATION LOGIC (QSatDopplerAdvice.kt)
  const SPEED_OF_LIGHT = 299792458; // m/s

  function updateDopplerCalculation() {
    const sat = satelliteData[currentSatKey];
    if (!sat || !passSlider) return;

    const sliderVal = parseInt(passSlider.value, 10); // -100 to +100
    // Max range rate is approx 7,200 m/s for LEO
    const maxRangeRate = 7200;
    const rangeRateMps = (sliderVal / 100) * maxRangeRate; // negative = approaching, positive = receding

    // Formula: deltaF = - (rangeRateMps / SPEED_OF_LIGHT) * f0
    const deltaF = Math.round(- (rangeRateMps / SPEED_OF_LIGHT) * sat.freqHz);
    const retunedHz = sat.freqHz + deltaF;

    if (scrubLabel) {
      if (sliderVal < -20) scrubLabel.textContent = 'AOS APPROACH (BLUE SHIFT)';
      else if (sliderVal > 20) scrubLabel.textContent = 'LOS RECEDING (RED SHIFT)';
      else scrubLabel.textContent = 'TCA ZENITH (PEAK ELEVATION)';
    }

    if (freqDeltaEl) {
      const sign = deltaF >= 0 ? '+' : '';
      const badge = deltaF > 100 ? ' (BLUE SHIFT)' : (deltaF < -100 ? ' (RED SHIFT)' : ' (ZERO CROSSING)');
      freqDeltaEl.textContent = sign + deltaF.toLocaleString() + ' Hz' + badge;
      if (deltaF > 100) freqDeltaEl.style.color = 'var(--neon-cyan)';
      else if (deltaF < -100) freqDeltaEl.style.color = 'var(--neon-amber)';
      else freqDeltaEl.style.color = 'var(--neon-green)';
    }

    if (freqActualEl) {
      freqActualEl.textContent = (retunedHz / 1000000).toFixed(6) + ' MHz';
    }

    if (velocityValEl) {
      const vSign = rangeRateMps >= 0 ? '+' : '';
      const vDir = rangeRateMps < -50 ? '(APPROACHING)' : (rangeRateMps > 50 ? '(RECEDING)' : '(PERPENDICULAR)');
      velocityValEl.textContent = vSign + Math.round(rangeRateMps).toLocaleString() + ' m / s ' + vDir;
    }
  }

  if (passSlider) {
    passSlider.addEventListener('input', updateDopplerCalculation);
  }

  // 4. POLAR SKY RADAR CANVAS RENDERER
  const polarCanvas = document.getElementById('qsatPolarCanvas');
  let polarCtx = polarCanvas ? polarCanvas.getContext('2d') : null;
  let radarAngle = 0;
  let animId = null;
  let isRadarVisible = false;

  function renderPolarRadar() {
    if (!polarCtx || !polarCanvas) return;
    const w = polarCanvas.width;
    const h = polarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = cx - 28;

    polarCtx.clearRect(0, 0, w, h);

    // Background gradient
    const bgGrad = polarCtx.createRadialGradient(cx, cy, 10, cx, cy, maxR);
    bgGrad.addColorStop(0, 'rgba(0, 243, 255, 0.08)');
    bgGrad.addColorStop(1, 'rgba(6, 10, 20, 0.95)');
    polarCtx.fillStyle = bgGrad;
    polarCtx.beginPath();
    polarCtx.arc(cx, cy, maxR, 0, Math.PI * 2);
    polarCtx.fill();

    // Concentric elevation circles (0° horizon, 30°, 60°, 90° center)
    const rings = [
      { r: maxR, label: '0°' },
      { r: maxR * (60 / 90), label: '30°' },
      { r: maxR * (30 / 90), label: '60°' }
    ];

    polarCtx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
    polarCtx.lineWidth = 1;
    polarCtx.fillStyle = 'rgba(0, 243, 255, 0.5)';
    polarCtx.font = '10px "JetBrains Mono", monospace';

    rings.forEach(ring => {
      polarCtx.beginPath();
      polarCtx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      polarCtx.stroke();
      polarCtx.fillText(ring.label, cx + 4, cy - ring.r + 12);
    });

    // Crosshairs
    polarCtx.beginPath();
    polarCtx.moveTo(cx, cy - maxR);
    polarCtx.lineTo(cx, cy + maxR);
    polarCtx.moveTo(cx - maxR, cy);
    polarCtx.lineTo(cx + maxR, cy);
    polarCtx.stroke();

    // Cardinal Points
    polarCtx.fillStyle = 'var(--neon-cyan)';
    polarCtx.font = 'bold 12px "JetBrains Mono", monospace';
    polarCtx.textAlign = 'center';
    polarCtx.fillText('N', cx, cy - maxR - 8);
    polarCtx.fillText('S', cx, cy + maxR + 16);
    polarCtx.fillText('E', cx + maxR + 14, cy + 4);
    polarCtx.fillText('W', cx - maxR - 14, cy + 4);

    // Sweeping Radar Beam
    radarAngle += 0.02;
    if (radarAngle > Math.PI * 2) radarAngle = 0;

    polarCtx.save();
    polarCtx.translate(cx, cy);
    polarCtx.rotate(radarAngle);
    const beamGrad = polarCtx.createRadialGradient(0, 0, 0, 0, 0, maxR);
    beamGrad.addColorStop(0, 'rgba(0, 255, 157, 0.3)');
    beamGrad.addColorStop(1, 'rgba(0, 255, 157, 0.0)');
    polarCtx.fillStyle = beamGrad;
    polarCtx.beginPath();
    polarCtx.moveTo(0, 0);
    polarCtx.arc(0, 0, maxR, -0.2, 0);
    polarCtx.closePath();
    polarCtx.fill();
    polarCtx.restore();

    // Draw active satellite trajectory pass
    const sat = satelliteData[currentSatKey];
    if (sat && sat.trajectory) {
      const traj = sat.trajectory;

      // Convert Az/El to Polar Canvas (r = maxR * (1 - el/90))
      function toCanvasCoords(azDeg, elDeg) {
        const rad = (azDeg - 90) * (Math.PI / 180);
        const r = maxR * (1 - (elDeg / 90));
        return {
          x: cx + r * Math.cos(rad),
          y: cy + r * Math.sin(rad)
        };
      }

      const pAos = toCanvasCoords(traj.startAz, 0);
      const pPeak = toCanvasCoords(traj.peakAz, traj.peakEl);
      const pLos = toCanvasCoords(traj.endAz, 0);

      // Trajectory curve
      polarCtx.strokeStyle = 'var(--neon-green)';
      polarCtx.lineWidth = 2.5;
      polarCtx.setLineDash([4, 4]);
      polarCtx.beginPath();
      polarCtx.moveTo(pAos.x, pAos.y);
      polarCtx.quadraticCurveTo(pPeak.x, pPeak.y, pLos.x, pLos.y);
      polarCtx.stroke();
      polarCtx.setLineDash([]);

      // Peak elevation marker
      polarCtx.fillStyle = 'var(--neon-amber)';
      polarCtx.beginPath();
      polarCtx.arc(pPeak.x, pPeak.y, 4, 0, Math.PI * 2);
      polarCtx.fill();
      polarCtx.font = '10px "JetBrains Mono", monospace';
      polarCtx.fillText('TCA ' + traj.peakEl + '°', pPeak.x + 8, pPeak.y - 6);

      // Current satellite icon animated along trajectory
      const t = (Math.sin(Date.now() / 2400) + 1) / 2; // 0 to 1 back and forth
      // Quadratic bezier point
      const curX = (1 - t) * (1 - t) * pAos.x + 2 * (1 - t) * t * pPeak.x + t * t * pLos.x;
      const curY = (1 - t) * (1 - t) * pAos.y + 2 * (1 - t) * t * pPeak.y + t * t * pLos.y;

      // Pulsing beacon aura
      const auraR = 8 + 4 * Math.sin(Date.now() / 200);
      polarCtx.fillStyle = 'rgba(0, 243, 255, 0.35)';
      polarCtx.beginPath();
      polarCtx.arc(curX, curY, auraR, 0, Math.PI * 2);
      polarCtx.fill();

      // Satellite center dot
      polarCtx.fillStyle = '#ffffff';
      polarCtx.beginPath();
      polarCtx.arc(curX, curY, 4, 0, Math.PI * 2);
      polarCtx.fill();

      polarCtx.fillStyle = 'var(--neon-cyan)';
      polarCtx.font = 'bold 11px "JetBrains Mono", monospace';
      polarCtx.fillText('🛰️ ' + sat.name.split(' ')[0], curX + 12, curY + 4);
    }

    if (isRadarVisible) {
      animId = requestAnimationFrame(renderPolarRadar);
    }
  }

  let wfInterval = null;
  function startWaterfall() {
    if (wfInterval || !wfCtx || !waterfallCanvas) return;
    wfInterval = setInterval(drawWaterfall, 60);
  }

  function stopWaterfall() {
    if (wfInterval) {
      clearInterval(wfInterval);
      wfInterval = null;
    }
  }

  function startRadar() {
    if (isRadarVisible) return;
    isRadarVisible = true;
    animId = requestAnimationFrame(renderPolarRadar);
    startWaterfall();
  }

  function stopRadar() {
    isRadarVisible = false;
    if (animId) cancelAnimationFrame(animId);
    stopWaterfall();
  }

  // IntersectionObserver for canvas
  if ('IntersectionObserver' in window && polarCanvas) {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startRadar();
      else stopRadar();
    }, { threshold: 0.1 });
    obs.observe(section);
  } else {
    startRadar();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRadar();
    else if (section.getBoundingClientRect().top < window.innerHeight && section.getBoundingClientRect().bottom > 0) startRadar();
  });

  // 5. WATERFALL SPECTRUM SIMULATOR
  const waterfallCanvas = document.getElementById('qsatWaterfallCanvas');
  const wfCtx = waterfallCanvas ? waterfallCanvas.getContext('2d') : null;
  let wfLines = [];

  function drawWaterfall() {
    if (!wfCtx || !waterfallCanvas || !isRadarVisible) return;
    const w = waterfallCanvas.width;
    const h = waterfallCanvas.height;

    // Shift previous lines down
    const imageData = wfCtx.getImageData(0, 0, w, h - 2);
    wfCtx.putImageData(imageData, 0, 2);

    // Generate new top line with Doppler carrier trace
    const sat = satelliteData[currentSatKey];
    const sliderVal = passSlider ? parseInt(passSlider.value, 10) : -40;
    const centerOffset = (sliderVal / 100) * (w * 0.35); // carrier drift
    const carrierX = (w / 2) - centerOffset;

    for (let x = 0; x < w; x++) {
      const dist = Math.abs(x - carrierX);
      let intensity = Math.random() * 25; // noise floor
      if (dist < 4) {
        intensity += 210 - (dist * 35); // main carrier spike
      } else if (dist < 18) {
        intensity += 80 - (dist * 4); // sideband tones
      }
      intensity = Math.min(255, Math.max(0, intensity));

      // Color mapping: dark blue -> cyan -> green -> yellow
      let r = 0, g = 0, b = 0;
      if (intensity > 180) {
        r = 255; g = 255; b = (intensity - 180) * 3;
      } else if (intensity > 100) {
        r = (intensity - 100) * 2; g = 230; b = 180;
      } else {
        r = 10; g = intensity * 1.5; b = intensity * 2.5;
      }

      wfCtx.fillStyle = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
      wfCtx.fillRect(x, 0, 1, 2);
    }
  }

  // 6. GHOSTWAVE AIOC PTT TRIGGER TEST
  const btnPtt = document.getElementById('btn-trigger-aioc-ptt');
  const pttLed = document.getElementById('qsat-ptt-led');
  const pttLabel = document.getElementById('qsat-ptt-label');
  const serialConsole = document.getElementById('qsat-serial-console');

  if (btnPtt) {
    btnPtt.addEventListener('click', () => {
      btnPtt.disabled = true;
      btnPtt.textContent = 'TRANSMITTING [PTT ACTIVE]...';
      if (pttLed) pttLed.classList.add('ptt-active');
      if (pttLabel) {
        pttLabel.textContent = 'PTT STATUS: ACTIVE (TX 5W RF BURST)';
        pttLabel.style.color = 'var(--neon-red)';
      }

      if (serialConsole) {
        const timeStr = new Date().toISOString().substring(11, 19);
        const l1 = document.createElement('div');
        l1.innerHTML = '<span>&gt; ' + timeStr + '</span> [HID_OUT] GPIO3 -> HIGH (PTT ASSERTED)';
        const l2 = document.createElement('div');
        l2.innerHTML = '<span>&gt; ' + timeStr + '</span> [AUDIO_TX] 48kHz Codec2 1200bps payload modulated';
        serialConsole.appendChild(l1);
        serialConsole.appendChild(l2);
        serialConsole.scrollTop = serialConsole.scrollHeight;
      }

      setTimeout(() => {
        if (pttLed) pttLed.classList.remove('ptt-active');
        if (pttLabel) {
          pttLabel.textContent = 'PTT STATUS: TAIL SQUELCH (HANG 300ms)';
          pttLabel.style.color = 'var(--neon-amber)';
        }

        setTimeout(() => {
          btnPtt.disabled = false;
          btnPtt.textContent = 'TRANSMIT TEST BURST (PTT ENGAGE)';
          if (pttLabel) {
            pttLabel.textContent = 'PTT STATUS: STANDBY (RX MODE)';
            pttLabel.style.color = '#fff';
          }
          if (serialConsole) {
            const timeStr = new Date().toISOString().substring(11, 19);
            const l3 = document.createElement('div');
            l3.innerHTML = '<span>&gt; ' + timeStr + '</span> [HID_OUT] GPIO3 -> LOW (PTT RELEASED OK)';
            serialConsole.appendChild(l3);
            serialConsole.scrollTop = serialConsole.scrollHeight;
          }
        }, 350);
      }, 1200);
    });
  }

  // Initial populate
  updateSatelliteView('noaa19');
})();

/* ==========================================================================
   Q-GEO TACTICAL VECTOR GIS & MAP PACK MANAGER CONTROLLER
   ========================================================================== */
(function() {
  'use strict';

  const section = document.getElementById('q-geo');
  if (!section) return;

  const canvas = document.getElementById('qgeoMapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Tab switching
  const tabBtns = section.querySelectorAll('.qgeo-tab-btn');
  const panes = section.querySelectorAll('.qgeo-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
      });
      panes.forEach(p => p.classList.remove('active'));

      const targetPane = section.querySelector(`.qgeo-tab-pane[data-pane="${tabTarget}"], #qgeo-pane-${tabTarget}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      if (tabTarget === 'map') {
        resizeCanvas();
      }
    });
  });

  // Tactical Map State
  let panX = 0;
  let panY = 0;
  let zoom = 1.0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let currentTheme = 'hud'; // 'hud', 'topo', 'nvg'
  let isFuzzy = true; // Coordinate privacy quantization
  let animId = null;
  let dashOffset = 0;
  let isVisible = false;

  // Layer Visibility
  const layerHazards = document.getElementById('layer-hazards');
  const layerNodes = document.getElementById('layer-nodes');
  const layerPoi = document.getElementById('layer-poi');
  const layerEgress = document.getElementById('layer-egress');
  const layerGeofence = document.getElementById('layer-geofence');

  // Privacy Toggle
  const btnTogglePrivacy = document.getElementById('btn-toggle-privacy');
  const privacyBadge = document.getElementById('qgeo-privacy-badge');

  function updatePrivacyDisplay() {
    if (!privacyBadge || !btnTogglePrivacy) return;
    if (isFuzzy) {
      privacyBadge.textContent = 'PRIVACY: ~111m FUZZY QUANTIZED';
      privacyBadge.style.borderColor = 'var(--cyan)';
      privacyBadge.style.color = 'var(--cyan)';
      privacyBadge.style.background = 'rgba(0, 243, 255, 0.08)';
      btnTogglePrivacy.textContent = 'SWITCH TO EXACT GPS (LOCAL ONLY)';
      btnTogglePrivacy.classList.remove('txt-amber');
      btnTogglePrivacy.classList.add('txt-cyan');
    } else {
      privacyBadge.textContent = 'WARNING: EXACT RAW GPS (TRIANGULATABLE)';
      privacyBadge.style.borderColor = 'var(--neon-amber)';
      privacyBadge.style.color = 'var(--neon-amber)';
      privacyBadge.style.background = 'rgba(255, 170, 0, 0.12)';
      btnTogglePrivacy.textContent = 'SWITCH TO FUZZY MASK (~111m)';
      btnTogglePrivacy.classList.remove('txt-cyan');
      btnTogglePrivacy.classList.add('txt-amber');
    }
  }

  if (btnTogglePrivacy) {
    btnTogglePrivacy.addEventListener('click', () => {
      isFuzzy = !isFuzzy;
      updatePrivacyDisplay();
      if (selectedPin) updatePopover(selectedPin);
    });
  }

  // Format Coordinates helper
  function formatCoords(lat, lon) {
    if (isFuzzy) {
      // 3 decimals ≈ 111m fuzzy mask
      return `${lat.toFixed(3)}° N, ${lon.toFixed(3)}° E (±111m)`;
    } else {
      return `${lat.toFixed(6)}° N, ${lon.toFixed(6)}° E`;
    }
  }

  // Tactical Map Pins Data (based on QGeoModels.kt)
  const mapPins = [
    {
      id: 'pin-uxo-17',
      code: '0x17',
      type: 'LANDMINE / UXO',
      title: 'Unexploded PFM-1 Cluster Hazard',
      desc: 'Submunitions dispersed along treeline. Egress road contaminated.',
      lat: 50.4562,
      lon: 30.5284,
      relX: 130,
      relY: -70,
      radius: 120,
      severity: 'CRITICAL',
      confirms: 5,
      ttl: '29d 14h',
      reporter: 'node:7f14 (LoRa SF8)',
      category: 'hazard'
    },
    {
      id: 'pin-chk-09',
      code: '0x09',
      type: 'ARMED CHECKPOINT',
      title: 'Hostile Mobile Patrol & Checkpoint',
      desc: '2 armored technicals searching civilian vehicles at bridge crossing.',
      lat: 50.4421,
      lon: 30.5090,
      relX: -160,
      relY: 85,
      radius: 60,
      severity: 'HIGH',
      confirms: 4,
      ttl: '01h 45m',
      reporter: 'node:3c22 (LoRa SF7)',
      category: 'hazard'
    },
    {
      id: 'pin-jam-19',
      code: '0x19',
      type: 'SIGNAL JAMMING',
      title: 'Broadband GNSS & L1/L2 Jammer',
      desc: 'GPS lock degraded within 2 km. Fallback to dead-reckoning & MBTiles.',
      lat: 50.4610,
      lon: 30.5010,
      relX: -90,
      relY: -140,
      radius: 150,
      severity: 'MEDIUM',
      confirms: 8,
      ttl: '05h 20m',
      reporter: 'node:8e9a (Q-SDR)',
      category: 'hazard'
    },
    {
      id: 'pin-drn-14',
      code: '0x14',
      type: 'DRONE RECON',
      title: 'Loitering Surveillance UAV',
      desc: 'Low-altitude quadcopter recon circling northern ridge.',
      lat: 50.4680,
      lon: 30.5350,
      relX: 40,
      relY: -180,
      radius: 80,
      severity: 'HIGH',
      confirms: 2,
      ttl: '28m',
      reporter: 'node:1d03 (Optical)',
      category: 'hazard'
    },
    {
      id: 'pin-med-0d',
      code: '0x0D',
      type: 'FIELD HOSPITAL',
      title: 'Underground Emergency Care Unit',
      desc: 'Triage facility operating on generator power. Surgical supplies stocked.',
      lat: 50.4380,
      lon: 30.5420,
      relX: 180,
      relY: 130,
      radius: 30,
      severity: 'INFO',
      confirms: 12,
      ttl: '72h 00m',
      reporter: 'node:med01 (Mesh)',
      category: 'poi'
    },
    {
      id: 'pin-h2o-0f',
      code: '0x0F',
      type: 'POTABLE WATER',
      title: 'Tested Deep Artesian Well',
      desc: 'Clean gravity-fed spring. Zero chemical or biological contamination.',
      lat: 50.4435,
      lon: 30.5360,
      relX: 85,
      relY: 145,
      radius: 20,
      severity: 'INFO',
      confirms: 9,
      ttl: '48h 00m',
      reporter: 'node:civ94 (LoRa SF8)',
      category: 'poi'
    },
    {
      id: 'pin-shl-10',
      code: '0x10',
      type: 'HARDENED SHELTER',
      title: 'Reinforced Metro Deep Bunker',
      desc: 'Civil protection shelter with air filtration and emergency radio relay.',
      lat: 50.4490,
      lon: 30.4950,
      relX: -210,
      relY: -65,
      radius: 40,
      severity: 'INFO',
      confirms: 16,
      ttl: '120h',
      reporter: 'node:base01 (Fixed)',
      category: 'poi'
    },
    {
      id: 'pin-node-op',
      code: 'NODE',
      type: 'OPERATOR BEACON',
      title: 'Friendly Operator // Unit 7-Alpha',
      desc: 'Current tactical radio anchor. T-Deck transceiver connected.',
      lat: 50.4501,
      lon: 30.5234,
      relX: 0,
      relY: 0,
      radius: 15,
      severity: 'FRIENDLY',
      confirms: 1,
      ttl: 'ACTIVE',
      reporter: 'LOCAL HOST',
      category: 'node'
    }
  ];

  let selectedPin = null;

  // Popover DOM Elements
  const popover = document.getElementById('qgeo-pin-popover');
  const popClose = document.getElementById('pop-close');
  const popType = document.getElementById('pop-type');
  const popTitle = document.getElementById('pop-title');
  const popCoords = document.getElementById('pop-coords');
  const popConfirms = document.getElementById('pop-confirms');
  const popTtl = document.getElementById('pop-ttl');
  const btnPopConfirm = document.getElementById('btn-pop-confirm');
  const btnPopClear = document.getElementById('btn-pop-clear');

  function updatePopover(pin) {
    if (!popover || !pin) return;
    if (popType) popType.textContent = `${pin.code} - ${pin.type}`;
    if (popTitle) popTitle.textContent = pin.title;
    if (popCoords) popCoords.textContent = formatCoords(pin.lat, pin.lon);
    if (popConfirms) popConfirms.textContent = `${pin.confirms} Node ACKs`;
    if (popTtl) popTtl.textContent = pin.ttl;

    // Position popover
    const rect = canvas.getBoundingClientRect();
    const mapCenterW = rect.width / 2;
    const mapCenterH = rect.height / 2;
    const screenX = mapCenterW + (pin.relX * zoom) + panX;
    const screenY = mapCenterH + (pin.relY * zoom) + panY;

    popover.style.left = `${Math.min(Math.max(screenX + 15, 10), rect.width - 290)}px`;
    popover.style.top = `${Math.min(Math.max(screenY - 80, 10), rect.height - 240)}px`;
    popover.classList.remove('hidden');
  }

  function hidePopover() {
    if (popover) popover.classList.add('hidden');
    selectedPin = null;
  }

  if (popClose) {
    popClose.addEventListener('click', hidePopover);
  }

  if (btnPopConfirm) {
    btnPopConfirm.addEventListener('click', () => {
      if (!selectedPin) return;
      selectedPin.confirms += 1;
      updatePopover(selectedPin);
      logRadioEvent(`[ACK_TX] Verified hazard ${selectedPin.code}: Quorum updated to ${selectedPin.confirms} ACKs`);
      btnPopConfirm.textContent = 'VERIFIED (+1 ACK)';
      setTimeout(() => {
        if (btnPopConfirm) btnPopConfirm.textContent = 'CONFIRM (+1)';
      }, 1000);
    });
  }

  if (btnPopClear) {
    btnPopClear.addEventListener('click', () => {
      if (!selectedPin) return;
      logRadioEvent(`[CLEAR_TX] Operation 0x04 (CLEAR) dispatched for ${selectedPin.code} [${selectedPin.title}]`);
      const idx = mapPins.indexOf(selectedPin);
      if (idx > -1 && selectedPin.category !== 'node') {
        mapPins.splice(idx, 1);
      }
      hidePopover();
    });
  }

  // Theme Buttons
  const themeBtns = section.querySelectorAll('.qgeo-theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.getAttribute('data-theme') || 'hud';
    });
  });

  // Zoom Controls
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const zoomDisplay = document.getElementById('zoom-level');

  function updateZoom(newZoom) {
    zoom = Math.min(Math.max(newZoom, 0.7), 3.0);
    if (zoomDisplay) zoomDisplay.textContent = `${zoom.toFixed(1)}x`;
    if (selectedPin) updatePopover(selectedPin);
  }

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => updateZoom(zoom + 0.25));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => updateZoom(zoom - 0.25));

  // Canvas Mouse & Touch Dragging (attach listeners only when dragging)
  function onDragMove(e) {
    if (isDragging) {
      panX = e.clientX - dragStartX;
      panY = e.clientY - dragStartY;
      if (selectedPin) updatePopover(selectedPin);
    }
  }

  function onDragEnd() {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'crosshair';
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
    }
  }

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - dragStartY;
    canvas.style.cursor = 'grabbing';
    window.addEventListener('mousemove', onDragMove, { passive: true });
    window.addEventListener('mouseup', onDragEnd);
  });

  // Mouse Wheel Zooming
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    updateZoom(zoom + delta);
  }, { passive: false });

  // Cursor Coordinate Readout & Pin Hover Detection (Throttled with rAF)
  const cursorCoords = document.getElementById('qgeo-cursor-coords');
  let qgeoHoverPending = false;
  canvas.addEventListener('mousemove', e => {
    if (qgeoHoverPending) return;
    qgeoHoverPending = true;
    requestAnimationFrame(() => {
      qgeoHoverPending = false;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const centerW = rect.width / 2;
      const centerH = rect.height / 2;
      const relX = (mouseX - centerW - panX) / zoom;
      const relY = (mouseY - centerH - panY) / zoom;

      // Convert pixel offset to pseudo lat/lon around Kyiv Sector (50.4501, 30.5234)
      const lat = 50.4501 - (relY * 0.0001);
      const lon = 30.5234 + (relX * 0.00015);

      if (cursorCoords) {
        cursorCoords.textContent = formatCoords(lat, lon);
      }

      // Check hover on pins
      let hoverPin = null;
      mapPins.forEach(pin => {
        const pinScreenX = centerW + (pin.relX * zoom) + panX;
        const pinScreenY = centerH + (pin.relY * zoom) + panY;
        const dist = Math.hypot(mouseX - pinScreenX, mouseY - pinScreenY);
        if (dist < 18) {
          hoverPin = pin;
        }
      });

      if (hoverPin) {
        canvas.style.cursor = 'pointer';
      } else if (!isDragging) {
        canvas.style.cursor = 'crosshair';
      }
    });
  }, { passive: true });

  // Pin Click Detection
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const centerW = rect.width / 2;
    const centerH = rect.height / 2;

    let clicked = null;
    mapPins.forEach(pin => {
      // Check visibility filter
      if (pin.category === 'hazard' && layerHazards && !layerHazards.checked) return;
      if (pin.category === 'node' && layerNodes && !layerNodes.checked) return;
      if (pin.category === 'poi' && layerPoi && !layerPoi.checked) return;

      const pinScreenX = centerW + (pin.relX * zoom) + panX;
      const pinScreenY = centerH + (pin.relY * zoom) + panY;
      const dist = Math.hypot(clickX - pinScreenX, clickY - pinScreenY);
      if (dist < 20) {
        clicked = pin;
      }
    });

    if (clicked) {
      selectedPin = clicked;
      updatePopover(clicked);
    } else {
      hidePopover();
    }
  });

  // Resize Canvas with high DPI support
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Palettes for themes
  const themes = {
    hud: {
      bg: '#070b10',
      grid: 'rgba(0, 255, 157, 0.08)',
      contours: 'rgba(0, 243, 255, 0.12)',
      river: '#00253d',
      riverBorder: 'rgba(0, 243, 255, 0.25)',
      roads: 'rgba(0, 243, 255, 0.35)',
      trails: 'rgba(0, 255, 157, 0.25)',
      geofenceFill: 'rgba(255, 34, 68, 0.08)',
      geofenceStroke: '#ff2244',
      egress: '#00f3ff',
      friendly: '#00ff9d',
      danger: '#ff2244',
      warning: '#ffaa00',
      poi: '#00f3ff',
      text: '#ffffff'
    },
    topo: {
      bg: '#141811',
      grid: 'rgba(180, 160, 100, 0.08)',
      contours: 'rgba(175, 145, 80, 0.25)',
      river: '#182b24',
      riverBorder: 'rgba(90, 140, 110, 0.3)',
      roads: 'rgba(210, 190, 140, 0.45)',
      trails: 'rgba(160, 190, 100, 0.3)',
      geofenceFill: 'rgba(200, 50, 50, 0.12)',
      geofenceStroke: '#d94040',
      egress: '#55e088',
      friendly: '#60d060',
      danger: '#e04040',
      warning: '#d09030',
      poi: '#e0c060',
      text: '#e6ded0'
    },
    nvg: {
      bg: '#020d04',
      grid: 'rgba(57, 255, 20, 0.1)',
      contours: 'rgba(57, 255, 20, 0.2)',
      river: '#041f08',
      riverBorder: 'rgba(57, 255, 20, 0.3)',
      roads: 'rgba(57, 255, 20, 0.45)',
      trails: 'rgba(57, 255, 20, 0.3)',
      geofenceFill: 'rgba(57, 255, 20, 0.15)',
      geofenceStroke: '#39ff14',
      egress: '#39ff14',
      friendly: '#39ff14',
      danger: '#39ff14',
      warning: '#39ff14',
      poi: '#39ff14',
      text: '#39ff14'
    }
  };

  // Safe Egress Polyline Waypoints (relative coordinates)
  const egressPath = [
    { x: 0, y: 0 },         // Friendly Node
    { x: 20, y: 50 },
    { x: 60, y: 95 },
    { x: 120, y: 110 },
    { x: 180, y: 130 },     // Past Field Hospital
    { x: 250, y: 160 },
    { x: 310, y: 190 }      // Extracted to Zone Green
  ];

  // Draw Main Map
  function renderMap() {
    if (!isVisible) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;

    const pal = themes[currentTheme] || themes.hud;
    const centerX = w / 2;
    const centerY = h / 2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Background fill
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    // 2. Military Grid Lines (MGRS styling)
    const gridSize = 60 * zoom;
    const startX = ((centerX + panX) % gridSize) - gridSize;
    const startY = ((centerY + panY) % gridSize) - gridSize;

    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x < w; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = startY; y < h; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Map content transform (pan & zoom)
    ctx.translate(centerX + panX, centerY + panY);
    ctx.scale(zoom, zoom);

    // 3. Topographic Elevation Contours (DEM Hillshade simulation)
    ctx.strokeStyle = pal.contours;
    ctx.lineWidth = 1.2;
    for (let r = 80; r <= 320; r += 45) {
      ctx.beginPath();
      ctx.ellipse(-40, -20, r * 1.3, r * 0.85, Math.PI / 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Natural Obstacle / River (Dnipro corridor)
    ctx.fillStyle = pal.river;
    ctx.strokeStyle = pal.riverBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-320, -260);
    ctx.bezierCurveTo(-180, -180, -140, -40, -150, 40);
    ctx.bezierCurveTo(-160, 120, -110, 200, -70, 300);
    ctx.lineTo(-120, 300);
    ctx.bezierCurveTo(-160, 200, -210, 120, -200, 40);
    ctx.bezierCurveTo(-190, -40, -230, -180, -360, -260);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // River label
    ctx.fillStyle = pal.contours;
    ctx.font = '10px "Space Grotesk", monospace';
    ctx.fillText('DNIPRO CHANNEL // WATERWAY', -230, -100);

    // 5. Road Network (Vector MBTiles simulation)
    ctx.strokeStyle = pal.roads;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    // Primary Highway (East-West)
    ctx.moveTo(-320, 70);
    ctx.lineTo(320, 70);
    // Arterial South-North
    ctx.moveTo(20, -260);
    ctx.lineTo(20, 260);
    // Bypass arc
    ctx.moveTo(-100, -180);
    ctx.lineTo(160, -80);
    ctx.lineTo(260, 140);
    ctx.stroke();

    // Secondary Trails
    ctx.strokeStyle = pal.trails;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(-160, 85);
    ctx.lineTo(-40, 220);
    ctx.lineTo(180, 130);
    ctx.moveTo(0, 0);
    ctx.lineTo(85, 145);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Tactical Geofence Danger Ring (500m UXO/Hostile Zone)
    if (!layerGeofence || layerGeofence.checked) {
      const pulse = (Math.sin(Date.now() / 350) + 1) / 2; // 0..1
      const gX = 130;
      const gY = -70;
      const gRadius = 110 + (pulse * 8);

      ctx.fillStyle = pal.geofenceFill;
      ctx.beginPath();
      ctx.arc(gX, gY, gRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = pal.geofenceStroke;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Geofence perimeter label
      ctx.fillStyle = pal.danger;
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ 500m HOSTILE CLUSTER GEOFENCE', gX, gY - gRadius - 8);
    }

    // 7. BRouter Safe Egress Route (Cyan dashed polyline)
    if (!layerEgress || layerEgress.checked) {
      dashOffset -= 0.6;
      ctx.save();
      ctx.strokeStyle = pal.egress;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = dashOffset;
      ctx.shadowColor = pal.egress;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      egressPath.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();

      // Route waypoints
      ctx.fillStyle = pal.egress;
      egressPath.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Egress destination banner
      const dest = egressPath[egressPath.length - 1];
      ctx.fillStyle = pal.friendly;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('➔ SECURE EXTRACTION WAYPOINT', dest.x + 10, dest.y + 4);
    }

    // 8. Tactical Map Pins (Hazards, Nodes, POI)
    mapPins.forEach(pin => {
      // Filter layer checks
      if (pin.category === 'hazard' && layerHazards && !layerHazards.checked) return;
      if (pin.category === 'node' && layerNodes && !layerNodes.checked) return;
      if (pin.category === 'poi' && layerPoi && !layerPoi.checked) return;

      const px = pin.relX;
      const py = pin.relY;

      ctx.save();
      if (pin.category === 'node') {
        // Friendly Operator Anchor
        const pulse = (Math.sin(Date.now() / 250) + 1) / 2;
        ctx.fillStyle = `rgba(0, 255, 157, ${0.15 + pulse * 0.25})`;
        ctx.beginPath();
        ctx.arc(px, py, 18 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();

        // Tactical Operator Chevron
        ctx.fillStyle = pal.friendly;
        ctx.beginPath();
        ctx.moveTo(px, py - 12);
        ctx.lineTo(px + 10, py + 8);
        ctx.lineTo(px, py + 3);
        ctx.lineTo(px - 10, py + 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = pal.friendly;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OPERATOR [NODE-7A]', px, py + 22);

      } else if (pin.category === 'hazard') {
        // Danger Diamond / Hexagon
        const isSelected = selectedPin === pin;
        ctx.fillStyle = pin.severity === 'CRITICAL' ? pal.danger : pal.warning;
        ctx.strokeStyle = isSelected ? '#ffffff' : pal.bg;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(px, py - 14);
        ctx.lineTo(px + 12, py);
        ctx.lineTo(px, py + 14);
        ctx.lineTo(px - 12, py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pin Code inside diamond
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pin.code.substring(2), px, py);

        // Label above
        ctx.fillStyle = isSelected ? '#ffffff' : (pin.severity === 'CRITICAL' ? pal.danger : pal.warning);
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(`${pin.code} ${pin.type.split(' ')[0]}`, px, py - 18);

      } else if (pin.category === 'poi') {
        // Circular Civilian POI Pin
        const isSelected = selectedPin === pin;
        ctx.fillStyle = pal.poi;
        ctx.strokeStyle = isSelected ? '#ffffff' : pal.bg;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pin.code.substring(2), px, py);

        ctx.fillStyle = isSelected ? '#ffffff' : pal.poi;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(pin.type.split(' ')[0], px, py - 16);
      }
      ctx.restore();
    });

    // NVG scanline simulation if NVG theme
    if (currentTheme === 'nvg') {
      ctx.fillStyle = 'rgba(57, 255, 20, 0.04)';
      const scanY = (Date.now() / 15) % (h * 2) - h;
      ctx.fillRect(-w, scanY, w * 2, 40);
    }

    ctx.restore();

    // Loop
    animId = requestAnimationFrame(renderMap);
  }

  // Layer Checkbox Changes
  [layerHazards, layerNodes, layerPoi, layerEgress, layerGeofence].forEach(box => {
    if (box) {
      box.addEventListener('change', () => {
        if (selectedPin) {
          if (selectedPin.category === 'hazard' && !layerHazards.checked) hidePopover();
          if (selectedPin.category === 'node' && !layerNodes.checked) hidePopover();
          if (selectedPin.category === 'poi' && !layerPoi.checked) hidePopover();
        }
      });
    }
  });

  // Offline Map Pack Catalog Logic
  const catalogCards = section.querySelectorAll('.catalog-card');
  const btnInstallPack = document.getElementById('btn-install-pack');
  const installProgress = document.getElementById('qgeo-install-progress');
  const progressFill = document.getElementById('qgeo-progress-fill');

  catalogCards.forEach(card => {
    card.addEventListener('click', () => {
      catalogCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  if (btnInstallPack) {
    btnInstallPack.addEventListener('click', () => {
      const activeCard = section.querySelector('.catalog-card.active');
      const packName = activeCard ? activeCard.querySelector('strong').textContent : 'Regional Pack';

      btnInstallPack.disabled = true;
      if (installProgress) installProgress.classList.remove('hidden');
      if (progressFill) progressFill.style.width = '0%';

      let progress = 0;
      const steps = [
        { pct: 20, label: 'TOR TUNNEL CONNECTED (127.0.0.1:9050)...' },
        { pct: 50, label: 'STREAMING VECTOR MBTILES BLOCKS...' },
        { pct: 80, label: 'VALIDATING ED25519 METADATA SIGNATURE...' },
        { pct: 95, label: 'VERIFYING SHA-256 INTEGRITY DIGEST...' },
        { pct: 100, label: '✓ BUNDLE MOUNTED TO OFFLINE STORAGE' }
      ];

      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length) {
          const step = steps[stepIdx];
          if (progressFill) progressFill.style.width = `${step.pct}%`;
          btnInstallPack.textContent = step.label;
          stepIdx++;
        } else {
          clearInterval(interval);
          btnInstallPack.textContent = `✓ ${packName.toUpperCase()} ACTIVE`;
          btnInstallPack.style.borderColor = 'var(--neon-green)';
          btnInstallPack.style.color = 'var(--neon-green)';
          setTimeout(() => {
            if (installProgress) installProgress.classList.add('hidden');
            btnInstallPack.disabled = false;
            btnInstallPack.textContent = 'INSTALL BUNDLE TO SECURE STORAGE';
            btnInstallPack.style.borderColor = '';
            btnInstallPack.style.color = '';
          }, 3500);
        }
      }, 500);
    });
  }

  // Compact Radio Protocol Generator Logic
  const genHazardSelect = document.getElementById('gen-hazard-select');
  const genOpSelect = document.getElementById('gen-op-select');
  const genCoordsInput = document.getElementById('gen-coords');
  const btnBroadcastEvent = document.getElementById('btn-broadcast-event');
  const radioConsole = document.getElementById('qgeo-radio-console');
  const htags = section.querySelectorAll('.htag');

  htags.forEach(tag => {
    tag.addEventListener('click', () => {
      const hexCode = tag.getAttribute('data-hex');
      if (genHazardSelect) {
        for (let i = 0; i < genHazardSelect.options.length; i++) {
          if (genHazardSelect.options[i].value === hexCode) {
            genHazardSelect.selectedIndex = i;
            break;
          }
        }
      }
    });
  });

  function logRadioEvent(text, colorClass) {
    if (!radioConsole) return;
    const timeStr = new Date().toISOString().substring(11, 19);
    const line = document.createElement('div');
    line.className = `stream-line ${colorClass || ''}`;
    line.innerHTML = `<span>&gt; [${timeStr}]</span> ${text}`;
    radioConsole.appendChild(line);
    radioConsole.scrollTop = radioConsole.scrollHeight;
  }

  if (btnBroadcastEvent) {
    btnBroadcastEvent.addEventListener('click', () => {
      const hazardHex = genHazardSelect ? genHazardSelect.value : '0x17';
      const opHex = genOpSelect ? genOpSelect.value : '0x01';
      const coordsVal = genCoordsInput ? genCoordsInput.value.trim() : '50.1142, 8.6890';
      const parts = coordsVal.split(',').map(s => parseFloat(s.trim()));
      const lat = isNaN(parts[0]) ? 50.4501 : parts[0];
      const lon = isNaN(parts[1]) ? 30.5234 : parts[1];

      // Build synthetic binary frame
      const magic = '51 47';
      const ver = '01';
      const op = opHex.replace('0x', '');
      const hazard = hazardHex.replace('0x', '');
      const latHex = Math.floor(Math.abs(lat) * 10000).toString(16).padStart(4, '0').toUpperCase();
      const lonHex = Math.floor(Math.abs(lon) * 10000).toString(16).padStart(4, '0').toUpperCase();
      const ttl = '05A0'; // 1440 min
      const sig = '9A 4F B1 2C 88 EF 02 11';

      const fullPacket = `${magic} ${ver} ${op} ${hazard} ${latHex} ${lonHex} ${ttl} ${sig}`;

      logRadioEvent(`RAW_HEX: ${fullPacket}`, 'txt-cyan');
      logRadioEvent(`[LORA_TX] Dispatched: 32 bytes | SF7/125kHz | Ch: 868.1 MHz | Airtime: 56ms`, 'txt-green');
      logRadioEvent(`Relay ACK quorum received from 4/4 mesh nodes. Event pinned.`, '');

      // Add dynamic pin to map
      const hazardName = genHazardSelect ? genHazardSelect.options[genHazardSelect.selectedIndex].text.split(' - ')[1] : 'Dynamic Hazard';
      const newPin = {
        id: `pin-dyn-${Date.now()}`,
        code: hazardHex,
        type: hazardName.split(' (')[0],
        title: hazardName,
        desc: 'Reported in the field via compact radio delta packet.',
        lat: lat,
        lon: lon,
        relX: (Math.random() - 0.5) * 280,
        relY: (Math.random() - 0.5) * 200,
        radius: 50,
        severity: hazardHex === '0x17' ? 'CRITICAL' : 'HIGH',
        confirms: 1,
        ttl: '24h 00m',
        reporter: 'LOCAL_OPERATOR (LoRa TX)',
        category: 'hazard'
      };

      mapPins.push(newPin);
      selectedPin = newPin;
      updatePopover(newPin);

      // Button feedback
      btnBroadcastEvent.textContent = 'PACKET BROADCASTED OK';
      setTimeout(() => {
        if (btnBroadcastEvent) btnBroadcastEvent.textContent = 'TRANSMIT COMPACT RADIO DELTA';
      }, 1500);
    });
  }

  // Intersection Observer for 0% CPU off-screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        resizeCanvas();
        if (!animId) {
          animId = requestAnimationFrame(renderMap);
        }
      } else {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    });
  }, { threshold: 0.05 });

  observer.observe(section);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isVisible = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    } else {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        isVisible = true;
        resizeCanvas();
        if (!animId) {
          animId = requestAnimationFrame(renderMap);
        }
      }
    }
  });

  // Initial setup
  updatePrivacyDisplay();
})();

/* ==========================================================================
   Q-FEED DECENTRALIZED MESH SOCIAL & P2P SIGNED RECEIPTS CONTROLLER
   ========================================================================== */
(function() {
  'use strict';

  const section = document.getElementById('q-feed');
  if (!section) return;

  // Workspace Tabs
  const tabBtns = section.querySelectorAll('.qfeed-tab-btn');
  const panes = section.querySelectorAll('.qfeed-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const targetPane = section.querySelector(`.qfeed-tab-pane[data-pane="${tabTarget}"]`);
      if (targetPane) targetPane.classList.add('active');

      if (tabTarget === 'receipts') {
        drawQrCode();
      }
    });
  });

  // Filter Bar
  const fChips = section.querySelectorAll('.f-chip');
  const postList = document.getElementById('qfeed-post-list');

  fChips.forEach(chip => {
    chip.addEventListener('click', () => {
      fChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.getAttribute('data-filter');

      if (!postList) return;
      const cards = postList.querySelectorAll('.qfeed-card');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Zap Button Interaction
  section.addEventListener('click', e => {
    const zapBtn = e.target.closest('.zap-btn');
    if (zapBtn) {
      const strong = zapBtn.querySelector('strong');
      if (strong) {
        let current = parseInt(strong.textContent.replace(/,/g, ''), 10) || 0;
        current += 21;
        strong.textContent = current.toLocaleString();
        zapBtn.style.color = '#ffaa00';
        zapBtn.style.borderColor = '#ffaa00';
        zapBtn.style.transform = 'scale(1.08)';
        setTimeout(() => {
          zapBtn.style.transform = '';
        }, 200);
      }
    }
  });

  // Post Composer Logic
  const composerText = document.getElementById('composer-text');
  const composerAudience = document.getElementById('composer-audience');
  const composerSats = document.getElementById('composer-sats');
  const composerRepost = document.getElementById('composer-repost');
  const composerSigPreview = document.getElementById('composer-sig-preview');
  const btnPublishPost = document.getElementById('btn-publish-post');
  const composerOutbox = document.getElementById('composer-outbox');

  function updateSigPreview() {
    if (!composerSigPreview) return;
    const txt = (composerText && composerText.value.trim()) || 'STANDBY_PAYLOAD';
    const aud = composerAudience ? composerAudience.value : 'nostr';
    const sats = composerSats ? composerSats.value : '0';
    const ts = Math.floor(Date.now() / 1000);

    // Simple deterministic pseudo-hash for demonstration
    let hash = 0;
    for (let i = 0; i < txt.length; i++) {
      hash = ((hash << 5) - hash) + txt.charCodeAt(i);
      hash |= 0;
    }
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');

    composerSigPreview.textContent = `QP1NG-FEED-POST-v1|hash:${hexHash}|aud:${aud}|sats:${sats}|ts:${ts}|author:node:7f14...92b0`;
  }

  if (composerText) composerText.addEventListener('input', updateSigPreview);
  if (composerAudience) composerAudience.addEventListener('change', updateSigPreview);
  if (composerSats) composerSats.addEventListener('input', updateSigPreview);
  if (composerRepost) composerRepost.addEventListener('change', updateSigPreview);

  if (btnPublishPost) {
    btnPublishPost.addEventListener('click', () => {
      const text = composerText && composerText.value.trim() ? composerText.value.trim() : 'Operational field SITREP: Radio nodes 4 and 7 synched via LoRa 868 MHz. Squelch tail nominal.';
      const audienceVal = composerAudience ? composerAudience.value : 'nostr';
      const satsVal = composerSats ? parseInt(composerSats.value, 10) || 0 : 0;

      let audienceLabel = 'PUBLIC NOSTR';
      let audienceClass = 'badge-nostr';
      let category = 'nostr';

      if (audienceVal === 'contacts') {
        audienceLabel = 'CONTACTS (RATCHET CIPHER)';
        audienceClass = 'badge-mesh';
        category = 'mesh';
      } else if (audienceVal === 'selected') {
        audienceLabel = 'SELECTED CONTACTS (PAIRWISE)';
        audienceClass = 'badge-mesh';
        category = 'mesh';
      } else if (audienceVal === 'local') {
        audienceLabel = 'LOCAL AIR-GAP (1-HOP)';
        audienceClass = 'badge-mesh';
        category = 'mesh';
      }

      if (satsVal > 0) {
        category = 'events';
      }

      // Prepend post to feed
      if (postList) {
        const newCard = document.createElement('article');
        newCard.className = `qfeed-card ${satsVal > 0 ? 'event-card' : ''}`;
        newCard.setAttribute('data-category', category);

        newCard.innerHTML = `
          <div class="card-header">
            <div class="avatar-ring avatar-mesh"></div>
            <div class="author-meta mono">
              <div class="author-line">
                <strong class="author-alias">Operator [LOCAL HOST]</strong>
                <span class="author-onion muted">node:7f14...92b0.onion</span>
              </div>
              <div class="post-flags">
                <span class="badge-audience ${audienceClass}">${audienceLabel}</span>
                <span class="badge-sig txt-green">✓ ED25519 VERIFIED</span>
                ${satsVal > 0 ? `<span class="badge-sig txt-amber">⚡ ${satsVal} SATS TICKET</span>` : ''}
              </div>
            </div>
            <span class="post-time mono muted">just now</span>
          </div>
          <div class="card-body">
            <p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          <div class="card-footer mono">
            <button class="action-btn zap-btn">⚡ <strong>0</strong> Sats</button>
            <button class="action-btn comment-btn">💬 <strong>0</strong> Replies</button>
            <button class="action-btn repost-btn">🔄 Repost</button>
            <button class="action-btn share-btn">📡 Air-Gap QR</button>
          </div>
        `;

        postList.prepend(newCard);
      }

      // Log to outbox
      if (composerOutbox) {
        const timeStr = new Date().toISOString().substring(11, 19);
        const l1 = document.createElement('div');
        l1.className = 'stream-line txt-green';
        l1.innerHTML = `&gt; [${timeStr}] [ED25519_SIGN] Post canonicalized. Sig: 9a4f...3b12`;
        const l2 = document.createElement('div');
        l2.className = 'stream-line txt-cyan';
        l2.innerHTML = `&gt; [${timeStr}] [TOR_SOCKS5] Dispatched to 3/3 relays + LoRa mesh queue. ACK received.`;
        composerOutbox.prepend(l2);
        composerOutbox.prepend(l1);
      }

      // Reset
      if (composerText) composerText.value = '';
      btnPublishPost.textContent = '✓ BROADCAST DISPATCHED';
      btnPublishPost.style.borderColor = '#00ff9d';
      btnPublishPost.style.color = '#00ff9d';
      setTimeout(() => {
        if (btnPublishPost) {
          btnPublishPost.textContent = 'SIGN WITH ED25519 & BROADCAST';
          btnPublishPost.style.borderColor = '';
          btnPublishPost.style.color = '';
        }
      }, 2000);
      updateSigPreview();
    });
  }

  // Event Payment Button
  const btnPayEvent = document.getElementById('btn-pay-event');
  const ticketBuyStatus = document.getElementById('ticket-buy-status');

  if (btnPayEvent) {
    btnPayEvent.addEventListener('click', () => {
      btnPayEvent.disabled = true;
      btnPayEvent.textContent = 'AUTHORIZING VAULT PAYMENT...';

      setTimeout(() => {
        btnPayEvent.textContent = '✓ 15,000 SATS PAID (TXID: 8F4C...)';
        btnPayEvent.classList.remove('txt-amber');
        btnPayEvent.classList.add('txt-green');
        if (ticketBuyStatus) {
          ticketBuyStatus.textContent = '✓ TICKET ISSUED TO LOCAL VAULT';
          ticketBuyStatus.style.color = 'var(--neon-green)';
        }

        // Switch to receipts tab
        const tabReceipts = section.querySelector('.qfeed-tab-btn[data-tab="receipts"]');
        if (tabReceipts) {
          setTimeout(() => {
            tabReceipts.click();
          }, 800);
        }
      }, 1000);
    });
  }

  // Draw Synthetic Air-Gap QR Ticket on Canvas
  const qrCanvas = document.getElementById('qfeedReceiptQrCanvas');
  function drawQrCode() {
    if (!qrCanvas) return;
    const ctx = qrCanvas.getContext('2d');
    const w = qrCanvas.width;
    const h = qrCanvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const gridSize = 25;
    const cellSize = w / gridSize;

    // Helper for QR Finder patterns
    function drawFinder(rX, rY) {
      ctx.fillStyle = '#05070f';
      ctx.fillRect(rX * cellSize, rY * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((rX + 1) * cellSize, (rY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#05070f';
      ctx.fillRect((rX + 2) * cellSize, (rY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }

    // Three QR Position Finders
    drawFinder(1, 1);
    drawFinder(gridSize - 8, 1);
    drawFinder(1, gridSize - 8);

    // Timing patterns
    ctx.fillStyle = '#05070f';
    for (let i = 8; i < gridSize - 8; i += 2) {
      ctx.fillRect(i * cellSize, 4 * cellSize, cellSize, cellSize);
      ctx.fillRect(4 * cellSize, i * cellSize, cellSize, cellSize);
    }

    // Pseudorandom deterministic QR data cells
    let seed = 42;
    function rand() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    ctx.fillStyle = '#05070f';
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Skip finders
        if (x < 9 && y < 9) continue;
        if (x > gridSize - 9 && y < 9) continue;
        if (x < 9 && y > gridSize - 9) continue;
        if (x === 4 || y === 4) continue;

        if (rand() > 0.5) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Subtle Cyan center beacon
    ctx.fillStyle = '#00f3ff';
    ctx.fillRect(11 * cellSize, 11 * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.fillStyle = '#05070f';
    ctx.fillRect(12 * cellSize, 12 * cellSize, cellSize, cellSize);
  }

  // Copy Receipt Button
  const btnCopyReceipt = document.getElementById('btn-copy-receipt');
  if (btnCopyReceipt) {
    btnCopyReceipt.addEventListener('click', () => {
      const canonicalProof = 'QP1NG_EVENT_RECEIPT|v2|8f4c39e2|15000|bitcoin-mainnet|tx:8f4c39e2a7b189cc521d09e4f00192a83e7102b4d89a7102|out:0|sig:3b7a8109d84e...91c82';
      navigator.clipboard.writeText(canonicalProof).catch(() => {});
      btnCopyReceipt.textContent = '✓ COPIED TO CLIPBOARD';
      setTimeout(() => {
        if (btnCopyReceipt) btnCopyReceipt.textContent = 'COPY CANONICAL PROOF';
      }, 2000);
    });
  }

  // Simulate Optical Scanner Verification
  const btnSimulateScan = document.getElementById('btn-simulate-scan');
  const auditStep1 = document.getElementById('audit-step-1');
  const auditStep2 = document.getElementById('audit-step-2');
  const auditStep3 = document.getElementById('audit-step-3');
  const auditStep4 = document.getElementById('audit-step-4');
  const scannerResultBanner = document.getElementById('scanner-result-banner');

  if (btnSimulateScan) {
    btnSimulateScan.addEventListener('click', () => {
      btnSimulateScan.disabled = true;
      btnSimulateScan.textContent = 'DECODING OPTICAL ENVELOPE...';
      if (scannerResultBanner) scannerResultBanner.classList.add('hidden');

      const steps = [
        { el: auditStep1, text: '1. Envelope format: QP1NG_EVENT_RECEIPT|v2 (MATCH)' },
        { el: auditStep2, text: '2. Cryptographic Ed25519 signature validity (VERIFIED)' },
        { el: auditStep3, text: '3. Bitcoin UTXO output index & 15,000 SATS (MATCH)' },
        { el: auditStep4, text: '4. Replay check: SQLite store query (UNIQUE: ADMITTED)' }
      ];

      // Reset steps
      steps.forEach(s => {
        if (s.el) {
          s.el.classList.remove('completed');
          s.el.querySelector('.audit-indicator').textContent = '○';
        }
      });

      let idx = 0;
      const stepTimer = setInterval(() => {
        if (idx < steps.length) {
          const s = steps[idx];
          if (s.el) {
            s.el.classList.add('completed');
            s.el.querySelector('.audit-indicator').textContent = '●';
            s.el.querySelector('.audit-label').textContent = s.text;
          }
          idx++;
        } else {
          clearInterval(stepTimer);
          if (scannerResultBanner) scannerResultBanner.classList.remove('hidden');
          btnSimulateScan.disabled = false;
          btnSimulateScan.textContent = 'SCAN ATTENDEE QR RECEIPT';
        }
      }, 350);
    });
  }

  // Ping Relays Button
  const btnPingRelays = document.getElementById('btn-ping-relays');
  const relayList = document.getElementById('relay-list');

  if (btnPingRelays) {
    btnPingRelays.addEventListener('click', () => {
      btnPingRelays.disabled = true;
      btnPingRelays.textContent = 'PINGING...';

      setTimeout(() => {
        if (relayList) {
          const pings = [
            Math.floor(35 + Math.random() * 20),
            Math.floor(45 + Math.random() * 25),
            Math.floor(50 + Math.random() * 25)
          ];
          const items = relayList.querySelectorAll('.relay-item');
          if (items[0]) items[0].querySelector('.r-status').textContent = `ONLINE (${pings[0]}ms)`;
          if (items[1]) items[1].querySelector('.r-status').textContent = `ONLINE (${pings[1]}ms)`;
          if (items[2]) items[2].querySelector('.r-status').textContent = `ONLINE (${pings[2]}ms)`;
          if (items[3]) items[3].querySelector('.r-status').textContent = `TOR ONION (3 HOPS - 180ms)`;
        }
        btnPingRelays.disabled = false;
        btnPingRelays.textContent = 'PING RELAYS';
      }, 500);
    });
  }

  // Initial draw
  drawQrCode();
  updateSigPreview();
})();

/* ==========================================================================
   Q-SCENARIOS & ACTIONFORGE TACTICAL WORKFLOW CONTROLLER
   ========================================================================== */
(function() {
  'use strict';

  const section = document.getElementById('action-forge');
  if (!section) return;

  // Workspace Tabs
  const tabBtns = section.querySelectorAll('.af-tab-btn');
  const panes = section.querySelectorAll('.af-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const targetPane = section.querySelector(`.af-tab-pane[data-pane="${tabTarget}"]`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Recipe Selector & Node Graph Updates
  const recipeSelect = document.getElementById('af-recipe-select');
  const node1Title = document.getElementById('node-1-title');
  const node1Sub = document.getElementById('node-1-sub');
  const node2Title = document.getElementById('node-2-title');
  const node2Sub = document.getElementById('node-2-sub');
  const node3Title = document.getElementById('node-3-title');
  const node3Sub = document.getElementById('node-3-sub');
  const node4Title = document.getElementById('node-4-title');
  const node4Sub = document.getElementById('node-4-sub');

  const recipes = {
    emcon: {
      n1Title: 'BLE_PEER_APPEARED',
      n1Sub: 'Proximity: Unknown MAC < -65 dBm',
      n2Title: 'GHOST_MODE_INACTIVE',
      n2Sub: 'Check transmitter state',
      n3Title: 'ACTIVATE_GHOST_MODE',
      n3Sub: 'RF Kill switch: 0.00 dBm EMCON',
      n4Title: 'SEND_LORA_MESSAGE',
      n4Sub: 'Ch 868.1 MHz: 32B Coded Alert'
    },
    deadman: {
      n1Title: 'DEAD_MAN_TIMER',
      n1Sub: '24h Inactivity Horizon Elapsed',
      n2Title: 'CANARY_PIN_MISSING',
      n2Sub: 'Zero operator auth response',
      n3Title: 'STAGE_PANIC_WIPE',
      n3Sub: 'Shred Bitcoin Vault descriptors',
      n4Title: 'BROADCAST_DISTRESS',
      n4Sub: 'LoRa Distress Beacon: SQUAD_ALERT'
    },
    sigint: {
      n1Title: 'RF_BURST_DETECTED',
      n1Sub: 'Q-SDR 1090 MHz ADS-B Intercept',
      n2Title: 'KNOWN_SQUAWK_CHECK',
      n2Sub: '7700 Emergency Code Match',
      n3Title: 'RUN_YARA_TRIAGE',
      n3Sub: 'PRoot Linux: starter.yara_scan',
      n4Title: 'LOG_TO_VAULT',
      n4Sub: 'Append encrypted incident card'
    },
    tor: {
      n1Title: 'TOR_CIRCUIT_LOST',
      n1Sub: 'Daemon socket unreachable',
      n2Title: 'OUTBOX_BUFFER_PENDING',
      n2Sub: 'Check unsent messages',
      n3Title: 'REQUEST_NEW_IDENTITY',
      n3Sub: 'Control Port 9051: SIGNAL NEWNYM',
      n4Title: 'FALLBACK_TO_LORA',
      n4Sub: 'Route via local 868 MHz relay'
    }
  };

  function applyRecipe(key) {
    const r = recipes[key] || recipes.emcon;
    if (node1Title) node1Title.textContent = r.n1Title;
    if (node1Sub) node1Sub.textContent = r.n1Sub;
    if (node2Title) node2Title.textContent = r.n2Title;
    if (node2Sub) node2Sub.textContent = r.n2Sub;
    if (node3Title) node3Title.textContent = r.n3Title;
    if (node3Sub) node3Sub.textContent = r.n3Sub;
    if (node4Title) node4Title.textContent = r.n4Title;
    if (node4Sub) node4Sub.textContent = r.n4Sub;
  }

  if (recipeSelect) {
    recipeSelect.addEventListener('change', () => {
      applyRecipe(recipeSelect.value);
    });
  }

  // Flow Simulation Logic
  const btnSimulateFlow = document.getElementById('btn-simulate-flow');
  const flowStatus = document.getElementById('flow-execution-status');
  const terminalStream = document.getElementById('af-terminal-stream');
  const node1 = document.getElementById('node-1');
  const node2 = document.getElementById('node-2');
  const node3 = document.getElementById('node-3');
  const node4 = document.getElementById('node-4');
  const wire12 = document.getElementById('wire-1-2');
  const wire23 = document.getElementById('wire-2-3');
  const wire24 = document.getElementById('wire-2-4');

  function logTerminal(text, colorClass) {
    if (!terminalStream) return;
    const timeStr = new Date().toISOString().substring(11, 19);
    const line = document.createElement('div');
    line.className = `stream-line ${colorClass || ''}`;
    line.innerHTML = `<span>&gt; [${timeStr}]</span> ${text}`;
    terminalStream.prepend(line);
  }

  if (btnSimulateFlow) {
    btnSimulateFlow.addEventListener('click', () => {
      btnSimulateFlow.disabled = true;
      btnSimulateFlow.textContent = 'EXECUTING FLOW GRAPH...';
      if (flowStatus) flowStatus.textContent = 'EXECUTING: DISPATCHING EVENT NODE 01';

      // Clear existing active styles
      [node1, node2, node3, node4].forEach(n => n && n.classList.remove('active-node'));
      [wire12, wire23, wire24].forEach(w => w && w.classList.remove('active-wire'));

      const activeKey = recipeSelect ? recipeSelect.value : 'emcon';
      const r = recipes[activeKey] || recipes.emcon;

      // Stage 1: Trigger Node
      if (node1) node1.classList.add('active-node');
      logTerminal(`[FLOW_TRIGGER] Event fired: ${r.n1Title} (${r.n1Sub})`, 'txt-amber');

      setTimeout(() => {
        // Stage 2: Condition Gate
        if (wire12) wire12.classList.add('active-wire');
        if (node2) node2.classList.add('active-node');
        if (flowStatus) flowStatus.textContent = 'EVALUATING: CONDITION NODE 02';
        logTerminal(`[COND_EVAL] Condition check: ${r.n2Title} -> TRUE`, 'txt-purple');

        setTimeout(() => {
          // Stage 3: Actions
          if (wire23) wire23.classList.add('active-wire');
          if (wire24) wire24.classList.add('active-wire');
          if (node3) node3.classList.add('active-node');
          if (node4) node4.classList.add('active-node');
          if (flowStatus) flowStatus.textContent = 'EXECUTING: ACTIONS 03 & 04 (PARALLEL)';

          logTerminal(`[ACTION_EXEC] Action 01: ${r.n3Title} [PRoot sandbox bound: OK]`, 'txt-cyan');
          logTerminal(`[DISPATCH_EXEC] Action 02: ${r.n4Title} [Broadcast ACK: OK]`, 'txt-green');

          setTimeout(() => {
            if (flowStatus) flowStatus.textContent = 'EXECUTION COMPLETED // 0 ERRORS (38ms)';
            btnSimulateFlow.disabled = false;
            btnSimulateFlow.textContent = 'EXECUTE GRAPH FLOW';
            logTerminal(`[FLOW_COMPLETE] Sequence finished in 38ms. State persisted to vault.`, '');
          }, 600);
        }, 600);
      }, 500);
    });
  }

  // Dead-Man Switch Logic
  const deadmanTimerDisplay = document.getElementById('deadman-timer');
  const btnCanaryCheckin = document.getElementById('btn-canary-checkin');
  const btnTestTripwire = document.getElementById('btn-test-tripwire');
  const tripwireAlertBox = document.getElementById('tripwire-alert-box');

  let countdownSeconds = 86399; // ~23:59:59
  let timerInterval = null;
  let isDeadmanActive = true;

  function updateTimerString() {
    if (!deadmanTimerDisplay) return;
    const hours = Math.floor(countdownSeconds / 3600);
    const mins = Math.floor((countdownSeconds % 3600) / 60);
    const secs = countdownSeconds % 60;
    deadmanTimerDisplay.textContent = 
      `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function startCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isDeadmanActive) return;
      if (countdownSeconds > 0) {
        countdownSeconds--;
        updateTimerString();
      } else {
        clearInterval(timerInterval);
        triggerTripwire();
      }
    }, 1000);
  }

  function triggerTripwire() {
    if (deadmanTimerDisplay) {
      deadmanTimerDisplay.textContent = '00:00:00';
      deadmanTimerDisplay.style.color = '#ff2244';
    }
    if (tripwireAlertBox) tripwireAlertBox.classList.remove('hidden');
    logTerminal(`[DEAD_MAN_TRIPWIRE] Canary expired! Stage 1-4 panic sequence engaged.`, 'txt-red');
  }

  if (btnCanaryCheckin) {
    btnCanaryCheckin.addEventListener('click', () => {
      countdownSeconds = 86400; // Reset 24 hours
      updateTimerString();
      if (deadmanTimerDisplay) deadmanTimerDisplay.style.color = '#ff2244';
      if (tripwireAlertBox) tripwireAlertBox.classList.add('hidden');

      btnCanaryCheckin.textContent = '✓ CHECK-IN LOGGED (RESET 24H)';
      btnCanaryCheckin.style.borderColor = '#00ff9d';
      btnCanaryCheckin.style.color = '#00ff9d';
      logTerminal(`[CANARY_CHECKIN] Operator presence verified. Watchdog deadline extended +24h.`, 'txt-green');

      setTimeout(() => {
        if (btnCanaryCheckin) {
          btnCanaryCheckin.textContent = 'CANARY CHECK-IN (RESET 24H)';
          btnCanaryCheckin.style.borderColor = '';
          btnCanaryCheckin.style.color = '';
        }
      }, 2000);
    });
  }

  if (btnTestTripwire) {
    btnTestTripwire.addEventListener('click', () => {
      countdownSeconds = 0;
      triggerTripwire();
    });
  }

  startCountdown();

  // Field Kit Tool Catalog Inspector Logic
  const toolCards = section.querySelectorAll('.tool-card');
  const manifestIdBadge = document.getElementById('manifest-id-badge');
  const manifestJsonCode = document.getElementById('manifest-json-code');
  const btnAuditTool = document.getElementById('btn-audit-tool');
  const auditSignatureStatus = document.getElementById('audit-signature-status');

  const toolManifests = {
    yara: {
      id: 'starter.yara_scan',
      json: `{\n  "schema": "qp1ng.tool.v1",\n  "id": "starter.yara_scan",\n  "name": "Local YARA Signature Matcher",\n  "version": "1.4.2",\n  "category": "security_lab",\n  "execution_mode": "SANDBOX_PROOT",\n  "network_policy": {\n    "outbound": "BLOCKED",\n    "loopback": "DENIED"\n  },\n  "runtime_limits": {\n    "timeout_seconds": 10,\n    "max_input_bytes": 32768,\n    "max_output_bytes": 65536\n  },\n  "signature": {\n    "format": "minisign",\n    "verified": true,\n    "signer": "zonkeynet-fieldkit-key-01"\n  }\n}`
    },
    defanger: {
      id: 'starter.url_defanger',
      json: `{\n  "schema": "qp1ng.tool.v1",\n  "id": "starter.url_defanger",\n  "name": "URL Defanger & Neutralizer",\n  "version": "1.0.1",\n  "category": "opsec_utility",\n  "execution_mode": "FLOW_PYTHON",\n  "network_policy": {\n    "outbound": "OFFLINE_ONLY",\n    "loopback": "DENIED"\n  },\n  "runtime_limits": {\n    "timeout_seconds": 2,\n    "max_input_bytes": 8192,\n    "max_output_bytes": 8192\n  },\n  "signature": {\n    "format": "minisign",\n    "verified": true,\n    "signer": "zonkeynet-fieldkit-key-01"\n  }\n}`
    },
    pdf: {
      id: 'starter.pdf_structure',
      json: `{\n  "schema": "qp1ng.tool.v1",\n  "id": "starter.pdf_structure",\n  "name": "PDF Object Stream Inspector",\n  "version": "1.1.0",\n  "category": "forensics",\n  "execution_mode": "SANDBOX_PROOT",\n  "network_policy": {\n    "outbound": "BLOCKED",\n    "loopback": "DENIED"\n  },\n  "runtime_limits": {\n    "timeout_seconds": 8,\n    "max_input_bytes": 10485760,\n    "max_output_bytes": 32768\n  },\n  "signature": {\n    "format": "minisign",\n    "verified": true,\n    "signer": "zonkeynet-fieldkit-key-01"\n  }\n}`
    },
    sqlite: {
      id: 'starter.sqlite_audit',
      json: `{\n  "schema": "qp1ng.tool.v1",\n  "id": "starter.sqlite_audit",\n  "name": "SQLite Read-Only Pragma Audit",\n  "version": "1.2.0",\n  "category": "database_health",\n  "execution_mode": "FLOW_LITE",\n  "network_policy": {\n    "outbound": "OFFLINE_ONLY",\n    "loopback": "DENIED"\n  },\n  "runtime_limits": {\n    "timeout_seconds": 5,\n    "max_input_bytes": 65536,\n    "max_output_bytes": 16384\n  },\n  "signature": {\n    "format": "minisign",\n    "verified": true,\n    "signer": "zonkeynet-fieldkit-key-01"\n  }\n}`
    }
  };

  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      toolCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const toolKey = card.getAttribute('data-tool');
      const m = toolManifests[toolKey] || toolManifests.yara;

      if (manifestIdBadge) manifestIdBadge.textContent = m.id;
      if (manifestJsonCode) manifestJsonCode.textContent = m.json;
    });
  });

  if (btnAuditTool) {
    btnAuditTool.addEventListener('click', () => {
      btnAuditTool.disabled = true;
      btnAuditTool.textContent = 'AUDITING MINISIGN...';

      setTimeout(() => {
        btnAuditTool.disabled = false;
        btnAuditTool.textContent = 'VERIFY MINISIGN SIGNATURE';
        if (auditSignatureStatus) {
          auditSignatureStatus.textContent = '✓ SIGNATURE VERIFIED (KEY #01 ED25519)';
          auditSignatureStatus.style.color = 'var(--neon-green)';
        }
      }, 400);
    });
  }

  // Intersection Observer for performance / CPU
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isDeadmanActive = entry.isIntersecting;
    });
  }, { threshold: 0.05 });

  observer.observe(section);

  document.addEventListener('visibilitychange', () => {
    isDeadmanActive = !document.hidden;
  });
})();

/* ==========================================================================
   CINEMATIC INTRO SCREEN & MULTILINGUAL ACTIVISM CONTROLLER
   ========================================================================== */
(function() {
  'use strict';

  const introScreen = document.getElementById('intro-screen');
  if (!introScreen) return;

  const INTRO_KEY = 'qp1ng_intro_seen_v1';
  const videoWrap = document.getElementById('introVideoWrap');
  const bgVideoDesktop = document.getElementById('introBgVideoDesktop');
  const bgVideoMobile = document.getElementById('introBgVideoMobile');
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  const activeVideo = isMobile ? bgVideoMobile : bgVideoDesktop;
  const inactiveVideo = isMobile ? bgVideoDesktop : bgVideoMobile;
  const initialDot = document.getElementById('intro-initial-dot');
  const typewriterText = document.getElementById('intro-typewriter-text');
  const cursor = document.getElementById('intro-cursor');
  const actionContainer = document.getElementById('intro-action-container');
  const btnEnter = document.getElementById('btn-enter-site');
  const btnSkip = document.getElementById('btn-skip-intro');
  const btnReplay = document.getElementById('btn-replay-intro');
  const ambientStage = document.getElementById('introMultilingualStage');

  function hasSeenIntro() {
    try {
      return sessionStorage.getItem(INTRO_KEY) === 'true';
    } catch(e) {
      return false;
    }
  }

  function setSeenIntro() {
    try {
      sessionStorage.setItem(INTRO_KEY, 'true');
    } catch(e) {}
  }

  let isVideoSeeking = false;
  let isVideoPlayRequested = false;

  // Active background video controller (Desktop & Smartphone)
  function playActiveVideo() {
    if (isDismissed || !activeVideo || !videoWrap) return;
    isVideoPlayRequested = true;

    const revealVideo = () => {
      if (!isDismissed && videoWrap && activeVideo && !activeVideo.seeking) {
        videoWrap.classList.add('video-visible');
      }
    };

    const doPlay = () => {
      if (isDismissed || !isVideoPlayRequested) return;

      activeVideo.addEventListener('playing', revealVideo, { once: true });
      activeVideo.addEventListener('timeupdate', revealVideo, { once: true });

      const promise = activeVideo.play();
      if (promise !== undefined) {
        promise.then(() => {
          if (!isDismissed && activeVideo.currentTime > 0.05 && !activeVideo.seeking) {
            revealVideo();
          }
        }).catch(() => {
          // Autoplay fallback: start playback on first user interaction if blocked
          const onInteract = () => {
            if (!isDismissed && activeVideo.paused) {
              activeVideo.play().then(revealVideo).catch(() => {});
            }
            window.removeEventListener('pointerdown', onInteract);
            window.removeEventListener('keydown', onInteract);
            window.removeEventListener('touchstart', onInteract);
          };
          window.addEventListener('pointerdown', onInteract, { once: true });
          window.addEventListener('keydown', onInteract, { once: true });
          window.addEventListener('touchstart', onInteract, { once: true });
        });
      }
    };

    // If currently seeking, wait for seeked event before calling play
    if (activeVideo.seeking || isVideoSeeking) {
      activeVideo.addEventListener('seeked', () => {
        isVideoSeeking = false;
        doPlay();
      }, { once: true });
      return;
    }

    // If video position is not at start (e.g. replayed after previous view), pause and seek to 0 cleanly
    if (activeVideo.currentTime > 0.05) {
      isVideoSeeking = true;
      activeVideo.pause();

      let seekHandled = false;
      const onSeeked = () => {
        if (seekHandled) return;
        seekHandled = true;
        isVideoSeeking = false;
        activeVideo.removeEventListener('seeked', onSeeked);
        doPlay();
      };

      activeVideo.addEventListener('seeked', onSeeked, { once: true });
      setTimeout(onSeeked, 300); // Safety fallback
      try {
        activeVideo.currentTime = 0;
      } catch(e) {
        onSeeked();
      }
      return;
    }

    // Already at 0 and not seeking: play immediately
    doPlay();
  }

  // Main English Manifesto sequence
  const manifestoSegments = [
    { text: "When you can no longer trust governments and institutions.\n\n", type: "normal" },
    { text: "When tech monopolies monetize your existence and sell your privacy to the highest bidder.\n\n", type: "danger" },
    { text: "When dissent is monitored, intercepted, and weaponized.\n\n", type: "normal" },
    { text: "Do not submit to mass surveillance.\n", type: "highlight" },
    { text: "Cryptography is self-defense. Freedom is a protocol.\n\n", type: "highlight" },
    { text: "QUANTUM P1NG // WELCOME TO THE RESISTANCE.", type: "brand" }
  ];

  // Multilingual Ambient Quotes Pool
  const multilingualPool = [
    {
      lang: "ZH",
      meta: "BEIJING // TOR EXIT MESH",
      text: "当你无法再相信巨头与体制，隐私即防线。自由是一个协议。"
    },
    {
      lang: "JA",
      meta: "TOKYO // AIR-GAP RELAY",
      text: "監視に屈するな。暗号化は自己防衛である。デジタル主権を取り戻せ。"
    },
    {
      lang: "UK",
      meta: "KYIV // SECURE NODE",
      text: "Коли довіри до влади більше немає. Свобода — це протокол."
    },
    {
      lang: "MY",
      meta: "YANGON // MESH CELL 04",
      text: "အာဏာရှင်စနစ်နှင့် စောင့်ကြည့်ခြင်းကို တွန်းလှန်ပါ။ လွတ်လပ်မှုသည် ပရိုတိုကောဖြစ်သည်"
    },
    {
      lang: "FA",
      rtl: true,
      meta: "TEHRAN // GHOST RELAY",
      text: "وقتی دیگر اعتمادی به نظارت نیست. رمزنگاری تنها سپر دفاعی شماست."
    },
    {
      lang: "AR",
      rtl: true,
      meta: "CAIRO // ENCRYPTED PROXY",
      text: "التشفير هو دفاع عن النفس. الحرية بروتوكول غير قابل للمساومة."
    },
    {
      lang: "IT",
      meta: "ROMA // P2P AIRGAP",
      text: "Non piegarti alla sorveglianza di massa. La sovranità è un diritto inalienabile."
    },
    {
      lang: "DE",
      meta: "BERLIN // NOSTR HOP",
      text: "Kryptographie ist Selbstverteidigung. Freiheit ist ein Protokoll."
    },
    {
      lang: "ES",
      meta: "MADRID // LO-RA DIRECT",
      text: "La privacidad no se negocia. La libertad es un protocolo criptográfico."
    },
    {
      lang: "FR",
      meta: "PARIS // FARADAY ONION",
      text: "Ne cédez pas à la surveillance d'État. La souveraineté numérique est inviolable."
    },
    {
      lang: "RU",
      meta: "MOSCOW // SATELLITE TUNNEL",
      text: "Шифрование — это самооборона. Никаких компромиссов с приватностью."
    }
  ];

  // Screen slot positions avoiding center typewriter
  const screenSlots = [
    { top: "14%", left: "6%" },
    { top: "16%", right: "8%" },
    { bottom: "22%", left: "7%" },
    { bottom: "18%", right: "7%" },
    { top: "48%", left: "5%" },
    { top: "44%", right: "6%" },
    { top: "9%", left: "32%" },
    { bottom: "14%", right: "28%" }
  ];

  let occupiedSlots = new Set();
  let ambientInterval = null;
  let poolIdx = 0;

  function spawnAmbientEcho() {
    if (isDismissed || !ambientStage) return;

    const availableSlots = screenSlots
      .map((slot, idx) => ({ slot, idx }))
      .filter(item => !occupiedSlots.has(item.idx));

    if (availableSlots.length === 0) return;

    const chosen = availableSlots[Math.floor(Math.random() * availableSlots.length)];
    occupiedSlots.add(chosen.idx);

    const item = multilingualPool[poolIdx % multilingualPool.length];
    poolIdx++;

    const echoEl = document.createElement('div');
    echoEl.className = 'intro-ambient-echo';
    if (item.rtl) echoEl.classList.add('echo-rtl');

    Object.assign(echoEl.style, chosen.slot);

    echoEl.innerHTML = `
      <div class="echo-head">
        <span class="echo-tag">${item.lang}</span>
        <span class="echo-meta">${item.meta}</span>
      </div>
      <div class="echo-text">${item.text}</div>
    `;

    ambientStage.appendChild(echoEl);

    requestAnimationFrame(() => {
      echoEl.classList.add('echo-visible');
    });

    setTimeout(() => {
      if (echoEl.parentNode) {
        echoEl.classList.remove('echo-visible');
        echoEl.classList.add('echo-fading');
      }
    }, 3800);

    setTimeout(() => {
      if (echoEl.parentNode) {
        echoEl.remove();
      }
      occupiedSlots.delete(chosen.idx);
    }, 5000);
  }

  function startAmbientOrchestration() {
    spawnAmbientEcho();
    ambientInterval = setInterval(() => {
      if (!isDismissed) {
        spawnAmbientEcho();
      }
    }, 1800);
  }

  let isDismissed = false;
  let isAnimationComplete = false;
  let autoDismissTimer = null;
  let typingTimeout = null;
  let failsafeTimer = null;
  let cursorBlinkTimer = null;

  // Active Watchdog: only triggers if no characters or progress occur for 25 seconds
  function resetWatchdog() {
    clearTimeout(failsafeTimer);
    failsafeTimer = setTimeout(() => {
      console.warn('[INTRO] Watchdog deadline reached: auto-dismissing.');
      dismissIntro(true);
    }, 25000);
  }

  function dismissIntro(force = false) {
    if (isDismissed) return;
    // CRITICAL: Unless forced (Skip button, ESC key, or Watchdog), do NOT dismiss until animation is 100% complete!
    if (!force && !isAnimationComplete) return;

    isDismissed = true;
    isVideoPlayRequested = false;
    clearTimeout(autoDismissTimer);
    clearTimeout(typingTimeout);
    clearTimeout(failsafeTimer);
    clearTimeout(cursorBlinkTimer);
    if (cursor) cursor.classList.remove('cursor-solid');
    if (ambientInterval) clearInterval(ambientInterval);

    setSeenIntro();
    document.documentElement.classList.remove('intro-active');
    introScreen.classList.add('intro-dismissed');
    document.body.style.overflow = '';

    setTimeout(() => {
      introScreen.style.display = 'none';
      if (videoWrap) videoWrap.classList.remove('video-visible');
      if (activeVideo) {
        activeVideo.pause();
        try { activeVideo.currentTime = 0; } catch(e){}
      }
      if (bgVideoDesktop) {
        bgVideoDesktop.pause();
        try { bgVideoDesktop.currentTime = 0; } catch(e){}
      }
      if (bgVideoMobile) {
        bgVideoMobile.pause();
        try { bgVideoMobile.currentTime = 0; } catch(e){}
      }
      window.dispatchEvent(new CustomEvent('qp1ng:intro-dismissed'));
    }, 900);
  }

  // Tap or click anywhere on the intro screen: ONLY dismisses after the full animation is complete
  introScreen.addEventListener('click', (e) => {
    // If the click was directly on buttons (Skip, Enter), their own listeners will handle it
    if (e.target.closest('#btn-skip-intro') || e.target.closest('#btn-enter-site')) return;
    if (isAnimationComplete) {
      dismissIntro(true);
    }
  });

  // Keybindings
  window.addEventListener('keydown', (e) => {
    if (isDismissed) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      dismissIntro(true); // ESC always skips
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (isAnimationComplete) {
        e.preventDefault();
        dismissIntro(true); // Enter/Space enters when complete
      }
    }
  });

  if (btnSkip) {
    btnSkip.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      dismissIntro(true);
    });
  }

  if (btnEnter) {
    btnEnter.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      dismissIntro(true);
    });
  }

  // Typewriter Engine
  let segmentIdx = 0;
  let charIdx = 0;
  let currentSpan = null;

  function typeNextCharacter() {
    if (isDismissed) return;

    // Reset watchdog on each character typed so it never terminates an active typewriter
    resetWatchdog();

    if (segmentIdx >= manifestoSegments.length) {
      // 100% COMPLETE! All segments typed and verified
      isAnimationComplete = true;
      clearTimeout(failsafeTimer);
      clearTimeout(cursorBlinkTimer);

      if (cursor) {
        cursor.classList.remove('cursor-solid');
        cursor.style.display = 'inline-block';
        if (typewriterText && cursor.parentNode !== typewriterText) {
          typewriterText.appendChild(cursor);
        }
      }
      if (actionContainer) actionContainer.classList.remove('hidden');
      introScreen.classList.add('is-complete');

      // Hold dramatically for 6.5s so the user can read the manifesto before site auto-reveals
      autoDismissTimer = setTimeout(() => {
        dismissIntro(true);
      }, 6500);
      return;
    }

    const seg = manifestoSegments[segmentIdx];

    // Ensure active background video is playing and revealed smoothly if not seeking
    if (activeVideo && activeVideo.paused && !activeVideo.seeking && !isVideoSeeking && isVideoPlayRequested) {
      activeVideo.play().catch(() => {});
    }
    if (videoWrap && !videoWrap.classList.contains('video-visible') && activeVideo && activeVideo.currentTime > 0.05 && !activeVideo.seeking && !isVideoSeeking) {
      videoWrap.classList.add('video-visible');
    }

    // Create span for new segment
    if (charIdx === 0) {
      currentSpan = document.createElement('span');
      if (seg.type === 'highlight') currentSpan.className = 'txt-highlight';
      else if (seg.type === 'danger') currentSpan.className = 'txt-danger';
      else if (seg.type === 'brand') currentSpan.className = 'txt-brand';
      if (typewriterText) {
        if (cursor && cursor.parentNode === typewriterText) {
          typewriterText.insertBefore(currentSpan, cursor);
        } else {
          typewriterText.appendChild(currentSpan);
          if (cursor) typewriterText.appendChild(cursor);
        }
      }
    }

    const char = seg.text.charAt(charIdx);
    if (char === '\n') {
      currentSpan.appendChild(document.createElement('br'));
    } else {
      currentSpan.appendChild(document.createTextNode(char));
    }

    // Keep cursor following the active writing position immediately
    if (cursor && typewriterText) {
      if (cursor.parentNode !== typewriterText) {
        typewriterText.appendChild(cursor);
      }
      cursor.style.display = 'inline-block';
      cursor.classList.add('cursor-solid');
      clearTimeout(cursorBlinkTimer);
      cursorBlinkTimer = setTimeout(() => {
        if (cursor) cursor.classList.remove('cursor-solid');
      }, 85);
    }

    charIdx++;

    // Calculate cadence: smooth, natural, and impactful
    let delay = 22; // base typing speed
    if (char === '.' || char === '!' || char === '?') {
      delay = 360;
    } else if (char === ',') {
      delay = 140;
    } else if (char === '\n') {
      delay = 200;
    }

    if (charIdx < seg.text.length) {
      typingTimeout = setTimeout(typeNextCharacter, delay);
    } else {
      segmentIdx++;
      charIdx = 0;
      typingTimeout = setTimeout(typeNextCharacter, 200);
    }
  }

  function startIntroSequence() {
    isDismissed = false;
    isAnimationComplete = false;
    clearTimeout(autoDismissTimer);
    clearTimeout(typingTimeout);
    clearTimeout(failsafeTimer);
    clearTimeout(cursorBlinkTimer);
    if (ambientInterval) clearInterval(ambientInterval);

    document.documentElement.classList.add('intro-active');
    document.documentElement.classList.remove('intro-dismissed-early');
    introScreen.classList.remove('intro-dismissed', 'is-complete');
    introScreen.style.display = 'flex';
    introScreen.style.opacity = '1';
    introScreen.style.visibility = 'visible';
    introScreen.style.transform = 'scale(1)';
    document.body.style.overflow = 'hidden';

    if (typewriterText) {
      typewriterText.innerHTML = '';
      if (cursor) {
        cursor.style.display = 'none';
        cursor.classList.remove('cursor-solid');
        typewriterText.appendChild(cursor);
      }
    }
    if (actionContainer) actionContainer.classList.add('hidden');
    if (initialDot) initialDot.classList.remove('hidden');

    if (ambientStage) ambientStage.innerHTML = '';
    occupiedSlots.clear();
    poolIdx = 0;

    segmentIdx = 0;
    charIdx = 0;
    currentSpan = null;

    if (videoWrap) videoWrap.classList.remove('video-visible');
    if (activeVideo) {
      playActiveVideo();
    }

    resetWatchdog();

    // Phase 1: Pulsing square terminal dot for 1.2 seconds, then start typing and ambients
    setTimeout(() => {
      if (isDismissed) return;
      if (initialDot) initialDot.classList.add('hidden');
      if (cursor) {
        cursor.style.display = 'inline-block';
        if (typewriterText && cursor.parentNode !== typewriterText) {
          typewriterText.appendChild(cursor);
        }
      }
      startAmbientOrchestration();
      typeNextCharacter();
    }, 1200);
  }

  // REPLAY INTRO CONTROLLER
  function replayIntro() {
    try { sessionStorage.removeItem(INTRO_KEY); } catch(e){}
    document.documentElement.classList.add('intro-active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    startIntroSequence();
  }

  if (btnReplay) {
    btnReplay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      replayIntro();
    });
  }

  // Expose global replay function
  window.qp1ngReplayIntro = replayIntro;

  // Unload the inactive video stream to save bandwidth
  if (inactiveVideo) {
    try {
      inactiveVideo.pause();
      while (inactiveVideo.firstChild) {
        inactiveVideo.removeChild(inactiveVideo.firstChild);
      }
      inactiveVideo.removeAttribute('src');
      inactiveVideo.load();
    } catch(e) {}
  }

  // Preload active video
  if (activeVideo && activeVideo.readyState === 0) {
    try { activeVideo.load(); } catch(e){}
  }

  // Initial check: if already seen or user prefers reduced motion, skip intro
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hasSeenIntro() || prefersReduced) {
    document.documentElement.classList.remove('intro-active');
    introScreen.classList.add('intro-dismissed');
    introScreen.style.display = 'none';
    if (bgVideoDesktop) bgVideoDesktop.pause();
    if (bgVideoMobile) bgVideoMobile.pause();
    document.body.style.overflow = '';
  } else {
    // Start initial intro
    startIntroSequence();
  }
})();

// ==========================================================================
// TACTICAL DEPLOYMENT SCHEMATIC CONTROLLER
// Interactive external download channels (APK, Google Play, F-Droid)
// ==========================================================================
(() => {
  const triggerBtn = document.getElementById('dlHubTrigger');
  const drawer = document.getElementById('dlSchematicHub');
  const closeBtn = document.getElementById('dlHubClose');
  const container = document.getElementById('heroDownloadHub');

  if (!triggerBtn || !drawer) return;

  const setSchematicOpen = (open) => {
    drawer.classList.toggle('is-open', open);
    triggerBtn.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));

    if (open) {
      window.requestAnimationFrame(() => {
        const rect = drawer.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
          window.scrollBy({
            top: Math.min(rect.bottom - window.innerHeight + 40, 280),
            behavior: 'smooth'
          });
        }
      });
    }
  };

  triggerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = drawer.classList.contains('is-open');
    setSchematicOpen(!isOpen);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setSchematicOpen(false);
      triggerBtn.focus();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      setSchematicOpen(false);
      triggerBtn.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!drawer.classList.contains('is-open')) return;
    if (container && !container.contains(e.target)) {
      setSchematicOpen(false);
    }
  });

  // Highlight corresponding SVG circuit signal trace on card hover/focus
  const destCards = drawer.querySelectorAll('.dl-dest-card[data-channel]');
  destCards.forEach((card) => {
    const channel = card.getAttribute('data-channel');
    if (!channel) return;
    const signalTrace = drawer.querySelector(`.dl-circuit-pulse[data-signal="${channel}"]`);

    const activate = () => {
      card.classList.add('is-active-route');
      if (signalTrace) signalTrace.classList.add('is-active-trace');
    };

    const deactivate = () => {
      card.classList.remove('is-active-route');
      if (signalTrace) signalTrace.classList.remove('is-active-trace');
    };

    card.addEventListener('mouseenter', activate);
    card.addEventListener('mouseleave', deactivate);
    card.addEventListener('focusin', activate);
    card.addEventListener('focusout', deactivate);
  });
})();

