
// Q-Cast hero: static artwork until a click or keyboard activation.
(() => {
  'use strict';
  const video = document.getElementById('qcastHeroVideo');
  const hint = document.getElementById('qcastHeroHint');
  if (!video) return;
  let loaded = false;
  let failed = false;
  video.muted = true;
  video.defaultMuted = true;

  function sync() {
    const playing = !video.paused && !video.ended;
    video.setAttribute('aria-pressed', String(playing));
    video.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} Q-Cast animation`);
    if (hint) hint.textContent = failed ? 'VIDEO UNAVAILABLE // CLICK TO RETRY'
      : playing ? 'CLICK TO PAUSE' : video.currentTime > 0 ? 'CLICK TO RESUME' : 'CLICK TO PLAY';
  }

  function toggle() {
    if (!video.paused) { video.pause(); return; }
    if (!loaded || failed) {
      video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
      loaded = true;
      failed = false;
      video.load();
    }
    video.play().catch(error => {
      if (error.name === 'AbortError') return;
      failed = true;
      sync();
    });
  }

  video.addEventListener('click', toggle);
  video.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!event.repeat) toggle();
  });
  ['play', 'pause', 'emptied'].forEach(name => video.addEventListener(name, sync));
  video.addEventListener('ended', () => {
    video.querySelectorAll('source').forEach(source => source.removeAttribute('src'));
    loaded = false;
    video.load();
    sync();
  });
  video.addEventListener('error', () => { if (loaded) { failed = true; sync(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.pause(); }).observe(video);
  }
  sync();
})();
