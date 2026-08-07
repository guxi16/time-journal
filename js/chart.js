var Chart = (function() {
  // 入睡图：20:00 ~ 06:00（跨天）
  // 起床图：06:00 ~ 16:00
  function draw(days) {
    var canvas = document.getElementById('sleep-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.parentElement.clientWidth - 32;
    var h = 440; // 两个子图叠加：各 198px (160绘图+22顶+26底) + 26间隙 + 18底部余量
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

      // 时间转归一化小时（跨天：凌晨 <12 自动 +24，与自适应范围一致）
      // Y 轴方向：时间小（早）在顶，时间大（晚）在底（符合人直觉：时间向上走）
      var timeToY = function(t) {
        var parts = String(t).split(':');
        var val = parseInt(parts[0]) + parseInt(parts[1]) / 60;
        var minY = spec.minY, maxY = spec.maxY;
        if (maxY > 24 && val < 12) val += 24;  // 跨天区间：凌晨数据往后挪
        if (minY > maxY) { minY -= 24; }
        return base + plotH * (val - minY) / (maxY - minY);
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

      // 折线 + 数据点圆点标记（业界标准：点多了也分得清）
      function drawLine(values, color, dashed) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        if (dashed) ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.beginPath();
        var pts = [];
        values.forEach(function(v, i) {
          if (!v) return;
          var x = pad.left + (i / (data.length - 1)) * plotW;
          var y = timeToY(v);
          pts.push({ x: x, y: y });
          if (pts.length === 1) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
        // 数据点：实线画实心圆，虚线（目标）画空心圆
        pts.forEach(function(p) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          if (dashed) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else {
            ctx.fillStyle = color;
            ctx.fill();
          }
        });
      }
      spec.lines.forEach(function(ln) { drawLine(ln.values, ln.color, ln.dashed); });

      // 图例（子图右上角，右对齐——避免和左侧标题重叠）
      ctx.font = '11px -apple-system, sans-serif';
      var legendItems = spec.lines.map(function(ln) {
        return { text: (ln.dashed ? '- - ' : '● ') + ln.label, color: ln.color };
      });
      var totalW = 0;
      legendItems.forEach(function(li) { totalW += ctx.measureText(li.text).width + 16; });
      var lx = w - pad.right - totalW;
      legendItems.forEach(function(li) {
        ctx.fillStyle = li.color;
        ctx.textAlign = 'left';
        ctx.fillText(li.text, lx, offsetY + 15);
        lx += ctx.measureText(li.text).width + 16;
      });
    }

    var settings = Storage.getSettings();
    var bedTimes = data.map(function(d) { return d.bedTime || ''; });
    var wakeTimes = data.map(function(d) { return d.wakeTime || ''; });
    var bedTargets = data.map(function() { return settings.sleepTarget; });
    var wakeTargets = data.map(function() { return settings.wakeTarget; });

    // ---- 自适应 Y 轴范围（业界标准：数据波动小时放大显示，铺满图 60-70%）----
    // 时间转小时数，跨天（入睡 20:00-08:00 区间）时自动 +24 归一
    function timeToHours(t, shiftDay) {
      var p = String(t || '').split(':');
      if (p.length < 2) return null;
      var h = parseInt(p[0]) + parseInt(p[1]) / 60;
      if (shiftDay && h < 12) h += 24;  // 跨天区间：凌晨(0-12点)视为当天晚些
      return h;
    }
    // 生成 Y 轴刻度（4-5 个，均匀间隔、取整小时、两端留白）
    function makeLabels(minH, maxH) {
      var labels = [];
      var span = maxH - minH;
      var step = span > 10 ? 3 : span > 5 ? 2 : 1;
      for (var h = Math.ceil(minH); h <= maxH + 0.01; h += step) {
        var v = h % 24;
        var s = ('0' + Math.floor(v)).slice(-2) + ':00';
        labels.push(s);
      }
      if (labels.length < 3) { labels = []; for (var i = 0; i <= 4; i++) { var v2 = (Math.ceil(minH) + i) % 24; labels.push(('0' + v2).slice(-2) + ':00'); } }
      return labels;
    }
    // 计算自适应范围：实际数据(跨天归一) + 目标线 + 留白1小时 + 底线
    function autoRange(values, targets, isCrossDay, floorHour, ceilHour) {
      var hrs = [];
      values.concat(targets).forEach(function(v) {
        if (!v) return;
        var h = timeToHours(v, isCrossDay);
        if (h != null) hrs.push(h);
      });
      var minH, maxH;
      if (hrs.length === 0) { minH = floorHour; maxH = ceilHour; }
      else {
        minH = Math.min.apply(null, hrs) - 1;
        maxH = Math.max.apply(null, hrs) + 1;
        var span = maxH - minH;
        if (span < 4) {  // 数据太集中（如都是 1:30±）→ 至少 4 小时跨度，放中间
          var mid = (minH + maxH) / 2;
          minH = mid - 2; maxH = mid + 2;
        }
      }
      // 底线限制
      if (isCrossDay) {
        if (minH < floorHour) minH = floorHour;  // 入睡不早于 18:00
        if (maxH > 30) maxH = 30;                // 入睡不晚于 06:00(次日,即30h)
      } else {
        if (minH < floorHour) minH = floorHour;  // 起床不早于 06:00
        if (maxH > ceilHour) maxH = ceilHour;    // 起床不晚于 16:00
      }
      if (maxH - minH < 2) { minH = Math.floor(minH); maxH = minH + 2; }
      return { minH: minH, maxH: maxH };
    }

    // 入睡子图：跨天（20点-次日8点）
    var bedRange = autoRange(bedTimes, bedTargets, true, 18, 30);
    drawSub(ctx, 0, {
      title: '🌙 入睡',
      minY: bedRange.minH, maxY: bedRange.maxH,
      yLabels: makeLabels(bedRange.minH, bedRange.maxH),
      lines: [
        { values: bedTimes, color: '#4a90d9', dashed: false, label: '实际入睡' },
        { values: bedTargets, color: '#e05555', dashed: true, label: '目标 ' + settings.sleepTarget }
      ]
    });

    // 起床子图：白天（6点-16点）
    var wakeRange = autoRange(wakeTimes, wakeTargets, false, 6, 16);
    drawSub(ctx, subH + pad.top + pad.bottom + gap, {
      title: '☀️ 起床',
      minY: wakeRange.minH, maxY: wakeRange.maxH,
      yLabels: makeLabels(wakeRange.minH, wakeRange.maxH),
      lines: [
        { values: wakeTimes, color: '#4caf84', dashed: false, label: '实际起床' },
        { values: wakeTargets, color: '#e05555', dashed: true, label: '目标 ' + settings.wakeTarget }
      ]
    });
  }

  return { draw: draw };
})();
