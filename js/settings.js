var Settings = (function() {
  function init() {
    var s = Storage.getSettings();
    document.getElementById('set-sleep-target').value = s.sleepTarget;
    document.getElementById('set-wake-target').value = s.wakeTarget;
    document.getElementById('set-inquiry-interval').value = s.inquiryInterval;
    document.getElementById('set-day-start').value = s.dayStart;
    document.getElementById('set-shower-start').value = s.showerStart;
    document.getElementById('set-shower-end').value = s.showerEnd;
    document.getElementById('set-style-mode').value = s.styleMode;
    document.getElementById('set-inspo-interval').value = s.inspoInterval;
    document.getElementById('set-inspo-start').value = s.inspoStart || '22:00';
    if (s.statusMode) document.getElementById('set-status-mode').value = s.statusMode;

    var styleOpts = document.querySelectorAll('#set-style-mode option');
    if (styleOpts.length && typeof SVG !== 'undefined') {
      styleOpts[0].innerHTML = '<span style="display:inline-flex;width:14px;height:14px;vertical-align:middle;margin-right:4px">' + SVG.leaf + '</span>温柔';
      styleOpts[1].innerHTML = '<span style="display:inline-flex;width:14px;height:14px;vertical-align:middle;margin-right:4px">' + SVG.shield + '</span>严格';
      styleOpts[2].innerHTML = '<span style="display:inline-flex;width:14px;height:14px;vertical-align:middle;margin-right:4px">' + SVG.spark + '</span>搞笑';
      styleOpts[3].innerHTML = '<span style="display:inline-flex;width:14px;height:14px;vertical-align:middle;margin-right:4px">' + SVG.star + '</span>简约';
    }
    var statusOpts = document.querySelectorAll('#set-status-mode option');
    if (statusOpts.length && typeof SVG !== 'undefined') {
      statusOpts[0].innerHTML = '<span style="display:inline-flex;width:14px;height:14px;vertical-align:middle;margin-right:4px">' + SVG.bed + '</span>休息模式（频繁提醒）';
      statusOpts[1].innerHTML = '<span style="display:inline-flex;width:14px;height:14px;vertical-align:middle;margin-right:4px">' + SVG.briefcase + '</span>工作模式（仅午晚）';
    }

    var usageEl = document.getElementById('storage-usage');
    if (usageEl && typeof Storage.getUsageMB === 'function') {
      var mb = parseFloat(Storage.getUsageMB());
      var tip = mb > 3.5 ? '（快满了，建议导出后清除数据）' : '（充足）';
      usageEl.innerHTML = '已用 ' + mb + ' MB ' + tip;
    }

    // 回填今日作息记录（手动修正）
    try {
      var todaySleep = Storage.getSleepData(1);
      var lastRecord = todaySleep[todaySleep.length - 1];
      if (lastRecord) {
        var bedEl = document.getElementById('set-record-bed');
        var wakeEl = document.getElementById('set-record-wake');
        if (bedEl && lastRecord.bedTime) bedEl.value = lastRecord.bedTime;
        if (wakeEl && lastRecord.wakeTime) wakeEl.value = lastRecord.wakeTime;
      }
    } catch(e) {}
  }

  function saveRoutine() {
    // 兼容设置页(set-record-*)和回顾页(rv-record-*)两个入口
    var bedEl = document.getElementById('set-record-bed') || document.getElementById('rv-record-bed');
    var wakeEl = document.getElementById('set-record-wake') || document.getElementById('rv-record-wake');
    if (!bedEl) return;
    var bed = bedEl.value;
    var wake = wakeEl ? wakeEl.value : '';
    if (!bed && !wake) { alert('请至少填一个时间'); return; }
    Storage.saveSleepData({ date: Storage.today(), bedTime: bed || '', wakeTime: wake || '' });
    alert('作息记录已保存 ✅');
    if (window.App && App.notifyDataChanged) App.notifyDataChanged();
  }

  function bindEvents() {
    var inputs = ['set-sleep-target','set-wake-target','set-inquiry-interval',
      'set-day-start','set-shower-start','set-shower-end','set-style-mode','set-inspo-time','set-inspo-start','set-status-mode'];
    inputs.forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', saveAll);
    });

    document.getElementById('btn-export').addEventListener('click', function() {
      var data = Storage.exportData();
      var blob = new Blob([data], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'time-journal-backup-' + Storage.realToday() + '.json';
      a.click();
    });

    document.getElementById('btn-clear').addEventListener('click', function() {
      if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
        Storage.clearAll();
        alert('数据已清除。页面将刷新。');
        location.reload();
      }
    });

    var saveRoutineBtn = document.getElementById('btn-save-routine');
    if (saveRoutineBtn) saveRoutineBtn.addEventListener('click', saveRoutine);

    var rvSaveBtn = document.getElementById('btn-rv-save-routine');
    if (rvSaveBtn) rvSaveBtn.addEventListener('click', saveRoutine);
  }

  function saveAll() {
    Storage.saveSettings({
      sleepTarget: document.getElementById('set-sleep-target').value,
      wakeTarget: document.getElementById('set-wake-target').value,
      inquiryInterval: parseInt(document.getElementById('set-inquiry-interval').value),
      dayStart: document.getElementById('set-day-start').value,
      showerStart: document.getElementById('set-shower-start').value,
      showerEnd: document.getElementById('set-shower-end').value,
      styleMode: document.getElementById('set-style-mode').value,
      inspoInterval: parseInt(document.getElementById('set-inspo-interval').value),
      inspoStart: document.getElementById('set-inspo-start').value || '22:00',
      statusMode: document.getElementById('set-status-mode').value
    });

    var mode = document.getElementById('set-style-mode').value;
    I18N.setMode(mode);
    Storage.updateDayStart(parseInt(document.getElementById('set-day-start').value));

    Scheduler.scheduleAll();
    App.refreshTimeline();
  }

  return {
    init: init,
    bindEvents: bindEvents
  };
})();
