// Real-input browser regression. Serve dist/ at http://127.0.0.1:4173/ and start Chrome with remote debugging on port 9227.
// Run: node verify-restaurant-real.mjs. Uses a fresh isolated context, real timers and trusted CDP mouse/keyboard input.
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const base='http://127.0.0.1:4173';
const version=await(await fetch('http://127.0.0.1:9227/json/version')).json();
const browser=new WebSocket(version.webSocketDebuggerUrl);await new Promise(r=>browser.onopen=r);
let seq=0;const tasks=new Map();browser.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){tasks.get(m.id)(m.result);tasks.delete(m.id);}};
const browserSend=(method,params={})=>new Promise(r=>{tasks.set(++seq,r);browser.send(JSON.stringify({id:seq,method,params}));});
const context=await browserSend('Target.createBrowserContext');
const {targetId}=await browserSend('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});
const target=(await(await fetch('http://127.0.0.1:9227/json/list')).json()).find(t=>t.id===targetId);
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r);
let sequence = 0;
const pending = new Map(), errors = [], failures = [], requestUrls=new Map();
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const task = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) task.reject(new Error(JSON.stringify(message.error)));
    else task.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + (message.params.exceptionDetails.exception?.description || ''));
  if(message.method==='Network.requestWillBeSent')requestUrls.set(message.params.requestId,message.params.request.url);
  if (message.method === 'Network.loadingFailed' && !message.params.canceled) failures.push(message.params.errorText+' '+requestUrls.get(message.params.requestId));
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
async function click(selector){
 await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
 await new Promise(r=>setTimeout(r,300));
 const point=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
 await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
}
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
  const bytes=Buffer.from(shot.data,'base64');
  await mkdir('.openai/restaurant-real-review',{recursive:true});await writeFile(join('.openai/restaurant-real-review',name+'.png'),bytes);
  if(name.startsWith('currency-')){const folder=join(process.cwd(),'.openai/restaurant-currency-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
  if(name.startsWith('photo-')){const folder=join(process.cwd(),'.openai/restaurant-photo-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
  if(name.startsWith('after-')){const folder=join(process.cwd(),'.openai/restaurant-journey-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
}


const descriptions=[
 'A grilled beef burger with melted cheese in a sesame-seed bun, served with golden fries.',
 'A colourful bowl of grilled vegetables, grains, chickpeas, avocado and fresh leaves, with dressing on the side.',
 'A golden citrus cake slice, dusted with icing sugar and finished with a citrus wedge and fresh mint.',
 'Refreshing peach iced tea served over ice with fruit slices and a fresh mint garnish.'
];
const disclosure='Demo recipe: ingredients and allergens are not verified.';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const currency=()=>evaluate(`document.querySelector('#restaurant-currency').value`);
const paused=async()=>assert.equal(await evaluate(`document.querySelector('#restaurant-currency-preview').getAttribute('aria-pressed')`),'false');
async function selectOption(selector,index){await click(selector);await key('Home','Home',36);for(let i=0;i<index;i++)await key('ArrowDown','ArrowDown',40);await key('Enter','Enter',13);}
async function openMenu(){await click('.product-restaurant');await click('#restaurant-explore');await selectOption('#restaurant-table-select',6);await click('#restaurant-table-form button');}
async function checkCopy(width){
 for(let id=0;id<4;id++){
  assert.equal(await text(`#restaurant-dish-${id} .restaurant-dish-copy>span:first-of-type`),descriptions[id]);
  assert.equal(await text(`#restaurant-dish-${id} .restaurant-dietary`),disclosure);
  await evaluate(`document.querySelector('#restaurant-dish-${id}').scrollIntoView({block:'center',behavior:'instant'});`);
  await screenshot(`card-${id}-${width}`,`#restaurant-dish-${id}`);
  await click(`#restaurant-dish-${id}`);
  assert.equal(await text('.restaurant-dish-detail>div>p:not(.restaurant-eyebrow)'),descriptions[id]);
  assert.ok((await text('.restaurant-dish-detail')).includes(disclosure));
  await evaluate(`document.querySelector('.restaurant-dish-detail').scrollIntoView({block:'start',behavior:'instant'})`);
  await screenshot(`detail-${id}-${width}`);
  await click('#restaurant-back-menu');
 }
 assert.match(await text('#restaurant-dialog'),/Fictional dishes and sample prices\./);
 assert.doesNotMatch(await text('#restaurant-dialog'),/sample USD prices|Vegan\.|Contains gluten|caramelised onions|whipped cream|sesame dressing/);
}
try{
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1365,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate('/');await waitFor(`document.querySelector('.product-restaurant')`);
 await openMenu();await paused();await checkCopy(1365);
 await click('#restaurant-currency-preview');
 assert.equal(await text('#restaurant-currency-preview'),'Preview currencies: Pause');
 const observations=[{elapsed:0,currency:await currency()}],started=Date.now();
 for(const expected of ['ZAR','EUR','JPY','USD']){
  const deadline=Date.now()+6500;while(await currency()!==expected&&Date.now()<deadline)await delay(100);
  assert.equal(await currency(),expected);observations.push({elapsed:Date.now()-started,currency:expected,price:await text('#restaurant-dish-0 b')});
  if(expected==='JPY')await screenshot('preview-playing-1365');
 }
 console.log('REAL 5-SECOND OBSERVATIONS',JSON.stringify(observations));
 // Pause is a trusted pointer click, then wait longer than an interval.
 await click('#restaurant-currency-preview');await paused();const pausedAt=await currency();await delay(5200);assert.equal(await currency(),pausedAt);
 // Clicking ordinary copy must not masquerade as an ordering interaction.
 await click('#restaurant-currency-preview');await click('.restaurant-caption');assert.equal(await evaluate(`document.querySelector('#restaurant-currency-preview').getAttribute('aria-pressed')`),'true');await click('#restaurant-currency-preview');
 await click('#restaurant-currency-preview');await selectOption('#restaurant-currency',2);await paused();assert.equal(await currency(),'EUR');await delay(5200);assert.equal(await currency(),'EUR');
 await click('#restaurant-dish-0');await click('#restaurant-currency-preview');await click('#restaurant-add');await paused();assert.equal(await text('#restaurant-cart-count'),'1');await delay(5200);assert.equal(await currency(),'EUR');
 await click('#restaurant-cart');assert.equal(await text('#restaurant-cart-total'),'\u20ac15.21');
 await click('[data-increase="0"]');assert.equal(await text('#restaurant-cart-total'),'\u20ac30.42');
 await click('#restaurant-place');await waitFor(`document.querySelector('#restaurant-reference')`);assert.equal(await text('#restaurant-confirmed-total'),'\u20ac30.42');assert.equal(await text('#restaurant-submitted-currency'),'EUR');
 await screenshot('confirmation-1365');
 await click('#restaurant-dialog .restaurant-close');await openMenu();await paused();assert.equal(await currency(),'EUR');assert.equal(await text('#restaurant-cart-count'),'0');
 // Switch to another actual tab, then return; no mocked hidden getter or timers.
 await click('#restaurant-currency-preview');const otherTab=await browserSend('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});await browserSend('Target.activateTarget',{targetId:otherTab.targetId});await waitFor(`document.hidden`);await paused();await browserSend('Target.activateTarget',{targetId});await waitFor(`!document.hidden`);await paused();await browserSend('Target.closeTarget',{targetId:otherTab.targetId});
 await click('#restaurant-dialog .restaurant-close');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:true});await openMenu();await paused();await checkCopy(320);
 assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth<=document.querySelector('#restaurant-dialog').clientWidth+1`),true);
 await click('#restaurant-currency-preview');assert.equal(await text('#restaurant-currency-preview'),'Preview currencies: Pause');const mobileStarted=await currency();await delay(5200);assert.notEqual(await currency(),mobileStarted);await screenshot('preview-playing-320');await click('#restaurant-currency-preview');await paused();
 assert.deepEqual(errors,[]);console.log('PASS REAL JOURNEY: fresh isolated browser context at '+base+'/; trusted mouse/keyboard controls, all exact card/detail copy, real 5-second transitions, pause/manual selection/add stopping, cart arithmetic, frozen confirmation, reopen, real background-tab stop/no-resume and 320px layout.');
}finally{await browserSend('Target.disposeBrowserContext',{browserContextId:context.browserContextId});socket.close();browser.close();}
