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
  await mkdir('.openai/about-simple-review',{recursive:true});await writeFile(join('.openai/about-simple-review',name+'.png'),bytes);
  if(name.startsWith('currency-')){const folder=join(process.cwd(),'.openai/restaurant-currency-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
  if(name.startsWith('photo-')){const folder=join(process.cwd(),'.openai/restaurant-photo-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
  if(name.startsWith('after-')){const folder=join(process.cwd(),'.openai/restaurant-journey-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
}





const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const active=()=>evaluate(`document.querySelector('.as-slide:not([hidden])')?.id`);
const pendingCount=()=>evaluate(`window.aboutPending.size`);
async function noHold(){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});await evaluate(`document.activeElement.blur()`);}
async function visible(){await noHold();await evaluate(`document.querySelector('.about-showcase').scrollIntoView({block:'center',behavior:'instant'})`);await delay(200);}
async function load(width=1365){await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<641});await navigate('/');await waitFor(`document.querySelectorAll('.as-slide').length===3`);await evaluate(`document.fonts.ready`);await visible();}
async function untilSlide(id){const deadline=Date.now()+5500;while(await active()!==id&&Date.now()<deadline)await delay(100);assert.equal(await active(),id);assert.ok(await pendingCount()<=1);}
async function hover(){const point=await evaluate(`(()=>{const r=document.querySelector('.about-showcase').getBoundingClientRect();return {x:r.x+10,y:Math.max(100,r.y+20)};})()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await delay(50);}
async function capture(name){await evaluate(`Promise.all([...document.querySelectorAll('#about img')].map(image=>{image.loading='eager';return image.decode()}))`);await evaluate(`document.querySelector('#about').scrollIntoView({block:'start',behavior:'instant'})`);await waitFor(`Number(document.querySelector('#about').style.opacity)>.8`);await screenshot(name,'#about');}
try{
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 // Observe native timers without replacing the clock or invoking application callbacks.
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.aboutPending=new Set();const originalSet=window.setTimeout,originalClear=window.clearTimeout;window.setTimeout=(callback,ms,...args)=>{if(ms!==4000||typeof callback!=='function')return originalSet(callback,ms,...args);let id=originalSet((...values)=>{aboutPending.delete(id);callback(...values)},ms,...args);aboutPending.add(id);return id};window.clearTimeout=id=>{aboutPending.delete(id);return originalClear(id)};`});
 await load();assert.equal(await evaluate(`document.querySelectorAll('.as-controls,#as-play,#as-counter,.as-selectors,#as-previous,#as-next').length`),0);
 assert.equal(await text('#about-title'),'Your business. A clearer direction.');assert.equal(await evaluate(`document.querySelector('.as-intro a').getAttribute('href')`),'#products');
 await waitFor(`aboutPending.size===1`);const start=Date.now(),observations=[];assert.equal(await active(),'as-slide-0');const height=await evaluate(`document.querySelector('.as-stage').getBoundingClientRect().height`);
 for(const id of ['as-slide-1','as-slide-2','as-slide-0']){await untilSlide(id);observations.push({elapsed:Date.now()-start,slide:id});assert.equal(await evaluate(`document.querySelector('.as-stage').getBoundingClientRect().height`),height);}
 console.log('REAL FOUR-SECOND TRANSITIONS',JSON.stringify(observations));assert.equal(await text('#as-announcement'),'');
 await hover();const held=await active();assert.equal(await pendingCount(),0);await delay(4200);assert.equal(await active(),held);
 await evaluate(`document.querySelector('.as-slide:not([hidden]) .as-cta').focus()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});assert.equal(await pendingCount(),0);await delay(4200);assert.equal(await active(),held);assert.equal(await evaluate(`document.activeElement.closest('.as-slide').id`),held);
 await noHold();await waitFor(`aboutPending.size===1`);await delay(1800);assert.equal(await active(),held);await untilSlide('as-slide-1');
 // Hiding and returning creates a fresh timer; it never jumps to catch up.
 const other=await browserSend('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});await browserSend('Target.activateTarget',{targetId:other.targetId});await waitFor(`document.hidden`);assert.equal(await pendingCount(),0);const hiddenAt=await active();await delay(4200);assert.equal(await active(),hiddenAt);await browserSend('Target.activateTarget',{targetId});await waitFor(`!document.hidden&&aboutPending.size===1`);await delay(1800);assert.equal(await active(),hiddenAt);await untilSlide('as-slide-2');await browserSend('Target.closeTarget',{targetId:other.targetId});
 await evaluate(`document.querySelector('#products').scrollIntoView({block:'center',behavior:'instant'})`);await waitFor(`aboutPending.size===0`);const away=await active();await delay(4200);assert.equal(await active(),away);await visible();await waitFor(`aboutPending.size===1`);await delay(1800);assert.equal(await active(),away);await untilSlide('as-slide-0');
 // Real CTA clicks open the existing dialogs and return focus to the same slide.
 for(let i=0;i<3;i++){
  await untilSlide('as-slide-'+i);await click('.as-slide:not([hidden]) .as-cta');const dialog=['legal','restaurant','crm'][i];await waitFor(`document.querySelector('#${dialog}-dialog').open`);assert.equal(await pendingCount(),0);
  if(i===0){await delay(4200);assert.equal(await active(),'as-slide-0');}
  await key('Escape','Escape',27);await waitFor(`!document.querySelector('#${dialog}-dialog').open&&document.activeElement===document.querySelector('.as-slide:not([hidden]) .as-cta')`);assert.equal(await pendingCount(),0);
  if(i===0){await key('Enter','Enter',13);await waitFor(`document.querySelector('#legal-dialog').open`);await key('Escape','Escape',27);await waitFor(`!document.querySelector('#legal-dialog').open`);}
  await visible();await waitFor(`aboutPending.size===1`);
 }
 for(const width of [1365,768,390,320]){await load(width);await hover();assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),true);await capture(`about-${width}`);}
 // Native mobile swipe and ordinary wheel scrolling remain available.
 await visible();await evaluate(`document.querySelector('.as-slide:not([hidden]) .as-visual').scrollIntoView({block:'center',behavior:'instant'})`);const point=await evaluate(`(()=>{const r=document.querySelector('.as-slide:not([hidden]) .as-visual').getBoundingClientRect();return {x:r.x+r.width*.7,y:r.y+r.height*.5};})()`);const swipeFrom=await active();
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x-90,y:point.y+2}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(250);assert.notEqual(await active(),swipeFrom);assert.ok(await pendingCount()<=1);
 const verticalFrom=await active(),scrollFrom=await evaluate(`scrollY`);await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:160,y:500,deltaX:0,deltaY:700});await delay(500);assert.notEqual(await evaluate(`scrollY`),scrollFrom);assert.equal(await active(),verticalFrom);
 // Static reduced-motion layout exposes all three products and all CTAs, with no timer.
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load(320);assert.equal(await pendingCount(),0);assert.equal(await evaluate(`document.querySelectorAll('.as-slide:not([hidden]):not([inert])').length`),3);assert.equal(await evaluate(`document.querySelector('.about-showcase').hasAttribute('aria-roledescription')`),false);await delay(4200);assert.equal(await pendingCount(),0);assert.equal(await evaluate(`document.querySelectorAll('.as-slide:not([hidden])').length`),3);
 await capture('static-320');
 for(let i=0;i<3;i++){await click(`#as-slide-${i} .as-cta`);const id=['legal','restaurant','crm'][i];await waitFor(`document.querySelector('#${id}-dialog').open`);await key('Escape','Escape',27);await waitFor(`document.activeElement===document.querySelector('#as-slide-${i} .as-cta')`);}
 await send('Emulation.setEmulatedMedia',{features:[]});await waitFor(`!document.querySelector('.as-stage').classList.contains('as-static')`);assert.equal(await active(),'as-slide-2');assert.equal(await pendingCount(),0);assert.equal(await evaluate(`document.activeElement.closest('.as-slide').id`),'as-slide-2');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load(1365);await capture('static-1365');
 assert.deepEqual(errors,[]);console.log('PASS simplified About: native four-second cycle, no duplicate timers, fresh resume after visibility/tab/hover/focus holds, focused CTA preserved, all dialog destinations and close/reopen, desktop/tablet/390/320px, swipe/scroll and static accessible reduced motion.');
}finally{await browserSend('Target.disposeBrowserContext',{browserContextId:context.browserContextId});socket.close();browser.close();}
