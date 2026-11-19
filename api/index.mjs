export default async function handle(req,res) {
  try {const {handler}=await import('../crm/server.mjs');return await handler(req,res);}
  catch(error) {console.error('Encompass API bootstrap failed:', error?.stack || error);res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Encompass is awaiting server configuration. Access remains closed.'}));}
}
