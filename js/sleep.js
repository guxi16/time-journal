// 作息页：睡眠/起床 记录 + 手动修正 + 时长颜色 + 洗澡 + 历史
var Sleep = (function() {
  function init() {
    renderToday();
    renderHistory();
    bindEvents();
  }

  function getToday() {
    var data = Storage.getSleepData(1);
    var today = null;
    for (var i = data.length - 1; i >= 0; i--) {
      if (data[i].date === Storage.today()) { today = data[i]; break; }
    }
    if (!today) today = { date: Storage.today(), bedTime: '', wakeTime: '' };
    return today;
  }

  function nowTime() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  // 同时给 bedTime/wakeTime 一个精确时间戳（duration 算法用）
  function nowRecord() {
    return { time: nowTime(), at: Date.now() };
  }

  // 手动修改时把字符串时间转成一个"今天那个时点"的本地时间戳
  // 上午时间（< 12 点）算今天；晚上时间（>= 12 点）算昨天（避免跨天歧义）
  function timeStrToTodayAt(timeStr) {
    if (!timeStr) return Date.now();
    var parts = timeStr.split(':');
    var h = parseInt(parts[0]), m = parseInt(parts[1]) || 0;
    var d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime();
  }

  function renderToday() {
    var t = getToday();
    setVal('sleep-bed-value', t.bedTime);
    setVal('sleep-wake-value', t.wakeTime);
    renderDuration(t);
    renderShower();
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    if (val) {
      el.textContent = val;
      el.classList.remove('empty');
    } else {
      el.textContent = '--:--';
      el.classList.add('empty');
    }
  }

  // 睡眠时长 + 绿/黄/红（跨天计算：入睡>12点按前一天）
  function renderDuration(t) {
    var el = document.getElementById('sleep-duration');
    if (!el) return;
    if (!t.bedTime || !t.wakeTime) {
      el.style.display = 'none';
      return;
    }

    // 异常 1：字符串时间完全相同（用户重复点击 / 没正确入睡）
    if (t.bedTime === t.wakeTime) {
      el.style.display = 'block';
      el.innerHTML = '<span class="sleep-dur-dot" style="background:#c9847a"></span>' +
        '<span class="sleep-dur-text" style="color:#c97a6a">入睡和起床时间一样，请手动修正</span>';
      el.style.background = 'rgba(201,132,122,0.12)';
      return;
    }

    // 字符串解析（按"12 点后算前一天"启发式）
    var bed = t.bedTime.split(':');
    var wake = t.wakeTime.split(':');
    var bedMin = parseInt(bed[0]) * 60 + parseInt(bed[1]);
    var wakeMin = parseInt(wake[0]) * 60 + parseInt(wake[1]);
    if (bedMin >= 12 * 60) bedMin -= 24 * 60;
    var durMin = wakeMin - bedMin;
    if (durMin < 0) durMin += 24 * 60;

    // 异常 2：超过 20 小时 或 ≤ 0（起卧时间不合理）
    if (durMin <= 0 || durMin > 20 * 60) {
      el.style.display = 'block';
      el.innerHTML = '<span class="sleep-dur-dot" style="background:#c9847a"></span>' +
        '<span class="sleep-dur-text" style="color:#c97a6a">起卧时间不合理，请手动修正</span>';
      el.style.background = 'rgba(201,132,122,0.12)';
      return;
    }

    var hours = Math.floor(durMin / 60);
    var mins = Math.round(durMin % 60);
    var durStr = hours + ' 小时 ' + ('0' + mins).slice(-2) + ' 分';

    var targetH = 8;
    var color = 'green';
    var label = '睡够了';
    if (durMin < targetH * 60 - 90) { color = 'red'; label = '睡太少了'; }
    else if (durMin < targetH * 60 + 30) { color = 'yellow'; label = '还行'; }

    var dot = color === 'green' ? '#5a8a6a' : color === 'yellow' ? '#c9a96e' : '#c9847a';
    var bg = color === 'green' ? 'var(--accent-soft)' : color === 'yellow' ? 'rgba(201,169,110,0.15)' : 'rgba(201,132,122,0.12)';
    var text = color === 'green' ? 'var(--accent)' : color === 'yellow' ? '#8b6331' : '#c97a6a';
    el.style.display = 'block';
    el.innerHTML = '<span class="sleep-dur-dot" style="background:' + dot + '"></span>' +
      '<span class="sleep-dur-text" style="color:' + text + '">睡眠 ' + durStr + ' · ' + label + '</span>';
    el.style.background = bg;
  }

  // 今天洗澡（放宽筛选：category 或 title/content 含"洗澡"）
  function renderShower() {
    var el = document.getElementById('sleep-shower');
    if (!el) return;
    try {
      var todayRecords = Storage.getRecords(Storage.today());
      var showers = todayRecords.filter(function(r) {
        var blob = ((r.category || '') + ' ' + (r.smartCategory || '') + ' ' + (r.title || '') + ' ' + (r.content || ''));
        return blob.indexOf('洗澡') !== -1 || blob.indexOf('淋浴') !== -1 || blob.indexOf('洗了澡') !== -1 || blob.indexOf('沐浴') !== -1;
      });
      if (showers.length === 0) {
        el.style.display = 'none';
        return;
      }
      var last = showers[0];
      var d = new Date(last.timestamp);
      var hm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      el.style.display = 'block';
      el.innerHTML = '<span style="font-size:12px;color:var(--accent)">🚿 今天已洗澡（' + hm + '）</span>';
    } catch(e) {
      el.style.display = 'none';
    }
  }

  // 睡眠历史列表（最近 14 天）
  function renderHistory() {
    var el = document.getElementById('sleep-history');
    if (!el) return;
    var list = Storage.getSleepData(14).reverse();
    if (list.length === 0) {
      el.innerHTML = '<div class="empty-state" style="padding:30px 20px"><div class="empty-text">还没有睡眠记录</div><div class="empty-hint">每晚点「我睡了」，早上点「我醒了」</div></div>';
      return;
    }
    var html = '';
    list.forEach(function(d) {
      if (!d.bedTime && !d.wakeTime) return;
      var dateLabel = d.date.slice(5);
      var bed = d.bedTime || '--:--';
      var wake = d.wakeTime || '--:--';
      var dur = '';
      if (typeof d.bedAt === 'number' && typeof d.wakeAt === 'number') {
        var dm = (d.wakeAt - d.bedAt) / 60000;
        if (dm > 0 && dm <= 20 * 60) {
          dur = Math.floor(dm / 60) + 'h' + ('0' + Math.round(dm) % 60).slice(-2);
        }
      } else if (d.bedTime && d.wakeTime) {
        var b = d.bedTime.split(':'), w = d.wakeTime.split(':');
        var bm = parseInt(b[0]) * 60 + parseInt(b[1]);
        var wm = parseInt(w[0]) * 60 + parseInt(w[1]);
        if (bm >= 12 * 60) bm -= 24 * 60;
        var dm2 = wm - bm;
        if (dm2 < 0) dm2 += 24 * 60;
        if (dm2 > 0 && dm2 <= 20 * 60) {
          dur = Math.floor(dm2 / 60) + 'h' + ('0' + (dm2 % 60)).slice(-2);
        }
      }
      html += '<div class="sleep-hist-item">' +
        '<span class="sleep-hist-date">' + dateLabel + '</span>' +
        '<span class="sleep-hist-bed">' + bed + '</span>' +
        '<span class="sleep-hist-wake">' + wake + '</span>' +
        (dur ? '<span class="sleep-hist-dur">' + dur + '</span>' : '<span class="sleep-hist-dur" style="color:var(--text-tertiary)">--</span>') +
        '</div>';
    });
    el.innerHTML = html;
  }

  function bindEvents() {
    var bedBtn = document.getElementById('btn-sleep-now');
    if (bedBtn) bedBtn.addEventListener('click', function() {
      var r = nowRecord();
      Storage.patchSleepData(Storage.today(), { bedTime: r.time, bedAt: r.at });
      renderToday();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('已记录入睡 ' + r.time + ' 🌙');
    });

    var wakeBtn = document.getElementById('btn-wake-now');
    if (wakeBtn) wakeBtn.addEventListener('click', function() {
      var r = nowRecord();
      Storage.patchSleepData(Storage.today(), { wakeTime: r.time, wakeAt: r.at });
      renderToday();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('已记录起床 ' + r.time + ' ☀️');
    });

    var editBtn = document.getElementById('btn-sleep-edit');
    if (editBtn) editBtn.addEventListener('click', showEditModal);

    // 洗了澡按钮：点一下 → 记一条洗澡记录
    var showerBtn = document.getElementById('btn-shower-now');
    if (showerBtn) showerBtn.addEventListener('click', function() {
      Storage.saveRecord({ type: 'preset', category: '洗澡', title: '洗澡', content: '', smartCategory: '洗澡' });
      renderToday();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('已记录洗澡 🚿');
    });
  }

  // 手动修正弹窗：改当天的入睡/起床/午睡
  function showEditModal() {
    var t = getToday();
    var html = '<div class="modal-content modal-content-compact" style="position:relative">' +
      '<button class="btn-back" id="sleep-edit-back">← 返回</button>' +
      '<div class="modal-title" style="font-size:18px">手动改时间</div>' +
      '<div class="modal-text" style="font-size:12px;margin-bottom:12px">自动记的可能不准，这里可以修正。只改今天，不影响历史。</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px">' +
      '<div><label style="font-size:11px;color:var(--text-tertiary);display:block;margin-bottom:4px">昨晚入睡</label>' +
      '<input type="time" class="text-input" id="sleep-edit-bed" value="' + (t.bedTime || '') + '"></div>' +
      '<div><label style="font-size:11px;color:var(--text-tertiary);display:block;margin-bottom:4px">今早起床</label>' +
      '<input type="time" class="text-input" id="sleep-edit-wake" value="' + (t.wakeTime || '') + '"></div>' +
      '</div>' +
      '<button class="btn-primary" id="sleep-edit-save" style="margin-top:12px">保存修改</button>' +
      '</div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('sleep-edit-back').onclick = function() {
      Inquiry.close();
    };

    document.getElementById('sleep-edit-save').onclick = function() {
      var bedStr = document.getElementById('sleep-edit-bed').value || '';
      var wakeStr = document.getElementById('sleep-edit-wake').value || '';
      var patch = {};
      if (bedStr) { patch.bedTime = bedStr; patch.bedAt = timeStrToTodayAt(bedStr); }
      if (wakeStr) { patch.wakeTime = wakeStr; patch.wakeAt = timeStrToTodayAt(wakeStr); }
      Storage.patchSleepData(Storage.today(), patch);
      Inquiry.close();
      renderToday();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('作息已修正 ✓');
    };
  }

  return { init: init, renderToday: renderToday, renderHistory: renderHistory };
})();

if (typeof window !== 'undefined') window.Sleep = Sleep;
