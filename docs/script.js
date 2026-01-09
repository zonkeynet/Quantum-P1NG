(() => {
  const burger = document.querySelector(".burger");
  const mobile = document.querySelector(".mobilemenu");

  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    mobile.style.display = open ? "block" : "none";
    mobile.setAttribute("aria-hidden", String(!open));
  };

  if (burger && mobile) {
    setMenu(false);
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

    mobile.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => setMenu(false));
    });
  }

  // Copy button
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-copy");
      const el = document.getElementById(id);
      if (!el) return;

      const text = el.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        const old = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = old), 900);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        const old = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = old), 900);
      }
    });
  });
})();
