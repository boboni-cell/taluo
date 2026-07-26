/**
 * 塔罗占卜屋 - 主应用逻辑
 * 处理页面导航、抽牌、翻牌动画、解牌等核心功能
 */

(function() {
  'use strict';

  // ==================== 应用状态 ====================
  const state = {
    currentPage: 'home',        // home | mode-select | draw | result
    questionType: '',           // 事业 | 财运 | 桃花
    mode: '',                   // single | spread
    availableCards: [],         // 当前可抽取的牌
    selectedCards: [],          // 已抽取的牌 [{card, isReversed, position}]
    currentSpreadStep: 0,       // 三牌阵当前步骤: 0=过去,1=现在,2=未来
    isAudioOn: false,
    isShuffling: false
  };

  // 问题类型映射
  const QUESTION_TYPES = {
    career: '事业',
    wealth: '财运',
    love: '桃花'
  };

  // 三牌阵位置名称
  const SPREAD_POSITIONS = ['过去', '现在', '未来'];

  // ==================== DOM 引用 ====================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    app: $('#app'),
    homePage: $('#home-page'),
    modeSelectPage: $('#mode-select-page'),
    drawPage: $('#draw-page'),
    readingArea: $('#reading-area'),
    cardsGrid: $('#cards-grid'),
    audioToggle: $('#audio-toggle'),
    shareOverlay: $('#share-overlay'),
    shareCard: $('#share-card')
  };

  // ==================== 音频管理 ====================
  // 使用 Web Audio API 生成氛围音效
  let audioCtx = null;
  let ambianceNode = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function startAmbiance() {
    if (!audioCtx) initAudio();
    if (ambianceNode) return;

    // 创建简单的氛围音：低频持续的柔和音色
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // 混合多个低频正弦波，模拟神秘氛围
      data[i] = (
        Math.sin(2 * Math.PI * 80 * i / audioCtx.sampleRate) * 0.08 +
        Math.sin(2 * Math.PI * 120 * i / audioCtx.sampleRate) * 0.05 +
        Math.sin(2 * Math.PI * 160 * i / audioCtx.sampleRate) * 0.03 +
        Math.sin(2 * Math.PI * 200 * i / audioCtx.sampleRate + Math.sin(i / 10000)) * 0.02
      );
    }

    ambianceNode = audioCtx.createBufferSource();
    ambianceNode.buffer = buffer;
    ambianceNode.loop = true;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.3;

    ambianceNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    ambianceNode.start();

    state.isAudioOn = true;
    dom.audioToggle.classList.remove('muted');
    dom.audioToggle.textContent = '🔊';
  }

  function stopAmbiance() {
    if (ambianceNode) {
      ambianceNode.stop();
      ambianceNode = null;
    }
    state.isAudioOn = false;
    dom.audioToggle.classList.add('muted');
    dom.audioToggle.textContent = '🔇';
  }

  function toggleAudio() {
    initAudio();
    if (state.isAudioOn) {
      stopAmbiance();
    } else {
      startAmbiance();
    }
  }

  // ==================== 星空背景 ====================
  function createStars() {
    const container = $('#stars-container');
    const count = 60;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = (Math.random() * 2 + 1) + 'px';
      star.style.height = star.style.width;
      star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
      star.style.setProperty('--delay', (Math.random() * 5) + 's');
      container.appendChild(star);
    }
  }

  // ==================== 工具函数 ====================
  /** 随机打乱数组（Fisher-Yates） */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** 随机选取 n 个元素 */
  function pickRandom(arr, n) {
    return shuffle(arr).slice(0, n);
  }

  /** 随机正位/逆位 */
  function randomOrientation() {
    return Math.random() < 0.5;
  }

  /** 页面切换 */
  function showPage(pageId) {
    $$('.page').forEach(p => p.classList.add('page-hidden'));
    const page = $(`#${pageId}`);
    if (page) {
      page.classList.remove('page-hidden');
      if (pageId === 'draw-page') page.classList.add('active');
    }
    state.currentPage = pageId;
  }

  /** Toast 提示 */
  function showToast(msg) {
    const existing = $('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ==================== 首页逻辑 ====================
  function setupHomePage() {
    $$('.btn-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        if (!type) return;
        state.questionType = type;
        showModeSelect();
      });
    });
  }

  // ==================== 模式选择页 ====================
  function showModeSelect() {
    showPage('mode-select-page');
    state.mode = '';
    state.selectedCards = [];
    state.currentSpreadStep = 0;
  }

  function setupModeSelect() {
    $$('.btn-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (!mode) return;
        state.mode = mode;
        state.selectedCards = [];
        state.currentSpreadStep = 0;
        startDrawPage();
      });
    });
  }

  // ==================== 抽牌页面 ====================
  function startDrawPage() {
    showPage('draw-page');

    // 准备可用牌库
    state.availableCards = shuffle([...window.TAROT_DECK.getAvailableCards()]);

    // 随机选取12张展示
    const displayCards = pickRandom(state.availableCards, 12);

    // 渲染卡牌网格
    renderCardsGrid(displayCards);

    // 更新页面提示
    updateDrawHint();

    // 隐藏解读区域
    dom.readingArea.classList.remove('active');
    dom.readingArea.innerHTML = '';

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 执行洗牌动画
    setTimeout(() => animateShuffle(), 300);
  }

  function renderCardsGrid(cards) {
    dom.cardsGrid.innerHTML = '';
    dom.cardsGrid.classList.toggle('spread-mode', state.mode === 'spread');

    cards.forEach((card, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'card-wrapper';
      wrapper.dataset.index = index;
      wrapper.dataset.cardId = card.id;

      wrapper.innerHTML = `
        <div class="card-inner">
          <div class="card-back">
            <span class="card-back-pattern">✦</span>
          </div>
          <div class="card-front">
            <div class="card-img-placeholder">🔮</div>
            <div class="card-name-cn">${card.nameCN}</div>
            <div class="card-name-en">${card.nameEN}</div>
            <div class="card-position"></div>
          </div>
        </div>
      `;

      // 点击抽牌
      wrapper.addEventListener('click', () => {
        if (state.isShuffling) return;
        if (wrapper.classList.contains('picked')) return;
        handleCardPick(wrapper, card, index);
      });

      dom.cardsGrid.appendChild(wrapper);
    });
  }

  function updateDrawHint() {
    const hintEl = $('#draw-hint');
    const titleEl = $('#draw-title');
    const spreadHintEl = $('#spread-hint');

    if (state.mode === 'spread') {
      titleEl.textContent = '三牌阵 · 过去 · 现在 · 未来';
      const step = state.currentSpreadStep;
      if (step < 3) {
        hintEl.textContent = `请抽取第 ${step + 1} 张牌 ——【${SPREAD_POSITIONS[step]}】`;
      } else {
        hintEl.textContent = '三张牌已全部抽取，请查看解读';
      }
      spreadHintEl.style.display = 'block';
      spreadHintEl.querySelector('.position-name').textContent = SPREAD_POSITIONS[step] || '';
    } else {
      titleEl.textContent = '请抽取一张牌';
      hintEl.textContent = '静心凝神，跟随直觉选择一张牌';
      spreadHintEl.style.display = 'none';
    }
  }

  function animateShuffle() {
    state.isShuffling = true;
    const wrappers = $$('.card-wrapper:not(.picked)');

    wrappers.forEach((wrapper, i) => {
      wrapper.classList.add('shuffling');
      wrapper.style.setProperty('--shuffle-duration', (1.2 + Math.random() * 0.8) + 's');
      wrapper.style.animationDelay = (i * 0.05) + 's';
    });

    setTimeout(() => {
      wrappers.forEach(w => w.classList.remove('shuffling'));
      state.isShuffling = false;
    }, 2000);
  }

  function handleCardPick(wrapper, card, index) {
    // 标记为已选
    wrapper.classList.add('picked');

    // 随机正逆位
    const isReversed = randomOrientation();
    const orientation = isReversed ? '逆位' : '正位';

    // 更新卡牌正面信息
    const positionEl = wrapper.querySelector('.card-position');
    positionEl.textContent = orientation;
    positionEl.className = 'card-position ' + (isReversed ? 'reversed' : 'upright');
    // 如果是逆位，旋转牌面
    if (isReversed) {
      positionEl.style.transform = 'rotate(180deg)';
    }

    // 执行翻转动画
    wrapper.classList.add('flipped');

    // 高亮效果
    wrapper.classList.add('selected-highlight');

    // 记录选中的牌
    const pickData = {
      card: card,
      isReversed: isReversed,
      position: state.mode === 'spread' ? SPREAD_POSITIONS[state.currentSpreadStep] : ''
    };

    if (state.mode === 'spread') {
      state.selectedCards.push(pickData);
      state.currentSpreadStep++;

      if (state.currentSpreadStep < 3) {
        // 还有牌要抽，更新提示
        updateDrawHint();
        showToast(`已抽取【${SPREAD_POSITIONS[state.currentSpreadStep - 1]}】的牌，请继续抽取`);
      } else {
        // 三张全部抽完，显示综合解读
        updateDrawHint();
        showToast('三张牌已全部抽取，即将为您解读');
        setTimeout(() => showSpreadReading(), 1200);
      }
    } else {
      // 单张模式，直接显示解读
      state.selectedCards = [pickData];
      setTimeout(() => showSingleReading(pickData), 800);
    }
  }

  // ==================== 解读区域 ====================
  function showSingleReading(pickData) {
    const { card, isReversed } = pickData;
    const questionType = QUESTION_TYPES[state.questionType];
    const orientationLabel = isReversed ? '逆位' : '正位';
    const meaningKey = isReversed ? 'reversed' : 'upright';
    const interpretation = card.meanings[questionType][meaningKey];

    dom.readingArea.innerHTML = `
      <div class="reading-header">
        <div class="reading-card-name">${card.nameCN} · ${card.nameEN}</div>
        <span class="reading-position-badge ${isReversed ? 'reversed' : 'upright'}">${orientationLabel}</span>
      </div>
      <div class="reading-divider"></div>
      <div class="reading-question-type">🔮 你问的是：<strong>${questionType}</strong></div>
      <div class="reading-content">${interpretation}</div>
      <div class="button-group">
        <button class="btn btn-primary" id="btn-redraw">🔄 再抽一次</button>
        <button class="btn btn-secondary" id="btn-change-question">🔄 换个问题</button>
        <button class="btn btn-outline" id="btn-share">📸 生成分享卡片</button>
      </div>
    `;

    dom.readingArea.classList.add('active');

    // 绑定按钮事件
    $('#btn-redraw').addEventListener('click', startDrawPage);
    $('#btn-change-question').addEventListener('click', () => showPage('home-page'));
    $('#btn-share').addEventListener('click', () => showShareCard(pickData, null));

    // 滚动到解读区域
    setTimeout(() => {
      dom.readingArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  function showSpreadReading() {
    const questionType = QUESTION_TYPES[state.questionType];
    const orientationLabel = (isRev) => isRev ? '逆位' : '正位';
    const meaningKey = (isRev) => isRev ? 'reversed' : 'upright';

    let cardsHTML = '';
    state.selectedCards.forEach((pick, i) => {
      const { card, isReversed, position } = pick;
      cardsHTML += `
        <div class="spread-card-mini">
          <div class="position-label">${position}</div>
          <div class="mini-card-name">${card.nameCN}</div>
          <div style="font-size:0.7rem;color:${isReversed ? '#EF5350' : '#66BB6A'};margin-top:2px;">${isReversed ? '逆位' : '正位'}</div>
        </div>
      `;
    });

    // 综合解读文本
    const [past, present, future] = state.selectedCards;
    const comprehensiveReading = generateSpreadInterpretation(past, present, future, questionType);

    dom.readingArea.innerHTML = `
      <div class="reading-header">
        <div class="reading-card-name">三牌阵综合解读</div>
        <div class="reading-question-type" style="margin-top:8px;">🔮 你问的是：<strong>${questionType}</strong></div>
      </div>

      <div class="spread-summary">${cardsHTML}</div>

      <div class="reading-divider"></div>

      <h4 style="color:var(--gold);text-align:center;letter-spacing:2px;">📜 过去</h4>
      <div style="color:var(--text-secondary);font-size:0.85rem;text-align:center;margin-bottom:4px;">
        ${past.card.nameCN} · ${past.isReversed ? '逆位' : '正位'}
      </div>
      <div class="reading-content" style="margin-bottom:20px;">
        ${past.card.meanings[questionType][meaningKey(past.isReversed)]}
      </div>

      <h4 style="color:var(--gold);text-align:center;letter-spacing:2px;">📜 现在</h4>
      <div style="color:var(--text-secondary);font-size:0.85rem;text-align:center;margin-bottom:4px;">
        ${present.card.nameCN} · ${present.isReversed ? '逆位' : '正位'}
      </div>
      <div class="reading-content" style="margin-bottom:20px;">
        ${present.card.meanings[questionType][meaningKey(present.isReversed)]}
      </div>

      <h4 style="color:var(--gold);text-align:center;letter-spacing:2px;">📜 未来</h4>
      <div style="color:var(--text-secondary);font-size:0.85rem;text-align:center;margin-bottom:4px;">
        ${future.card.nameCN} · ${future.isReversed ? '逆位' : '正位'}
      </div>
      <div class="reading-content" style="margin-bottom:20px;">
        ${future.card.meanings[questionType][meaningKey(future.isReversed)]}
      </div>

      <div class="reading-comprehensive">
        <h4>🌟 综合解读</h4>
        <div class="reading-content">${comprehensiveReading}</div>
      </div>

      <div class="button-group">
        <button class="btn btn-primary" id="btn-redraw">🔄 再抽一次</button>
        <button class="btn btn-secondary" id="btn-change-question">🔄 换个问题</button>
        <button class="btn btn-outline" id="btn-share">📸 生成分享卡片</button>
      </div>
    `;

    dom.readingArea.classList.add('active');

    $('#btn-redraw').addEventListener('click', startDrawPage);
    $('#btn-change-question').addEventListener('click', () => showPage('home-page'));
    $('#btn-share').addEventListener('click', () => showShareCard(state.selectedCards[1], state.selectedCards));

    setTimeout(() => {
      dom.readingArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  /**
   * 生成三牌阵综合解读
   */
  function generateSpreadInterpretation(past, present, future, questionType) {
    const pastOrientation = past.isReversed ? '逆位' : '正位';
    const presentOrientation = present.isReversed ? '逆位' : '正位';
    const futureOrientation = future.isReversed ? '逆位' : '正位';

    // 根据正逆位组合生成综合解读
    const allUpright = !past.isReversed && !present.isReversed && !future.isReversed;
    const allReversed = past.isReversed && present.isReversed && future.isReversed;
    const pastReversedOthers = past.isReversed && !present.isReversed && !future.isReversed;

    let base = `三张牌为你揭示了关于${questionType}的完整画卷。`;

    if (allUpright) {
      base += `三张牌皆为正位，这是一个非常积极的信号！过去的积累（${past.card.nameCN}）为你奠定了坚实基础，当前的状态（${present.card.nameCN}）充满活力和机遇，而未来（${future.card.nameCN}）预示着更加光明的前景。整体来看，你的${questionType}之路顺畅向好，请保持信心，顺势而为。`;
    } else if (allReversed) {
      base += `三张牌皆为逆位，这提示你当前正处在一个需要反思和调整的时期。过去的经历（${past.card.nameCN}逆位）可能留下了一些未解的心结，现在（${present.card.nameCN}逆位）遇到了一些阻碍和困惑，而未来（${future.card.nameCN}逆位）则提醒你需要在行动前多一份思考和准备。别灰心，逆位不是否定，而是温柔的提醒——调整方向，风雨之后必见彩虹。`;
    } else {
      base += `过去由【${past.card.nameCN}】(${pastOrientation})守护，现在由【${present.card.nameCN}】(${presentOrientation})指引，未来则有【${future.card.nameCN}】(${futureOrientation})在等待。`;

      if (!past.isReversed && future.isReversed) {
        base += `从过去的顺境走向未来的挑战，这提醒你要珍惜当下的积累，为即将到来的变化做好准备。`;
      } else if (past.isReversed && !future.isReversed) {
        base += `过去的困扰正在逐渐消散，未来充满希望——这是一个由低谷向上的转折点，坚持住！`;
      } else {
        base += `每张牌都在向你传递独特的讯息，综合来看，保持内心的平衡与觉知，${questionType}之路会越走越清晰。`;
      }
    }

    return base;
  }

  // ==================== 分享卡片 ====================
  function showShareCard(mainPick, allPicks) {
    const { card, isReversed } = mainPick;
    const questionType = QUESTION_TYPES[state.questionType];
    const orientationLabel = isReversed ? '逆位' : '正位';
    const meaningKey = isReversed ? 'reversed' : 'upright';
    const interpretation = card.meanings[questionType][meaningKey];

    // 截取解读前80字作为分享摘要
    const shortInterpretation = interpretation.length > 80
      ? interpretation.slice(0, 80) + '……'
      : interpretation;

    let modeLabel = state.mode === 'spread' ? '三牌阵' : '单张占卜';

    dom.shareCard.innerHTML = `
      <div class="share-title">🔮 塔罗占卜屋</div>
      <div class="share-subtitle">${modeLabel} · ${questionType}</div>
      <div class="share-card-name">${card.nameCN} · ${orientationLabel}</div>
      <div class="share-interpretation">${shortInterpretation}</div>
      <div class="share-footer">✨ 塔罗占卜屋 · 探索你的命运 ✨</div>
    `;

    dom.shareOverlay.classList.add('active');

    // 点击遮罩关闭
    const closeOverlay = (e) => {
      if (e.target === dom.shareOverlay || e.target.id === 'share-close') {
        dom.shareOverlay.classList.remove('active');
        dom.shareOverlay.removeEventListener('click', closeOverlay);
      }
    };
    dom.shareOverlay.addEventListener('click', closeOverlay);
    $('#share-close').addEventListener('click', closeOverlay);
  }

  // ==================== 事件绑定 ====================
  function bindEvents() {
    // 音效开关
    dom.audioToggle.addEventListener('click', toggleAudio);

    // 回到首页按钮
    $$('.btn-home').forEach(btn => {
      btn.addEventListener('click', () => {
        state.questionType = '';
        state.mode = '';
        state.selectedCards = [];
        state.currentSpreadStep = 0;
        showPage('home-page');
      });
    });

    // 主页逻辑
    setupHomePage();
  }

  // ==================== 初始化 ====================
  function init() {
    createStars();
    bindEvents();
    setupModeSelect();
    showPage('home-page');
    console.log('🔮 塔罗占卜屋已就绪，愿星光指引你的方向 ✨');
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
