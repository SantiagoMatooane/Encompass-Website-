/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import {api} from './session.js';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>{if(!v)return '';const d=new Date(v);return Number.isNaN(d.valueOf())?'':d.toLocaleDateString(undefined,{day:'numeric',month:'short'});};
async function load(){
 try{
  const [leadResponse,clientResponse]=await Promise.all([api('/api/leads?offset=0'),api('/api/clients')]);
  const [leadData,clientData]=await Promise.all([leadResponse.json(),clientResponse.json()]);
  if(!leadResponse.ok)throw new Error(leadData.error||'Unable to load your leads.');
  if(!clientResponse.ok)throw new Error(clientData.error||'Unable to load your clients.');
  const leads=leadData.leads||[],clients=clientData.clients||[];
  const leadCount=leadData.hasMore?`${leads.length}+`:String(leads.length);
  $('#lead-count').textContent=leadCount;
  $('#lead-caption').textContent=leadData.hasMore?'At least this many saved prospects':'Saved prospects in this workspace';
  $('#client-count').textContent=String(clients.length);
  $('#company-count').textContent=String(new Set(clients.map(c=>c.company?.id||c.company?.name?.trim().toLowerCase()).filter(Boolean)).size);
  $('#connection-label').textContent='Firebase · Belgium';$('#connection-dot').className='ready';
  $('#recent-leads').innerHTML=leads.length?leads.slice(0,7).map(lead=>`<a class="recent-row" href="/crm/leads.html"><span class="recent-person">${esc(lead.name||'Unnamed contact')}</span><span class="recent-company">${esc(lead.company?.name||'Company not provided')}</span><span class="recent-date">${esc(date(lead.createdAt))}</span></a>`).join(''):'<div class="recent-empty">No saved leads yet. <a href="/crm/discover.html">Discover your first prospects ↗</a></div>';
 }catch(error){$('#connection-label').textContent='Database unavailable';$('#connection-dot').className='';$('#recent-leads').innerHTML='<div class="recent-empty">Your workspace data could not be loaded. Refresh this page to try again.</div>';$('#dashboard-error').hidden=false;$('#dashboard-error').textContent=error.message||'The CRM could not load your workspace.';}
}
load();
