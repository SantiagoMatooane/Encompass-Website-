import {initialiseAuth} from './auth-firebase.js';
const $=s=>document.querySelector(s),auth=await initialiseAuth();
const user=await new Promise((resolve,reject)=>auth.observe(resolve,reject));
let data;
async function request(path,body){
  if(!user?.emailVerified)throw Error('Sign in with your verified owner account first. Use the Account link above.');
  const res=await fetch('/api/admin/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+await user.getIdToken(),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const result=await res.json();if(!res.ok)throw Error(result.error||'Request failed.');return result;
}
async function load(){
 data=await request('access');$('#controls').hidden=false;
 const selected=$('#companies').value;$('#companies').replaceChildren();
 for(const c of data.companies){const option=document.createElement('option');option.value=c.id;option.textContent=c.name;$('#companies').append(option);}
 if(data.companies.some(c=>c.id===selected))$('#companies').value=selected;
 $('#invitations').replaceChildren();
 for(const i of data.invitations){
  const item=document.createElement('article');item.className='invitation';
  const title=document.createElement('strong');title.textContent=i.email;
  const detail=document.createElement('p');detail.textContent=`${data.companies.find(c=>c.id.replaceAll('-','')===i.workspaceId.replaceAll('-',''))?.name||'Company'} · ${!i.active?'Revoked':i.expiresAt<=Date.now()?'Expired':i.verified?'Active':'Awaiting email verification'} · Ends ${new Date(i.expiresAt).toISOString().slice(0,10)} (UTC)`;
  item.append(title,detail);
  if(i.active){const button=document.createElement('button');button.textContent='Revoke access';button.onclick=()=>run(async()=>{await request('revoke',{uid:i.uid});await load();return 'Access revoked for '+i.email;});item.append(button);}
  $('#invitations').append(item);
 }
}
async function run(action){
 document.body.setAttribute('aria-busy','true');document.querySelectorAll('button').forEach(b=>b.disabled=true);
 try{$('#message').textContent=await action()||'';}catch(e){$('#message').textContent=e.message;}
 finally{document.body.setAttribute('aria-busy','false');document.querySelectorAll('button').forEach(b=>b.disabled=false);}
}
$('#expiry').value=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
$('#company').onsubmit=e=>{e.preventDefault();run(async()=>{const result=await request('companies',Object.fromEntries(new FormData(e.target)));await load();$('#companies').value=result.id;e.target.reset();return 'Company workspace created.';});};
$('#invite').onsubmit=e=>{e.preventDefault();run(async()=>{const input=Object.fromEntries(new FormData(e.target));input.expiresAt+='T00:00:00.000Z';const result=await request('invitations',input);await load();$('#delivery').hidden=false;$('#delivery-note').textContent='Nothing has been emailed automatically.';$('#invitation-text').value=`You have free testing access to Encompass until ${input.expiresAt.slice(0,10)} (UTC).\n\n${result.setupLink?'Set your password using this private link:\n'+result.setupLink+'\n\n':'Use your existing password, or choose Forgot password.\n\n'}Sign in at ${location.origin}/?open-crm=1 with ${result.email}. Verify your email if prompted, then choose Open CRM. No payment is required.`;return 'Invitation created. Share the instructions below with the invited person.';});};
$('#copy').onclick=()=>run(async()=>{await navigator.clipboard.writeText($('#invitation-text').value);return 'Invitation instructions copied.';});
await run(async()=>{await load();return 'Owner access confirmed.';});
