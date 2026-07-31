var Review = (function() {
  function show() {
    var records = Storage.getRecords(Storage.today());
    var content = document.getElementById('review-content');
    var actions = document.getElementById('review-actions');
    var empty = document.getElementById('review-empty');
    var html = '';

    if (records.length > 0) {
      empty.style.display = 'none';
      html += '<div class="review-timeline">';
      html += '<div class="modal-text">' + I18N.t('review_has') + '</div>';
      html += '<div class="section-title">今天的时间线</div>';
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
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">';
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

      document.querySelectorAll('.reason-btn').forEach(function(btn) {
        btn.onclick = function() {
          var reason = btn.dataset.reason;
          Storage.saveLateNightReason(reason);
          document.getElementById('reason-extra').style.display = 'block';
          document.getElementById('reason-save').onclick = function() {
            var extra = document.getElementById('reason-text').value;
            if (extra) Storage.saveRecord({ type: 'preset', category: '熬夜原因', content: reason + ': ' + extra });
            document.getElementById('reason-extra').style.display = 'none';
            btn.style.background = 'var(--accent-blue)';
            btn.style.color = '#fff';
          };
        };
      });
    } else {
      empty.style.display = 'block';
      actions.style.display = 'none';
      content.innerHTML = '<div class="review-empty">' + I18N.t('review_empty') + '</div>';
    }

    App.switchPage('review');
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
