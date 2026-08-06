var Chart = (function() {
  // 入睡图：20:00 ~ 06:00（跨天）
  // 起床图：06:00 ~ 16:00
  function draw(days) {
    var canvas = document.getElementById('sleep-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.parentElement.clientWidth - 32;
    var h = 380; // 两个子图叠加，各 ~160 + 间距，更紧凑
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
      ctx.fillText('数据积累中，再记录几天吧', w / 2, h / 2);
      return;
    }

    var pad = { top: 22, right: 16, bottom: 26, left: 44 };
    var subH = 160; // 每个子图绘图区高度（更紧凑）
    var plotW = w - pad.left - pad.right;
    var gap = 26;   // 两图间距

    // ---- 通用：画一个子图 ----
    // spec: { title, yLabels, minY, maxY, lines: [{values, color, dashed, label}], legendPos }
    function drawSub(ctx, offsetY, spec) {
      var plotH = subH;
      var base = offsetY + pad.top;

      // 背景
      ctx.fillStyle = '#f8fbf8';
      ctx.fillRect(0, offsetY, w, subH + pad.top + pad.bottom);

      // 子图标题
      ctx.fillStyle = '#2a4535';
      ctx.font = 'bold 12px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(spec.title, pad.left, offsetY + 15);

      var timeToY = function(t) {
        var parts = t.split(':');
        var val = parseInt(parts[0]) + parseInt(parts[1]) / 60;
        var minY = spec.minY, maxY = spec.maxY;
        if (val < maxY && val >= minY) val += 24;
        if (minY > maxY) minY -= 24;
        return base + plotH * (1 - (val - minY) / (maxY - minY + 24));
      };

      // Y 轴网格 + 左侧标签（精简只画 4 个,数据少时更透气）
      ctx.strokeStyle = '#e0e8e0';
      ctx.fillStyle = '#666';
      ctx.font = '10px -apple-system, sans-serif';
      spec.yLabels.forEach(function(label, idx) {
        // 只画 4 个标签:首/中/末 各留一个,均匀分布
        var total = spec.yLabels.length;
        if (total <= 4 || idx === 0 || idx === total - 1 || idx === Math.floor((total - 1) / 2) || idx === Math.floor((total - 1) * 3 / 4)) {
          var y = timeToY(label);
          if (y >= base && y <= base + plotH) {
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(w - pad.right, y);
            ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText(label, pad.left - 4, y + 3);
          }
        }
      });

      // X 轴日期
      var step = Math.max(1, Math.ceil(data.length / 7));
      ctx.textAlign = 'center';
      data.forEach(function(d, i) {
        if (i % step === 0) {
          var x = pad.left + (i / (data.length - 1)) * plotW;
          ctx.fillStyle = '#666';
          ctx.fillText(d.date.slice(5), x, offsetY + subH + pad.top + pad.bottom - 4);
        }
      });
      if (data.length > 1 && (data.length - 1) % step !== 0) {
        ctx.fillStyle = '#666';
        ctx.fillText(data[data.length - 1].date.slice(5), pad.left + plotW, offsetY + subH + pad.top + pad.bottom - 4);
      }

      // 折线
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
      spec.lines.forEach(function(ln) { drawLine(ln.values, ln.color, ln.dashed); });

      // 图例（子图右上）
      ctx.font = '11px -apple-system, sans-serif';
      var lx = pad.left;
      spec.lines.forEach(function(ln) {
        ctx.fillStyle = ln.color;
        ctx.textAlign = 'left';
        ctx.fillText((ln.dashed ? '- - ' : '● ') + ln.label, lx, offsetY + 15);
        lx += ctx.measureText((ln.dashed ? '- - ' : '● ') + ln.label).width + 16;
      });
    }

    var settings = Storage.getSettings();
    var bedTimes = data.map(function(d) { return d.bedTime || ''; });
    var wakeTimes = data.map(function(d) { return d.wakeTime || ''; });
    var bedTargets = data.map(function() { return settings.sleepTarget; });
    var wakeTargets = data.map(function() { return settings.wakeTarget; });

    // 入睡子图
    drawSub(ctx, 0, {
      title: '🌙 入睡',
      minY: 20, maxY: 8,  // 20:00 ~ 次日 08:00
      yLabels: ['20:00', '00:00', '04:00', '08:00'],
      lines: [
        { values: bedTimes, color: '#4a90d9', dashed: false, label: '实际入睡' },
        { values: bedTargets, color: '#e05555', dashed: true, label: '目标 ' + settings.sleepTarget }
      ]
    });

    // 起床子图
    drawSub(ctx, subH + pad.top + pad.bottom + gap, {
      title: '☀️ 起床',
      minY: 6, maxY: 16,  // 06:00 ~ 16:00
      yLabels: ['06:00', '10:00', '14:00', '16:00'],
      lines: [
        { values: wakeTimes, color: '#4caf84', dashed: false, label: '实际起床' },
        { values: wakeTargets, color: '#e05555', dashed: true, label: '目标 ' + settings.wakeTarget }
      ]
    });
  }

  return { draw: draw };
})();
