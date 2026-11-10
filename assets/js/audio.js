// ============================================
// GLOBAL AUDIO PLAYER — seamless across ALL pages (main site + Artwork)
// Playlist loops: nc17 → Von → nc17 → ...
// Sync: position + timestamp are saved, so the next page resumes where the
// music would be "now" (no jump back), via sessionStorage (same origin).
// ============================================
(function () {
  // Audio folder is resolved from this script's own URL → works from any page depth
  const AUDIO_DIR = new URL('../audio/', document.currentScript.src).href;
  const PLAYLIST = [
    { name: 'nc17', path: AUDIO_DIR + 'nc17.mp3' },
    { name: 'Von',  path: AUDIO_DIR + 'Von.mp3'  },
  ];
  const S = sessionStorage;

  let currentIndex = (parseInt(S.getItem('ap_index') || '0', 10) || 0) % PLAYLIST.length;
  let isMuted = S.getItem('ap_muted') === 'true';

  // saved position + real time that passed since it was saved (only if it was playing)
  function savedTime() {
    let t = parseFloat(S.getItem('ap_time') || '0') || 0;
    const ts = parseInt(S.getItem('ap_ts') || '0', 10);
    if (S.getItem('ap_playing') === 'true' && ts) {
      const elapsed = (Date.now() - ts) / 1000;
      if (elapsed >= 0 && elapsed < 15) t += elapsed;
    }
    return t;
  }

  // ── Widget ───────────────────────────────────
  const widget = document.createElement('div');
  widget.className = 'now-playing';
  widget.id = 'nowPlaying';
  widget.innerHTML = `
    <div class="np-bars"><div class="np-bar"></div><div class="np-bar"></div><div class="np-bar"></div><div class="np-bar"></div></div>
    <span class="np-dot"></span>
    <span class="np-text"></span>`;
  const artNav = document.querySelector('.site-nav');          // Artwork pages → sit inside the nav bar
  if (artNav) { const back = artNav.querySelector('.site-nav-back'); artNav.insertBefore(widget, back ? back.nextSibling : artNav.firstChild); }
  else document.body.appendChild(widget);
  const textEl = widget.querySelector('.np-text');
  function setLabel() {
    textEl.innerHTML = `<span class="np-pre">${isMuted ? 'Muted' : 'Now playing'} </span>"${PLAYLIST[currentIndex].name}"`;
    widget.classList.toggle('muted', isMuted);
  }

  // ── Audio ────────────────────────────────────
  const audio = new Audio();
  audio.volume = 0.35;
  audio.muted = isMuted;

  function loadTrack(index, startTime) {
    audio.src = PLAYLIST[index].path;
    // seek only after metadata is ready (setting currentTime earlier is ignored by browsers)
    audio.addEventListener('loadedmetadata', () => {
      if (startTime > 0 && startTime < audio.duration - 0.5) audio.currentTime = startTime;
    }, { once: true });
    setLabel();
  }

  function save() {
    if (audio.readyState === 0) return;            // nothing loaded yet → don't overwrite good data
    S.setItem('ap_time', audio.currentTime.toFixed(2));
    S.setItem('ap_index', currentIndex);
    S.setItem('ap_muted', isMuted);
    S.setItem('ap_playing', !audio.paused);
    S.setItem('ap_ts', Date.now());
  }

  audio.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % PLAYLIST.length;
    S.setItem('ap_time', '0'); S.setItem('ap_ts', Date.now());
    loadTrack(currentIndex, 0);
    audio.play().catch(() => {});
  });

  setInterval(() => { if (!audio.paused) save(); }, 1000);
  window.addEventListener('beforeunload', save);
  window.addEventListener('pagehide', save);

  function tryPlay() {
    loadTrack(currentIndex, savedTime());
    audio.play().catch(() => {
      const unlock = () => {
        audio.play().catch(() => {});
        ['click', 'keydown', 'wheel', 'touchstart'].forEach(e => document.removeEventListener(e, unlock));
      };
      ['click', 'keydown', 'wheel', 'touchstart'].forEach(e => document.addEventListener(e, unlock));
    });
  }
  tryPlay();

  // Browser Back/Forward restores the page from cache → re-sync with the latest saved state
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    currentIndex = (parseInt(S.getItem('ap_index') || '0', 10) || 0) % PLAYLIST.length;
    isMuted = S.getItem('ap_muted') === 'true'; audio.muted = isMuted;
    tryPlay();
  });

  // ── Mute / unmute on click ───────────────────
  widget.addEventListener('click', () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    S.setItem('ap_muted', isMuted);
    setLabel();
  });
})();
