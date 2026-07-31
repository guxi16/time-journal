var Chart = (function() {
  function draw(days) {
    var canvas = document.getElementById('sleep-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.parentElement.clientWidth - 32;
    var h = 220;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    var data = Storage.getSleepData(days);
    if (data.length < 2) {
      ctx.fillStyle = '#666';
      ctx.font = '13px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('数据积累中，再记录几天吧', w/2, h/2);
      return;
    }

    var pad = { top: 20, right: 16, bottom: 30, left: 42 };
    var plotW = w - pad.left - pad.right;
    var plotH = h - pad.top - pad.bottom;

    ctx.fillStyle = '#f8fbf8';
    ctx.fillRect(0, 0, w, h);

    var timeToY = function(t) {
      var parts = t.split(':');
      var val = parseInt(parts[0]) + parseInt(parts[1]) / 60;
      var minY = 22, maxY = 10;
      if (val < maxY) val += 24;
      if (minY < maxY) minY -= 24;
      return pad.top + plotH * (1 - (val - minY) / (maxY - minY + 24));
    };

    var yLabels = ['22:00', '00:00', '02:00', '04:00', '06:00', '08:00', '10:00'];
    ctx.strokeStyle = '#e0e8e0';
    ctx.fillStyle = '#666';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    yLabels.forEach(function(label) {
      var y = timeToY(label);
      if (y >= pad.top && y <= pad.top + plotH) {
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        ctx.fillText(label, pad.left - 4, y + 3);
      }
    });

    var step = Math.ceil(data.length / 7);
    ctx.textAlign = 'center';
    data.forEach(function(d, i) {
      if (i % step === 0) {
        var x = pad.left + (i / (data.length - 1)) * plotW;
        ctx.fillStyle = '#666';
        ctx.fillText(d.date.slice(5), x, h - 4);
      }
    });

    function drawLine(values, color, dashed) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (dashed) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      values.forEach(function(v, i) {
        var x = pad.left + (i / (data.length - 1)) * plotW;
        var y = timeToY(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    var bedTimes = data.map(function(d) { return d.bedTime || '01:00'; });
    var wakeTimes = data.map(function(d) { return d.wakeTime || '09:00'; });
    var targets = data.map(function() { return Storage.getSettings().sleepTarget; });

    drawLine(bedTimes, '#4a90d9', false);
    drawLine(wakeTimes, '#4caf84', false);
    drawLine(targets, '#e05555', true);

    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillStyle = '#4a90d9';
    ctx.textAlign = 'left';
    ctx.fillText('● 入睡', 12, 16);
    ctx.fillStyle = '#4caf84';
    ctx.fillText('● 起床', 70, 16);
    ctx.fillStyle = '#e05555';
    ctx.fillText('--- 目标', 128, 16);
  }

  return { draw: draw };
})();
