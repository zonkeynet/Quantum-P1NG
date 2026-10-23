// Real app walkthroughs: media is requested only after the visitor clicks.
(() => {
  'use strict';
  const players = Array.from(document.querySelectorAll('[data-app-walkthrough]'));
  players.forEach(player => {
    const video = player.querySelector('video');
    const caption = player.querySelector('[data-demo-caption]');
    const hint = player.querySelector('[data-demo-hint]');
    const fallback = player.querySelector('[data-demo-fallback]');
    const buttons = Array.from(player.querySelectorAll('[data-demo-lang]'));
    if (!video || !caption || !hint || !fallback) return;
    const name = player.dataset.appWalkthrough;
    let language = document.documentElement.lang.startsWith('it') ? 'it' : 'en';
    let requested = false;
    let hydrated = false;
    let failed = false;
    let ended = false;
    let cues = [];
    const sources = Array.from(video.querySelectorAll('source[data-src]'));
    const failedSources = new Set();
    const words = {
      en: { play: 'Click to play', pause: 'Click to pause', replay: 'Click to replay', retry: 'Click to retry',
        unavailable: 'The video could not load. Click the preview to retry.' },
      it: { play: 'Clicca per avviare', pause: 'Clicca per mettere in pausa', replay: 'Clicca per rivedere', retry: 'Clicca per riprovare',
        unavailable: 'Il video non si è caricato. Clicca sull’anteprima per riprovare.' }
    };
    function render() {
      const text = words[language];
      const action = failed ? 'retry' : requested || !video.paused ? 'pause' : ended ? 'replay' : 'play';
      hint.textContent = text[action];
      video.setAttribute('aria-label', text[action] + ': ' + name);
      video.setAttribute('aria-pressed', String(requested || !video.paused));
      const cue = !ended && cues.find(item => video.currentTime >= item.start && video.currentTime < item.end);
      caption.textContent = failed ? text.unavailable : cue ? cue[language] : player.dataset['idle' + (language === 'it' ? 'It' : 'En')];
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demoLang === language)));
    }
    function pause() {
      requested = false;
      video.pause();
      render();
    }
    function unavailable() {
      requested = false;
      failed = true;
      video.pause();
      fallback.hidden = false;
      render();
    }
    function toggle() {
      if (requested || !video.paused) { pause(); return; }
      const retry = failed || video.error;
      failedSources.clear();
      failed = false;
      ended = false;
      requested = true;
      fallback.hidden = true;
      players.forEach(other => {
        if (other !== player) other.querySelector('video')?.pause();
      });
      video.muted = true;
      if (!hydrated) {
        video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
        hydrated = true;
        video.load();
        fetch(player.dataset.cues).then(response => {
          if (!response.ok) throw new Error('Captions unavailable');
          return response.json();
        }).then(data => { if (Array.isArray(data)) cues = data; render(); }).catch(() => {});
      } else if (retry) video.load();
      render();
      video.play().catch(error => {
        if (requested && error.name !== 'AbortError') unavailable();
      });
    }
    video.addEventListener('click', toggle);
    video.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (!event.repeat) toggle();
    });
    video.addEventListener('play', render);
    video.addEventListener('pause', () => { requested = false; render(); });
    video.addEventListener('timeupdate', render);
    video.addEventListener('error', unavailable);
    // Source failures do not bubble to the video element in every browser.
    sources.forEach(source => source.addEventListener('error', () => {
      failedSources.add(source);
      if (failedSources.size === sources.length) unavailable();
    }));
    video.addEventListener('ended', () => {
      requested = false;
      ended = true;
      video.load();
      render();
    });
    buttons.forEach(button => button.addEventListener('click', () => {
      language = button.dataset.demoLang === 'it' ? 'it' : 'en';
      render();
    }));
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); }).observe(video);
    }
    render();
  });
})();
