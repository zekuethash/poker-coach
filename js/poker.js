// Poker çekirdeği: kartlar, el değerlendirme, aralıklar, eşitlik simülasyonu
(function (root) {
  const RANKS = '23456789TJQKA';
  const SUITS = ['s', 'h', 'd', 'c'];
  const SUIT_SYM = { s: '♠', h: '♥', d: '♦', c: '♣' };
  const CAT_NAMES = ['Yüksek Kart', 'Bir Çift', 'İki Çift', 'Üçlü', 'Seri (Straight)', 'Flush (Renk)', 'Full House', 'Kare', 'Straight Flush'];

  const rankVal = (ch) => RANKS.indexOf(ch) + 2;
  const rankCh = (v) => RANKS[v - 2];
  const card = (r, s) => ({ r, s });
  const parseCard = (str) => card(rankVal(str[0].toUpperCase()), str[1].toLowerCase());

  function makeDeck() {
    const d = [];
    for (let r = 2; r <= 14; r++) for (const s of SUITS) d.push(card(r, s));
    return d;
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 5 kartlık skor: kategori * 15^5 + kicker'lar
  function eval5(cs) {
    const rs = cs.map((c) => c.r).sort((a, b) => b - a);
    const flush = cs.every((c) => c.s === cs[0].s);
    const cnt = {};
    rs.forEach((r) => (cnt[r] = (cnt[r] || 0) + 1));
    const groups = Object.keys(cnt).map(Number).sort((a, b) => cnt[b] - cnt[a] || b - a);
    const shape = groups.map((g) => cnt[g]).join('');
    let straightHigh = 0;
    if (groups.length === 5) {
      if (rs[0] - rs[4] === 4) straightHigh = rs[0];
      else if (rs[0] === 14 && rs[1] === 5) straightHigh = 5; // A-2-3-4-5
    }
    let cat;
    if (straightHigh && flush) cat = 8;
    else if (shape === '41') cat = 7;
    else if (shape === '32') cat = 6;
    else if (flush) cat = 5;
    else if (straightHigh) cat = 4;
    else if (shape === '311') cat = 3;
    else if (shape === '221') cat = 2;
    else if (shape === '2111') cat = 1;
    else cat = 0;
    const tb = straightHigh ? [straightHigh] : groups;
    let score = cat;
    for (let i = 0; i < 5; i++) score = score * 15 + (tb[i] || 0);
    return score;
  }
  const catOf = (score) => Math.floor(score / 759375); // 15^5

  // 5-7 karttan en iyi 5'li
  function best(cards) {
    const n = cards.length;
    let bestScore = -1, bestHand = null;
    for (let a = 0; a < n - 4; a++)
      for (let b = a + 1; b < n - 3; b++)
        for (let c = b + 1; c < n - 2; c++)
          for (let d = c + 1; d < n - 1; d++)
            for (let e = d + 1; e < n; e++) {
              const h = [cards[a], cards[b], cards[c], cards[d], cards[e]];
              const s = eval5(h);
              if (s > bestScore) { bestScore = s; bestHand = h; }
            }
    return { score: bestScore, cat: catOf(bestScore), hand: bestHand };
  }
  function catName(score, hand) {
    const c = catOf(score);
    if (c === 8 && hand && Math.max(...hand.map((x) => x.r)) === 14 && hand.some((x) => x.r === 13)) return 'Royal Flush';
    return CAT_NAMES[c];
  }

  // Monte Carlo: rastgele tek rakibe karşı eşitlik (beraberlik yarım sayılır)
  function equity(hole, board, sims = 2000) {
    const used = new Set([...hole, ...board].map((c) => c.r * 4 + SUITS.indexOf(c.s)));
    const rest = makeDeck().filter((c) => !used.has(c.r * 4 + SUITS.indexOf(c.s)));
    let win = 0;
    const need = 5 - board.length;
    for (let i = 0; i < sims; i++) {
      // kısmi Fisher-Yates: ilk (need+2) kartı çek
      for (let k = 0; k < need + 2; k++) {
        const j = k + Math.floor(Math.random() * (rest.length - k));
        [rest[k], rest[j]] = [rest[j], rest[k]];
      }
      const full = board.concat(rest.slice(0, need));
      const opp = rest.slice(need, need + 2);
      const a = best(hole.concat(full)).score;
      const b = best(opp.concat(full)).score;
      win += a > b ? 1 : a === b ? 0.5 : 0;
    }
    return win / sims;
  }

  // ---- Başlangıç eli aralıkları ----
  const handKey = (c1, c2) => {
    const [h, l] = c1.r >= c2.r ? [c1, c2] : [c2, c1];
    if (h.r === l.r) return rankCh(h.r) + rankCh(l.r);
    return rankCh(h.r) + rankCh(l.r) + (h.s === l.s ? 's' : 'o');
  };
  function parseRange(str) {
    const set = new Set();
    str.split(/[\s,]+/).filter(Boolean).forEach((t) => {
      let m = t.match(/^([2-9TJQKA])\1(\+)?$/);
      if (m) {
        const lo = rankVal(m[1]);
        for (let r = lo; r <= (m[2] ? 14 : lo); r++) set.add(rankCh(r) + rankCh(r));
        return;
      }
      m = t.match(/^([2-9TJQKA])([2-9TJQKA])(s|o)(\+)?$/);
      if (m) {
        const hi = rankVal(m[1]), lo = rankVal(m[2]);
        for (let r = lo; r <= (m[4] ? hi - 1 : lo); r++) set.add(rankCh(hi) + rankCh(r) + m[3]);
      }
    });
    return set;
  }
  const RANGES = {
    UTG: parseRange('77+ ATs+ KQs QJs JTs AJo+ KQo'),
    MP: parseRange('66+ A9s+ A5s KTs+ QTs+ JTs T9s ATo+ KJo+'),
    CO: parseRange('44+ A2s+ K8s+ Q9s+ J9s+ T9s 98s 87s A9o+ KTo+ QJo'),
    BTN: parseRange('22+ A2s+ K5s+ Q8s+ J8s+ T8s+ 97s+ 86s+ 76s 65s A7o+ K9o+ QTo+ JTo'),
  };
  const POS_NAMES = { UTG: 'Erken Pozisyon (UTG)', MP: 'Orta Pozisyon (MP)', CO: 'Geç Pozisyon (CO)', BTN: 'Düğme (BTN)' };
  const combos = (k) => (k.length === 2 ? 6 : k[2] === 's' ? 4 : 12);
  function rangePercent(set) {
    let t = 0;
    set.forEach((k) => (t += combos(k)));
    return (t / 1326) * 100;
  }

  const api = { RANKS, SUITS, SUIT_SYM, CAT_NAMES, rankVal, rankCh, card, parseCard, makeDeck, shuffle, eval5, best, catOf, catName, equity, handKey, parseRange, RANGES, POS_NAMES, combos, rangePercent };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Poker = api;
})(typeof window !== 'undefined' ? window : globalThis);
