var I18N = (function() {

  var texts = {
    gentle: {
      inquiry: { day: '顾顾，刚才在干嘛？', evening: '顾顾，今天想记些什么？', late: '顾顾，这么晚了还在做什么？' },
      inquiry_subtitle: '先选一个方式吧',
      morning_ok: '顾顾早上好，昨晚睡得不错 ☀️ 今天打算干嘛？',
      morning_late: '昨晚有点晚哦。没关系，今天放轻松一点。昨晚在做什么？',
      morning_bad: '顾顾，你昨晚几乎没睡 🫂 发生了什么？今天不要太勉强自己。',
      review_has: '今天不是空白。可以睡了 🌙',
      review_empty: '今天放空了。偶尔放空也很好 🌸',
      inspo_title: '你现在有一件很想做的事对吧？',
      inspo_save: '📦 存档明天',
      inspo_timer: '⏱ 设倒计时',
      inspo_go: '🏃 直接去做',
      shower: '该洗澡啦 🚿 洗完就进入休息模式',
      shower_again: '还没洗吗？水温刚好哦～',
      shower_lie: '这么快？真的洗了吗 🌚',
      penalty: '今天多关照自己',
      penalty_input: '我知道最近又熬夜了...',
      treehole_greet: '嗨顾顾，我在这里。想说什么都可以。',
      treehole_anxiety: '我看到了你的时间线。你今天不是空白的。偶尔觉得焦虑也很正常。',
      treehole_late: '我知道你还没睡。没关系，不是每一天都要完美。要不要试着深呼吸？',
      treehole_default: '我在听。',
      weekly_good: '这一周你守住了自己。继续做你喜欢的事就好 💚',
      weekly_ok: '这周有好有坏，但你在努力。下周继续。',
      weekly_bad: '这周辛苦了。每一周都是新的开始。你已经很好了。',
      btn_skip: '跳过（今日剩余 X 次）',
      btn_record: '记录',
      btn_save: '保存',
      tarot_title: '今日塔罗',
      tarot_shuffle: '点击牌背翻牌',
      breathing_title: '呼吸引导',
      breathing_in: '吸气',
      breathing_hold: '屏气',
      breathing_out: '呼气',
      night_entrance_title: '不想睡？',
      night_entrance_subtitle: '今晚先随便玩玩这些',
      achievement_section: '成就',
      late_night_section: '熬夜记录',
      late_night_empty: '还没有熬夜记录，保持住 🌙'
    },
    strict: {
      inquiry: { day: '两小时了，汇报进度。', evening: '今天过得怎么样？报告。', late: '该睡了。还在做什么？' },
      morning_ok: '早上好。今天保持节奏。',
      morning_late: '昨晚又晚睡了。今天效率会降低，这你清楚。',
      morning_bad: '严重睡眠不足。今天安排少一点。发生了什么事？',
      review_has: '时间到。现在去睡。',
      review_empty: '今天没有记录。明天至少记三次。',
      inspo_title: '检测到晚间活跃。你想做什么？',
      inspo_save: '📦 存档',
      inspo_timer: '⏱ 倒计时',
      inspo_go: '🏃 继续',
      shower: '🚿 洗澡时间。马上去。',
      shower_again: '我说了去洗澡。现在。',
      shower_lie: '你说谎。去洗澡。',
      penalty: '熬夜代价：效率降低的一天',
      penalty_input: '我承认。我又熬夜了。',
      treehole_greet: '说吧。',
      treehole_anxiety: '数据显示你今天有记录。焦虑无根据。',
      treehole_late: '凌晨了。放下手机。',
      treehole_default: '继续。',
      weekly_good: '本周达标。继续保持。',
      weekly_ok: '本周中规中矩。下周目标：连续7天。',
      weekly_bad: '本周严重违规。下周重新开始。',
      btn_skip: '跳过（X次）',
      btn_record: '提交',
      btn_save: '确认',
      tarot_title: '塔罗',
      tarot_shuffle: '抽牌',
      breathing_title: '呼吸训练',
      breathing_in: '吸气4秒',
      breathing_hold: '屏气7秒',
      breathing_out: '呼气8秒'
    },
    funny: {
      inquiry: { day: '皇上，该禀报这两小时的政绩了！', evening: '爱卿，今日可曾安好？', late: '陛下，子时已过，龙体要紧啊！' },
      morning_ok: '皇上醒了！昨晚龙体安好，今日宜搞事 ☀️',
      morning_late: '陛下昨晚又微服私访了？今日宜摸鱼，不宜早朝。',
      morning_bad: '皇上昨晚通宵打江山了是吧 🫂 今天躺着吧，奏折明天批。',
      review_has: '今天战功赫赫！可以光荣下播了 👑',
      review_empty: '今天是摸鱼皇帝的一天。江山不需要天天打，休息一下。',
      inspo_title: '陛下！有灵感来报！',
      inspo_save: '📦 存档入国库',
      inspo_timer: '⏱ 设个沙漏',
      inspo_go: '🏃 御驾亲征！',
      shower: '🚿 陛下，该沐浴更衣了！热水已备好',
      shower_again: '陛下！水凉了！速去！',
      shower_lie: '陛下欺君！根本没洗吧 🌚',
      penalty: '昨晚又做贼了是吧 🕵️',
      penalty_input: '朕知错了。又熬夜了。',
      treehole_greet: '树洞开门！客官请讲～',
      treehole_anxiety: '哎呀，你今天又不是什么都没干。数字不会骗人的！',
      treehole_late: '灰姑娘警告：南瓜马车即将回收！还有30分钟！',
      treehole_default: '有趣。接着说。',
      weekly_good: '这周你是模范皇帝！龙体安康，江山稳固！',
      weekly_ok: '这周有摸鱼有干活，是个正常的皇帝了。',
      weekly_bad: '这周江山差点亡了。下周振作！',
      btn_skip: '跳（剩X次）',
      btn_record: '启奏',
      btn_save: '准了',
      tarot_title: '天机阁',
      tarot_shuffle: '点击窥探天机',
      breathing_title: '仙气修炼',
      breathing_in: '吸仙气',
      breathing_hold: '憋仙气',
      breathing_out: '吐浊气'
    },
    minimal: {
      inquiry: { day: '做了什么？', evening: '过得如何？', late: '还没睡？' },
      morning_ok: '早。',
      morning_late: '晚睡了。',
      morning_bad: '几乎没睡。',
      review_has: '该睡了。',
      review_empty: '空。',
      inspo_title: '想做什么？',
      inspo_save: '存档',
      inspo_timer: '倒计时',
      inspo_go: '继续',
      shower: '洗澡。',
      shower_again: '洗澡？',
      shower_lie: '没洗？',
      penalty: '熬夜了',
      penalty_input: '熬夜了。',
      treehole_greet: '说。',
      treehole_anxiety: '有记录。',
      treehole_late: '晚了。',
      treehole_default: '嗯。',
      weekly_good: '好。',
      weekly_ok: '中。',
      weekly_bad: '差。',
      btn_skip: '跳过',
      btn_record: '记录',
      btn_save: '保存',
      tarot_title: '塔罗',
      tarot_shuffle: '抽',
      breathing_title: '呼吸',
      breathing_in: '吸',
      breathing_hold: '屏',
      breathing_out: '呼'
    }
  };

  var mode = 'gentle';

  function setMode(m) {
    if (texts[m]) mode = m;
  }

  function getMode() {
    return mode;
  }

  function t(key) {
    var keys = key.split('.');
    var obj = texts[mode];
    for (var i = 0; i < keys.length; i++) {
      obj = obj[keys[i]];
      if (!obj) return key;
    }
    return obj || key;
  }

  function getInquiryText(hour) {
    if (hour >= 1 && hour < 6) return t('inquiry.late');
    if (hour >= 20 || hour < 6) return t('inquiry.evening');
    return t('inquiry.day');
  }

  function getMorningText(sleepStatus) {
    if (sleepStatus === 'bad') return t('morning_bad');
    if (sleepStatus === 'late') return t('morning_late');
    return t('morning_ok');
  }

  return {
    setMode: setMode,
    getMode: getMode,
    t: t,
    getInquiryText: getInquiryText,
    getMorningText: getMorningText,
    texts: texts
  };
})();
