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

})();