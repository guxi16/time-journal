var Review = (function() {
  function escapeHtmlSafe(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function getReviewDateStr(d) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  // 回顾要展示的记录：凌晨时段（还没到新一天的边界）→ 昨天 + 今天凌晨，否则只看今天
  function getReviewRecords() {
    var now = new Date();
    var h = now.getHours();
    var settings = Storage.getSettings() || {};
    var dayStartH = parseInt(settings.dayStart) || 0;
    if (h < 4 || h < dayStartH) {
      var yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return Storage.getRecords(Storage.today()).concat(Storage.getRecords(getReviewDateStr(yesterday)));
    }
    return Storage.getRecords(Storage.today());
  }

  function isEarlyHour() {
    var h = new Date().getHours();
    var dayStartH = parseInt((Storage.getSettings() || {}).dayStart) || 0;
    return (h < 4 || h < dayStartH);
  }

  function catEmoji(cat) {
    var m = { '画画':'🎨','创作':'🎨','游戏':'🎮','看视频':'📺','写代码':'💻','学习':'📚','刷手机':'📱','购物':'🛒','家务':'🧹','吃饭':'🍜','社交':'💬','洗澡':'🚿','灵感':'💡','情绪':'💭','音乐':'🎵','动漫':'🌸','休息':'🛋️','运动':'🏃','娱乐':'🎬','工作':'💼','其他':'📌' };
    return m[cat] || '📌';
  }

  // 今日小结卡片：一眼看到今天做了啥（记录数 + 分类统计）
  function buildSummary(records) {
    var count = records.length;
    if (count === 0) return '';
    var catCount = {};
    records.forEach(function(r) {
      var cat = r.smartCategory || r.category || '其他';
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    var top = Object.keys(catCount).sort(function(a, b) { return catCount[b] - catCount[a]; }).slice(0, 3);
    var parts = top.map(function(c) { return catEmoji(c) + ' ' + c + ' ×' + catCount[c]; });
    return '<div class="review-summary" style="background:var(--accent-soft);border:1px solid var(--border-glow);border-radius:12px;padding:12px 14px;margin-bottom:12px">' +
      '<div style="font-size:13px;font-weight:500;color:var(--accent);margin-bottom:4px">✨ 今日小结</div>' +
      '<div style="font-size:13px">今天记了 <strong>' + count + '</strong> 件事：' + parts.join('、') + '</div>' +
      '</div>';
  }

  function show() {
    var records = getReviewRecords();
    var content = document.getElementById('review-content');
    var actions = document.getElementById('review-actions');
    var empty = document.getElementById('review-empty');
    var html = '';

    if (records.length > 0) {
      empty.style.display = 'none';
      html += buildSummary(records);
      html += '<div class="review-timeline">';
      html += '<div class="modal-text">' + I18N.t('review_has') + '</div>';
      html += '<div class="section-title">' + (isEarlyHour() ? '你的一天' : '今天的时间线') + '</div>';
      records.forEach(function(r) {
        var time = new Date(r.timestamp);
        var timeStr = ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2);
        var content = r.title || r.content || r.category || '';
        html += '<div class="record-item"><span class="record-time">' + timeStr + '</span>' +
          '<span class="record-icon">' + getIcon(r) + '</span>' +
          '<span class="record-content"><span class="record-title">' + content + '</span>';
        if (r.detail) html += '<span class="record-detail">' + r.detail + '</span>';
        if (r.rawData && r.rawData.startsWith('data:')) {
          html += '<img class="record-image" src="' + r.rawData + '">';
        }
        if (r.type === 'link' && r.detail) {
          html += '<a class="record-link" href="' + r.detail + '" target="_blank">' + r.detail + '</a>';
        }
        html += '</span></div>';
      });
      html += '</div>';

      html += '<div class="section-title">今晚为什么还没睡？</div>';

      // 今天已记录的原因（可删除）
      var todayReasons = (Storage.getLateNightReasons ? Storage.getLateNightReasons(1) : []).filter(function(r) { return r.date === Storage.today(); });
      if (todayReasons.length > 0) {
        var todayR = todayReasons[todayReasons.length - 1];
        html += '<div class="late-recorded" id="late-recorded">' +
          '<span>今天已记录：</span><strong>' + escapeHtmlSafe(todayR.reason || todayR.content) + '</strong>' +
          '<button class="late-del" id="late-recorded-del" title="删除今天的原因">✕</button>' +
          '</div>';
      }

      html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="reason-btns">';
      var reasons = ['\uD83D\uDCA1\u7075\u611F\u521B\u4F5C', '\uD83C\uDFAE\u6E38\u620F\u89C6\u9891', '\uD83D\uDE30\u7126\u8651\u7A7A\u865A', '\uD83E\uDD71\u4E0D\u56F0', '\u270D\uFE0F\u5176\u4ED6'];
      reasons.forEach(function(r) {
        html += '<button class="chart-btn reason-btn" data-reason="' + r + '">' + r + '</button>';
      });
      html += '</div>';
      html += '<div style="display:none" id="reason-extra"><input class="text-input" id="reason-text" placeholder="补充说明..."><button class="btn-primary" id="reason-save" style="margin-top:6px">保存</button></div>';

      if (new Date().getHours() >= 1) {
        html += '<div class="penalty-banner" style="margin-top:12px">' + I18N.t('treehole_late') + '</div>';
      }

      content.innerHTML = html;
      actions.style.display = 'block';

      // 删除今天已记录的原因
      var recordedDel = document.getElementById('late-recorded-del');
      if (recordedDel) {
        recordedDel.onclick = function() {
          Storage.deleteLateNightReason(Storage.today());
          var block = document.getElementById('late-recorded');
          if (block) block.remove();
          window.notifyDataChanged && window.notifyDataChanged();
          if (typeof notifyTiny === 'function') notifyTiny('已删除今天的原因');
        };
      }

      document.querySelectorAll('.reason-btn').forEach(function(btn) {
        btn.onclick = function() {
          var reason = btn.dataset.reason;
          Storage.saveLateNightReason(reason);
          // 保存后刷新回顾页，显示"今天已记录"
          Review.show();
          document.getElementById('reason-extra').style.display = 'block';
          document.getElementById('reason-save').onclick = function() {
            var extra = document.getElementById('reason-text').value;
            if (extra) Storage.saveRecord({ type: 'preset', category: '熬夜原因', content: reason + ': ' + extra });
            document.getElementById('reason-extra').style.display = 'none';
            Review.show();
          };
        };
      });
    } else {
      empty.style.display = 'block';
      // actions 保留显示（"还不想睡"+灵感管理始终可见，不看有没有记录）
      content.innerHTML = '<div class="review-empty">' + I18N.t('review_empty') + '</div>';
    }
    // 渲染由 App.switchPage('review') 触发（renderReviewPage），这里不切页避免递归
  }

  function getIcon(rec) {
    var icons = {
      '画画': '\uD83C\uDFA8', '游戏': '\uD83C\uDFAE', '看视频': '\uD83D\uDCFA',
      '写代码': '\uD83D\uDCBB', '学习': '\uD83D\uDCDA', '刷手机': '\uD83D\uDCF1',
      '购物': '\uD83D\uDED2', '家务': '\uD83E\uDDF9', '吃饭': '\uD83C\uDF5C',
      '社交': '\uD83D\uDCAC', '洗澡': '\uD83D\uDEBF', '灵感': '\uD83D\uDCA1',
      '倒计时结束': '\u23F0', '灵感到来': '\u2728', 'photo': '\uD83D\uDCF7',
      'link': '\uD83D\uDD17', 'say': '\uD83D\uDCAC', 'preset': '\uD83D\uDCCC'
    };
    if (rec.type === 'photo') return '\uD83D\uDCF7';
    if (rec.type === 'link') return '\uD83D\uDD17';
    if (rec.type === 'say') return '\uD83D\uDCAC';
    return icons[rec.category] || '\uD83D\uDCCC';
  }

  return { show: show };
})();
