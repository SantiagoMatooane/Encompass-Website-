import {createCipheriv,createDecipheriv,randomBytes,createHash} from 'node:crypto';
// Encrypted, authenticated 24-hour search snapshots work across server instances
// without putting personal data in URLs or depending on ephemeral server disks.
export function searchTokens(secret) {
  if(!secret)throw Error('Search encryption key is not configured.');
  const key=createHash('sha256').update(secret).digest();
  return {
    async save(entry,workspaceId,uid) {
      const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
      const payload=JSON.stringify({entry,workspaceId,uid,expiresAt:Date.now()+86400000});
      const encrypted=Buffer.concat([cipher.update(payload,'utf8'),cipher.final()]);
      return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64url');
    },
    async load(token,workspaceId,uid) {
      try {
        if(typeof token!=='string'||token.length>120000)return null;
        const data=Buffer.from(token,'base64url');
        const cipher=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));
        cipher.setAuthTag(data.subarray(12,28));
        const value=JSON.parse(Buffer.concat([cipher.update(data.subarray(28)),cipher.final()]).toString());
        return value.workspaceId===workspaceId&&value.uid===uid&&value.expiresAt>Date.now()?value.entry:null;
      } catch{return null;}
    }
  };
}
