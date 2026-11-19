import {createHash} from 'node:crypto';
export const stableId=(...parts)=>{const h=createHash('sha256').update(parts.join('\0')).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;};
export function providerCRM(dc,workspaceId){
 const read=async(query,variables={})=>(await dc.executeGraphqlRead(query,{variables:{w:workspaceId,...variables}})).data;
 return {
 async sources(ids){if(!ids.length)return [];const data=await read('query($w:UUID!,$ids:[UUID!]!){importRecords(where:{workspaceId:{eq:$w},matchedContactId:{in:$ids}},limit:500){provider providerRecordId retrievedAt matchedContact{id}}}',{ids});return data.importRecords;},
 async importPerson(r,{reviewed=false}={}){
  if(!r.canImport||r.fit==='excluded'||(r.fit==='review'&&!reviewed))throw Error('Review outstanding criteria before importing this prospect.');
  const importId=stableId(workspaceId,'PDL',r.providerRecordId);
  const prior=await read('query($w:UUID!,$id:UUID!){importRecords(where:{workspaceId:{eq:$w},id:{eq:$id}},limit:1){matchedContact{id status}}}',{id:importId});
  if(prior.importRecords[0]?.matchedContact)return {id:prior.importRecords[0].matchedContact.id,existing:true};
  let companies=[];
  if(r.domain)companies=(await read('query($w:UUID!,$domain:String!){companies(where:{workspaceId:{eq:$w},normalizedDomain:{eq:$domain}},limit:2){id}}',{domain:r.domain})).companies;
  if(!companies.length)companies=(await read('query($w:UUID!,$name:String!){companies(where:{workspaceId:{eq:$w},name:{eq:$name}},limit:2){id}}',{name:r.company})).companies;
  if(companies.length>1)throw Error('Multiple company matches; resolve these in the CRM before importing.');
  const companyId=companies[0]?.id||stableId(workspaceId,'company',r.domain||r.company.toLowerCase());
  let contacts=[];
  if(r.email)contacts=(await read('query($w:UUID!,$email:String!){contacts(where:{workspaceId:{eq:$w},email:{eq:$email}},limit:2){id status}}',{email:r.email})).contacts;
  if(!contacts.length&&companies.length)contacts=(await read('query($w:UUID!,$company:UUID!,$name:String!){contacts(where:{workspaceId:{eq:$w},companyId:{eq:$company},name:{eq:$name}},limit:2){id status}}',{company:companyId,name:r.name})).contacts;
  if(contacts.length>1)throw Error('Multiple contact matches; review duplicates before importing.');
  const existing=Boolean(contacts.length),contactId=contacts[0]?.id||stableId(workspaceId,'contact',r.email||r.providerRecordId);
  const variables={w:workspaceId,i:importId,p:r.providerRecordId,c:contactId,n:r.name,cn:r.company,d:r.domain,e:r.email,phone:r.phone,t:r.retrievedAt};
  let declarations='$w:UUID!,$i:UUID!,$p:String!,$c:UUID!,$n:String!,$cn:String!,$d:String,$e:String,$phone:String,$t:Timestamp!';
  let writes='';
  if(!existing){declarations+=',$co:UUID!,$position:String';Object.assign(variables,{co:companyId,position:r.position});
   if(!companies.length){declarations+=',$industry:String,$country:String';Object.assign(variables,{industry:r.industry,country:r.country});writes+='company_insert(data:{id:$co,workspaceId:$w,name:$cn,normalizedDomain:$d,industry:$industry,country:$country})\n';}
   writes+='contact_insert(data:{id:$c,workspaceId:$w,companyId:$co,name:$n,email:$e,normalizedEmail:$e,phone:$phone,position:$position,status:LEAD})\n';
  }
  writes+=`importRecord_insert(data:{id:$i,workspaceId:$w,provider:"PDL",providerRecordId:$p,matchedContactId:$c,name:$n,companyName:$cn,normalizedDomain:$d,email:$e,normalizedEmail:$e,phone:$phone,retrievedAt:$t,status:${existing?'EXISTING_MATCH':'ACCEPTED'}})`;
  try{await dc.executeGraphql(`mutation ImportPDL(${declarations}) @transaction {${writes}}`,{variables});}
  catch(error){const retry=await read('query($w:UUID!,$id:UUID!){importRecords(where:{workspaceId:{eq:$w},id:{eq:$id}},limit:1){matchedContact{id}}}',{id:importId});if(retry.importRecords[0]?.matchedContact)return {id:retry.importRecords[0].matchedContact.id,existing:true};throw error;}
  return {id:contactId,existing};
 }
 };
}
