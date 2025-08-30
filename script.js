(() => {
  const canvas = document.getElementById('clock');
  const ctx = canvas.getContext('2d');
  const choicesEl = document.getElementById('choices');
  const feedbackEl = document.getElementById('feedback');
  const progressText = document.getElementById('progressText');
  const scoreText = document.getElementById('scoreText');
  const levelSel = document.getElementById('level');
  const resetBtn = document.getElementById('resetBtn');
  const questionEl = document.getElementById('question');

  const TOTAL_QUESTIONS = 10;

  let state = {
    idx: 0,
    score: 0,
    current: null, // { h, m }
    level: levelSel.value,
    locked: false,
  };

  levelSel.addEventListener('change', () => {
    state.level = levelSel.value;
    start();
  });
  resetBtn.addEventListener('click', () => start());

  function start() {
    state.idx = 0;
    state.score = 0;
    state.locked = false;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    renderProgress();
    nextQuestion();
  }

  function renderProgress() {
    progressText.textContent = `${state.idx}/${TOTAL_QUESTIONS} もんめ`;
    scoreText.textContent = `せいかい: ${state.score}`;
  }

  function angleForMinute(min) {
    return (Math.PI * 2) * (min / 60) - Math.PI / 2;
  }
  function angleForHour(h, m) {
    const hour12 = (h % 12) + m / 60;
    return (Math.PI * 2) * (hour12 / 12) - Math.PI / 2;
  }

  function drawClock(h, m) {
    const w = canvas.width, hgt = canvas.height;
    const cx = w / 2, cy = hgt / 2;
    const r = Math.min(cx, cy) - 10;

    // 背景
    ctx.clearRect(0, 0, w, hgt);
    ctx.save();
    // 盤面
    const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#e9edf5');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d0d7e5';
    ctx.stroke();

    // 目盛り（5分間隔）
    for (let i = 0; i < 60; i++) {
      const ang = (Math.PI * 2) * (i / 60) - Math.PI / 2;
      const isHour = i % 5 === 0;
      const len = isHour ? 14 : 6;
      ctx.beginPath();
      ctx.lineWidth = isHour ? 3 : 1.5;
      ctx.strokeStyle = isHour ? '#2d7ff9' : '#94a3b8';
      const x1 = cx + Math.cos(ang) * (r - len);
      const y1 = cy + Math.sin(ang) * (r - len);
      const x2 = cx + Math.cos(ang) * (r - 2);
      const y2 = cy + Math.sin(ang) * (r - 2);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // 数字（1〜12）
    ctx.fillStyle = '#13223d';
    ctx.font = `${Math.floor(r * 0.17)}px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans JP, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let num = 1; num <= 12; num++) {
      const ang = (Math.PI * 2) * (num / 12) - Math.PI / 2;
      const rx = cx + Math.cos(ang) * (r * 0.75);
      const ry = cy + Math.sin(ang) * (r * 0.75);
      ctx.fillText(String(num), rx, ry);
    }

    // 針
    const mAng = angleForMinute(m);
    const hAng = angleForHour(h, m);

    // 時針
    ctx.strokeStyle = '#0a2a5e';
    ctx.lineCap = 'round';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hAng) * (r * 0.5), cy + Math.sin(hAng) * (r * 0.5));
    ctx.stroke();

    // 分針
    ctx.strokeStyle = '#2d7ff9';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(mAng) * (r * 0.75), cy + Math.sin(mAng) * (r * 0.75));
    ctx.stroke();

    // 中心
    ctx.fillStyle = '#ff5d5d';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function formatTime(h, m) {
    const hour = ((h - 1) % 12) + 1; // 1..12
    if (m === 0) return `${hour}じ`;
    if (m === 30) return `${hour}じはん`;
    return `${hour}じ${m}ふん`;
  }

  function minutePool(level) {
    if (level === 'easy') return [0];
    if (level === 'quarter') return [0, 15, 30, 45];
    // five
    return Array.from({ length: 12 }, (_, i) => i * 5);
  }

  function randomInt(min, maxInclusive) {
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

  function genTime(level) {
    const mins = minutePool(level);
    const m = mins[randomInt(0, mins.length - 1)];
    const h = randomInt(1, 12);
    return { h, m };
  }

  function timeKey(t) { return `${t.h}:${t.m}`; }

  function makeChoices(correct, level) {
    const set = new Map();
    set.set(timeKey(correct), correct);

    const mins = minutePool(level);
    while (set.size < 4) {
      let h = correct.h + [-2, -1, 1, 2, 3][randomInt(0, 4)];
      if (h < 1) h += 12;
      if (h > 12) h -= 12;
      let m = mins[randomInt(0, mins.length - 1)];
      // 少しだけ正解に近い分も混ぜる
      if (randomInt(0, 1) === 0 && level !== 'easy') {
        const variants = [correct.m, (correct.m + 5) % 60, (correct.m + 55) % 60];
        m = variants[randomInt(0, variants.length - 1)];
      }
      const t = { h: ((h - 1) % 12) + 1, m };
      set.set(timeKey(t), t);
      if (set.size > 20) break; // 念のため無限ループ回避
    }
    // シャッフル
    const arr = Array.from(set.values());
    // 4つに絞る（正解を含める）
    if (arr.length > 4) {
      // 正解を先に取り除いてからランダムに3つ足す
      const correctKey = timeKey(correct);
      const others = arr.filter(t => timeKey(t) !== correctKey);
      shuffle(others);
      return shuffle([correct, ...others.slice(0, 3)]);
    }
    return shuffle(arr);
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderChoices(correct, level) {
    choicesEl.innerHTML = '';
    const opts = makeChoices(correct, level);
    const correctKey = timeKey(correct);

    opts.forEach((t, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.type = 'button';
      btn.textContent = formatTime(t.h, t.m);
      btn.setAttribute('aria-label', `${btn.textContent} を えらぶ`);
      btn.addEventListener('click', () => onAnswer(btn, timeKey(t) === correctKey));
      choicesEl.appendChild(btn);
    });
  }

  function onAnswer(btn, isCorrect) {
    if (state.locked) return;
    state.locked = true;
    const all = Array.from(document.querySelectorAll('.choice-btn'));
    all.forEach(b => b.disabled = true);

    if (isCorrect) {
      btn.classList.add('correct');
      feedbackEl.textContent = 'せいかい！やったね！';
      feedbackEl.className = 'feedback ok';
      state.score += 1;
    } else {
      btn.classList.add('wrong');
      feedbackEl.textContent = 'ざんねん…。つぎは できる！';
      feedbackEl.className = 'feedback ng';
      // 正解も表示
      highlightCorrect();
    }
    renderProgress();

    setTimeout(() => {
      if (state.idx >= TOTAL_QUESTIONS) {
        showResult();
      } else {
        nextQuestion();
      }
    }, 900);
  }

  function highlightCorrect() {
    const correctTxt = formatTime(state.current.h, state.current.m);
    document.querySelectorAll('.choice-btn').forEach(b => {
      if (b.textContent === correctTxt) b.classList.add('correct');
    });
  }

  function nextQuestion() {
    state.locked = false;
    if (state.idx >= TOTAL_QUESTIONS) return showResult();
    state.idx += 1;
    renderProgress();

    state.current = genTime(state.level);
    drawClock(state.current.h, state.current.m);
    renderChoices(state.current, state.level);
    questionEl.textContent = 'この とけい は なんじ？';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
  }

  function showResult() {
    choicesEl.innerHTML = '';
    questionEl.textContent = 'けっかは…';
    drawClock(state.current?.h ?? 12, state.current?.m ?? 0);

    const msg = document.createElement('div');
    msg.style.textAlign = 'center';
    msg.style.fontSize = '1.3rem';
    msg.style.marginTop = '6px';
    msg.innerHTML = `ぜんぶで <b>${TOTAL_QUESTIONS}</b> もん。<br>せいかいは <b>${state.score}</b> もん！`;
    feedbackEl.className = 'feedback';
    feedbackEl.innerHTML = '';
    feedbackEl.appendChild(msg);

    const again = document.createElement('button');
    again.className = 'btn';
    again.textContent = 'もういっかい！';
    again.style.display = 'block';
    again.style.margin = '10px auto 0';
    again.addEventListener('click', start);
    choicesEl.appendChild(again);
  }

  // 初期化
  start();
})();

