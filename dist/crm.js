/* Upcoming CRM presentation, scoped to the Data Centre's third solution. */
(() => {
  'use strict';
  const card=document.querySelector('body:not(.marketing-page) .product-crm');
  if(!card)return;
  const copy={
    en:{category:'03 / CRM',title:'Client Relationship Management',tagline:'Every connection. A clear next step.',description:'Bring prospects, conversations and follow-ups into one connected workspace, shaped around how your business builds relationships.',status:'In development',concept:'Concept preview',intro:'We’re developing this workspace for Encompass’s own client relationships, with future client implementations in mind.',focus:'Planned focus',items:['Organising prospects and client information.','Tracking conversations and next actions.','Viewing opportunities through a clear pipeline.'],note:'These are intended areas of focus, not verified available features.',cta:'Discuss your CRM needs',close:'Close CRM details'},
    fr:{category:'03 / CRM',title:'Gestion de la relation client',tagline:'Chaque relation. Une prochaine étape claire.',description:'Réunissez prospects, conversations et suivis dans un espace connecté, conçu autour de la manière dont votre entreprise développe ses relations.',status:'En développement',concept:'Aperçu conceptuel',intro:'Nous développons cet espace pour les relations clients d’Encompass, en gardant à l’esprit de futures mises en œuvre pour nos clients.',focus:'Axes de travail envisagés',items:['Organiser les informations sur les prospects et les clients.','Suivre les conversations et les prochaines actions.','Visualiser les opportunités dans un pipeline clair.'],note:'Il s’agit d’axes de travail envisagés, et non de fonctionnalités disponibles et vérifiées.',cta:'Discutons de vos besoins CRM',close:'Fermer les détails CRM'},
    zh:{category:'03 / CRM',title:'客户关系管理',tagline:'每一次联系，都有清晰的下一步。',description:'将潜在客户、沟通和跟进汇聚到互联的工作空间，围绕企业建立关系的方式而设计。',status:'开发中',concept:'概念预览',intro:'我们正在为 Encompass 自身的客户关系开发这一工作空间，同时考虑未来面向客户的实施。',focus:'计划关注的方向',items:['整理潜在客户和客户信息。','跟踪沟通和下一步行动。','通过清晰的销售管道查看商机。'],note:'以上是计划关注的方向，并非已经验证可用的功能。',cta:'讨论您的 CRM 需求',close:'关闭 CRM 详情'}
  };
  const dialog=document.createElement('dialog');
  dialog.id='crm-dialog';dialog.setAttribute('aria-labelledby','crm-title');
  dialog.innerHTML='<button type="button" id="crm-close">×</button><p class="eyebrow" data-crm="status"></p><h2 id="crm-title" tabindex="-1" data-crm="title"></h2><p class="crm-tagline" data-crm="tagline"></p><p data-crm="intro"></p><section aria-labelledby="crm-focus"><h3 id="crm-focus" data-crm="focus"></h3><ul id="crm-plans"></ul><p class="crm-planned-note" data-crm="note"></p></section><button type="button" class="solid-button" id="crm-enquire" data-crm="cta"></button>';
  document.body.append(dialog);
  const interest=document.querySelector('[data-crm-interest]');
  let enquiryPending=false;
  function translate(){
    const c=copy[document.documentElement.lang]||copy.en;
    for(const root of [card,dialog])root.querySelectorAll('[data-crm]').forEach(node=>node.textContent=c[node.dataset.crm]);
    card.setAttribute('aria-label',`${c.title} — ${c.status} — ${c.concept}`);
    dialog.querySelector('#crm-close').setAttribute('aria-label',c.close);
    const plans=dialog.querySelector('#crm-plans');plans.replaceChildren(...c.items.map(text=>{const item=document.createElement('li');item.textContent=text;return item;}));
    interest.textContent=c.title;interest.value=c.title;
  }
  translate();document.querySelector('#language').addEventListener('change',translate);
  card.onclick=()=>{translate();dialog.showModal();dialog.scrollTop=0;dialog.querySelector('#crm-title').focus({preventScroll:true});};
  dialog.querySelector('#crm-close').onclick=()=>dialog.close();
  dialog.querySelector('#crm-enquire').onclick=()=>{
    enquiryPending=true;document.querySelector('#interest').value=interest.value;dialog.close();
    document.querySelector('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const first=dialog.querySelector('#crm-close'),last=dialog.querySelector('#crm-enquire');
    if(event.shiftKey&&(document.activeElement===first||document.activeElement.id==='crm-title')){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  dialog.addEventListener('close',()=>{const target=enquiryPending?document.querySelector('#contact-form input[name="name"]'):card;enquiryPending=false;target.focus({preventScroll:true});});
})();
