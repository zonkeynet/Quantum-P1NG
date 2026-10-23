// Model gallery: local assets, original prompts, no generation or third-party requests.
(() => {
  'use strict';
  const section = document.getElementById('q-dream');
  if (!section) return;
  const track = section.querySelector('#qdream-gallery-track');
  const links = Array.from(section.querySelectorAll('[data-dream-image]'));
  const dialog = section.querySelector('#qdream-lightbox');
  if (!track || !links.length || !dialog) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controls = section.querySelector('[data-dream-controls]');
  const scrollButtons = Array.from(controls.querySelectorAll('[data-dream-scroll]'));
  const updateScroll = () => {
    const max = track.scrollWidth - track.clientWidth;
    scrollButtons[0].disabled = track.scrollLeft <= 2;
    scrollButtons[1].disabled = track.scrollLeft >= max - 2;
  };
  controls.hidden = false;
  scrollButtons.forEach(button => button.addEventListener('click', () => {
    const stride = links[1].offsetLeft - links[0].offsetLeft;
    const count = Math.max(1, Math.round(track.clientWidth / stride));
    track.scrollBy({ left: Number(button.dataset.dreamScroll) * stride * count,
      behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }));
  track.addEventListener('scroll', updateScroll, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(updateScroll).observe(track);
  else window.addEventListener('resize', updateScroll);
  updateScroll();

  // A single short entrance effect; no continuous animation or autoplay carousel.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        section.classList.add('qdream-awake');
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(section);
  }
  // Links continue to open the local images when modal dialogs are unavailable.
  if (typeof dialog.showModal !== 'function') return;
  const full = dialog.querySelector('[data-dream-full]');
  const title = dialog.querySelector('#qdream-lightbox-title');
  const model = dialog.querySelector('[data-dream-model]');
  const prompt = dialog.querySelector('[data-dream-prompt]');
  const status = dialog.querySelector('[data-dream-status]');
  const original = dialog.querySelector('[data-dream-original]');
  const close = dialog.querySelector('[data-dream-close]');
  let activeIndex = 0;
  let returnFocus = null;
  let copyRequest = 0;
  function render(index) {
    activeIndex = (index + links.length) % links.length;
    const link = links[activeIndex];
    full.src = link.href;
    full.alt = link.querySelector('img').alt;
    title.textContent = link.dataset.title;
    model.textContent = link.dataset.model;
    prompt.textContent = link.dataset.prompt;
    dialog.querySelector('[data-dream-seed]').textContent = link.dataset.seed;
    dialog.querySelector('[data-dream-counter]').textContent = String(activeIndex + 1).padStart(2, '0') + ' / ' + String(links.length).padStart(2, '0');
    original.href = link.dataset.source;
    status.textContent = '';
    copyRequest++;
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    returnFocus = link;
    render(index);
    section.querySelector('video')?.pause();
    dialog.showModal();
    document.documentElement.classList.add('qdream-modal-open');
    close.focus({ preventScroll: true });
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    copyRequest++;
    document.documentElement.classList.remove('qdream-modal-open');
    returnFocus?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector('[data-dream-previous]').addEventListener('click', () => render(activeIndex - 1));
  dialog.querySelector('[data-dream-next]').addEventListener('click', () => render(activeIndex + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      dialog.close();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = Array.from(dialog.querySelectorAll('button:not(:disabled), a[href]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      render(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.querySelector('[data-dream-copy]').addEventListener('click', async () => {
    const request = ++copyRequest;
    try {
      await navigator.clipboard.writeText(prompt.textContent);
      if (request === copyRequest && dialog.open) status.textContent = 'Prompt copied. Try it in Q-Brain with Q-Dream.';
    } catch (_) {
      if (request !== copyRequest || !dialog.open) return;
      const range = document.createRange();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Select the highlighted prompt to copy it.';
    }
  });
})();
