// Real app walkthroughs: media is requested only after the visitor clicks.
(() => {
  'use strict';
  // The home's T (script.js); the Pro page has no script.js: its language pages carry the texts in #pro-i18n.
  const T = window.T || (() => {
    let texts = {};
    try { texts = JSON.parse(document.getElementById('pro-i18n').textContent); } catch (e) { /* English page */ }
    return text => texts[text] || text;
  })();
  const players = Array.from(document.querySelectorAll('[data-app-walkthrough]'));
  players.forEach(player => {
    const video = player.querySelector('video');
    const caption = player.querySelector('[data-demo-caption]');
    const hint = player.querySelector('[data-demo-hint]');
    const fallback = player.querySelector('[data-demo-fallback]');
    const buttons = Array.from(player.querySelectorAll('[data-demo-lang]'));
    // Optional chapters (data-from / data-to, in seconds): the current one is marked and shows how far it has played.
    const chapters = Array.from(player.querySelectorAll('[data-demo-chapter]'));
    if (!video || !caption || !hint || !fallback) return;
    const pageIdle = caption.textContent;
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
      // English, or the page's language (script.js's T) on the translated pages.
      en: { play: T('Click to play'), pause: T('Click to pause'), replay: T('Click to replay'), retry: T('Click to retry'),
        unavailable: T('The video could not load. Click the preview to retry.') },
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
      // At rest: the caption the page was built with, in the page's language; data-idle-it/-en when the visitor picks
      // the other caption language on the Italian page.
      const idle = language === 'it' ? player.dataset.idleIt
        : document.documentElement.lang.startsWith('it') ? player.dataset.idleEn : pageIdle;
      caption.textContent = failed ? text.unavailable : cue ? cue[language] : idle;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demoLang === language)));
      const playing = requested || !video.paused;
      player.classList.toggle('is-playing', playing);
      const time = ended ? 0 : video.currentTime;
      chapters.forEach(chapter => {
        const from = Number(chapter.dataset.from);
        const to = Number(chapter.dataset.to);
        const current = (playing || time > 0) && time >= from && time < to;
        chapter.classList.toggle('is-active', current);
        chapter.style.setProperty('--chapter-progress', current ? ((time - from) / (to - from)).toFixed(3) : time >= to ? '1' : '0');
      });
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
      // data-playback-rate speeds a recording up; captions and chapters follow the media time, so they keep pace.
      // load() resets the rate to the default one: both are set before each play.
      const rate = Number(player.dataset.playbackRate) || 1;
      video.defaultPlaybackRate = rate;
      video.playbackRate = rate;
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
    // Source failures do not bubble to the video element in every browser. Before the first click the sources have no
    // src yet, and the browser reports each of them as failed while the page loads: those are not real failures.
    sources.forEach(source => source.addEventListener('error', () => {
      if (!source.getAttribute('src')) return;
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
