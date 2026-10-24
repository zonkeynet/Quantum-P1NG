// Click-to-watch app recording. No media download or playback before interaction.
(() => {
  'use strict';
  const video = document.getElementById('qgeoDemoVideo');
  const caption = document.getElementById('qgeoDemoCaption');
  const fallback = document.getElementById('qgeoDemoFallback');
  if (!video || !caption || !fallback) return;
  // The page's language (script.js); English when it is missing.
  const T = window.T || (text => text);

  const idleCaption = caption.textContent;
  const language = document.documentElement.lang.split('-')[0];
  const tracks = Array.from(video.querySelectorAll('track'));
  const captions = tracks.find(track => track.srclang === language) || tracks[0];
  let hydrated = false;
  let requested = false;
  let completed = false;
  let failed = false;

  function label() {
    const action = failed ? T('Retry the Q-Geo app walkthrough') : requested || !video.paused
      ? T('Pause the Q-Geo app walkthrough') : completed ? T('Replay the Q-Geo app walkthrough')
      : T('Play the Q-Geo app walkthrough');
    video.setAttribute('aria-label', action);
  }

  function showCaption() {
    if (failed) return;
    const cue = captions && captions.track.activeCues && captions.track.activeCues[0];
    caption.textContent = cue ? cue.text : idleCaption;
  }

  function unavailable() {
    requested = false;
    failed = true;
    caption.textContent = T('The video could not load. Click the image to retry.');
    fallback.hidden = false;
    label();
  }

  function pause() {
    requested = false;
    video.pause();
    label();
  }

  function toggle() {
    if (requested || !video.paused) {
      pause();
      return;
    }
    const retry = failed || video.error;
    failed = false;
    completed = false;
    fallback.hidden = true;
    requested = true;
    video.muted = true;
    if (!hydrated) {
      video.querySelectorAll('source[data-src]').forEach(source => {
        source.src = source.dataset.src;
      });
      if (captions) {
        captions.src = captions.dataset.src;
        captions.track.mode = 'hidden';
      }
      hydrated = true;
      video.load();
    } else if (retry) {
      video.load();
    }
    label();
    video.play().catch(error => {
      // A second click or leaving the page can cancel a pending play request.
      if (requested && error.name !== 'AbortError') unavailable();
    });
  }

  video.addEventListener('click', toggle);
  video.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!event.repeat) toggle();
  });
  video.addEventListener('play', label);
  video.addEventListener('pause', () => { requested = false; label(); });
  video.addEventListener('error', unavailable);
  video.addEventListener('ended', () => {
    requested = false;
    completed = true;
    // Reset to the original static poster, without looping or autoplay.
    video.load();
    caption.textContent = idleCaption;
    label();
  });
  if (captions) {
    captions.track.addEventListener('cuechange', showCaption);
    captions.addEventListener('load', showCaption);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) pause();
    }).observe(video);
  }
  label();
})();
