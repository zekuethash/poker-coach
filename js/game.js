// No-limit Hold'em motoru + bot yapay zekâsı (4 kişilik masa: sen + 3 bot)
(function (root) {
  const P = root.Poker || require('./poker.js');
  const SB = 10, BB = 20, START = 1000;
  const BOTS = [
    { name: 'Tilki Tarık', avatar: '🦊', open: 6, call: 4.5, aggr: 0.45, bluff: 0.08, loose: 0.05, desc: 'Sıkı ve dengeli' },
    { name: 'Kedi Gül', avatar: '🐱', open: 4.5, call: 3, aggr: 0.2, bluff: 0.03, loose: 0.2, desc: 'Çok el oynar, az bahis yapar' },
    { name: 'Aslan Ali', avatar: '🦁', open: 3, call: 2, aggr: 0.7, bluff: 0.2, loose: 0.1, desc: 'Çok agresif, sık blöf yapar' },
  ];

  // Chen formülü: başlangıç eli gücü (~ -1..20)
  function chen(c1, c2) {
    const pts = (r) => (r === 14 ? 10 : r === 13 ? 8 : r === 12 ? 7 : r === 11 ? 6 : r / 2);
    const hi = Math.max(c1.r, c2.r), lo = Math.min(c1.r, c2.r);
    let s = pts(hi);
    if (hi === lo) return Math.ceil(Math.max(5, s * 2));
    if (c1.s === c2.s) s += 2;
    const gap = hi - lo - 1;
    s -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
    if (gap <= 1 && hi < 12) s += 1;
    return Math.ceil(s);
  }
  // Birden fazla rakibe karşı eşitlik yaklaşığı (tek rastgele ele karşı eşitlikten)
  const multiway = (eq, opps) => Math.pow(eq, 1 + 0.5 * Math.max(0, opps - 1));

  class Game {
    constructor() {
      this.players = [{ id: 0, name: 'Sen', avatar: '😎', human: true }].concat(BOTS.map((b, i) => ({ id: i + 1, name: b.name, avatar: b.avatar, style: b })));
      this.players.forEach((p) => (p.stack = START));
      this.n = this.players.length;
      this.button = this.n - 1;
      this.hands = 0;
      this.rebuys = 0;
      this.phase = 'idle';
      this.board = [];
    }
    pot() { return this.players.reduce((a, p) => a + p.total, 0); }
    alive() { return this.players.filter((p) => !p.folded); }

    startHand() {
      this.players.forEach((p) => {
        if (p.stack <= 0) { p.stack = START; if (p.human) this.rebuys++; p.rebought = true; } else p.rebought = false;
      });
      this.hands++;
      this.button = (this.button + 1) % this.n;
      const deck = P.shuffle(P.makeDeck());
      this.deck = deck;
      this.board = [];
      this.log = [];
      this.result = null;
      this.runout = false;
      this.players.forEach((p) => {
        p.hole = [deck.pop(), deck.pop()];
        p.folded = false; p.allIn = false; p.bet = 0; p.total = 0; p.acted = false; p.startStack = p.stack; p.last = '';
      });
      const sb = (this.button + 1) % this.n, bb = (this.button + 2) % this.n;
      this._post(sb, SB); this._post(bb, BB);
      this.currentBet = BB; this.minRaise = BB;
      this.phase = 'preflop';
      this.toAct = -1;
      this._advanceTurn((this.button + 2) % this.n);
    }
    _post(i, amt) {
      const p = this.players[i], put = Math.min(p.stack, amt);
      p.stack -= put; p.bet += put; p.total += put;
      if (p.stack === 0) p.allIn = true;
    }
    legal(i) {
      const p = this.players[i];
      const toCall = Math.min(p.stack, this.currentBet - p.bet);
      const maxTo = p.bet + p.stack;
      const minTo = Math.min(maxTo, this.currentBet + this.minRaise);
      return { toCall, canCheck: this.currentBet === p.bet, canRaise: p.stack > toCall, minTo, maxTo };
    }
    act(i, type, amount) {
      if (i !== this.toAct || this.phase === 'done') throw new Error('Sıra bu oyuncuda değil');
      const p = this.players[i], L = this.legal(i);
      if (type === 'check' && !L.canCheck) type = 'call';
      if (type === 'fold') { p.folded = true; p.last = 'Pas'; this.log.push(`${p.name}: pas`); }
      else if (type === 'check') { p.last = 'Check'; this.log.push(`${p.name}: check`); }
      else if (type === 'call') {
        const put = L.toCall; p.stack -= put; p.bet += put; p.total += put;
        if (p.stack === 0) p.allIn = true;
        p.last = p.allIn ? 'All-in' : 'Call'; this.log.push(`${p.name}: ${put ? 'call ' + put : 'check'}${p.allIn ? ' (all-in)' : ''}`);
      } else if (type === 'raise') {
        let to = Math.round(amount);
        to = Math.max(Math.min(to, L.maxTo), Math.min(L.minTo, L.maxTo));
        if (!L.canRaise || to <= this.currentBet) return this.act(i, 'call');
        const put = to - p.bet; p.stack -= put; p.bet = to; p.total += put;
        if (p.stack === 0) p.allIn = true;
        const size = to - this.currentBet;
        if (size >= this.minRaise) this.minRaise = size;
        const wasBet = this.currentBet === 0;
        this.currentBet = to;
        this.players.forEach((q) => { if (q !== p && !q.folded && !q.allIn) q.acted = false; });
        p.last = p.allIn ? 'All-in' : wasBet ? 'Bet' : 'Raise';
        this.log.push(`${p.name}: ${p.allIn ? 'all-in ' : wasBet ? 'bahis ' : 'raise '}${to}`);
      }
      p.acted = true;
      this._next();
    }
    _next() {
      const alive = this.alive();
      if (alive.length === 1) return this._award(alive[0]);
      const able = alive.filter((p) => !p.allIn);
      const done = able.length === 0 || (able.length === 1 && able[0].bet >= this.currentBet) || able.every((p) => p.acted && p.bet === this.currentBet);
      if (done) return this._endStreet();
      this._advanceTurn(this.toAct);
    }
    _advanceTurn(from) {
      for (let k = 1; k <= this.n; k++) {
        const p = this.players[(from + k) % this.n];
        if (!p.folded && !p.allIn && (!p.acted || p.bet < this.currentBet)) { this.toAct = p.id; return; }
      }
      this._endStreet();
    }
    _endStreet() {
      this.players.forEach((p) => { p.bet = 0; p.acted = false; p.last = p.folded ? 'Pas' : p.allIn ? 'All-in' : ''; });
      this.currentBet = 0; this.minRaise = BB;
      if (this.phase === 'river') return this._showdown();
      if (this.phase === 'preflop') { this.board.push(this.deck.pop(), this.deck.pop(), this.deck.pop()); this.phase = 'flop'; }
      else { this.board.push(this.deck.pop()); this.phase = this.phase === 'flop' ? 'turn' : 'river'; }
      const able = this.alive().filter((p) => !p.allIn);
      if (able.length <= 1) { this.runout = true; this.toAct = -1; return; }
      this.toAct = -1;
      this._advanceTurn(this.button);
    }
    advanceRunout() { if (this.runout) { this.runout = false; this._endStreet(); } }
    _award(p) {
      const amt = this.pot();
      p.stack += amt;
      this.result = { showdown: false, winners: { [p.id]: amt }, pots: [{ amount: amt, winners: [p.id] }], hands: {} };
      this.log.push(`${p.name} potu aldı (${amt})`);
      this.phase = 'done'; this.toAct = -1; this.runout = false;
    }
    _showdown() {
      const alive = this.alive();
      const hands = {}, scores = {};
      alive.forEach((p) => { const b = P.best(p.hole.concat(this.board)); scores[p.id] = b.score; hands[p.id] = { name: P.catName(b.score, b.hand), cards: b.hand }; });
      const levels = [...new Set(this.players.filter((p) => p.total > 0).map((p) => p.total))].sort((a, b) => a - b);
      const winners = {}, pots = [];
      let prev = 0;
      levels.forEach((lv) => {
        const amount = this.players.reduce((a, p) => a + Math.min(p.total, lv) - Math.min(p.total, prev), 0);
        const elig = alive.filter((p) => p.total >= lv);
        prev = lv;
        if (!amount || !elig.length) return;
        const top = Math.max(...elig.map((p) => scores[p.id]));
        const win = elig.filter((p) => scores[p.id] === top);
        // tek sayılmayan fişler düğmenin solundaki ilk kazanana
        const share = Math.floor(amount / win.length);
        let rem = amount - share * win.length;
        const ordered = win.slice().sort((a, b) => ((a.id - this.button - 1 + this.n) % this.n) - ((b.id - this.button - 1 + this.n) % this.n));
        ordered.forEach((p) => { const g = share + (rem-- > 0 ? 1 : 0); p.stack += g; winners[p.id] = (winners[p.id] || 0) + g; });
        pots.push({ amount, winners: win.map((p) => p.id) });
      });
      this.result = { showdown: true, winners, pots, hands };
      this.log.push('Showdown');
      this.phase = 'done'; this.toAct = -1; this.runout = false;
    }

    // ---- Bot kararı ----
    botAction(i) {
      const p = this.players[i], s = p.style, L = this.legal(i), pot = this.pot();
      const R = Math.random;
      const raiseTo = (target) => {
        let to = Math.round(target / 10) * 10;
        to = Math.max(L.minTo, Math.min(to, L.maxTo));
        if (to >= L.maxTo * 0.85) to = L.maxTo;
        return { type: 'raise', amount: to };
      };
      const check = L.canCheck ? { type: 'check' } : { type: 'fold' };
      if (this.phase === 'preflop') {
        const c = chen(p.hole[0], p.hole[1]);
        if (this.currentBet <= BB) {
          const limpers = this.players.filter((q) => !q.folded && q.bet === BB && q !== p).length;
          if (L.canRaise && (c >= s.open || R() < s.loose * (c >= 3 ? 1 : 0))) return raiseTo(BB * (2.5 + limpers) + (R() < 0.3 ? BB : 0));
          if (L.canCheck) return { type: 'check' };
          if (c >= s.call && R() < 0.35) return { type: 'call' };
          return { type: 'fold' };
        }
        const bigBet = L.toCall > p.stack * 0.4;
        const need = s.call + (this.currentBet > 6 * BB ? 2 : 0) + (bigBet ? 3 : 0);
        if (L.canRaise && c >= 10 && R() < 0.4 + s.aggr) return raiseTo(this.currentBet * 3);
        if (c >= need || (R() < s.loose * 0.5 && L.toCall <= 3 * BB)) return { type: 'call' };
        return check;
      }
      const eq = P.equity(p.hole, this.board, 250);
      const opps = this.alive().length - 1;
      const e = multiway(eq, opps);
      if (L.toCall === 0) {
        if (L.canRaise && e > 0.55 && R() < 0.5 + s.aggr * 0.5) return raiseTo(pot * (0.5 + R() * 0.3));
        if (L.canRaise && e > 0.4 && R() < s.aggr * 0.5) return raiseTo(pot * 0.4);
        if (L.canRaise && R() < s.bluff) return raiseTo(pot * 0.5);
        return { type: 'check' };
      }
      const req = L.toCall / (pot + L.toCall);
      if (L.canRaise && e > 0.72 && R() < 0.4 + s.aggr) return raiseTo(this.currentBet + pot * 0.75);
      if (e > req + 0.05 - s.loose) return { type: 'call' };
      return { type: 'fold' };
    }
  }

  const api = { Game, BOTS, SB, BB, START, chen, multiway };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Game = api;
})(typeof window !== 'undefined' ? window : globalThis);
