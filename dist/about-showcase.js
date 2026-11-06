/* Data Centre About showcase: local artwork, existing product handlers, no dependencies. */
(() => {
  'use strict';
  const section=document.querySelector('body:not(.marketing-page) #about');
  if(!section)return;
  const copy={
    en:{eyebrow:'ABOUT ENCOMPASS / DATA CENTRE',title:'Your business. A clearer direction.',body:'Encompass Corp. brings software development and business thinking together. Our Data Centre creates practical digital experiences shaped around your team, your customers and the way your business works.',explore:'Explore our solutions',showcase:'Explore our products',concept:'Concept preview',slides:[
      ['Legal Practice Software','Clarity for the work that matters.','Bring casework, documents and daily responsibilities into focus, with automated email and WhatsApp workflows available as part of an agreed implementation.','Based on an existing client implementation; adaptations are scoped for each firm.','Explore legal software'],
      ['Restaurant Digital Experience','Your menu. Brought to life.','Help guests explore dishes, review their choices and experience a digital ordering journey shaped around your restaurant.','Try our fictional menu demo. Live ordering and integrations are scoped separately.','Explore restaurant experience'],
      ['Client Relationship Management','Every connection. A clear next step.','We’re developing a connected workspace for Encompass’s own prospects, conversations and follow-ups, with future client implementations in mind.','In development','Explore the CRM concept']
    ]},
    fr:{eyebrow:'À PROPOS D’ENCOMPASS / CENTRE DE DONNÉES',title:'Votre entreprise. Un cap plus clair.',body:'Encompass Corp. réunit développement logiciel et réflexion métier. Notre Centre de données crée des expériences numériques pratiques, adaptées à votre équipe, à vos clients et au fonctionnement de votre entreprise.',explore:'Explorer nos solutions',showcase:'Découvrir nos produits',concept:'Aperçu conceptuel',slides:[
      ['Logiciel de gestion juridique','De la clarté pour le travail essentiel.','Clarifiez les dossiers, les documents et les responsabilités quotidiennes, avec des processus automatisés par e-mail et WhatsApp disponibles dans le cadre d’une mise en œuvre convenue.','Issu d’une réalisation pour un client ; les adaptations sont définies pour chaque cabinet.','Explorer le logiciel juridique'],
      ['Expérience numérique pour la restauration','Votre menu prend vie.','Aidez vos clients à découvrir les plats, revoir leurs choix et parcourir une expérience de commande numérique adaptée à votre restaurant.','Essayez notre carte fictive. Les commandes réelles et les intégrations sont définies séparément.','Explorer l’expérience restaurant'],
      ['Gestion de la relation client','Chaque relation. Une prochaine étape claire.','Nous développons un espace connecté pour les prospects, échanges et suivis d’Encompass, en gardant à l’esprit de futures mises en œuvre pour nos clients.','En développement','Explorer le concept CRM']
    ]},
    zh:{eyebrow:'关于 ENCOMPASS / 数据中心',title:'您的企业，更清晰的方向。',body:'Encompass Corp. 将软件开发与商业思维相结合。我们的数据中心围绕您的团队、客户和企业运作方式，打造实用的数字体验。',explore:'探索我们的解决方案',showcase:'探索我们的产品',concept:'概念预览',slides:[
      ['法律事务管理软件','让重要工作清晰有序。','聚焦案件、文件和日常职责，并可在约定的实施范围内提供自动化电子邮件和 WhatsApp 工作流程。','基于现有客户实施项目；针对每家事务所另行确定调整范围。','探索法律软件'],
      ['餐饮数字体验','让您的菜单生动呈现。','帮助宾客浏览菜品、查看选择，并体验围绕餐厅打造的数字点餐流程。','体验虚构菜单演示。真实点餐和集成将另行确定范围。','探索餐饮体验'],
      ['客户关系管理','每一次联系，都有清晰的下一步。','我们正在为 Encompass 自身的潜在客户、沟通和跟进开发互联工作空间，同时考虑未来面向客户的实施。','开发中','探索 CRM 概念']
    ]}
  };
  const c=()=>copy[document.documentElement.lang]||copy.en;
  section.classList.add('about-product-showcase');
  const showcase=section.querySelector('.about-showcase'),stage=section.querySelector('.as-stage');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,timer=null,visible=false,hovered=matchMedia('(hover: hover)').matches&&showcase.matches(':hover'),touch=null,pageActive=true;
  const panels=[];
  for(let i=0;i<3;i++){
    const panel=document.createElement('article');panel.className='as-slide';panel.id=`as-slide-${i}`;panel.setAttribute('role','group');panel.setAttribute('aria-roledescription','slide');
    panel.innerHTML='<figure class="as-visual"></figure><div class="as-copy"><p class="as-product"></p><h3></h3><p class="as-description"></p><p class="as-scope"></p><button type="button" class="as-cta"></button></div>';
    const visual=panel.querySelector('.as-visual');
    if(i<2){const name=i===0?'legal-desktop-chrome':'restaurant-digital-menu';visual.innerHTML=`<picture><source type="image/webp" srcset="assets/${name}.webp${i===1?'?v=be62858e200b':''}"><img src="assets/${name}.png${i===1?'?v=be62858e200b':''}" alt="" width="1536" height="1024" loading="lazy" decoding="async"></picture>`;}
    else{const svg=document.querySelector('.product-crm .crm-concept svg')?.cloneNode(true);if(svg){svg.setAttribute('aria-hidden','true');svg.querySelector('#crm-silver')?.setAttribute('id','as-crm-silver');svg.querySelectorAll('[stroke="url(#crm-silver)"]').forEach(node=>node.setAttribute('stroke','url(#as-crm-silver)'));visual.append(svg);}const caption=document.createElement('figcaption');caption.dataset.as='concept';visual.append(caption);}
    panel.querySelector('.as-cta').onclick=()=>{
      clear();if(document.querySelector('dialog[open]'))return;
      document.querySelector(`[data-product="${i}"]`).click();
      const dialog=document.querySelector(['#legal-dialog','#restaurant-dialog','#crm-dialog'][i]);
      const origin=panel.querySelector('.as-cta');
      dialog?.addEventListener('close',()=>{if(!document.activeElement.closest('#contact-form'))origin.focus({preventScroll:true});},{once:true});
    };
    stage.append(panel);panels.push(panel);
  }
  function clear(){if(timer!==null){clearTimeout(timer);timer=null;}}
  function eligible(){return pageActive&&visible&&!reduced.matches&&!hovered&&!touch&&!showcase.contains(document.activeElement)&&!document.hidden&&!document.querySelector('dialog[open]');}
  // One pending timeout only. Every resumed period starts with a full four seconds.
  function sync(){
    if(!eligible()){clear();return;}
    if(timer===null)timer=setTimeout(()=>{timer=null;if(eligible())select(index+1,false);sync();},4000);
  }
  function layout(){
    const isStatic=reduced.matches;stage.classList.toggle('as-static',isStatic);
    panels.forEach((panel,i)=>{const active=isStatic||i===index;panel.hidden=!active;panel.inert=!active;panel.setAttribute('aria-hidden',String(!active));});
  }
  function select(next,manual){
    if(reduced.matches)return;
    index=(next+3)%3;layout();
    panels[index].getAnimations().forEach(animation=>animation.cancel());
    panels[index].animate([{opacity:.25,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'ease-out'});
    if(manual)section.querySelector('#as-announcement').textContent=`${index+1} / 3: ${c().slides[index][0]}`;
  }
  function translate(){
    const roles={en:['carousel','slide'],fr:['carrousel','diapositive'],zh:['轮播','幻灯片']}[document.documentElement.lang]||['carousel','slide'];
    if(reduced.matches){showcase.removeAttribute('aria-roledescription');panels.forEach(panel=>panel.removeAttribute('aria-roledescription'));}else{showcase.setAttribute('aria-roledescription',roles[0]);panels.forEach(panel=>panel.setAttribute('aria-roledescription',roles[1]));}
    section.querySelectorAll('[data-as]').forEach(node=>node.textContent=c()[node.dataset.as]);showcase.setAttribute('aria-label',c().showcase);
    panels.forEach((panel,i)=>{const [product,title,description,scope,action]=c().slides[i];panel.setAttribute('aria-label',`${i+1} / 3: ${product}`);for(const [selector,text] of [['.as-product',product],['h3',title],['.as-description',description],['.as-scope',scope],['.as-cta',action]])panel.querySelector(selector).textContent=text;});
  }
  showcase.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){hovered=true;sync();}});
  showcase.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch'){hovered=false;sync();}});
  showcase.addEventListener('focusin',sync);
  showcase.addEventListener('focusout',()=>queueMicrotask(sync));
  showcase.addEventListener('touchstart',event=>{if(!reduced.matches&&event.touches.length===1)touch={x:event.touches[0].clientX,y:event.touches[0].clientY};else touch=null;sync();},{passive:true});
  showcase.addEventListener('touchcancel',()=>{touch=null;sync();},{passive:true});
  showcase.addEventListener('touchend',event=>{
    const start=touch;touch=null;
    if(start&&event.changedTouches.length&&!reduced.matches&&!showcase.contains(document.activeElement)){
      const dx=event.changedTouches[0].clientX-start.x,dy=event.changedTouches[0].clientY-start.y;
      if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){clear();select(index+(dx<0?1:-1),true);}
    }
    sync();
  },{passive:true});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.55;sync();},{threshold:[0,.55,1]}).observe(showcase);
  new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',()=>{pageActive=false;clear();});window.addEventListener('pageshow',()=>{pageActive=true;sync();});
  reduced.addEventListener('change',()=>{clear();const focused=panels.findIndex(panel=>panel.contains(document.activeElement));if(focused>=0)index=focused;panels.forEach(panel=>panel.getAnimations().forEach(animation=>animation.cancel()));layout();translate();sync();});
  document.querySelector('#language').addEventListener('change',()=>{clear();translate();sync();});
  translate();layout();sync();
})();
