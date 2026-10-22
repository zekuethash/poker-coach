const assert = require('assert');
const P = require('../js/poker.js');
globalThis.Poker = P;
const { Game, chen, START } = require('../js/game.js');

assert(chen(P.parseCard('As'), P.parseCard('Ah')) >= 20);
assert(chen(P.parseCard('7s'), P.parseCard('2h')) < 0 + 1);
assert(chen(P.parseCard('As'), P.parseCard('Ks')) === 12);

// Tüm oyuncular bot gibi oynasın: fiş korunumu ve oyunun sonlanması
const g = new Game();
g.players[0].style = require('../js/game.js').BOTS[0];
let rebuyTotal = 0;
for (let h = 0; h < 600; h++) {
  g.players.forEach((p) => { if (p.stack <= 0) rebuyTotal += START; });
  g.startHand();
  let guard = 0;
  while (g.phase !== 'done') {
    if (++guard > 200) throw new Error('takıldı: ' + JSON.stringify(g.log));
    if (g.runout) { g.advanceRunout(); continue; }
    const d = g.botAction(g.toAct);
    g.act(g.toAct, d.type, d.amount);
  }
  const total = g.players.reduce((a, p) => a + p.stack, 0);
  assert.strictEqual(total, START * 4 + rebuyTotal, `fiş korunumu el ${h}: ${total}`);
  assert(g.players.every((p) => p.stack >= 0));
  assert(Object.values(g.result.winners).reduce((a, b) => a + b, 0) === g.players.reduce((a, p) => a + p.total, 0));
}
// Side pot: kısa stack all-in kazanır, kalan pot diğerine gider
const g2 = new Game();
g2.startHand();
g2.players.forEach((p) => { p.total = 0; p.folded = false; });
g2.board = ['As', 'Ks', 'Qs', '2d', '3c'].map(P.parseCard);
const hs = ['Ah Ad', 'Kh Kd', '7h 8h', '9c 9d'];
g2.players.forEach((p, i) => { p.hole = hs[i].split(' ').map(P.parseCard); p.stack = 0; });
g2.players[0].total = 100; g2.players[1].total = 300; g2.players[2].total = 300; g2.players[3].total = 300; // oyuncu0 kısa
g2.phase = 'river'; g2._showdown();
assert.strictEqual(g2.result.winners[0], 400);  // ana pot
assert.strictEqual(g2.result.winners[1], 600);  // yan pot (KK > 99 > 78)
console.log('OK, rebuys', rebuyTotal / START);
