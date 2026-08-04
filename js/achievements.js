var Achievement = (function() {
  var progressiveChains = {
    sleep: {
      name: '睡眠守护', icon: SVG.moon, desc: '连续早睡升级', type: 'positive',
      levels: [
        { level: 1, icon: SVG.spark, name: '早睡之星', desc: '连续3天在目标时间前入睡', req: { days: 3, strict: false } },
        { level: 2, icon: SVG.crown, name: '作息守护者', desc: '连续7天在目标时间前入睡', req: { days: 7, strict: false } },
        { level: 3, icon: SVG.mind, name: '褪黑素本素', desc: '连续14天在23:00前睡觉', req: { days: 14, strict: true } },
        { level: 4, icon: SVG.moon, name: '睡眠之神', desc: '连续30天在23:00前睡觉', req: { days: 30, strict: true } }
      ]
    },
    wake: {
      name: '晨光追逐', icon: SVG.sun, desc: '连续早起升级', type: 'positive',
      levels: [
        { level: 1, icon: SVG.flower, name: '早起鸟儿', desc: '连续3天在目标时间前起床', req: { days: 3 } },
        { level: 2, icon: SVG.sun, name: '日出而作', desc: '连续7天在目标时间前起床', req: { days: 7 } },
        { level: 3, icon: SVG.sun, name: '晨光收割者', desc: '连续14天在目标时间前起床', req: { days: 14 } }
      ]
    },
    record: {
      name: '记录日记', icon: SVG.scroll, desc: '持续记录升级', type: 'positive',
      levels: [
        { level: 1, icon: SVG.leaf, name: '自我觉察', desc: '一天主动记录 ≥3次', req: { daily: 3 } },
        { level: 2, icon: SVG.sword, name: '日拱一卒', desc: '连续7天每天有记录', req: { days: 7, any: true } },
        { level: 3, icon: SVG.book, name: '记忆达人', desc: '连续14天每天有记录', req: { days: 14, any: true } },
        { level: 4, icon: SVG.book, name: '时间守护者', desc: '连续30天每天有记录', req: { days: 30, any: true } }
      ]
    },
    biocl: {
      name: '生物钟大师', icon: SVG.clock, desc: '起床稳定升级', type: 'positive',
      levels: [
        { level: 1, icon: SVG.chart, name: '生物钟稳定', desc: '连续5天起床 ±1小时', req: { days: 5 } },
        { level: 2, icon: SVG.clock, name: '人体闹钟', desc: '连续10天起床 ±1小时', req: { days: 10 } }
      ]
    },
    total: {
      name: '记忆宫殿', icon: SVG.crown, desc: '累计记录升级', type: 'positive',
      levels: [
        { level: 1, icon: SVG.lamp, name: '灵感猎人', desc: '累计20次灵感记录', req: { inspo: 20 } },
        { level: 2, icon: SVG.flower, name: '塔罗大师', desc: '累计10次塔罗抽牌', req: { tarot: 10 } },
        { level: 3, icon: SVG.book, name: '记忆达人', desc: '累计50条记录', req: { totalRecords: 50 } },
        { level: 4, icon: SVG.crown, name: '百年孤独', desc: '累计100条记录', req: { totalRecords: 100 } }
      ]
    },
    rest: {
      name: '劳逸结合', icon: SVG.shower, desc: '休息也很重要', type: 'positive',
      levels: [
        { level: 1, icon: SVG.bed, name: '摸鱼新手', desc: '一天休息记录最多', req: { dailyRestMax: true } },
        { level: 2, icon: SVG.shield, name: '摸鱼大师', desc: '累计3天休息记录最多', req: { restDays: 3 } },
        { level: 3, icon: SVG.meditation, name: '摸鱼大帝', desc: '累计7天休息记录最多', req: { restDays: 7 } }
      ]
    }
  };

  var specialAchievements = [];
  var negativeAchievements = [
    { key: 'nightowl', icon: SVG.skull, name: '熬夜冠军', desc: '凌晨4点后还在活跃', meme: { locked: '你最好永远不要解锁这个成就', unlocked: '凌晨4点还在！你的精神已突破次元 💫' } },
    { key: 'gamer', icon: SVG.game, name: '游戏废人', desc: '一天游戏 > 80%', meme: { locked: '>80%...这天你在另一个世界', unlocked: '今天游戏时间爆表 ✨ 玩得开心呀' } },
    { key: 'overtime', icon: SVG.briefcase, name: '社畜本畜', desc: '连续6天工作 > 80%', meme: { locked: '身体说它想请假 6 天了', unlocked: '工作爆表模式启动 🚀 记得喝水哦' } },
    { key: 'caffeine', icon: SVG.coffee, name: '咖啡因依赖', desc: '一天3杯咖啡/奶茶', meme: { locked: '血液里流的是咖啡因', unlocked: '今天咖啡因摄入了满满一天 ☕' } },
    { key: 'dopamine', icon: SVG.heart, name: '多巴胺过山车', desc: '一天中既焦虑又开心', meme: { locked: '情绪过山车说明你在认真活着', unlocked: '情绪过山车 🎢 起起伏伏才精彩呀' } },
    { key: 'midnight_eat', icon: SVG.bowl, name: '深夜食堂', desc: '凌晨有进食记录', meme: { locked: '凌晨的饭特别香', unlocked: '深夜食堂开张 🍜 夜宵更有滋味呢' } },
    { key: 'sleep_debt', icon: SVG.battery, name: '睡眠债大户', desc: '累计晚睡 ≥30 天', meme: { locked: '欠身体的睡眠总要还的', unlocked: '睡眠小银行账户欠了30天 😴 慢慢还呀' } }
  ];

  function checkDaily() {
    var ach = Storage.getAchievements();
    var settings = Storage.getSettings();
    var records = Storage.getRecords(Storage.today());
    var allRecords = Storage.getAllRecords();
    var sleepData = Storage.getSleepData(90);
    var today = Storage.today();

    checkProgressiveChains(ach, settings, records, allRecords, sleepData, today);
    checkNegative(ach, settings, records, allRecords, sleepData, today);

    Storage.saveAchievements(ach);
    updateDisplay();
  }

  function checkProgressiveChains(ach, settings, records, allRecords, sleepData, today) {
    Object.keys(progressiveChains).forEach(function(chainKey) {
      var chain = progressiveChains[chainKey];
      var currentLevel = ach[chainKey] || 0;
      var newLevel = calcProgressiveLevel(chainKey, chain, settings, records, allRecords, sleepData, today);

      if (newLevel > currentLevel) {
        for (var l = currentLevel + 1; l <= newLevel; l++) {
          if (l > 1) {
            var prev = chain.levels[l - 2];
            var cur = chain.levels[l - 1];
            unlockEffect(prev.icon + ' ' + prev.name + ' → 升级为 ' + cur.icon + ' ' + cur.name + '！');
          } else {
            unlockEffect(chain.levels[0].icon + ' ' + chain.levels[0].name + ' 解锁！');
          }
          Lifebook.addBonus();
          addHistoryEvent(chainKey + '_' + l, 'gained', Storage.realToday());
        }
        ach[chainKey] = newLevel;
      } else if (newLevel < currentLevel && currentLevel > 0) {
        var dropped = chain.levels[currentLevel - 1];
        var droppedTo = chain.levels[Math.max(0, newLevel - 1)];
        addHistoryEvent(chainKey + '_' + currentLevel, 'lost', Storage.realToday());
        ach[chainKey] = newLevel;
        if (newLevel > 0) {
          notifyTiny(dropped.icon + ' ' + dropped.name + ' 掉了 → 回到 ' + droppedTo.icon + ' ' + droppedTo.name);
        } else {
          notifyTiny(dropped.icon + ' ' + dropped.name + ' 已中断');
        }
      }
    });
  }

  function calcProgressiveLevel(chainKey, chain, settings, records, allRecords, sleepData, today) {
    if (chainKey === 'sleep') return calcSleepLevel(settings, sleepData);
    if (chainKey === 'wake') return calcWakeLevel(settings, sleepData);
    if (chainKey === 'record') return calcRecordLevel(records, allRecords, today);
    if (chainKey === 'biocl') return calcBioclLevel(sleepData);
    if (chainKey === 'total') return calcTotalLevel(allRecords);
    if (chainKey === 'rest') return calcRestLevel(allRecords);
    return 0;
  }

  function calcSleepLevel(settings, sleepData) {
    if (sleepData.length === 0) return 0;
    var targetH = parseInt(settings.sleepTarget.split(':')[0]);
    var strictConsec = countConsecutive(sleepData, function(d) {
      var h = parseInt(d.bedTime.split(':')[0]);
      return h <= 23 && h >= 18;
    });
    var normalConsec = countConsecutive(sleepData, function(d) {
      return parseInt(d.bedTime.split(':')[0]) <= targetH;
    });

    if (strictConsec >= 30) return 4;
    if (strictConsec >= 14) return 3;
    if (normalConsec >= 7 || strictConsec >= 7) return 2;
    if (normalConsec >= 3) return 1;
    return 0;
  }

  function calcWakeLevel(settings, sleepData) {
    if (sleepData.length === 0) return 0;
    var targetWH = parseInt(settings.wakeTarget.split(':')[0]);
    var cons = countConsecutive(sleepData, function(d) {
      if (!d.wakeTime) return false;
      var wh = parseInt(d.wakeTime.split(':')[0]);
      return wh <= targetWH;
    });
    if (cons >= 14) return 3;
    if (cons >= 7) return 2;
    if (cons >= 3) return 1;
    return 0;
  }

  function calcRecordLevel(records, allRecords, today) {
    if (allRecords.length < 50) {
      if (records.length >= 3) return 1;
      return 0;
    }

    var dateSet = {};
    allRecords.forEach(function(r) { dateSet[r.date] = (dateSet[r.date] || 0) + 1; });
    // 成就用 r.date（本地时间日期字段）统计长期数据；时间线显示 2 天不影响成就计算
    var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    var dates = Object.keys(dateSet).sort().reverse();
    var cons = 0;
    var prev = null;
    for (var i = 0; i < dates.length; i++) {
      if (prev) {
        var expected = new Date(prev);
        expected.setDate(expected.getDate() - 1);
        if (expected.toISOString().slice(0, 10) === dates[i]) cons++;
        else break;
      }
      cons++;
      prev = dates[i];
    }
    if (cons >= 30) return 4;
    if (cons >= 14) return 3;
    if (cons >= 7) return 2;
    if (records.length >= 3) return 1;
    return 0;
  }

  function calcBioclLevel(sleepData) {
    if (sleepData.length === 0) return 0;
    var cons = 0;
    var lastW = null;
    for (var i = sleepData.length - 1; i >= 0; i--) {
      if (!sleepData[i].wakeTime) break;
      if (lastW && Math.abs(timeToMin(sleepData[i].wakeTime) - timeToMin(lastW)) <= 60) cons++;
      else break;
      lastW = sleepData[i].wakeTime;
    }
    if (cons >= 10) return 2;
    if (cons >= 5) return 1;
    return 0;
  }

  function calcTotalLevel(allRecords) {
    var inspoCount = allRecords.filter(function(r) { return r.category === '灵感' || r.category === '灵感到来'; }).length;
    var tarotHistory = Storage.getTarotHistory();
    var totalTarot = tarotHistory.length;
    var total = allRecords.length;
    var level = 0;
    if (inspoCount >= 20) level = Math.max(level, 1);
    if (totalTarot >= 10) level = Math.max(level, 2);
    if (total >= 50) level = Math.max(level, 3);
    if (total >= 100) level = Math.max(level, 4);
    return level;
  }

  function calcRestLevel(allRecords) {
    var dateSet = {};
    allRecords.forEach(function(r) {
      if (!dateSet[r.date]) dateSet[r.date] = { total: 0, rest: 0 };
      dateSet[r.date].total++;
      if ((r.smartCategory || r.category) === '休息') dateSet[r.date].rest++;
    });
    var days = Object.keys(dateSet).filter(function(date) {
      var d = dateSet[date];
      if (d.total === 0) return false;
      var maxCat = 0; var maxV = 0;
      for (var k in d) { if (k !== 'total' && d[k] > maxV) { maxV = d[k]; maxCat = k; } }
      return maxCat === 'rest';
    });
    var chrono = 0;
    var prev = null;
    var sorted = days.sort().reverse();
    for (var i = 0; i < sorted.length; i++) {
      if (prev) {
        var ex = new Date(prev); ex.setDate(ex.getDate() - 1);
        if (ex.toISOString().slice(0,10) === sorted[i]) chrono++;
        else break;
      }
      chrono++;
      prev = sorted[i];
    }
    if (chrono >= 7) return 3;
    if (chrono >= 3) return 2;
    if (days.length >= 1) return 1;
    return 0;
  }

  function checkNegative(ach, settings, records, allRecords, sleepData, today) {
    var now = new Date();
    if (now.getHours() >= 4 && now.getHours() < 6) {
      if (!ach.nightowl) {
        ach.nightowl = true; ach.nightowlUnlockDate = Storage.realToday();
        addHistoryEvent('nightowl', 'gained', ach.nightowlUnlockDate);
        unlockEffect('🌙 你的精神已突破次元！');
      } else { addHistoryEvent('nightowl', 'regained', Storage.realToday()); }
    }

    if (records.length >= 3) {
      var catCount = {};
      records.forEach(function(r) { var c = r.smartCategory || r.category || '其他'; catCount[c] = (catCount[c]||0) + 1; });

      if ((catCount['游戏']||0) * 5 > records.length * 4) {
        if (!ach.gamer) { ach.gamer = true; ach.gamerUnlockDate = Storage.realToday(); addHistoryEvent('gamer', 'gained', ach.gamerUnlockDate); unlockEffect('🎮 今天游戏爆表啦'); }
        else { addHistoryEvent('gamer', 'regained', Storage.realToday()); }
      }

      var foodRecs = records.filter(function(r) {
        return /咖啡|奶茶|外卖|食堂|零食|吃|饭/.test((r.title||'')+(r.content||''));
      });
      if (foodRecs.filter(function(r) { return /咖啡|奶茶/.test((r.title||'')+(r.content||'')); }).length >= 3) {
        if (!ach.caffeine) { ach.caffeine = true; ach.caffeineUnlockDate = Storage.realToday(); addHistoryEvent('caffeine', 'gained', ach.caffeineUnlockDate); unlockEffect('☕ 今天咖啡因满电'); }
        else { addHistoryEvent('caffeine', 'regained', Storage.realToday()); }
      }

      var hasAnxiety = records.some(function(r) { return (r.smartCategory||r.category) === '情绪' && /焦虑|紧张|不安|压力|担心|崩溃|烦/.test((r.title||'')+(r.content||'')); });
      var hasJoy = records.some(function(r) { return (r.smartCategory||'') === '情绪' && /开心|高兴|幸福|笑/.test((r.title||'')+(r.content||'')); });
      if (hasAnxiety && hasJoy) {
        if (!ach.dopamine) { ach.dopamine = true; ach.dopamineUnlockDate = Storage.realToday(); addHistoryEvent('dopamine', 'gained', ach.dopamineUnlockDate); unlockEffect('🎢 情绪过山车全速前进'); }
        else { addHistoryEvent('dopamine', 'regained', Storage.realToday()); }
      }

      if (now.getHours() >= 1 && now.getHours() < 6 && foodRecs.length > 0) {
        if (!ach.midnight_eat) { ach.midnight_eat = true; ach.midnight_eatUnlockDate = Storage.realToday(); addHistoryEvent('midnight_eat', 'gained', ach.midnight_eatUnlockDate); unlockEffect('🍜 深夜食堂开业'); }
        else { addHistoryEvent('midnight_eat', 'regained', Storage.realToday()); }
      }
    }

    var dateWorkPct = {};
    allRecords.forEach(function(r) {
      if (!dateWorkPct[r.date]) dateWorkPct[r.date] = { total:0, work:0 };
      dateWorkPct[r.date].total++;
      if ((r.smartCategory||r.category)==='工作') dateWorkPct[r.date].work++;
    });
    var sorted = Object.keys(dateWorkPct).sort().reverse();
    var workStreak = 0;
    for (var i = 0; i < sorted.length; i++) {
      var d = dateWorkPct[sorted[i]];
      if (d.total > 0 && d.work * 5 > d.total * 4) workStreak++;
      else break;
    }
    if (workStreak >= 6) {
      if (!ach.overtime) { ach.overtime = true; ach.overtimeUnlockDate = Storage.realToday(); addHistoryEvent('overtime', 'gained', ach.overtimeUnlockDate); unlockEffect('💼 工作模式满载啦'); }
      else { addHistoryEvent('overtime', 'regained', Storage.realToday()); }
    }

    var targetH = parseInt(settings.sleepTarget.split(':')[0]);
    var lateDays = sleepData.filter(function(d) { return parseInt(d.bedTime.split(':')[0]) > targetH; }).length;
    if (lateDays >= 30) {
      if (!ach.sleep_debt) { ach.sleep_debt = true; ach.sleep_debtUnlockDate = Storage.realToday(); addHistoryEvent('sleep_debt', 'gained', ach.sleep_debtUnlockDate); unlockEffect('😴 睡眠欠债小能手'); }
      else { addHistoryEvent('sleep_debt', 'regained', Storage.realToday()); }
    }
  }

  function countConsecutive(arr, fn) {
    var count = 0;
    for (var i = arr.length - 1; i >= 0; i--) {
      if (fn(arr[i])) count++;
      else break;
    }
    return count;
  }

  function timeToMin(t) { var p = t.split(':'); return parseInt(p[0]) * 60 + parseInt(p[1]); }

  function unlockEffect(msg) {
    createConfetti();
    var b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200;background:var(--accent);color:#1a1a1a;padding:16px 28px;border-radius:20px;font-size:15px;font-weight:600;animation:fadeIn 0.3s;text-align:center;box-shadow:0 8px 30px rgba(201,169,110,0.5);pointer-events:none';
    b.textContent = msg; document.body.appendChild(b);
    setTimeout(function() { b.remove(); }, 4000);
  }

  function notifyTiny(msg) {
    var b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:200;background:var(--rose-soft);color:var(--rose);padding:8px 20px;border-radius:14px;font-size:13px;animation:fadeIn 0.3s;pointer-events:none';
    b.textContent = msg; document.body.appendChild(b);
    setTimeout(function() { b.remove(); }, 3000);
  }

  // 挂到全局：app.js / scheduler.js 都在用这个轻提示
  if (typeof window !== 'undefined') window.notifyTiny = notifyTiny;

  function createConfetti() {
    var c = document.createElement('div'); c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:199';
    document.body.appendChild(c);
    var cols = ['#c9a96e','#e8a840','#d4a574','#faeece','#a8d5b8','#d0d8e0'];
    for (var i = 0; i < 30; i++) {
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;width:6px;height:6px;border-radius:50%;background:' + cols[Math.floor(Math.random()*cols.length)] + ';left:' + (Math.random()*100) + '%;top:-20px;animation:confettiFall ' + (1+Math.random()*1.5) + 's ease-in forwards;animation-delay:' + (Math.random()*0.5) + 's';
      c.appendChild(d);
    }
    setTimeout(function() { c.remove(); }, 2500);
  }

  function addHistoryEvent(key, type, date) {
    var all = Storage.getAchievementsHistory();
    if (!all[key]) all[key] = [];
    all[key].push({ type: type, date: date, timestamp: Date.now() });
    Storage.saveAchievementsHistory(all);
  }

  function updateDisplay() {
    var ach = Storage.getAchievements();
    var container = document.getElementById('achievement-list');
    if (!container) return;
    var html = '';
    var visibleCount = 3;
    var items = [];

    Object.keys(progressiveChains).forEach(function(key) {
      var chain = progressiveChains[key];
      var currentLevel = ach[key] || 0;
      var lv = currentLevel > 0 ? chain.levels[currentLevel - 1] : chain.levels[0];
      var name = lv.name, desc = lv.desc;
      if (currentLevel === 0) desc = '未解锁 · ' + desc;

      items.push({
        type: 'chain', key: key, icon: chain.icon, name: name, desc: desc,
        unlocked: currentLevel > 0, level: currentLevel, maxLevel: chain.levels.length
      });
    });

    negativeAchievements.forEach(function(n) {
      items.push({
        type: 'negative', key: n.key, icon: n.icon, name: n.name, desc: n.desc,
        unlocked: ach[n.key] || false
      });
    });

    items.forEach(function(item, i) {
      var cls = item.unlocked ? 'unlocked' : 'locked';
      if (item.type === 'negative') cls += ' negative-ach';
      var style = item.type === 'negative' && !item.unlocked ? 'border-left:3px solid rgba(201,132,122,0.3)' : '';
      if (item.type === 'negative' && item.unlocked) style = 'border-left:3px solid var(--rose)';
      if (item.type === 'chain' && item.level > 0) style = 'border-left:3px solid var(--accent)';
      if (i >= visibleCount) style += ';display:none';

      var nameStr = item.type === 'chain' && item.level > 0 && item.level < item.maxLevel ?
        item.name + ' (' + item.level + '/' + item.maxLevel + ')' : item.name;

      html += '<div class="achievement-card ' + cls + '" data-type="' + item.type + '" data-key="' + item.key + '" style="' + style + '">' +
        '<div class="ach-row"><span class="ach-icon">' + item.icon + '</span>' +
        '<div class="ach-info"><span class="ach-name">' + nameStr + '</span>' +
        '<span class="ach-desc">' + item.desc + '</span></div>' +
        '<span class="ach-arrow">›</span></div></div>';
    });

    var total = items.length;
    var btnText = '展开全部 (' + total + ') →';
    html += '<button class="btn-expand" id="btn-expand-achievements">' + btnText + '</button>';
    container.innerHTML = html;

    var expanded = false;
    document.getElementById('btn-expand-achievements').onclick = function() {
      expanded = !expanded;
      container.querySelectorAll('.achievement-card').forEach(function(c, i) { if (i >= visibleCount) c.style.display = expanded ? '' : 'none'; });
      this.textContent = expanded ? '收起 ↑' : btnText;
    };

    container.querySelectorAll('.achievement-card').forEach(function(card) {
      card.onclick = function() { showDetail(card.dataset.type, card.dataset.key); };
    });
  }

  function showDetail(type, key) {
    var ach = Storage.getAchievements();
    if (type === 'chain') {
      var chain = progressiveChains[key];
      var currentLevel = ach[key] || 0;
      var html = '<div class="modal-content"><div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--accent)">' + chain.icon + '</span>' + chain.name + '</div>';
      chain.levels.forEach(function(lv, i) {
        var unlocked = (i + 1) <= currentLevel;
        html += '<div style="padding:8px 0;opacity:' + (unlocked ? '1' : '0.4') + ';display:flex;align-items:center;gap:12px">' +
          '<span style="font-size:24px">' + lv.icon + '</span>' +
          '<div><span style="font-weight:600;font-size:14px">' + lv.name + '</span>' +
          '<span style="font-size:12px;color:var(--text-secondary);display:block">' + lv.desc + '</span></div>' +
          (unlocked ? '<span style="color:var(--accent);font-size:12px">✓</span>' : '') +
          '</div>';
      });
      var history = Storage.getAchievementsHistory();
      var timelineHTML = '';
      var allEvents = [];
      chain.levels.forEach(function(lv, i) {
        var lvKey = key + '_' + (i + 1);
        if (history[lvKey]) history[lvKey].forEach(function(e) { allEvents.push(e); });
      });
      if (allEvents.length > 0) {
        timelineHTML = '<div class="ach-timeline">';
        allEvents.sort(function(a, b) { return b.timestamp - a.timestamp; }).slice(0, 10).forEach(function(e) {
          var label = e.type === 'gained' ? '点亮' : '中断';
          timelineHTML += '<div class="ach-timeline-item"><span class="ach-timeline-dot ' + e.type + '"></span><span>' + e.date + ' · ' + label + '</span></div>';
        });
        timelineHTML += '</div>';
      }
      html += timelineHTML + '<button class="btn-primary" style="margin-top:12px" id="ach-close">知道了</button></div>';
      document.getElementById('modal').innerHTML = html;
      document.getElementById('ach-close').onclick = Inquiry.close;
    } else {
      var neg = null;
      negativeAchievements.forEach(function(n) { if (n.key === key) neg = n; });
      if (!neg) return;
      var isUnlocked = ach[key];
      var html = '<div class="modal-content"><div class="modal-title" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:24px;height:24px;display:inline-flex;color:var(--rose)">' + neg.icon + '</span>' + neg.name + ' <span style="background:var(--rose-soft);color:var(--rose);font-size:11px;padding:2px 8px;border-radius:8px;font-weight:400">异常成就</span></div>' +
        '<div class="modal-text">' + neg.desc + '</div>' +
        '<div class="ach-detail-meme">' + (isUnlocked ? neg.meme.unlocked : neg.meme.locked) + '</div>';
      var history = Storage.getAchievementsHistory();
      if (history[key]) {
        html += '<div class="ach-timeline">';
        history[key].slice(-10).forEach(function(e) {
          html += '<div class="ach-timeline-item"><span class="ach-timeline-dot ' + e.type + '"></span><span>' + e.date + ' · ' + (e.type === 'gained' ? '点亮' : '重燃') + '</span></div>';
        });
        html += '</div>';
      }
      html += '<button class="btn-primary" style="margin-top:12px" id="ach-close">知道了</button></div>';
      document.getElementById('modal').innerHTML = html;
      document.getElementById('ach-close').onclick = Inquiry.close;
    }
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
  }

  function checkPenalty() {
    var sleepData = Storage.getSleepData(3);
    var settings = Storage.getSettings();
    var lateCount = sleepData.filter(function(d) { return parseInt(d.bedTime.split(':')[0]) > parseInt(settings.sleepTarget.split(':')[0]); }).length;
    if (lateCount >= 3) {
      Inquiry.show(I18N.t('penalty_input'), function(r) { Storage.saveRecord({ type: 'say', content: r.content || '承认熬夜' }); });
    }
  }

  function exportSleepData() {
    // 已废弃：原逻辑把"第一条记录时间"当成入睡时间、起床时间写死 09:00，污染成就/图表/周信数据。
    // 入睡/起床数据改为由睡前回顾页和早起记录显式提供，这里不再自动写入。
    return;
  }

  return {
    checkDaily: checkDaily,
    updateDisplay: updateDisplay,
    showDetail: showDetail,
    checkPenalty: checkPenalty,
    exportSleepData: exportSleepData
  };
})();