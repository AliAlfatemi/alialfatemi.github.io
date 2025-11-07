<script>
document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     0) Helpers
  ==========================*/
  const prefersDark = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const reducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================
     1) Mobile Menu Toggle + A11y
  ==========================*/
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('navLinks');

  const closeMenu = () => {
    if (!navLinks) return;
    navLinks.classList.remove('active');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      navToggle.setAttribute('aria-expanded', String(isExpanded));
    });

    // Close on link click (single-page nav UX)
    navLinks.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a) closeMenu();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navLinks.classList.contains('active')) return;
      const clickedInsideMenu = e.target.closest('#navLinks, #nav-toggle');
      if (!clickedInsideMenu) closeMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* =========================
     2) Theme Toggle (system-aware, persisted)
  ==========================*/
  const themeToggle = document.getElementById('theme-toggle');
  const moonIcon = 'fa-moon';
  const sunIcon  = 'fa-sun';

  const getTheme = () => {
    // If saved, use it; otherwise follow system preference
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return prefersDark() ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      const iconClass = theme === 'dark' ? sunIcon : moonIcon;
      const i = themeToggle.querySelector('i');
      if (i) i.className = `fas ${iconClass}`;
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.title = themeToggle.getAttribute('aria-label');
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
  // Initialize theme and watch for system change (if user hasn't explicitly chosen)
  let userSet = !!localStorage.getItem('theme');
  applyTheme(getTheme());
  if (!userSet && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  /* =========================
     3) Smooth Scroll for in-page anchors
  ==========================*/
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]:not([href="#"])');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    const behavior = reducedMotion() ? 'auto' : 'smooth';
    target.scrollIntoView({ behavior, block: 'start' });
    history.pushState(null, '', `#${id}`);
  });

  /* =========================
     4) Publication Figure Lightbox (no deps)
        - Works on any <img data-lightbox data-caption="...">
  ==========================*/
  // Make images focusable & announceable
  document.querySelectorAll('img[data-lightbox]').forEach(img => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    if (!img.getAttribute('aria-label')) {
      img.setAttribute('aria-label', 'Expand image');
    }
  });

  // Build overlay once
  const overlay = document.createElement('div');
  overlay.className = 'lb';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="lb-content" role="dialog" aria-modal="true">
      <button class="lb-close" aria-label="Close (Esc)"><i class="fas fa-times"></i></button>
      <img alt="">
      <div class="lb-caption"></div>
    </div>`;
  document.body.appendChild(overlay);

  const lbImg   = overlay.querySelector('img');
  const lbCap   = overlay.querySelector('.lb-caption');
  const lbClose = overlay.querySelector('.lb-close');

  const openLB = (src, cap) => {
    lbImg.src = src; lbCap.textContent = cap || '';
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  };
  const closeLB = () => {
    overlay.setAttribute('aria-hidden', 'true');
    lbImg.src = ''; lbCap.textContent = '';
    document.body.style.overflow = '';
  };

  // Open on click or Enter
  document.addEventListener('click', (e) => {
    const t = e.target.closest('img[data-lightbox]');
    if (t) openLB(t.src, t.dataset.caption);
    if (e.target === overlay) closeLB();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLB();
    const t = document.activeElement;
    if ((e.key === 'Enter' || e.key === ' ') && t && t.matches('img[data-lightbox]')) {
      e.preventDefault();
      openLB(t.src, t.dataset.caption);
    }
  });
  lbClose.addEventListener('click', closeLB);

  /* =========================
     5) Footer Year
  ==========================*/
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

});
</script>
