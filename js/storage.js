var Storage = (function() {
  // 默认 0 点算新一天（凌晨 00:00 算今天）。用户可在设置里调整 dayStart。
  var DAY_END_HOUR = 0;

  function getStore(key) {
    try { return JSON.parse(localStorage.getItem('tj_' + key) || 'null'); }
    catch(e) { return null; }
  }

  function setStore(key, val) {
    try {
      localStorage.setItem('tj_' + key, JSON.stringify(val));
      return true;
    } catch(e) {
      // 存储满或其他异常：尝试清理最旧的带图记录后重试一次
      try {
        if (key === 'records') {
          var list = getStore('records') || [];
          var kept = [];
          var dropped = 0;
          list.forEach(function(r) {
            if (dropped < 20 && r.rawData && r.rawData.length > 50000) { dropped++; return; }
            kept.push(r);
          });
          localStorage.setItem('tj_' + key, JSON.stringify(kept));
          console.warn('存储空间不足，已自动清理 ' + dropped + ' 条旧照片记录');
          return true;
        }
        localStorage.setItem('tj_' + key, JSON.stringify(val));
        return true;
      } catch(e2) {
        console.error('存储失败:', e2.message);
        return false;
      }
    }
  }

  function getUsageMB() {
    var total = 0;
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k) total += (localStorage.getItem(k) || '').length;
    }
    return (total / 1024 / 1024).toFixed(2);
  }

  function today() {
    var d = new Date();
    var dayStartH = parseInt(((getStore('settings') || {}).dayStart) || '0') || 0;
    if (d.getHours() < dayStartH) d.setDate(d.getDate() - 1);
    // 用本地时间拼日期，避免 toISOString 的 UTC 偏移（凌晨保存显示成前天）
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  function realToday() {
    var d = new Date();
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function saveRecord(rec) {
    rec.id = rec.id || uid();
    rec.timestamp = rec.timestamp || Date.now();
    rec.date = rec.date || today();
    var records = getStore('records') || [];
    records.unshift(rec);
    setStore('records', records);
    return rec;
  }

  function getRecords(date) {
    date = date || today();
    var records = getStore('records') || [];
    return records.filter(function(r) { return r.date === date; });
  }

  function getAllRecords() {
    return getStore('records') || [];
  }

  function getRecentRecords(days) {
    days = days || 7;
    var records = getStore('records') || [];
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(DAY_END_HOUR, 0, 0, 0);
    return records.filter(function(r) { return r.timestamp >= cutoff.getTime(); });
  }

  function saveInspiration(inspo) {
    inspo.id = inspo.id || uid();
    inspo.timestamp = inspo.timestamp || Date.now();
    inspo.date = inspo.date || today();
    inspo.completed = inspo.completed || false;
    inspo.urgency = inspo.urgency || 'low';
    inspo.source = inspo.source || 'self';
    // 兼容旧数据：只有 content 没有 title 时，把 content 当主题
    inspo.title = inspo.title || inspo.content || '';
    inspo.content = inspo.content || '';
    var list = getStore('inspirations') || [];
    list.unshift(inspo);
    setStore('inspirations', list);
    return inspo;
  }

  function getPendingInspirations() {
    var list = getStore('inspirations') || [];
    var pending = list.filter(function(i) { return !i.completed; });
    // 排序：紧急(high) > 中等(mid) > 宽松(low)，同紧急度按创建时间最早的在前
    var order = { high: 0, mid: 1, low: 2 };
    pending.sort(function(a, b) {
      var ua = order[a.urgency] !== undefined ? order[a.urgency] : 2;
      var ub = order[b.urgency] !== undefined ? order[b.urgency] : 2;
      if (ua !== ub) return ua - ub;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    return pending;
  }

  function getAllInspirations() {
    return getStore('inspirations') || [];
  }

  function markInspirationDone(id) {
    var list = getStore('inspirations') || [];
    list = list.map(function(i) {
      if (i.id === id) i.completed = true;
      return i;
    });
    setStore('inspirations', list);
  }

  function archiveOldInspirations() {
    var list = getStore('inspirations') || [];
    var threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    list = list.filter(function(i) {
      return i.completed || i.timestamp > threeDaysAgo;
    });
    setStore('inspirations', list);
  }

  // ---- 灵感倒计时（设倒计时：到点提醒） ----
  function saveCountdown(cd) {
    cd.id = cd.id || uid();
    cd.createdAt = Date.now();
    setStore('countdown', cd);
    return cd;
  }

  function getCountdown() {
    return getStore('countdown') || null;
  }

  function clearCountdown() {
    localStorage.removeItem('tj_countdown');
  }

  function getSettings() {
    var defaults = {
      sleepTarget: '01:00',
      wakeTarget: '09:00',
      inquiryInterval: 2,
      dayStart: '00:00',
      showerStart: '22:30',
      showerEnd: '23:30',
      styleMode: 'gentle',
      inspoInterval: 180,
      inspoStart: '22:00',
      skipCount: 0,
      skipDate: '',
      streakSleep: 0,
      streakWake: 0,
      totalStars: 0
    };
    var saved = getStore('settings') || {};
    for (var k in defaults) {
      if (!(k in saved)) saved[k] = defaults[k];
    }
    return saved;
  }

  function saveSettings(s) {
    var current = getSettings();
    for (var k in s) current[k] = s[k];
    setStore('settings', current);
    return current;
  }

  function resetSkipCount() {
    var s = getSettings();
    // 只在跨天时重置，今天已重置过就不再动（修复：每次刷新/打开都清零的问题）
    if (s.skipDate === realToday()) return s;
    s.skipCount = 0;
    s.skipDate = realToday();
    saveSettings(s);
    return s;
  }

  function useSkip() {
    var s = getSettings();
    if (s.skipDate !== realToday()) resetSkipCount();
    if (s.skipCount >= 3) return false;
    s.skipCount++;
    s.skipDate = realToday();
    saveSettings(s);
    return 3 - s.skipCount;
  }

  function getRemainingSkips() {
    var s = getSettings();
    if (s.skipDate !== realToday()) return 3;
    return Math.max(0, 3 - s.skipCount);
  }

  function getAchievements() {
    var defaults = {
      star: false, guardian: false, clock: false, aware: false,
      streakDays: 0, wakeStableDays: 0, lastWakeTime: null,
      dailyRecordCount: 0, achievementDate: '',
      lastConsecutive: 0,
      starUnlockDate: null, guardianUnlockDate: null,
      clockUnlockDate: null, awareUnlockDate: null
    };
    var saved = getStore('achievements') || {};
    for (var k in defaults) {
      if (!(k in saved)) saved[k] = defaults[k];
    }
    return saved;
  }

  function saveAchievements(a) {
    setStore('achievements', a);
  }

  function getAchievementsHistory() {
    return getStore('achievementsHistory') || {};
  }

  function saveAchievementsHistory(h) {
    setStore('achievementsHistory', h);
  }

  function categorizeRecord(rec) {
    var content = (rec.title || '') + ' ' + (rec.content || '') + ' ' + (rec.detail || '');
    var lower = content.toLowerCase();

    var keywords = {
      '创作': ['画', '绘画', '画画', '板绘', '设计', '创作', '颜色', '素描', '插画', '描线', '填色', '做图', '修图', '摄影', '拍片', '写文', '写作', '小说', '剪辑', '后期', '渲染', '动画'],
      '学习': ['学', '教程', '网课', '课程', '看', '读', '书', '文档', '笔记', '研究', '学习', '学完', '听课'],
      '工作': ['代码', '程序', '编程', '项目', 'debug', '函数', 'bug', '写代码', '开发', 'coding', '改', '会议', '工', '搬砖', '上班', '加班', '工作', '文档', '需求', '改bug', '修bug'],
      '游戏': ['游戏', '日课', '任务', '打怪', '副本', 'pvp', 'pve', '战斗', '上号', '开黑', '原神', '王者', 'lol', 'moba', '抽卡', '通关', '活动', '深渊', '升级'],
      '娱乐': ['刷', '视频', 'b站', '抖音', '小红书', '微博', 'twitter', 'youtube', 'tiktok', '油管', '看剧', '电视剧', '电影', '综艺', '八卦', '吃瓜'],
      '社交': ['聊天', '微信', 'qq', '朋友', '家人', '联系', '打电话', '见面', '约会', '聚餐', '闺蜜', '饭局', '聚会', '结婚', '生日', '婚礼', '伴郎', '伴娘'],
      '吃饭': ['饭', '吃', '餐', '外卖', '食堂', '咖啡', '奶茶', '零食', '宵夜', '早餐', '午餐', '晚餐', '饱', '喝'],
      '运动': ['运动', '跑步', '健身', '瑜伽', '跳舞', '散步', '跳', '爬', '操', '锻炼', '有氧', '无氧', '撸铁', '打球'],
      '休息': ['睡', '躺', '休', '放松', '摸鱼', '发呆', '小睡', '午睡', '摸', '小憩', '养神', '闭眼'],
      '购物': ['买', '购物', '下单', '快递', '淘宝', '拼多多', '京东', '收', '收货', '拆', '拆箱', '买买买', '下单一单', '购入'],
      '家务': ['打扫', '整理', '收拾', '清洁', '洗碗', '洗衣', '拖地', '扫地', '擦', '清理', '洗', '拖', '换床单', '叠被', '打扫卫生'],
      '洗澡': ['洗澡', '沐浴', '洗头', '洗澡啦', '洗完了', '泡澡'],
      '灵感': ['灵感', '创意', '想法', 'idea', '突然想到', '想起来', '想搞', '想要', '萌生', '灵感来', '脑子里'],
      '情绪': ['开心', '难过', '哭', '笑', '幸福', '感受', '心情', '感到', '感觉', '日记', '碎碎念', '想', '焦虑', '紧张', '不安', '担心', '压力', '心累', '崩溃', '烦', '烦心', '难受', '累', '急', '烦死了'],
      '音乐': ['听', '歌', '音乐', '音', 'radio', '电台', '听歌', '单曲', '循环', '旋律', '刷歌', '新歌', '听音乐', 'k歌', 'ktv'],
      '动漫': ['番', '动漫', '漫画', '动画', '追番', '更新']
    };

    var bestCategory = '其他';
    var bestScore = 0;
    for (var cat in keywords) {
      var kwList = keywords[cat];
      var score = 0;
      kwList.forEach(function(kw) {
        var idx = 0;
        while ((idx = lower.indexOf(kw, idx)) !== -1) {
          score++;
          idx += kw.length;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestCategory = cat;
      }
    }

    return bestCategory;
  }

  function saveRecord(rec) {
    rec.id = rec.id || uid();
    rec.timestamp = rec.timestamp || Date.now();
    rec.date = rec.date || today();
    if (!rec.smartCategory && (rec.title || rec.content)) {
      rec.smartCategory = categorizeRecord(rec);
    }
    var records = getStore('records') || [];
    records.unshift(rec);
    var ok = setStore('records', records);
    if (!ok) {
      // 重试：丢掉最旧的带图记录
      records = records.filter(function(r, i) {
        if (i > 200 && r.rawData) return false;
        return true;
      });
      setStore('records', records);
    }
    return rec;
  }

  function deleteRecord(id) {
    var records = getStore('records') || [];
    records = records.filter(function(r) { return r.id !== id; });
    setStore('records', records);
    return true;
  }

  function updateRecord(id, patch) {
    var records = getStore('records') || [];
    var found = null;
    records = records.map(function(r) {
      if (r.id === id) {
        for (var k in patch) r[k] = patch[k];
        // 内容变了但没指定分类 → 自动重新分类（保留原分类若识别为"其他"）
        if ((patch.title !== undefined || patch.content !== undefined) && !patch.smartCategory) {
          var auto = categorizeRecord(r);
          var orig = r.smartCategory || r.category;
          r.smartCategory = (auto === '其他' && orig && orig !== '其他') ? orig : auto;
        }
        found = r;
      }
      return r;
    });
    setStore('records', records);
    return found;
  }

  function saveSleepData(data) {
    var list = getStore('sleepData') || [];
    list = list.filter(function(d) { return d.date !== data.date; });
    list.push(data);
    list.sort(function(a, b) { return a.date < b.date ? -1 : 1; });
    if (list.length > 90) list = list.slice(-90);
    setStore('sleepData', list);
  }

  function getSleepData(days) {
    days = days || 30;
    var list = getStore('sleepData') || [];
    return list.slice(-days);
  }

  function saveChatMessages(msgs) {
    setStore('chatMessages', msgs);
  }

  function getChatMessages() {
    return getStore('chatMessages') || [];
  }

  function saveTarotDraw(draw) {
    draw.date = realToday();
    var draws = getStore('tarotDraws') || [];
    draws.push(draw);
    if (draws.length > 90) draws = draws.slice(-90);
    setStore('tarotDraws', draws);
  }

  function getTodayTarotDraw() {
    var draws = getStore('tarotDraws') || [];
    return draws.filter(function(d) { return d.date === realToday(); })[0] || null;
  }

  function getTarotHistory() {
    return getStore('tarotDraws') || [];
  }

  function saveLateNightReason(reason) {
    var s = getSettings();
    var data = { date: today(), reason: reason, timestamp: Date.now() };
    var reasons = getStore('lateNightReasons') || [];
    reasons = reasons.filter(function(r) { return r.date !== data.date; });
    reasons.push(data);
    setStore('lateNightReasons', reasons);
  }

  function getLateNightReasons(days) {
    days = days || 30;
    var reasons = getStore('lateNightReasons') || [];
    return reasons.slice(-days);
  }

  // ---- 点赞功能 ----
  function getLikes() {
    var d = getStore('likes') || { count: 0, lastDate: '', history: [] };
    return d;
  }

  function addLike() {
    var d = getLikes();
    d.count = (d.count || 0) + 1;
    d.lastDate = realToday();
    if (!d.history) d.history = [];
    d.history.push({ date: realToday(), timestamp: Date.now() });
    if (d.history.length > 100) d.history = d.history.slice(-100);
    setStore('likes', d);
    return d;
  }

  function clearAll() {
    var keys = Object.keys(localStorage).filter(function(k) { return k.startsWith('tj_'); });
    keys.forEach(function(k) { localStorage.removeItem(k); });
  }

  function exportData() {
    var data = {};
    var keys = Object.keys(localStorage).filter(function(k) { return k.startsWith('tj_'); });
    keys.forEach(function(k) { data[k] = JSON.parse(localStorage.getItem(k)); });
    return JSON.stringify(data, null, 2);
  }

  function updateDayStart(hour) {
    DAY_END_HOUR = parseInt(hour) || 4;
  }

  return {
    today: today,
    realToday: realToday,
    uid: uid,
    saveRecord: saveRecord,
    deleteRecord: deleteRecord,
    updateRecord: updateRecord,
    getRecords: getRecords,
    getAllRecords: getAllRecords,
    getRecentRecords: getRecentRecords,
    saveInspiration: saveInspiration,
    getPendingInspirations: getPendingInspirations,
    getAllInspirations: getAllInspirations,
    markInspirationDone: markInspirationDone,
    archiveOldInspirations: archiveOldInspirations,
    getSettings: getSettings,
    saveSettings: saveSettings,
    resetSkipCount: resetSkipCount,
    useSkip: useSkip,
    getRemainingSkips: getRemainingSkips,
    getAchievements: getAchievements,
    saveAchievements: saveAchievements,
    getAchievementsHistory: getAchievementsHistory,
    saveAchievementsHistory: saveAchievementsHistory,
    categorizeRecord: categorizeRecord,
    saveSleepData: saveSleepData,
    getSleepData: getSleepData,
    saveChatMessages: saveChatMessages,
    getChatMessages: getChatMessages,
    saveTarotDraw: saveTarotDraw,
    getTodayTarotDraw: getTodayTarotDraw,
    getTarotHistory: getTarotHistory,
    saveLateNightReason: saveLateNightReason,
    getLateNightReasons: getLateNightReasons,
    saveCountdown: saveCountdown,
    getCountdown: getCountdown,
    clearCountdown: clearCountdown,
    getLikes: getLikes,
    addLike: addLike,
    clearAll: clearAll,
    exportData: exportData,
    updateDayStart: updateDayStart,
    getUsageMB: getUsageMB
  };
})();
