/* =============================================================
   THOMAS OU · TABLE 01 · poker.js
   Click a card → card flips → SPA navigates to that route.
   Integrates with existing SPARouter.
   ============================================================= */

(() => {
  const CARDS = [
    { id: 'home',       label: 'HOME',        val: '10', suit: '♠', role: 'The Dealer',    sub: 'Welcome to the table' },
    { id: 'about',      label: 'ABOUT',       val: 'J',  suit: '♠', role: 'The Human',     sub: 'Penn · Boxing · Poker' },
    { id: 'projects',   label: 'PROJECTS',    val: 'Q',  suit: '♠', role: 'The Builder',   sub: 'D4NCE · V3RSUS · HarborOS' },
    { id: 'experience', label: 'EXPERIENCE',  val: 'K',  suit: '♠', role: 'The Exploit',   sub: 'Casino → Anthropic' },
    { id: 'contact',    label: 'CONTACT',     val: 'A',  suit: '♠', role: 'Deal Me In',    sub: 'hi@thomasou.com' },
  ];

  const DEALER_LINES = {
    welcome:   ['Cards are live. Pick one.', 'Deal yourself in whenever.', 'Hover to peek. Click to flip.'],
    first:     ['Nice read.', 'Good.', 'Keep going.'],
    second:    ['Two down.', 'You are working the hand.'],
    third:     ['Three in.', 'Turn is live.'],
    fourth:    ['Fourth street.', 'One to go.'],
    showdown:  ['Royal flush of spades.', 'The hand is yours.'],
    idle:      ['Still thinking?', 'The cards do not bite.', 'Peek one — they are real.'],
    allin:     ['All in. I respect it.', 'Whole hand, at once.'],
    reshuffle: ['Fresh hand, coming up.', 'Let me deal again.', 'Reshuffling.'],
  };

  const root = document.querySelector('[data-poker]');
  if (!root) return;

  const handEl   = root.querySelector('#hand');
  const progEl   = root.querySelector('#progress');
  const dealBtn  = root.querySelector('#deal-btn');
  const allInBtn = root.querySelector('#allin-btn');
  const muteBtn  = root.querySelector('#mute');
  const clockEl  = root.querySelector('#clock');
  const dealer   = root.querySelector('#dealer');
  const mainEl   = root.querySelector('#poker-main');

  const REV_KEY = 'poker:revealed';
  let revealed = new Set(JSON.parse(sessionStorage.getItem(REV_KEY) || '[]'));
  let muted = localStorage.getItem('poker:muted') === '1';
  let idleTimer, peekedSlot;
  let isReshuffling = false;
  applyMute();

  /* ---------- Audio ---------- */
  let actx;
  function tone(freq, dur=0.08, type='sine', vol=0.1) {
    if (muted) return;
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(); o.stop(actx.currentTime + dur);
  }
  const SFX = {
    snap:  () => { tone(220, 0.05, 'square', 0.08); setTimeout(() => tone(160, 0.04, 'square', 0.05), 20); },
    flip:  () => { tone(540, 0.07, 'triangle', 0.11); setTimeout(() => tone(720, 0.1, 'sine', 0.1), 70); },
    chip:  () => tone(880, 0.04, 'square', 0.06),
    chime: () => { [523.25, 659.25, 783.99].forEach((f,i) => setTimeout(() => tone(f, 0.15, 'triangle', 0.11), i*90)); },
    shuf:  () => { for (let i=0; i<10; i++) setTimeout(() => tone(180 + Math.random()*220, 0.03, 'square', 0.04), i*55); },
  };

  function applyMute() {
    if (!muteBtn) return;
    muteBtn.textContent = muted ? '♫ SOUND · OFF' : '♫ SOUND · ON';
    muteBtn.classList.toggle('on', !muted);
  }
  if (muteBtn) muteBtn.addEventListener('click', () => {
    muted = !muted;
    localStorage.setItem('poker:muted', muted ? '1' : '0');
    applyMute();
    if (!muted) SFX.chip();
  });

  /* ---------- Dealer bubble ---------- */
  function dealerSay(pool, options={}) {
    if (!dealer) return;
    const lines = Array.isArray(pool) ? pool : DEALER_LINES[pool];
    if (!lines || !lines.length) return;
    const text = lines[Math.floor(Math.random() * lines.length)];
    dealer.textContent = text;
    dealer.classList.add('show');
    clearTimeout(dealer._t);
    dealer._t = setTimeout(() => dealer.classList.remove('show'), options.duration || 3200);
  }

  /* ---------- Build hand ---------- */
  function buildHand(opts = {}) {
    handEl.innerHTML = '';
    CARDS.forEach((c, i) => {
      const slot = document.createElement('div');
      slot.className = 'card-slot';
      slot.dataset.id = c.id;
      slot.style.setProperty('--i', i);
      slot.innerHTML = `
        <div class="card-label">CARD.${String(i+1).padStart(3,'0')} · ${c.label}</div>
        <div class="card ${revealed.has(c.id) ? 'flipped' : ''}" data-id="${c.id}">
          <div class="face back"><div class="monogram">TO</div></div>
          <div class="face front">
            <div class="big-suit">${c.suit}</div>
            <div class="corner"><div class="v">${c.val}</div><div class="s">${c.suit}</div></div>
            <div class="middle">
              <div>
                <div class="role">${c.role}</div>
                <span class="sub">${c.sub}</span>
              </div>
            </div>
            <div class="corner br"><div class="v">${c.val}</div><div class="s">${c.suit}</div></div>
          </div>
          <div class="peek-hint">PEEK · CLICK TO OPEN ${c.label}</div>
        </div>
      `;
      if (revealed.has(c.id)) slot.classList.add('revealed');
      handEl.appendChild(slot);

      const cardEl = slot.querySelector('.card');
      cardEl.addEventListener('click', () => onCardClick(c, cardEl));
      cardEl.addEventListener('mouseenter', () => { resetIdle(); SFX.chip(); });
      cardEl.addEventListener('mousemove', e => {
        const r = cardEl.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top)  / r.height) * 100;
        cardEl.style.setProperty('--mx', mx + '%');
        cardEl.style.setProperty('--my', my + '%');
      });
    });
    if (!opts.silent) {
      setTimeout(() => SFX.snap(), 100);
      setTimeout(() => SFX.snap(), 280);
      setTimeout(() => SFX.snap(), 460);
      setTimeout(() => dealerSay('welcome'), 900);
    }
  }

  /* ---------- Click: flip + navigate ---------- */
  function onCardClick(card, cardEl) {
    if (isReshuffling) return;
    const alreadyRevealed = revealed.has(card.id);
    cardEl.classList.add('cut');
    SFX.snap();

    setTimeout(() => {
      cardEl.classList.remove('cut');
      if (!alreadyRevealed) {
        revealed.add(card.id);
        sessionStorage.setItem(REV_KEY, JSON.stringify([...revealed]));
        cardEl.classList.add('flipped');
        cardEl.closest('.card-slot').classList.add('revealed');
        SFX.flip();
        updateStatus();
        const n = revealed.size;
        const pool = n===1 ? 'first' : n===2 ? 'second' : n===3 ? 'third' : n===4 ? 'fourth' : 'showdown';
        dealerSay(pool);
      }
      // Navigate after the flip animation settles. Home card stays on home.
      if (card.id === 'home') return;
      setTimeout(() => {
        if (window.spaRouter && typeof window.spaRouter.navigateTo === 'function') {
          window.spaRouter.navigateTo(card.id);
        } else {
          // Fallback: just change hash
          window.location.hash = '#' + card.id;
        }
      }, alreadyRevealed ? 140 : 700);
    }, 140);
  }

  /* ---------- HUD ---------- */
  function updateStatus() {
    const count = revealed.size;
    const cc = root.querySelector('#cards-count'); if (cc) cc.textContent = count;
    const ph = root.querySelector('#phire'); if (ph) ph.textContent = Math.min(0.04 + 0.2*count, 0.98).toFixed(2);
    const pot = (count * 240 + (count ? 120 : 0));
    const potEl = root.querySelector('#pot'); if (potEl) potEl.textContent = '$' + pot.toLocaleString();
    if (progEl) progEl.style.setProperty('--progress', (count/5*100) + '%');
    const action = root.querySelector('#action');
    if (action) {
      if (count === 5) {
        action.innerHTML = '♠ ROYAL · <b>FLUSH</b>';
        const sd = root.querySelector('#showdown'); if (sd) sd.style.display = 'block';
      } else {
        action.innerHTML = ['LIMP','CALL','RAISE','3-BET','ALL-IN'][count] || 'LIMP';
      }
    }
  }

  /* ---------- Live clock ---------- */
  function tickClock() {
    if (!clockEl) return;
    const d = new Date();
    clockEl.textContent = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' EST';
  }
  tickClock(); setInterval(tickClock, 30000);

  /* ---------- B3 · Riffle shuffle then re-deal ---------- */
  function riffleThenRedeal() {
    if (isReshuffling) return;
    isReshuffling = true;
    dealerSay('reshuffle');
    SFX.shuf();

    // Trigger riffle animation on current cards
    handEl.querySelectorAll('.card-slot').forEach(s => s.classList.add('riffle'));

    setTimeout(() => {
      // Clear state
      revealed.clear();
      sessionStorage.removeItem(REV_KEY);
      const sd = root.querySelector('#showdown'); if (sd) sd.style.display = 'none';
      // Rebuild hand (cards come in with dealIn animation)
      buildHand();
      updateStatus();
      isReshuffling = false;
    }, 900);
  }
  if (dealBtn) dealBtn.addEventListener('click', riffleThenRedeal);

  /* ---------- ALL IN ---------- */
  function allIn() {
    if (isReshuffling) return;
    dealerSay('allin');
    SFX.shuf();
    CARDS.forEach((c, i) => {
      if (c.id === 'home') return; // don't navigate away on all-in
      const slot = handEl.querySelector(`.card-slot[data-id="${c.id}"]`);
      const cardEl = slot && slot.querySelector('.card');
      if (!cardEl || revealed.has(c.id)) return;
      setTimeout(() => {
        revealed.add(c.id);
        cardEl.classList.add('flipped');
        slot.classList.add('revealed');
        SFX.flip();
      }, i * 140);
    });
    setTimeout(() => {
      sessionStorage.setItem(REV_KEY, JSON.stringify([...revealed]));
      updateStatus();
    }, 900);
  }
  if (allInBtn) allInBtn.addEventListener('click', allIn);

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (document.body.getAttribute('data-current-route') !== 'home') return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 5) {
      const card = CARDS[n-1];
      const slot = handEl.querySelector(`.card-slot[data-id="${card.id}"]`);
      const cardEl = slot && slot.querySelector('.card');
      if (cardEl) onCardClick(card, cardEl);
    } else if (e.key.toLowerCase() === 'a') {
      allIn();
    } else if (e.key.toLowerCase() === 'r') {
      riffleThenRedeal();
    }
  });

  /* ---------- Mouse parallax on the table ---------- */
  if (mainEl) {
    let px = 0, py = 0, tx = 0, ty = 0, raf;
    root.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      tx = x * 5; ty = y * -2.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    function loop() {
      px += (tx - px) * 0.07;
      py += (ty - py) * 0.07;
      mainEl.style.setProperty('--tilt-x', py.toFixed(2) + 'deg');
      mainEl.style.setProperty('--tilt-y', px.toFixed(2) + 'deg');
      if (Math.abs(tx-px) > 0.01 || Math.abs(ty-py) > 0.01) raf = requestAnimationFrame(loop);
      else raf = null;
    }
  }

  /* ---------- Idle peek ---------- */
  function resetIdle() {
    clearTimeout(idleTimer);
    if (peekedSlot) { peekedSlot.classList.remove('peek'); peekedSlot = null; }
    idleTimer = setTimeout(() => {
      if (document.body.getAttribute('data-current-route') !== 'home') return;
      const unrev = Array.from(handEl.querySelectorAll('.card-slot')).filter(s => !s.classList.contains('revealed'));
      if (!unrev.length) return;
      const target = unrev[Math.floor(Math.random() * unrev.length)];
      target.classList.add('peek');
      peekedSlot = target;
      dealerSay('idle');
      SFX.chip();
      setTimeout(() => {
        if (peekedSlot === target) { target.classList.remove('peek'); peekedSlot = null; }
      }, 2500);
      idleTimer = setTimeout(resetIdle, 14000);
    }, 10000);
  }
  window.addEventListener('mousemove', resetIdle, { passive: true });
  window.addEventListener('keydown', resetIdle);

  /* ---------- First-time hint ---------- */
  if (!localStorage.getItem('poker:visited')) {
    localStorage.setItem('poker:visited', '1');
    setTimeout(() => dealerSay(['click any card — it flips and takes you there. A = all in. R = re-deal.']), 1400);
  }

  /* ---------- Init ---------- */
  buildHand();
  updateStatus();
  resetIdle();

  /* ---------- Respond to SPA route changes ---------- */
  window.addEventListener('spa-route-changed', e => {
    if (e.detail && e.detail.route === 'home') {
      // Reload the hand if returning to home (preserves revealed state via sessionStorage)
      buildHand({ silent: true });
      updateStatus();
    }
  });
})();
