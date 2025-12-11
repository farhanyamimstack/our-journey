/* music.js - scrapbook pastel global music player */

/* ---------- CONFIG ---------- */
const tracks = [
  { id: 'magic', file: 'music/magic.mp3', title: 'Magic' },
  { id: 'cincin', file: 'music/cincin.mp3', title: 'Cincin' }
];

// localStorage keys
const KEY = 'oj_music_state_v1';

/* ---------- HELPER: state persistence ---------- */
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {
      currentTrack: 0,
      currentTime: 0,
      isPaused: true,
      volume: 0.35
    };
  } catch(e) { return { currentTrack:0, currentTime:0, isPaused:true, volume:0.35 }; }
}
function saveState(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

/* ---------- Build UI ---------- */
function createPlayerElement() {
  const wrap = document.createElement('div');
  wrap.className = 'music-player';
  wrap.id = 'musicPlayer';

  wrap.innerHTML = `
    <div class="player-left">
      <div class="sticker">M</div>
    </div>

    <div class="player-controls">
      <button class="ctrl-btn prev" title="Previous">◀</button>
      <button class="ctrl-btn play" title="Play/Pause">▶</button>
      <button class="ctrl-btn next" title="Next">▶◀</button>

      <div class="player-meta">
        <div class="song-title" id="mp-title">Song</div>
        <div class="song-sub" id="mp-sub">Artist</div>
      </div>
    </div>

    <div class="player-right">
      <div class="progress" id="mp-progress"><div class="bar" id="mp-bar"></div></div>
      <div class="right-controls">
        <div class="time-inline" id="mp-time">0:00</div>
        <input type="range" id="mp-vol" min="0" max="1" step="0.01" value="0.35" class="volume">
        <button class="heart-btn" id="mp-heart" title="Send love">💗</button>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);
  return wrap;
}

/* ---------- Main player logic ---------- */
(function initMusicPlayer(){
  const state = loadState();
  // create audio element
  const audio = document.createElement('audio');
  audio.id = 'oj-audio';
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
  audio.loop = false;

  // attach to DOM but hidden (audio element separate from UI)
  audio.style.display = 'none';
  document.body.appendChild(audio);

  // build UI; we'll hide it on index
  const playerEl = createPlayerElement();
  const isIndex = (document.body.dataset.page === 'index');

  // initial track
  let current = state.currentTrack || 0;
  if(current < 0 || current >= tracks.length) current = 0;

  // assign sources
  function loadTrack(idx, resumeTime = 0, autoplay = false) {
    const t = tracks[idx];
    audio.src = t.file;
    audio.load();
    audio.currentTime = resumeTime || 0;
    // update UI text
    document.getElementById('mp-title').textContent = t.title;
    document.getElementById('mp-sub').textContent = ''; // keep blank (privacy)
    // set play/pause icon
    setPlayIcon(!state.isPaused);
    if(autoplay && !state.isPaused) {
      // small delay to allow load
      audio.play().catch(()=>{/*autoplay blocked*/});
    }
  }

  // UI elements
  const btnPlay = playerEl.querySelector('.play');
  const btnPrev = playerEl.querySelector('.prev');
  const btnNext = playerEl.querySelector('.next');
  const progress = document.getElementById('mp-progress');
  const bar = document.getElementById('mp-bar');
  const timeInline = document.getElementById('mp-time');
  const vol = document.getElementById('mp-vol');
  const heart = document.getElementById('mp-heart');

  // set initial volume from state
  audio.volume = (typeof state.volume === 'number') ? state.volume : 0.35;
  vol.value = audio.volume;

  // load the starting track and time
  loadTrack(current, state.currentTime, /*autoplay=*/!isIndex);

  // if on index: keep audio muted and hide UI
  if (isIndex) {
    audio.muted = true;
    playerEl.classList.add('music-hidden');
    // start muted autoplay so browsers allow unmuted later
    audio.play().catch(()=>{});
  } else {
    // non-index pages: unmute and fade in if previously not paused
    audio.muted = false;
    if(!state.isPaused) {
      audio.play().catch(()=>{});
      fadeVolume(audio, audio.volume, 600);
    }
  }

  // fade helper
  function fadeVolume(audioEl, targetVol, duration=600) {
    const start = audioEl.volume;
    const diff = targetVol - start;
    const steps = 20;
    let i = 0;
    const stepTime = Math.max(10, Math.floor(duration/steps));
    const timer = setInterval(()=>{
      i++;
      const v = start + (diff * i/steps);
      audioEl.volume = Math.min(1, Math.max(0, v));
      if(i>=steps) clearInterval(timer);
    }, stepTime);
  }

  // update play icon
  function setPlayIcon(playing) {
    btnPlay.textContent = playing ? '❚❚' : '▶';
  }

  // play/pause
  btnPlay.addEventListener('click', ()=>{
    if(audio.paused) {
      audio.play().catch(()=>{});
      state.isPaused = false;
    } else {
      audio.pause();
      state.isPaused = true;
    }
    setPlayIcon(!state.isPaused);
    saveState({...state, currentTrack: current, volume: audio.volume, currentTime: audio.currentTime, isPaused: state.isPaused});
  });

  // prev / next
  btnPrev.addEventListener('click', ()=>{
    current = (current - 1 + tracks.length) % tracks.length;
    state.currentTrack = current;
    loadTrack(current, 0, true);
    state.currentTime = 0;
    saveState({...state, currentTrack: current, currentTime: 0});
  });
  btnNext.addEventListener('click', ()=>{
    current = (current + 1) % tracks.length;
    state.currentTrack = current;
    loadTrack(current, 0, true);
    state.currentTime = 0;
    saveState({...state, currentTrack: current, currentTime: 0});
  });

  // progress update while playing
  audio.addEventListener('timeupdate', ()=>{
    const pct = (audio.duration && !isNaN(audio.duration)) ? (audio.currentTime / audio.duration) * 100 : 0;
    bar.style.width = pct + '%';
    timeInline.textContent = formatTime(audio.currentTime) + ' / ' + (audio.duration ? formatTime(audio.duration) : '0:00');
    // save currentTime occasionally
    if(Math.random() < 0.08) { // slight throttle
      state.currentTime = audio.currentTime;
      saveState({...state, currentTrack: current, currentTime: state.currentTime, volume: audio.volume, isPaused: state.isPaused});
    }
  });

  // click to seek
  progress.addEventListener('click', (e)=>{
    const rect = progress.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x/rect.width));
    if(audio.duration) audio.currentTime = pct * audio.duration;
    state.currentTime = audio.currentTime;
    saveState({...state, currentTrack: current, currentTime: state.currentTime});
  });

  // volume control
  vol.addEventListener('input', (e)=>{
    audio.volume = parseFloat(e.target.value);
    state.volume = audio.volume;
    saveState({...state, volume: audio.volume});
  });

  // ended: auto next
  audio.addEventListener('ended', ()=>{
    current = (current + 1) % tracks.length;
    state.currentTrack = current;
    loadTrack(current, 0, true);
    state.currentTime = 0;
    saveState({...state, currentTrack: current, currentTime: 0});
  });

  // heart button: symbolic log in localStorage (shared with other pages)
  heart.addEventListener('click', ()=>{
    const keyH = 'oj_hearts_log';
    const arr = JSON.parse(localStorage.getItem(keyH) || '[]');
    arr.unshift({date: new Date().toISOString()});
    localStorage.setItem(keyH, JSON.stringify(arr));
    // tiny pop animation
    heart.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}], {duration:300});
  });

  // helper format
  function formatTime(s) {
    if(!s || isNaN(s)) return '0:00';
    const m = Math.floor(s/60);
    const sec = Math.floor(s%60);
    return `${m}:${sec.toString().padStart(2,'0')}`;
  }

  // when page unload, store timestamp
  window.addEventListener('beforeunload', ()=>{
    state.currentTime = audio.currentTime;
    state.isPaused = audio.paused;
    state.volume = audio.volume;
    state.currentTrack = current;
    saveState(state);
  });

  // external API: if index later navigates to other page and we need to unhide & unmute
  window.ojMusic = {
    showPlayer: function() {
      playerEl.classList.remove('music-hidden');
      audio.muted = false;
      if(!state.isPaused) audio.play().catch(()=>{});
      fadeVolume(audio, state.volume, 500);
    },
    hidePlayer: function() {
      playerEl.classList.add('music-hidden');
      audio.muted = true;
    }
  };

  // If we are not on index but the player was hidden earlier, show and unmute
  if(!isIndex) {
    playerEl.classList.remove('music-hidden');
    // if state says paused, show paused state
    setPlayIcon(!state.isPaused);
  }
})();
