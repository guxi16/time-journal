var Inquiry = (function() {
  var callback = null;
  var currentStep = 1;
  var selectedCategory = '';
  var currentTitle = '';

  function show(title, onDone) {
    callback = onDone;
    currentStep = 1;
    selectedCategory = '';
    currentTitle = title || '顾顾';
    renderStep();
    var overlay = document.getElementById('overlay');
    var modal = document.getElementById('modal');
    overlay.style.display = 'block';
    modal.style.display = 'flex';
  }

  function renderStep() {
    var skipCount = Storage.getRemainingSkips();
    var modal = document.getElementById('modal');
    var html = '';

    if (currentStep === 1) {
      html = renderStep1(skipCount);
    } else if (currentStep === 2) {
      html = renderStep2();
    } else if (currentStep === 3) {
      html = renderStep3();
    } else if (currentStep === 4) {
      html = renderStep4();
    }

    modal.innerHTML = '<div class="modal-content">' + html + '</div>';
    bindEvents();
  }

  function renderStep1(skipCount) {
    var skipHTML = '';
    if (skipCount > 0) {
      skipHTML = '<button class="btn-skip" id="btn-skip-modal" style="width:100%;margin-top:8px">' +
        I18N.t('btn_skip').replace('X', skipCount) + '</button>';
    }
    return '<div class="modal-title">' + currentTitle + '</div>' +
      '<div class="modal-text">先选一个方式</div>' +
      '<div class="action-grid">' +
      '<button class="action-card" data-method="quick"><span class="action-icon">' + SVG.bolt + '</span><span>快速记</span></button>' +
      '<button class="action-card" data-method="photo"><span class="action-icon">' + SVG.camera + '</span><span>拍照</span></button>' +
      '<button class="action-card" data-method="link"><span class="action-icon">' + SVG.link + '</span><span>贴链接</span></button>' +
      '<button class="action-card" data-method="say"><span class="action-icon">' + SVG.edit + '</span><span>写文字</span></button>' +
      '</div>' +
      skipHTML;
  }

  function renderStep2() {
    var presetIcons = [SVG.paint, SVG.game, SVG.video, SVG.code, SVG.book, SVG.phone, SVG.cart, SVG.broom, SVG.food, SVG.chat];
    var labels = ['画画','游戏','看视频','写代码','学习','刷手机','购物','家务','吃饭','社交'];
    var presetHTML = '';
    for (var i = 0; i < labels.length; i++) {
      presetHTML += '<button class="preset-btn" data-preset="' + i + '">' +
        '<span class="preset-icon">' + presetIcons[i] + '</span><span class="preset-label">' + labels[i] + '</span>' +
        '</button>';
    }

    return '<div class="modal-header">' +
      '<button class="btn-back" id="btn-back">← 返回</button>' +
      '<div class="modal-title" style="margin:0;font-size:18px">选刚才在干嘛</div>' +
      '</div>' +
      '<div class="preset-grid" style="margin-top:16px">' + presetHTML + '</div>';
  }

  function renderStep3() {
    return '<div class="modal-header">' +
      '<button class="btn-back" id="btn-back">← 返回</button>' +
      '<div class="modal-title" style="margin:0;font-size:18px">拍照</div>' +
      '</div>' +
      '<div class="modal-text" style="margin-top:12px">选择或拍摄一张照片</div>' +
      '<button class="btn-primary" id="btn-pick-photo" style="margin-bottom:10px">打开相机/相册</button>' +
      '<input type="text" class="text-input" id="photo-title" placeholder="这张照片是关于什么的？（必填）">' +
      '<textarea class="text-input" id="photo-extra" rows="2" placeholder="补充说明（可选）..."></textarea>' +
      '<button class="btn-primary" id="btn-save-photo">保存</button>';
  }

  function renderStep4() {
    var isLink = selectedCategory === 'link';
    return '<div class="modal-header">' +
      '<button class="btn-back" id="btn-back">← 返回</button>' +
      '<div class="modal-title" style="margin:0;font-size:18px">' +
      (isLink ? '贴链接' : '写文字') + '</div>' +
      '</div>' +
      (isLink ?
      '<input type="url" class="text-input" id="link-url" placeholder="https://...">' :
      '<textarea class="text-input" id="say-text" rows="3" placeholder="想写点什么..."></textarea>') +
      '<input type="text" class="text-input" id="content-title" placeholder="' +
      (isLink ? '这个链接是关于什么的？（必填）' : '一句话主题（必填）') + '">' +
      '<textarea class="text-input" id="content-extra" rows="2" placeholder="补充说明（可选）..."></textarea>' +
      '<button class="btn-primary" id="btn-save-content">保存</button>';
  }

  function bindEvents() {
    var backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.onclick = function() {
        currentStep = currentStep === 4 ? (selectedCategory === 'link' || selectedCategory === 'say' ? 1 : 1) : 1;
        if (selectedCategory === 'photo' || selectedCategory === 'link' || selectedCategory === 'say') {
          currentStep = 1;
        } else {
          currentStep = 1;
        }
        selectedCategory = '';
        renderStep();
      };
    }

    var skipBtn = document.getElementById('btn-skip-modal');
    if (skipBtn) {
      skipBtn.onclick = function() {
        var remaining = Storage.useSkip();
        // useSkip 额度用完时返回 false；remaining 为 0 表示"第三次跳过"仍应放行
        if (remaining !== false) {
          finish({ type: 'skipped' });
        } else {
          // 今日跳过已用完：重新渲染，跳过按钮消失
          renderStep();
        }
      };
    }

    document.querySelectorAll('.action-card').forEach(function(btn) {
      btn.onclick = function() {
        var method = btn.dataset.method;
        if (method === 'quick') {
          currentStep = 2;
          renderStep();
        } else if (method === 'photo') {
          selectedCategory = 'photo';
          currentStep = 3;
          renderStep();
          var pickBtn = document.getElementById('btn-pick-photo');
          if (pickBtn) pickBtn.click();
        } else if (method === 'link') {
          selectedCategory = 'link';
          currentStep = 4;
          renderStep();
        } else if (method === 'say') {
          selectedCategory = 'say';
          currentStep = 4;
          renderStep();
        }
      };
    });

    document.querySelectorAll('.preset-btn').forEach(function(btn) {
      btn.onclick = function() {
        var idx = parseInt(btn.dataset.preset);
var presets = ['画画','游戏','看视频','写代码','学习','刷手机','购物','家务','吃饭','社交'];
    var cat = presets[idx];
    finish({ type: 'preset', category: cat, content: cat });
      };
    });

    function showOtherInput() {
      return;
    }

    var pickBtn = document.getElementById('btn-pick-photo');
    if (pickBtn) {
      pickBtn.onclick = function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.style.display = 'none';
        document.body.appendChild(input);
        input.click();
        input.addEventListener('change', function() {
          var file = input.files[0];
          if (!file) {
            if (input.parentNode) document.body.removeChild(input);
            return;
          }
          compressImage(file, function(dataUrl) {
            if (input.parentNode) document.body.removeChild(input);
            var saveBtn = document.getElementById('btn-save-photo');
            if (saveBtn) {
              saveBtn.dataset.photoData = dataUrl;
              saveBtn.textContent = '已选图片，填写主题后保存';
            }
          });
        });
      };
    }

    var savePhotoBtn = document.getElementById('btn-save-photo');
    if (savePhotoBtn) {
      savePhotoBtn.onclick = function() {
        var title = (document.getElementById('photo-title').value || '').trim();
        var extra = (document.getElementById('photo-extra').value || '').trim();
        var data = savePhotoBtn.dataset.photoData;
        if (!data) { alert('请先选一张图片'); return; }
        if (!title) { alert('请填写这张照片的主题'); return; }
        finish({ type: 'photo', title: title, content: extra, rawData: data });
      };
    }

    var saveContentBtn = document.getElementById('btn-save-content');
    if (saveContentBtn) {
      saveContentBtn.onclick = function() {
        var title = (document.getElementById('content-title').value || '').trim();
        var extra = (document.getElementById('content-extra').value || '').trim();
        if (selectedCategory === 'link') {
          var url = (document.getElementById('link-url').value || '').trim();
          if (!url) { alert('请输入链接'); return; }
          if (!title) { alert('请填写链接主题'); return; }
          finish({ type: 'link', title: title, content: extra, detail: url });
        } else {
          var text = (document.getElementById('say-text').value || '').trim();
          if (!text) { alert('请输入内容'); return; }
          if (!title) { alert('请填写主题'); return; }
          finish({ type: 'say', title: title, content: text + (extra ? '\n' + extra : '') });
        }
      };
    }
  }

  function compressImage(file, cb) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var maxW = 800, maxH = 800;
        var ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        cb(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function finish(data) {
    // 先保存/处理 callback，任何错误都不影响关闭弹窗
    try {
      if (callback) callback(data);
    } catch(e) {
      console.warn('callback error:', e);
    }
    // 广播数据变更：所有已注册视图强制重绘（时间线/回顾/灵感列表）
    try {
      if (typeof window !== 'undefined') {
        if (window.notifyDataChanged) window.notifyDataChanged();
        else if (window.App && window.App.notifyDataChanged) window.App.notifyDataChanged();
        else if (window.App && window.App.refreshTimeline) window.App.refreshTimeline();
      }
    } catch(e) {
      console.warn('notify error:', e);
    }
    // 保存成功小提示（页面内可见，方便顾顾确认保存已触发）
    if (data && data.type !== 'skipped') {
      try {
        if (window.App && window.App.showSavedToast) window.App.showSavedToast();
      } catch(e) {}
    }
    close();
  }

  function close() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
    currentStep = 1;
    selectedCategory = '';
    currentTitle = '';
    // 弹窗关闭后恢复右下角 + 号（编辑/删除弹窗打开时会被隐藏）
    try {
      var fab = document.getElementById('fab-manual');
      if (fab) fab.style.display = '';
    } catch(e) {}
  }

  return { show: show, close: close };
})();