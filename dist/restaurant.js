/* Data Centre restaurant presentation. All menu content is fictional and local. */
(() => {
  'use strict';
  const trigger = document.querySelector('body:not(.marketing-page) [data-product="1"]');
  if (!trigger) return;
  const copy = {
    en: {
      title:'Restaurant Digital Experience', kicker:'Your menu. Brought to life.', category:'02 / RESTAURANT',
      description:'Help guests explore dishes, understand their options, and take the next step through a digital menu shaped around your restaurant.',
      audience:'For restaurants, cafés and hospitality venues', intro:'Give guests a welcoming way to explore your offering, whether they are planning a visit or sitting at your table.',
      includesTitle:'A menu with your venue’s character', includes:['Organise menu categories with dish photography, clear descriptions, prices and labelled dietary information.','Share venue details and the booking or contact links agreed for your restaurant.','Shape the branding, prepare menu content, and agree implementation and support around your needs.'],
      scopeTitle:'Agree the next step together', scope:'Ordering, payments, POS integration and menu-management tools are separately scoped capabilities. They are not automatically included.',
      explore:'Explore a sample menu', enquire:'Discuss your restaurant experience', close:'Close restaurant details',
      artNote:'Conceptual artwork, not a working ordering screen. Use either sample-menu button to explore the live demo.',
      demo:'Demo — fictional menu', demoNote:'Fictional dishes and sample USD prices. Browse categories and dish details only; ordering is not available.',
      backDetails:'Back to restaurant details', backMenu:'Back to menu', menu:'Our menu', tagline:'Something good is on the menu.', menuIntro:'A fresh plate, a sweet finish, a moment to enjoy. Find your next favourite at our fictional venue.',
      categories:['All dishes','Plates','Something sweet','Drinks'], viewDish:'View dish details', price:'Sample price (USD)', dietary:'Dietary information',
      allergy:'Sample dietary information only. At a real venue, confirm ingredients and allergens with staff.', venue:'The Copper Table is a fictional venue. Booking and contact links are agreed for each real restaurant.',
      dishNames:['Signature burger','Roasted garden bowl','Citrus cloud cake','Peach iced tea'],
      dishDescriptions:['Grilled beef patty, cheddar, caramelised onions and fresh greens in a toasted brioche bun.','Roasted seasonal vegetables, herbed grains and crisp leaves with a sesame dressing.','A soft lemon sponge with whipped cream and a bright citrus glaze.','Slow-brewed black tea with peach, lemon and a little afternoon sunshine.'],
      dishDietary:['Contains gluten and dairy.','Vegan. Contains sesame.','Vegetarian. Contains gluten, eggs and dairy.','Vegan. Contains peach and citrus.']
    },
    fr: {
      title:'Expérience numérique pour la restauration', kicker:'Votre menu prend vie.', category:'02 / RESTAURATION',
      description:'Aidez vos clients à découvrir les plats, comprendre leurs options et passer à l’étape suivante grâce à un menu numérique conçu pour votre établissement.',
      audience:'Pour les restaurants, cafés et établissements d’accueil', intro:'Offrez à vos clients une façon accueillante de découvrir votre carte, avant leur visite ou une fois à table.',
      includesTitle:'Une carte à l’image de votre établissement', includes:['Organisez les catégories avec des photographies de plats, des descriptions claires, des prix et des informations alimentaires identifiées.','Présentez l’établissement et les liens de réservation ou de contact convenus pour votre restaurant.','Définissez l’identité visuelle, préparez le contenu de la carte et convenez de la mise en œuvre et du support.'],
      scopeTitle:'Définir ensemble la suite', scope:'La commande, les paiements, l’intégration au système de caisse et les outils de gestion de carte font l’objet d’un périmètre distinct. Ils ne sont pas inclus automatiquement.',
      explore:'Explorer un exemple de carte', enquire:'Discutons de votre expérience restaurant', close:'Fermer les détails du restaurant',
      artNote:'Visuel conceptuel, pas un écran de commande fonctionnel. Utilisez l’un des deux boutons pour explorer la démonstration.',
      demo:'Démo — carte fictive', demoNote:'Plats fictifs et prix indicatifs en dollars américains. Parcourez les catégories et les détails ; la commande n’est pas disponible.',
      backDetails:'Retour aux détails du restaurant', backMenu:'Retour à la carte', menu:'Notre carte', tagline:'De belles découvertes à la carte.', menuIntro:'Une assiette fraîche, une touche sucrée, un moment à savourer. Découvrez notre établissement fictif.',
      categories:['Tous les plats','Assiettes','Une touche sucrée','Boissons'], viewDish:'Voir les détails du plat', price:'Prix indicatif (USD)', dietary:'Informations alimentaires',
      allergy:'Informations alimentaires fictives. Dans un établissement réel, confirmez les ingrédients et allergènes auprès de l’équipe.', venue:'The Copper Table est un établissement fictif. Les liens de réservation et de contact sont convenus pour chaque restaurant réel.',
      dishNames:['Burger signature','Bol de légumes rôtis','Gâteau nuage aux agrumes','Thé glacé à la pêche'],
      dishDescriptions:['Bœuf grillé, cheddar, oignons caramélisés et verdure dans un pain brioché toasté.','Légumes de saison rôtis, céréales aux herbes et feuilles croquantes, sauce au sésame.','Génoise moelleuse au citron, crème fouettée et glaçage aux agrumes.','Thé noir infusé lentement, pêche et citron pour une pause ensoleillée.'],
      dishDietary:['Contient du gluten et du lait.','Végane. Contient du sésame.','Végétarien. Contient du gluten, des œufs et du lait.','Végane. Contient de la pêche et des agrumes.']
    },
    zh: {
      title:'餐饮数字体验', kicker:'让您的菜单生动呈现。', category:'02 / 餐饮',
      description:'通过为餐厅量身设计的数字菜单，帮助宾客探索菜品、了解选择并迈出下一步。',
      audience:'适用于餐厅、咖啡馆及接待场所', intro:'无论宾客正在计划到访，还是已经入座，都能以亲切直观的方式了解您的餐饮特色。',
      includesTitle:'呈现您的餐厅个性', includes:['按类别组织菜单，展示菜品照片、清晰的描述、价格及标注的饮食信息。','提供场所详情，以及双方商定的预订或联系链接。','围绕需求商定品牌视觉、菜单内容准备、实施与支持。'],
      scopeTitle:'共同商定下一步', scope:'点餐、支付、收银系统集成和菜单管理工具需要单独确定范围，并非默认包含的功能。',
      explore:'探索示例菜单', enquire:'讨论您的餐饮体验', close:'关闭餐饮详情',
      artNote:'这是概念视觉，并非可用的点餐界面。请选择任一示例菜单按钮体验实际演示。',
      demo:'演示 — 虚构菜单', demoNote:'菜品均为虚构，价格为美元示例。仅支持浏览类别和菜品详情，不提供点餐功能。',
      backDetails:'返回餐饮详情', backMenu:'返回菜单', menu:'我们的菜单', tagline:'美好滋味，等您发现。', menuIntro:'一份新鲜菜肴，一口甜蜜收尾，一段惬意时光。探索这家虚构餐厅，寻找心仪滋味。',
      categories:['全部菜品','主食','甜点','饮品'], viewDish:'查看菜品详情', price:'示例价格（美元）', dietary:'饮食信息',
      allergy:'饮食信息仅供示例展示。在真实场所，请向工作人员确认配料及过敏原。', venue:'The Copper Table 是一家虚构餐厅。真实餐厅的预订和联系链接将另行商定。',
      dishNames:['招牌汉堡','烤蔬菜谷物碗','柑橘云朵蛋糕','蜜桃冰茶'],
      dishDescriptions:['烤牛肉饼、切达奶酪、焦糖洋葱与新鲜绿叶菜，搭配烘烤布里欧面包。','时令烤蔬菜、香草谷物及爽脆绿叶菜，搭配芝麻酱汁。','松软柠檬海绵蛋糕，搭配打发奶油和清新柑橘糖霜。','慢泡红茶加入蜜桃与柠檬，带来轻松明亮的午后滋味。'],
      dishDietary:['含麸质和乳制品。','纯素。含芝麻。','蛋奶素。含麸质、鸡蛋和乳制品。','纯素。含蜜桃和柑橘。']
    }
  };
  const dialog = document.createElement('dialog');
  dialog.id = 'restaurant-dialog';
  dialog.setAttribute('aria-labelledby','restaurant-title');
  document.body.append(dialog);
  const t = () => copy[document.documentElement.lang] || copy.en;
  const dishes = [
    {category:1, price:16.90, art:'🍔', tone:'burger'},
    {category:1, price:13.50, art:'🥗', tone:'garden'},
    {category:2, price:7.50, art:'🍰', tone:'cake'},
    {category:3, price:4.00, art:'🍹', tone:'tea'}
  ];
  let view = 'details', category = 0, selectedDish = 0, origin = 'restaurant-explore', enquiryPending = false;
  const artwork = `<picture><source srcset="assets/restaurant-digital-menu.webp" type="image/webp"><img src="assets/restaurant-digital-menu.png" alt="" width="1536" height="1024"></picture>`;
  const price = i => '$' + dishes[i].price.toFixed(2);
  function animate() {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) dialog.querySelector('.restaurant-view').animate([{opacity:.3,transform:'scale(.98)'},{opacity:1,transform:'scale(1)'}],{duration:220,easing:'ease-out'});
  }
  const contentRoot = document.createElement('div');
  const announcement = document.createElement('p');
  announcement.className = 'restaurant-sr-only';
  announcement.setAttribute('role','status');
  announcement.setAttribute('aria-live','polite');
  dialog.append(contentRoot,announcement);
  function render(focusId = 'restaurant-title') {
    const c = t();
    dialog.classList.toggle('restaurant-menu',view !== 'details');
    let content;
    if (view === 'details') content = `<p class="restaurant-eyebrow">ENCOMPASS / DATA</p><h2 id="restaurant-title" tabindex="-1">${c.title}</h2><p class="restaurant-lead">${c.kicker}</p><p>${c.description}</p><div class="restaurant-entry"><button type="button" id="restaurant-art-entry" aria-label="${c.explore}">${artwork}<span class="restaurant-entry-label">${c.explore} ↗</span></button><div><p class="restaurant-caption">${c.artNote}</p><button type="button" class="restaurant-primary" id="restaurant-explore">${c.explore} ↗</button></div></div><h3>${c.audience}</h3><p>${c.intro}</p><h3>${c.includesTitle}</h3><ul>${c.includes.map(item=>`<li>${item}</li>`).join('')}</ul><h3>${c.scopeTitle}</h3><p>${c.scope}</p><button type="button" class="restaurant-primary" data-enquire>${c.enquire} ↗</button>`;
    if (view === 'menu') content = `<button type="button" id="restaurant-back-details">← ${c.backDetails}</button><div class="restaurant-menu-brand"><span aria-hidden="true">✳</span><span>THE COPPER TABLE</span></div><p class="restaurant-demo">${c.demo}</p><div class="restaurant-menu-hero"><p class="restaurant-eyebrow">${c.menu}</p><h2 id="restaurant-title" tabindex="-1">${c.tagline}</h2><p>${c.menuIntro}</p><span class="restaurant-sun" aria-hidden="true">✺</span></div><p class="restaurant-caption">${c.demoNote}</p><nav class="restaurant-categories" aria-label="${c.menu}">${c.categories.map((name,i)=>`<button type="button" data-category="${i}" aria-pressed="${category===i}">${name}</button>`).join('')}</nav><div class="restaurant-dishes">${dishes.map((dish,i)=>category===0||dish.category===category?`<button type="button" class="restaurant-dish" data-dish="${i}" aria-label="${c.viewDish}: ${c.dishNames[i]}"><span class="restaurant-dish-art ${dish.tone}" aria-hidden="true">${dish.art}</span><span class="restaurant-dish-copy"><strong>${c.dishNames[i]}</strong><span>${c.dishDescriptions[i]}</span><span class="restaurant-dietary">${c.dishDietary[i]}</span><span class="restaurant-dish-bottom"><b>${price(i)}</b><span>${c.viewDish} ↗</span></span></span></button>`:'').join('')}</div><p class="restaurant-caption">${c.allergy}</p><footer class="restaurant-menu-footer"><p>${c.venue}</p><button type="button" data-enquire>${c.enquire} ↗</button></footer>`;
    if (view === 'dish') content = `<button type="button" id="restaurant-back-menu">← ${c.backMenu}</button><p class="restaurant-demo">${c.demo}</p><div class="restaurant-dish-detail"><div class="restaurant-dish-art ${dishes[selectedDish].tone}" aria-hidden="true">${dishes[selectedDish].art}</div><div><p class="restaurant-eyebrow">${c.categories[dishes[selectedDish].category]}</p><h2 id="restaurant-title" tabindex="-1">${c.dishNames[selectedDish]}</h2><p>${c.dishDescriptions[selectedDish]}</p><p class="restaurant-price"><span>${c.price}</span><strong>${price(selectedDish)}</strong></p><h3>${c.dietary}</h3><p>${c.dishDietary[selectedDish]}</p><p class="restaurant-caption">${c.allergy}</p><p class="restaurant-caption">${c.demoNote}</p></div></div>`;
    contentRoot.innerHTML = `<button type="button" class="restaurant-close" aria-label="${c.close}">×</button><div class="restaurant-view">${content}</div>`;
    dialog.querySelector('.restaurant-close').onclick = () => dialog.close();
    dialog.querySelectorAll('[data-enquire]').forEach(button=>button.onclick=enquire);
    dialog.querySelectorAll('#restaurant-art-entry,#restaurant-explore').forEach(button=>button.onclick=()=>{origin=button.id;view='menu';category=0;render();animate();});
    const backDetails=dialog.querySelector('#restaurant-back-details');
    if (backDetails) backDetails.onclick=()=>{view='details';render(origin);};
    const backMenu=dialog.querySelector('#restaurant-back-menu');
    if (backMenu) backMenu.onclick=()=>{view='menu';render(`restaurant-dish-${selectedDish}`);};
    dialog.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>{category=Number(button.dataset.category);render(`restaurant-category-${category}`);});
    dialog.querySelectorAll('[data-dish]').forEach(button=>button.onclick=()=>{selectedDish=Number(button.dataset.dish);view='dish';render();});
    dialog.querySelectorAll('[data-category]').forEach(button=>button.id=`restaurant-category-${button.dataset.category}`);
    dialog.querySelectorAll('[data-dish]').forEach(button=>button.id=`restaurant-dish-${button.dataset.dish}`);
    announcement.textContent = view === 'menu' ? `${c.categories[category]}: ${category === 0 ? dishes.length : dishes.filter(d=>d.category===category).length}` : '';
    // Keep category navigation in place; other screen changes start at the heading.
    dialog.querySelector('#'+focusId)?.focus({preventScroll:focusId.startsWith('restaurant-category-')});
    if (!focusId.startsWith('restaurant-category-') && focusId === 'restaurant-title') dialog.scrollTop=0;
  }
  function enquire() {
    enquiryPending=true; dialog.close();
    document.querySelector('#interest').selectedIndex=2;
    document.querySelector('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  trigger.onclick=()=>{view='details';category=0;render();dialog.showModal();dialog.scrollTop=0;dialog.querySelector('#restaurant-title').focus({preventScroll:true});};
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape' && view!=='details') {event.preventDefault();event.stopPropagation();if(view==='dish'){view='menu';render(`restaurant-dish-${selectedDish}`);}else{view='details';render(origin);}return;}
    if(event.key!=='Tab')return;
    const controls=[...dialog.querySelectorAll('button')],first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&(document.activeElement===first||document.activeElement.id==='restaurant-title')){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  dialog.addEventListener('close',()=>{const destination=enquiryPending?document.querySelector('#contact-form input[name="name"]'):trigger;enquiryPending=false;destination.focus({preventScroll:true});});
  document.querySelector('#language').addEventListener('change',()=>{if(dialog.open)render();});
})();
