const { test } = require('node:test');
const assert = require('node:assert/strict');
const { TrafficModel } = require('../ddos-demo.js');
const run = (model, seconds, intensity, guard) => {
  let result;
  for (let i = 0; i < seconds * 30; i += 1) result = model.step(1 / 30, intensity, guard);
  return result;
};

test('normal traffic is served without a growing queue', () => {
  const m = new TrafficModel();
  const s = run(m, 30, 0, false);
  assert.ok(s.queue < 1e-7);
  assert.ok(s.goodput > 40);
  assert.equal(m.totals.overflow.good, 0);
});

test('an unmitigated surge saturates the queue and reduces user throughput', () => {
  const m = new TrafficModel();
  const s = run(m, 30, 80, false);
  assert.ok(s.queue > 200);
  assert.ok(s.goodput < 22);
  assert.ok(m.totals.overflow.good > 0);
});

test('filtering keeps admitted traffic below capacity for the modeled surge', () => {
  const m = new TrafficModel();
  const s = run(m, 30, 80, true);
  assert.ok(s.admitted < m.capacity);
  assert.ok(s.queue < 1e-7);
  assert.ok(s.goodput > 40);
  assert.ok(m.totals.filtered.bad > m.totals.served.bad);
});

test('mitigation drains an existing backlog and restores legitimate throughput', () => {
  const m = new TrafficModel();
  run(m, 15, 80, false);
  const s = run(m, 12, 80, true);
  assert.ok(s.queue < 1e-7);
  assert.ok(s.goodput > 40);
});

test('request accounting is conserved separately for legitimate and attack traffic', () => {
  const m = new TrafficModel();
  run(m, 8, 0, false);
  run(m, 12, 100, false);
  run(m, 5, 65, true);
  run(m, 1, 0, true);
  for (const kind of ['good', 'bad']) {
    const queued = m.queue.reduce((n, row) => n + row[kind], 0);
    const accounted = ['filtered', 'overflow', 'served'].reduce((n, key) => n + m.totals[key][kind], queued);
    assert.ok(Math.abs(m.totals.offered[kind] - accounted) < 1e-6);
  }
});

test('queue and service budgets hold across varying load and mitigation states', () => {
  const m = new TrafficModel();
  for (let i = 0; i < 1500; i += 1) {
    const s = m.step(1 / 30, i % 101, i % 170 < 80);
    assert.ok(s.queue >= 0 && s.queue <= m.queueLimit + 1e-7);
    assert.ok(s.goodput + s.attackServed <= m.capacity + 1e-7);
    assert.ok(Object.values(s).every(Number.isFinite));
  }
});

test('invalid simulation inputs are rejected', () => {
  assert.throws(() => new TrafficModel(0), RangeError);
  const m = new TrafficModel();
  for (const dt of [0, -1, Infinity, NaN, 2]) assert.throws(() => m.step(dt), RangeError);
  for (const intensity of [-1, 101, NaN]) assert.throws(() => m.step(0.1, intensity), RangeError);
});
