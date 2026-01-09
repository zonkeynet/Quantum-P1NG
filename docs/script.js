(() => {
  // Mobile Menu Logic
  const burger = document.querySelector(".burger");
  const mobile = document.querySelector(".mobilemenu");

  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    mobile.style.display = open ? "block" : "none";
    mobile.setAttribute("aria-hidden", String(!open));
  };

  if (burger && mobile) {
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });
    mobile.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => setMenu(false));
    });
  }

  // --- HACKER TYPEWRITER EFFECT ---
  const typeWriter = async (element, text) => {
    element.innerHTML = ""; // Clear
    element.classList.add("typing-cursor");
    
    // Split text by lines to handle formatting better
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Add specific coloring for prompts or status
        if(line.includes("$")) line = `<span style="color:#fff">${line}</span>`;
        if(line.includes("OK") || line.includes("connected")) line = line.replace("OK", "<span style='color:#0aff84'>OK</span>").replace("connected", "<span style='color:#0aff84'>connected</span>");
        
        // Create a div for the line to keep structure
        const lineEl = document.createElement('div');
        element.appendChild(lineEl);
        
        // Type chars one by one for this line
        // We strip HTML tags for typing to avoid seeing <span> tags typed out, 
        // then replace with full HTML at end of line, or simplified typing:
        // SIMPLIFIED: Just append chars to the line element.
        
        // For visual simplicity in this demo, we'll just append text content
        // If the line has HTML (like color spans), we append it instantly to maintain color
        // or we have to parse it. To keep it simple "hacker style":
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = line;
        const plainText = tempDiv.textContent;
        
        lineEl.innerHTML = ""; // Start empty
        
        for (let j = 0; j < plainText.length; j++) {
            lineEl.textContent += plainText[j];
            // Random delay for realism (10ms to 50ms)
            await new Promise(r => setTimeout(r, Math.random() * 40 + 10));
        }
        
        // After typing plain text, swap with HTML version to show colors if any
        lineEl.innerHTML = line; 
        
        // Small pause at end of line
        await new Promise(r => setTimeout(r, 100));
        
        // Auto scroll to bottom
        element.scrollTop = element.scrollHeight;
    }
    
    // Keep cursor blinking at the end
  };

  // Start Typing when page loads
  const terminalOutput = document.getElementById("typewriter-output");
  const sourceText = document.getElementById("terminal-text");
  
  if (terminalOutput && sourceText) {
      // Delay start slightly
      setTimeout(() => {
          typeWriter(terminalOutput, sourceText.textContent.trim());
      }, 500);
  }

  // Copy Button Logic
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

})();
