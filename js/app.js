(function () {
  const P = window.Poker;
  const $ = (s, el = document) => el.querySelector(s);
  const view = $('#view'), titleEl = $('#title'), backBtn = $('#back');

  // ---- kalıcı ilerleme ----
  const KEY = 'pokerCoach.v1';
  const defaults = () => ({ lessons: {}, quiz: {} });
  let state = defaults();
  try { state = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  // ---- yardımcılar ----
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const label = (r) => (r === 10 ? '10' : P.rankCh(r));
  function cardHTML(c, lg) {
    if (!c) return `<span class="card back${lg ? ' lg' : ''}"><b>?</b></span>`;
    const red = c.s === 'h' || c.s === 'd';
    return `<span class="card${red ? ' red' : ''}${lg ? ' lg' : ''}"><b>${label(c.r)}</b><i>${P.SUIT_SYM[c.s]}</i></span>`;
  }
  const cardsHTML = (cs, lg) => cs.map((c) => cardHTML(c, lg)).join('');
  const inlineCards = (html) => html.replace(/\[\[([^\]]+)\]\]/g, (_, t) => `<span class="hand">${cardsHTML(t.trim().split(/\s+/).map(P.parseCard))}</span>`);
  const shuffled = (a) => P.shuffle(a.slice());
  const html = (s) => { view.innerHTML = s; view.scrollTop = 0; };

  // ---- yönlendirme ----
  let tab = 'learn';
  function setTab(t) {
    tab = t;
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    ({ learn: renderLearn, quiz: renderQuizMenu, chart: renderChart, sim: renderSim })[t]();
  }
  document.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) setTab(b.dataset.tab);
  });
  function header(title, onBack) {
    titleEl.textContent = title;
    backBtn.hidden = !onBack;
    backBtn.onclick = onBack || null;
  }

  // ---- DERSLER ----
  function renderLearn() {
    header('Poker Koçu');
    const done = LESSONS.filter((l) => state.lessons[l.id]).length;
    const pct = Math.round((done / LESSONS.length) * 100);
    html(`<h2>Pokeri öğren</h2>
      <p class="sub">Texas Hold'em'i sıfırdan öğren. Dersleri sırayla bitir, sonra quiz ve simülatörle pratik yap.</p>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <p class="sub">${done}/${LESSONS.length} ders tamamlandı</p>
      <div class="list">${LESSONS.map((l) => `<button class="item" data-id="${l.id}"><span class="ic">${l.icon}</span><span class="tx"><b>${l.title}</b><small>${l.summary} · ${l.time}</small></span>${state.lessons[l.id] ? '<span class="done">✓</span>' : ''}</button>`).join('')}</div>`);
    view.querySelectorAll('.item').forEach((b) => (b.onclick = () => renderLesson(b.dataset.id)));
  }
  function renderLesson(id) {
    const l = LESSONS.find((x) => x.id === id);
    const idx = LESSONS.indexOf(l), next = LESSONS[idx + 1];
    header(l.title, renderLearn);
    html(`<div class="lesson">${inlineCards(l.body)}</div>
      <button class="btn" id="done">${state.lessons[id] ? '✓ Tamamlandı' : 'Dersi tamamla'}</button>
      ${next ? `<button class="btn ghost" id="next">Sonraki: ${next.title}</button>` : ''}`);
    $('#done').onclick = () => { state.lessons[id] = true; save(); (next ? renderLesson(next.id) : renderLearn()); };
    if (next) $('#next').onclick = () => renderLesson(next.id);
  }

  // ---- QUIZ ----
  const QUIZZES = {
    hands: { name: 'El Sıralaması', icon: '🏆', desc: 'Gösterilen elin adını bul.', make: qHands },
    winner: { name: 'Kim Kazanır?', icon: '⚔️', desc: 'Showdown\'da kazananı seç.', make: qWinner },
    odds: { name: 'Pot Odds', icon: '🧮', desc: 'Call mı, fold mu?', make: qOdds },
    preflop: { name: 'Başlangıç Eli', icon: '✋', desc: 'Pozisyona göre aç ya da pas geç.', make: qPreflop },
  };
  function renderQuizMenu() {
    header('Quiz');
    const total = Object.values(state.quiz).reduce((a, s) => a + s.total, 0);
    const ok = Object.values(state.quiz).reduce((a, s) => a + s.correct, 0);
    html(`<h2>Kendini sına</h2>
      <div class="stats"><div class="stat"><b>${total}</b><small>Soru</small></div><div class="stat"><b>${total ? Math.round((ok / total) * 100) : 0}%</b><small>Doğru</small></div></div>
      <div class="list">${Object.entries(QUIZZES).map(([k, q]) => {
        const s = state.quiz[k];
        return `<button class="item" data-k="${k}"><span class="ic">${q.icon}</span><span class="tx"><b>${q.name}</b><small>${q.desc}${s ? ` · %${Math.round((s.correct / s.total) * 100)} (${s.total})` : ''}</small></span></button>`;
      }).join('')}</div>`);
    view.querySelectorAll('.item').forEach((b) => (b.onclick = () => runQuiz(b.dataset.k)));
  }
  const ROUNDS = 10;
  function runQuiz(kind) {
    const q = QUIZZES[kind];
    let n = 0, score = 0;
    header(q.name, renderQuizMenu);
    const nextQ = () => {
      if (n >= ROUNDS) return finish();
      const item = q.make();
      n++;
      html(`<div class="sub">Soru ${n}/${ROUNDS} · Skor ${score}</div><div class="bar"><i style="width:${((n - 1) / ROUNDS) * 100}%"></i></div>
        <div class="q">${item.prompt}</div><div class="opts">${item.options.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}</div><div id="fb"></div>`);
      view.querySelectorAll('.opt').forEach((b) => (b.onclick = () => {
        const i = +b.dataset.i, good = i === item.answer;
        view.querySelectorAll('.opt').forEach((x, j) => { x.disabled = true; if (j === item.answer) x.classList.add('ok'); });
        if (!good) b.classList.add('no');
        if (good) score++;
        const s = state.quiz[kind] || (state.quiz[kind] = { total: 0, correct: 0 });
        s.total++; if (good) s.correct++; save();
        $('#fb').innerHTML = `<div class="expl"><b>${good ? '✅ Doğru!' : '❌ Yanlış'}</b><br>${item.explain}</div><button class="btn" id="nx">${n >= ROUNDS ? 'Sonucu gör' : 'Sonraki'}</button>`;
        $('#nx').onclick = nextQ;
        $('#fb').scrollIntoView({ behavior: 'smooth', block: 'end' });
      }));
    };
    const finish = () => {
      html(`<div class="center"><h2>${score >= 8 ? '🎉 Harika!' : score >= 5 ? '👍 İyi gidiyorsun' : '📖 Biraz daha çalış'}</h2>
        <div class="stats"><div class="stat"><b>${score}/${ROUNDS}</b><small>Doğru</small></div></div>
        <button class="btn" id="again">Tekrar oyna</button><button class="btn ghost" id="menu">Quiz menüsü</button></div>`);
      $('#again').onclick = () => runQuiz(kind);
      $('#menu').onclick = renderQuizMenu;
    };
    nextQ();
  }

  // Soru üreticileri: { prompt, options[], answer, explain }
  function randomHandOfCat(target) {
    if (target === 8) {
      const s = pick(P.SUITS), hi = rnd(5, 14);
      return [0, 1, 2, 3, 4].map((i) => P.card(hi - i === 1 ? 14 : hi - i, s));
    }
    const deck = P.makeDeck();
    for (;;) {
      const h = P.shuffle(deck).slice(0, 5);
      if (P.best(h).cat === target) return h;
    }
  }
  function qHands() {
    const target = pick([0, 1, 1, 2, 2, 3, 4, 5, 6, 7, 8]);
    const hand = shuffled(randomHandOfCat(target));
    const r = P.best(hand);
    const name = P.catName(r.score, r.hand);
    const baseOpts = ['Yüksek Kart', 'Bir Çift', 'İki Çift', 'Üçlü', 'Seri (Straight)', 'Flush (Renk)', 'Full House', 'Kare', 'Straight Flush'];
    const wrong = shuffled(baseOpts.filter((o) => o !== name && !(name === 'Royal Flush' && o === 'Straight Flush'))).slice(0, 3);
    const options = shuffled([name, ...wrong]);
    return { prompt: `Bu elin adı nedir?<div class="hand">${cardsHTML(hand, true)}</div>`, options, answer: options.indexOf(name), explain: `Bu el: <b>${name}</b>.` };
  }
  function qWinner() {
    const deck = P.shuffle(P.makeDeck());
    const board = deck.slice(0, 5), a = deck.slice(5, 7), b = deck.slice(7, 9);
    const ra = P.best(a.concat(board)), rb = P.best(b.concat(board));
    const options = ['Oyuncu A', 'Oyuncu B', 'Beraberlik (pot bölünür)'];
    const answer = ra.score > rb.score ? 0 : ra.score < rb.score ? 1 : 2;
    const na = P.catName(ra.score, ra.hand), nb = P.catName(rb.score, rb.hand);
    return {
      prompt: `<div class="lbl">Board</div><div class="hand">${cardsHTML(board)}</div><div class="lbl">Oyuncu A</div><div class="hand">${cardsHTML(a)}</div><div class="lbl">Oyuncu B</div><div class="hand">${cardsHTML(b)}</div>`,
      options, answer,
      explain: `A: <b>${na}</b> (${cardsHTML(ra.hand)})<br>B: <b>${nb}</b> (${cardsHTML(rb.hand)})`,
    };
  }
  function qOdds() {
    const draws = [['flush çekişin', 9], ['açık uçlu seri çekişin', 8], ['içten seri (gutshot) çekişin', 4], ['iki overcard\'ın', 6], ['flush + açık uçlu seri çekişin', 15]];
    for (;;) {
      const [dn, outs] = pick(draws), flop = Math.random() < 0.6;
      const pot = rnd(3, 15) * 20, call = Math.max(10, Math.round((pot * (rnd(2, 10) / 10)) / 10) * 10);
      const need = (call / (pot + call)) * 100, eq = Math.min(100, outs * (flop ? 4 : 2));
      if (Math.abs(eq - need) < 4) continue;
      const callOk = eq > need;
      return {
        prompt: `${flop ? 'Flop' : 'Turn'}'dasın ve ${dn} var (<b>${outs} out</b>).<br>Pot (rakibin bahsi dahil): <b>${pot}</b><br>Call için ödemen gereken: <b>${call}</b><br><span class="sub">${flop ? '4' : '2'} kuralını kullan.</span>`,
        options: ['Call', 'Fold'], answer: callOk ? 0 : 1,
        explain: `Eşitlik ≈ ${outs} × ${flop ? 4 : 2} = <b>%${eq}</b>.<br>Gereken = ${call} ÷ (${pot} + ${call}) = <b>%${need.toFixed(0)}</b>.<br>${callOk ? 'Eşitlik gerekenden yüksek → Call karlı.' : 'Eşitlik gerekenden düşük → Fold.'}`,
      };
    }
  }
  function qPreflop() {
    const pos = pick(Object.keys(P.RANGES)), range = P.RANGES[pos];
    let c1, c2;
    if (Math.random() < 0.5) {
      const key = pick([...range]);
      const [h, l] = [P.rankVal(key[0]), P.rankVal(key[1])], suited = key[2] === 's';
      const s1 = pick(P.SUITS), s2 = suited || h === l ? (h === l ? pick(P.SUITS.filter((s) => s !== s1)) : s1) : pick(P.SUITS.filter((s) => s !== s1));
      c1 = P.card(h, s1); c2 = P.card(l, s2);
    } else {
      const d = P.shuffle(P.makeDeck()); c1 = d[0]; c2 = d[1];
    }
    const key = P.handKey(c1, c2), inR = range.has(key);
    return {
      prompt: `Pozisyon: <b>${P.POS_NAMES[pos]}</b>. Senden önce herkes pas geçti.<div class="hand">${cardsHTML([c1, c2], true)}</div>`,
      options: ['Raise (aç)', 'Fold'], answer: inR ? 0 : 1,
      explain: `<b>${key}</b> bu pozisyonda aralığımızda ${inR ? 'yer alıyor → raise.' : 'yer almıyor → fold.'}<br><span class="sub">${pos} aralığı ≈ %${P.rangePercent(range).toFixed(0)} el.</span>`,
    };
  }

  // ---- STRATEJİ TABLOSU ----
  let chartPos = 'UTG', chartSel = null;
  function renderChart() {
    header('Başlangıç Elleri');
    const range = P.RANGES[chartPos];
    const R = 'AKQJT98765432';
    let cells = '';
    for (let i = 0; i < 13; i++) for (let j = 0; j < 13; j++) {
      const key = i === j ? R[i] + R[j] : i < j ? R[i] + R[j] + 's' : R[j] + R[i] + 'o';
      cells += `<button class="cell${range.has(key) ? ' in' : ''}${i === j ? ' pair' : ''}${key === chartSel ? ' sel' : ''}" data-k="${key}">${key.replace(/[so]$/, (m) => (m === 's' ? 's' : 'o'))}</button>`;
    }
    const sel = chartSel ? `<div class="expl"><b>${chartSel}</b> — ${range.has(chartSel) ? '✅ Bu pozisyonda raise ile aç.' : '❌ Bu pozisyonda pas geç.'}</div>` : '<p class="sub">Bir ele dokun.</p>';
    html(`<h2>Açılış aralıkları</h2><p class="sub">Senden önce herkes pas geçtiğinde hangi elleri raise ile açmalısın?</p>
      <div class="chips">${Object.keys(P.RANGES).map((k) => `<button class="chip${k === chartPos ? ' on' : ''}" data-p="${k}">${k}</button>`).join('')}</div>
      <p><b>${P.POS_NAMES[chartPos]}</b> — ellerin <b>%${P.rangePercent(range).toFixed(0)}</b>'i</p>
      <div class="grid">${cells}</div>
      <div class="legend"><span><i style="background:#c9962a"></i>Çift</span><span><i style="background:#2e9e6b"></i>Aç</span><span><i style="background:#2a2a2a"></i>Pas</span></div>
      <p class="sub">Üst-sağ üçgen: suited (s). Alt-sol üçgen: offsuit (o). Köşegen: çiftler.</p>${sel}`);
    view.querySelectorAll('.chip').forEach((b) => (b.onclick = () => { chartPos = b.dataset.p; renderChart(); }));
    view.querySelectorAll('.cell').forEach((b) => (b.onclick = () => { chartSel = b.dataset.k; renderChart(); }));
  }

  // ---- SİMÜLATÖR ----
  let sim = null;
  function newHand() {
    const d = P.shuffle(P.makeDeck());
    sim = { hole: d.slice(0, 2), board: [], deck: d.slice(2), eq: null };
    renderSim();
  }
  const STAGES = ['Preflop', 'Flop', 'Turn', 'River'];
  function stageIdx() { return sim.board.length === 0 ? 0 : sim.board.length - 2; }
  function renderSim() {
    header('Simülatör');
    if (!sim) return newHand();
    const si = stageIdx();
    const made = sim.board.length >= 3 ? P.best(sim.hole.concat(sim.board)) : null;
    const nextLbl = si < 3 ? `${STAGES[si + 1]} aç` : null;
    html(`<h2>Eşitlik simülatörü</h2><p class="sub">Rastgele bir rakibe karşı kazanma şansını (eşitlik) gör. Kartlar açıldıkça nasıl değiştiğini izle.</p>
      <div class="table"><div class="sub">Board · ${STAGES[si]}</div><div class="hand">${cardsHTML(Array.from({ length: 5 }, (_, i) => sim.board[i]), true)}</div>
      <div class="sub">Senin elin</div><div class="hand">${cardsHTML(sim.hole, true)}</div></div>
      ${made ? `<p class="center">Mevcut el: <b>${P.catName(made.score, made.hand)}</b></p>` : `<p class="center">Başlangıç eli: <b>${P.handKey(sim.hole[0], sim.hole[1])}</b></p>`}
      <div class="meter"><i style="width:${sim.eq === null ? 0 : sim.eq * 100}%"></i><span>${sim.eq === null ? 'hesaplanıyor…' : 'Eşitlik %' + (sim.eq * 100).toFixed(0)}</span></div>
      <div class="expl" id="adv">${sim.eq === null ? '…' : advice(sim.eq, si)}</div>
      ${nextLbl ? `<button class="btn" id="deal">${nextLbl}</button>` : ''}
      <button class="btn ghost" id="new">Yeni el</button>`);
    if (nextLbl) $('#deal').onclick = () => { sim.board.push(...sim.deck.splice(0, si === 0 ? 3 : 1)); sim.eq = null; renderSim(); };
    $('#new').onclick = newHand;
    if (sim.eq === null) {
      const snap = sim;
      setTimeout(() => { if (sim !== snap || snap.eq !== null) return; snap.eq = P.equity(snap.hole, snap.board, 2500); if (sim === snap) renderSim(); }, 30);
    }
  }
  function advice(eq, si) {
    const p = eq * 100;
    const tip = p >= 65 ? 'Çok güçlü: değer için bahis/raise yap.' : p >= 50 ? 'Önde görünüyorsun: bahis yap veya call et, büyük pota dikkat.' : p >= 35 ? 'Orta: pot odds\'a göre karar ver, büyük bahislere dikkat et.' : 'Zayıf: çekişin yoksa fold düşün, ya da ucuz blöf fırsatı ara.';
    return `<b>Yorum:</b> ${tip}<br><span class="sub">Rastgele el karşısında ${si === 0 ? 'preflop' : STAGES[si].toLowerCase()} eşitliğin. Gerçek rakipler rastgele oynamaz; yine de iyi bir kılavuzdur.</span>`;
  }

  // ---- başlat ----
  setTab('learn');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
