// Dinamik soru üreticileri: { prompt, options[], answer, explain }
(function () {
  const P = window.Poker, { cardsHTML } = window.CardUI;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffled = (a) => P.shuffle(a.slice());

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
  function hands(maxCat) {
    const pool = [0, 1, 1, 2, 2, 3, 4, 5, 6, 7, 8].filter((c) => c <= (maxCat === undefined ? 8 : maxCat));
    const hand = shuffled(randomHandOfCat(pick(pool)));
    const r = P.best(hand), name = P.catName(r.score, r.hand);
    const all = P.CAT_NAMES.slice();
    const wrong = shuffled(all.filter((o) => o !== name && !(name === 'Royal Flush' && o === 'Straight Flush'))).slice(0, 3);
    const options = shuffled([name, ...wrong]);
    return { prompt: `Bu elin adı nedir?<div class="hand">${cardsHTML(hand, 'lg')}</div>`, options, answer: options.indexOf(name), explain: `Bu el: <b>${name}</b>.` };
  }
  function winner() {
    const deck = P.shuffle(P.makeDeck());
    const board = deck.slice(0, 5), a = deck.slice(5, 7), b = deck.slice(7, 9);
    const ra = P.best(a.concat(board)), rb = P.best(b.concat(board));
    const answer = ra.score > rb.score ? 0 : ra.score < rb.score ? 1 : 2;
    return {
      prompt: `Kim kazanır?<div class="lbl">Board</div><div class="hand">${cardsHTML(board)}</div><div class="lbl">Oyuncu A</div><div class="hand">${cardsHTML(a)}</div><div class="lbl">Oyuncu B</div><div class="hand">${cardsHTML(b)}</div>`,
      options: ['Oyuncu A', 'Oyuncu B', 'Beraberlik'], answer,
      explain: `A: <b>${P.catName(ra.score, ra.hand)}</b> ${cardsHTML(ra.hand)}<br>B: <b>${P.catName(rb.score, rb.hand)}</b> ${cardsHTML(rb.hand)}`,
      fixedOrder: true,
    };
  }
  function odds() {
    const draws = [['flush çekişin', 9], ['açık uçlu seri çekişin', 8], ['içten seri (gutshot) çekişin', 4], ['iki overcard\'ın', 6], ['flush + açık uçlu seri çekişin', 15]];
    for (;;) {
      const [dn, outs] = pick(draws), flop = Math.random() < 0.6;
      const pot = rnd(3, 15) * 20, call = Math.max(10, Math.round((pot * (rnd(2, 10) / 10)) / 10) * 10);
      const need = (call / (pot + call)) * 100, eq = Math.min(100, outs * (flop ? 4 : 2));
      if (Math.abs(eq - need) < 4) continue;
      const ok = eq > need;
      return {
        prompt: `${flop ? 'Flop' : 'Turn'}'dasın ve ${dn} var (<b>${outs} out</b>).<br>Pot (rakibin bahsi dahil): <b>${pot}</b><br>Call için ödemen gereken: <b>${call}</b><br><span class="sub">${flop ? '4' : '2'} kuralını kullan.</span>`,
        options: ['Call', 'Fold'], answer: ok ? 0 : 1, fixedOrder: true,
        explain: `Eşitlik ≈ ${outs} × ${flop ? 4 : 2} = <b>%${eq}</b>. Gereken = ${call} ÷ (${pot} + ${call}) = <b>%${need.toFixed(0)}</b>. ${ok ? 'Eşitlik yüksek → Call.' : 'Eşitlik düşük → Fold.'}`,
      };
    }
  }
  function preflop() {
    const pos = pick(Object.keys(P.RANGES)), range = P.RANGES[pos];
    let c1, c2;
    if (Math.random() < 0.5) {
      const key = pick([...range]);
      const h = P.rankVal(key[0]), l = P.rankVal(key[1]), suited = key[2] === 's';
      const s1 = pick(P.SUITS), other = pick(P.SUITS.filter((s) => s !== s1));
      c1 = P.card(h, s1); c2 = P.card(l, suited ? s1 : other);
    } else { const d = P.shuffle(P.makeDeck()); c1 = d[0]; c2 = d[1]; }
    const key = P.handKey(c1, c2), inR = range.has(key);
    return {
      prompt: `Pozisyon: <b>${P.POS_NAMES[pos]}</b>. Senden önce herkes pas geçti.<div class="hand">${cardsHTML([c1, c2], 'lg')}</div>`,
      options: ['Raise (aç)', 'Fold'], answer: inR ? 0 : 1, fixedOrder: true,
      explain: `<b>${key}</b> bu pozisyonda aralıkta ${inR ? 'yer alıyor → raise.' : 'yer almıyor → fold.'} <span class="sub">(${pos} ≈ %${P.rangePercent(range).toFixed(0)} el)</span>`,
    };
  }
  window.QuizGen = { hands, winner, odds, preflop };
})();
