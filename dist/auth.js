import {initialiseAuth} from './auth-firebase.js';
import {authCopy} from './auth-copy.js';

const entry=document.querySelector('#sign-in');
const dialog=document.createElement('dialog');
dialog.id='auth-dialog';dialog.setAttribute('aria-labelledby','auth-title');
const panel=document.createElement('div');
const feedback=document.createElement('p');feedback.id='auth-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');feedback.setAttribute('aria-atomic','true');
dialog.append(panel,feedback);document.body.append(dialog);
const state={ready:false,api:null,user:null,view:'login',busy:false,status:'',error:'',initError:'',profileRecovery:false,recoveryName:'',emailDraft:'',nameDraft:'',resendAt:0};
const t=()=>authCopy[document.documentElement.lang]||authCopy.en;
const language=()=>['fr','zh'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
let unsubscribe,initialising;
function errorKey(error) {
  const code=error?.code||'';
  if(['auth/invalid-credential','auth/invalid-login-credentials','auth/wrong-password','auth/user-not-found','auth/user-disabled'].includes(code))return 'credentials';
  if(code==='auth/email-already-in-use')return 'emailUsed';
  if(['auth/weak-password','auth/password-does-not-meet-requirements'].includes(code))return 'weak';
  if(code==='auth/invalid-email')return 'required';
  if(code==='auth/network-request-failed')return 'network';
  if(code==='auth/too-many-requests')return 'throttled';
  if(code==='auth/sdk-unavailable')return 'sdk';
  return 'unavailable';
}
function updateEntry() {
  const c=t(),span=entry.querySelector('[data-t="signin"]');
  if(span)span.textContent=state.ready&&state.user?c.account:c.login;
  entry.setAttribute('aria-label',state.ready&&state.user?c.account:c.signInLabel);
}
function chooseUserView(){state.view=state.user?(state.user.emailVerified?'welcome':'pending'):'login';}
function announce(){feedback.textContent=[state.error?t()[state.error]:'',state.status?t()[state.status]:''].filter(Boolean).join(' ');feedback.classList.toggle('auth-error',Boolean(state.error));}
function render(focus=false) {
  const c=t();updateEntry();
  const view=!state.ready?'loading':state.user?(state.user.emailVerified?'welcome':'pending'):state.view;
  let content='';
  const button=(id,label,extra='')=>`<button type="button" id="${id}" ${extra}>${label}</button>`;
  const emailField=`<label for="auth-email">${c.email}</label><input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="254" autocapitalize="none" spellcheck="false">`;
  if(view==='loading')content=`<h2 id="auth-title" tabindex="-1">${c.loading}</h2>${state.initError?`<p>${c[state.initError]}</p>${button('auth-retry',c.retry)}`:'<div class="auth-loading" aria-hidden="true"></div>'}`;
  if(['login','signup','reset'].includes(view))content=`<h2 id="auth-title" tabindex="-1">${c[view]}</h2><form id="auth-form" novalidate>${view==='signup'?`<label for="auth-name">${c.name}</label><input id="auth-name" name="name" autocomplete="name" required maxlength="100">`:''}${emailField}${view!=='reset'?`<label for="auth-password">${c.password}</label><div class="auth-password"><input id="auth-password" name="password" type="password" autocomplete="${view==='signup'?'new-password':'current-password'}" required ${view==='signup'?'minlength="6"':''}><button type="button" id="auth-show" aria-controls="auth-password" aria-pressed="false">${c.show}</button></div>${view==='signup'?`<p class="auth-note">${c.passwordHint}</p>`:''}`:''}<button type="submit" class="auth-primary">${view==='reset'?c.sendReset:c[view]}</button></form>${view==='login'?`${button('auth-reset',c.forgot,'class="auth-link"')}<p class="auth-switch">${c.newAccount} ${button('auth-signup',c.signup,'class="auth-link"')}</p>`:button('auth-login',view==='signup'?c.existing+' '+c.login:c.backLogin,'class="auth-link"')}`;
  if(view==='pending')content=`<h2 id="auth-title" tabindex="-1">${c.pending}</h2><p>${c.pendingText}</p><p id="auth-identity" class="auth-identity"></p>${state.profileRecovery||!state.user.displayName?`<p class="auth-notice">${c.partialProfile}</p><form id="auth-profile"><label for="auth-recovery-name">${c.name}</label><input id="auth-recovery-name" name="name" autocomplete="name" required maxlength="100"><button type="submit">${c.saveName}</button></form>`:''}<div class="auth-actions">${button('auth-check',c.verifiedCheck,'class="auth-primary"')}${button('auth-resend',c.resend)}<p id="auth-cooldown" class="auth-note"></p></div>${button('auth-logout',c.logout,'class="auth-link"')}`;
  if(view==='welcome')content=`<p class="auth-eyebrow">${c.account}</p><h2 id="auth-title" tabindex="-1">${c.welcome}</h2><p>${c.welcomeText}</p><p id="auth-identity" class="auth-identity"></p>${state.profileRecovery||!state.user.displayName?`<p class="auth-notice">${c.partialProfile}</p><form id="auth-profile"><label for="auth-recovery-name">${c.name}</label><input id="auth-recovery-name" name="name" autocomplete="name" required maxlength="100"><button type="submit">${c.saveName}</button></form>`:''}<button type="button" id="auth-find" disabled aria-describedby="auth-coming">${c.find}</button><p id="auth-coming" class="auth-note">${c.coming}</p>${button('auth-logout',c.logout,'class="auth-link"')}`;
  panel.innerHTML=`<button type="button" class="auth-close" aria-label="${c.close}">×</button><p class="auth-eyebrow">ENCOMPASS CORP.</p>${content}<button type="button" id="auth-return" class="auth-return">${c.returnSite} ↗</button>`;
  const identity=panel.querySelector('#auth-identity');
  if(identity)identity.textContent=[state.user.displayName,state.user.email].filter(Boolean).join(' · ');
  const recovery=panel.querySelector('#auth-recovery-name');if(recovery)recovery.value=state.recoveryName;
  const emailInput=panel.querySelector('#auth-email');if(emailInput)emailInput.value=state.emailDraft;
  const nameInput=panel.querySelector('#auth-name');if(nameInput)nameInput.value=state.nameDraft;
  panel.querySelector('.auth-close').onclick=()=>dialog.close();panel.querySelector('#auth-return').onclick=()=>dialog.close();
  const wire=(id,action)=>{const element=panel.querySelector('#'+id);if(element)element.onclick=action;};
  for(const viewName of ['login','signup','reset'])wire('auth-'+viewName,()=>{if(state.busy)return;state.view=viewName;state.status='';state.error='';render(true);});
  wire('auth-retry',()=>{if(state.initError==='sdk')location.reload();else start();});
  wire('auth-show',()=>{const input=panel.querySelector('#auth-password'),control=panel.querySelector('#auth-show');const showing=input.type==='password';input.type=showing?'text':'password';control.textContent=showing?c.hide:c.show;control.setAttribute('aria-pressed',String(showing));});
  const form=panel.querySelector('#auth-form');if(form)form.onsubmit=submit;
  const profile=panel.querySelector('#auth-profile');if(profile)profile.onsubmit=event=>{event.preventDefault();if(!profile.reportValidity())return;const name=recovery.value.trim();if(!name){state.error='required';announce();return;}run(async()=>{await state.api.profile(state.user,name);state.profileRecovery=false;state.recoveryName='';state.status='nameSaved';});};
  wire('auth-logout',()=>run(async()=>{await state.api.logout();state.user=null;state.profileRecovery=false;state.recoveryName='';state.status='';state.error='';chooseUserView();}));
  wire('auth-check',()=>run(async()=>{state.user=await state.api.reload(state.user);state.status=state.user?.emailVerified?'':'notVerified';chooseUserView();}));
  wire('auth-resend',()=>{if(Date.now()<state.resendAt)return;run(async()=>{await sendVerification();state.status='verificationSent';});});
  lockControls();tick();announce();
  if(focus&&dialog.open)panel.querySelector('#auth-title').focus({preventScroll:true});
}
function lockControls(){
  dialog.setAttribute('aria-busy',String(state.busy));
  panel.querySelectorAll('input,button').forEach(element=>{if(element.matches('.auth-close,#auth-return,#auth-find'))return;element.disabled=state.busy;});
  const submitButton=panel.querySelector('#auth-form button[type="submit"]');if(submitButton&&state.busy)submitButton.textContent=t().working;
}
function tick(){
  const resend=panel.querySelector('#auth-resend'),note=panel.querySelector('#auth-cooldown');if(!resend)return;
  const seconds=Math.max(0,Math.ceil((state.resendAt-Date.now())/1000));resend.disabled=state.busy||seconds>0;
  note.textContent=seconds?t().cooldown.replace('{seconds}',String(seconds)):'';
}
setInterval(tick,1000);
async function sendVerification(){state.resendAt=Date.now()+60000;await state.api.verify(state.user,language());}
async function run(action){
  if(state.busy||!state.ready)return;
  state.busy=true;state.error='';state.status='';lockControls();announce();
  try{await action();}catch(error){state.error=errorKey(error);if(state.error==='throttled')state.resendAt=Math.max(state.resendAt,Date.now()+60000);}
  finally{state.busy=false;render(true);}
}
async function submit(event){
  event.preventDefault();if(state.busy)return;
  const form=event.currentTarget,view=state.view;
  if(!form.reportValidity()){state.error='required';announce();return;}
  const values=new FormData(form),email=String(values.get('email')||'').trim(),password=String(values.get('password')||''),name=String(values.get('name')||'').trim();
  state.emailDraft=email;if(view==='signup')state.nameDraft=name;
  if(view==='signup'&&!name){state.error='required';announce();return;}
  await run(async()=>{
    if(view==='reset'){
      try{await state.api.reset(email,language());}catch(error){if(!['auth/user-not-found','auth/invalid-credential'].includes(error.code))throw error;}
      state.status='resetSent';return;
    }
    if(view==='login'){state.user=(await state.api.login(email,password)).user;chooseUserView();return;}
    // Account creation is a success boundary. Later failures never restart signup.
    state.user=(await state.api.signup(email,password)).user;chooseUserView();
    try{await state.api.profile(state.user,name);}catch{state.profileRecovery=true;state.recoveryName=name;state.error='partialProfile';}
    try{await sendVerification();state.status='verificationSent';}catch{state.status='partialEmail';}
  });
}
async function start(){
  if(initialising)return initialising;
  state.ready=false;state.initError='';render();
  initialising=(async()=>{
    try{
      state.api=await initialiseAuth();if(unsubscribe)unsubscribe();
      unsubscribe=state.api.observe(user=>{state.user=user;state.ready=true;state.initError='';chooseUserView();updateEntry();if(!state.busy)render();},()=>{state.ready=false;state.initError='session';if(!state.busy)render();});
    }catch(error){state.initError=errorKey(error);render();}
    finally{initialising=undefined;}
  })();return initialising;
}
function openAuth(){
  document.querySelectorAll('dialog[open]').forEach(other=>{if(other!==dialog)other.close();});
  state.error='';state.status='';render();if(!dialog.open){dialog.showModal();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)dialog.animate([{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:160,easing:'ease-out'});}dialog.scrollTop=0;panel.querySelector('#auth-title').focus({preventScroll:true});
}
entry.onclick=openAuth;
dialog.addEventListener('close',()=>{panel.querySelectorAll('input[type="password"],#auth-password').forEach(input=>input.value='');entry.focus({preventScroll:true});});
dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...panel.querySelectorAll('button:not(:disabled),input:not(:disabled)')],first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&(document.activeElement===first||document.activeElement.id==='auth-title')){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
document.querySelector('#language').addEventListener('change',()=>{updateEntry();if(dialog.open)render(true);});
render();start();
