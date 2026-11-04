(() => {
  const L = window.REGISSOREN || {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Store buttons. Plain icons, not Apple's or Google's logos (swap in their official badges if you like).
  const phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>';
  const playIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3.5v17l14-8.5z"/></svg>';
  const btn = (href, live, icon, small, big) => live
    ? `<a class="store" href="${href}" rel="noopener">${icon}<span><small>${small}</small><b>${big}</b></span></a>`
    : `<span class="store soon" aria-disabled="true">${icon}<span><small>Kommer snart til</small><b>${big}</b></span></span>`;
  document.querySelectorAll('[data-stores]').forEach((el) => {
    el.innerHTML = btn(L.APP_STORE, L.APP_STORE_LIVE, phoneIcon, 'Last ned fra', 'App Store') +
                   btn(L.PLAY_STORE, L.PLAY_STORE_LIVE, playIcon, 'Tilgjengelig på', 'Google Play');
  });

  // Reveal on scroll.
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) : null;
  document.querySelectorAll('.reveal').forEach((el) => io ? io.observe(el) : el.classList.add('in'));

  // Confetti in the hero.
  const c = document.querySelector('.confetti');
  if (!c || reduced) return;
  const ctx = c.getContext('2d');
  const cols = ['#ff4f9a', '#ffd23f', '#2f6bff', '#2bd47d', '#ff7a2f', '#8b5cf6', '#12c2c2'];
  let W = 0, H = 0, bits = [], running = true;
  const size = () => { const r = c.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  const make = (burst) => ({ x: burst ? W * (0.3 + Math.random() * 0.4) : Math.random() * W, y: burst ? H * 0.35 : -20 - Math.random() * H,
    vx: burst ? (Math.random() - 0.5) * 9 : (Math.random() - 0.5) * 0.6, vy: burst ? -Math.random() * 9 - 3 : 0.6 + Math.random() * 1.2,
    w: 6 + Math.random() * 8, h: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, col: cols[(Math.random() * cols.length) | 0], round: Math.random() < 0.25 });
  size(); addEventListener('resize', size);
  for (let i = 0; i < 90; i++) bits.push(make(true));
  for (let i = 0; i < 40; i++) bits.push(make(false));
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) requestAnimationFrame(tick); }).observe(c);
  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (const b of bits) {
      b.vy += 0.06; b.vy = Math.min(b.vy, 2.2); b.vx *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      if (b.y > H + 20) Object.assign(b, make(false), { y: -20 });
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.col; ctx.globalAlpha = 0.85;
      if (b.round) { ctx.beginPath(); ctx.arc(0, 0, b.h / 1.4, 0, 7); ctx.fill(); } else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    requestAnimationFrame(tick);
  }
})();
