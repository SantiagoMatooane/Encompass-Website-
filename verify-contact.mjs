// Read-only rendered contact checks; never submit forms or activate mailto links.
// Serve dist/ on port 4173 and start isolated Chrome debugging on port 9227.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base='http://127.0.0.1:4173';
const version=await(await fetch('http://127.0.0.1:9227/json/version')).json();
async function connect(url){
  const socket=new WebSocket(url);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let sequence=0;
  const pending=new Map();
  socket.onmessage=event=>{
    const message=JSON.parse(event.data);
    if(!message.id)return;
    const task=pending.get(message.id);pending.delete(message.id);
    if(message.error)task.reject(new Error(JSON.stringify(message.error)));else task.resolve(message.result);
  };
  return {socket,send:(method,params={})=>new Promise((resolve,reject)=>{
    const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));
  })};
}
const browser=await connect(version.webSocketDebuggerUrl);
const context=await browser.send('Target.createBrowserContext');
let page;
try{
  const {targetId}=await browser.send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});
  const targets=await(await fetch('http://127.0.0.1:9227/json/list')).json();
  page=await connect(targets.find(target=>target.id===targetId).webSocketDebuggerUrl);
  const evaluate=async expression=>{
    const result=await page.send('Runtime.evaluate',{expression,returnByValue:true});
    if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await page.send('Network.enable');await page.send('Network.setCacheDisabled',{cacheDisabled:true});
  for(const [path,email,phone,phoneLink,locations] of [
    ['/index.html','annele@encompass.studio','079 515 0130','+27795150130',{en:'South Africa',fr:'Afrique du Sud',zh:'\u5357\u975e'}],
    ['/marketing.html','santiago@encompass.studio','0759531545','0759531545',{en:'France',fr:'France',zh:'\u6cd5\u56fd'}]
  ]){
    await page.send('Page.navigate',{url:base+path});
    const deadline=Date.now()+20000;
    while(!await evaluate(`location.pathname===${JSON.stringify(path)}&&document.readyState==='complete'&&Boolean(document.querySelector('#auth-dialog'))`)){
      if(Date.now()>deadline)throw new Error('Contact page failed to initialize: '+path);
      await new Promise(resolve=>setTimeout(resolve,50));
    }
    for(const width of [1365,390,320]){
      await page.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
      for(const language of ['en','fr','zh','en']){
        await evaluate(`(()=>{const select=document.querySelector('#language');select.value=${JSON.stringify(language)};select.dispatchEvent(new Event('change'));document.querySelector('#contact').scrollIntoView({behavior:'instant'});})()`);
        const details=await evaluate(`(()=>{const node=document.querySelector('.contact-details');return {text:node.innerText,links:[...node.querySelectorAll('a')].map(link=>link.getAttribute('href')),location:node.querySelector('[data-t="southAfrica"],[data-t="france"]').textContent};})()`);
        assert.deepEqual(details.links,['mailto:'+email,'tel:'+phoneLink]);
        assert.ok(details.text.includes(email));assert.ok(details.text.includes(phone));
        assert.ok(!details.text.includes('gmail.com'));assert.equal(details.location,locations[language]);
      }
    }
  }
  const source=await readFile('dist/app.js','utf8');
  assert.ok(source.includes('location.href=`mailto:santiagomatooane3@gmail.com?subject='));
  console.log('PASS contacts: both divisions, desktop/390/320px, EN/FR/ZH/EN, exact public email/phone links and locations; unchanged mailto form recipient. No email opened or sent.');
}finally{
  await browser.send('Target.disposeBrowserContext',{browserContextId:context.browserContextId});
  page?.socket.close();browser.socket.close();
}
