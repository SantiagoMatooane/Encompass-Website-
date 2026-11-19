const modules=["../crm/search-tokens.mjs","../crm/access.mjs","../crm/preview.mjs","../crm/agent.mjs","../crm/pdl.mjs","../crm/discovery.mjs","../crm/jobs.mjs","../crm/crm-db.mjs","../crm/pdl-crm.mjs","../crm/beta-access.mjs","../crm/server.mjs"];
export default async function handle(req,res) {
  const u=new URL(req.url,"https://encompass.studio");
  if(u.searchParams.has("module-probe")){
    const results=[];
    for(const item of modules){try{await import(item);results.push({module:item,ok:true});}catch(e){results.push({module:item,ok:false,name:e?.name,message:e?.message,stack:e?.stack});}}
    try{const {firebaseBackend}=await import("../crm/access.mjs");firebaseBackend();results.push({module:"firebaseBackendInit",ok:true});}catch(e){results.push({module:"firebaseBackendInit",ok:false,name:e?.name,message:e?.message,stack:e?.stack});}
    try{const fs=await import("node:fs/promises");const code=await fs.readFile(new URL("../crm/server.mjs",import.meta.url),"utf8");const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;const clean=code.split(String.fromCharCode(10)).filter(line=>!line.startsWith("import ")).map(line=>line.startsWith("export ")?line.slice(7):line).join(String.fromCharCode(10)).replaceAll("import.meta.url","file:///tmp/server.mjs");const lines=clean.split(String.fromCharCode(10));let lo=0,hi=lines.length;while(lo<hi){const mid=Math.floor((lo+hi)/2);try{new AsyncFunction(lines.slice(0,mid+1).join(String.fromCharCode(10)));lo=mid+1}catch(e){if(e?.message?.includes("Invalid regular expression flags"))hi=mid;else lo=mid+1}}const line=lines[lo]||"";results.push({module:"serverParseScan",length:code.length,line:lo+1,text:line,excerpt:lines.slice(Math.max(0,lo-2),lo+3)});}catch(e){results.push({module:"serverSourceParse",ok:false,name:e?.name,message:e?.message,stack:e?.stack});}
    res.writeHead(200,{"Content-Type":"application/json","Cache-Control":"no-store"});return res.end(JSON.stringify(results));
  }
  try {const {handler}=await import("../crm/server.mjs");return await handler(req,res);}
  catch(error) {console.error("Encompass API bootstrap failed:",error?.stack||error);res.writeHead(503,{"Content-Type":"application/json","Cache-Control":"no-store"});res.end(JSON.stringify({error:"Encompass is awaiting server configuration. Access remains closed."}));}
}
