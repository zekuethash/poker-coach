(function () {
  const P = window.Poker, { cardHTML, cardsHTML, inlineCards } = window.CardUI, QG = window.QuizGen;
  const $ = (s, el = document) => el.querySelector(s);
  const view = $('#view'), overlay = $('#overlay'), bar = $('#bar');
  const shuffled = (a) => P.shuffle(a.slice());
  const DAILY_GOAL = 30, HEART_MS = 20 * 60 * 1000;

  // ---- kalıcı durum ----
  const KEY = 'pokerCoach.v2';
  const defaults = () => ({ lessons: {}, quiz: {}, xp: 0, streak: 0, last: '', daily: { d: '', xp: 0 }, hearts: 5, heartTs: 0, sound: true, play: { hands: 0, won: 0, net: 0 } });
  let state = defaults();
  try {
    const old = JSON.parse(localStorage.getItem('pokerCoach.v1') || 'null');
    if (old && old.quiz) state.quiz = old.quiz;
    Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {});
  } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const today = () => new Date().toISOString().slice(0, 10);
  const dayDiff = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);

  function hearts() {
    if (state.hearts < 5) {
      const n = Math.floor((Date.now() - state.heartTs) / HEART_MS);
      if (n > 0) { state.hearts = Math.min(5, state.hearts + n); state.heartTs = state.hearts >= 5 ? 0 : state.heartTs + n * HEART_MS; save(); }
    }
    return state.hearts;
  }
  function loseHeart() { hearts(); if (state.hearts === 5) state.heartTs = Date.now(); state.hearts = Math.max(0, state.hearts - 1); save(); }
  function addHeart() { state.hearts = Math.min(5, hearts() + 1); if (state.hearts >= 5) state.heartTs = 0; save(); }
  const heartWait = () => Math.max(1, Math.ceil((HEART_MS - (Date.now() - state.heartTs)) / 60000));

  function addXp(n) {
    state.xp += n;
    if (state.daily.d !== today()) state.daily = { d: today(), xp: 0 };
    state.daily.xp += n;
    if (state.last !== today()) { state.streak = state.last && dayDiff(today(), state.last) === 1 ? state.streak + 1 : 1; state.last = today(); }
    save();
  }
  const dailyXp = () => (state.daily.d === today() ? state.daily.xp : 0);
  const streak = () => (state.last && dayDiff(today(), state.last) > 1 ? 0 : state.streak);
  const level = () => Math.floor(state.xp / 100) + 1;

  // ---- ses ve efektler ----
  let ac;
  function tone(freqs, dur = 0.12) {
    if (!state.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * dur;
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.start(t); o.stop(t + dur);
      });
    } catch (e) {}
  }
  const sfx = { ok: () => tone([660, 880]), no: () => tone([240, 190], 0.15), win: () => tone([523, 659, 784, 1047], 0.14), tap: () => tone([500], 0.05) };
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2300); }
  function confetti() {
    const em = ['🎉', '♠️', '♥️', '♦️', '♣️', '⭐', '✨'];
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.className = 'confetti'; s.textContent = em[i % em.length];
      s.style.left = Math.random() * 100 + 'vw'; s.style.animationDuration = 1.8 + Math.random() * 1.6 + 's'; s.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(s); setTimeout(() => s.remove(), 4200);
    }
  }
  function fullscreen(on) { document.body.classList.toggle('full', on); if (!on) { overlay.innerHTML = ''; renderBar(); } }

  function renderBar() {
    const g = dailyXp();
    bar.innerHTML = `<span class="f">🔥 ${streak()}</span><span class="x">⭐ ${g}/${DAILY_GOAL}</span><span class="h">❤️ ${hearts()}</span>`;
  }

  // ---- yönlendirme ----
  let tab = 'learn';
  function setTab(t) {
    tab = t; fullscreen(false);
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    renderBar();
    ({ learn: renderPath, play: renderPlayHome, practice: renderPractice, profile: renderProfile })[t]();
    view.scrollTop = 0;
  }
  document.querySelector('.tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { sfx.tap(); setTab(b.dataset.tab); } });
  const setView = (h) => { view.innerHTML = h; view.scrollTop = 0; };

  // ---- ÖĞREN: yol ----
  const allLessons = () => UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));
  function renderPath() {
    const all = allLessons();
    const curIdx = all.findIndex((l) => !state.lessons[l.id]);
    const offs = [0, 38, 58, 38, 0, -38, -58, -38];
    let n = 0;
    setView(UNITS.map((u, ui) => `<section class="unit"><div class="banner ${u.color}"><div><small>Bölüm ${ui + 1}</small><h2>${u.title}</h2><p>${u.desc}</p></div></div>
      <div class="path">${u.lessons.map((l) => {
        const gi = all.findIndex((x) => x.id === l.id), done = !!state.lessons[l.id], cur = gi === curIdx, locked = !done && !cur;
        const off = offs[n++ % offs.length];
        return `<button class="node ${done ? 'done' : cur ? 'cur ' + u.color : 'locked'}" style="transform:translateX(${off}px)" data-id="${l.id}" data-locked="${locked ? 1 : 0}" aria-label="${l.title}">${done ? '⭐' : locked ? '🔒' : l.icon}<span class="lbl">${l.title}</span></button>`;
      }).join('')}</div></section>`).join('') + '<div style="height:24px"></div>');
    view.querySelectorAll('.node').forEach((b) => (b.onclick = () => {
      if (b.dataset.locked === '1') { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); toast('Önce önceki dersi tamamla'); return; }
      startLesson(b.dataset.id);
    }));
    const cur = view.querySelector('.node.cur');
    if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center' }), 0);
  }

  // ---- Soru gösterici (ders + pratik ortak) ----
  function showQuestion(item, stage, foot, done) {
    let opts = item.options.map((text, i) => ({ text, i }));
    if (!item.fixedOrder) opts = shuffled(opts);
    stage.innerHTML = `<div class="qprompt">${inlineCards(item.prompt)}</div><div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${inlineCards(o.text)}</button>`).join('')}</div>`;
    foot.className = 'lf'; foot.innerHTML = '<button class="btn" id="chk" disabled>Kontrol et</button>';
    let sel = -1;
    const btns = [...stage.querySelectorAll('.opt')];
    btns.forEach((b) => (b.onclick = () => { sel = +b.dataset.k; btns.forEach((x) => x.classList.toggle('sel', x === b)); $('#chk', foot).disabled = false; sfx.tap(); }));
    $('#chk', foot).onclick = () => {
      const good = opts[sel].i === item.answer;
      btns.forEach((b, k) => { b.disabled = true; b.classList.remove('sel'); if (opts[k].i === item.answer) b.classList.add('ok'); else if (k === sel) b.classList.add('no'); });
      good ? sfx.ok() : sfx.no();
      foot.className = 'lf ' + (good ? 'ok' : 'no');
      foot.innerHTML = `<div class="fb">${good ? '✅ Harika!' : '❌ Yanlış'}</div><div class="why">${inlineCards(item.explain || '')}</div><button class="btn" id="go">Devam</button>`;
      $('#go', foot).onclick = () => done(good);
    };
  }
  function lessonItem(step) {
    if (step.t === 'gen') return QG[step.kind](step.arg);
    return { prompt: step.prompt, options: step.opts, answer: step.a, explain: step.why };
  }
  const screen = (inner, cls = '') => { document.body.classList.add('full'); overlay.innerHTML = `<div class="screen ${cls}">${inner}</div>`; return overlay.firstElementChild; };

  // ---- DERS OYNATICI ----
  function startLesson(id) {
    const lesson = allLessons().find((l) => l.id === id);
    const redo = !!state.lessons[id];
    if (!redo && hearts() === 0) return noHearts();
    const total = lesson.steps.length;
    let queue = lesson.steps.slice(), doneN = 0, mistakes = 0, asked = 0, right = 0;
    const el = screen(`<div class="lt"><button class="x" id="quit">✕</button><div class="prog"><i id="pg" style="width:0"></i></div><span class="hearts" id="hh"></span></div><div class="lb" id="stage"></div><div class="lf" id="foot"></div>`);
    const stage = $('#stage', el), foot = $('#foot', el);
    const upd = () => { $('#pg', el).style.width = (doneN / total) * 100 + '%'; $('#hh', el).textContent = '❤️ ' + hearts(); };
    $('#quit', el).onclick = () => { if (confirm('Dersten çıkarsan ilerleme kaybolur. Çıkılsın mı?')) fullscreen(false), setTab('learn'); };
    const nextStep = () => {
      upd();
      if (!queue.length) return finish();
      const step = queue.shift();
      if (step.t === 'info') {
        stage.innerHTML = `<div class="mascot"><div class="face">🦊</div><div class="bubble"><h3>${step.title}</h3>${inlineCards(step.body)}</div></div>`;
        foot.className = 'lf'; foot.innerHTML = '<button class="btn" id="go">Devam</button>';
        $('#go', foot).onclick = () => { sfx.tap(); doneN++; nextStep(); };
        return;
      }
      showQuestion(lessonItem(step), stage, foot, (good) => {
        asked++;
        if (good) { right++; doneN++; }
        else {
          mistakes++;
          if (!redo) { loseHeart(); if (hearts() === 0) return failed(); }
          queue.push(step); // yanlış soru sona tekrar eklenir
        }
        nextStep();
      });
    };
    const failed = () => {
      stage.innerHTML = `<div class="center"><div class="big">💔</div><h2 class="pg">Kalpların bitti!</h2><p class="sub">Bir kalp ${heartWait()} dk içinde yenilenir. Pratik sekmesinden quiz çözerek de kalp kazanabilirsin.</p></div>`;
      foot.className = 'lf'; foot.innerHTML = '<button class="btn blue" id="pr">Pratik yap</button><button class="btn ghost" id="ok">Kapat</button>';
      $('#pr', foot).onclick = () => runQuiz('hands');
      $('#ok', foot).onclick = () => setTab('learn');
    };
    const finish = () => {
      const first = !state.lessons[id];
      const perfect = mistakes === 0;
      const xp = first ? 10 + (perfect ? 5 : 0) : 5;
      state.lessons[id] = true; addXp(xp); save();
      sfx.win(); confetti();
      const acc = asked ? Math.round((right / asked) * 100) : 100;
      $('#pg', el).style.width = '100%';
      stage.innerHTML = `<div class="center" style="padding-top:30px"><div class="big">🏆</div><h2 class="pg">Ders tamamlandı!</h2>
        <div class="stats"><div class="stat" style="border-color:var(--gold)"><b style="color:var(--gold-d)">+${xp}</b><small>XP</small></div><div class="stat" style="border-color:var(--green)"><b style="color:var(--green-d)">%${acc}</b><small>Doğruluk</small></div></div>
        ${perfect ? '<p>Kusursuz! 🔥 +5 bonus XP</p>' : '<p class="sub">Hatalarından öğrendin, tekrar dene!</p>'}</div>`;
      foot.className = 'lf'; foot.innerHTML = '<button class="btn" id="go">Devam</button>';
      $('#go', foot).onclick = () => setTab('learn');
    };
    nextStep();
  }
  function noHearts() {
    const el = screen(`<div class="lt"><button class="x" id="quit">✕</button></div><div class="lb center" style="padding-top:40px"><div class="big">💔</div><h2 class="pg">Kalpların bitti</h2><p class="sub">Bir kalp ${heartWait()} dk içinde yenilenir. Pratik sekmesinden quiz çözerek hemen kalp kazanabilirsin (10 sorudan 7 doğru = +1 ❤️).</p></div><div class="lf"><button class="btn blue" id="pr">Pratik yap</button><button class="btn ghost" id="ok">Kapat</button></div>`);
    $('#quit', el).onclick = $('#ok', el).onclick = () => setTab('learn');
    $('#pr', el).onclick = () => runQuiz('hands');
  }

  // ---- PRATİK ----
  const QUIZZES = {
    hands: { name: 'El Sıralaması', icon: '🏆', desc: 'Elin adını bul', make: () => QG.hands() },
    winner: { name: 'Kim Kazanır?', icon: '⚔️', desc: 'Showdown\'da kazananı seç', make: () => QG.winner() },
    odds: { name: 'Pot Odds', icon: '🧮', desc: 'Call mı, fold mu?', make: () => QG.odds() },
    preflop: { name: 'Başlangıç Eli', icon: '✋', desc: 'Pozisyona göre aç ya da pas geç', make: () => QG.preflop() },
  };
  function renderPractice() {
    setView(`<div class="pad"><h2 class="pg">Pratik</h2><p class="sub">10 soruluk quiz'ler. 7+ doğru = +1 ❤️ ve XP kazanırsın.</p><div class="list">
      ${Object.entries(QUIZZES).map(([k, q]) => { const s = state.quiz[k]; return `<button class="item" data-k="${k}"><span class="ic">${q.icon}</span><span class="tx"><b>${q.name}</b><small>${q.desc}${s ? ` · %${Math.round((s.correct / s.total) * 100)} (${s.total})` : ''}</small></span></button>`; }).join('')}
      <button class="item" data-go="chart"><span class="ic">📊</span><span class="tx"><b>Başlangıç eli tablosu</b><small>Pozisyona göre açılış aralıkları</small></span></button>
      <button class="item" data-go="sim"><span class="ic">🎲</span><span class="tx"><b>Eşitlik simülatörü</b><small>Kartlar açıldıkça şansın nasıl değişir?</small></span></button></div></div>`);
    view.querySelectorAll('.item').forEach((b) => (b.onclick = () => (b.dataset.k ? runQuiz(b.dataset.k) : b.dataset.go === 'chart' ? renderChart() : renderSim())));
  }
  const ROUNDS = 10;
  function runQuiz(kind) {
    const Q = QUIZZES[kind];
    let n = 0, score = 0;
    const el = screen(`<div class="lt"><button class="x" id="quit">✕</button><div class="prog"><i id="pg" style="width:0"></i></div><span class="hearts" id="hh"></span></div><div class="lb" id="stage"></div><div class="lf" id="foot"></div>`);
    const stage = $('#stage', el), foot = $('#foot', el);
    $('#quit', el).onclick = () => setTab('practice');
    const nextQ = () => {
      $('#pg', el).style.width = (n / ROUNDS) * 100 + '%'; $('#hh', el).textContent = '❤️ ' + hearts();
      if (n >= ROUNDS) return finish();
      n++;
      showQuestion(Q.make(), stage, foot, (good) => {
        const s = state.quiz[kind] || (state.quiz[kind] = { total: 0, correct: 0 });
        s.total++; if (good) { s.correct++; score++; }
        save(); nextQ();
      });
    };
    const finish = () => {
      const xp = score; addXp(xp);
      const heart = score >= 7 && hearts() < 5; if (heart) addHeart();
      save(); score >= 7 ? (sfx.win(), confetti()) : sfx.no();
      stage.innerHTML = `<div class="center" style="padding-top:30px"><div class="big">${score >= 8 ? '🎉' : score >= 5 ? '👍' : '📖'}</div><h2 class="pg">${score}/${ROUNDS} doğru</h2><div class="stats"><div class="stat"><b style="color:var(--gold-d)">+${xp}</b><small>XP</small></div>${heart ? '<div class="stat"><b style="color:var(--red)">+1 ❤️</b><small>Kalp</small></div>' : ''}</div></div>`;
      foot.className = 'lf'; foot.innerHTML = '<button class="btn" id="again">Tekrar</button><button class="btn ghost" id="menu">Çık</button>';
      $('#again', foot).onclick = () => runQuiz(kind);
      $('#menu', foot).onclick = () => setTab('practice');
    };
    nextQ();
  }

  // Başlangıç eli tablosu
  let chartPos = 'UTG', chartSel = null;
  function subTop(title) { return `<div class="topbar"><button id="back">‹ Geri</button><h1>${title}</h1></div>`; }
  function renderChart() {
    const range = P.RANGES[chartPos], R = 'AKQJT98765432';
    let cells = '';
    for (let i = 0; i < 13; i++) for (let j = 0; j < 13; j++) {
      const key = i === j ? R[i] + R[j] : i < j ? R[i] + R[j] + 's' : R[j] + R[i] + 'o';
      cells += `<button class="cell${range.has(key) ? ' in' : ''}${i === j ? ' pair' : ''}${key === chartSel ? ' sel' : ''}" data-k="${key}">${key}</button>`;
    }
    setView(`${subTop('Başlangıç elleri')}<div class="pad"><p class="sub">Senden önce herkes pas geçtiğinde hangi elleri raise ile açmalısın?</p>
      <div class="chips">${Object.keys(P.RANGES).map((k) => `<button class="chip${k === chartPos ? ' on' : ''}" data-p="${k}">${k}</button>`).join('')}</div>
      <p><b>${P.POS_NAMES[chartPos]}</b> — ellerin <b>%${P.rangePercent(range).toFixed(0)}</b>'i</p>
      <div class="grid">${cells}</div>
      <div class="legend"><span><i style="background:var(--orange)"></i>Çift</span><span><i style="background:var(--green)"></i>Aç</span><span><i style="background:#efefef"></i>Pas</span></div>
      <p class="sub">Üst-sağ: suited (s). Alt-sol: offsuit (o). Köşegen: çiftler.</p>
      ${chartSel ? `<div class="expl"><b>${chartSel}</b> — ${range.has(chartSel) ? '✅ Bu pozisyonda raise ile aç.' : '❌ Bu pozisyonda pas geç.'}</div>` : '<p class="sub">Bir ele dokun.</p>'}</div>`);
    $('#back').onclick = renderPractice;
    view.querySelectorAll('.chip').forEach((b) => (b.onclick = () => { chartPos = b.dataset.p; renderChart(); }));
    view.querySelectorAll('.cell').forEach((b) => (b.onclick = () => { chartSel = b.dataset.k; renderChart(); }));
  }

  // Simülatör
  let sim = null;
  const STAGES = ['Preflop', 'Flop', 'Turn', 'River'];
  function newSimHand() { const d = P.shuffle(P.makeDeck()); sim = { hole: d.slice(0, 2), board: [], deck: d.slice(2), eq: null }; renderSim(); }
  function renderSim() {
    if (!sim) return newSimHand();
    const si = sim.board.length === 0 ? 0 : sim.board.length - 2;
    const made = sim.board.length >= 3 ? P.best(sim.hole.concat(sim.board)) : null;
    const p = sim.eq === null ? null : sim.eq * 100;
    const tip = p === null ? '…' : p >= 65 ? 'Çok güçlü: değer için bahis/raise yap.' : p >= 50 ? 'Önde görünüyorsun: bahis yap veya call et.' : p >= 35 ? 'Orta: pot odds\'a göre karar ver.' : 'Zayıf: çekişin yoksa fold düşün.';
    setView(`${subTop('Simülatör')}<div class="pad"><p class="sub">Rastgele bir rakibe karşı kazanma şansını gör. Kartlar açıldıkça nasıl değiştiğine bak.</p>
      <div class="table"><div class="sub" style="color:#cfe">Board · ${STAGES[si]}</div><div class="hand">${cardsHTML(Array.from({ length: 5 }, (_, i) => sim.board[i]), 'lg')}</div><div class="sub" style="color:#cfe">Senin elin</div><div class="hand">${cardsHTML(sim.hole, 'lg')}</div></div>
      <p class="center">${made ? `Mevcut el: <b>${P.catName(made.score, made.hand)}</b>` : `Başlangıç eli: <b>${P.handKey(sim.hole[0], sim.hole[1])}</b>`}</p>
      <div class="meter"><i style="width:${p === null ? 0 : p}%"></i><span>${p === null ? 'hesaplanıyor…' : 'Eşitlik %' + p.toFixed(0)}</span></div>
      <div class="expl"><b>Yorum:</b> ${tip}<br><span class="sub">Rastgele bir ele karşı eşitlik. Gerçek rakipler rastgele oynamaz ama iyi bir kılavuzdur.</span></div><div style="height:12px"></div>
      ${si < 3 ? `<button class="btn blue" id="deal">${STAGES[si + 1]} aç</button>` : ''}<button class="btn ghost" id="new">Yeni el</button></div>`);
    $('#back').onclick = renderPractice;
    if (si < 3) $('#deal').onclick = () => { sim.board.push(...sim.deck.splice(0, si === 0 ? 3 : 1)); sim.eq = null; renderSim(); };
    $('#new').onclick = newSimHand;
    if (sim.eq === null) { const snap = sim; setTimeout(() => { if (sim !== snap || snap.eq !== null) return; snap.eq = P.equity(snap.hole, snap.board, 2500); if (sim === snap && tab === 'practice') renderSim(); }, 30); }
  }

  // ---- OYNA (giriş) ----
  function renderPlayHome() {
    const s = state.play;
    setView(`<div class="pad center"><div class="big">🎰</div><h2 class="pg">Botlara karşı oyna</h2><p class="sub">3 bot ile 4 kişilik Texas Hold'em. Büyük blind 20, herkes 1000 fişle başlar. Zorlanınca 💡 Koç ipucu al!</p>
      <div class="stats"><div class="stat"><b>${s.hands}</b><small>El</small></div><div class="stat"><b>${s.hands ? Math.round((s.won / s.hands) * 100) : 0}%</b><small>Kazanma</small></div><div class="stat"><b>${s.net > 0 ? '+' : ''}${s.net}</b><small>Net fiş</small></div></div>
      <div class="list" style="text-align:left;margin:14px 0">${window.Game.BOTS.map((b) => `<div class="item"><span class="ic">${b.avatar}</span><span class="tx"><b>${b.name}</b><small>${b.desc}</small></span></div>`).join('')}</div>
      <button class="btn" id="start">Oyuna başla</button></div>`);
    $('#start').onclick = () => window.Play.start();
  }

  // ---- PROFİL ----
  function renderProfile() {
    const done = Object.keys(state.lessons).length, tot = allLessons().length;
    const qt = Object.values(state.quiz).reduce((a, s) => a + s.total, 0), qc = Object.values(state.quiz).reduce((a, s) => a + s.correct, 0);
    setView(`<div class="pad center"><div class="big">🦊</div><h2 class="pg">Seviye ${level()}</h2><p class="sub">${state.xp % 100}/100 XP sonraki seviyeye</p>
      <div class="prog" style="margin:8px 0 18px"><i style="width:${state.xp % 100}%"></i></div>
      <div class="ring" style="--p:${Math.min(100, (dailyXp() / DAILY_GOAL) * 100)}"><span>⭐</span></div><p class="sub">Günlük hedef: ${dailyXp()}/${DAILY_GOAL} XP</p>
      <div class="stats"><div class="stat"><b>🔥 ${streak()}</b><small>Gün serisi</small></div><div class="stat"><b>⭐ ${state.xp}</b><small>Toplam XP</small></div></div>
      <div class="stats"><div class="stat"><b>${done}/${tot}</b><small>Ders</small></div><div class="stat"><b>%${qt ? Math.round((qc / qt) * 100) : 0}</b><small>Quiz doğruluğu</small></div></div>
      <button class="btn ghost" id="snd">Ses: ${state.sound ? 'Açık 🔊' : 'Kapalı 🔇'}</button>
      <button class="btn ghost" id="rst" style="color:var(--red)">İlerlemeyi sıfırla</button></div>`);
    $('#snd').onclick = () => { state.sound = !state.sound; save(); renderProfile(); };
    $('#rst').onclick = () => { if (confirm('Tüm ilerleme silinsin mi?')) { state = defaults(); save(); setTab('learn'); } };
  }

  window.App = { state, getState: () => state, save, addXp, sfx, toast, confetti, fullscreen, screen, setTab, renderBar, level };
  setTab('learn');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !window.__reloaded) { window.__reloaded = true; location.reload(); } });
  }
})();
