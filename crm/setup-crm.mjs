// Run once with Node's --env-file=.env after deploying SQL Connect.
import {randomUUID} from 'node:crypto';
import {databaseClient} from './crm-db.mjs';
import {readFile, writeFile} from 'node:fs/promises';
const dc = databaseClient();
const existing = await dc.executeGraphqlRead('query { workspaces(where: {name: {eq: "Encompass CRM"}}, limit: 2) { id } }');
if (existing.data.workspaces.length > 1) throw new Error('Multiple matching workspaces; select one manually.');
let id = existing.data.workspaces[0]?.id;
if (!id) {
  id = randomUUID();
  await dc.executeGraphql('mutation CreateWorkspace($id: UUID!) { workspace_insert(data: {id: $id, name: "Encompass CRM"}) }', {variables: {id}});
}
let env = await readFile('.env','utf8');
env = env.replace(/^CRM_WORKSPACE_ID=.*\n?/gm,'') + `\nCRM_WORKSPACE_ID=${id}\n`;
await writeFile('.env',env,{mode:0o600});
console.log('Encompass workspace ready:',id);
