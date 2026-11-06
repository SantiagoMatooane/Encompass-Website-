// Dependency-free browser checks. Start the static preview and Chrome with
// --headless=new --remote-debugging-port=9227 --user-data-dir=<temporary-profile>.
// Run: node verify-auth.mjs
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
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push('Console error: '+message.params.args.map(arg=>arg.value||arg.description||'').join(' '));
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
  const deadline = Date.now() + 20000;
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
// No live accounts or emails: account-flow tests replace only the SDK adapter.
const mock = `
let observer,user=null;
window.authMock={failure:'',delay:0,verified:false,signupCalls:0};
const fail=async()=>{if(window.authMock.delay)await new Promise(r=>setTimeout(r,window.authMock.delay));if(window.authMock.failure){const code=window.authMock.failure;window.authMock.failure='';throw {code};}};
const persist=()=>{if(user)sessionStorage.setItem('auth-test-user',JSON.stringify(user));else sessionStorage.removeItem('auth-test-user');};
export async function initialiseAuth(){var initFailure=sessionStorage.getItem('auth-test-init-failure');if(initFailure){sessionStorage.removeItem('auth-test-init-failure');throw {code:initFailure};}await fail();user=JSON.parse(sessionStorage.getItem('auth-test-user')||'null');return {
 observe(next,error){observer=next;window.authMock.observerError=()=>error({code:'auth/network-request-failed'});setTimeout(()=>next(user),200);return ()=>{};},
 async signup(email,password){await fail();window.authMock.signupCalls++;user={uid:'fictional',displayName:null,email,emailVerified:false};persist();observer(user);return {user};},
 async login(email,password){await fail();user={uid:'fictional',displayName:'Fictional Tester',email,emailVerified:window.authMock.verified};persist();observer(user);return {user};},
 async profile(u,name){if(window.authMock.profileFailure){window.authMock.profileFailure=false;throw {code:'auth/network-request-failed'};}await fail();u.displayName=name;persist();},
 async verify(){if(window.authMock.emailFailure){window.authMock.emailFailure=false;throw {code:'auth/network-request-failed'};}await fail();},
 async reset(){await fail();},
 async reload(u){await fail();u.emailVerified=window.authMock.verified;persist();return u;},
 async logout(){await fail();user=null;persist();observer(null);}
};}`;
const sdkOnly=process.argv.includes('--sdk-only');
const emulator=process.argv.includes('--emulator');
if(!sdkOnly){
  await send('Fetch.enable',{patterns:[{urlPattern:emulator?'*/auth-config.js':'*/auth-firebase.js',requestStage:'Request'}]});
  const original=socket.onmessage;
  socket.onmessage=event=>{const message=JSON.parse(event.data);if(message.method==='Fetch.requestPaused'){send('Fetch.fulfillRequest',{requestId:message.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:Buffer.from(emulator?`export const firebaseConfig={apiKey:'fake-api-key',projectId:'demo-encompass-auth',authDomain:'demo-encompass-auth.firebaseapp.com'};export const AGENT_DESTINATION_URL=null;export const AUTH_EMULATOR_URL='http://127.0.0.1:9099';`:mock).toString('base64')}).catch(error=>console.error(error.message));}else original(event);};
}
const fill=(selector,value)=>evaluate(`var input=document.querySelector(${JSON.stringify(selector)});input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}));`);
const exists=selector=>`Boolean(document.querySelector(${JSON.stringify(selector)}))`;
async function open(){await click('#sign-in');await waitFor(exists('#auth-email'));}
async function submit(){await click('#auth-form button[type="submit"]');await waitFor(`document.querySelector('#auth-dialog').getAttribute('aria-busy')==='false'`);}
async function screenshot(name){const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(join(tmpdir(),`encompass-auth-${name}.png`),Buffer.from(shot.data,'base64'));}

async function emulatorFlow(){
  const email=`ui-${Date.now()}@example.invalid`;
  await open();await click('#auth-signup');
  await fill('#auth-name','Fictional Emulator Tester');await fill('#auth-email',email);await fill('#auth-password','Fictional123!');
  await submit();await waitFor(exists('#auth-check'));
  assert.match(await text('#auth-identity'),/Fictional Emulator Tester/);
  assert.match(await text('#auth-feedback'),/Verification email sent/);
  assert.equal(await evaluate(`document.querySelector('#auth-resend').disabled`),true);
  await click('#auth-check');await waitFor(`document.querySelector('#auth-feedback').textContent.includes('not verified')`);
  const codes=await(await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-encompass-auth/oobCodes')).json();
  const verification=codes.oobCodes.find(code=>code.email===email&&code.requestType==='VERIFY_EMAIL');
  assert.ok(verification,'Emulator received verification email');
  const verified=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({oobCode:verification.oobCode})});
  assert.equal(verified.status,200);
  await click('#auth-check');await waitFor(exists('#auth-find'));
  await send('Page.reload');await waitFor(`document.readyState==='complete' && Boolean(document.querySelector('#auth-find'))`);
  await click('#sign-in');assert.match(await text('#auth-identity'),/Fictional Emulator Tester/);
  await click('#auth-logout');await waitFor(exists('#auth-email'));
  await fill('#auth-email',email);await fill('#auth-password','WrongPassword123!');await submit();
  assert.match(await text('#auth-feedback'),/couldn.t log you in/);
  await fill('#auth-password','Fictional123!');
  await evaluate(`document.querySelector('#auth-password').focus()`);await key('Enter','Enter',13);
  await waitFor(exists('#auth-find'));
  await click('#auth-logout');await waitFor(exists('#auth-email'));await click('#auth-reset');await fill('#auth-email',email);await submit();
  assert.match(await text('#auth-feedback'),/If an account can receive/);
  const resetCodes=await(await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-encompass-auth/oobCodes')).json();
  assert.ok(resetCodes.oobCodes.some(code=>code.email===email&&code.requestType==='PASSWORD_RESET'));
  await fill('#auth-email','unknown-'+email);await submit();assert.match(await text('#auth-feedback'),/If an account can receive/);
  await click('#auth-login');await send('Page.reload');await waitFor(exists('#auth-email'));
  assert.equal(await evaluate(exists('#auth-find')),false);
  console.log('PASS AUTH EMULATOR: real Firebase SDK signup/updateProfile, emulator verification email/link/reload, verified session refresh, logout, invalid and valid login/Enter, reset privacy and emulator reset email. Demo project only; no live accounts or real emails.');
}

try {
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1365,height:900,deviceScaleFactor:1,mobile:false});
  await navigate('/');
  await waitFor(exists('#auth-dialog'));
  await evaluate(`var l=document.querySelector('#language');l.value='en';l.dispatchEvent(new Event('change'));`);
  if(sdkOnly){
    await click('#sign-in');await waitFor(`${exists('#auth-email')} || ${exists('#auth-retry')}`);
    assert.equal(await evaluate(exists('#auth-email')),true,'Real Firebase SDK initialises and initial signed-out observer resolves');
    console.log('PASS LIVE READ-ONLY: Firebase 13.1.0 modules load, initialise, configure session persistence and resolve signed-out observer. No accounts or emails created.');
  }else if(emulator){
    await emulatorFlow();
  }else{
    await click('#sign-in');
    // Initial observer gating: never show welcome before the observer resolves.
    assert.equal(await evaluate(exists('#auth-find')),false);
    await waitFor(exists('#auth-email'));
    await screenshot('login-desktop');
    await click('#auth-signup');await screenshot('signup-desktop');
    await click('#auth-form button[type="submit"]');
    assert.equal(await evaluate(`document.querySelector('#auth-name').validity.valueMissing`),true);
    await fill('#auth-name','<img src=x onerror=alert(1)>');await fill('#auth-email','invalid-email');await click('#auth-form button[type="submit"]');assert.equal(await evaluate(`document.querySelector('#auth-email').validity.typeMismatch`),true);assert.equal(await evaluate(`authMock.signupCalls`),0);await fill('#auth-email','fictional@example.invalid');await fill('#auth-password','Fictional123!');
    await click('#auth-show');assert.equal(await evaluate(`document.querySelector('#auth-password').type`),'text');await click('#auth-show');
    await evaluate(`authMock.profileFailure=true;authMock.emailFailure=true;authMock.delay=150;`);
    await click('#auth-form button[type="submit"]');
    assert.equal(await evaluate(`document.querySelector('#auth-form button[type="submit"]').disabled`),true);
    await click('#auth-form button[type="submit"]');
    await waitFor(exists('#auth-profile'));
    assert.match(await text('#auth-feedback'),/account was created|account exists/);
    assert.equal(await evaluate(`authMock.signupCalls`),1);
    assert.equal(await evaluate(`document.querySelector('#auth-resend').disabled`),true);
    await screenshot('partial-signup');
    await fill('#auth-recovery-name','<img src=x onerror=alert(1)>');await click('#auth-profile button');
    await waitFor(`!document.querySelector('#auth-profile')`);
    assert.match(await text('#auth-identity'),/<img src=x/);
    assert.equal(await evaluate(exists('#auth-identity img')),false,'Name is text, never HTML');
    await evaluate(`window.originalDateNow=Date.now;Date.now=()=>originalDateNow()+61000`);
    await waitFor(`!document.querySelector('#auth-resend').disabled`);await click('#auth-resend');await waitFor(`document.querySelector('#auth-feedback').textContent.includes('Verification email sent')`);assert.equal(await evaluate(`document.querySelector('#auth-resend').disabled`),true);
    await click('#auth-check');await waitFor(`document.querySelector('#auth-feedback').textContent.includes('not verified')`);
    assert.equal(await evaluate(exists('#auth-find')),false);
    await evaluate(`authMock.verified=true`);await click('#auth-check');await waitFor(exists('#auth-find'));
    assert.equal(await evaluate(`document.querySelector('#auth-find').disabled`),true);
    await screenshot('welcome-desktop');
    await send('Page.reload');await waitFor(`document.readyState==='complete' && Boolean(document.querySelector('#auth-find'))`);
    await click('#sign-in');assert.equal(await evaluate(`document.querySelector('#auth-find').disabled`),true);
    await click('#auth-logout');await waitFor(exists('#auth-email'));
    assert.equal(await evaluate(exists('#auth-find')),false);
    for(const code of ['auth/invalid-credential','auth/network-request-failed','auth/too-many-requests']){
      await fill('#auth-email','fictional@example.invalid');await fill('#auth-password','Fictional123!');await evaluate(`authMock.failure='${code}'`);await submit();
      assert.notEqual(await text('#auth-feedback'),'');assert.equal(await evaluate(`document.querySelector('#auth-form button[type="submit"]').disabled`),false);
    }
    await click('#auth-reset');await fill('#auth-email','unknown@example.invalid');await evaluate(`authMock.failure='auth/user-not-found'`);await submit();
    assert.match(await text('#auth-feedback'),/If an account can receive/);
    await screenshot('reset-desktop');await click('#auth-login');
    await evaluate(`document.querySelector('#auth-email').focus()`);await key('Escape','Escape',27);await waitFor(`!document.querySelector('#auth-dialog').open`);await waitFor(`document.activeElement.id==='sign-in'`);
    for(const width of [390,320]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
      await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await open();if(!await evaluate(exists('#auth-name')))await click('#auth-signup');
      for(const lang of ['en','fr','zh']){
        await evaluate(`var l=document.querySelector('#language');l.value='${lang}';l.dispatchEvent(new Event('change'));`);
        assert.equal(await evaluate(`document.querySelector('#auth-dialog').scrollWidth <= innerWidth`),true);
        assert.doesNotMatch(await text('#auth-dialog'),/undefined|\?\?\?/);
      }
      await evaluate(`var l=document.querySelector('#language');l.value='en';l.dispatchEvent(new Event('change'));`);
      await screenshot(`signup-${width}`);
      for(let i=0;i<15;i++){await key('Tab','Tab',9);assert.equal(await evaluate(`document.querySelector('#auth-dialog').contains(document.activeElement)`),true);}
      await click('#auth-return');await waitFor(`document.activeElement.id==='sign-in'`);
    }
    await evaluate(`authMock.observerError()`);await waitFor(exists('#auth-retry'));assert.equal(await evaluate(exists('#auth-find')),false);await click('#auth-retry');await waitFor(exists('#auth-email'));
    await evaluate(`sessionStorage.setItem('auth-test-init-failure','auth/sdk-unavailable')`);await send('Page.reload');await waitFor(exists('#auth-retry'));await click('#sign-in');await screenshot('sdk-failure');await click('#auth-retry');await waitFor(exists('#auth-email'));
    await navigate('/marketing.html');await open();assert.equal(await text('#auth-title'),'Log in');
    await fill('#auth-email','fictional@example.invalid');await fill('#auth-password','Fictional123!');await submit();await waitFor(exists('#auth-check'));
    await screenshot('pending-mobile');await click('#auth-logout');await waitFor(exists('#auth-email'));
    console.log('PASS MOCKED: form views, validation, password visibility, duplicate prevention, partial signup recovery, safe identity rendering, real-state verification gating, mocked refresh/logout, reset privacy, errors, mobile/320px, translations, keyboard/Escape/focus and both divisions. No live accounts or emails.');
  }
  assert.deepEqual(errors,[],'Browser exceptions');
  assert.deepEqual(failures,[],'Unexpected failed network requests');
}catch(error){console.error('Exceptions:',errors,'Failed requests:',failures);console.error('Visible feedback:',await text('#auth-feedback'));throw error;}
finally{await fetch(`http://127.0.0.1:9227/json/close/${target.id}`);socket.close();}
