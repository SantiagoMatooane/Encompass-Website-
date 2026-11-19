import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual} from 'node:crypto';
import {validateClient} from './crm-db.mjs';

export function previewBackend(file) {
  const db = new DatabaseSync(file);
  db.exec(`CREATE TABLE IF NOT EXISTS users(uid TEXT PRIMARY KEY,email TEXT UNIQUE,name TEXT,salt TEXT,hash TEXT);
    CREATE TABLE IF NOT EXISTS workspaces(id TEXT PRIMARY KEY,owner TEXT UNIQUE);
    CREATE TABLE IF NOT EXISTS contacts(id TEXT PRIMARY KEY,workspace TEXT,status TEXT,source TEXT,payload TEXT,UNIQUE(workspace,source));`);
  const sessions = new Map();
  const membership = uid => db.prepare('SELECT id FROM workspaces WHERE owner=?').get(uid)?.id;
  function save(id,status,record,source=null) {
    const contact = {...record,id:randomUUID(),company:{name:record.company},createdAt:new Date().toISOString()};
    if(status==='CLIENT') contact.clientSince=contact.createdAt;
    db.prepare('INSERT INTO contacts VALUES(?,?,?,?,?)').run(contact.id,id,status,source,JSON.stringify(contact));
    return {id:contact.id};
  }
  return {
    login({email,password,name},signup) {
      if(typeof email!=='string'||typeof password!=='string'||password.length<6||password.length>512)throw Error('Invalid credentials.');
      email=email.trim().toLowerCase();
      if(signup) {
        const salt=randomBytes(16).toString('hex');
        db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(randomUUID(),email,name||'',salt,scryptSync(password,salt,32).toString('hex'));
      }
      const user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
      if(!user||!timingSafeEqual(Buffer.from(user.hash,'hex'),scryptSync(password,user.salt,32)))throw Error('Invalid credentials.');
      const token=randomBytes(32).toString('hex');
      const identity={uid:user.uid,email:user.email,name:user.name};
      sessions.set(token,identity);
      return {...identity,token};
    },
    logout(token){sessions.delete(token);},
    authenticate:token=>sessions.get(token),
    membership,
    activate(user){
      db.prepare('INSERT INTO workspaces VALUES(?,?) ON CONFLICT(owner) DO NOTHING').run(randomUUID(),user.uid);
      return membership(user.uid);
    },
    crm(id){
      const list=status=>db.prepare('SELECT payload FROM contacts WHERE workspace=? AND status=? ORDER BY rowid DESC').all(id,status).map(r=>JSON.parse(r.payload));
      return {
        clients:()=>({clients:list('CLIENT')}),
        list:({offset})=>{const leads=list('LEAD');return {leads:leads.slice(offset,offset+20),offset,hasMore:leads.length>offset+20};},
        createClient:input=>save(id,'CLIENT',validateClient(input)),
        promote(contact){return {added:db.prepare("UPDATE contacts SET status='CLIENT',payload=json_set(payload,'$.clientSince',?) WHERE id=? AND workspace=? AND status='LEAD'").run(new Date().toISOString(),contact,id).changes===1};},
        icpContext(){const clients=list('CLIENT');return {companies:clients.slice(0,100).map(c=>c.company),sampledClientContacts:Math.min(100,clients.length),truncated:clients.length>100};}
      };
    },
    provider(id){return {
      sources:async()=>[],
      importPerson(record){const prior=db.prepare('SELECT id FROM contacts WHERE workspace=? AND source=?').get(id,record.providerRecordId);
        return prior?{id:prior.id,existing:true}:save(id,'LEAD',record,record.providerRecordId);}
    };}
  };
}
