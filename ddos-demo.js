/* Illustrative traffic model and interactive homepage visualization. */
(() => {
  'use strict';

  class TrafficModel {
    constructor(capacity = 120, queueLimit = 240) {
      if (![capacity, queueLimit].every((n) => Number.isFinite(n) && n > 0)) {
        throw new RangeError('Capacity and queue limit must be positive finite values.');
      }
      this.capacity = capacity;
      this.queueLimit = queueLimit;
      this.reset();
    }

    reset() {
      this.time = 0;
      this.queue = [];
      this.depth = 0;
      this.totals = Object.fromEntries(
        ['offered', 'filtered', 'overflow', 'served'].map((key) => [key, { good: 0, bad: 0 }]),
      );
    }

    step(dt, intensity = 0, mitigation = false) {
      if (!Number.isFinite(dt) || dt <= 0 || dt > 1) throw new RangeError('dt must be in (0, 1].');
      if (!Number.isFinite(intensity) || intensity < 0 || intensity > 100) {
        throw new RangeError('Intensity must be between 0 and 100.');
      }
      this.time += dt;
      const goodRate = 48 + 4 * Math.sin(this.time * 0.7);
      const badRate = 420 * intensity / 100;
      const offered = { good: goodRate * dt, bad: badRate * dt };
      // Fixed admission assumptions for this illustrative model, not classifier results.
      const filtered = {
        good: mitigation ? offered.good * 0.02 : 0,
        bad: mitigation ? offered.bad * 0.94 : 0,
      };
      const incoming = { good: offered.good - filtered.good, bad: offered.bad - filtered.bad };
      const acceptedTotal = incoming.good + incoming.bad;
      const room = Math.max(0, this.queueLimit - this.depth);
      const fraction = acceptedTotal > 0 ? Math.min(1, room / acceptedTotal) : 1;
      const queued = { good: incoming.good * fraction, bad: incoming.bad * fraction };
      const overflow = { good: incoming.good - queued.good, bad: incoming.bad - queued.bad };
      if (queued.good + queued.bad > 0) this.queue.push(queued);
      this.depth += queued.good + queued.bad;
      let budget = this.capacity * dt;
      const served = { good: 0, bad: 0 };
      while (budget > 1e-10 && this.queue.length) {
        const first = this.queue[0];
        const size = first.good + first.bad;
        const take = Math.min(size, budget);
        const good = take * first.good / size;
        const bad = take - good;
        served.good += good;
        served.bad += bad;
        first.good -= good;
        first.bad -= bad;
        this.depth -= take;
        budget -= take;
        if (size - take < 1e-9) this.queue.shift();
      }
      this.depth = Math.max(0, this.depth);
      for (const [key, values] of Object.entries({ offered, filtered, overflow, served })) {
        this.totals[key].good += values.good;
        this.totals[key].bad += values.bad;
      }
      return {
        incoming: goodRate + badRate,
        goodRate,
        badRate,
        blocked: (filtered.good + filtered.bad) / dt,
        admitted: acceptedTotal / dt,
        goodput: served.good / dt,
        attackServed: served.bad / dt,
        queue: this.depth,
        delay: 1000 * this.depth / this.capacity,
      };
    }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { TrafficModel };
  if (typeof document === 'undefined') return;
  const host = document.querySelector('[data-ddos-demo]');
  if (!host) return;

  const lab = host.querySelector('.traffic-lab');
  const model = new TrafficModel();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pauseButton = host.querySelector('[data-demo-pause]');
  const guardButton = host.querySelector('[data-demo-guard]');
  const slider = host.querySelector('[data-demo-intensity]');
  const status = host.querySelector('[data-demo-status]');
  const stages = [...host.querySelectorAll('[data-demo-scenario]')];
  const packetLayer = host.querySelector('[data-demo-packets]');
  const metrics = Object.fromEntries([...host.querySelectorAll('[data-metric]')].map((el) => [el.dataset.metric, el]));
  const offeredChart = host.querySelector('[data-chart-offered]');
  const admittedChart = host.querySelector('[data-chart-admitted]');
  const svgNS = 'http://www.w3.org/2000/svg';
  const sources = { good: [[104, 68], [112, 102], [104, 136]], bad: [[104, 208], [112, 240], [160, 225]] };
  const packets = [];
  const history = Array.from({ length: 120 }, () => ({ incoming: 48, admitted: 48 }));
  let intensity = Number(slider.value);
  let attack = false;
  let mitigation = false;
  let paused = motion.matches;
  let visible = false;
  let tour = true;
  let tourTime = 0;
  let phase = 'normal';
  let frameId = null;
  let lastFrame = null;
  let accumulator = 0;
  let uiTime = 0;
  let chartTime = 0;
  let goodSpawn = 0;
  let badSpawn = 0;
  let sample = model.step(1 / 30);
  let smoothed = { ...sample };
  let randomState = 19;
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  };

  function scenario(next, manual = true) {
    phase = next;
    attack = next !== 'normal';
    mitigation = next === 'protected';
    if (manual) tour = false;
    if (attack && intensity === 0) {
      intensity = 75;
      slider.value = '75';
    }
    render();
    schedule();
  }

  function render() {
    const mode = attack && intensity > 0 ? (mitigation ? 'protected' : 'attack') : 'normal';
    lab.dataset.mode = mode;
    lab.dataset.guard = String(mitigation);
    lab.dataset.running = String(!paused);
    lab.dataset.visible = String(visible);
    const overloaded = sample.queue > 20 || sample.admitted > model.capacity * 1.05;
    lab.dataset.overloaded = String(overloaded);
    const label = { normal: 'Normal traffic', attack: 'DDoS surge', protected: 'Mitigation active' }[mode];
    if (status.textContent !== label) status.textContent = label;
    for (const button of stages) button.setAttribute('aria-pressed', String(button.dataset.demoScenario === mode));
    guardButton.setAttribute('aria-checked', String(mitigation));
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Play simulation' : 'Pause simulation');
    pauseButton.innerHTML = paused ? 'Play <span aria-hidden="true">▶</span>' : 'Pause <span aria-hidden="true">Ⅱ</span>';
    host.querySelector('#attack-intensity-value').textContent = `${intensity}%`;
    host.querySelector('[data-filter-label]').textContent = mitigation ? 'Filtering' : 'Bypass';
    host.querySelector('[data-service-label]').textContent = overloaded
      ? (mitigation ? 'Service recovering' : 'Service overloaded') : 'Service healthy';
    host.querySelector('[data-demo-story]').textContent = tour ? 'Normal → attack → mitigation' : 'Manual controls';
    for (const key of ['incoming', 'blocked', 'goodput']) metrics[key].textContent = String(Math.round(smoothed[key]));
    metrics.delay.textContent = String(Math.round(sample.delay));
  }

  function renderChart() {
    const path = (key) => history.map((point, index) => {
      const x = index * 672 / (history.length - 1);
      const y = 73 - Math.min(500, point[key]) * 68 / 500;
      return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join('');
    offeredChart.setAttribute('d', path('incoming'));
    admittedChart.setAttribute('d', path('admitted'));
  }

  function spawn(kind) {
    if (packets.length >= 160) return;
    const point = sources[kind][Math.floor(random() * 3)];
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('r', kind === 'good' ? '2.6' : '2.8');
    circle.setAttribute('fill', kind === 'good' ? '#8ef5dc' : '#ff9a80');
    packetLayer.append(circle);
    packets.push({ circle, kind, x: point[0], y: point[1], age: 0, stage: 0, duration: (kind === 'good' ? 1.65 : 1.1) + random() * 0.3 });
  }

  function movePackets(dt) {
    if (motion.matches) return;
    goodSpawn += dt * 13;
    badSpawn += dt * Math.min(48, sample.badRate / 7);
    while (goodSpawn >= 1) { spawn('good'); goodSpawn -= 1; }
    while (badSpawn >= 1) { spawn('bad'); badSpawn -= 1; }
    for (let i = packets.length - 1; i >= 0; i -= 1) {
      const p = packets[i];
      p.age += dt;
      let t = Math.min(1, p.age / p.duration);
      let x;
      let y;
      if (p.stage === 0) {
        const u = 1 - t;
        x = u ** 3 * p.x + 3 * u ** 2 * t * 220 + 3 * u * t ** 2 * 250 + t ** 3 * 378;
        y = u ** 3 * p.y + 3 * u ** 2 * t * p.y + 3 * u * t ** 2 * 130 + t ** 3 * 130;
        if (t >= 1) {
          p.stage = 1;
          p.age = 0;
          p.duration = 0.65 + random() * 0.3;
          p.filtered = mitigation && random() < (p.kind === 'bad' ? 0.94 : 0.02);
          if (p.filtered) p.circle.setAttribute('fill', '#789cae');
        }
      } else if (p.filtered) {
        x = (1 - t) ** 2 * 378 + 2 * (1 - t) * t * 378 + t ** 2 * 520;
        y = (1 - t) ** 2 * 130 + 2 * (1 - t) * t * 236 + t ** 2 * 236;
      } else {
        x = 378 + t * 225;
        y = 130;
      }
      p.circle.setAttribute('cx', x.toFixed(1));
      p.circle.setAttribute('cy', y.toFixed(1));
      p.circle.setAttribute('opacity', p.stage === 1 ? String(1 - 0.5 * t) : '0.95');
      if (p.stage === 1 && p.age >= p.duration) {
        p.circle.remove();
        packets.splice(i, 1);
      }
    }
  }

  const active = () => visible && !paused && !document.hidden;
  function schedule() {
    if (active() && frameId === null) frameId = requestAnimationFrame(frame);
  }
  function frame(now) {
    frameId = null;
    if (!active()) { lastFrame = null; return; }
    const dt = lastFrame === null ? 1 / 60 : Math.min(0.06, (now - lastFrame) / 1000);
    lastFrame = now;
    if (tour) {
      tourTime = (tourTime + dt) % 18;
      const next = tourTime < 3 ? 'normal' : tourTime < 8 ? 'attack' : 'protected';
      if (next !== phase) scenario(next, false);
    }
    accumulator += dt;
    while (accumulator >= 1 / 30) {
      sample = model.step(1 / 30, attack ? intensity : 0, mitigation);
      accumulator -= 1 / 30;
    }
    const blend = 1 - Math.exp(-dt / 0.65);
    for (const key of ['incoming', 'blocked', 'goodput']) smoothed[key] += (sample[key] - smoothed[key]) * blend;
    movePackets(dt);
    uiTime += dt;
    chartTime += dt;
    if (uiTime >= 0.15) { render(); uiTime = 0; }
    if (chartTime >= 0.2) {
      history.push({ incoming: sample.incoming, admitted: sample.admitted });
      history.shift();
      renderChart();
      chartTime = 0;
    }
    schedule();
  }

  stages.forEach((button) => button.addEventListener('click', () => scenario(button.dataset.demoScenario)));
  guardButton.addEventListener('click', () => {
    mitigation = !mitigation;
    tour = false;
    phase = attack ? (mitigation ? 'protected' : 'attack') : 'normal';
    render();
    schedule();
  });
  slider.addEventListener('input', () => {
    intensity = Number(slider.value);
    attack = intensity > 0;
    tour = false;
    phase = attack ? (mitigation ? 'protected' : 'attack') : 'normal';
    render();
    schedule();
  });
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    lastFrame = null;
    render();
    schedule();
  });
  host.querySelector('[data-demo-replay]').addEventListener('click', () => {
    model.reset();
    intensity = 75;
    slider.value = '75';
    goodSpawn = 0;
    badSpawn = 0;
    tour = true;
    tourTime = 0;
    paused = false;
    lastFrame = null;
    accumulator = 0;
    sample = model.step(1 / 30);
    smoothed = { ...sample };
    history.fill({ incoming: 48, admitted: 48 });
    packets.splice(0).forEach((p) => p.circle.remove());
    scenario('normal', false);
    renderChart();
  });
  motion.addEventListener('change', () => {
    if (motion.matches) {
      paused = true;
      packets.splice(0).forEach((p) => p.circle.remove());
    }
    lastFrame = null;
    render();
    schedule();
  });
  document.addEventListener('visibilitychange', () => { lastFrame = null; schedule(); });
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    lastFrame = null;
    render();
    schedule();
  }, { rootMargin: '80px', threshold: 0.05 });
  observer.observe(lab);
  render();
  renderChart();
})();
