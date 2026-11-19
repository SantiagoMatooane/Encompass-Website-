// Each phrase is matched as whole words in the current title or job summary.
export const functionPhrases = {
  Marketing: ['marketing', 'marketer', 'CMO', 'brand management', 'demand generation'],
  Sales: ['sales', 'account executive', 'business development'],
  Engineering: ['engineering', 'engineer', 'software developer', 'CTO'],
  Founder: ['founder', 'cofounder', 'founders', 'cofounders', 'founded', 'cofounded'],
  CEO: ['CEO', 'chief executive', 'managing director'],
  Operations: ['operations', 'COO', 'chief operating officer'],
  Finance: ['finance', 'financial', 'accounting', 'accountant', 'CFO', 'controller'],
  'Human resources': ['human resources', 'HR', 'recruiter', 'recruitment', 'talent acquisition', 'people operations'],
  Product: ['product manager', 'product management', 'product owner', 'head of product', 'chief product officer'],
  Design: ['design', 'designer', 'UX', 'UI'],
  'Customer success & support': ['customer success', 'customer support', 'customer service'],
  'Information technology': ['information technology', 'IT manager', 'IT director', 'IT support', 'systems administrator', 'CIO'],
  'Data & analytics': ['analytics', 'data analyst', 'data analysis', 'data engineer', 'data science', 'data scientist'],
  Legal: ['legal', 'counsel', 'lawyer', 'attorney'],
  Procurement: ['procurement', 'purchasing', 'sourcing']
};

export const businessFunctions = Object.keys(functionPhrases);
const words = value => String(value ?? '').toLowerCase().match(/[\p{L}\p{N}]+/gu)?.join(' ') || '';
export function detectFunctions(text, selected = businessFunctions) {
  const normalized = ' ' + words(text) + ' ';
  return selected.filter(label => functionPhrases[label].some(phrase =>
    normalized.includes(' ' + words(phrase) + ' ')));
}
