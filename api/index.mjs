const modules=["../crm/search-tokens.mjs","../crm/access.mjs","../crm/preview.mjs","../crm/agent.mjs","../crm/pdl.mjs","../crm/discovery.mjs","../crm/jobs.mjs","../crm/crm-db.mjs","../crm/pdl-crm.mjs","../crm/beta-access.mjs","../crm/server.mjs"];
export default async function handle(req,res) {
  const u=new URL(req.url,"https://encompass.studio");
  if(u.searchParams.has("module-probe")){
    const results=[];
    for(const item of modules){try{await import(item);results.push({module:item,ok:true});}catch(e){results.push({module:item,ok:false,name:e?.name,message:e?.message,stack:e?.stack});}}
    try{const {firebaseBackend}=await import("../crm/access.mjs");firebaseBackend();results.push({module:"firebaseBackendInit",ok:true});}catch(e){results.push({module:"firebaseBackendInit",ok:false,name:e?.name,message:e?.message,stack:e?.stack});}
    try{const fs=await import("node:fs/promises");const code=await fs.readFile(new URL("../crm/server.mjs",import.meta.url),"utf8");const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;const clean=code.replace(/^import .*;\\s*$/gm,"").replace(/^export /gm,"").replaceAll("import.meta.url","\"file:///tmp/server.mjs\"");new AsyncFunction(clean);results.push({module:"serverSourceParse",ok:true,length:code.length,regexLines:code.split("\\n").filter(x=>x.includes(".match(")||x.includes("replace(/")).slice(-5)});}catch(e){results.push({module:"serverSourceParse",ok:false,name:e?.name,message:e?.message,stack:e?.stack});}
    res.writeHead(200,{"Content-Type":"application/json","Cache-Control":"no-store"});return res.end(JSON.stringify(results));
  }
  try {const {handler}=await import("../crm/server.mjs");return await handler(req,res);}
  catch(error) {console.error("Encompass API bootstrap failed:",error?.stack||error);res.writeHead(503,{"Content-Type":"application/json","Cache-Control":"no-store"});res.end(JSON.stringify({error:"Encompass is awaiting server configuration. Access remains closed."}));}
}
