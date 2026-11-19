import {detectFunctions} from './functions.js';
export const sizeBands = {
  '1–10': {gte:1,lte:10}, '11–50': {gte:11,lte:50},
  '51–200': {gte:51,lte:200}, '201–500': {gte:201,lte:500},
  '501–1,000': {gte:501,lte:1000}, '1,001–5,000': {gte:1001,lte:5000},
  '5,001+': {gte:5001}
};
export const sizes = Object.keys(sizeBands);
export const sectors = ['Software & IT','Professional services','Financial services','Healthcare','Manufacturing','Retail & e-commerce','Hospitality','Education','Construction & property','Transport & logistics','Other'];
export const targetIndustries = ['Accounting','Airlines/aviation','Automotive','Banking','Biotechnology','Chemicals','Civil engineering','Computer hardware','Computer software','Construction','Consumer goods','Education management','Electrical/electronic manufacturing','Financial services','Food & beverages','Higher education','Hospital & health care','Hospitality','Human resources','Information technology and services','Insurance','Internet','Legal services','Logistics and supply chain','Management consulting','Marketing and advertising','Mechanical or industrial engineering','Mining & metals','Oil & energy','Pharmaceuticals','Real estate','Retail','Staffing and recruiting','Telecommunications','Transportation/trucking/railroad','Wholesale'];
export const terms = value => (value || '').split(/[,\n]+/).map(x=>x.trim()).filter(Boolean);
export function restoreProfile(saved) {
  const company=saved.company || {}, person=saved.person || {};
  const industries=[...new Set([...terms(company.industries),...terms(person.industries)])];
  let selectedSizes=company.sizes || '';
  if (!selectedSizes && [company,person].some(p=>p.minEmployees || p.maxEmployees)) {
    const low=Math.max(...[company,person].map(p=>Number(p.minEmployees || 0)));
    const high=Math.min(...[company,person].map(p=>Number(p.maxEmployees || Infinity)));
    selectedSizes=sizes.filter(s=>(sizeBands[s].lte ?? Infinity)>=low && sizeBands[s].gte<=high).join('|');
  }
  const functions=new Set(terms(person.functions));
  const legacyTitles=[];
  for(const title of terms(person.titles)){
    const matches=person.functions !== undefined ? [] : detectFunctions(title);
    if(matches.length)matches.forEach(label=>functions.add(label));
    else legacyTitles.push(title);
  }
  return {...saved, profileVersion:3, company:{industries:industries.join(', '),sizes:selectedSizes,locations:company.locations || ''},
    person:{functions:[...functions].join(', '),titles:legacyTitles.join(', '),locations:person.locations || '',languages:person.languages || '',role:person.role || ''},
    anti:{},signals:[],savedObservations:saved.savedObservations ?? saved.signals ?? [],analysis:saved.profileVersion===3?saved.analysis:null};
}
