// Botlara karşı oyun ekranı
(function () {
  const P = window.Poker, G = window.Game, A = window.App, { cardHTML, cardsHTML } = window.CardUI;
  const $ = (s, el = document) => el.querySelector(s);
  let game = null, timer = null, ui = {}, el = null;

  function start() {
    game = new G.Game();
    el = A.screen('<div class="lt"><button class="x" id="quit">✕</button><div style="flex:1;font-weight:800" id="hinfo"></div></div><div id="table" style="flex:1;overflow-y:auto;display:flex;flex-direction:column"></div><div class="actions" id="actions"></div>', 'play');
    $('#quit', el).onclick = () => { clearTimeout(timer); game = null; A.setTab('play'); };
    nextHand();
  }
  function nextHand() { game.startHand(); ui = { raise: false, coach: null, counted: false }; render(); loop(); }

  function loop() {
    clearTimeout(timer);
    if (!game) return;
    if (game.phase === 'done') { finishHand(); render(); return; }
    if (game.runout) { timer = setTimeout(() => { game.advanceRunout(); render(); loop(); }, 1000); return; }
    if (!game.players[game.toAct].human) {
      timer = setTimeout(() => {
        if (!game) return;
        const d = game.botAction(game.toAct);
        game.act(game.toAct, d.type, d.amount);
        render(); loop();
      }, 700 + Math.random() * 700);
    }
  }
  function finishHand() {
    if (ui.counted) return;
    ui.counted = true;
    const me = game.players[0], net = me.stack - me.startStack, s = A.getState().play;
    s.hands++; s.net += net;
    const won = (game.result.winners[0] || 0) > 0 && net > 0;
    if (won) { s.won++; A.addXp(5); A.sfx.win(); } else A.addXp(1);
    A.save();
  }

  function seatHTML(p) {
    const g = game, turn = g.toAct === p.id && g.phase !== 'done' && !g.runout;
    const showCards = g.phase === 'done' && g.result.showdown && !p.folded;
    const cards = p.folded ? '' : showCards ? cardsHTML(p.hole, 'sm') : cardsHTML([null, null], 'sm');
    const win = g.phase === 'done' && g.result.winners[p.id];
    return `<div class="seat${p.folded ? ' fold' : ''}${turn ? ' turn' : ''}">${g.button === p.id ? '<span class="dealer">D</span>' : ''}
      <div class="av">${p.avatar}</div><div class="nm">${p.name}</div><div class="stk">${p.stack}</div>
      <div class="cs">${cards}</div>
      <div class="st">${win ? '🏆 +' + win : turn ? 'düşünüyor…' : p.last}</div>${p.bet ? `<span class="betchip">${p.bet}</span>` : ''}</div>`;
  }

  function render() {
    if (!game) return;
    const g = game, me = g.players[0], done = g.phase === 'done';
    const myTurn = !done && !g.runout && g.toAct === 0;
    $('#hinfo', el).textContent = `El #${g.hands} · ${({ preflop: 'Preflop', flop: 'Flop', turn: 'Turn', river: 'River', done: 'Bitti' })[g.phase]} · Blind ${G.SB}/${G.BB}`;
    const hr = done && g.result.showdown && !me.folded ? g.result.hands[0] : null;
    const net = me.stack - me.startStack;
    $('#table', el).innerHTML = `<div class="seats" style="margin-top:4px">${g.players.slice(1).map(seatHTML).join('')}</div>
      <div class="mid"><div class="pot">Pot: ${g.pot()}</div><div class="board">${cardsHTML(Array.from({ length: 5 }, (_, i) => g.board[i] || null).map((c) => c), 'lg').replace(/card back lg/g, 'card empty lg').replace(/<b>\?<\/b>/g, '<b>&nbsp;</b>')}</div></div>
      <div class="logline">${g.log.slice(-3).join('<br>')}</div>
      <div class="me${myTurn ? ' turn' : ''}"><div class="nm" style="font-weight:800">😎 Sen · <span style="color:var(--gold)">${me.stack}</span>${me.bet ? ` <span class="betchip">${me.bet}</span>` : ''}${g.button === 0 ? ' <span class="dealer" style="position:static;display:inline-flex">D</span>' : ''}</div>
      <div>${me.folded ? '<span class="sub" style="color:#cfe">Pas geçtin</span>' : cardsHTML(me.hole, 'lg')}</div>${hr ? `<div class="st" style="font-size:13px">${hr.name}</div>` : ''}</div>`;
    renderActions(myTurn, done, net);
  }

  function renderActions(myTurn, done, net) {
    const g = game, me = g.players[0], box = $('#actions', el);
    if (done) {
      const w = g.result.winners, top = Object.keys(w).map(Number).sort((a, b) => w[b] - w[a])[0];
      const winner = g.players[top];
      const msg = net > 0 ? `🎉 Kazandın! +${net}` : net < 0 ? `${winner.name} kazandı (${net})` : 'Beraberlik';
      const how = g.result.showdown ? `${winner.name}: ${g.result.hands[top].name}` : 'Diğerleri pas geçti';
      box.innerHTML = `<div class="result"><h3>${msg}</h3><div class="sub" style="color:#cfe">${how}</div></div>${me.stack === 0 ? '<p class="center sub" style="color:#cfe">Fişin bitti, yeniden 1000 fişle başlıyorsun.</p>' : ''}<button class="btn" id="next">Sonraki el</button>`;
      $('#next', box).onclick = nextHand;
      return;
    }
    if (!myTurn) { box.innerHTML = '<div class="center sub" style="color:#cfe;padding:14px">Bot oynuyor…</div>'; return; }
    const L = g.legal(0), pot = g.pot();
    const coach = ui.coach ? `<div class="coach">${ui.coach}</div>` : '';
    let raise = '';
    if (ui.raise && L.canRaise) {
      if (ui.raiseTo === undefined || ui.raiseTo < L.minTo || ui.raiseTo > L.maxTo) ui.raiseTo = L.minTo;
      raise = `<div class="raisebox"><div class="rv" id="rv">${ui.raiseTo}</div><input type="range" id="rs" min="${L.minTo}" max="${L.maxTo}" step="${L.maxTo - L.minTo > 10 ? 10 : 1}" value="${ui.raiseTo}">
        <div class="quick"><button data-f="0.5">½ pot</button><button data-f="0.75">¾ pot</button><button data-f="1">Pot</button><button data-f="all">All-in</button></div><button class="btn orange" id="conf">Onayla</button></div>`;
    }
    box.innerHTML = `${coach}${raise}<div class="row"><button class="btn red" id="fold">Pas</button>
      <button class="btn blue" id="call">${L.canCheck ? 'Check' : 'Call ' + L.toCall}</button>
      ${L.canRaise ? `<button class="btn orange" id="raise">${g.currentBet === 0 ? 'Bahis' : 'Raise'}</button>` : ''}</div>
      <div class="center"><button class="coachbtn" id="coach">💡 Koç ipucu</button></div>`;
    const act = (t, a) => { ui.raise = false; ui.coach = null; g.act(0, t, a); render(); loop(); };
    $('#fold', box).onclick = () => (L.canCheck && !confirm('Check yapabilirsin, yine de pas geçilsin mi?') ? null : act('fold'));
    $('#call', box).onclick = () => act(L.canCheck ? 'check' : 'call');
    const rb = $('#raise', box); if (rb) rb.onclick = () => { ui.raise = !ui.raise; if (ui.raise) ui.coach = null; render(); };
    $('#coach', box).onclick = () => { ui.coach = coachText(L); render(); };
    if (raise) {
      const rs = $('#rs', box), rv = $('#rv', box);
      rs.oninput = () => { ui.raiseTo = +rs.value; rv.textContent = rs.value; };
      box.querySelectorAll('.quick button').forEach((b) => (b.onclick = () => {
        const f = b.dataset.f;
        const to = f === 'all' ? L.maxTo : g.currentBet + parseFloat(f) * (pot + L.toCall);
        ui.raiseTo = Math.max(L.minTo, Math.min(L.maxTo, Math.round(to / 10) * 10)); render();
      }));
      $('#conf', box).onclick = () => act('raise', ui.raiseTo);
    }
  }

  function coachText(L) {
    const g = game, me = g.players[0], pot = g.pot(), opps = g.alive().length - 1;
    const eq = P.equity(me.hole, g.board, 1500), e = G.multiway(eq, opps);
    const pct = (x) => Math.round(x * 100) + '%';
    let msg = `Rastgele bir ele karşı eşitliğin <b>${pct(eq)}</b>; ${opps} rakibe karşı yaklaşık <b>${pct(e)}</b>. `;
    if (L.toCall === 0) {
      msg += e > 0.55 ? 'Güçlüsün: <b>bahis yap</b> (½–¾ pot) ve değer al.' : e > 0.4 ? 'Orta güçtesin: küçük bahis ya da <b>check</b>.' : 'Zayıfsın: <b>check</b> ile bedava kart gör.';
    } else {
      const req = L.toCall / (pot + L.toCall);
      msg += `Call için gereken eşitlik (pot odds): <b>${pct(req)}</b>. `;
      msg += e > 0.72 ? 'Çok güçlüsün: <b>raise</b> düşün.' : e > req ? '<b>Call</b> karlı görünüyor.' : '<b>Pas</b> daha mantıklı; eşitliğin gereken oranın altında.';
    }
    return msg;
  }

  window.Play = { start };
})();
