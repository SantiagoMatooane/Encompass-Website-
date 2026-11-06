// Dependency-free browser checks. Start the static preview and Chrome with
// --headless=new --remote-debugging-port=9227 --user-data-dir=<temporary-profile>.
// Run: node verify-restaurant.mjs
import assert from 'node:assert/strict';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import vm from 'node:vm';

const base = 'http://127.0.0.1:4173';
const target = await (await fetch('http://127.0.0.1:9227/json/new?about:blank', {method: 'PUT'})).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
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
  const deadline = Date.now() + 20000; // Allow external SDK loading; feature timing assertions remain unchanged.
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
  const bytes=Buffer.from(shot.data,'base64');
  await writeFile(join(tmpdir(),`encompass-restaurant-${name}.png`),bytes);
  if(name.startsWith('currency-')){const folder=join(process.cwd(),'.openai/restaurant-currency-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
  if(name.startsWith('photo-')){const folder=join(process.cwd(),'.openai/restaurant-photo-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
  if(name.startsWith('after-')){const folder=join(process.cwd(),'.openai/restaurant-journey-review');await mkdir(folder,{recursive:true});await writeFile(join(folder,name+'.png'),bytes);}
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
const expectedDescriptions={"en": ["A grilled beef burger with melted cheese in a sesame-seed bun, served with golden fries.", "A colourful bowl of grilled vegetables, grains, chickpeas, avocado and fresh leaves, with dressing on the side.", "A golden citrus cake slice, dusted with icing sugar and finished with a citrus wedge and fresh mint.", "Refreshing peach iced tea served over ice with fruit slices and a fresh mint garnish."], "fr": ["Un burger de b\u0153uf grill\u00e9 avec du fromage fondu dans un pain aux graines de s\u00e9same, servi avec des frites dor\u00e9es.", "Un bol color\u00e9 de l\u00e9gumes grill\u00e9s, de c\u00e9r\u00e9ales, de pois chiches, d\u2019avocat et de feuilles fra\u00eeches, avec la sauce \u00e0 part.", "Une tranche de g\u00e2teau dor\u00e9 aux agrumes, saupoudr\u00e9e de sucre glace et garnie d\u2019un quartier d\u2019agrume et de menthe fra\u00eeche.", "Un th\u00e9 glac\u00e9 rafra\u00eechissant \u00e0 la p\u00eache, servi sur des gla\u00e7ons avec des tranches de fruits et une garniture de menthe fra\u00eeche."], "zh": ["\u70e4\u725b\u8089\u6c49\u5821\u642d\u914d\u878d\u5316\u7684\u5976\u916a\uff0c\u5939\u5728\u829d\u9ebb\u9762\u5305\u4e2d\uff0c\u914d\u4ee5\u91d1\u9ec4\u85af\u6761\u3002", "\u8272\u5f69\u4e30\u5bcc\u7684\u4e00\u7897\u70e4\u852c\u83dc\u3001\u8c37\u7269\u3001\u9e70\u5634\u8c46\u3001\u725b\u6cb9\u679c\u548c\u65b0\u9c9c\u53f6\u83dc\uff0c\u9171\u6c41\u53e6\u914d\u3002", "\u91d1\u9ec4\u7684\u67d1\u6a58\u86cb\u7cd5\u5207\u7247\uff0c\u6492\u4e0a\u7cd6\u7c89\uff0c\u9970\u4ee5\u67d1\u6a58\u89d2\u548c\u65b0\u9c9c\u8584\u8377\u3002", "\u6e05\u723d\u7684\u871c\u6843\u51b0\u8336\uff0c\u52a0\u51b0\u996e\u7528\uff0c\u642d\u914d\u6c34\u679c\u5207\u7247\u548c\u65b0\u9c9c\u8584\u8377\u88c5\u9970\u3002"]};
async function menuFlow() {
  await click('#restaurant-art-entry');
  assert.equal(await evaluate(`document.querySelector('.restaurant-view').dataset.view`),'table');
  await click('#restaurant-browse');
  assert.equal(await evaluate(`document.querySelectorAll('dialog[open]').length`),1);
  assert.equal(await evaluate(`document.querySelectorAll('[data-dish]').length`),4);
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-category="0"][aria-pressed="true"]'))`),true);
  for(let id=0;id<4;id++)assert.equal(await text(`#restaurant-dish-${id} .restaurant-dish-copy>span:first-of-type`),expectedDescriptions[await evaluate(`document.documentElement.lang`)][id]);
  for(const [category,count,dish] of [[1,2,0],[2,1,2],[3,1,3]]) {
    await click(`[data-category="${category}"]`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-dish]').length`),count);
    assert.equal(await evaluate(`document.activeElement.id`),`restaurant-category-${category}`);
    const label=await text(`[data-dish="${dish}"] strong`);
    await click(`[data-dish="${dish}"]`);
    assert.equal(await text('#restaurant-title'),label);
    assert.equal(await text('.restaurant-dish-detail>div>p:not(.restaurant-eyebrow)'),expectedDescriptions[await evaluate(`document.documentElement.lang`)][dish]);
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
const fill=(selector,value)=>evaluate(`var control=document.querySelector(${JSON.stringify(selector)});control.value=${JSON.stringify(value)};control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));`);
const viewIs=view=>evaluate(`document.querySelector('.restaurant-view').dataset.view===${JSON.stringify(view)}`);
const badge=()=>text('#restaurant-cart-count');
async function chooseTable(number){await fill('#restaurant-table-select',String(number));await click('#restaurant-table-form button[type="submit"]');}
async function journeyFlow(width,lang='en'){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<641});
  await navigate('/');await locale(lang);
  await evaluate(`document.querySelector('#products').scrollIntoView({behavior:'instant'})`);
  await waitFor(`Number(document.querySelector('#products').style.opacity)>.99`);
  if(lang==='en')await screenshot(`after-thumbnail-${width}`,'.product-restaurant');
  await open();await click('#restaurant-explore');
  assert.equal(await viewIs('table'),true);
  assert.equal(await evaluate(`document.querySelectorAll('#restaurant-table-select option').length`),13);
  assert.equal(await evaluate(`document.querySelector('#restaurant-table-select').value`),'');
  assert.equal(await evaluate(`document.querySelector('#restaurant-guide').dataset.guideStep`),'0');
  await click('#restaurant-cart');
  assert.equal(await evaluate(`document.querySelector('#restaurant-place').disabled`),true);
  assert.equal(await text('#restaurant-cart-total'),'$0.00');
  await click('#restaurant-browse');
  assert.match(await text('.restaurant-menu-brand'),/Peachlight Kitchen/);
  assert.doesNotMatch(await text('#restaurant-dialog'),/Copper|ordering is not available/);
  if(lang==='en')await screenshot(`after-menu-${width}`);
  await click('[data-dish="0"]');await fill('#restaurant-quantity','2');await click('#restaurant-add');
  assert.equal(await badge(),'2');
  assert.notEqual(await text('#restaurant-feedback'),'');
  await click('#restaurant-add');assert.equal(await badge(),'4');
  await click('#restaurant-back-menu');
  assert.equal(await evaluate(`document.activeElement.id`),'restaurant-dish-0');
  await click('[data-category="2"]');await click('[data-dish="2"]');await click('#restaurant-add');assert.equal(await badge(),'5');
  await click('#restaurant-cart');
  assert.equal(await text('[data-cart-line="0"] .restaurant-line-quantity'),'4');
  assert.equal(await text('[data-cart-line="0"] .restaurant-line-total'),'$67.60');
  assert.equal(await text('#restaurant-cart-total'),'$75.10');
  assert.equal(await evaluate(`document.querySelector('#restaurant-place').disabled`),true,'Missing table prevents submission');
  await click('#restaurant-change-table');await chooseTable(5);
  assert.equal(await viewIs('cart'),true);assert.equal(await badge(),'5');
  assert.equal(await text('#restaurant-cart-total'),'$75.10');
  await click('[data-increase="0"]');assert.equal(await text('#restaurant-cart-total'),'$92.00');
  await click('[data-decrease="0"]');assert.equal(await text('#restaurant-cart-total'),'$75.10');
  await click('[data-remove="2"]');assert.equal(await text('#restaurant-cart-total'),'$67.60');
  for(let i=0;i<4;i++)await click('[data-decrease="0"]');
  assert.equal(await badge(),'0');assert.equal(await text('#restaurant-cart-total'),'$0.00');
  assert.equal(await evaluate(`document.querySelector('#restaurant-place').disabled`),true,'Empty cart prevents submission');
  await click('#restaurant-browse');await click('[data-category="1"]');await click('[data-dish="0"]');await fill('#restaurant-quantity','2');await click('#restaurant-add');
  await click('#restaurant-back-menu');await click('[data-category="3"]');await click('[data-dish="3"]');await fill('#restaurant-quantity','3');await click('#restaurant-add');
  await click('#restaurant-cart');await click('#restaurant-change-table');await chooseTable(7);
  assert.equal(await badge(),'5');assert.equal(await text('#restaurant-cart-total'),'$45.80');
  assert.equal(await evaluate(`document.querySelector('#restaurant-guide').dataset.guideStep`),'3');
  assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth<=innerWidth`),true);
  if(lang==='en')await screenshot(`after-cart-${width}`);
  // Two immediate clicks must still generate exactly one local confirmation.
  await evaluate(`var place=document.querySelector('#restaurant-place');place.click();place.click();`);
  assert.equal(await evaluate(`document.querySelector('#restaurant-place').disabled`),true);
  await waitFor(`Boolean(document.querySelector('#restaurant-confirmed-total'))`);
  assert.equal(await text('#restaurant-confirmed-total'),'$45.80');
  assert.match(await text('#restaurant-confirmed-table'),/7/);
  assert.match(await text('[data-cart-line="0"] .restaurant-line-quantity'),/2$/);
  assert.equal(await text('[data-cart-line="0"] .restaurant-line-total'),'$33.80');
  assert.equal(await text('[data-cart-line="3"] .restaurant-line-total'),'$12.00');
  const reference=await text('#restaurant-reference');assert.match(reference,/^DEMO-[A-Z0-9]+-1$/);
  assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth<=innerWidth`),true);
  if(lang==='en'){
    assert.equal(await text('#restaurant-title'),'Your demo order is confirmed.');
    assert.match(await text('.restaurant-order-disclosure'),/No order has been sent to a restaurant and no payment has been taken/);
    await screenshot(`after-confirmation-${width}`);
  }
  await click('#restaurant-new-order');
  assert.equal(await evaluate(`document.querySelector('#restaurant-table-select').value`),'');assert.equal(await badge(),'0');
  assert.equal(await evaluate(`Boolean(document.querySelector('#restaurant-reference'))`),false);
  // Guide advances on actual actions and order submission can be cancelled safely.
  await chooseTable(12);assert.equal(await evaluate(`document.querySelector('#restaurant-guide').dataset.guideStep`),'1');
  await click('[data-category="1"]');await click('[data-dish="1"]');
  assert.equal(await evaluate(`document.querySelector('#restaurant-guide').dataset.guideStep`),'1');
  await fill('#restaurant-quantity','1');await evaluate(`document.querySelector('#restaurant-quantity').focus()`);await key('Enter','Enter',13);
  assert.equal(await badge(),'1');assert.equal(await evaluate(`document.querySelector('#restaurant-guide').dataset.guideStep`),'2');
  await click('#restaurant-cart');assert.equal(await evaluate(`document.querySelector('#restaurant-guide').dataset.guideStep`),'3');
  await click('#restaurant-place');await click('#restaurant-dialog .restaurant-close');
  await waitFor(`!document.querySelector('#restaurant-dialog').open`);
  await new Promise(resolve=>setTimeout(resolve,350));
  await open();await click('#restaurant-art-entry');assert.equal(await badge(),'0');
  assert.equal(await evaluate(`document.querySelector('#restaurant-table-select').value`),'');
  await click('#restaurant-browse');await click('[data-category="0"]');await click('[data-dish="0"]');await click('#restaurant-add');
  await click('#restaurant-restart');assert.equal(await badge(),'0');
  assert.equal(await evaluate(`document.querySelector('#restaurant-table-select').value`),'');
  for(let i=0;i<12;i++){await key('Tab','Tab',9);assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').contains(document.activeElement)`),true);}
  await click('#restaurant-browse');await click('[data-dish="0"]');await key('Escape','Escape',27);
  await waitFor(`document.activeElement.id==='restaurant-dish-0'`);
  await key('Escape','Escape',27);await waitFor(`document.activeElement.id==='restaurant-art-entry'`);
  await click('#restaurant-dialog .restaurant-close');await waitFor(`document.activeElement.dataset.product==='1'`);
}
async function currencyFlow(width){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<641});
  await navigate('/');await locale('en');await open();await click('#restaurant-explore');await chooseTable(6);
  // Track real interval registration; use callback ticks for the exhaustive stop matrix.
  await evaluate(`window.currencyIntervals=new Map();window.nativeCurrencySetInterval=window.setInterval;window.nativeCurrencyClearInterval=window.clearInterval;window.setInterval=(callback,delay,...args)=>{const id=nativeCurrencySetInterval(callback,delay,...args);if(delay===5000)currencyIntervals.set(id,callback);return id;};window.clearInterval=id=>{currencyIntervals.delete(id);nativeCurrencyClearInterval(id);};window.currencyTick=()=>[...currencyIntervals.values()].forEach(callback=>callback());`);
  const selected=()=>evaluate(`document.querySelector('#restaurant-currency')?.value`);
  const running=()=>evaluate(`currencyIntervals.size`);
  const tick=()=>evaluate(`currencyTick()`);
  const stopped=async()=>{assert.equal(await running(),0);assert.equal(await evaluate(`document.querySelector('#restaurant-currency-preview')?.getAttribute('aria-pressed')||'false'`),'false');};
  const start=async()=>{await click('#restaurant-currency-preview');assert.equal(await running(),1);};
  assert.equal(await selected(),'USD');await stopped();
  assert.equal(await evaluate(`document.querySelectorAll('#restaurant-currency').length`),1);
  await evaluate(`window.currencyScreen=document.querySelector('.restaurant-view');window.currencyPrice=document.querySelector('[data-price-cents]');window.currencyStatus=document.querySelector('#restaurant-dialog [role=status]').textContent;window.currencyPriceWidth=currencyPrice.getBoundingClientRect().width;window.currencyPriceHeight=currencyPrice.getBoundingClientRect().height;document.querySelector('#restaurant-currency-preview').focus();window.currencyScroll=document.querySelector('#restaurant-dialog').scrollTop;`);
  await start();
  if(width===1365){await new Promise(resolve=>setTimeout(resolve,5200));assert.equal(await selected(),'ZAR');}else{await tick();assert.equal(await selected(),'ZAR');}
  assert.equal(await text('#restaurant-dish-0 b'),'R\u00a0304.20');
  await tick();assert.equal(await selected(),'EUR');assert.equal(await text('#restaurant-dish-0 b'),'\u20ac15.21');
  await tick();assert.equal(await selected(),'JPY');assert.equal(await text('#restaurant-dish-0 b'),'\u00a52,535');
  assert.equal(await evaluate(`currencyScreen===document.querySelector('.restaurant-view')&&currencyPrice===document.querySelector('[data-price-cents]')&&document.activeElement.id==='restaurant-currency-preview'&&document.querySelector('#restaurant-dialog').scrollTop===currencyScroll&&document.querySelector('#restaurant-dialog [role=status]').textContent===currencyStatus&&currencyPrice.getBoundingClientRect().width===currencyPriceWidth&&currencyPrice.getBoundingClientRect().height===currencyPriceHeight`),true);
  await tick();assert.equal(await selected(),'USD');await tick();
  await click('#restaurant-currency-preview');await stopped();assert.equal(await selected(),'ZAR');await tick();assert.equal(await selected(),'ZAR');
  await start();await fill('#restaurant-currency','EUR');await stopped();assert.equal(await selected(),'EUR');
  await start();await click('[data-category="1"]');await stopped();assert.equal(await selected(),'EUR');
  await start();await click('[data-dish="0"]');await stopped();
  await start();await fill('#restaurant-quantity','2');await stopped();
  await start();await click('#restaurant-add');await stopped();assert.equal(await badge(),'2');
  await start();await click('#restaurant-cart');await stopped();assert.equal(await text('#restaurant-cart-total'),'\u20ac30.42');
  for(const [code,expected] of [['ZAR','R\u00a0608.40'],['JPY','\u00a55,070'],['USD','$33.80'],['EUR','\u20ac30.42']]){await fill('#restaurant-currency',code);assert.equal(await text('#restaurant-cart-total'),expected);assert.equal(await badge(),'2');}
  await start();await click('[data-increase="0"]');await stopped();assert.equal(await text('#restaurant-cart-total'),'\u20ac45.63');
  await start();await click('[data-decrease="0"]');await stopped();
  await start();await click('[data-remove="0"]');await stopped();assert.equal(await text('#restaurant-cart-total'),'\u20ac0.00');
  await start();await click('#restaurant-change-table');await stopped();
  await start();await fill('#restaurant-table-select','9');await stopped();await chooseTable(9);assert.equal(await selected(),'EUR');
  await start();await click('#restaurant-browse');await stopped();
  await click('[data-dish="0"]');await fill('#restaurant-quantity','2');await click('#restaurant-add');await click('#restaurant-cart');
  await start();await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));`);await stopped();
  await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));`);await stopped();
  await start();await click('#restaurant-place');await stopped();await waitFor(`document.querySelector('#restaurant-reference')`);
  assert.equal(await text('#restaurant-submitted-currency'),'EUR');assert.equal(await text('#restaurant-confirmed-total'),'\u20ac30.42');assert.equal(await text('#restaurant-confirmed-table'),'Table 9');
  await tick();assert.equal(await text('#restaurant-confirmed-total'),'\u20ac30.42');
  assert.equal(await evaluate(`document.querySelectorAll('[data-price-currency="EUR"]').length`),3);
  await click('#restaurant-new-order');await stopped();assert.equal(await selected(),'EUR');
  await start();await click('#restaurant-restart');await stopped();
  await start();await click('#restaurant-dialog .restaurant-close');await stopped();
  await open();await click('#restaurant-explore');await stopped();assert.equal(await selected(),'EUR');
  assert.equal(await evaluate(`document.querySelector('#restaurant-table-select').value`),'');assert.equal(await badge(),'0');
  await chooseTable(1);await start();await key('Escape','Escape',27);await stopped();
  await click('#restaurant-art-entry');await chooseTable(1);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await start();await tick();assert.equal(await evaluate(`document.querySelector('[data-price-cents]').getAnimations().length`),0);await click('#restaurant-currency-preview');
  await send('Emulation.setEmulatedMedia',{features:[]});
  for(const code of ['USD','ZAR','EUR','JPY']){await fill('#restaurant-currency',code);assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth<=document.querySelector('#restaurant-dialog').clientWidth+1`),true);}
  await screenshot(`currency-${width}`);await click('#restaurant-dialog .restaurant-close');
}
async function photoFlow(width){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<641});
  await navigate('/');await locale('en');await open();await click('#restaurant-explore');await chooseTable(4);
  await evaluate(`Promise.all([...document.querySelectorAll('.restaurant-food-frame img')].map(image=>{image.loading='eager';return image.decode()}))`);
  const frames=await evaluate(`[...document.querySelectorAll('.restaurant-food-card')].map(frame=>({width:frame.clientWidth,height:frame.clientHeight,loaded:frame.querySelector('img').naturalWidth>0,src:frame.querySelector('img').currentSrc,fit:getComputedStyle(frame.querySelector('img')).objectFit}))`);
  assert.equal(frames.length,4);assert.ok(frames.every(frame=>frame.loaded&&frame.src.endsWith('.webp')));
  assert.ok(frames.every(frame=>Math.abs(frame.width-frames[0].width)<2&&Math.abs(frame.height-frames[0].height)<2));assert.equal(frames[3].fit,'contain');
  for(let id=0;id<4;id++){
    await evaluate(`document.querySelector('#restaurant-dish-${id}').scrollIntoView({block:'center',behavior:'instant'})`);
    await screenshot(`photo-card-${id}-${width}`,'#restaurant-dish-'+id);
  }
  await evaluate(`document.querySelector('.restaurant-categories').scrollIntoView({block:'start',behavior:'instant'})`);await screenshot(`photo-menu-${width}`);
  for(let id=0;id<4;id++){
    await click('#restaurant-dish-'+id);await evaluate(`document.querySelector('.restaurant-food-detail img').decode()`);
    assert.equal(await evaluate(`document.querySelector('.restaurant-food-detail img').naturalWidth>0`),true);
    assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth<=document.querySelector('#restaurant-dialog').clientWidth+1`),true);
    await screenshot(`photo-detail-${id}-${width}`);
    await click('#restaurant-add');await click('#restaurant-back-menu');
  }
  await click('#restaurant-cart');
  await evaluate(`Promise.all([...document.querySelectorAll('.restaurant-food-thumb img')].map(image=>{image.loading='eager';return image.decode()}))`);
  assert.equal(await evaluate(`document.querySelectorAll('.restaurant-food-thumb img').length`),4);
  assert.equal(await text('#restaurant-cart-total'),'$41.90');
  assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth<=document.querySelector('#restaurant-dialog').clientWidth+1`),true);
  await screenshot(`photo-cart-${width}`);
  await evaluate(`document.querySelector('#restaurant-cart-total').scrollIntoView({block:'end',behavior:'instant'})`);await screenshot(`photo-cart-bottom-${width}`);
  await click('#restaurant-place');await waitFor(`document.querySelector('#restaurant-reference')`);
  assert.equal(await text('#restaurant-confirmed-total'),'$41.90');
  await evaluate(`Promise.all([...document.querySelectorAll('.restaurant-food-thumb img')].map(image=>{image.loading='eager';return image.decode()}))`);
  await screenshot(`photo-confirmation-${width}`);
  await evaluate(`document.querySelector('.restaurant-food-thumb img').dispatchEvent(new Event('error'))`);
  assert.equal(await evaluate(`!document.querySelector('.restaurant-food-fallback').hidden`),true);
  await click('#restaurant-dialog .restaurant-close');
}
try {
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1365,height:900,deviceScaleFactor:1,mobile:false});
  await navigate('/');await locale('en');
  await evaluate(`document.fonts.ready`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
  await evaluate(`document.querySelector('#products').scrollIntoView({behavior:'instant'})`);
  await waitFor(`Number(document.querySelector('#products').style.opacity)>.99`);
  await waitFor(`Math.abs(document.querySelector('.product-restaurant').getBoundingClientRect().width-document.querySelector('.product-flow').getBoundingClientRect().width)<.5`);
  await waitFor(`document.querySelector('.product-restaurant img').complete && document.querySelector('.product-restaurant img').naturalWidth > 0`);
  const pngHash=createHash('sha256').update(await readFile('dist/assets/restaurant-digital-menu.png')).digest('hex');
  const loadedSource=await evaluate(`document.querySelector('.product-restaurant img').currentSrc`);
  assert.ok(loadedSource.endsWith('restaurant-digital-menu.webp?v='+pngHash.slice(0,12)));
  const served=Buffer.from(await(await fetch(loadedSource)).arrayBuffer());
  assert.deepEqual(served,await readFile('dist/assets/restaurant-digital-menu.webp'),'New optimized artwork is the actual served source');
  assert.equal(await text('.product-restaurant .product-title'),'Restaurant Digital Experience');
  assert.equal(await text('#interest option:nth-child(3)'),'Restaurant Digital Experience');
  assert.doesNotMatch(await text('.product-restaurant'),/Customer Relationship|CRM/);
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
  await waitFor(`Math.abs(document.querySelector('.product-restaurant').getBoundingClientRect().width-document.querySelector('.product-flow').getBoundingClientRect().width)<.5`);
  assert.equal(await evaluate(`Math.abs(document.querySelector('.product-restaurant').getBoundingClientRect().width-document.querySelector('.product-flow').getBoundingClientRect().width)<.5`),true,'Returns to collapsed width');
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
    assert.doesNotMatch(await text('.product-restaurant'),/Customer Relationship|CRM|客户关系管理|Gestion de la relation client/);
    await menuFlow();
    await evaluate(`document.querySelector('#restaurant-explore').focus()`);
    await key('Enter','Enter',13);
    await waitFor(`Boolean(document.querySelector('#restaurant-table-select'))`);await click('#restaurant-browse');
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
    await open();await menuFlow();await click('#restaurant-explore');await click('#restaurant-browse');
    assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').getAnimations({subtree:true}).length`),0);
    assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth <= innerWidth`),true);
    await screenshot(`menu-${width}`);
    await click('[data-dish="0"]');
    assert.equal(await evaluate(`document.querySelector('#restaurant-dialog').scrollWidth <= innerWidth`),true);
    await screenshot(`dish-${width}`);
    await click('#restaurant-dialog .restaurant-close');
    await waitFor(`!document.querySelector('#restaurant-dialog').open`);
  }
  for(const width of [1365,320]) await currencyFlow(width);
  for(const width of [1365,768,390,320]) await photoFlow(width);
  for(const width of [1365,768,390,320]) await journeyFlow(width);
  for(const lang of ['fr','zh']) await journeyFlow(390,lang);
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
  console.log('PASS: optional currency preview default-off, real five-second tick, full cycle, rounding, in-place updates, interaction/visibility stops, no duplicate intervals, retained currency, frozen confirmation; refreshed artwork, Peachlight Kitchen, tables, categories, dishes, repeated adds, quantities/removal, integer totals, cart/table persistence, empty/missing-table guards, single local confirmation snapshot, restart/reopen, guide actions, keyboard/focus, reduced motion, desktop/tablet/390/320px, translations, enquiry and Marketing. No browser exceptions or failed requests.');
} catch(error) {
  console.error('Browser errors:',errors,'Failed requests:',failures);throw error;
} finally {
  await fetch(`http://127.0.0.1:9227/json/close/${target.id}`);socket.close();
}
