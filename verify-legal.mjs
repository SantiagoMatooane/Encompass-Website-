// Dependency-free browser checks. Start the static preview and Chrome with
// --headless=new --remote-debugging-port=9227 --user-data-dir=<temporary-profile>.
// Run: node verify-legal.mjs
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import vm from 'node:vm';

const base = 'http://127.0.0.1:4173';
const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', {method: 'PUT'})).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let sequence = 0;
const pending = new Map(), errors = [], failures = [];
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const task = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) task.reject(new Error(JSON.stringify(message.error)));
    else task.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + (message.params.exceptionDetails.exception?.description || ''));
  if (message.method === 'Network.loadingFailed' && !message.params.canceled) failures.push(message.params.errorText);
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, {resolve, reject});
    socket.send(JSON.stringify({id, method, params}));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Timed out: ' + expression);
}
const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const text = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).textContent`);
async function key(key, code, windowsVirtualKeyCode) {
  await send('Input.dispatchKeyEvent', {type: 'keyDown', key, code, windowsVirtualKeyCode});
  if (key === 'Enter') await send('Input.dispatchKeyEvent', {type: 'char', text: '\r', key, code, windowsVirtualKeyCode});
  await send('Input.dispatchKeyEvent', {type: 'keyUp', key, code, windowsVirtualKeyCode});
}
async function navigate(path) {
  await send('Page.navigate', {url: base + path});
  await waitFor(`location.href === ${JSON.stringify(base + path)} && document.readyState === 'complete'`);
}
async function open() {
  await click('[data-product="0"]');
  assert.equal(await evaluate(`document.querySelector('#legal-dialog').open`), true);
}
async function artworkScreenshot(name) {
  await evaluate(`document.querySelector('#products').scrollIntoView({behavior: 'instant'})`);
  await waitFor(`Number(document.querySelector('#products').style.opacity) > .99`);
  const bounds = await evaluate(`(() => { const r = document.querySelector('.product-law').getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,scale:1}; })()`);
  const offset = await evaluate(`({x:scrollX,y:scrollY})`);
  const shot = await send('Page.captureScreenshot', {format: 'png', clip: {...bounds, x:bounds.x+offset.x, y:bounds.y+offset.y}, captureBeyondViewport: true});
  await writeFile(join(tmpdir(), `encompass-artwork-${name}.png`), Buffer.from(shot.data, 'base64'));
  return bounds;
}
async function flow() {
  await click('#legal-open');
  await click('#legal-demo-panel [data-next]');
  assert.equal(await evaluate(`document.querySelector('#legal-demo-panel [data-next]').disabled`), true);
  await click('#legal-document');
  assert.equal(await evaluate(`document.querySelector('#legal-demo-panel [data-next]').disabled`), false);
  await click('#legal-document');
  assert.equal(await evaluate(`document.querySelector('#legal-demo-panel [data-next]').disabled`), true);
  await click('#legal-document');
  await click('#legal-demo-panel [data-next]');
  await evaluate(`var owner = document.querySelector('#legal-assignee'); owner.value = 'Alex Morgan'; owner.dispatchEvent(new Event('change'));`);
  await click('#legal-demo-panel [data-next]');
  assert.match(await text('#legal-demo-panel'), /Alex Morgan/);
  assert.match(await text('#legal-step'), /4/);
}
try {
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', {width: 1365, height: 900, deviceScaleFactor: 1, mobile: false});
  await navigate('/');
  await waitFor(`document.querySelector('.product-law img').complete && document.querySelector('.product-law img').naturalWidth > 0`);
  assert.match(await evaluate(`document.querySelector('.product-law img').currentSrc`), /legal-desktop-chrome.webp$/);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.product-law img')).objectFit`), 'contain');
  const normalCard = await artworkScreenshot('desktop');
  await send('Input.dispatchMouseEvent', {type:'mouseMoved', x:normalCard.x + normalCard.width / 2, y:normalCard.y + normalCard.height / 2});
  await waitFor(`document.querySelector('.product-law').getBoundingClientRect().width > ${normalCard.width * 1.2}`);
  // Let the existing flex and image transitions settle before capturing.
  await new Promise(resolve => setTimeout(resolve, 1100));
  await artworkScreenshot('hover');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.product-law img')).filter`), 'none');
  await send('Input.dispatchMouseEvent', {type:'mouseMoved', x:1, y:1});
  await evaluate(`document.querySelector('[data-product="0"]').focus()`);
  // A real Tab/Shift-Tab sequence activates keyboard focus styling.
  await key('Tab', 'Tab', 9);
  await send('Input.dispatchKeyEvent', {type:'keyDown', key:'Tab', code:'Tab', windowsVirtualKeyCode:9, modifiers:8});
  await send('Input.dispatchKeyEvent', {type:'keyUp', key:'Tab', code:'Tab', windowsVirtualKeyCode:9, modifiers:8});
  assert.equal(await evaluate(`document.querySelector('.product-law').matches(':focus-visible')`), true);
  await new Promise(resolve => setTimeout(resolve, 700));
  await artworkScreenshot('focus');
  // Keyboard opening, Tab containment, Escape and restoration.
  await evaluate(`document.querySelector('[data-product="0"]').focus()`);
  await key('Enter', 'Enter', 13);
  await waitFor(`document.querySelector('#legal-dialog').open`);
  assert.equal(await evaluate(`document.activeElement.id`), 'legal-title');
  for (let i = 0; i < 8; i++) {
    await key('Tab', 'Tab', 9);
    assert.equal(await evaluate(`document.querySelector('#legal-dialog').contains(document.activeElement)`), true);
  }
  await key('Escape', 'Escape', 27);
  await waitFor(`!document.querySelector('#legal-dialog').open`);
  await waitFor(`document.activeElement.dataset.product === '0'`);

  // Each locale uses the same state transitions and complete translated copy.
  for (const lang of ['en', 'fr', 'zh']) {
    await evaluate(`var language = document.querySelector('#language'); language.value = '${lang}'; language.dispatchEvent(new Event('change'));`);
    await open(); await flow();
    assert.doesNotMatch(await text('#legal-dialog'), /undefined|\[object Object\]/);
    assert.equal(await evaluate(`document.documentElement.lang`), lang);
    if (lang === 'en') {
      assert.match(await text('#legal-demo-panel'), /2 of 3 received/);
      await evaluate(`document.querySelector('.legal-demo').scrollIntoView({block: 'start', behavior: 'instant'})`);
      const screenshot = await send('Page.captureScreenshot', {format: 'png'});
      await writeFile(join(tmpdir(), 'encompass-legal-desktop.png'), Buffer.from(screenshot.data, 'base64'));
    }
    await click('#legal-restart');
    assert.equal(await evaluate(`Boolean(document.querySelector('#legal-open'))`), true);
    await click('#legal-dialog .close');
    await waitFor(`!document.querySelector('#legal-dialog').open`);
  }
  await evaluate(`var language = document.querySelector('#language'); language.value = 'en'; language.dispatchEvent(new Event('change'));`);
  await open(); await click('.legal-enquiry');
  await waitFor(`document.activeElement.name === 'name'`);
  assert.equal(await evaluate(`document.querySelector('#interest').selectedIndex`), 1);
  await open();
  assert.equal(await evaluate(`Boolean(document.querySelector('#legal-open'))`), true);
  await click('#legal-dialog .close');

  // Mobile layout, reduced motion, and a complete second run.
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
  await navigate('/');
  await artworkScreenshot('mobile');
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
  await open(); await flow();
  assert.equal(await evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches`), true);
  assert.equal(await evaluate(`const d = document.querySelector('#legal-dialog'); d.scrollWidth <= d.clientWidth && d.getBoundingClientRect().width <= innerWidth`), true);
  await evaluate(`document.querySelector('.legal-demo').scrollIntoView({block: 'start', behavior: 'instant'})`);
  const mobile = await send('Page.captureScreenshot', {format: 'png'});
  await writeFile(join(tmpdir(), 'encompass-legal-mobile.png'), Buffer.from(mobile.data, 'base64'));
  await click('#legal-dialog .close');
  await click('#menu-open'); await click('#menu-dialog a[href="#team"]');
  await waitFor(`location.hash === '#team' && !document.querySelector('#menu-dialog').open`);
  await click('#marketing');
  await waitFor(`location.pathname === '/marketing.html' && document.readyState === 'complete'`);
  assert.equal(await evaluate(`document.querySelector('#legal-dialog')`), null);
  await click('[data-product="0"]');
  assert.equal(await evaluate(`document.querySelector('#info-dialog').open`), true);
  assert.match(await text('#dialog-title'), /Advertising/);
  await click('#info-dialog .close');
  await click('#sign-in');
  assert.equal(await evaluate(`document.querySelector('#info-dialog').open`), true);
  await click('#info-dialog .close');
  await click('#data-division');
  await waitFor(`location.pathname === '/index.html' && document.readyState === 'complete'`);
  await click('[data-product="1"]');
  assert.match(await text('#dialog-title'), /Customer Relationship/);
  await click('#info-dialog .close');
  await click('[data-product="2"]');
  assert.match(await text('#dialog-title'), /Team Workflow/);
  await click('#info-dialog .close');
  assert.deepEqual(errors, [], 'Browser JavaScript exceptions');
  assert.deepEqual(failures, [], 'Failed network requests');

  // Exercise the unchanged mailto handler in isolation with a captured location.
  // This avoids opening an email application or sending a message.
  const app = await (await fetch(base + '/app.js')).text();
  const handler = app.match(/\$\('#contact-form'\)\.addEventListener\('submit',(e=>\{[^\n]+\})\);/)[1];
  const location = {}, status = {};
  const fields = new Map([['name', 'Fictional Tester'], ['email', 'test@example.invalid'], ['interest', 'Legal Practice Software'], ['message', 'Sample workflow enquiry']]);
  vm.runInNewContext(`(${handler})({preventDefault(){}, currentTarget:{}})`, {
    FormData: class {get(name) { return fields.get(name); }}, location,
    encodeURIComponent, $: () => status, text: () => 'Email draft prepared'
  });
  assert.match(location.href, /^mailto:/);
  assert.match(decodeURIComponent(location.href), /Legal Practice Software/);
  assert.match(decodeURIComponent(location.href), /Sample workflow enquiry/);
  console.log('PASS: desktop, mobile, keyboard, Escape/focus, all locales, four demo steps, restart/reopen, enquiry selection, captured mailto, chapter navigation, divisions, Marketing, unchanged placeholders. No browser exceptions or failed requests.');
  console.log('Screenshots:', join(tmpdir(), 'encompass-legal-desktop.png'), join(tmpdir(), 'encompass-legal-mobile.png'));
} catch (error) {
  console.error('Browser errors:', errors, 'Network failures:', failures);
  console.error('Focus:', await evaluate(`document.activeElement.tagName + '#' + document.activeElement.id`));
  throw error;
} finally {
  await fetch(`http://127.0.0.1:9227/json/close/${target.id}`);
  socket.close();
}
