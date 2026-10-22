const assert = require('assert');
const P = require('../js/poker.js');
const h = (s) => s.split(' ').map(P.parseCard);
const cat = (s) => P.best(h(s)).cat;

assert.strictEqual(cat('As Ks Qs Js Ts'), 8);
assert.strictEqual(P.catName(P.best(h('As Ks Qs Js Ts')).score, h('As Ks Qs Js Ts')), 'Royal Flush');
assert.strictEqual(cat('9h 9d 9s 9c 2d'), 7);
assert.strictEqual(cat('Kh Kd Ks 2c 2d'), 6);
assert.strictEqual(cat('Ah 9h 7h 4h 2h'), 5);
assert.strictEqual(cat('Ah 2d 3s 4c 5d'), 4);       // tekerlek
assert.strictEqual(cat('Th Jd Qs Kc Ad'), 4);
assert.strictEqual(cat('Qh Qd Qs 4c 2d'), 3);
assert.strictEqual(cat('Qh Qd 4s 4c 2d'), 2);
assert.strictEqual(cat('Qh Qd 5s 4c 2d'), 1);
assert.strictEqual(cat('Qh 9d 5s 4c 2d'), 0);
// 7 karttan en iyi: flush > seri
assert.strictEqual(cat('2h 5h 9h Jh Kh 3d 4c'), 5);
// kicker karşılaştırma ve tekerlek < 6'lı seri
const sc = (s) => P.best(h(s)).score;
assert(sc('Ah Ad Ks 3c 2d') > sc('Ah Ad Qs 3c 2d'));
assert(sc('2h 3d 4s 5c 6d') > sc('Ah 2d 3s 4c 5d'));
// aralıklar
assert(P.RANGES.UTG.has('AKs') && P.RANGES.UTG.has('77') && !P.RANGES.UTG.has('76s'));
assert(P.RANGES.BTN.has('22') && P.RANGES.BTN.has('K5s'));
assert.strictEqual(P.handKey(P.parseCard('Ks'), P.parseCard('Ah')), 'AKo');
const pct = P.rangePercent(P.RANGES.UTG), pb = P.rangePercent(P.RANGES.BTN);
assert(pct < P.rangePercent(P.RANGES.MP) && P.rangePercent(P.RANGES.MP) < P.rangePercent(P.RANGES.CO) && P.rangePercent(P.RANGES.CO) < pb);
// eşitlik: AA ~85% rastgele ele karşı, 72o ~35%
const eAA = P.equity(h('As Ah'), [], 6000), e72 = P.equity(h('7s 2h'), [], 6000);
assert(eAA > 0.82 && eAA < 0.88, 'AA ' + eAA);
assert(e72 > 0.31 && e72 < 0.40, '72o ' + e72);
console.log('OK', { utg: pct.toFixed(1), btn: pb.toFixed(1), eAA, e72 });
