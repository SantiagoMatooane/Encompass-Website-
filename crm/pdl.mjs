import {functionPhrases,detectFunctions} from './public/functions.js';
import {validateInput} from './agent.mjs';
import {sizeBands,terms} from './public/profile.js';
const split = value => [...new Set(terms(value).map(term=>term.toLowerCase()))];
const levels={'Owner / Founder':['owner'], 'C-level':['cxo'],'VP':['vp'],'Director':['director'],'Manager':['manager'],'Individual contributor':['entry','senior']};
export function buildPlan(input) {
 const w=validateInput(input), rules=[], review=[], requested=[];
 const add=(field,values,label,exclude=false)=>{if(values.length)rules.push({field,values,label,exclude});};
 for(const group of ['company','person','anti'])for(const [key,value] of Object.entries(w[group]))if(value.trim())requested.push({group,key,value});
 for(const group of ['company','person']) {
  add('job_company_industry',split(w[group].industries),group+' industry');
  add(group==='company'?'job_company_location_country':'location_country',split(w[group].locations),group==='company'?'Company country':'Person country');
  for(const key of ['technologies','funding','budget','languages','role'])if(w[group][key])review.push(`${group}.${key}: ${w[group][key]} — manual review required`);
 }
 if(w.company.sizes){
  const labels=w.company.sizes.split('|');
  if(labels.some(label=>!Object.hasOwn(sizeBands,label)))throw Error('Choose a listed company size.');
  rules.push({field:'job_company_employee_count',ranges:labels.map(label=>sizeBands[label]),values:labels,label:'Company size'});
 }
 const functions=[...new Set(terms(w.person.functions))];
 if(functions.some(label=>!Object.hasOwn(functionPhrases,label)))throw Error('Choose a listed business function.');
 const titles=split(w.person.titles);
 if(functions.length){
  rules.push({functions,titles,values:[...functions,...titles],label:'Business functions and selected titles'});
 }else add('job_title',titles,'Job title');
 add('job_title_role',split(w.person.function),'Department');
 if(w.person.seniority){if(levels[w.person.seniority])add('job_title_levels',levels[w.person.seniority],'Seniority');else review.push('Seniority: '+w.person.seniority+' — manual review required');}
 add('job_company_industry',split(w.anti.industries),'Excluded industry',true);
 add('job_company_location_country',split(w.anti.locations),'Excluded company country',true);
 for(const v of split(w.anti.companies))add(v.includes('.')?'job_company_website':'job_company_name',[v.replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/$/,'')],'Excluded company',true);
 for(const key of ['technologies','funding','reasons'])if(w.anti[key])review.push(`Exclusion ${key}: ${w.anti[key]} — must be checked before import`);
 for(const key of ['belowEmployees','aboveEmployees'])if(w.anti[key]&&!/^\d+$/.test(w.anti[key]))throw Error('Exclusion headcounts must be nonnegative whole numbers.');
 const lower=[w.company.minEmployees,w.person.minEmployees,w.anti.belowEmployees].filter(x=>x!==undefined&&x!=='').map(Number);
 const upper=[w.company.maxEmployees,w.person.maxEmployees,w.anti.aboveEmployees].filter(x=>x!==undefined&&x!=='').map(Number);
 if(lower.length||upper.length){const range={...(lower.length?{gte:Math.max(...lower)}:{}),...(upper.length?{lte:Math.min(...upper)}:{})};if(range.gte>range.lte)throw Error('Headcount requirements conflict with each other or with exclusions.');rules.push({field:'job_company_employee_count',range,label:'Company headcount'});}
 if(!rules.some(r=>!r.exclude))throw Error('Set at least one searchable ICP filter: country, industry, job title or company size.');
 const filter=[],must_not=[];
 for(const r of rules){
  if(r.functions){
   const phrases=new Set(r.functions.flatMap(label=>functionPhrases[label]));
   const should=[...phrases].flatMap(phrase=>['job_title.text','job_summary'].map(field=>({match_phrase:{[field]:phrase.toLowerCase()}})));
   if(r.titles.length)should.push({terms:{job_title:r.titles}});
   filter.push({bool:{should}});
   continue;
  }
  const q=r.ranges?{bool:{should:r.ranges.map(range=>({range:{[r.field]:range}}))}}:r.range?{range:{[r.field]:r.range}}:{terms:{[r.field]:r.values}};(r.exclude?must_not:filter).push(q);}
 return {requested,rules,review,query:{query:{bool:{filter,must_not}}},notes:['Values in one field are alternatives; different fields must all match. Selected sizes and business functions each match any listed option.','Use full country names and PDL industry/job taxonomy values. Free-text synonyms are not silently expanded.','PDL orders results by profile completeness, not likelihood to buy. ']};
}
const text=v=>typeof v==='string'&&v.trim()&&!/\*|redacted|obfuscat/i.test(v)?v.trim().slice(0,200):null;
export function normalizePerson(p,plan,now=new Date().toISOString()) {
 const matched=[],unknown=[...plan.review],excluded=[];
 for(const r of plan.rules){
  if(r.functions){
   const titleMatches=detectFunctions(p.job_title,r.functions);
   const descriptionMatches=detectFunctions(p.job_summary,r.functions);
   if(titleMatches.length)matched.push('Job title: '+titleMatches.join(', '));
   if(descriptionMatches.length)matched.push('Job description: '+descriptionMatches.join(', '));
   if(!titleMatches.length&&!descriptionMatches.length){
    if(r.titles.includes(String(p.job_title).toLowerCase()))matched.push('Saved job title');
    else if(!p.job_title || !p.job_summary)unknown.push('Business function: incomplete title or description in returned profile');
    else excluded.push('Business function');
   }
   continue;
  }
  const v=p[r.field];if(v===null||v===undefined||(Array.isArray(v)&&!v.length)){unknown.push(r.label+': missing provider data');continue;}
 const matches=r.ranges?r.ranges.some(range=>typeof v==='number'&&v>=range.gte&&v<=(range.lte??Infinity)):r.range?typeof v==='number'&&(r.range.gte===undefined||v>=r.range.gte)&&(r.range.lte===undefined||v<=r.range.lte):(Array.isArray(v)?v:[v]).some(x=>r.values.includes(String(x).toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/$/,'')));
 if(r.exclude?matches:!matches)excluded.push(r.label);else matched.push(r.label);
 }
 const name=text(p.full_name),company=text(p.job_company_name);if(!name||!company)unknown.push('Name or current company missing; cannot import.');
 const email=text(p.work_email);let domain=text(p.job_company_website)?.toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0]||null;
 if(domain&&!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain))domain=null;
 return {providerRecordId:text(p.id),name,company,position:text(p.job_title),domain,industry:text(p.job_company_industry),country:text(p.job_company_location_country),email:email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email.toLowerCase():null,phone:text(p.mobile_phone)&&/^\+?[\d ()-]{7,30}$/.test(p.mobile_phone)?p.mobile_phone:null,retrievedAt:now,fit:excluded.length?'excluded':unknown.length?'review':'matches',matched,unknown,excluded,canImport:Boolean(text(p.id)&&name&&company&&!excluded.length)};
}
export async function searchPeople(plan,{key,size=3,fetchImpl=fetch}={}) {
 if(!key)throw Error('PDL is not configured.');if(!Number.isInteger(size)||size<1||size>5)throw Error('Choose between 1 and 5 records for testing.');
 const res=await fetchImpl('https://api.peopledatalabs.com/v5/person/search',{method:'POST',headers:{'X-Api-Key':key,'Content-Type':'application/json'},body:JSON.stringify({query:plan.query,size}),signal:AbortSignal.timeout(30000)});
 if(!res.ok)throw Error(({401:'PDL rejected the API key.',402:'PDL credits are exhausted or this endpoint needs a different plan.',403:'Your PDL plan does not allow this search.',429:'PDL is rate-limited. Wait a minute before retrying.',400:'PDL rejected the filters. Check country, industry and job taxonomy values.'})[res.status]||'PDL search is unavailable. Please retry later.');
 const body=await res.json();if(!Array.isArray(body.data))throw Error('PDL returned an unexpected response.');
 return {total:body.total,remaining:res.headers.get('x-totallimit-remaining'),records:body.data.slice(0,size).map(p=>normalizePerson(p,plan))};
}
