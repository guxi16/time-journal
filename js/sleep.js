// 作息页：睡眠/起床/午睡 记录 + 手动修正
var Sleep = (function() {
  function init() {
    renderToday();
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

  function renderToday() {
    var t = getToday();
    setVal('sleep-bed-value', t.bedTime);
    setVal('sleep-wake-value', t.wakeTime);
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

  function bindEvents() {
    var bedBtn = document.getElementById('btn-sleep-now');
    if (bedBtn) bedBtn.addEventListener('click', function() {
      Storage.patchSleepData(Storage.today(), { bedTime: nowTime() });
      renderToday();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('已记录入睡 ' + nowTime() + ' 🌙');
    });

    var wakeBtn = document.getElementById('btn-wake-now');
    if (wakeBtn) wakeBtn.addEventListener('click', function() {
      Storage.patchSleepData(Storage.today(), { wakeTime: nowTime() });
      renderToday();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('已记录起床 ' + nowTime() + ' ☀️');
    });

    var editBtn = document.getElementById('btn-sleep-edit');
    if (editBtn) editBtn.addEventListener('click', showEditModal);
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
      var patch = {
        bedTime: document.getElementById('sleep-edit-bed').value || '',
        wakeTime: document.getElementById('sleep-edit-wake').value || ''
      };
      Storage.patchSleepData(Storage.today(), patch);
      Inquiry.close();
      renderToday();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('作息已修正 ✓');
    };
  }

  return { init: init, renderToday: renderToday };
})();

if (typeof window !== 'undefined') window.Sleep = Sleep;
