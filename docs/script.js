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
      if (window.innerWidth > 800) {
        toggleMenu(true);
      }
    });
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
// 6. CINEMATIC GAMES REVEAL (ENHANCED "WOW" EDITION)
// =========================================================================
const terminal = document.getElementById('games-terminal');
const gamesGrid = document.getElementById('cyber-games-grid');
const glitchText = terminal ? terminal.querySelector('.glitch-text') : null;

// Creazione dinamica dell'overlay di rumore per l'effetto cinema
const noise = document.createElement('div');
noise.className = 'glitch-noise';
document.body.appendChild(noise);

const unlockSound = new Audio('assets/audio/glitch.mp3');
unlockSound.volume = 0.6; // Volume leggermente alzato per l'impatto

// Set di caratteri per l'effetto di decriptazione
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>";
let scrambleInterval;

if (terminal && gamesGrid) {
  terminal.addEventListener('click', () => {
    // Disabilita ulteriori click durante l'animazione
    terminal.style.pointerEvents = 'none';

    // --- FASE 1: DECRIPTAZIONE & ANTICIPAZIONE (0.0s - 0.6s) ---
    unlockSound.play().catch(e => console.log("Audio trigger failed"));

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
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const input = document.getElementById('lora-input');
    const btn = document.getElementById('lora-transmit-btn');
    const terminal = document.getElementById('lora-terminal');
    const svgGlitchId = 'url(#cyber-glitch)';

    let width, height;
    let nodes = [];
    let packets = [];
    const NUM_NODES = 45; 
    const CONNECTION_DIST = 130;

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
    const CELL_SIZE = 25;
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

    window.addEventListener('resize', resize);
    resize();

    // --- MAIN RENDER LOOP ---
    function drawScene() {
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

        requestAnimationFrame(drawScene);
    }
    
    requestAnimationFrame(drawScene);

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
// =========================================================================
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
          markLast('TRANSFER_BEGIN');
          setStatus('TRANSFERRING_DELTA', 'bad');
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

    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

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

  let lastFrame = performance.now();

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

  // Freeze toggle
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      frozen = !frozen;
      setMode(frozen ? '[FROZEN]' : '[RUNNING]');
      markLast(frozen ? 'FREEZE' : 'RESUME');
      setStatus(frozen ? 'PAUSED' : 'IDLE', frozen ? 'warn' : 'ok');
    }
  });

  // Resize
  window.addEventListener('resize', resize);

  // Init nodes
  const baseCount = reducedMotion ? 12 : 18;
  for (let i = 0; i < baseCount; i++) nodes.push(new PeerNode(i));

  resize();

  // Start/Stop on visibility
  const deck = canvas.closest('.neural-container') || canvas.parentElement;
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

})();