/* =====================================================
   GARIBALDI SITE — main.js
   ===================================================== */

// ── Hamburger ──────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
  // chiudi cliccando fuori dal menu
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// ── Scroll reveal ──────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Stagger per card grid ──────────────────────────────
document.querySelectorAll('.cards-grid, .film-grid, .museo-grid').forEach(grid => {
  grid.querySelectorAll('.card, .film-card, .museo-card').forEach((child, i) => {
    child.style.transitionDelay = `${i * 55}ms`;
  });
});

// ── Navbar shadow su scroll ────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.style.boxShadow = window.scrollY > 60
      ? '0 4px 30px rgba(0,0,0,0.45)'
      : 'none';
  }
}, { passive: true });

// ── MODAL MAPPA / OPERA ────────────────────────────────
(function initModal() {
  const overlay = document.getElementById('map-modal-overlay');
  const modal   = document.getElementById('mapModal');
  const iframe  = document.getElementById('modalIframe');
  const titleEl = document.getElementById('modalTitle');
  const subEl   = document.getElementById('modalSub');
  const closeBtn= document.getElementById('modalClose');

  if (!overlay || !modal) return;   // non siamo su musei.html

  let isOpen = false;

  // ── Apri modal ──────────────────────────────────────
  function openModal(card) {
    const title = card.dataset.modalTitle || '';
    const sub   = card.dataset.modalSub   || '';
    const src   = card.dataset.modalSrc   || '';

    titleEl.textContent = title;
    subEl.textContent   = sub;
    iframe.src = src;

    positionModal(card);

    overlay.classList.add('active');
    // piccolo delay per permettere la transizione
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add('open'));
    });
    isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  // ── Chiudi modal ─────────────────────────────────────
  function closeModal() {
    if (!isOpen) return;
    modal.classList.remove('open');
    overlay.classList.remove('active');
    isOpen = false;
    document.body.style.overflow = '';
    // rimuovi src dopo animazione per evitare suono/loading
    setTimeout(() => { iframe.src = ''; }, 350);
  }

  // ── Posizionamento intelligente (desktop) ────────────
  function positionModal(card) {
    // su mobile (<600px) il CSS forza centrato, non serve JS
    if (window.innerWidth <= 600) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mw = Math.min(520, vw * 0.92);
    const mh = Math.min(480, vh * 0.80);

    const rect = card.getBoundingClientRect();

    // punto di ancoraggio: centro della card
    let left = rect.left + rect.width / 2 - mw / 2;
    let top  = rect.top  + rect.height / 2 - mh / 2;

    // margini di sicurezza 16px
    const margin = 16;
    left = Math.max(margin, Math.min(left, vw - mw - margin));
    top  = Math.max(margin + 64, Math.min(top, vh - mh - margin));

    modal.style.left   = left + 'px';
    modal.style.top    = top  + 'px';
    modal.style.width  = mw   + 'px';
    modal.style.maxHeight = mh + 'px';
  }

  // ── Click sulle card cliccabili ──────────────────────
  document.querySelectorAll('.museo-card.clickable, .card.clickable').forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      if (isOpen) {
        closeModal();
        return;
      }
      openModal(card);
    });

    // accessibilità tastiera
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isOpen) closeModal(); else openModal(card);
      }
    });
  });

  // ── Click su pulsante ✕ ─────────────────────────────
  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    closeModal();
  });

  // ── Click OVUNQUE fuori dal modal (incluso overlay) ─
  // Comportamento richiesto: "ricliccato in un punto a caso" chiude
  document.addEventListener('click', e => {
    if (!isOpen) return;
    if (modal.contains(e.target)) return;   // dentro al modal → non chiudere
    closeModal();
  });

  // ── Tasto ESC ───────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // ── Ricalcola posizione al resize ───────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isOpen && window.innerWidth > 600) {
        // centra di default al resize
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const mw = Math.min(520, vw * 0.92);
        const mh = Math.min(480, vh * 0.80);
        modal.style.left = Math.max(16, (vw - mw) / 2) + 'px';
        modal.style.top  = Math.max(80, (vh - mh) / 2) + 'px';
        modal.style.width = mw + 'px';
        modal.style.maxHeight = mh + 'px';
      }
    }, 150);
  });
})();
