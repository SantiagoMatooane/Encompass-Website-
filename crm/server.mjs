import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {searchTokens} from './search-tokens.mjs';
import {firebaseBackend} from './access.mjs';
import {previewBackend} from './preview.mjs';
import {analyse,validateInput} from './agent.mjs';
import {searchPeople} from './pdl.mjs';
import {discovery,withSources} from './discovery.mjs';
import {limited} from './jobs.mjs';

const hosted=process.env.VERCEL==='1'||process.env.NODE_ENV==='production';
if(hosted&&process.env.CRM_BACKEND!=='firebase')throw Error('Production requires Firebase; preview is local-only.');
const preview=process.env.CRM_BACKEND!=='firebase';
const root=path.dirname(fileURLToPath(import.meta.url));
const dir=process.env.CRM_DATA_DIR || path.join(root,'.local',preview?'preview':'firebase');
if(preview)await mkdir(dir,{recursive:true,mode:0o700});
const backend=preview?previewBackend(path.join(dir,'crm.sqlite')):firebaseBackend();
const history=searchTokens(process.env.CRM_SEARCH_SECRET||(preview?randomBytes(32).toString('hex'):process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
const port=Number(process.env.PORT||4192);
const aiQueue=limited(3), pdlQueue=limited(3);
const types={html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',webp:'image/webp',ttf:'font/ttf',woff2:'font/woff2',mp4:'video/mp4',ico:'image/x-icon'};
const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
async function body(req){
  let chunks=[],size=0;
  for await(const chunk of req){size+=chunk.length;if(size>160000)throw Error('Request too large.');chunks.push(chunk);}
  return JSON.parse(Buffer.concat(chunks).toString());
}
const delay=()=>new Promise(resolve=>setTimeout(resolve,250));
async function search(plan,size){
  if(!preview)return searchPeople(plan,{key:process.env.PDL_API_KEY,size});
  await delay();
  const company=plan.requested.find(r=>r.group==='company')?.value || 'Example';
  return {total:1,remaining:null,records:[{providerRecordId:'fixture-'+company,name:'Alex Sample',company:company+' (fictional)',position:'Director',fit:'review',canImport:true,matched:[],unknown:['Simulated search result'],excluded:[],retrievedAt:new Date().toISOString()}]};
}
export async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  const allowedOrigins=(process.env.APP_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean);
  if(!hosted)allowedOrigins.push(`http://localhost:${port}`,`http://127.0.0.1:${port}`);
  const origin=allowedOrigins.find(value=>new URL(value).host===req.headers.host);
  const hosts=allowedOrigins.map(value=>new URL(value).host);
  if(!hosts.includes(req.headers.host))return json(res,403,{error:'Invalid host.'});
  
  if(req.method==='POST'&&(!allowedOrigins.includes(req.headers.origin)||!req.headers['content-type']?.startsWith('application/json')))return json(res,403,{error:'Use the Encompass website.'});
  const url=new URL(req.url,origin), route=decodeURIComponent(url.pathname);
  const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if(preview && req.method==='POST' && ['/preview/signup','/preview/login','/preview/logout'].includes(route)){
    if(route==='/preview/logout'){backend.logout(token);return json(res,200,{});}
    try{return json(res,200,backend.login(await body(req),route==='/preview/signup'));}
    catch{return json(res,400,{error:'Unable to sign up or sign in.'});}
  }
  if(route.startsWith('/api/')){
    let user;
    try{if(token)user=await backend.authenticate(token);}catch{}
    if(!user)return json(res,401,{error:'Sign in with a verified account.'});
    if(route.startsWith('/api/admin/')){
      if(!backend.invitations)return json(res,403,{error:'Invitation management requires Firebase.'});
      if(route==='/api/admin/access'&&req.method==='GET')return json(res,200,await backend.invitations.list(user));
      if(req.method==='POST'){
        const input=await body(req);
        if(route==='/api/admin/companies')return json(res,201,await backend.invitations.company(user,input));
        if(route==='/api/admin/invitations')return json(res,201,await backend.invitations.invite(user,input));
        if(route==='/api/admin/revoke')return json(res,200,await backend.invitations.revoke(user,input));
      }
      return json(res,404,{error:'Unknown operation.'});
    }
    if(route==='/api/workspace' && ['POST','GET'].includes(req.method)){
      const id=req.method==='POST'?await backend.activate(user):await backend.membership(preview?user.uid:user);
      return json(res,200,{workspaceId:id||null});
    }
    const workspaceId=await backend.membership(preview?user.uid:user);
    if(!workspaceId)return json(res,403,{error:'CRM access is invitation-only. Contact Encompass.'});
    const crm=backend.crm(workspaceId),provider=backend.provider(workspaceId);
    if(req.method==='GET'){
      if(route==='/api/status')return json(res,200,{configured:preview||!!process.env.OPENAI_API_KEY,pdl:preview||!!process.env.PDL_API_KEY,database:true,preview});
      if(route==='/api/clients')return json(res,200,{clients:await withSources((await crm.clients()).clients,provider)});
      if(route==='/api/leads'){
        const offset=Number(url.searchParams.get('offset')||0);
        if(!Number.isInteger(offset)||offset<0||offset>100000)throw Error('Invalid page.');
        const data=await crm.list({offset});data.leads=await withSources(data.leads,provider);return json(res,200,data);
      }
    }
    if(req.method==='POST'){
      const input=await body(req);
      if(route==='/api/clients')return json(res,201,await crm.createClient(input));
      const promote=route.match(/^\/api\/leads\/([\da-f-]+)\/client$/i);
      if(promote){const result=await crm.promote(promote[1]);return json(res,result.added?200:409,result);}
      if(route.startsWith('/api/pdl/'))return json(res,200,await discovery(route.slice(9),input,{workspaceId,uid:user.uid,provider,history,search:(plan,size)=>pdlQueue(()=>search(plan,size))}));
      if(route==='/api/analyse'){
        const clean=validateInput(input),context=await crm.icpContext();
        const result=await aiQueue(async()=>{
          if(!preview)return analyse(clean,{key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-4.1-mini',crmContext:context});
          await delay();
          return {summary:`Simulated assessment for ${clean.business.name}. Workspace clients: ${context.companies.map(c=>c.name).join(', ')||'none'}.`,recommendations:[],missingEvidence:[],limitations:'Local preview with fictional data.'};
        });
        return json(res,200,{...result,context:{crmClientContacts:context.sampledClientContacts,crmCompanies:context.companies.length,crmTruncated:context.truncated,pdlConnected:preview||!!process.env.PDL_API_KEY,pdlQueried:false}});
      }
    }
    return json(res,404,{error:'Unknown operation.'});
  }
  if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Unsupported method.'});
  const isCRM=route==='/crm'||route.startsWith('/crm/');
  if(route==='/crm'||route==='/crm/'){
    res.writeHead(302,{'Location':'/crm/dashboard.html','Cache-Control':'no-store'});
    return res.end();
  }
  const base=isCRM?path.join(root,'public'):path.resolve(root,'../website');
  let name=isCRM?route.slice(4):route;
  if(preview&&name==='/auth-firebase.js'&&!isCRM)name='/preview-auth.js';
  if(!name||name==='/')name='/index.html';
  const file=path.resolve(base,'.'+name);
  if(name.split('/').some(part=>part.startsWith('.'))||!types[path.extname(file).slice(1)]||!file.startsWith(base+path.sep))return json(res,404,{error:'Unavailable.'});
  let content;
  try {content=await readFile(file);}
  catch(error){
    if(error.code!=='ENOENT'||!name.startsWith('/assets/'))throw error;
    const assetRoot=path.resolve(root,'../dist/assets');
    const sharedAsset=path.resolve(assetRoot,name.slice('/assets/'.length));
    if(!sharedAsset.startsWith(assetRoot+path.sep))throw error;
    content=await readFile(sharedAsset);
  }
  if(preview&&name.endsWith('.html'))content=Buffer.from(content.toString().replace(/<body([^>]*)>/i,'<body$1><aside style="position:fixed;bottom:0;right:0;z-index:9999;background:#17232a;color:white;padding:4px 10px;font:12px sans-serif">Local preview · fictional accounts and simulated providers</aside>'));
  res.writeHead(200,{'Content-Type':types[path.extname(file).slice(1)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:content);
 }catch(err){
   const status=err.code==='ENOENT'?404:err.status||400;
   json(res,status,{error:status===404?'Unavailable.':err.publicMessage||(err.message.includes('SQLITE')||!preview?'Could not complete the request.':err.message)});
 }
}
if(!process.env.VERCEL){
 const server=http.createServer(handler);
 server.listen(port,hosted?'0.0.0.0':'127.0.0.1',()=>console.log('Encompass server listening on port '+port));
}
