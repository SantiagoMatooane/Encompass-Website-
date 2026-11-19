import {api,storageKey} from './session.js';
const $ = s => document.querySelector(s);
const paths={dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',clients:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',leads:'M9 3h6 M9 3v4h6V3 M9 5H5v16h14V5h-4 M8 12h8 M8 16h5',marketing:'M3 10v4h4l10 5V5L7 10H3 M7 14l2 7h3 M21 9v6',spark:'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',moon:'M20.7 13A9 9 0 0 1 11 3.3 9 9 0 1 0 20.7 13',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5',search:'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',refresh:'M20 7a9 9 0 1 0 1 9 M20 3v5h-5',shield:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',note:'M14 3H5v18h14V8z M14 3v5h5 M8 12h8 M8 16h5',email:'M3 5h18v14H3z M3 5l9 7 9-7',call:'M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4c-8 5-23-10-16-16z',close:'M6 6l12 12 M6 18L18 6',plus:'M12 5v14 M5 12h14'};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.leads}"/></svg>`;
for(const el of document.querySelectorAll('[data-icon]'))el.innerHTML=icon(el.dataset.icon);
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials = name => name.split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]).join('').toUpperCase();
const demoRows = [
 ['Amelia Carter','Northline Studio','Head of Operations','amelia@northline.example','+44 20 0000 0101',4,'Sample: a decision-maker has requested a proposal.'],
 ['James Okafor','Meridian Works','Managing Director','james@meridian.example','+27 11 000 0102',3,'Sample: the company announced a relevant expansion.'],
 ['Sophie Laurent','Atelier Groupe','Commercial Director','sophie@atelier.example','+33 1 00 00 01 03',2,'Sample: a new leadership appointment may be relevant.'],
 ['Daniel Meyer','Forma Systems','Founder','daniel@forma.example',null,4,'Sample: a prospect has described a current project need.'],
 ['Naledi Mokoena','Kora Collective','Operations Manager','naledi@kora.example','+27 21 000 0105',1,'Sample: a broad company update provides weak evidence.'],
 ['Oliver Bennett','Fieldwork Co.','Head of Growth',null,null,null,null],
 ['Emma Visser','Luma Partners','Managing Partner','emma@luma.example','+31 20 000 0107',3,'Sample: hiring suggests investment in a relevant function.']
].map(([name,company,position,email,phone,buyingSignalScore,buyingSignalReason],i)=>({id:`sample-${i}`,name,company:{name:company},position,email,phone,buyingSignalScore,buyingSignalReason,buyingSignalVerified:false}));
let rows=[],selected=null,demo=false,offset=0,hasMore=false,loading=false,requestVersion=0,promoting=false,error='',toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),5000);}
function signal(row){const n=row.buyingSignalScore;if(!Number.isInteger(n)||n<1||n>5)return '<span class="muted-cell">— <small>Not assessed</small></span>';return `<span class="signal ${n>=4?'high':''}" aria-label="Buying signal ${n} out of 5"><span class="signal-bars" aria-hidden="true">${[1,2,3,4,5].map(v=>`<i class="${v<=n?'on':''}"></i>`).join('')}</span><b>${n}<small>/5</small></b></span>`;}
function render(){
 const query=$('#search').value.trim().toLowerCase();
 const shown=rows.filter(r=>[r.name,r.company?.name,r.email,r.phone,r.position].some(v=>String(v||'').toLowerCase().includes(query)));
 $('#rows').innerHTML=shown.map(r=>`<tr data-lead="${esc(r.id)}" class="${selected?.id===r.id?'selected':''}"><td><div class="person-cell"><span class="initials">${esc(initials(r.name))}</span><div><span class="person-name">${esc(r.name)}</span><span class="person-role">${esc(r.position||'Role not provided')}${r.sources?.length?' · PDL':''}</span></div></div></td><td>${esc(r.company?.name||'—')}</td><td class="muted-cell">${esc(r.email||'Not available')}</td><td class="muted-cell">${esc(r.phone||'Not available')}</td><td><button class="contact-button" data-contact="${esc(r.id)}" aria-label="Contact ${esc(r.name)}" aria-expanded="${selected?.id===r.id}">Contact<span>↗</span></button></td></tr>`).join('');
 $('#count').textContent=loading?'—':String(rows.length);
 $('#sample-banner').hidden=!demo;$('#demo').hidden=demo;$('#refresh').disabled=loading||promoting;$('#demo').disabled=loading||promoting;$('#live').disabled=promoting;$('#search').disabled=loading;
 $('#empty').hidden=shown.length>0;
 if(!shown.length){const title=loading?'Loading your leads…':error?'Connection needs attention':query?'No matching leads on this page':demo?'All sample leads added':'A fresh start for your pipeline.';
 const message=loading?'Connecting to your European database.':error?error:query?'Try another name, company or email.':demo?'Return to live leads or reload the sample preview.':'Your saved leads will appear here. Open the ICP agent to define who you want to reach.';
 $('#empty').innerHTML=`<span class="empty-icon">${icon(error?'refresh':'leads')}</span><h3>${title}</h3><p>${esc(message)}</p>${!loading&&!query?error?'<button id="retry">Try again</button>':demo?'':'<a href="/crm/index.html">Open ICP agent ↗</a>':''}`;
 $('#retry')?.addEventListener('click',load);
 }
 $('#page-info').textContent=loading?'Fetching leads':error?'Database unavailable':query?`${shown.length} matches on this page`:rows.length?`${offset+1}–${offset+rows.length} ${demo?'sample leads':'leads'}`:'No leads yet';
 $('#page-number').textContent=`Page ${Math.floor(offset/20)+1}`;$('#previous').disabled=loading||promoting||demo||offset===0;$('#next').disabled=loading||promoting||demo||!hasMore;
}
function closePanel(restore=true){const id=selected?.id;selected=null;$('#contact-panel').hidden=true;document.body.classList.remove('panel-open');render();if(restore&&id){const btn=[...document.querySelectorAll('[data-contact]')].find(b=>b.dataset.contact===id);(btn||$('#leads-title')).focus();}}
function savedObservations(row){
 try{
  const draft=JSON.parse(localStorage.getItem(storageKey('encompass-icp-v1')) || 'null');
  if(!draft || Boolean(draft.demo)!==demo || !row.company?.name)return '';
  const company=row.company.name.trim().toLowerCase();
  return (draft.savedObservations ?? draft.signals ?? []).filter(item=>item.company?.trim().toLowerCase()===company).map(item=>
    `<div class="evidence-box"><span class="detail-label">Company observation · user-reported</span><p>${esc(item.observation)}</p><p>${esc(item.relevance)}</p><p>${esc(item.date)} · ${esc(item.source)}</p></div>`
  ).join('');
 }catch{return ''}
}
function openPanel(row){selected=row;const panel=$('#contact-panel');panel.hidden=false;document.body.classList.add('panel-open');render();
 const evidenceUrl=(()=>{try{const u=new URL(row.buyingSignalSourceUrl);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}})();
 panel.innerHTML=`<div class="panel-top"><p class="eyebrow">${demo?'SAMPLE CONTACT':'CONTACT PROFILE'}</p><button id="close-panel" class="icon-button" aria-label="Close contact panel">${icon('close')}</button></div><div class="initials large-avatar">${esc(initials(row.name))}</div><h2>${esc(row.name)}</h2><p class="panel-role">${esc(row.position||'Role not provided')}</p><div class="contact-details"><div><span class="detail-label">Company</span><span class="detail-value">${esc(row.company?.name||'Not available')}</span></div><div><span class="detail-label">Email</span><span class="detail-value">${esc(row.email||'Not available')}</span></div><div><span class="detail-label">Phone number</span><span class="detail-value">${esc(row.phone||'Not available')}</span></div><div><span class="detail-label">Source</span><span class="detail-value">${esc((row.sources||[]).map(s=>s.provider+' · '+s.providerRecordId+' · '+new Date(s.retrievedAt).toLocaleDateString()).join('; ')||'Manual / source not recorded')}</span></div></div><div class="quick-actions">${['Note','Email','Call'].map(name=>`<button disabled title="${name} is coming later"><span class="circle">${icon(name.toLowerCase())}</span>${name}</button>`).join('')}</div><p class="soon-note">Notes, email and calling are coming soon.</p><button id="add-client" class="primary add-client">${icon('plus')}Add to Client</button><p class="panel-helper">${demo?'Preview only. This sample will not be saved to Firebase.':'Save this relationship as a client. Their details and history stay together.'}</p><div class="evidence-box"><span class="detail-label">Buying signal</span>${signal(row)}<p>${esc(row.buyingSignalReason||'No buying-signal evidence has been recorded for this lead.')}</p>${row.buyingSignalScore?`<p>${row.buyingSignalVerified?'Verified evidence':'Unverified evidence'}${row.buyingSignalObservedAt?' · '+esc(new Date(row.buyingSignalObservedAt).toLocaleDateString()):''}</p>`:''}${evidenceUrl?`<a href="${esc(evidenceUrl)}" target="_blank" rel="noopener noreferrer">View source ↗</a>`:''}</div>${savedObservations(row)}`;
 $('#close-panel').addEventListener('click',()=>closePanel());$('#add-client').addEventListener('click',promote);$('#close-panel').focus();
}
async function load(){const version=++requestVersion;loading=true;error='';rows=[];closePanel(false);render();try{const res=await api(`/api/leads?offset=${offset}`);const data=await res.json();if(version!==requestVersion)return;if(!res.ok)throw Error(data.error||'Unable to load leads.');rows=data.leads;hasMore=data.hasMore;$('#connection-label').textContent='Firebase · Belgium';$('#connection-dot').className='ready';}catch(err){if(version!==requestVersion)return;error=err.message;hasMore=false;$('#connection-label').textContent='Database unavailable';$('#connection-dot').className='';}finally{if(version===requestVersion){loading=false;render();}}}
async function promote(){if(promoting||!selected)return;const row=selected;promoting=true;$('#add-client').disabled=true;$('#add-client').textContent='Adding…';render();try{if(!demo){const res=await api(`/api/leads/${encodeURIComponent(row.id)}/client`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const result=await res.json();if(!res.ok)throw Error(result.error||'Unable to add this client.');}
 rows=rows.filter(r=>r.id!==row.id);closePanel(false);toast(demo?`${row.name} added in this sample preview only.`:`${row.name} is now a client. Their record has been saved.`);if(!demo){location.assign('/crm/clients.html?added='+encodeURIComponent(row.id));}
 }catch(err){toast(err.message);if(selected?.id===row.id){$('#add-client').disabled=false;$('#add-client').innerHTML=icon('plus')+'Add to Client';}}finally{promoting=false;render();}}
$('#rows').addEventListener('click',e=>{const item=e.target.closest('[data-lead]');if(item&&!promoting){const row=rows.find(r=>r.id===item.dataset.lead);if(row)openPanel(row);}});
$('#search').addEventListener('input',render);$('#refresh').addEventListener('click',()=>{if(demo){rows=structuredClone(demoRows);closePanel(false);render();}else load();});
$('#demo').addEventListener('click',()=>{++requestVersion;demo=true;loading=false;error='';offset=0;hasMore=false;rows=structuredClone(demoRows);$('#search').value='';closePanel(false);render();});
$('#live').addEventListener('click',()=>{demo=false;offset=0;$('#search').value='';load();});
$('#previous').addEventListener('click',()=>{offset=Math.max(0,offset-20);$('#search').value='';load();});$('#next').addEventListener('click',()=>{offset+=20;$('#search').value='';load();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected&&!promoting)closePanel();});
load();
