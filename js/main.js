function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    navLinks.classList.toggle("show");
  }
  
  // Update the footer year automatically
  document.getElementById("year").textContent = new Date().getFullYear();
  