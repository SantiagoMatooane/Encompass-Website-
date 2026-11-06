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
  await mkdir('.openai/crm-review',{recursive:true});await writeFile(join('.openai/crm-review',name+'.png'),bytes);
  if(name.startsWith('currency-')){const folder=join(process.cwd(),'.openai/restaurant-currency-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
  if(name.startsWith('photo-')){const folder=join(process.cwd(),'.openai/restaurant-photo-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
  if(name.startsWith('after-')){const folder=join(process.cwd(),'.openai/restaurant-journey-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
}



try{
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 for(const width of [1365,320]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<641});await navigate('/');await waitFor(`document.querySelector('.product-crm')`);
  for(const [lang,title,cta] of [['en','Client Relationship Management','Discuss your CRM needs'],['fr','Gestion de la relation client','Discutons de vos besoins CRM'],['zh','\u5ba2\u6237\u5173\u7cfb\u7ba1\u7406','\u8ba8\u8bba\u60a8\u7684 CRM \u9700\u6c42']]){
   await evaluate(`document.querySelector('#language').value=${JSON.stringify(lang)};document.querySelector('#language').dispatchEvent(new Event('change'))`);
   assert.equal(await text('.product-crm .product-title'),title);assert.equal(await text('[data-crm-interest]'),title);
   await evaluate(`document.querySelector('.product-crm').scrollIntoView({block:'center',behavior:'instant'})`);await screenshot(`card-${lang}-${width}`,'.product-crm');
   await click('.product-crm');await waitFor(`document.querySelector('#crm-dialog').open`);
   assert.equal(await text('#crm-title'),title);assert.equal(await text('#crm-enquire'),cta);
   assert.equal(await evaluate(`document.activeElement.id`),'crm-title');assert.equal(await evaluate(`document.querySelectorAll('#crm-plans li').length`),3);
   if(lang==='en'){
    assert.equal(await text('#crm-dialog [data-crm=intro]'),'We\u2019re developing this workspace for Encompass\u2019s own client relationships, with future client implementations in mind.');
    assert.equal(await text('#crm-dialog [data-crm=note]'),'These are intended areas of focus, not verified available features.');
    assert.doesNotMatch(await text('#crm-dialog'),/Try demo|subscription|AI capabilities|available now/);
   }
   assert.equal(await evaluate(`document.querySelector('#crm-dialog').scrollWidth<=document.querySelector('#crm-dialog').clientWidth+1`),true);await screenshot(`details-${lang}-${width}`);
   for(let i=0;i<6;i++){await key('Tab','Tab',9);assert.equal(await evaluate(`document.querySelector('#crm-dialog').contains(document.activeElement)`),true);}
   await key('Escape','Escape',27);await waitFor(`!document.querySelector('#crm-dialog').open&&document.activeElement.classList.contains('product-crm')`);
   if(lang==='en')await screenshot(`card-focus-${width}`,'.product-crm');
   // Keyboard opens the native card button; enquiry selects CRM and focuses contact name.
   await key('Enter','Enter',13);await waitFor(`document.querySelector('#crm-dialog').open`);await click('#crm-enquire');
   await waitFor(`document.activeElement.name==='name'`);assert.equal(await evaluate(`document.querySelector('#interest').selectedIndex`),3);assert.equal(await evaluate(`document.querySelector('#interest').value`),title);
   await click('.product-crm');await click('#crm-close');await waitFor(`document.activeElement.classList.contains('product-crm')`);
   if(lang==='en'&&width===1365){
    await evaluate(`document.activeElement.blur()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});await new Promise(r=>setTimeout(r,800));
    const r=await evaluate(`(()=>{const r=document.querySelector('.product-crm').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x+r.width/2,y:r.y+r.height/2});await waitFor(`document.querySelector('.product-crm').getBoundingClientRect().width>${r.width*1.2}`);await screenshot('card-hover-1365','.product-crm');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});await waitFor(`Math.abs(document.querySelector('.product-crm').getBoundingClientRect().width-${r.width})<1`);
   }
  }
 }
 // The existing Marketing product labels, bindings and form mapping must stay intact.
 await navigate('/marketing.html');await waitFor(`document.querySelector('[data-product="2"]')`);
 await evaluate(`document.querySelector('#language').value='en';document.querySelector('#language').dispatchEvent(new Event('change'))`);
 assert.equal(await evaluate(`document.querySelector('#crm-dialog')===null`),true);
 await click('[data-product="2"]');assert.match(await text('#dialog-title'),/Website/);await click('#dialog-contact');assert.equal(await evaluate(`document.querySelector('#interest').selectedIndex`),3);
 assert.deepEqual(errors,[]);console.log('PASS CRM: desktop/320px, three locales, planned content, conceptual artwork, real pointer/keyboard open-close, Escape/focus trap/restoration, enquiry preselection, unchanged Marketing third card/form binding.');
}catch(error){console.error('CRM STATE',await evaluate(`({url:location.href,dialogOpen:document.querySelector('#crm-dialog')?.open,focus:document.activeElement?.outerHTML,crmCss:[...document.styleSheets].map(s=>s.href),errors:window.errors})`));throw error;}finally{await browserSend('Target.disposeBrowserContext',{browserContextId:context.browserContextId});socket.close();browser.close();}
