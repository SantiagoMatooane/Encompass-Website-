const key='encompass-preview-session';
const read=()=>JSON.parse(sessionStorage.getItem(key)||'null');
function user(record){
  return record && {uid:record.uid,email:record.email,displayName:record.name,emailVerified:true,getIdToken:async()=>record.token};
}
export async function initialiseAuth(){
  if(read()){
    const check=await fetch('/api/workspace',{headers:{Authorization:'Bearer '+read().token}});
    if(check.status===401)sessionStorage.removeItem(key);
  }
  let observer;
  async function enter(action,email,password,name){
    const res=await fetch('/preview/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,name})});
    if(!res.ok)throw Object.assign(Error(),{code:action==='signup'?'auth/email-already-in-use':'auth/invalid-credential'});
    const record=await res.json();
    sessionStorage.setItem(key,JSON.stringify(record));observer?.(user(record));
    return {user:user(record)};
  }
  return {
    observe(next){observer=next;next(user(read()));return ()=>{observer=null;};},
    signup:(email,password,name)=>enter('signup',email,password,name),
    login:(email,password)=>enter('login',email,password),
    profile:async()=>{},verify:async()=>{},reload:async()=>user(read()),
    reset:async()=>{throw Error('Email is unavailable in local preview.');},
    async logout(){
      await fetch('/preview/logout',{method:'POST',headers:{Authorization:'Bearer '+read()?.token,'Content-Type':'application/json'},body:'{}'});
      sessionStorage.removeItem(key);observer?.(null);
    }
  };
}
