var Scheduler = (function() {
  var inquiryTimer = null;
  var retryTimer = null;
  var retryCount = 0;
  var showerTimer = null;
  var showerRetryTimer = null;
  var inspoTimer = null;
  var reviewTimer = null;
  var dailyTimer = null;
  var countdownTimer = null;
  var isVisible = true;
  var lastInquiryHour = -1;
  var lastInquiryTitle = '';
  var retryDelays = [600000, 1800000, 3600000];

  // ---- 弹窗优先级队列：同一时间只弹一个，关掉才弹下一个 ----
  // 优先级：睡前确认(1) > 洗澡补检(2) > 回顾补检(3) > 洗澡(4) > 灵感(5) > 定时问询(6)
  var popupQueue = [];
  var popupShowing = false;
  var popupTypes = { review: 1, showerCatch: 2, reviewCatch: 3, shower: 4, inspo: 5, inquiry: 6 };

  function enqueuePopup(type, showFn) {
    // 同类型去重（不重复排队）
    popupQueue = popupQueue.filter(function(p) { return p.type !== type; });
    popupQueue.push({ type: type, priority: popupTypes[type] || 9, show: showFn });
    popupQueue.sort(function(a, b) { return a.priority - b.priority; });
    tryShowNext();
  }

  function tryShowNext() {
    if (popupShowing || popupQueue.length === 0 || !isVisible) return;
    var item = popupQueue.shift();
    popupShowing = true;
    try {
      item.show(function() {
        popupShowing = false;
        tryShowNext();
      });
    } catch(e) {
      console.warn('popup error:', e);
      popupShowing = false;
      tryShowNext();
    }
  }

  function init() {
    document.addEventListener('visibilitychange', onVisibility);
    requestNotification();
    scheduleAll();
    dailyTimer = setInterval(dailyCheck, 60000);
    showMorningIfNeeded();
    checkInquiryOnOpen();
    checkShowerCatch();
    checkReviewCatch();
    // 恢复未完成的灵感倒计时检查
    try {
      var cd = Storage.getCountdown();
      if (cd && cd.endAt && Date.now() < cd.endAt) scheduleCountdownCheck();
      else if (cd && cd.endAt) { Storage.clearCountdown(); }
    } catch(e) {}
  }

  function requestNotification() {
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(function() { Notification.requestPermission(); }, 3000);
    }
  }

  function getNotifyText(count) {
    var mode = Storage.getSettings().styleMode || 'gentle';
    var texts = {
      gentle: [
        '该记录一下啦 ✨',
        '还没记呢...记得回来哟 💭',
        '忘了也没关系，现在打开记一记吧 🫂'
      ],
      strict: [
        '你的进度还没提交。',
        '第二次提醒：你没有回应。',
        '最后一次提醒：现在立刻记录。'
      ],
      funny: [
        '皇上！该记事了！📜',
        '皇上！！！政绩呢？？？臣等着呢 👀',
        '皇上你再不记我就要去你梦里催了 💤'
      ],
      minimal: [
        '记录时间',
        '第 2 次提醒',
        '最后提醒'
      ]
    };
    var arr = texts[mode] || texts.gentle;
    return arr[Math.min(count - 1, arr.length - 1)];
  }

  function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      var n = new Notification(title, {
        body: body, icon: 'assets/icon-192.png', tag: 'timejournal', requireInteraction: true
      });
      n.onclick = function() { window.focus(); n.close(); };
    }
  }

  function onVisibility() {
    isVisible = !document.hidden;
    if (isVisible) {
      scheduleAll();
    }
  }

  function scheduleAll() {
    scheduleInquiry();
    scheduleShower();
    scheduleInspo();
    scheduleReview();
  }

  function scheduleInquiry() {
    clearTimeout(inquiryTimer);
    clearTimeout(retryTimer);
    retryCount = 0;
    var settings = Storage.getSettings();

    if (settings.statusMode === 'work') {
      scheduleWorkInquiry(new Date());
      return;
    }

    // v1.2 改造：休息模式不再自动定时问询（2h 定时器在页面后台会死，还会和 VPS 推送打架）
    // 提醒改由 VPS 定时推送负责（10/14/17/20/23 点），打开页面时由 checkInquiryOnOpen 温和补检
  }

  // v1.2 新增：打开页面时温和补检——今天记录太少 且 距上次记录超过 3 小时 → 提示一次（可关闭）
  function checkInquiryOnOpen() {
    try {
      if (!isVisible) return;
      var settings = Storage.getSettings();
      if (settings.inquiryInterval === 0) return; // 手动模式：不打扰
      var todayRecords = Storage.getRecords(Storage.today());
      if (todayRecords.length >= 2) return; // 今天已记 2 条，够了
      var all = Storage.getAllRecords();
      if (all && all.length) {
        var elapsed = Date.now() - (all[0].timestamp || 0);
        if (elapsed < 3 * 3600000) return; // 3 小时内记过，不打扰
      }
      fireInquiry();
    } catch(e) {
      console.warn('checkInquiryOnOpen error:', e);
    }
  }

  // v2.4 新增：洗澡补检——过了洗澡窗口还没洗 → 打开页面温和补一次（可关闭，一天 1 次）
  function checkShowerCatch() {
    try {
      if (!isVisible) return;
      var settings = Storage.getSettings();
      if (!settings.showerEnd) return;
      var now = new Date();
      var nowMin = now.getHours() * 60 + now.getMinutes();
      var endMin = parseInt(settings.showerEnd.split(':')[0]) * 60 + parseInt(settings.showerEnd.split(':')[1]);
      if (nowMin < endMin) return; // 窗口还没结束，不补检

      // 今天已洗过 → 不补
      var todayRecords = Storage.getRecords(Storage.today());
      var hasShower = todayRecords.some(function(r) {
        var blob = ((r.category || '') + ' ' + (r.smartCategory || '') + ' ' + (r.title || '') + ' ' + (r.content || ''));
        return blob.indexOf('洗澡') !== -1 || blob.indexOf('淋浴') !== -1 || blob.indexOf('沐浴') !== -1;
      });
      if (hasShower) return;

      // 一天只补一次（localStorage 标记）
      var key = 'tj_showerCatch_date';
      if (localStorage.getItem(key) === Storage.today()) return;
      localStorage.setItem(key, Storage.today());

      enqueuePopup('showerCatch', function(done) {
        var html = '<div class="modal-content modal-content-compact" style="position:relative">' +
          '<button class="btn-back" id="shower-catch-close">×</button>' +
          '<div class="modal-title" style="font-size:18px">今天还没洗澡哦 🚿</div>' +
          '<div class="modal-text" style="font-size:13px">现在去洗一个，出来会舒服很多。</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="btn-secondary" id="shower-catch-later" style="flex:1">等会儿</button>' +
          '<button class="btn-primary" id="shower-catch-go" style="flex:1;background:var(--accent)">现在去洗</button>' +
          '</div></div>';
        document.getElementById('modal').innerHTML = html;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('modal').style.display = 'flex';
        var close = function() { Inquiry.close(); done(); };
        document.getElementById('shower-catch-close').onclick = close;
        document.getElementById('shower-catch-later').onclick = close;
        document.getElementById('shower-catch-go').onclick = function() {
          Inquiry.close(); done();
          Storage.saveRecord({ type: 'preset', category: '洗澡', content: '洗完澡了' });
          window.notifyDataChanged && window.notifyDataChanged();
          notifyTiny('已记录洗澡 🚿');
        };
      });
    } catch(e) {
      console.warn('checkShowerCatch error:', e);
    }
  }

  // v2.4 新增：睡前回顾补检——过了入睡目标还没记入睡 → 打开页面温和提示回顾（可关闭，一天 1 次）
  function checkReviewCatch() {
    try {
      if (!isVisible) return;
      var settings = Storage.getSettings();
      if (!settings.sleepTarget) return;
      var now = new Date();
      var nowMin = now.getHours() * 60 + now.getMinutes();
      var targetMin = parseInt(settings.sleepTarget.split(':')[0]) * 60 + parseInt(settings.sleepTarget.split(':')[1]);
      if (nowMin < targetMin) return; // 还没到入睡目标，不补检

      // 已记入睡 → 视为已回顾，不打扰
      var sleepData = Storage.getSleepData(2);
      var doneToday = false;
      for (var i = sleepData.length - 1; i >= 0; i--) {
        if (sleepData[i].date === Storage.today() && sleepData[i].bedTime) { doneToday = true; break; }
      }
      if (doneToday) return;

      // 一天只补一次（sessionStorage 会话内 + localStorage 跨天防重复）
      var key = 'tj_reviewCatch_date';
      if (localStorage.getItem(key) === Storage.today()) return;
      localStorage.setItem(key, Storage.today());

      enqueuePopup('reviewCatch', function(done) {
        var html = '<div class="modal-content modal-content-compact" style="position:relative">' +
          '<button class="btn-back" id="review-catch-close">×</button>' +
          '<div class="modal-title" style="font-size:18px">🌙 今晚要不要回顾一下？</div>' +
          '<div class="modal-text" style="font-size:13px">睡前看一眼今天做了啥，想睡的念头会踏实一点。</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="btn-secondary" id="review-catch-later" style="flex:1">等会儿</button>' +
          '<button class="btn-primary" id="review-catch-now" style="flex:1;background:var(--accent)">现在回顾</button>' +
          '</div></div>';
        document.getElementById('modal').innerHTML = html;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('modal').style.display = 'flex';
        var close = function() { Inquiry.close(); done(); };
        document.getElementById('review-catch-close').onclick = close;
        document.getElementById('review-catch-later').onclick = close;
        document.getElementById('review-catch-now').onclick = function() {
          Inquiry.close(); done();
          App.switchPage('review');
        };
      });
    } catch(e) {
      console.warn('checkReviewCatch error:', e);
    }
  }

  function scheduleWorkInquiry(now) {
    var h = now.getHours(), m = now.getMinutes();
    var noon = new Date(now); noon.setHours(12, 0, 0, 0);
    var night = new Date(now); night.setHours(20, 0, 0, 0);
    if (h >= 12 && h < 14) noon.setDate(noon.getDate() + 1);
    if (h >= 20) { noon.setDate(noon.getDate() + 1); night.setDate(night.getDate() + 1); }
    if (h < 12) night.setDate(night.getDate());
    var next; var label;
    if (noon <= night) { next = noon; label = '午间'; } else { next = night; label = '晚间'; }
    var delay = next.getTime() - now.getTime();
    if (delay < 0) delay = night.getTime() - now.getTime() + 86400000;
    inquiryTimer = setTimeout(function() {
      if (!isVisible) return;
      var title = '顾顾，' + ((new Date()).getHours() < 14 ? '午休了，' : '下班了吗？') + '今天记得记点什么';
      fireInquiry();
    }, delay);
  }

  var storageBusy = false;

  function fireInquiry() {
    var hour = new Date().getHours();
    lastInquiryTitle = I18N.getInquiryText(hour);
    enqueuePopup('inquiry', function(done) {
      Inquiry.show(lastInquiryTitle, function(result) {
        done();
        if (result.type === 'skipped') return;
        var record = {
          type: result.type,
          category: result.category || '',
          content: result.content || '',
          title: result.title || '',
          detail: result.detail || '',
          rawData: result.rawData || ''
        };
        storageBusy = true;
        Storage.saveRecord(record);
        storageBusy = false;
        window.notifyDataChanged && window.notifyDataChanged();
        retryCount = 0;
        clearTimeout(retryTimer);
        scheduleInquiry();
      });
    });
    retryTimer = setTimeout(retryInquiry, 600000);
    retryCount = 1;
  }

  function retryInquiry() {
    if (retryCount > 3) return;
    if (!isVisible) {
      sendNotification('⏰ 顾顾', getNotifyText(retryCount));
      var nextDelay = retryDelays[retryCount] || 3600000;
      retryTimer = setTimeout(retryInquiry, nextDelay);
      retryCount++;
      return;
    }
    Inquiry.show(lastInquiryTitle + '（追问）', function(result) {
      if (result.type === 'skipped') return;
      var record = { type: result.type, category: result.category || '', content: result.content || '', title: result.title || '', detail: result.detail || '' };
      storageBusy = true; Storage.saveRecord(record); storageBusy = false;
      window.notifyDataChanged && window.notifyDataChanged();
      retryCount = 0; clearTimeout(retryTimer); scheduleInquiry();
    });
    if (retryCount < 3) {
      retryTimer = setTimeout(retryInquiry, retryDelays[retryCount] || 3600000);
      retryCount++;
    }
  }

  function getShowerWindow() {
    var settings = Storage.getSettings();
    var now = new Date();
    var startH = parseInt(settings.showerStart.split(':')[0]);
    var startM = parseInt(settings.showerStart.split(':')[1]);
    var endH = parseInt(settings.showerEnd.split(':')[0]);
    var endM = parseInt(settings.showerEnd.split(':')[1]);
    var start = new Date(now);
    start.setHours(startH, startM, 0, 0);
    var end = new Date(now);
    end.setHours(endH, endM, 0, 0);
    if (end <= start) end.setDate(end.getDate() + 1);
    return { start: start.getTime(), end: end.getTime(), now: now.getTime() };
  }

  // 窗口结束后 15 分钟缓冲：给"× / 15分钟后再提醒"的收尾留余地，但绝不让它跨到第二天早上
  function inShowerWindow(now, start, end) {
    var grace = 15 * 60000;
    return now >= start && now <= end + grace;
  }

  function scheduleShower() {
    clearTimeout(showerTimer);
    clearTimeout(showerRetryTimer);
    var w = getShowerWindow();
    if (w.now < w.start) {
      // 窗口还没到：等到窗口开始再弹（修复"22:30 静默失效"）
      showerTimer = setTimeout(fireShower, w.start - w.now);
    } else if (w.now <= w.end) {
      // 窗口内：立即弹
      showerTimer = setTimeout(fireShower, 0);
    }
    // 窗口已过（含缓冲外）：今天不再安排
  }

  function fireShower() {
    var w = getShowerWindow();
    if (!inShowerWindow(w.now, w.start, w.end)) {
      // 不在洗澡窗口内：清理状态直接放弃（修复"早上 10 点弹洗澡"）
      clearTimeout(showerRetryTimer);
      showerState.postponeCount = 0;
      return;
    }
    enqueuePopup('shower', function(done) {
      showShowerMain(done);
    });
  }

  // ---- 洗澡状态机 ----
  // 状态：lastIntentTime(准备动身时间) / postponeCount(推迟次数)
  var showerState = { lastIntentTime: 0, postponeCount: 0 };

  // 检查"已洗"是否可信：从准备动身起算 >= 10 分钟才信
  function showerCheckCredible(done, fromIntent) {
    var startT = fromIntent ? showerState.lastIntentTime : showerState.lastIntentTime;
    var elapsed = (startT > 0) ? (Date.now() - startT) : 999999;
    if (showerState.lastIntentTime > 0 && elapsed < 10 * 60000) {
      // 太快了，怀疑
      var html = '<div class="modal-content" style="position:relative">' +
        '<div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--rose)">' + SVG.shower + '</span>这么快？真的洗了吗 🌚</div>' +
        '<div class="modal-text">刚说准备动身还没几分钟呢</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px">' +
        '<button class="btn-primary" id="shower-yes2" style="flex:1;background:var(--accent)">真洗了</button>' +
        '<button class="btn-secondary" id="shower-no2" style="flex:1">还没洗</button>' +
        '</div></div>';
      document.getElementById('modal').innerHTML = html;
      document.getElementById('overlay').style.display = 'block';
      document.getElementById('modal').style.display = 'flex';

      document.getElementById('shower-yes2').onclick = function() {
        // 坚持说洗了：相信，记录
        showerState.lastIntentTime = 0;
        showerState.postponeCount = 0;
        Storage.saveRecord({ type: 'preset', category: '洗澡', content: '洗完澡了' });
        window.notifyDataChanged && window.notifyDataChanged();
        Inquiry.close();
        done();
      };
      document.getElementById('shower-no2').onclick = function() {
        Inquiry.close();
        done();
        // 诚实说没洗 → 5 分钟后重弹主弹窗
        showerRetryTimer = setTimeout(fireShower, 5 * 60000);
      };
    } else {
      // 可信：接受
      showerState.lastIntentTime = 0;
      showerState.postponeCount = 0;
      Storage.saveRecord({ type: 'preset', category: '洗澡', content: '洗完澡了' });
      window.notifyDataChanged && window.notifyDataChanged();
      Inquiry.close();
      done();
    }
  }

  function showShowerMain(done) {
    var isForced = showerState.postponeCount >= 2;
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="shower-back">×</button>' +
      '<div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--accent)">' + SVG.shower + '</span>' + (isForced ? '真的该洗啦 🚿' : '该洗澡啦') + '</div>' +
      '<div class="modal-text">' + (isForced ? '已经催两次了，快去洗个澡放松一下' : '洗完就进入休息模式') + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">' +
      '<button class="btn-primary" id="shower-yes" style="background:var(--accent)">已洗</button>' +
      '<div style="display:flex;gap:8px">' +
      '<button class="btn-secondary" id="shower-go" style="flex:1">准备动身</button>' +
      (isForced ? '' : '<button class="btn-secondary" id="shower-later" style="flex:1">15 分钟后再提醒</button>') +
      '</div></div></div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';

    document.getElementById('shower-back').onclick = function() {
      Inquiry.close();
      done();
      showerRetryTimer = setTimeout(fireShower, 15 * 60000);
      showerState.postponeCount++;
    };
    document.getElementById('shower-yes').onclick = function() {
      showerCheckCredible(done);
    };
    document.getElementById('shower-go').onclick = function() {
      showerState.lastIntentTime = Date.now();
      Inquiry.close();
      done();
      // 3 分钟后追问"洗了吗"
      showerRetryTimer = setTimeout(function() {
        enqueuePopup('shower', function(d2) { showShowerAsk(d2); });
      }, 3 * 60000);
    };
    var laterBtn = document.getElementById('shower-later');
    if (laterBtn) {
      laterBtn.onclick = function() {
        Inquiry.close();
        done();
        showerState.postponeCount++;
        showerRetryTimer = setTimeout(fireShower, 15 * 60000);
      };
    }
  }

  // 追问："洗了吗？"（准备动身后 3 分钟）
  function showShowerAsk(done) {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="shower-back">×</button>' +
      '<div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--accent)">' + SVG.shower + '</span>洗了吗？水温刚好哦～</div>' +
      '<div class="modal-text">记得确认一下哦</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button class="btn-primary" id="shower-ask-yes" style="flex:1;background:var(--accent)">洗了</button>' +
      '<button class="btn-secondary" id="shower-ask-no" style="flex:1">还没</button>' +
      '</div></div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';

    document.getElementById('shower-back').onclick = function() {
      Inquiry.close();
      done();
    };
    document.getElementById('shower-ask-yes').onclick = function() {
      showerCheckCredible(done);
    };
    document.getElementById('shower-ask-no').onclick = function() {
      Inquiry.close();
      done();
      // 还没 → 5 分钟后再追问
      showerRetryTimer = setTimeout(function() {
        enqueuePopup('shower', function(d2) { showShowerAsk(d2); });
      }, 5 * 60000);
    };
  }

  var lastShowerTime = 0;

  function scheduleInspo() {
    clearTimeout(inspoTimer);
    var settings = Storage.getSettings();
    var interval = parseInt(settings.inspoInterval) || 0;
    if (interval <= 0) return;
    var startStr = settings.inspoStart || '22:00';
    var startParts = startStr.split(':');
    var startH = parseInt(startParts[0]);
    var startM = parseInt(startParts[1]) || 0;
    var now = new Date();

    // 灵感询问窗口：开始时间 ~ 入睡目标时间（过时不问，避免半夜打扰）
    var sleepStr = settings.sleepTarget || '01:00';
    var sleepH = parseInt(sleepStr.split(':')[0]);
    var sleepM = parseInt(sleepStr.split(':')[1]);

    // 计算今天窗口
    var winStart = new Date(now);
    winStart.setHours(startH, startM, 0, 0);
    var winEnd = new Date(now);
    winEnd.setHours(sleepH, sleepM, 0, 0);
    // 窗口跨零点（如 22:00 ~ 01:00）：结束时间在开始时间之前 → 结束加一天
    if (winEnd <= winStart) winEnd.setDate(winEnd.getDate() + 1);

    // 错过开始时间但仍在窗口内 → 补弹一次
    if (now >= winStart && now <= winEnd) {
      fireInspo();
      inspoTimer = setInterval(function() {
        var t = new Date();
        if (t > winEnd) { clearInterval(inspoTimer); return; }
        if (isVisible) fireInspo();
      }, interval * 60000);
      return;
    }

    // 还没到开始时间 → 等到开始再弹
    if (now < winStart) {
      var delayToStart = winStart.getTime() - now.getTime();
      inspoTimer = setTimeout(function() {
        if (isVisible) fireInspo();
        inspoTimer = setInterval(function() {
          var t = new Date();
          if (t > winEnd) { clearInterval(inspoTimer); return; }
          if (isVisible) fireInspo();
        }, interval * 60000);
      }, delayToStart);
    }
    // 窗口已过 → 今天不再弹
  }

  function fireInspo() {
    enqueuePopup('inspo', function(done) {
      showInspoMain(done);
    });
  }

  // ---- 灵感弹窗（三选项：存档明天 / 设倒计时 / 直接去做） ----
  function showInspoMain(done) {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="inspo-close">×</button>' +
      '<div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--mauve)">' + SVG.lamp + '</span>现在有灵感想做吗？</div>' +
      '<div class="modal-text">抓住它，别让它跑掉</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">' +
      '<button class="btn-primary" id="inspo-save" style="background:var(--mauve)">存档，明天继续</button>' +
      '<button class="btn-primary" id="inspo-countdown" style="background:var(--sage)">设个倒计时</button>' +
      '<button class="btn-secondary" id="inspo-now">现在就去搞</button>' +
      '</div></div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';

    document.getElementById('inspo-close').onclick = function() {
      Inquiry.close();
      done();
    };
    document.getElementById('inspo-save').onclick = function() {
      showInspoSave(done);
    };
    document.getElementById('inspo-countdown').onclick = function() {
      showInspoCountdown(done);
    };
    document.getElementById('inspo-now').onclick = function() {
      // 直接去做：不存档，记一条灵感记录方便回顾
      Storage.saveRecord({ type: 'preset', category: '灵感', content: '现在去搞事了', title: '现在去搞事了', smartCategory: '灵感' });
      Inquiry.close();
      done();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('去吧！搞完回来记一笔 💪');
    };
  }

  function showInspoSave(done) {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="inspo-back">← 返回</button>' +
      '<div class="modal-title" style="font-size:18px">想做什么？</div>' +
      '<div class="modal-text">写下来，明天首页提醒你继续</div>' +
      '<textarea class="text-input" id="inspo-text" rows="3" placeholder="比如：画一个新角色的稿子..."></textarea>' +
      '<div style="display:flex;gap:8px;margin-top:8px">' +
      '<button class="btn-primary" id="inspo-yes" style="background:var(--mauve)">存下来，明天继续</button>' +
      '</div></div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';

    document.getElementById('inspo-back').onclick = function() {
      showInspoMain(done);
    };
    document.getElementById('inspo-yes').onclick = function() {
      var text = (document.getElementById('inspo-text').value || '').trim();
      if (!text) {
        document.getElementById('inspo-text').focus();
        return;
      }
      // 主题 = 输入内容，详情留空（晚间快捷存档，主题即内容）
      Storage.saveInspiration({ title: text, content: '', urgency: 'mid', source: 'system' });
      Inquiry.close();
      done();
      window.notifyDataChanged && window.notifyDataChanged();
      notifyTiny('灵感已存档，明天首页提醒你 📌');
    };
  }

  function showInspoCountdown(done) {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="inspo-cd-back">← 返回</button>' +
      '<div class="modal-title" style="font-size:18px">设个倒计时</div>' +
      '<div class="modal-text">想做的事写下来，设个时间，到点提醒你</div>' +
      '<textarea class="text-input" id="inspo-cd-text" rows="2" placeholder="比如：画新角色的稿子"></textarea>' +
      '<div class="preset-grid" style="margin-top:4px">' +
      '<button class="preset-btn" data-cd-min="15"><span class="preset-label">15 分钟</span></button>' +
      '<button class="preset-btn" data-cd-min="30"><span class="preset-label">30 分钟</span></button>' +
      '<button class="preset-btn" data-cd-min="45"><span class="preset-label">45 分钟</span></button>' +
      '<button class="preset-btn" data-cd-min="60"><span class="preset-label">60 分钟</span></button>' +
      '</div></div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';

    document.getElementById('inspo-cd-back').onclick = function() {
      showInspoMain(done);
    };
    document.querySelectorAll('#modal [data-cd-min]').forEach(function(btn) {
      btn.onclick = function() {
        var text = (document.getElementById('inspo-cd-text').value || '').trim() || '想做的事';
        var minutes = parseInt(btn.getAttribute('data-cd-min'));
        var endAt = Date.now() + minutes * 60000;
        Storage.saveCountdown({ content: text, minutes: minutes, endAt: endAt });
        Inquiry.close();
        done();
        notifyTiny(minutes + ' 分钟后提醒你 ⏳');
        scheduleCountdownCheck();
      };
    });
  }

  function scheduleCountdownCheck() {
    clearInterval(countdownTimer);
    countdownTimer = setInterval(checkCountdown, 30000);
    checkCountdown();
  }

  function checkCountdown() {
    try {
      var cd = Storage.getCountdown();
      if (!cd || !cd.endAt) return;
      if (Date.now() >= cd.endAt) {
        // 到点：记录 + 通知 + 清除
        Storage.clearCountdown();
        clearInterval(countdownTimer);
        Storage.saveRecord({ type: 'preset', category: '灵感', content: '倒计时结束：' + cd.content, title: '倒计时结束：' + cd.content, smartCategory: '灵感' });
        window.notifyDataChanged && window.notifyDataChanged();
        var body = '「' + cd.content + '」的倒计时到了，去搞它！';
        sendNotification('⏰ 倒计时到啦', body);
        // 页面可见时直接弹个提示
        if (isVisible) {
          var b = document.createElement('div');
          b.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:200;background:var(--mauve-soft);color:var(--mauve);padding:8px 18px;border-radius:14px;font-size:13px;border:1px solid rgba(168,153,196,0.3);pointer-events:none;transition:opacity .3s';
          b.textContent = '⏰ 倒计时到啦：「' + cd.content + '」';
          document.body.appendChild(b);
          setTimeout(function() { b.style.opacity = '0'; setTimeout(function() { if (b.parentNode) b.parentNode.removeChild(b); }, 300); }, 4000);
        }
      }
    } catch(e) {}
  }

  function scheduleReview() {
    clearTimeout(reviewTimer);
    var settings = Storage.getSettings();
    var now = new Date();
    var sleepH = parseInt(settings.sleepTarget.split(':')[0]);
    var sleepM = parseInt(settings.sleepTarget.split(':')[1]);
    var target = new Date(now);
    target.setHours(sleepH, sleepM, 0, 0);
    if (sleepH < 12 && now.getHours() >= 12 && now > target) {
      target.setDate(target.getDate() + 1);
    }
    var delay = target.getTime() - now.getTime();
    if (delay > 0 && delay < 86400000) {
      reviewTimer = setTimeout(function() {
        if (isVisible) fireSleepCheck();
      }, delay);
    }
  }

  // ---- 睡前确认弹窗 ----
  // 第 1 次：入睡目标时间 → 问几点睡；选继续熬 → 问原因 + 30 分钟缓冲
  // 第 2 次：30 分钟后 → 语气升级
  // 第 3 次：再 30 分钟后（即 1 小时后）→ 强硬要求睡，不去则记录
  var sleepCheckCount = 0;

  function fireSleepCheck() {
    sleepCheckCount++;
    var isForce = sleepCheckCount >= 3;
    var isWarn = sleepCheckCount >= 2;
    enqueuePopup('review', function(done) {
      if (isForce) {
        // 第三次：强硬催睡
        var reasonOptions = ['💡 灵感来了还在创作', '🎮 游戏/视频停不下来', '😰 觉得今天什么都没做', '🥱 就是不困', '✍️ 其他'];
        var reasonBtns = reasonOptions.map(function(o, i) {
          return '<button class="preset-btn" data-reason="' + i + '">' + o + '</button>';
        }).join('');
        var html = '<div class="modal-content" style="position:relative">' +
          '<div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--rose)">' + SVG.moon + '</span>顾顾，真的该睡了</div>' +
          '<div class="modal-text">已经催你两次了。现在放下手头的事，去睡觉。<br>如果你还是选择继续熬，我需要真实记录原因：</div>' +
          '<div class="preset-grid" style="margin-top:12px">' + reasonBtns + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:10px">' +
          '<button class="btn-primary" id="sleep-force-yes" style="flex:1;background:var(--accent)">好，我去睡了</button>' +
          '</div></div>';
        document.getElementById('modal').innerHTML = html;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('modal').style.display = 'flex';
        document.querySelectorAll('[data-reason]').forEach(function(b) {
          b.onclick = function() {
            var reason = reasonOptions[parseInt(b.getAttribute('data-reason'))];
            Storage.saveLateNightReason(reason);
            window.notifyDataChanged && window.notifyDataChanged();
            Inquiry.close();
            done();
            notifyTiny('已记录：今晚又熬夜了 🫂');
          };
        });
        document.getElementById('sleep-force-yes').onclick = function() {
          Storage.patchSleepData(Storage.today(), { bedTime: settingsSleepNow(), wakeTime: '', bedAt: Date.now() });
          Inquiry.close();
          done();
        };
        return;
      }
      // 第一次/第二次：问"几点睡"
      var title = isWarn ? '顾顾，该睡了（第二次提醒）' : '顾顾，到睡觉时间了';
      var text = isWarn ? '半小时前问过你啦。今晚到底几点睡？' : '今晚打算几点睡？';
      var html = '<div class="modal-content" style="position:relative">' +
        '<button class="btn-back" id="sleep-back">×</button>' +
        '<div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--accent)">' + SVG.moon + '</span>' + title + '</div>' +
        '<div class="modal-text">' + text + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">' +
        '<button class="btn-primary" id="sleep-now" style="background:var(--accent)">现在就睡</button>' +
        '<button class="btn-primary" id="sleep-30" style="background:var(--sage)">30 分钟内</button>' +
        '<button class="btn-secondary" id="sleep-continue">还要继续熬</button>' +
        '</div></div>';
      document.getElementById('modal').innerHTML = html;
      document.getElementById('overlay').style.display = 'block';
      document.getElementById('modal').style.display = 'flex';

      document.getElementById('sleep-back').onclick = function() {
        Inquiry.close();
        done();
        scheduleNextSleepCheck();
      };
      document.getElementById('sleep-now').onclick = function() {
        Storage.patchSleepData(Storage.today(), { bedTime: settingsSleepNow(), wakeTime: '', bedAt: Date.now() });
        Inquiry.close();
        done();
        notifyTiny('晚安，顾顾 🌙');
      };
      document.getElementById('sleep-30').onclick = function() {
        Storage.patchSleepData(Storage.today(), { bedTime: settingsSleepNow(), wakeTime: '', bedAt: Date.now() });
        Inquiry.close();
        done();
        // 30 分钟后第二次催
        setTimeout(fireSleepCheck, 30 * 60000);
      };
      document.getElementById('sleep-continue').onclick = function() {
        // 问熬夜原因
        var reasonOptions = ['💡 灵感来了在做事', '🎮 游戏/视频停不下来', '😰 觉得今天什么都没做', '🥱 就是不困', '✍️ 其他'];
        var reasonBtns = reasonOptions.map(function(o, i) {
          return '<button class="preset-btn" data-rc="' + i + '">' + o + '</button>';
        }).join('');
        document.getElementById('modal').innerHTML = '<div class="modal-content"><div class="modal-title">为什么还想熬？</div>' +
          '<div class="modal-text">告诉我原因，给你缓冲时间</div>' +
          '<div class="preset-grid" style="margin-top:12px">' + reasonBtns + '</div></div>';
        document.querySelectorAll('[data-rc]').forEach(function(b) {
          b.onclick = function() {
            var reason = reasonOptions[parseInt(b.getAttribute('data-rc'))];
            Storage.saveLateNightReason(reason);
            window.notifyDataChanged && window.notifyDataChanged();
            Inquiry.close();
            done();
            notifyTiny('已记录。给你 30 分钟缓冲 🫂');
            scheduleNextSleepCheck();
          };
        });
      };
    });
  }

  function scheduleNextSleepCheck() {
    // 30 分钟后第二次，再 30 分钟第三次（1 小时后强硬）
    setTimeout(function() { if (isVisible) fireSleepCheck(); }, 30 * 60000);
  }

  function settingsSleepNow() {
    var now = new Date();
    return ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
  }

  // 今天是否已做过睡前回顾：今天的 sleepData 已有入睡时间即视为已回顾
  function hasDoneReviewToday() {
    try {
      var list = Storage.getSleepData(2);
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i].date === Storage.today() && list[i].bedTime) return true;
      }
      return false;
    } catch(e) { return false; }
  }

  function showMorningIfNeeded() {
    var sleepData = Storage.getSleepData(1);
    var last = sleepData[sleepData.length - 1];
    var el = document.getElementById('morning-greeting');
    if (!last) {
      var hour = new Date().getHours();
      if (hour < 6) {
        el.textContent = '这么晚还没睡吗？快去休息吧 🫂';
      } else if (hour < 12) {
        el.textContent = '顾顾早上好 ☀️ 今天打算干嘛？';
      } else if (hour < 18) {
        el.textContent = '下午好，顾顾 ✨';
      } else {
        el.textContent = '晚上好，顾顾 🌙';
      }
      return;
    }
    var status = 'ok';
    var bedH = parseInt(last.bedTime.split(':')[0]);
    if (bedH >= 4) status = 'bad';
    else if (bedH >= 1) status = 'late';
    el.textContent = I18N.getMorningText(status);
  }

  function dailyCheck() {
    var now = new Date();
    if (now.getHours() === parseInt(Storage.getSettings().dayStart) && now.getMinutes() < 1) {
      Storage.resetSkipCount();
      window.notifyDataChanged && window.notifyDataChanged();
      Achievement.checkDaily();
    }
  }

  function fireManually() {
    if (!isVisible) return;
    // 右下角 +：强制记录模式（无 ×，只能记录或消耗跳过次数）
    var hour = new Date().getHours();
    lastInquiryTitle = I18N.getInquiryText(hour);
    Inquiry.show(lastInquiryTitle, function(result) {
      if (!result || result.type === 'skipped') return;
      var record = {
        type: result.type,
        category: result.category || '',
        content: result.content || '',
        title: result.title || '',
        detail: result.detail || '',
        rawData: result.rawData || ''
      };
      Storage.saveRecord(record);
      window.notifyDataChanged && window.notifyDataChanged();
      retryCount = 0;
      clearTimeout(retryTimer);
    }, { force: true });
  }

  return {
    init: init,
    fireManually: fireManually,
    scheduleAll: scheduleAll,
    fireSleepCheck: fireSleepCheck,
    hasDoneReviewToday: hasDoneReviewToday
  };
})();
