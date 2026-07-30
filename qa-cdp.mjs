import { writeFile } from 'node:fs/promises';

const [widthArg, heightArg, outputPath, scrollSelector] = process.argv.slice(2);
const width = Number(widthArg);
const height = Number(heightArg);
const pageUrl = 'http://127.0.0.1:4174/.design-previews/academic-compact/';

const target = await fetch(`http://127.0.0.1:9223/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let requestId = 0;
const pending = new Map();
const exceptions = [];
const failedResponses = [];

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    failedResponses.push(`${message.params.response.status} ${message.params.response.url}`);
  }
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++requestId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return result.result.value;
};

await Promise.all([send('Page.enable'), send('Runtime.enable'), send('Network.enable')]);
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 600,
  screenWidth: width,
  screenHeight: height
});
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

const loaded = new Promise((resolve) => {
  const handler = (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Page.loadEventFired') {
      socket.removeEventListener('message', handler);
      resolve();
    }
  };
  socket.addEventListener('message', handler);
});

await send('Page.navigate', { url: pageUrl });
await loaded;
await evaluate('document.fonts.ready');

if (scrollSelector) {
  await evaluate(`document.querySelector(${JSON.stringify(scrollSelector)}).scrollIntoView({ block: 'start' })`);
}

await evaluate(`Promise.all([...document.images]
  .filter((image) => {
    const rect = image.getBoundingClientRect();
    return rect.top < innerHeight * 2 && rect.bottom > -innerHeight;
  })
  .map((image) => {
    image.loading = 'eager';
    return image.decode().catch(() => null);
  }))`);

const layout = await evaluate(`(() => ({
  innerWidth,
  innerHeight,
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  h1Size: getComputedStyle(document.querySelector('h1')).fontSize,
  bodySize: getComputedStyle(document.body).fontSize,
  headerHeight: document.querySelector('.site-header').getBoundingClientRect().height,
  overflowing: [...document.querySelectorAll('body *')]
    .filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.right > innerWidth + 1 || rect.left < -1;
    })
    .slice(0, 8)
    .map((node) => ({ tag: node.tagName, className: node.className, right: node.getBoundingClientRect().right }))
}))()`);

const themeInteraction = await evaluate(`(() => {
  const button = document.querySelector('[data-theme-toggle]');
  const before = document.documentElement.dataset.theme;
  button.click();
  const after = document.documentElement.dataset.theme;
  button.click();
  return { before, after, restored: document.documentElement.dataset.theme };
})()`);

const menuInteraction = width < 833 ? await evaluate(`(() => {
  const button = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  button.click();
  const result = {
    expanded: button.getAttribute('aria-expanded'),
    hidden: menu.hidden,
    focused: document.activeElement.textContent.trim()
  };
  button.click();
  return result;
})()`) : null;

if (!scrollSelector) await evaluate('scrollTo(0, 0)');
await new Promise((resolve) => setTimeout(resolve, 150));

const screenshot = await send('Page.captureScreenshot', {
  format: 'png',
  fromSurface: true,
  captureBeyondViewport: false
});
await writeFile(outputPath, Buffer.from(screenshot.data, 'base64'));

console.log(JSON.stringify({ width, height, layout, themeInteraction, menuInteraction, exceptions, failedResponses, outputPath }, null, 2));
socket.close();
