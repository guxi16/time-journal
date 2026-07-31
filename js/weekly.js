var Weekly = (function() {
  function generate() {
    var records = Storage.getRecentRecords(7);
    var sleepData = Storage.getSleepData(7);
    var reasons = Storage.getLateNightReasons(7);
    var lateCount = 0;

    sleepData.forEach(function(d) {
      var bedH = parseInt(d.bedTime.split(':')[0]);
      var target = parseInt(Storage.getSettings().sleepTarget.split(':')[0]);
      if (bedH > target) lateCount++;
    });

    var activityCount = {};
    records.forEach(function(r) {
      var cat = r.category || '其他';
      activityCount[cat] = (activityCount[cat] || 0) + 1;
    });

    var topActivity = '';
    var topCount = 0;
    for (var k in activityCount) {
      if (activityCount[k] > topCount) {
        topCount = activityCount[k];
        topActivity = k;
      }
    }

    var reasonCount = {};
    reasons.forEach(function(r) {
      var cat = r.reason.replace(/[^\u4e00-\u9fa5]/g, '') || '未分类';
      reasonCount[cat] = (reasonCount[cat] || 0) + 1;
    });
    var topReason = '';
    var topReasonCount = 0;
    for (var k in reasonCount) {
      if (reasonCount[k] > topReasonCount) {
        topReasonCount = reasonCount[k];
        topReason = k;
      }
    }

    var earlyDays = sleepData.length - lateCount;
    var tone;

    if (lateCount === 0 && sleepData.length >= 5) tone = 'good';
    else if (lateCount >= 5) tone = 'bad';
    else tone = 'ok';

    var letter = '';
    var greeting = I18N.t('weekly_' + tone);
    letter += greeting + '\n\n';

    if (sleepData.length > 0) {
      letter += '本周你早睡了 ' + earlyDays + ' 天，熬夜了 ' + lateCount + ' 天。\n';
    }
    if (topActivity) {
      letter += '你这周做得最多的是：' + topActivity + '（' + topCount + ' 次）\n';
    }
    if (topReason) {
      letter += '熬夜最多原因：' + topReason + '\n';
    }

    if (tone === 'good') {
      letter += '\n继续保持这个节奏。你已经找到了属于自己的作息。';
    } else if (tone === 'ok') {
      letter += '\n有好有坏很正常。下周试着把熬夜天数再减少一天。';
    } else {
      letter += '\n这一周辛苦了。下周是全新的七天。从今晚开始。';
    }

    return letter;
  }

  function showWeeklyLetter() {
    var letter = generate();
    var html = '<div class="modal-content">' +
      '<div class="modal-title">💌 每周安心信</div>' +
      '<div class="modal-text" style="white-space:pre-line;text-align:left;line-height:1.8">' + letter + '</div>' +
      '<div class="modal-actions"><button class="btn-primary" id="weekly-close">收到</button></div>' +
      '</div>';

    document.getElementById('modal').innerHTML = html;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('weekly-close').onclick = function() {
      Inquiry.close();
    };
  }

  return {
    showWeeklyLetter: showWeeklyLetter,
    generate: generate
  };
})();
