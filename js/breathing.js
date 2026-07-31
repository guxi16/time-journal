var Breathing = (function() {
  var running = false;
  var phase = 0;
  var cycle = 0;
  var maxCycles = 5;
  var phases = [
    { name: 'in', label: '\u5438\u6C14', duration: 4000, scale: 1.6 },
    { name: 'hold', label: '\u5C4F\u6C14', duration: 7000, scale: 1.6 },
    { name: 'out', label: '\u547C\u6C14', duration: 8000, scale: 1.0 }
  ];
  var timer = null;

  function show() {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="breath-back">← 返回</button>' +
      '<div class="modal-title">' + I18N.t('breathing_title') + '</div>' +
      '<div class="breathing-container">' +
      '<div class="breathing-circle" id="breath-circle">' +
      '<span class="breathing-label" id="breath-label">准备</span>' +
      '</div>' +
      '<div class="breathing-count" id="breath-count">第 0 / ' + maxCycles + ' 轮</div>' +
      '</div>' +
      '<div style="text-align:center;margin-top:12px">' +
      '<button class="btn-secondary" id="breath-start">开始</button>' +
      '<button class="btn-secondary" id="breath-stop" style="display:none">停止</button>' +
      '</div>' +
      '</div>';

    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';

    document.getElementById('breath-back').onclick = Inquiry.close;
    document.getElementById('breath-start').onclick = start;
    document.getElementById('breath-stop').onclick = stop;
  }

  function start() {
    running = true;
    phase = 0;
    cycle = 0;
    document.getElementById('breath-start').style.display = 'none';
    document.getElementById('breath-stop').style.display = 'inline-block';
    document.getElementById('breath-count').textContent = '第 1 / ' + maxCycles + ' 轮';
    runPhase();
  }

  function runPhase() {
    if (!running) return;
    var p = phases[phase];
    var circle = document.getElementById('breath-circle');
    var label = document.getElementById('breath-label');
    if (!circle || !label) return;

    var labelText = p.label;
    if (p.name === 'in') labelText = I18N.t('breathing_in');
    else if (p.name === 'hold') labelText = I18N.t('breathing_hold');
    else if (p.name === 'out') labelText = I18N.t('breathing_out');

    label.textContent = labelText;
    circle.style.transform = 'scale(' + p.scale + ')';
    circle.style.transition = 'transform ' + (p.duration / 1000) + 's linear';
    circle.style.borderColor = p.name === 'in' ? 'var(--accent-blue)' :
                               p.name === 'hold' ? 'var(--accent-purple)' :
                               'var(--accent-green)';

    timer = setTimeout(function() {
      phase++;
      if (phase >= 3) {
        phase = 0;
        cycle++;
        document.getElementById('breath-count').textContent = '第 ' + (cycle + 1) + ' / ' + maxCycles + ' 轮';
        if (cycle >= maxCycles) {
          stop();
          document.getElementById('breath-label').textContent = '完成';
          return;
        }
      }
      runPhase();
    }, p.duration);
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    document.getElementById('breath-start').style.display = 'inline-block';
    document.getElementById('breath-stop').style.display = 'none';
  }

  return { show: show };
})();
