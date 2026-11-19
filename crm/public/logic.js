export const signalTypes = {
  rfp: {name:'Published RFP or supplier search', strength:4, relevance:'A stated procurement need can map directly to your service.', caveat:'Verify scope, eligibility, deadline and whether a supplier is already preferred.'},
  request: {name:'Direct pricing or demo request', strength:4, relevance:'A named contact has taken an action to evaluate an offer.', caveat:'Confirm authority, budget and timeline; a request is not a commitment.'},
  renewal: {name:'Contract renewal or replacement', strength:3, relevance:'A dated renewal creates a potential evaluation window.', caveat:'Confirm the renewal date and dissatisfaction; switching may not be intended.'},
  hiring: {name:'Hiring for a relevant function', strength:2, relevance:'A role can reveal an operational need connected to your offer.', caveat:'Hiring may mean they intend to solve the problem internally.'},
  expansion: {name:'New location or market expansion', strength:2, relevance:'Expansion can create new operating and customer acquisition needs.', caveat:'Confirm the need and timing; expansion alone does not prove budget.'},
  funding: {name:'Announced funding round', strength:1, relevance:'New capital may enable spending in a relevant function.', caveat:'Funding may be allocated elsewhere; it does not establish buying intent.'},
  technology: {name:'Technology migration', strength:3, relevance:'A relevant system change can create an implementation need.', caveat:'Verify migration scope and whether the vendor has already been selected.'},
  leadership: {name:'New decision-maker appointed', strength:1, relevance:'A new leader may review priorities or existing suppliers.', caveat:'A job change alone is not evidence of a purchase plan.'}
};
export function assessSignal(s, now = new Date()) {
 const t = signalTypes[s.type] || signalTypes.funding;
 const age = (now - new Date(s.date+'T00:00:00Z')) / 86400000;
 const sourced = /^https?:\/\//.test(s.source || '') && Number.isFinite(age) && age >= -1;
 const complete = sourced && Boolean(s.relevance?.trim()) && Boolean(s.observation?.trim());
 const stale = age > 90;
 const strength = !complete ? 1 : Math.max(1, t.strength - (stale ? 1 : 0));
 return {strength, stale, sourced, prediction:'Not estimated — no calibrated purchase outcomes', rationale:!complete?'Missing source, observation, date or service relevance; hold for review.':`${t.caveat}${stale?' Observation is over 90 days old; recheck before acting.':''}`, action:!complete || stale?'Verify evidence':strength >= 4?'Review procurement fit':'Research the need'};
}
export function clientSummary(clients) {
 const known = clients.filter(c => ['Won','Lost','Churned','Renewed'].includes(c.outcome));
 const won = known.filter(c=>['Won','Renewed'].includes(c.outcome)).length;
 return {total:clients.length, known:known.length, won, rate:known.length ? Math.round(won/known.length*100) : null};
}
