// Dependency-free browser checks. Start the static preview and Chrome with
// --headless=new --remote-debugging-port=9227 --user-data-dir=<temporary-profile>.
// Run: node verify-restaurant.mjs
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
async function screenshot(name, selector) {
  await evaluate(`Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})))`);
  let params={format:'png'};
  if (selector) {
    const clip=await evaluate(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1}; })()`);
    params={...params,clip,captureBeyondViewport:true};
  }
  const shot=await send('Page.captureScreenshot',params);
  await writeFile(join(tmpdir(),`encompass-restaurant-${name}.png`),Buffer.from(shot.data,'base64'));
}
async function assertFullCardArtwork() {
  assert.equal(await evaluate(`(() => {
    const card=document.querySelector('.product-restaurant').getBoundingClientRect();
    const picture=document.querySelector('.product-restaurant picture').getBoundingClientRect();
    const image=getComputedStyle(document.querySelector('.product-restaurant img'));
    return Math.abs(card.width-picture.width)<3 && Math.abs(card.height-picture.height)<3 && image.objectFit==='cover' && image.maskImage==='none';
  })()`),true,'Artwork covers the complete card without a mask');
}
async function open() {
  await click('[data-product="1"]');
  assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').open`),true);
  assert.equal(await evaluate(`document.activeElement.id`),'restaurant-title');
  assert.equal(await evaluate(`document.querySelectorAll('dialog[open]').length`),1);
}
async function locale(lang) {
  await evaluate(`var language=document.querySelector('#language');language.value='${lang}';language.dispatchEvent(new Event('change'));`);
}
async function menuFlow() {
  await click('#restaurant-art-entry');
  assert.equal(await evaluate(`document.querySelectorAll('dialog[open]').length`),1);
  assert.equal(await evaluate(`document.querySelectorAll('[data-dish]').length`),4);
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-category="0"][aria-pressed="true"]'))`),true);
  for(const [category,count,dish] of [[1,2,0],[2,1,2],[3,1,3]]) {
    await click(`[data-category="${category}"]`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-dish]').length`),count);
    assert.equal(await evaluate(`document.activeElement.id`),`restaurant-category-${category}`);
    const label=await text(`[data-dish="${dish}"] strong`);
    await click(`[data-dish="${dish}"]`);
    assert.equal(await text('#restaurant-title'),label);
    assert.equal(await text('.restaurant-price strong'),['$16.90','$13.50','$7.50','$4.00'][dish]);
    await click('#restaurant-back-menu');
    assert.equal(await evaluate(`document.activeElement.id`),`restaurant-dish-${dish}`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-dish]').length`),count);
  }
  await click('[data-category="0"]');
  await click('[data-dish="1"]');
  assert.equal(await text('.restaurant-price strong'),'$13.50');
  await key('Escape','Escape',27);
  await waitFor(`document.activeElement.id === 'restaurant-dish-1'`);
  await key('Escape','Escape',27);
  await waitFor(`document.activeElement.id === 'restaurant-art-entry'`);
  assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').open`),true);
}
try {
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1365,height:900,deviceScaleFactor:1,mobile:false});
  await navigate('/');await locale('en');
  await evaluate(`document.querySelector('#products').scrollIntoView({behavior:'instant'})`);
  await waitFor(`Number(document.querySelector('#products').style.opacity)>.99`);
  await waitFor(`document.querySelector('.product-restaurant img').complete && document.querySelector('.product-restaurant img').naturalWidth > 0`);
  assert.match(await evaluate(`document.querySelector('.product-restaurant img').currentSrc`),/restaurant-digital-menu.webp$/);
  assert.equal(await text('.product-restaurant .product-title'),'Restaurant Digital Experience');
  assert.equal(await text('#interest option:nth-child(3)'),'Restaurant Digital Experience');
  assert.doesNotMatch(await text('#products'),/Customer Relationship|CRM/);
  await screenshot('card-desktop','.product-restaurant');
  await assertFullCardArtwork();
  const rect=await evaluate(`(() => {const r=document.querySelector('.product-restaurant').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:rect.x+rect.width/2,y:rect.y+rect.height/2});
  await waitFor(`document.querySelector('.product-restaurant').getBoundingClientRect().width > ${rect.width*1.2}`);
  await new Promise(r=>setTimeout(r,1100));
  await screenshot('card-hover','.product-restaurant');
  await assertFullCardArtwork();
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
  // Real keyboard opening and focus containment.
  await evaluate(`document.querySelector('[data-product="1"]').focus()`);
  await key('Tab','Tab',9);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
  assert.equal(await evaluate(`document.querySelector('.product-restaurant').matches(':focus-visible')`),true);
  await screenshot('card-focus','.product-restaurant');
  await assertFullCardArtwork();
  await evaluate(`document.activeElement.blur()`);
  await waitFor(`Math.abs(document.querySelector('.product-restaurant').getBoundingClientRect().width-${rect.width})<1`);
  assert.equal(await evaluate(`Math.abs(document.querySelector('.product-restaurant').getBoundingClientRect().width-${rect.width})<1`),true,'Returns to collapsed width');
  await evaluate(`document.querySelector('.product-restaurant').focus()`);
  await key('Enter','Enter',13);
  await waitFor(`document.querySelector('#restaurant-dialog').open`);
  for(let i=0;i<8;i++) {await key('Tab','Tab',9);assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').contains(document.activeElement)`),true);}
  await key('Escape','Escape',27);
  await waitFor(`!document.querySelector('#restaurant-dialog').open`);
  await waitFor(`document.activeElement.dataset.product === '1'`);
  for(const lang of ['en','fr','zh']) {
    await locale(lang);await open();
    assert.doesNotMatch(await text('#restaurant-dialog'),/undefined|\?\?\?|\[object Object\]/);
    assert.doesNotMatch(await text('#products'),/Customer Relationship|CRM|客户关系管理|Gestion de la relation client/);
    await menuFlow();
    await evaluate(`document.querySelector('#restaurant-explore').focus()`);
    await key('Enter','Enter',13);
    await waitFor(`document.querySelectorAll('[data-dish]').length === 4`);
    if(lang==='en') {
      await screenshot('menu-desktop');
      await click('[data-dish="0"]');await screenshot('dish-desktop');await click('#restaurant-back-menu');
    }
    await click('#restaurant-back-details');
    assert.equal(await evaluate(`document.activeElement.id`),'restaurant-explore');
    await click('[data-enquire]');
    await waitFor(`document.activeElement.name==='name'`);
    assert.equal(await evaluate(`document.querySelector('#interest').selectedIndex`),2);
    await open();await click('#restaurant-dialog .restaurant-close');
    await waitFor(`document.activeElement.dataset.product==='1'`);
  }
  for(const width of [768,390,320]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<641});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await navigate('/');await locale('en');
    await evaluate(`document.querySelector('#products').scrollIntoView({behavior:'instant'})`);
    await waitFor(`Number(document.querySelector('#products').style.opacity)>.99`);
    await screenshot(`card-${width}`,'.product-restaurant');
    await assertFullCardArtwork();
    for(const lang of ['en','fr','zh']) {
      await locale(lang);
      assert.equal(await evaluate(`(() => {const card=document.querySelector('.product-restaurant').getBoundingClientRect(), info=document.querySelector('.product-restaurant .product-info').getBoundingClientRect();return info.top>=card.top+70 && info.bottom<=card.bottom && info.left>=card.left;})()`),true,`Card text fits at ${width}/${lang}`);
      if(lang==='fr') await screenshot(`card-${width}-fr`,'.product-restaurant');
    }
    await locale('en');
    await open();await menuFlow();await click('#restaurant-explore');
    assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').getAnimations({subtree:true}).length`),0);
    assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth <= innerWidth`),true);
    await screenshot(`menu-${width}`);
    await click('[data-dish="0"]');
    assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth <= innerWidth`),true);
    await screenshot(`dish-${width}`);
    await click('#restaurant-dialog .restaurant-close');
    await waitFor(`!document.querySelector('#restaurant-dialog').open`);
  }
  // Marketing keeps its social-media offering and shared product-slot mapping.
  await navigate('/marketing.html');await locale('en');
  for(const lang of ['en','fr','zh']) {
    await locale(lang);await click('[data-product="1"]');
    const title=await text('#dialog-title');
    assert.equal(title,await text('#interest option:nth-child(3)'));
    assert.doesNotMatch(title,/Restaurant Digital|餐饮数字|restauration/);
    if(lang==='en') assert.match(title,/Social Media/);
    await click('#dialog-contact');
    assert.equal(await evaluate(`document.querySelector('#interest').selectedIndex`),2);
  }
  assert.equal(await evaluate(`document.querySelector('#restaurant-dialog')`),null);
  // Capture the real shared mailto handler without launching an email app.
  const app=await(await fetch(base+'/app.js')).text();
  const handler=app.match(/\$\('#contact-form'\)\.addEventListener\('submit',(e=>\{[^\n]+\})\);/)[1];
  const capturedLocation={},status={};
  const fields=new Map([['name','Fictional Tester'],['email','test@example.invalid'],['interest','Restaurant Digital Experience'],['message','Sample restaurant enquiry']]);
  vm.runInNewContext(`(${handler})({preventDefault(){},currentTarget:{}})`,{FormData:class{get(name){return fields.get(name);}},location:capturedLocation,encodeURIComponent,$:()=>status,text:()=>'Email draft prepared'});
  assert.match(capturedLocation.href,/^mailto:/);
  assert.match(decodeURIComponent(capturedLocation.href),/Restaurant Digital Experience/);
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
  console.log('PASS: restaurant card/artwork, desktop/mobile, hover, keyboard, semantic image entry, categories, all dishes/prices, focus/Escape, translations, enquiry selection, reduced motion and Marketing social-media mapping. No browser exceptions or failed requests.');
} catch(error) {
  console.error('Browser errors:',errors,'Failed requests:',failures);throw error;
} finally {
  await fetch(`http://127.0.0.1:9227/json/close/${target.id}`);socket.close();
}
