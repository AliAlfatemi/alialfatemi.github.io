(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navButton = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  const closeMenu = () => {
    if (!navButton || !navMenu) return;
    navButton.setAttribute('aria-expanded', 'false');
    navButton.setAttribute('aria-label', 'Open navigation menu');
    navMenu.dataset.open = 'false';
  };

  if (navButton && navMenu) {
    navButton.addEventListener('click', () => {
      const open = navButton.getAttribute('aria-expanded') !== 'true';
      navButton.setAttribute('aria-expanded', String(open));
      navButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      navMenu.dataset.open = String(open);
      if (open) window.requestAnimationFrame(() => navMenu.querySelector('a')?.focus());
    });

    navMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('click', (event) => {
      if (navMenu.dataset.open !== 'true') return;
      if (!event.target.closest('[data-site-nav]')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.dataset.open === 'true') {
        closeMenu();
        navButton.focus();
      }
    });
  }

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    root.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
  }

  const publicationList = document.querySelector('[data-publication-list]');
  if (publicationList) {
    const rows = Array.from(publicationList.querySelectorAll('[data-publication]'));
    const search = document.querySelector('#publication-search');
    const year = document.querySelector('#publication-year');
    const area = document.querySelector('#publication-area');
    const type = document.querySelector('#publication-type');
    const author = document.querySelector('#publication-author');
    const reset = document.querySelector('[data-filter-reset]');
    const count = document.querySelector('[data-result-count]');
    const empty = document.querySelector('[data-empty-state]');
    const controls = [search, year, area, type, author].filter(Boolean);

    const normalize = (value) => value.trim().toLocaleLowerCase();

    const applyFilters = (updateUrl = true) => {
      const query = normalize(search?.value || '');
      const selectedYear = year?.value || '';
      const selectedArea = area?.value || '';
      const selectedType = type?.value || '';
      const selectedAuthor = author?.value || '';
      let visible = 0;

      rows.forEach((row) => {
        const haystack = normalize(row.dataset.search || row.textContent || '');
        const matches = (!query || haystack.includes(query))
          && (!selectedYear || row.dataset.year === selectedYear)
          && (!selectedArea || row.dataset.area === selectedArea)
          && (!selectedType || row.dataset.type === selectedType)
          && (!selectedAuthor || row.dataset.author === selectedAuthor);
        row.hidden = !matches;
        if (matches) visible += 1;
      });

      if (count) count.textContent = `${visible} publication${visible === 1 ? '' : 's'}`;
      if (empty) empty.hidden = visible !== 0;

      if (updateUrl) {
        const url = new URL(window.location.href);
        const values = { q: search?.value.trim(), year: selectedYear, area: selectedArea, type: selectedType, author: selectedAuthor };
        Object.entries(values).forEach(([key, value]) => {
          if (value) url.searchParams.set(key, value);
          else url.searchParams.delete(key);
        });
        history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      }
    };

    const params = new URLSearchParams(window.location.search);
    if (search) search.value = params.get('q') || '';
    if (year) year.value = params.get('year') || '';
    if (area) area.value = params.get('area') || '';
    if (type) type.value = params.get('type') || '';
    if (author) author.value = params.get('author') || '';

    controls.forEach((control) => {
      control.addEventListener(control === search ? 'input' : 'change', () => applyFilters());
    });

    reset?.addEventListener('click', () => {
      controls.forEach((control) => { control.value = ''; });
      applyFilters();
      search?.focus();
    });

    applyFilters(false);
  }

  document.querySelectorAll('[data-copy-citation]').forEach((button) => {
    button.addEventListener('click', async () => {
      const citation = button.dataset.copyCitation?.trim();
      const status = document.querySelector('[data-copy-status]');
      if (!citation) return;
      try {
        await navigator.clipboard.writeText(citation);
        const original = button.textContent;
        button.textContent = 'Copied';
        if (status) status.textContent = 'Citation copied to the clipboard.';
        window.setTimeout(() => { button.textContent = original; }, 1600);
      } catch {
        const field = document.createElement('textarea');
        field.value = citation;
        field.setAttribute('readonly', '');
        field.className = 'visually-hidden';
        document.body.append(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (status) status.textContent = copied ? 'Citation copied to the clipboard.' : 'Citation could not be copied automatically.';
      }
    });
  });

  document.querySelectorAll('[data-print-page]').forEach((button) => {
    button.addEventListener('click', () => window.print());
  });
})();
