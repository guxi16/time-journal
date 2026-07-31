var Tarot = (function() {
  var suits = [
    { name: '权杖', emoji: '\uD83D\uDD25', color: '#e05555' },
    { name: '圣杯', emoji: '\uD83D\uDC27', color: '#4a90d9' },
    { name: '宝剑', emoji: '\u2694\uFE0F', color: '#e8a840' },
    { name: '星币', emoji: '\u2B50', color: '#4caf84' }
  ];

  var majorArcana = [
    { name: '愚者', meaning: '新的开始，跟随直觉，自由冒险', shape: 'circle', color: '#e8a840' },
    { name: '魔术师', meaning: '创造力、技能、意志力的展现', shape: 'diamond', color: '#4a90d9' },
    { name: '女祭司', meaning: '直觉、内在智慧、静观其变', shape: 'circle', color: '#7c6ff7' },
    { name: '女皇', meaning: '丰盛、滋养、创造力绽放', shape: 'circle', color: '#4caf84' },
    { name: '皇帝', meaning: '秩序、权威、稳扎稳打', shape: 'square', color: '#e05555' },
    { name: '教皇', meaning: '传统、学习、寻求指引', shape: 'triangle', color: '#7c6ff7' },
    { name: '恋人', meaning: '选择、关系、价值观的抉择', shape: 'circle', color: '#d470a0' },
    { name: '战车', meaning: '意志力、克服困难、前进', shape: 'diamond', color: '#e8a840' },
    { name: '力量', meaning: '内在力量、耐心、温柔征服', shape: 'circle', color: '#e05555' },
    { name: '隐者', meaning: '内省、独处、寻找真相', shape: 'triangle', color: '#7c6ff7' },
    { name: '命运之轮', meaning: '转变、机遇、顺应变化', shape: 'circle', color: '#4a90d9' },
    { name: '正义', meaning: '公平、决策、承担责任', shape: 'square', color: '#4a90d9' },
    { name: '倒吊人', meaning: '换个角度、放下、等待', shape: 'triangle', color: '#4a90d9' },
    { name: '死神', meaning: '结束与新生、蜕变、放下过去', shape: 'diamond', color: '#888' },
    { name: '节制', meaning: '平衡、调和、耐心等待', shape: 'circle', color: '#4caf84' },
    { name: '恶魔', meaning: '束缚、欲望、看清执念', shape: 'square', color: '#e05555' },
    { name: '高塔', meaning: '突然的变化、打破幻象、重建', shape: 'diamond', color: '#e05555' },
    { name: '星星', meaning: '希望、疗愈、信任未来', shape: 'star', color: '#4a90d9' },
    { name: '月亮', meaning: '潜意识、迷惑、面对恐惧', shape: 'circle', color: '#7c6ff7' },
    { name: '太阳', meaning: '喜悦、成功、活力充沛', shape: 'circle', color: '#e8a840' },
    { name: '审判', meaning: '觉醒、召唤、迎接新的阶段', shape: 'diamond', color: '#4a90d9' },
    { name: '世界', meaning: '圆满、完成、新的旅程开始', shape: 'circle', color: '#4caf84' }
  ];

  var minorRanks = ['王牌','二','三','四','五','六','七','八','九','十','侍从','骑士','皇后','国王'];
  var minorMeanings = [
    '新的开始与潜力', '选择与平衡', '成长与扩展', '稳定与基础',
    '冲突与挑战', '胜利与庆祝', '坚持与反思', '突破与行动',
    '满足与成就', '完成与结果', '学习与好奇', '行动与追求',
    '关怀与滋养', '掌控与领导'
  ];

  var allCards = [];
  majorArcana.forEach(function(c) { allCards.push({ name: c.name, meaning: c.meaning, type: 'major', shape: c.shape, color: c.color }); });
  suits.forEach(function(suit) {
    minorRanks.forEach(function(rank, i) {
      allCards.push({
        name: suit.name + ' ' + rank,
        meaning: suit.emoji + ' ' + minorMeanings[i],
        type: 'minor',
        suit: suit.name,
        shape: 'circle',
        color: suit.color
      });
    });
  });

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function show() {
    var todayDraw = Storage.getTodayTarotDraw();
    if (todayDraw) {
      showDrawResult(todayDraw);
      return;
    }
    showDrawScreen();
  }

  function showDrawScreen() {
    var shuffled = shuffle(allCards);
    var drawn = shuffled.slice(0, 3);
    var positions = ['日运', '重点', '建议'];
    var drawData = { cards: drawn, positions: positions, date: Storage.realToday() };

    var html = '<div class="modal-content">' +
      '<button class="btn-back" id="tarot-back">← 返回</button>' +
      '<div class="modal-title">' + I18N.t('tarot_title') + '</div>' +
      '<div class="modal-text">' + I18N.t('tarot_shuffle') + '</div>' +
      '<div style="display:flex;justify-content:center;gap:14px;margin:10px 0">';

    drawn.forEach(function(card, i) {
      html += '<div class="tarot-card" data-idx="' + i + '" data-shape="' + (card.shape || 'circle') + '" data-color="' + (card.color || '#888') + '">' +
        '<div class="tarot-inner" id="tarot-inner-' + i + '">' +
        '<div class="tarot-front" id="tarot-front-' + i + '">' +
        getSVGShape(card.shape || 'circle', card.color || '#888', card.suit, card.name) +
        '<div class="tarot-name">' + card.name + '</div>' +
        '<div class="tarot-mean">' + card.meaning + '</div>' +
        '<div class="tarot-position">' + positions[i] + '</div>' +
        '</div>' +
        '<div class="tarot-back">' +
        '<div class="tarot-back-text">🃏</div>' +
        '<div class="tarot-position">' + positions[i] + '</div>' +
        '</div>' +
        '</div></div>';
    });

    html += '</div></div>';

    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('tarot-back').onclick = Inquiry.close;

    var flipped = 0;
    drawn.forEach(function(card, i) {
      var cardEl = document.querySelector('.tarot-card[data-idx="' + i + '"]');
      cardEl.onclick = function() {
        var inner = document.getElementById('tarot-inner-' + i);
        if (inner.classList.contains('flipped')) return;
        inner.classList.add('flipped');
        flipped++;
        if (flipped === 3) {
          Storage.saveTarotDraw(drawData);
        }
      };
    });
  }

  function showDrawResult(drawData) {
    var html = '<div class="modal-content" style="position:relative">' +
      '<button class="btn-back" id="tarot-back">← 返回</button>' +
      '<div class="modal-title">' + I18N.t('tarot_title') + '</div>' +
      '<div class="modal-text">今天的牌已经抽过了</div>' +
      '<div style="display:flex;justify-content:center;gap:14px;margin:10px 0">';

    drawData.cards.forEach(function(card, i) {
      html += '<div class="tarot-card">' +
        '<div class="tarot-inner flipped">' +
        '<div class="tarot-front" style="transform:rotateY(180deg)">' +
        getSVGShape(card.shape || 'circle', card.color || '#888', card.suit, card.name) +
        '<div class="tarot-name">' + card.name + '</div>' +
        '<div class="tarot-mean">' + card.meaning + '</div>' +
        '<div class="tarot-position">' + drawData.positions[i] + '</div>' +
        '</div>' +
        '<div class="tarot-back" style="visibility:hidden"></div>' +
        '</div></div>';
    });

    html += '</div></div>';
    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('tarot-back').onclick = Inquiry.close;
  }

  function getSVGShape(shape, color, suit, cardName) {
    var size = 60;
    if (suit === '圣杯') {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 40 40">' +
        '<path d="M3 11 Q10 8 17 11 T31 11 T37 12" stroke="#5a8ec0" fill="none" stroke-width="0.8" opacity="0.5"/>' +
        '<path d="M11 15 L29 15 L26 27 Q20 31 14 27 Z" fill="#4a90d9" opacity="0.55" stroke="#5a8ec0" stroke-width="0.5"/>' +
        '<ellipse cx="20" cy="16" rx="8.5" ry="1.8" fill="#85B7EB" opacity="0.45"/>' +
        '<path d="M29 18 Q35 21 31 27" stroke="#4a90d9" fill="none" stroke-width="1.8" stroke-linecap="round"/>' +
        '<line x1="14" y1="32" x2="26" y2="32" stroke="#4a90d9" stroke-width="2.5" opacity="0.7" stroke-linecap="round"/>' +
        '<line x1="18" y1="32" x2="22" y2="32" stroke="#85B7EB" stroke-width="2.5" stroke-linecap="round"/>' +
        '</svg>';
    }
    if (suit === '权杖') {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 40 40">' +
        '<path d="M20 3 Q14 7 17 12 Q20 10 23 12 Q26 7 20 3 Z" fill="#e05555" opacity="0.75"/>' +
        '<path d="M20 11 Q17 14 19 17 Q20 15 21 17 Q23 14 20 11 Z" fill="#e8a840"/>' +
        '<ellipse cx="20" cy="16.5" rx="4" ry="1.5" fill="#fac775" opacity="0.8"/>' +
        '<rect x="18.5" y="16" width="3" height="18" fill="#8b5a2b" opacity="0.8" rx="1"/>' +
        '<line x1="18.5" y1="20" x2="21.5" y2="20" stroke="#5d3a1a" stroke-width="0.3" opacity="0.7"/>' +
        '<line x1="18.5" y1="26" x2="21.5" y2="26" stroke="#5d3a1a" stroke-width="0.3" opacity="0.7"/>' +
        '<ellipse cx="20" cy="34" rx="6" ry="2" fill="#8b5a2b" opacity="0.5"/>' +
        '</svg>';
    }
    if (suit === '宝剑') {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 40 40">' +
        '<path d="M3 7 Q15 5 32 9" stroke="#d0d8e0" fill="none" stroke-width="0.6" opacity="0.45"/>' +
        '<path d="M3 33 Q15 31 32 35" stroke="#d0d8e0" fill="none" stroke-width="0.6" opacity="0.45"/>' +
        '<path d="M3 11 Q12 9 22 12" stroke="#d0d8e0" fill="none" stroke-width="0.5" opacity="0.35"/>' +
        '<circle cx="20" cy="5" r="1.8" fill="#d0d8e0" opacity="0.85"/>' +
        '<rect x="18.5" y="6.5" width="3" height="3.5" fill="#d0d8e0" opacity="0.75" rx="0.5"/>' +
        '<rect x="13.5" y="10" width="13" height="2.2" fill="#e0e6eb" opacity="0.85" rx="0.6"/>' +
        '<polygon points="19,12.5 21,12.5 20.4,32 19.6,32" fill="white" opacity="0.85" stroke="#d0d8e0" stroke-width="0.4"/>' +
        '<polygon points="19.6,32 20.4,32 20,35" fill="white" opacity="0.9"/>' +
        '</svg>';
    }
    if (suit === '星币') {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 40 40">' +
        '<circle cx="5" cy="6" r="0.9" fill="#b8954a" opacity="0.65"/>' +
        '<circle cx="35" cy="6" r="0.9" fill="#b8954a" opacity="0.65"/>' +
        '<circle cx="5" cy="34" r="0.9" fill="#b8954a" opacity="0.65"/>' +
        '<circle cx="35" cy="34" r="0.9" fill="#b8954a" opacity="0.65"/>' +
        '<circle cx="3" cy="20" r="0.7" fill="#b8954a" opacity="0.5"/>' +
        '<circle cx="37" cy="20" r="0.7" fill="#b8954a" opacity="0.5"/>' +
        '<circle cx="20" cy="20" r="11.5" fill="#a87a3a" opacity="0.7" stroke="#8b6331" stroke-width="0.8"/>' +
        '<circle cx="20" cy="20" r="8" fill="none" stroke="#d4a574" stroke-width="0.7"/>' +
        '<text x="20" y="24" text-anchor="middle" font-size="11" fill="#f0d5a8" font-weight="bold">✦</text>' +
        '</svg>';
    }
    if (cardName === '愚者') {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 40 40">' +
        '<polygon points="20,4 23.5,15.5 36,16 26,24 30,36 20,28.5 10,36 14,24 4,16 16.5,15.5" ' +
        'fill="#0a0a0a" stroke="#3a3a3a" stroke-width="0.5" opacity="0.92"/>' +
        '</svg>';
    }
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 40 40">' +
      '<polygon points="20,4 23.5,15.5 36,16 26,24 30,36 20,28.5 10,36 14,24 4,16 16.5,15.5" ' +
      'fill="white" stroke="#e0e0e0" stroke-width="0.4" opacity="0.88"/>' +
      '<polygon points="20,7 22.5,16 32,16.5 24,23 27,32 20,26 13,32 16,23 8,16.5 17.5,16" ' +
      'fill="white" opacity="0.4"/>' +
      '</svg>';
  }

  return { show: show };
})();
