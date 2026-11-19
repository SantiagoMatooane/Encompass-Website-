import {initialiseAuth} from '/auth-firebase.js';
const auth=await initialiseAuth();
const user=await new Promise((resolve,reject)=>auth.observe(resolve,reject));
function exit(){
  location.replace('/?open-crm=1');
  throw Error('Sign in to open your CRM.');
}
if(!user?.emailVerified)exit();
export async function api(url,options={}){
  const headers=new Headers(options.headers);
  headers.set('Authorization','Bearer '+await user.getIdToken());
  const response=await fetch(url,{...options,headers});
  if(response.status===401||response.status===403)exit();
  return response;
}
const response=await api('/api/workspace');
if(!response.ok)throw Error('Workspace unavailable. Refresh to retry.');
const {workspaceId}=await response.json();
if(!workspaceId)exit();
export const storageKey=name=>JSON.stringify([user.uid,workspaceId,name]);
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
