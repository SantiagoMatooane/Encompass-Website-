import {randomUUID} from 'node:crypto';
import {buildPlan} from './pdl.mjs';

export async function discovery(action,input,{workspaceId,uid,provider,search,history}) {
  if(action==='plan') return buildPlan(input.workspace);
  if(action==='search') {
    const plan=buildPlan(input.workspace);
    const result=await search(plan,input.size);
    const entry={id:randomUUID(),plan,...result,createdAt:new Date().toISOString()};
    if(history.save){entry.id=await history.save(entry,workspaceId,uid);return entry;}
    history.prepare('DELETE FROM searches WHERE expires < ?').run(Date.now());
    history.prepare('INSERT INTO searches VALUES(?,?,?,?,?)').run(entry.id,workspaceId,uid,JSON.stringify(entry),Date.now()+86400000);
    return entry;
  }
  if(action!=='import') throw Error('Unknown discovery action.');
  const stored=history.load?await history.load(input.searchId,workspaceId,uid):null;
  const row=history.load?(stored?{payload:JSON.stringify(stored)}:null):history.prepare('SELECT payload FROM searches WHERE id=? AND workspace=? AND uid=? AND expires>=?').get(input.searchId,workspaceId,uid,Date.now());
  if(!row)throw Error('Search preview unavailable.');
  if(!Array.isArray(input.ids)||input.ids.length<1||input.ids.length>5)throw Error('Select 1–5 preview records.');
  const entry=JSON.parse(row.payload);
  const records=[...new Set(input.ids)].map(id=>entry.records.find(r=>r.providerRecordId===id));
  if(records.some(r=>!r?.canImport||(r.fit==='review'&&input.reviewed!==true)))throw Error('Review outstanding criteria before importing.');
  const results=[];
  for(const record of records){
    try{results.push({providerRecordId:record.providerRecordId,...await provider.importPerson(record,{reviewed:input.reviewed===true})});}
    catch{results.push({providerRecordId:record.providerRecordId,error:'Import could not be confirmed. Retry this preview.'});}
  }
  return {results};
}

export async function withSources(rows,provider){
  const sources=[];
  for(let i=0;i<rows.length;i+=100)sources.push(...await provider.sources(rows.slice(i,i+100).map(r=>r.id)));
  return rows.map(r=>({...r,sources:sources.filter(s=>s.matchedContact.id.replaceAll('-','')===r.id.replaceAll('-',''))}));
}
