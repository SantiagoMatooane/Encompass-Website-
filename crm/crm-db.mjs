import {randomUUID} from 'node:crypto';
import {initializeApp, applicationDefault, cert, getApps} from 'firebase-admin/app';
import {getDataConnect} from 'firebase-admin/data-connect';
import {readFile} from 'node:fs/promises';

const source = await readFile(new URL('./dataconnect/crm/queries.gql', import.meta.url), 'utf8');
const operations = Object.fromEntries(source.split(/(?=^(?:query|mutation) )/m).slice(1).map(text => [text.match(/^(?:query|mutation) (\w+)/)[1], text]));
export const uuid = value => typeof value === 'string' && /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(value);
export function serverCredential() {
  return process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) : applicationDefault();
}
export function databaseClient() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Firebase project is not configured.');
  const app = getApps().find(a => a.name === 'crm') || initializeApp({projectId, credential: serverCredential()}, 'crm');
  return getDataConnect({serviceId: process.env.FIREBASE_SERVICE_ID, location: process.env.FIREBASE_LOCATION}, app);
}
export function validateClient(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter contact details.');
  const result = {};
  for (const field of ['name','company','position','email','phone']) {
    if (input[field] != null && typeof input[field] !== 'string') throw new Error('Invalid '+field+'.');
    const value = (input[field] || '').trim();
    if (value.length > 200) throw new Error(field+' must be under 200 characters.');
    result[field] = value || null;
  }
  if (!result.name || !result.company) throw new Error('Name and company are required.');
  if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) throw new Error('Enter a valid email address.');
  if (result.email) result.email = result.email.toLowerCase();
  return result;
}
export function createCRM(dc, workspaceId) {
  if (!uuid(workspaceId)) throw new Error('CRM workspace is not configured.');
  return {
    async list({offset = 0, limit = 20} = {}) {
      if (!Number.isInteger(offset) || offset < 0 || offset > 100000 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Invalid pagination.');
      const {data} = await dc.executeGraphqlRead(operations.ListLeads, {variables: {workspaceId, offset, limit: limit + 1}});
      return {leads: data.contacts.slice(0, limit), hasMore: data.contacts.length > limit, offset};
    },
    async icpContext() {
      const {data} = await dc.executeGraphqlRead(operations.ICPClientContext, {variables: {workspaceId, limit: 101}});
      const sample = data.contacts.slice(0, 100);
      const companies = new Map();
      for (const {company} of sample) {
        if (!companies.has(company.id)) companies.set(company.id, {
          name: company.name, industry: company.industry ?? null, country: company.country ?? null
        });
      }
      return {
        source: 'CRM client records in the configured workspace',
        sampledClientContacts: sample.length,
        truncated: data.contacts.length > 100,
        companies: [...companies.values()],
        limitations: 'At most 100 client contacts, ordered by ID. Companies are deduplicated within this sample. Client status is not evidence of a won deal, revenue, buying intent or a representative market sample.'
      };
    },
    async clients() {
      const contacts = [];
      for (let offset = 0; ; offset += 500) {
        const {data} = await dc.executeGraphqlRead(operations.ListClients, {variables: {workspaceId, offset, limit: 500}});
        contacts.push(...data.contacts);
        if (data.contacts.length < 500) return {clients: contacts};
      }
    },
    async createClient(input) {
      const {company, ...contact} = validateClient(input);
      const {data: found} = await dc.executeGraphqlRead(operations.FindCompany, {variables: {workspaceId, name: company}});
      const companyId = found.companies[0]?.id || randomUUID();
      const variables = {workspaceId, companyId, ...contact};
      if (!found.companies.length) variables.company = company;
      const {data} = await dc.executeGraphql(found.companies.length ? operations.CreateClient : operations.CreateClientAndCompany, {variables});
      return {id: data.contact_insert.id};
    },
    async promote(contactId) {
      if (!uuid(contactId)) throw new Error('Invalid contact ID.');
      const {data} = await dc.executeGraphql(operations.PromoteLeadToClient, {variables: {workspaceId, contactId}});
      return {added: data.contact_updateMany === 1};
    }
  };
}
