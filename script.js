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
  const clockWrap = document.querySelector('.clock-wrap');

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
    // 盤面（明るめグラデ）
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f2f6ff');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // 外枠のカラフルリング（キャンディ風）
    const ring = ctx.createLinearGradient(0, 0, w, 0);
    ring.addColorStop(0, '#ff9a9e');
    ring.addColorStop(0.25, '#fad0c4');
    ring.addColorStop(0.5, '#a1c4fd');
    ring.addColorStop(0.75, '#c2ffd8');
    ring.addColorStop(1, '#ffe29f');
    ctx.lineWidth = 8;
    ctx.strokeStyle = ring;
    ctx.stroke();

    // 目盛り（カラフル）
    const hourColors = ['#ff7ab2', '#ffa14a', '#5ad1ff', '#7ee787', '#c084fc', '#f87171'];
    for (let i = 0; i < 60; i++) {
      const ang = (Math.PI * 2) * (i / 60) - Math.PI / 2;
      const isHour = i % 5 === 0;
      const len = isHour ? 16 : 6;
      ctx.beginPath();
      ctx.lineWidth = isHour ? 3.2 : 1.4;
      ctx.strokeStyle = isHour ? hourColors[(i/5) % hourColors.length | 0] : '#c7d2fe';
      const x1 = cx + Math.cos(ang) * (r - len);
      const y1 = cy + Math.sin(ang) * (r - len);
      const x2 = cx + Math.cos(ang) * (r - 2);
      const y2 = cy + Math.sin(ang) * (r - 2);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // 数字（1〜12）
    ctx.fillStyle = '#0f172a';
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
    ctx.shadowColor = 'rgba(10,42,94,0.15)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hAng) * (r * 0.5), cy + Math.sin(hAng) * (r * 0.5));
    ctx.stroke();

    // 分針
    ctx.strokeStyle = '#ff7a50';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(255,122,80,0.2)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(mAng) * (r * 0.75), cy + Math.sin(mAng) * (r * 0.75));
    ctx.stroke();

    // 中心（キャンディカラー）
    const cap = ctx.createLinearGradient(cx - 10, cy - 10, cx + 10, cy + 10);
    cap.addColorStop(0, '#ff7eb3');
    cap.addColorStop(1, '#ffd166');
    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // ニコニコ顔（小さめ）
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cx - 14, cy - 6, 2.8, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy - 6, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 8, 10, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
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
      feedbackEl.textContent = '🎉 せいかい！やったね！';
      feedbackEl.className = 'feedback ok';
      state.score += 1;
    } else {
      btn.classList.add('wrong');
      feedbackEl.textContent = '💡 ざんねん… つぎは できる！';
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

    // ちょいポップアニメ
    if (clockWrap) {
      clockWrap.classList.remove('pop');
      // リフローを強制してアニメ再適用
      // eslint-disable-next-line no-unused-expressions
      void clockWrap.offsetWidth;
      clockWrap.classList.add('pop');
      clockWrap.addEventListener('animationend', () => clockWrap.classList.remove('pop'), { once: true });
    }
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
