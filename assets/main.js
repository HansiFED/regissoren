// Regissøren's website: store buttons, the menu, scroll reveals, the confetti and the card to try.
(() => {
  const L = window.REGISSOREN || {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Store buttons. Plain icons, not Apple's or Google's logos.
  const phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>';
  const playIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5v17l14-8.5z"/></svg>';
  const btn = (href, live, icon, small, big) => live
    ? `<a class="store" href="${href}" rel="noopener">${icon}<span><small>${small}</small><b>${big}</b></span></a>`
    : `<span class="store soon" aria-disabled="true">${icon}<span><small>Kommer snart til</small><b>${big}</b></span></span>`;
  document.querySelectorAll('[data-stores]').forEach((el) => {
    el.innerHTML = btn(L.APP_STORE, L.APP_STORE_LIVE, phoneIcon, 'Last ned fra', 'App Store') + btn(L.PLAY_STORE, L.PLAY_STORE_LIVE, playIcon, 'Tilgjengelig på', 'Google Play');
  });

  // The menu on small screens closes when a link is chosen.
  document.querySelectorAll('.menu a').forEach((a) => a.addEventListener('click', () => a.closest('details').removeAttribute('open')));

  // Reveal on scroll, and the game cards dealt one by one.
  const els = document.querySelectorAll('.reveal, .deal');
  if (!('IntersectionObserver' in window) || reduced) els.forEach((el) => el.classList.add('in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  // The film strip moves, so its pictures load before they come into view.
  const strip = document.querySelector('.strip');
  if (strip && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver(([e]) => { if (e.isIntersecting) { strip.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }); so.disconnect(); } }, { rootMargin: '800px 0px' });
    so.observe(strip);
  }

  // A card to try: pick a game, draw a card.
  const data = document.getElementById('deck-data');
  const box = document.querySelector('.deck-box');
  if (data && box) {
    const decks = JSON.parse(data.textContent);
    const card = box.querySelector('.pcard');
    const deck = box.querySelector('.deck');
    const tabs = [...box.querySelectorAll('[role=tab]')];
    let game = tabs[0].dataset.game;
    const last = {};
    const show = (animate) => {
      const d = decks[game];
      let i;
      do i = Math.floor(Math.random() * d.cards.length); while (d.cards.length > 1 && i === last[game]);
      last[game] = i;
      const c = d.cards[i];
      const fill = () => {
        deck.dataset.tone = d.tone;
        card.querySelector('.pc-head').innerHTML = `<span class="sticker sm">${d.sticker}</span>${d.name}`;
        card.querySelector('.pc-lead').textContent = d.lead;
        const text = card.querySelector('.pc-text');
        text.innerHTML = '';
        if (Array.isArray(c)) {
          text.append(c[0]);
          const or = document.createElement('span'); or.className = 'pc-or'; or.textContent = 'eller'; or.style.display = 'block';
          text.append(or, c[1] + '?');
        } else text.textContent = c;
        card.querySelector('.pc-hint').textContent = d.hint;
      };
      if (!animate || reduced) return fill();
      card.classList.remove('in'); card.classList.add('out');
      setTimeout(() => { fill(); card.classList.remove('out'); card.classList.add('in'); }, 260);
    };
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      game = t.dataset.game;
      show(true);
    }));
    box.querySelector('[data-draw]').addEventListener('click', () => show(true));
  }

  // Confetti in the hero: a burst when the clapper claps, then a light fall.
  const c = document.querySelector('.confetti');
  if (!c || reduced) return;
  const ctx = c.getContext('2d');
  const cols = ['#ff4f9a', '#ffd23f', '#2f6bff', '#2bd47d', '#ff7a2f', '#8b5cf6', '#12c2c2'];
  let W = 0, H = 0, running = true, bits = [];
  const size = () => { const r = c.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const fall = () => ({ x: Math.random() * W, y: -20 - Math.random() * H, vx: (Math.random() - 0.5) * 0.6, vy: 0.6 + Math.random() * 1.2, w: 6 + Math.random() * 8, h: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, col: cols[(Math.random() * cols.length) | 0], round: Math.random() < 0.25 });
  size();
  addEventListener('resize', size);
  for (let i = 0; i < 36; i++) bits.push(fall());
  const burst = () => {
    const k = document.querySelector('.clapper');
    const cr = c.getBoundingClientRect();
    const kr = k ? k.getBoundingClientRect() : { left: cr.left + W * 0.3, top: cr.top + H * 0.3, width: 0, height: 0 };
    const x = kr.left - cr.left + kr.width * 0.7, y = kr.top - cr.top + kr.height * 0.25;
    for (let i = 0; i < 110; i++) {
      const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 8;
      bits.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, w: 6 + Math.random() * 8, h: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, col: cols[(Math.random() * cols.length) | 0], round: Math.random() < 0.25, once: true });
    }
  };
  setTimeout(burst, 980);
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) requestAnimationFrame(tick); }).observe(c);
  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    bits = bits.filter((b) => !(b.once && b.y > H + 20));
    for (const b of bits) {
      b.vy = Math.min(b.vy + 0.07, 2.4); b.vx *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      if (!b.once && b.y > H + 20) Object.assign(b, fall(), { y: -20 });
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.col; ctx.globalAlpha = 0.88;
      if (b.round) { ctx.beginPath(); ctx.arc(0, 0, b.h / 1.4, 0, 7); ctx.fill(); } else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    requestAnimationFrame(tick);
  }
})();
