particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": 60,
        "density": { "enable": true, "value_area": 800 }
      },
      "color": { "value": "#ffffff" },
      "shape": {
        "type": "circle",
        "stroke": { "width": 0, "color": "#fff" }
      },
      "opacity": { "value": 0.3, "random": true },
      "size": { "value": 3, "random": true },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#ffffff",
        "opacity": 0.35,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 1.2,
        "direction": "none",
        "out_mode": "out"
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": { "enable": true, "mode": "grab" },
        "onclick": { "enable": true, "mode": "push" }
      },
      "modes": {
        "grab": { "distance": 140, "line_linked": { "opacity": 0.6 } },
        "push": { "particles_nb": 3 }
      }
    },
    "retina_detect": true
  });
  