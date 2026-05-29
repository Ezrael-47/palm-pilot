(function() {
  // MrBeast real-world data
  const mrBeastInfo = {
    name: "Jimmy Donaldson",
    channel: "MrBeast",
    subscribers: "380M+",
    totalViews: "70B+",
    birthDate: "May 7, 1998",
    birthplace: "Wichita, Kansas, USA",
    netWorth: "$500M+ (est.)",
    knownFor: ["Extreme challenges", "Large-scale philanthropy", "Expensive stunts"],
    team: ["Chris Tyson", "Chandler Hallow", "Karl Jacobs", "Nolan Hansen"],
    beastPhilanthropy: "Over $100M donated to food banks, housing, and environmental causes.",
    feastables: "Chocolate brand, competes with Hershey's.",
    lunchly: "Healthy lunch kits (with Logan Paul & KSI)."
  };

  let dateBookEvents = [
    { date: '2026-06-01', title: 'New $1M Challenge Video' },
    { date: '2026-06-15', title: 'Beast Philanthropy Livestream' },
    { date: '2026-07-04', title: 'Squad vs. Wild 2 Premiere' }
  ];

  let currentApp = 'home';
  let graffitiStroke = [];
  let isDrawing = false;
  let photoIndex = 0;
  let currentTrackIndex = 0;
  let isPlaying = false;

  const photoPlaceholders = [
    'https://picsum.photos/id/1/200/140',
    'https://picsum.photos/id/2/200/140',
    'https://picsum.photos/id/3/200/140'
  ];

  const musicPlaylist = [
    { title: 'Music-1', src: 'music1.mp3' },
    { title: 'Music-2', src: 'music2.mp3' },
    { title: 'Music-3', src: 'music3.mp3' }
  ];

  const canvas = document.getElementById('graffitiCanvas');
  const ctx = canvas.getContext('2d');
  const appScreen = document.getElementById('appScreen');

  function recognizeGraffiti(strokes) {
    if (!strokes || strokes.length === 0) return '';
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    strokes.forEach(p => {
      if(p.x < minX) minX = p.x;
      if(p.x > maxX) maxX = p.x;
      if(p.y < minY) minY = p.y;
      if(p.y > maxY) maxY = p.y;
    });
    const w = maxX - minX;
    const h = maxY - minY;
    if (w < 8 && h < 8) return '';
    const first = strokes[0];
    const last = strokes[strokes.length-1];
    const dy = last.y - first.y;
    const dx = last.x - first.x;
    if (h > 30 && w < 18) return 'A';
    if (w > 25 && h < 14) return 'M';
    if (Math.abs(dx) > 20 && Math.abs(dy) < 12) return 'D';
    if (h > 25 && w > 20) return 'R';
    if (h > 22 && w < 16) return 'H';
    return '●';
  }

  function processGraffitiInput() {
    if (graffitiStroke.length === 0) return;
    const char = recognizeGraffiti(graffitiStroke);
    graffitiStroke = [];
    drawGraffitiCanvas();
    if (char && char !== '●') handleGraffitiCharacter(char);
  }

  function handleGraffitiCharacter(ch) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      const val = activeEl.value;
      activeEl.value = val.slice(0, start) + ch + val.slice(end);
      activeEl.selectionStart = activeEl.selectionEnd = start + 1;
      activeEl.focus();
    } else {
      if (ch === 'A') switchApp('about');
      else if (ch === 'M') switchApp('music');
      else if (ch === 'R') switchApp('facts');
      else if (ch === 'D') switchApp('datebook');
      else if (ch === 'C') switchApp('contact');
      else if (ch === 'H') switchApp('home');
    }
  }

  function drawGraffitiCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#c8e080';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#a0d040';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    if (graffitiStroke.length > 0) {
      ctx.moveTo(graffitiStroke[0].x, graffitiStroke[0].y);
      for (let i = 1; i < graffitiStroke.length; i++) {
        ctx.lineTo(graffitiStroke[i].x, graffitiStroke[i].y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const coords = getCanvasCoords(e);
    graffitiStroke = [coords];
    drawGraffitiCanvas();
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    graffitiStroke.push(coords);
    drawGraffitiCanvas();
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    e.preventDefault();
    setTimeout(() => {
      if (graffitiStroke.length > 0) processGraffitiInput();
    }, 100);
  }

  function switchApp(appId) {
    currentApp = appId;
    renderAppScreen();
  }

  function nextPhoto() {
    photoIndex = (photoIndex + 1) % photoPlaceholders.length;
    renderAppScreen();
  }

  function playTrack(index) {
    currentTrackIndex = index;
    isPlaying = true;
    const audio = document.getElementById('globalAudio');
    if (audio && musicPlaylist[index].src) {
      audio.src = musicPlaylist[index].src;
      audio.play();
    }
    renderAppScreen();
  }

  function renderAppScreen() {
    if (!appScreen) return;
    switch (currentApp) {
      case 'home': renderHome(); break;
      case 'about': renderAbout(); break;
      case 'contact': renderContact(); break;
      case 'facts': renderFacts(); break;
      case 'music': renderMusic(); break;
      case 'datebook': renderDateBook(); break;
      default: renderHome();
    }
  }

  function renderHome() {
    appScreen.innerHTML = `
      <div class="title-bar">
        <span>📋 ${mrBeastInfo.channel}</span>
        <span class="battery-icon">🔋 88%</span>
      </div>
      <div style="font-size:10px; color:#3b4a20; margin-bottom:6px; text-align:center;">${mrBeastInfo.subscribers} Subscribers · ${mrBeastInfo.totalViews} Views</div>
      <div class="app-grid">
        <div class="app-icon" data-app="about">👤<span>About</span></div>
        <div class="app-icon" data-app="contact">📞<span>Contact</span></div>
        <div class="app-icon" data-app="facts">⭐<span>Facts</span></div>
        <div class="app-icon music-icon" data-app="music">🎵<span>Music</span></div>
        <div class="app-icon" data-app="datebook">📅<span>Dates</span></div>
      </div>
      <div style="margin-top:10px; font-size:10px; color:#2a3810; text-align:center;">
        ✍️ A=About M=Music R=Facts D=Dates C=Contact
      </div>
      <div class="now-playing" id="nowPlayingHome">
        🎧 ${isPlaying ? 'Now Playing: ' + musicPlaylist[currentTrackIndex].title : 'No music playing'}
      </div>
    `;
    document.querySelectorAll('.app-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        const app = icon.dataset.app;
        if (app) switchApp(app);
      });
    });
  }

  function renderAbout() {
    appScreen.innerHTML = `
      <div class="title-bar"><span>👤 About MrBeast</span></div>
      <div style="font-size:11px; line-height:1.6;">
        <p><b>${mrBeastInfo.name}</b></p>
        <p>Born: ${mrBeastInfo.birthDate}</p>
        <p>From: ${mrBeastInfo.birthplace}</p>
        <hr>
        <p>Jimmy Donaldson, better known as MrBeast, is the most-subscribed individual on YouTube. Starting at age 13, he pioneered a genre of high-budget challenge and philanthropy videos.</p>
        <p><b>Known For:</b> ${mrBeastInfo.knownFor.join(', ')}</p>
        <p><b>Squad:</b> ${mrBeastInfo.team.join(', ')}</p>
        <p><b>Philanthropy:</b> ${mrBeastInfo.beastPhilanthropy}</p>
      </div>
      <button class="palm-btn" onclick="window.switchApp('home')" style="margin-top:8px;">← Back</button>
    `;
  }

  function renderContact() {
    appScreen.innerHTML = `
      <div class="title-bar"><span>📞 Business Contact</span></div>
      <div style="font-size:13px; line-height:1.8;">
        <p><b>Channel:</b> MrBeast</p>
        <p><b>Email:</b> business@mrbeast.team</p>
        <p><b>Merch:</b> shopmrbeast.com</p>
        <p><b>Feastables:</b> feastables.com</p>
        <p><b>Philanthropy:</b> beastphilanthropy.org</p>
      </div>
      <button class="palm-btn" onclick="window.switchApp('home')" style="margin-top:8px;">← Back</button>
    `;
  }

  function renderFacts() {
    appScreen.innerHTML = `
      <div class="title-bar"><span>⭐ MrBeast Facts</span></div>
      <div class="resume-photo" id="resumePhoto" style="background-image:url('${photoPlaceholders[photoIndex]}')">
        <span class="photo-nav">📷 ${photoIndex+1}/${photoPlaceholders.length}</span>
      </div>
      <div style="font-size:11px; line-height:1.5;">
        <p><b>Subscribers:</b> ${mrBeastInfo.subscribers}</p>
        <p><b>Net Worth:</b> ${mrBeastInfo.netWorth}</p>
        <p><b>Feastables:</b> ${mrBeastInfo.feastables}</p>
        <p><b>Lunchly:</b> ${mrBeastInfo.lunchly}</p>
        <p><b>Record:</b> Most trees planted (20M+ with TeamTrees)</p>
      </div>
      <button class="palm-btn" onclick="window.switchApp('home')" style="margin-top:6px;">← Back</button>
    `;
    document.getElementById('resumePhoto')?.addEventListener('click', nextPhoto);
  }

  function renderMusic() {
    let html = `
      <div class="title-bar"><span>🎵 Epic Music</span></div>
      <div class="music-player-section">
        <p style="font-size:11px; margin-bottom:6px;">🎧 Now Playing: <b>${musicPlaylist[currentTrackIndex].title}</b></p>
        <audio controls id="globalAudio" style="width:100%; height:26px;">
          <source src="${musicPlaylist[currentTrackIndex].src}" type="audio/mpeg">
        </audio>
        <div style="margin-top:10px;">
          <p style="font-size:11px; font-weight:bold;">Beast Playlist:</p>
    `;
    musicPlaylist.forEach((track, i) => {
      html += `
        <div class="playlist-item ${i === currentTrackIndex && isPlaying ? 'playing' : ''}" data-track="${i}">
          <span>${i === currentTrackIndex && isPlaying ? '🔊' : '🎶'} ${track.title}</span>
          <span style="font-size:10px;">${i === currentTrackIndex && isPlaying ? 'Playing' : 'Tap'}</span>
        </div>
      `;
    });
    html += `
        </div>
        <p style="font-size:9px; color:#4a5a2e; margin-top:6px;">Royalty-free demo tracks</p>
      </div>
      <button class="palm-btn" onclick="window.switchApp('home')" style="margin-top:8px;">← Back</button>
    `;
    appScreen.innerHTML = html;

    document.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const index = parseInt(item.dataset.track);
        playTrack(index);
      });
    });

    const audioEl = document.getElementById('globalAudio');
    if (audioEl) {
      audioEl.addEventListener('play', () => { isPlaying = true; });
      audioEl.addEventListener('pause', () => { isPlaying = false; });
    }
  }

  function renderDateBook() {
    let html = `<div class="title-bar"><span>📅 Upcoming Events</span></div>`;
    dateBookEvents.forEach(ev => {
      html += `<div class="list-item"><span>📌 ${ev.date}</span><span>${ev.title}</span></div>`;
    });
    html += `<div style="margin-top:8px;">
      <input type="date" id="newDate" style="width:48%;">
      <input type="text" id="newTitle" placeholder="Event title" style="width:48%;">
      <button class="palm-btn" id="addEventBtn" style="margin-top:4px; width:100%;">+ Add Event</button>
    </div>`;
    html += `<button class="palm-btn" onclick="window.switchApp('home')" style="margin-top:6px;">← Back</button>`;
    appScreen.innerHTML = html;

    document.getElementById('addEventBtn')?.addEventListener('click', () => {
      const date = document.getElementById('newDate').value;
      const title = document.getElementById('newTitle').value;
      if (date && title) {
        dateBookEvents.push({ date, title });
        renderAppScreen();
      }
    });
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);
  canvas.addEventListener('touchstart', startDrawing, {passive: false});
  canvas.addEventListener('touchmove', draw, {passive: false});
  canvas.addEventListener('touchend', stopDrawing);
  canvas.addEventListener('touchcancel', stopDrawing);

  document.getElementById('clearGraffitiBtn').addEventListener('click', () => {
    graffitiStroke = [];
    drawGraffitiCanvas();
  });

  document.getElementById('enterGraffitiBtn').addEventListener('click', () => {
    if (graffitiStroke.length > 0) processGraffitiInput();
  });

  document.getElementById('homeButton').addEventListener('click', () => switchApp('home'));

  window.switchApp = switchApp;
  switchApp('home');
  drawGraffitiCanvas();
})();