import {randomUUID} from 'node:crypto';
import {uuid} from './crm-db.mjs';
const fail = (message, status=403) => Object.assign(new Error(message), {status, publicMessage:message});
export function betaGrant(record, identity, now=Date.now()) {
  const grant=record?.customClaims?.encompassBeta;
  if(record?.disabled || !record?.emailVerified || !identity.email_verified ||
    record.uid!==identity.uid || !grant || grant.active!==true || !uuid(grant.workspaceId) ||
    !Number.isFinite(grant.expiresAt) || grant.expiresAt<=now ||
    grant.email!==record.email?.toLowerCase() || grant.email!==identity.email?.toLowerCase()) {
    throw fail('CRM access is invitation-only. Ask Encompass to invite this email address or renew your access.');
  }
  return grant;
}
export function betaAdmin(identity, adminUids) {
  return Boolean(identity?.email_verified && adminUids.includes(identity.uid));
}
export function invitationInput(input, now=Date.now()) {
  const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
  if(!/^[^\s@*]+@[^\s@*]+\.[^\s@*]+$/.test(email)||email.length>254)throw fail('Enter a valid email address.',400);
  const expiresAt=Date.parse(input.expiresAt);
  if(!Number.isFinite(expiresAt)||expiresAt<=now||expiresAt>now+366*86400000)throw fail('Choose an expiry within the next year.',400);
  if(!uuid(input.workspaceId))throw fail('Choose a company workspace.',400);
  return {email,expiresAt,workspaceId:input.workspaceId};
}
export function invitationService({auth,db,adminUids=[]}) {
  async function requireAdmin(identity) {
    if(!betaAdmin(identity,adminUids))throw fail('Only the Encompass owner can manage invitations.');
    const record=await auth.getUser(identity.uid);
    if(record.disabled||!record.emailVerified)throw fail('Owner access unavailable.');
  }
  async function users() {
    let result=[],pageToken;
    do {const page=await auth.listUsers(1000,pageToken);result.push(...page.users);pageToken=page.pageToken;} while(pageToken);
    return result;
  }
  async function companies() {
    return (await db.executeGraphqlRead('query {workspaces(limit:1000){id name}}')).data.workspaces;
  }
  return {
    requireAdmin,
    async list(identity) {
      await requireAdmin(identity);
      return {companies:await companies(),invitations:(await users()).filter(u=>u.customClaims?.encompassBeta).map(u=>({uid:u.uid,email:u.email,verified:u.emailVerified,...u.customClaims.encompassBeta}))};
    },
    async company(identity,input) {
      await requireAdmin(identity);
      const name=typeof input.name==='string'?input.name.trim():'';
      if(!name||name.length>150)throw fail('Enter a company name (up to 150 characters).',400);
      const id=randomUUID();
      await db.executeGraphql('mutation($id:UUID!,$name:String!){workspace_insert(data:{id:$id,name:$name})}',{variables:{id,name}});
      return {id,name};
    },
    async invite(identity,input) {
      await requireAdmin(identity);
      const grant=invitationInput(input);
      if(!(await companies()).some(c=>c.id.replaceAll('-','')===grant.workspaceId.replaceAll('-','')))throw fail('Company workspace unavailable.',400);
      let user,created=false;
      try {user=await auth.getUserByEmail(grant.email);} catch(e) {
        if(e.code!=='auth/user-not-found')throw e;
        user=await auth.createUser({email:grant.email,emailVerified:false});created=true;
      }
      if(adminUids.includes(user.uid))throw fail('Owner accounts cannot be assigned a beta invitation.',400);
      const prior=user.customClaims?.encompassBeta;
      if(prior&&prior.workspaceId.replaceAll('-','').toLowerCase()!==grant.workspaceId.replaceAll('-','').toLowerCase())throw fail('This email belongs to another company. Use a different email.',409);
      // Pending membership alone grants no access. Publish the grant last.
      await db.executeGraphql('mutation($w:UUID!,$uid:String!){workspaceMember_upsert(data:{workspaceId:$w,authUid:$uid,role:"beta"})}',{variables:{w:grant.workspaceId,uid:user.uid}});
      await auth.setCustomUserClaims(user.uid,{...user.customClaims,encompassBeta:{...grant,active:true}});
      // Password setup links are credentials: return only to the authenticated owner,
      // never log or store them, and never reset an existing user's password.
      const setupLink=created?await auth.generatePasswordResetLink(grant.email):null;
      return {uid:user.uid,email:grant.email,setupLink,existingAccount:!created};
    },
    async revoke(identity,{uid}) {
      await requireAdmin(identity);
      if(typeof uid!=='string'||adminUids.includes(uid))throw fail('Choose an invited user.',400);
      const user=await auth.getUser(uid),grant=user.customClaims?.encompassBeta;
      if(!grant)throw fail('Invitation not found.',404);
      await auth.setCustomUserClaims(uid,{...user.customClaims,encompassBeta:{...grant,active:false}});
      return {revoked:true};
    }
  };
}
