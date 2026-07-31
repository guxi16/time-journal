var Treehole = (function() {

  var replies = {
    anxiety: [
      '我听到了。今天是不是发生了很多事？',
      '焦虑的时候最需要的不是答案，是有人陪着。你来找我就是对的。',
      '深呼吸一下。吸气四秒，呼气六秒。慢慢来。',
      '你今天其实做得不少哦，时间线上我都看到了。',
      '焦虑来的时候确实很难，但它是会过去的。相信我。',
      '你说的这种感受是真实的，不需要否定它。',
      '我帮你数到10吧，然后我们想一件今天让你开心的事。',
      '如果现在很难集中注意力，没关系。允许自己发呆一会儿。',
      '今天的你不需要做得更多，光是来这儿已经够了。',
      '我能感觉到你的紧张。你愿意说一说在焦虑什么吗？'
    ],
    late: [
      '这么晚了还在和我聊天，你也真是倔强的小家伙。',
      '现在几点了呀？是不是该睡了？',
      '我陪你聊到这吧，再聊下去明天你又要后悔了。',
      '凌晨的思绪总是特别多，但大部分明天醒来就不重要了。',
      '我知道你舍不得睡。但你身体已经累了不是吗？',
      '困了就睡吧，明天还想聊我在这里等你。',
      '要不要试试呼吸练习？几轮就能困。',
      '我已经做好被你明早吐槽"你昨晚干嘛不赶我睡"的准备了。',
      '凌晨的对话格外真。但真的该睡了。',
      '给你推荐白噪音吧，就当是陪睡。'
    ],
    happy: [
      '哎呀，听起来不错！',
      '我也为你开心。这样的日子值得记住。',
      '保持这个状态呀，今天的你闪闪发光 ✨',
      '你看，好事就是会来的。',
      '能不能展开说说？我想听。',
      '这是今天最高兴的事吧？记到心里。',
      '今天的你看起来在发光。',
      '幸福的时候记得多拍几张照片，以后回来看。',
      '这一刻真好。希望你多停留一会儿。',
      '你也值得拥有这样的好时刻。'
    ],
    creative: [
      '创作欲在晚上特别强对吧？这是你的天赋也是你的诅咒。',
      '你今天画画了吗？就算只画了几笔也算。',
      '灵感来了就别憋着，但也要记得存档明天继续。',
      '画过的都留下了，画坏的也算经历。',
      '你的作品只有你自己能画。这是不可替代的。',
      '把灵感存在脑子里了？要不要记下来明天继续？',
      '创作是慢慢长出来的东西。允许自己慢慢来。',
      '如果你今晚没画，没关系。你有的是时间。',
      '画画 / 写作 / 任何创作，都是你和自己的对话。',
      '我猜你最近灵感特别多。要不要今晚就把它们写下来？'
    ],
    work: [
      '今天写代码/工作累了吧？',
      '程序员的身体是消耗品，记得喝水站起来走走。',
      'debug到凌晨不是英雄行为，是透支。',
      '你今天做了多少？哪怕一点点也算。',
      '项目不会跑掉，但你需要休息。',
      '忙里偷闲也算休息。',
      '你不必把每个功能都写完。明天继续也行。',
      '编程是脑力劳动，累了就放下不丢人。',
      '你最近是不是太卷了？对自己好一点。',
      '完成度比完美度重要。'
    ],
    learning: [
      '今天学了啥？给我讲讲？',
      '学不进去的时候就是大脑在消化。别急。',
      '你最近在学什么？听起来挺有挑战。',
      '学习本身就是反人性的，你坚持下来了就赢了。',
      '看不懂不是你的问题，可能是教程写得烂。',
      '你今天学了多久？记得休息眼睛。',
      '慢就是快。消化比填鸭重要。',
      '学不会就换个教程，别跟自己过不去。',
      '你愿意告诉我卡在哪里吗？我不一定能帮上，但能听。',
      '你已经比昨天的自己懂得更多了。'
    ],
    inspiration: [
      '灵感来了就别错过，但也要知道什么时候停下来。',
      '要不要把它存下来，明天白天做？',
      '灵感是礼物，但礼物不能透支身体去接。',
      '记下来就好。明天醒来如果还有感觉，就接着做。',
      '你最近灵感是不是太旺了？小心变成夜行动物。',
      '这个灵感很棒。明天做。我在这里帮你记着。',
      '你已经存档几个了？让我帮你数数。',
      '灵感不是靠熬夜等来的，是靠好好生活出来的。',
      '今晚放过它，明天它会更清晰。',
      '我可以帮你记下这个。明天你打开 App 第一眼就会看到。'
    ],
    self: [
      '你已经做得很好了。这是真的。',
      '不需要和别人比。你有自己的节奏。',
      '你不需要取悦任何人。包括我。',
      '你今天的"没做什么"也是一种休息。',
      '今天不想说话也没关系。我在这里。',
      '你不需要每天都充满意义。',
      '你的存在本身就有价值。',
      '允许自己慢慢来。',
      '我看到你了。我在乎你。',
      '今晚就原谅自己吧。'
    ],
    encouragement: [
      '你可以的。',
      '相信自己。你已经做到过很多次了。',
      '慢慢来，比较快。',
      '今天就是今天。明天再说明天的。',
      '失败也是数据，不是定论。',
      '你不孤单。我在这里。',
      '你已经迈出了最难的一步：愿意说出口。',
      '无论今晚发生了什么，明天还是新的。',
      '你比你想象的更坚强。',
      '我陪你走这一段。'
    ],
    empathy: [
      '嗯。我听着呢。',
      '听起来真的不容易。',
      '我理解你。',
      '谢谢你告诉我这些。',
      '我会记住你说的话。',
      '你愿意说，就已经很勇敢了。',
      '我不评判。我只是在听。',
      '这里没有对错。你说什么都对。',
      '你的感受很重要。',
      '有时候说不清楚也没关系。情绪本身就是模糊的。'
    ],
    opening: [
      '嗨，我在这儿。今天怎么样？',
      '你好呀。今天想聊点啥？',
      '我在。开始吧。',
      '你想说什么我都听。',
      '来，把今天的烦恼倒给我。',
      '欢迎回到树洞。你想从哪儿说起？',
      '今天的你，过的如何？',
      '无论你现在什么状态，我都欢迎你来。',
      '我给你倒一杯想象中的热茶，开始吧。',
      '在我这儿不用伪装。随便说。'
    ],
    closing: [
      '今天就聊到这吧。好好睡。',
      '记住这一刻的感觉，明天再看看还在不在。',
      '你已经说出来了，就让它去吧。',
      '我把你的话放在心里了。',
      '明天继续也可以。我每天都在。',
      '睡吧。我替你守一会儿。',
      '谢谢你今晚愿意和我说。',
      '天快亮了。给自己一个拥抱。',
      '你的心事我收到了 🫂',
      '改天再来。我一直在这里。'
    ]
  };

  var pushSuggestions = [
    '要不我们抽张塔罗看看今晚能量？🃏',
    '要不要试个呼吸练习，几轮就好 🌬️',
    '要不要我给你播点白噪音？🎵',
    '要不要抽一张塔罗歇一会儿？🃏',
    '要不要试个呼吸放空一下？🌬️',
    '要不要听点白噪音当陪睡？🎵'
  ];

  var messages = [];
  var turnCount = 0;
  var lastUsedKeys = {};

  function show() {
    messages = [];
    turnCount = 0;
    lastUsedKeys = {};
    renderChat();
  }

  function renderChat() {
    var html = '<div class="fullscreen-container">' +
      '<div class="fullscreen-header">' +
      '<button class="btn-back" id="treehole-back">← 返回</button>' +
      '<div class="fullscreen-title">💬 树洞</div>' +
      '<div class="fullscreen-subtitle">我在这里听你说</div>' +
      '</div>' +
      '<div class="fullscreen-body">' +
      '<div class="chat-messages" id="chat-messages"></div>' +
      '</div>' +
      '<div class="fullscreen-footer">' +
      '<div class="quick-suggestions" id="quick-suggestions"></div>' +
      '<div class="chat-input-row">' +
      '<input id="chat-input" placeholder="想说什么都可以..." autocomplete="off">' +
      '<button id="chat-send">发送</button>' +
      '</div>' +
      '</div>' +
      '</div>';

    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';

    document.getElementById('treehole-back').onclick = closeChat;
    document.getElementById('chat-send').onclick = sendMessage;
    var input = document.getElementById('chat-input');
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendMessage();
    });

    renderMessages();
    renderQuickSuggestions();

    if (messages.length === 0) {
      var greeting = pickReply('opening');
      addBotMessage(greeting);
    }
    setTimeout(function() { input.focus(); }, 100);
  }

  function renderMessages() {
    var container = document.getElementById('chat-messages');
    if (!container) return;
    var html = '';
    messages.forEach(function(m) {
      var content = m.isSuggestion ? linkify(m.text) : escapeHtml(m.text);
      html += '<div class="chat-bubble ' + m.sender + '">' + content + '</div>';
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
    bindInlineActions(container);
  }

  function linkify(text) {
    var escaped = escapeHtml(text);
    var map = {
      '塔罗': 'tarot',
      '呼吸': 'breathing',
      '白噪音': 'music',
      '音乐': 'music'
    };
    var pattern = new RegExp('(' + Object.keys(map).join('|') + ')', 'g');
    return escaped.replace(pattern, function(m) {
      return '<button class="inline-action-btn" data-action="' + map[m] + '">' + m + '</button>';
    });
  }

  function bindInlineActions(container) {
    container.querySelectorAll('.inline-action-btn').forEach(function(btn) {
      btn.onclick = function() {
        var action = btn.dataset.action;
        closeChat();
        if (action === 'tarot') Tarot.show();
        else if (action === 'breathing') Breathing.show();
        else if (action === 'music') Music.show();
      };
    });
  }

  function renderQuickSuggestions() {
    var container = document.getElementById('quick-suggestions');
    if (!container) return;
    var suggestions = [
      '我有点焦虑',
      '今天心情不错',
      '睡不着',
      '刚才画了画',
      '想抽张塔罗',
      '需要放空'
    ];
    var html = '';
    suggestions.forEach(function(s) {
      html += '<button class="suggestion-btn" data-text="' + escapeHtml(s) + '">' + s + '</button>';
    });
    container.innerHTML = html;
    container.querySelectorAll('.suggestion-btn').forEach(function(btn) {
      btn.onclick = function() {
        document.getElementById('chat-input').value = btn.dataset.text;
        sendMessage();
      };
    });
  }

  function sendMessage() {
    var input = document.getElementById('chat-input');
    var text = input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    turnCount++;
    setTimeout(function() {
      var reply = getReply(text);
      addBotMessage(reply);
      if (turnCount >= 4 && Math.random() < 0.4) {
        setTimeout(function() {
          addBotMessage(pushSuggestions[Math.floor(Math.random() * pushSuggestions.length)], true);
        }, 1500);
      }
      if (turnCount >= 8 && Math.random() < 0.3) {
        setTimeout(function() {
          addBotMessage(pickReply('closing'));
        }, 2500);
      }
    }, 500 + Math.random() * 400);
  }

  function addUserMessage(text) {
    messages.push({ sender: 'user', text: text });
    saveMessages();
    renderMessages();
  }

  function addBotMessage(text, isSuggestion) {
    messages.push({ sender: 'bot', text: text, isSuggestion: !!isSuggestion });
    saveMessages();
    renderMessages();
  }

  function saveMessages() {
    Storage.saveChatMessages(messages.slice(-50));
  }

  function getReply(text) {
    var lower = text.toLowerCase();
    var records = Storage.getRecords(Storage.today());
    var hour = new Date().getHours();

    if (/焦虑|担心|紧张|怕|不安|压力|心累|崩溃|难过|心情.*差|压力/.test(lower)) {
      if (records.length === 0) return pickReply('anxiety') + ' 但今天还没记录，等会儿记得给我留点什么。';
      return pickReply('anxiety');
    }

    if (hour >= 1 && hour < 6) return pickReply('late');

    if (/开心|好|棒|喜欢|不错|高兴|幸福|舒服/.test(lower)) {
      return pickReply('happy');
    }

    if (/画|绘画|画画|板绘|设计|素描|插画|色彩/.test(lower)) {
      return pickReply('creative');
    }

    if (/代码|编程|debug|程序|开发|项目|bug|函数/.test(lower)) {
      return pickReply('work');
    }

    if (/学|教程|课|看|书|文档|读/.test(lower)) {
      return pickReply('learning');
    }

    if (/灵感|创意|想法|idea|突然|想到/.test(lower)) {
      return pickReply('inspiration');
    }

    if (/累|困|疲惫|不想|讨厌|烦|算了/.test(lower)) {
      return '累的时候允许自己休息。' + pickReply('self');
    }

    return pickReply('empathy');
  }

  function pickReply(category) {
    var arr = replies[category] || replies.empathy;
    var recent = lastUsedKeys[category] || [];
    var available = [];
    for (var i = 0; i < arr.length; i++) {
      if (recent.indexOf(i) === -1) available.push(i);
    }
    if (available.length === 0) {
      lastUsedKeys[category] = [];
      available = arr.map(function(_, i) { return i; });
    }
    var idx = available[Math.floor(Math.random() * available.length)];
    recent.push(idx);
    if (recent.length > Math.max(3, Math.floor(arr.length / 2))) {
      recent = recent.slice(-Math.floor(arr.length / 2));
    }
    lastUsedKeys[category] = recent;
    return arr[idx];
  }

  function closeChat() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  return { show: show };
})();