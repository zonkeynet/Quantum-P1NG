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

})();