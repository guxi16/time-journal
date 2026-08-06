var App = (function() {
  // 全局刷新注册表：任何模块保存数据后调用 App.notifyDataChanged()，
  // 时间线/回顾等所有视图都会强制重绘（不依赖函数引用时机）
  var refreshHandlers = [];

  function onDataChanged(fn) {
    if (typeof fn === 'function') refreshHandlers.push(fn);
  }

  function showErrorToast(msg) {
    try {
      var b = document.createElement('div');
      b.style.cssText = 'position:fixed;top:110px;left:50%;transform:translateX(-50%);z-index:201;background:rgba(201,132,122,0.15);color:#c9847a;padding:8px 16px;border-radius:14px;font-size:12px;border:1px solid rgba(201,132,122,0.3);pointer-events:none;max-width:80%;text-align:center';
      b.textContent = msg;
      document.body.appendChild(b);
      setTimeout(function() {
        b.style.opacity = '0';
        setTimeout(function() { if (b.parentNode) b.parentNode.removeChild(b); }, 300);
      }, 5000);
    } catch(e) {}
  }

  function notifyDataChanged() {
    refreshHandlers.forEach(function(fn) {
      try { fn(); } catch(e) {
        console.warn('refresh handler error:', e);
        showErrorToast('刷新出错: ' + (e && e.message ? e.message : e));
      }
    });
  }

  function showSavedToast(msg) {
    try {
      var b = document.createElement('div');
      b.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:200;background:var(--accent-soft);color:var(--accent);padding:8px 18px;border-radius:14px;font-size:13px;border:1px solid var(--border-glow);pointer-events:none;transition:opacity .3s';
      b.textContent = msg || '已记下 ✓';
      document.body.appendChild(b);
      setTimeout(function() {
        b.style.opacity = '0';
        setTimeout(function() { if (b.parentNode) b.parentNode.removeChild(b); }, 300);
      }, 1800);
    } catch(e) {}
  }

  function init() {
    // 最先注册刷新处理器——即使后续初始化某一步失败，保存后也能刷新时间线
    onDataChanged(refreshTimeline);
    onDataChanged(updateReviewPreview);
    onDataChanged(renderInspoList);
    onDataChanged(function() { checkInspoBanner(); });

    var s = Storage.getSettings();
    I18N.setMode(s.styleMode);
    Storage.updateDayStart(parseInt(s.dayStart));
    Storage.resetSkipCount();
    Storage.archiveOldInspirations();

    Settings.init();
    Settings.bindEvents();

    bindNavigation();
    bindButtons();
    bindInspoButtons();
    bindRecordActions();

    if (typeof Sleep !== 'undefined' && Sleep.init) Sleep.init();

    checkNightReviewHint();

    refreshTimeline();

    Achievement.updateDisplay();
    Achievement.checkDaily();

    injectSectionIcons();

    Scheduler.init();

    var mode = Storage.getSettings().styleMode;
    I18N.setMode(mode);
    document.getElementById('set-style-mode').value = mode;

    setInterval(refreshTimeline, 30000);
    updateDateDisplay();
  }

  function bindNavigation() {
    document.querySelectorAll('.nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var page = btn.dataset.page;
        switchPage(page);
      });
    });
  }

  function switchPage(page) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
    var pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    var navBtn = document.querySelector('.nav-btn[data-page="' + page + '"]');
    if (navBtn) navBtn.classList.add('active');

    if (page === 'growth') {
      renderLateList();
      renderPatternAnalysis();
      renderCategoryAnalysis();
    }
    if (page === 'review') {
      updateReviewPreview();
      renderInspoList();
    }
    if (page === 'sleep') {
      if (typeof Sleep !== 'undefined' && Sleep.renderToday) Sleep.renderToday();
      if (typeof Sleep !== 'undefined' && Sleep.renderHistory) Sleep.renderHistory();
      try { if (typeof Chart !== 'undefined' && Chart.draw) Chart.draw(7); } catch(e) {}
    }

    var ov = document.getElementById('overlay');
    var md = document.getElementById('modal');
    if (ov) ov.style.display = 'none';
    if (md) md.style.display = 'none';
  }

  function injectSectionIcons() {
    var sections = {
      'sec-ach': SVG.crown,
      'sec-late': SVG.moon,
      'sec-trend': SVG.chart,
      'sec-pattern': SVG.search,
      'sec-cat': SVG.book
    };
    Object.keys(sections).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = sections[id];
    });
  }

  function bindButtons() {
    document.getElementById('fab-manual').addEventListener('click', function() {
      Scheduler.fireManually();
    });

    document.querySelectorAll('.achievement-card[data-ach]').forEach(function(card) {
      card.addEventListener('click', function() {
        Achievement.showDetail(card.dataset.ach);
      });
    });

    document.getElementById('btn-treehole').addEventListener('click', function() {
      Treehole.show();
    });

    document.getElementById('btn-tarot').addEventListener('click', function() {
      Tarot.show();
    });

    document.getElementById('btn-music').addEventListener('click', function() {
      Music.show();
    });

    document.getElementById('btn-lifebook').addEventListener('click', function() {
      Lifebook.show();
    });

    document.getElementById('overlay').addEventListener('click', function() {
      // 强制记录模式：点空白不能逃，只能记录或跳过
      if (typeof Inquiry.isForced === 'function' && Inquiry.isForced()) return;
      Inquiry.close();
      document.getElementById('modal').innerHTML = '';
    });

    document.querySelectorAll('.chart-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.chart-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        Chart.draw(parseInt(btn.dataset.range));
      });
    });
  }

  function bindInspoButtons() {
    var addBtn = document.getElementById('btn-inspo-add');
    if (addBtn) addBtn.addEventListener('click', showAddInspo);
  }

  function showAddInspo() {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="inspo-back">← 返回</button>' +
      '<div class="modal-title">加一个灵感</div>' +
      '<div class="urgency-picker">' +
      '<button class="urg-chip" data-urgency="low" style="color:#7a9ec4">' + SVG.leaf + '<span>宽松</span></button>' +
      '<button class="urg-chip" data-urgency="mid" style="color:#c9a96e">' + SVG.bell + '<span>中等</span></button>' +
      '<button class="urg-chip" data-urgency="high" style="color:#c9847a">' + SVG.bird + '<span>紧急</span></button>' +
      '</div>' +
      '<input type="text" class="text-input" id="inspo-title" placeholder="主题（必填）" style="margin-top:10px">' +
      '<textarea class="text-input" id="inspo-text" rows="5" placeholder="详情（选填）..."></textarea>' +
      '<button class="btn-primary" id="inspo-save" style="margin-top:10px">存下来</button>' +
      '</div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('inspo-back').onclick = Inquiry.close;
    document.getElementById('inspo-title').focus();

    var selectedUrgency = 'low';
    // 默认选中"宽松"高亮
    var defaultChip = document.querySelector('.urg-chip[data-urgency="low"]');
    if (defaultChip) { defaultChip.classList.add('urg-active'); }
    document.querySelectorAll('[data-urgency]').forEach(function(btn) {
      btn.onclick = function() {
        selectedUrgency = btn.dataset.urgency;
        document.querySelectorAll('.urg-chip').forEach(function(b) {
          b.classList.remove('urg-active');
        });
        btn.classList.add('urg-active');
      };
    });

    document.getElementById('inspo-save').onclick = function() {
      var title = (document.getElementById('inspo-title').value || '').trim();
      if (!title) { document.getElementById('inspo-title').focus(); return; }
      var detail = (document.getElementById('inspo-text').value || '').trim();
      Storage.saveInspiration({ title: title, content: detail, urgency: selectedUrgency, source: 'self' });
      Inquiry.close();
      renderInspoList();
      checkInspoBanner();
      notifyTiny('灵感已存档 🌱');
    };
  }

  function renderInspoList() {
    var container = document.getElementById('inspo-banner-review');
    if (!container) return;
    var list = Storage.getPendingInspirations();
    if (list.length === 0) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'block';
    var html = '';
    list.slice(0, 20).forEach(function(inspo) {
      var urgClass = inspo.urgency === 'high' ? 'urgency-high' : inspo.urgency === 'mid' ? 'urgency-mid' : 'urgency-low';
      var urgLabel = inspo.urgency === 'high' ? '紧急' : inspo.urgency === 'mid' ? '中等' : '宽松';
      var urgIcon = inspo.urgency === 'high' ? SVG.bird : inspo.urgency === 'mid' ? SVG.bell : SVG.leaf;
      var timeStr = formatInspoTime(inspo.timestamp);
      // 主题：优先 title，兼容旧数据用 content
      var title = inspo.title || inspo.content || '灵感';
      html += '<div class="inspo-card" data-id="' + inspo.id + '">' +
        '<span class="inspo-card-icon">' + urgIcon + '</span>' +
        '<span class="inspo-card-title">' + escapeHtml(title) + '</span>' +
        '<span class="inspo-urgency ' + urgClass + '">' + urgLabel + '</span>' +
        '<span class="inspo-card-time">' + timeStr + '</span>' +
        '</div>';
    });
    container.innerHTML = html;
    // 点卡片 → 弹窗看完整内容
    container.querySelectorAll('.inspo-card').forEach(function(card) {
      card.onclick = function() {
        showInspoDetail(card.getAttribute('data-id'));
      };
    });
  }

  // 灵感详情弹窗：完整主题 + 完整内容 + 时间 + 紧急度 + 已完成
  function showInspoDetail(id) {
    var all = Storage.getAllInspirations();
    if (!all) return;
    var inspo = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) { inspo = all[i]; break; }
    }
    if (!inspo) { showErrorToast('没找到这条灵感'); return; }
    var urgLabel = inspo.urgency === 'high' ? '紧急' : inspo.urgency === 'mid' ? '中等' : '宽松';
    var urgIcon = inspo.urgency === 'high' ? SVG.bird : inspo.urgency === 'mid' ? SVG.bell : SVG.leaf;
    var title = inspo.title || inspo.content || '灵感';
    var detail = (inspo.title && inspo.content) ? inspo.content : '';
    var timeStr = formatInspoTime(inspo.timestamp);

    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="inspo-detail-back">×</button>' +
      '<div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--mauve)">' + urgIcon + '</span>' + escapeHtml(title) + '</div>' +
      '<div class="modal-text" style="font-size:12px">' + urgLabel + ' · ' + timeStr + '</div>' +
      (detail ? '<div class="inspo-detail-body">' + escapeHtml(detail).replace(/\n/g, '<br>') + '</div>' : '<div class="inspo-detail-body" style="color:var(--text-tertiary)">（没有详情）</div>') +
      '<button class="btn-primary" id="inspo-detail-done" style="background:var(--mauve)">已完成 ✓</button>' +
      '</div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('inspo-detail-back').onclick = Inquiry.close;
    document.getElementById('inspo-detail-done').onclick = function() {
      Storage.markInspirationDone(id);
      Inquiry.close();
      renderInspoList();
      checkInspoBanner();
      notifyTiny('完成一个灵感 🎉');
    };
  }

  function formatInspoTime(ts) {
    try {
      var d = new Date(ts);
      var now = new Date();
      var sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      var hm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      if (sameDay) return hm;
      return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hm;
    } catch(e) { return ''; }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function refreshTimeline() {
    var records = Storage.getRecentRecords(2);  // 只显示最近 2 天
    var list = document.getElementById('timeline-list');
    var empty = document.getElementById('timeline-empty');
    if (!list) return;

    // 用 timestamp 本地日期分组（兼容旧数据，避免 UTC 偏移错误）
    var recordsByDate = {};
    records.forEach(function(r) {
      var localDate = localDateStr(r.timestamp);
      if (!recordsByDate[localDate]) recordsByDate[localDate] = [];
      recordsByDate[localDate].push(r);
    });

    var dates = Object.keys(recordsByDate).sort().reverse();
    if (dates.length === 0) {
      list.innerHTML = '';
      if (empty) {
        list.appendChild(empty);
        empty.style.display = 'block';
      }
    } else {
      if (empty) empty.style.display = 'none';
      var html = '';
      dates.forEach(function(date) {
        html += '<div class="timeline-day"><div class="timeline-date">' + formatDate(date) + '</div>';
        recordsByDate[date].forEach(function(r) {
          try {
            var time = new Date(r.timestamp);
            var timeStr = ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2);
            var content = r.title || r.content || r.category || '';
            html += '<div class="record-item"><span class="record-time">' + timeStr + '</span>' +
              '<span class="record-icon">' + getIcon(r) + '</span>' +
              '<span class="record-content"><span class="record-title">' + escapeHtml(content) + '</span></span>';
            var catLabel = r.smartCategory || r.category;
            if (catLabel) {
              html += '<span class="record-cat">' + escapeHtml(catLabel) + '</span>';
            }
            html += '<span class="record-actions">' +
              '<button class="rec-act-btn" data-act="edit" data-id="' + r.id + '" title="调整内容">✎</button>' +
              '<button class="rec-act-btn rec-del" data-act="del" data-id="' + r.id + '" title="删除">✕</button>' +
              '</span></div>';
          } catch(e) {
            console.warn('record render error:', e);
          }
        });
        html += '</div>';
      });
      list.innerHTML = html;
    }

    try { renderDaySummary(); } catch(e) {}
    try { renderDaySummary(); } catch(e) {}
    try { checkInspoBanner(); } catch(e) {}
    try { updateDateDisplay(); } catch(e) {}
  }

  // 记录操作：编辑/删除（事件委托，动态记录也能响应）
  function bindRecordActions() {
    var list = document.getElementById('timeline-list');
    if (!list) return;
    list.onclick = function(e) {
      var btn = e.target && e.target.closest ? e.target.closest('.rec-act-btn') : null;
      if (!btn) return;
      var id = btn.getAttribute('data-id');
      var act = btn.getAttribute('data-act');
      if (!id) return;
      if (act === 'del') {
        showDeleteConfirm(id);
      } else if (act === 'edit') {
        showEditRecord(id);
      }
    };
  }

  // 自定义删除确认弹窗（避免 PWA/移动端 confirm() 被拦截）
  function showDeleteConfirm(id) {
    var rec = Storage.getRecentRecords(365).filter(function(r) { return r.id === id; })[0];
    var label = rec ? (rec.title || rec.content || rec.category || '这条记录') : '这条记录';
    var html = '<div class="modal-content modal-content-compact" style="position:relative">' +
      '<div class="modal-title" style="font-size:18px;margin-bottom:12px">删除这条记录？</div>' +
      '<div class="del-confirm-label" title="' + escapeHtml(label) + '">「' + escapeHtml(label) + '」</div>' +
      '<div style="font-size:13px;color:var(--text-tertiary);margin-bottom:14px">删了之后没法恢复。</div>' +
      '<div style="display:flex;gap:8px">' +
      '<button class="btn-secondary" id="del-cancel" style="flex:1">再想想</button>' +
      '<button class="btn-danger" id="del-confirm" style="flex:1">删除</button>' +
      '</div></div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('del-cancel').onclick = function() { Inquiry.close(); };
    document.getElementById('del-confirm').onclick = function() {
      Storage.deleteRecord(id);
      Inquiry.close();
      notifyDataChanged();
      showSavedToast('已删除');
    };
  }

  function showEditRecord(id) {
    var rec = Storage.getRecentRecords(365).filter(function(r) { return r.id === id; })[0];
    if (!rec) { showErrorToast('没找到这条记录'); return; }
    var current = rec.title || rec.content || rec.category || '';
    var detail = rec.detail || '';
    var curCat = rec.smartCategory || rec.category || '其他';

    // 分类按 3 大组组织 + 图标映射（情绪/焦虑合并为情绪）
    var catIcons = {
      '创作': SVG.paint, '学习': SVG.book, '工作': SVG.code, '游戏': SVG.game, '娱乐': SVG.video,
      '吃饭': SVG.food, '运动': SVG.spark, '休息': SVG.bed, '购物': SVG.cart, '家务': SVG.broom, '洗澡': SVG.shower,
      '社交': SVG.chat, '灵感': SVG.lamp, '情绪': SVG.heart, '音乐': SVG.star, '动漫': SVG.video, '其他': SVG.star
    };
    var groups = [
      { key: 'auto', label: '自动', icon: '⭐', items: [] },
      { key: 'g1', label: '页1', icon: '', items: ['创作','学习','工作','游戏','娱乐'] },
      { key: 'g2', label: '页2', icon: '', items: ['吃饭','运动','休息','购物','家务','洗澡'] },
      { key: 'g3', label: '页3', icon: '', items: ['社交','灵感','情绪','音乐','动漫','其他'] }
    ];

    // 默认 tab：当前分类所在的组
    var activeTab = 'auto';
    if (curCat !== '__auto__' && curCat !== '其他') {
      for (var gi = 0; gi < groups.length; gi++) {
        if (groups[gi].items.indexOf(curCat) !== -1) { activeTab = groups[gi].key; break; }
      }
    }

    // 4 个 tab 按钮 + 内容面板（页1/页2/页3 无多余文字）
    var tabsHTML = '<div class="cat-tabs">' + groups.map(function(g) {
      var isActive = (g.key === activeTab);
      var idx = groups.indexOf(g);
      if (g.key === 'auto') {
        return '<button class="cat-tab' + (isActive ? ' active' : '') + '" data-tab="auto" type="button"><span>自动</span></button>';
      }
      return '<button class="cat-tab' + (isActive ? ' active' : '') + '" data-tab="' + g.key + '" type="button">' +
        '<span class="cat-tab-num">' + idx + '</span><span>' + g.label + '</span></button>';
    }).join('') + '</div>';

    var panelsHTML = groups.map(function(g) {
      var isActive = (g.key === activeTab);
      if (g.key === 'auto') {
        return '<div class="cat-tab-panel" data-panel="auto"' + (isActive ? ' style="display:block"' : '') + '>' +
          '<div class="cat-tab-hint">按内容智能分类<br>不选组即用 🌿</div></div>';
      }
      var btns = g.items.map(function(c) {
        var sel = (c === curCat) ? ' selected' : '';
        return '<button class="cat-grid-btn' + sel + '" data-cat="' + c + '" data-group="' + g.key + '">' +
          (catIcons[c] || SVG.star) + '<span>' + c + '</span></button>';
      }).join('');
      return '<div class="cat-tab-panel" data-panel="' + g.key + '"' + (isActive ? ' style="display:block"' : '') + '>' +
        '<div class="cat-grid">' + btns + '</div></div>';
    }).join('');

    var html = '<div class="modal-content modal-content-compact" style="position:relative">' +
      '<button class="btn-back" id="edit-back">← 返回</button>' +
      '<div class="modal-title" style="font-size:18px;margin-bottom:6px">调整记录</div>' +
      '<input type="text" class="text-input" id="edit-text" placeholder="主题（必填）" value="' + escapeHtml(current) + '" style="margin-bottom:8px">' +
      '<textarea class="text-input" id="edit-detail" rows="3" placeholder="补充说明（可选）..." style="margin-bottom:10px;line-height:1.5">' + escapeHtml(detail) + '</textarea>' +
      '<div class="cat-picker-compact">' +
      tabsHTML +
      panelsHTML +
      '</div>' +
      '<button class="btn-primary" id="edit-save" style="margin-top:10px">保存修改</button>' +
      '</div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    // 编辑弹窗打开时隐藏右下角 + 号，避免误点（关闭时由 Inquiry.close 恢复）
    var fab = document.getElementById('fab-manual');
    if (fab) fab.style.display = 'none';
    document.getElementById('edit-back').onclick = Inquiry.close;
    document.getElementById('edit-text').focus();

    var selectedCat = (curCat === '__auto__') ? '__auto__' : curCat;

    function selectCat(val) {
      selectedCat = val;
      document.querySelectorAll('#modal .cat-grid-btn').forEach(function(b) {
        b.classList.remove('selected');
      });
      var target = document.querySelector('#modal .cat-grid-btn[data-cat="' + val + '"]');
      if (target) target.classList.add('selected');
    }

    // tab 切换
    document.querySelectorAll('#modal .cat-tab').forEach(function(t) {
      t.onclick = function() {
        var tab = t.getAttribute('data-tab');
        document.querySelectorAll('#modal .cat-tab').forEach(function(x) { x.classList.remove('active'); });
        t.classList.add('active');
        document.querySelectorAll('#modal .cat-tab-panel').forEach(function(p) {
          p.style.display = (p.getAttribute('data-panel') === tab) ? 'block' : 'none';
        });
        if (tab === 'auto') selectedCat = '__auto__';
      };
    });

    // 分类按钮选择
    document.querySelectorAll('#modal .cat-grid-btn[data-group]').forEach(function(b) {
      b.onclick = function() { selectCat(b.getAttribute('data-cat')); };
    });

    document.getElementById('edit-save').onclick = function() {
      var text = (document.getElementById('edit-text').value || '').trim();
      if (!text) { alert('内容不能为空'); return; }
      var patch = { content: text, title: text };
      var detailVal = (document.getElementById('edit-detail').value || '').trim();
      patch.detail = detailVal || '';
      if (selectedCat === '__auto__') {
        var auto = Storage.categorizeRecord({ title: text, content: text });
        patch.smartCategory = (auto === '其他' && curCat !== '其他') ? curCat : auto;
      } else {
        patch.smartCategory = selectedCat;
      }
      Storage.updateRecord(id, patch);
      Inquiry.close();
      notifyDataChanged();
      showSavedToast('已修改');
    };
  }

  function renderDaySummary() {
    return;
  }

  function renderLateList() {
    var reasons = Storage.getLateNightReasons(30);
    var el = document.getElementById('late-list');
    if (!el) return;

    if (reasons.length === 0) {
      el.innerHTML = '<div class="empty-state">' +
        '<div class="empty-icon">🌙</div>' +
        '<div class="empty-text">还没有熬夜记录，保持住</div>' +
        '</div>';
      return;
    }

    var html = '';
    reasons.slice(-15).reverse().forEach(function(r) {
      var reasonText = r.reason.replace(/^.{2}/, function(m) { return ''; });
      var time = new Date(r.timestamp);
      var timeStr = ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2);

      html += '<div class="late-item">' +
        '<span class="late-date">' + r.date.slice(5) + '</span>' +
        '<span class="late-time">' + timeStr + '</span>' +
        '<span class="late-reason">' + (r.content || r.reason) + '</span>' +
        '<span class="late-cat">' + reasonText + '</span>' +
        '</div>';
    });
    el.innerHTML = html;
  }

  function renderCategoryAnalysis() {
    var records = Storage.getRecentRecords(30);
    var el = document.getElementById('category-analysis');
    if (!el) return;

    if (records.length === 0) {
      el.innerHTML = '<div class="empty-state">' +
        '<div class="empty-text">数据积累中...</div>' +
        '<div class="empty-hint">记录几件事后，这里会自动总结你的生活分类</div>' +
        '</div>';
      return;
    }

    var catCount = {};
    var catIcons = {
      '创作': SVG.paint, '学习': SVG.book, '工作': SVG.code, '游戏': SVG.game,
      '娱乐': SVG.video, '社交': SVG.chat, '吃饭': SVG.food, '运动': SVG.spark,
      '休息': SVG.bed, '购物': SVG.cart, '家务': SVG.broom, '洗澡': SVG.shower,
      '灵感': SVG.lamp, '情绪': SVG.heart, '音乐': SVG.star,
      '动漫': SVG.video, '其他': SVG.star
    };

    records.forEach(function(r) {
      var cat = r.smartCategory || r.category || '其他';
      if (cat === '其他' && r.title) {
        cat = Storage.categorizeRecord(r);
      }
      catCount[cat] = (catCount[cat] || 0) + 1;
    });

    var sorted = Object.keys(catCount).sort(function(a, b) { return catCount[b] - catCount[a]; });
    var max = sorted.length > 0 ? catCount[sorted[0]] : 1;

    var html = '';
    sorted.forEach(function(cat) {
      var pct = (catCount[cat] / max) * 100;
      html += '<div class="category-bar">' +
        '<span class="cat-icon-svg">' + (catIcons[cat] || SVG.star) + '</span>' +
        '<span class="cat-label">' + cat + '</span>' +
        '<div class="cat-track"><div class="cat-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="cat-count">' + catCount[cat] + '</span>' +
        '</div>';
    });
    el.innerHTML = html;
  }

  function renderPatternAnalysis() {
    var reasons = Storage.getLateNightReasons(30);
    var el = document.getElementById('pattern-analysis');
    if (!el) return;

    if (reasons.length === 0) {
      el.innerHTML = '<div class="empty-state">' +
        '<div class="empty-text">数据积累中...</div>' +
        '<div class="empty-hint">记录几天熬夜原因后，这里会显示你的模式</div>' +
        '</div>';
      return;
    }

    var catCount = {};
    reasons.forEach(function(r) {
      var cat = r.reason.replace(/^.{2}/, '');
      catCount[cat] = (catCount[cat] || 0) + 1;
    });

    var sorted = Object.keys(catCount).sort(function(a, b) { return catCount[b] - catCount[a]; });
    var max = catCount[sorted[0]];

    var html = '<div class="category-bar" style="background:var(--rose-soft);border-color:rgba(201,132,122,0.2)">';
    html += '<span class="cat-icon-svg">' + SVG.heart + '</span><span class="cat-label" style="color:var(--rose)">最多原因</span>';
    html += '<div class="cat-track"><div class="cat-fill" style="background:var(--rose);width:100%"></div></div>';
    html += '<span class="cat-count">' + sorted[0] + '</span></div>';

    var insights = [
      '这周有 ' + reasons.length + ' 次熬夜',
      '最多是因为「' + sorted[0] + '」'
    ];
    html += '<div style="margin-top:12px;font-size:13px;color:var(--text-secondary);line-height:1.7">';
    insights.forEach(function(line) {
      html += '<div>· ' + line + '</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  function getIcon(rec) {
    var icons = {
      '画画': SVG.paint, '游戏': SVG.game, '看视频': SVG.video,
      '写代码': SVG.code, '学习': SVG.book, '刷手机': SVG.phone,
      '购物': SVG.cart, '家务': SVG.broom, '吃饭': SVG.food,
      '社交': SVG.chat, '洗澡': SVG.shower, '灵感': SVG.lamp,
      '倒计时结束': SVG.hourglass, '灵感到来': SVG.spark
    };
    try {
      if (rec.type === 'photo') return SVG.camera;
      if (rec.type === 'link') return SVG.link;
      if (rec.type === 'say') return SVG.edit;
      return icons[rec.category] || SVG.star;
    } catch(e) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
    }
  }

  function checkInspoBanner() {
    var pending = Storage.getPendingInspirations();
    var banner = document.getElementById('inspo-banner');
    if (!banner) return;
    // 首页只显示一条：紧急>中等>宽松，同紧急按最早（getPendingInspirations 已排序）
    if (pending && pending.length > 0) {
      var inspo = pending[0];
      var title = inspo.title || inspo.content || '灵感';
      var detail = (inspo.title && inspo.content) ? inspo.content : inspo.content;
      var urgClass = inspo.urgency === 'high' ? 'urgency-high' : inspo.urgency === 'mid' ? 'urgency-mid' : 'urgency-low';
      var urgLabel = inspo.urgency === 'high' ? '紧急' : inspo.urgency === 'mid' ? '中等' : '宽松';
      var timeStr = formatInspoTime(inspo.timestamp);
      var preview = detail || '';
      banner.innerHTML =
        '<div class="banner-title">💡 存档的灵感</div>' +
        '<div class="banner-inspo"><span class="inspo-urgency ' + urgClass + '">' + urgLabel + '</span><span class="banner-inspo-title">' + escapeHtml(title) + '</span><span class="banner-inspo-time">' + timeStr + '</span></div>' +
        (preview ? '<div class="banner-text">' + escapeHtml(preview) + '</div>' : '') +
        '<button class="banner-done" data-id="' + inspo.id + '">已完成 ✓</button>';
      banner.style.display = 'block';
      // 点整个横幅 → 详情弹窗
      banner.onclick = function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('banner-done')) return;
        showInspoDetail(inspo.id);
      };
      banner.querySelector('.banner-done').onclick = function(e) {
        e.stopPropagation();
        Storage.markInspirationDone(inspo.id);
        checkInspoBanner();
        renderInspoList();
        notifyTiny('完成一个灵感 🎉');
      };
    } else {
      banner.style.display = 'none';
      banner.onclick = null;
    }
  }

  function updateReviewPreview() {
    var records = Storage.getRecords(Storage.today());
    var content = document.getElementById('review-content');
    var empty = document.getElementById('review-empty');
    if (records.length > 0 && content) {
      content.innerHTML = '<div class="review-empty">已有 ' + records.length + ' 条记录。回顾会在目标入睡时间自动展示。</div>';
    }
  }

  function syncRoutineInputs() {
    // 作息输入已迁移到作息页（Sleep 模块），此函数保留为空实现避免调用报错
  }

  // 深夜温和提示：22:00-02:00 且今天还没记录入睡 → 提示一次睡前回顾（可关闭）
  function checkNightReviewHint() {
    try {
      if (typeof Scheduler === 'undefined' || !Scheduler.hasDoneReviewToday) return;
      if (Scheduler.hasDoneReviewToday()) return;  // 已记入睡 → 视为已回顾，不打扰
      // 会话内只弹一次（刷新页面不重复弹）
      if (sessionStorage.getItem('tj_night_hint_shown') === '1') return;
      var h = new Date().getHours();
      var inWindow = (h >= 22 || h < 2);
      if (!inWindow) return;
      sessionStorage.setItem('tj_night_hint_shown', '1');
      setTimeout(function() {
        var html = '<div class="modal-content modal-content-compact" style="position:relative">' +
          '<button class="btn-back" id="night-hint-close">×</button>' +
          '<div class="modal-title" style="font-size:18px">🌙 今晚要不要回顾一下？</div>' +
          '<div class="modal-text" style="font-size:13px">睡前看一眼今天做了啥，想睡的念头会踏实一点。</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="btn-secondary" id="night-hint-later" style="flex:1">等会儿</button>' +
          '<button class="btn-primary" id="night-hint-now" style="flex:1;background:var(--accent)">现在回顾</button>' +
          '</div></div>';
        document.getElementById('modal').innerHTML = html;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('modal').style.display = 'flex';
        var close = function() { Inquiry.close(); };
        document.getElementById('night-hint-close').onclick = close;
        document.getElementById('night-hint-later').onclick = close;
        document.getElementById('night-hint-now').onclick = function() {
          Inquiry.close();
          try {
            if (typeof Scheduler !== 'undefined' && Scheduler.fireSleepCheck) Scheduler.fireSleepCheck();
            else if (typeof Review !== 'undefined' && Review.show) Review.show();
          } catch(e) {
            if (typeof Review !== 'undefined' && Review.show) Review.show();
          }
        };
      }, 800);
    } catch(e) {}
  }

  function updateDateDisplay() {
    var now = new Date();
    var days = ['日','一','二','三','四','五','六'];
    var dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日 星期' + days[now.getDay()];
    document.getElementById('date-display').textContent = dateStr;
  }

  function localDateStr(ts) {
    var d = new Date(ts);
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    var days = ['日','一','二','三','四','五','六'];
    return (d.getMonth()+1) + '月' + d.getDate() + '日 周' + days[d.getDay()];
  }

  function checkAchievements() {
    Achievement.checkDaily();
  }

  return {
    init: init,
    switchPage: switchPage,
    refreshTimeline: refreshTimeline,
    checkAchievements: checkAchievements,
    onDataChanged: onDataChanged,
    notifyDataChanged: notifyDataChanged,
    showSavedToast: showSavedToast
  };
})();

if (typeof window !== 'undefined') {
  window.App = App;
  // 全局便捷入口：任何 JS 模块保存数据后调用 window.notifyDataChanged()
  window.notifyDataChanged = function() { App.notifyDataChanged(); };
}

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
