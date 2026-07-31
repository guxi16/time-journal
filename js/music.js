var Music = (function() {
  var audioCtx = null;
  var noiseNode = null;
  var gainNode = null;
  var playing = false;
  var timerId = null;
  var currentType = 'rain';

  function show() {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="music-back">← 返回</button>' +
      '<div class="modal-title">🎵 音乐</div>' +
      '<div class="music-player">' +
      '<span class="music-icon" id="music-icon">🎵</span>' +
      '<div class="music-label" id="music-label">雨声</div>' +
      '<div class="music-desc">白噪音助眠</div>' +
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

    document.getElementById('music-back').onclick = Inquiry.close;
    document.getElementById('music-play').onclick = togglePlay;
    document.getElementById('music-prev').onclick = prevTrack;
    document.getElementById('music-next').onclick = nextTrack;

    document.querySelectorAll('.music-timer-btn').forEach(function(btn) {
      btn.onclick = function() {
        var min = parseInt(btn.dataset.min);
        setTimer(min);
      };
    });
  }

  var tracks = [
    { name: '雨声', icon: '🌧️', desc: '温柔的雨声', type: 'rain' },
    { name: '白噪音', icon: '🌊', desc: '均匀的白噪音', type: 'white' },
    { name: '粉红噪音', icon: '🌬️', desc: '柔和低频噪音', type: 'pink' },
    { name: '森林', icon: '🌲', desc: '森林氛围音', type: 'brown' }
  ];
  var trackIdx = 0;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function startNoise(type) {
    initAudio();
    stopNoise();

    var bufferSize = 2 * audioCtx.sampleRate;
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      if (type === 'white') {
        data[i] = Math.random() * 2 - 1;
      } else if (type === 'pink') {
        var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (var j = 0; j < 7; j++) {
          var white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
        }
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + Math.random() * 2 - 1) * 0.06;
      } else if (type === 'brown') {
        var lastOut = 0;
        var white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      } else {
        var rate = type === 'rain' ? 0.85 : 0.5;
        data[i] = (Math.random() * 2 - 1) * rate;
        if (i > 1 && type === 'rain') {
          data[i] = data[i] * 0.7 + data[i-1] * 0.15 + data[i-2] * 0.15;
        }
      }
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;

    noiseNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
    playing = true;
  }

  function stopNoise() {
    if (noiseNode) {
      try { noiseNode.stop(); } catch(e) {}
      noiseNode = null;
    }
    playing = false;
  }

  function togglePlay() {
    if (playing) {
      stopNoise();
      document.getElementById('music-play').textContent = '▶️';
    } else {
      startNoise(tracks[trackIdx].type);
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
      startNoise(tracks[trackIdx].type);
      document.getElementById('music-play').textContent = '⏸️';
    }
    updateTrackDisplay();
  }

  function nextTrack() {
    trackIdx = (trackIdx + 1) % tracks.length;
    if (playing) {
      stopNoise();
      startNoise(tracks[trackIdx].type);
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
