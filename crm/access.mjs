import {getAuth} from 'firebase-admin/auth';
import {getApps, initializeApp} from 'firebase-admin/app';
import {databaseClient, createCRM, serverCredential} from './crm-db.mjs';
import {providerCRM} from './pdl-crm.mjs';
import {betaGrant,invitationService} from './beta-access.mjs';

export function firebaseBackend() {
  const db=databaseClient();
  const projectId=process.env.FIREBASE_AUTH_PROJECT_ID||'encompass-da303';
  const app=getApps().find(a=>a.name==='website-auth')||initializeApp({projectId,credential:serverCredential()},'website-auth');
  const auth=getAuth(app);
  const adminUids=(process.env.CRM_ADMIN_UIDS||'').split(',').map(s=>s.trim()).filter(Boolean);
  async function membership(identity) {
    // Read current server-side access on every request. Revocation/expiry does
    // not depend on a browser refreshing its old Firebase token.
    const grant=betaGrant(await auth.getUser(identity.uid),identity);
    const {data}=await db.executeGraphqlRead(
      'query($id:UUID!,$uid:String!){workspaceMembers(where:{workspaceId:{eq:$id},authUid:{eq:$uid}},limit:1){workspace{id}}}',
      {variables:{id:grant.workspaceId,uid:identity.uid}});
    if(!data.workspaceMembers[0])throw Object.assign(Error('Company membership unavailable.'),{status:403,publicMessage:'Company membership unavailable. Contact Encompass.'});
    return data.workspaceMembers[0].workspace.id;
  }
  return {
    async authenticate(token) {
      const identity=await auth.verifyIdToken(token,true);
      if(!identity.email_verified)throw Error('Verify your email.');
      return identity;
    },
    membership,
    activate:membership,
    invitations:invitationService({auth,db,adminUids}),
    crm:id=>createCRM(db,id),
    provider:id=>providerCRM(db,id)
  };
}
