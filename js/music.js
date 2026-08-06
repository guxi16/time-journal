var Music = (function() {
  var audio = null;
  var playing = false;
  var timerId = null;
  var trackIdx = 0;

  // 真实音频（CC0 公共领域，可免费使用）：本地文件，离线也能播
  var tracks = [
    { name: '雨声', icon: '🌧️', desc: '轻柔雨声 · 安眠', file: 'assets/audio/rain-and-thunder-nature-sounds-7803.mp3' },
    { name: '海浪', icon: '🌊', desc: '海边白噪音 · 放松', file: 'assets/audio/ocean-waves.mp3' },
    { name: '鸟鸣', icon: '🐦', desc: '清晨鸟鸣 · 清醒', file: 'assets/audio/birdsong.mp3' }
  ];

  function show() {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="music-back">← 返回</button>' +
      '<div class="modal-title">🎵 音乐</div>' +
      '<div class="music-player">' +
      '<span class="music-icon" id="music-icon">🌧️</span>' +
      '<div class="music-label" id="music-label">雨声</div>' +
      '<div class="music-desc">轻柔雨声 · 安眠</div>' +
      '<div class="music-controls">' +
      '<button class="music-btn" id="music-prev">⏮</button>' +
      '<button class="music-btn" id="music-play">▶️</button>' +
      '<button class="music-btn" id="music-next">⏭</button>' +
      '</div>' +
      '<div class="music-timer" id="music-timer-row">' +
      '<button class="music-timer-btn" data-min="15">15分</button>' +
      '<button class="music-timer-btn" data-min="30">30分</button>' +
      '<button class="music-timer-btn" data-min="60">60分</button>' +
      '<button class="music-timer-btn" data-min="0">关</button>' +
      '</div>' +
      '</div></div>';

    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';

    document.getElementById('music-back').onclick = function() {
      stopNoise();
      Inquiry.close();
    };
    document.getElementById('music-play').onclick = togglePlay;
    document.getElementById('music-prev').onclick = prevTrack;
    document.getElementById('music-next').onclick = nextTrack;

    document.querySelectorAll('.music-timer-btn').forEach(function(btn) {
      btn.onclick = function() {
        var min = parseInt(btn.dataset.min);
        setTimer(min);
      };
    });

    updateTrackDisplay();
  }

  function initAudio() {
    if (!audio) {
      audio = new Audio();
      audio.loop = true;
      audio.volume = 0.5;
    }
  }

  function startNoise(track) {
    initAudio();
    if (!track) track = tracks[trackIdx];
    audio.src = track.file;
    var p = audio.play();
    if (p && p.catch) p.catch(function() { /* 移动端需用户手势,首次点击已满足 */ });
    playing = true;
  }

  function stopNoise() {
    if (audio) {
      try { audio.pause(); } catch(e) {}
    }
    playing = false;
  }

  function togglePlay() {
    if (playing) {
      stopNoise();
      document.getElementById('music-play').textContent = '▶️';
    } else {
      startNoise(tracks[trackIdx]);
      document.getElementById('music-play').textContent = '⏸️';
      updateTrackDisplay();
    }
  }

  function updateTrackDisplay() {
    var t = tracks[trackIdx];
    document.getElementById('music-icon').textContent = t.icon;
    document.getElementById('music-label').textContent = t.name;
    var descEl = document.querySelector('.music-desc');
    if (descEl) descEl.textContent = t.desc;
  }

  function prevTrack() {
    trackIdx = (trackIdx - 1 + tracks.length) % tracks.length;
    if (playing) {
      stopNoise();
      startNoise(tracks[trackIdx]);
      document.getElementById('music-play').textContent = '⏸️';
    }
    updateTrackDisplay();
  }

  function nextTrack() {
    trackIdx = (trackIdx + 1) % tracks.length;
    if (playing) {
      stopNoise();
      startNoise(tracks[trackIdx]);
      document.getElementById('music-play').textContent = '⏸️';
    }
    updateTrackDisplay();
  }

  function setTimer(min) {
    clearTimeout(timerId);
    document.querySelectorAll('.music-timer-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    if (min > 0) {
      var activeBtn = document.querySelector('.music-timer-btn[data-min="' + min + '"]');
      if (activeBtn) activeBtn.classList.add('active');
      timerId = setTimeout(function() {
        stopNoise();
        document.getElementById('music-play').textContent = '▶️';
      }, min * 60000);
    }
  }

  return { show: show };
})();
