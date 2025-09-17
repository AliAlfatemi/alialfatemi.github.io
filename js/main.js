document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Mobile Menu Toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      // Accessibility: Update aria-expanded attribute
      const isExpanded = navLinks.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // --- 2. Dark Mode Toggle ---
  const themeToggle = document.getElementById('theme-toggle');
  const moonIcon = 'fa-moon';
  const sunIcon = 'fa-sun';

  const getTheme = () => {
    // Check localStorage first, then default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Update icon
    const icon = theme === 'dark' ? sunIcon : moonIcon;
    themeToggle.querySelector('i').className = `fas ${icon}`;
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
  
  // Apply theme on initial load
  applyTheme(getTheme());

  // --- 3. Footer Year ---
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

});
