(function () {
  const P = window.Poker;
  const label = (r) => (r === 10 ? '10' : P.rankCh(r));
  function cardHTML(c, size) {
    const sz = size ? ' ' + size : '';
    if (!c) return `<span class="card back${sz}"><b>?</b></span>`;
    const red = c.s === 'h' || c.s === 'd';
    return `<span class="card${red ? ' red' : ''}${sz}"><b>${label(c.r)}</b><i>${P.SUIT_SYM[c.s]}</i></span>`;
  }
  const cardsHTML = (cs, size) => cs.map((c) => cardHTML(c, size)).join('');
  // [[As Kh]] -> kartlar
  const inlineCards = (html) => html.replace(/\[\[([^\]]+)\]\]/g, (_, t) => `<span class="hand">${cardsHTML(t.trim().split(/\s+/).map(P.parseCard))}</span>`);
  window.CardUI = { cardHTML, cardsHTML, inlineCards };
})();
