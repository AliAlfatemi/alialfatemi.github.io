(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const profileDetails = document.querySelector('[data-profile-details]');
  let compactProfileMode = null;

  const storedTheme = localStorage.getItem('academic-compact-theme');
  root.dataset.theme = storedTheme === 'light' ? 'light' : 'dark';

  const updateThemeLabel = () => {
    if (!themeButton) return;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    themeButton.setAttribute('aria-label', `Switch to ${next} theme`);
  };

  updateThemeLabel();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('academic-compact-theme', root.dataset.theme);
    updateThemeLabel();
  });

  const closeMenu = () => {
    if (!menu || !menuButton) return;
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  };

  const syncMenuToViewport = () => {
    if (!menu || !menuButton) return;
    if (window.innerWidth > 832) {
      menu.hidden = false;
      menuButton.setAttribute('aria-expanded', 'false');
    } else if (menuButton.getAttribute('aria-expanded') !== 'true') {
      closeMenu();
    }
  };

  const syncProfileToViewport = () => {
    if (!profileDetails) return;
    const nextCompactMode = window.innerWidth <= 832;
    if (nextCompactMode !== compactProfileMode) {
      profileDetails.open = !nextCompactMode;
      compactProfileMode = nextCompactMode;
    }
  };

  syncMenuToViewport();
  syncProfileToViewport();

  menuButton?.addEventListener('click', () => {
    if (!menu) return;
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    if (opening) menu.querySelector('a')?.focus();
  });

  menu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu && !menu.hidden) {
      closeMenu();
      menuButton?.focus();
    }
  });

  window.addEventListener('resize', () => {
    syncMenuToViewport();
    syncProfileToViewport();
  });
})();
