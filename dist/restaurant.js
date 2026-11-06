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
      demo:'Demo — fictional menu',
      backDetails:'Back to restaurant details', backMenu:'Back to menu', menu:'Our menu', tagline:'Something good is on the menu.', menuIntro:'A fresh plate, a sweet finish, a moment to enjoy. Find your next favourite at our fictional venue.',
      categories:['All dishes','Plates','Something sweet','Drinks'], viewDish:'View dish details', price:'Sample price (USD)', dietary:'Dietary information',
      allergy:'Demo recipe: ingredients and allergens are not verified.',
      dishNames:['Signature burger','Roasted garden bowl','Citrus cloud cake','Peach iced tea'],
      dishDescriptions:['A grilled beef burger with melted cheese in a sesame-seed bun, served with golden fries.','A colourful bowl of grilled vegetables, grains, chickpeas, avocado and fresh leaves, with dressing on the side.','A golden citrus cake slice, dusted with icing sugar and finished with a citrus wedge and fresh mint.','Refreshing peach iced tea served over ice with fruit slices and a fresh mint garnish.'],
      dishDietary:Array(4).fill('Demo recipe: ingredients and allergens are not verified.')
    },
    fr: {
      title:'Expérience numérique pour la restauration', kicker:'Votre menu prend vie.', category:'02 / RESTAURATION',
      description:'Aidez vos clients à découvrir les plats, comprendre leurs options et passer à l’étape suivante grâce à un menu numérique conçu pour votre établissement.',
      audience:'Pour les restaurants, cafés et établissements d’accueil', intro:'Offrez à vos clients une façon accueillante de découvrir votre carte, avant leur visite ou une fois à table.',
      includesTitle:'Une carte à l’image de votre établissement', includes:['Organisez les catégories avec des photographies de plats, des descriptions claires, des prix et des informations alimentaires identifiées.','Présentez l’établissement et les liens de réservation ou de contact convenus pour votre restaurant.','Définissez l’identité visuelle, préparez le contenu de la carte et convenez de la mise en œuvre et du support.'],
      scopeTitle:'Définir ensemble la suite', scope:'La commande, les paiements, l’intégration au système de caisse et les outils de gestion de carte font l’objet d’un périmètre distinct. Ils ne sont pas inclus automatiquement.',
      explore:'Explorer un exemple de carte', enquire:'Discutons de votre expérience restaurant', close:'Fermer les détails du restaurant',
      artNote:'Visuel conceptuel, pas un écran de commande fonctionnel. Utilisez l’un des deux boutons pour explorer la démonstration.',
      demo:'Démo — carte fictive',
      backDetails:'Retour aux détails du restaurant', backMenu:'Retour à la carte', menu:'Notre carte', tagline:'De belles découvertes à la carte.', menuIntro:'Une assiette fraîche, une touche sucrée, un moment à savourer. Découvrez notre établissement fictif.',
      categories:['Tous les plats','Assiettes','Une touche sucrée','Boissons'], viewDish:'Voir les détails du plat', price:'Prix indicatif (USD)', dietary:'Informations alimentaires',
      allergy:'Recette de démonstration : les ingrédients et les allergènes ne sont pas vérifiés.',
      dishNames:['Burger signature','Bol de légumes rôtis','Gâteau nuage aux agrumes','Thé glacé à la pêche'],
      dishDescriptions:['Un burger de bœuf grillé avec du fromage fondu dans un pain aux graines de sésame, servi avec des frites dorées.','Un bol coloré de légumes grillés, de céréales, de pois chiches, d’avocat et de feuilles fraîches, avec la sauce à part.','Une tranche de gâteau doré aux agrumes, saupoudrée de sucre glace et garnie d’un quartier d’agrume et de menthe fraîche.','Un thé glacé rafraîchissant à la pêche, servi sur des glaçons avec des tranches de fruits et une garniture de menthe fraîche.'],
      dishDietary:Array(4).fill('Recette de démonstration : les ingrédients et les allergènes ne sont pas vérifiés.')
    },
    zh: {
      title:'餐饮数字体验', kicker:'让您的菜单生动呈现。', category:'02 / 餐饮',
      description:'通过为餐厅量身设计的数字菜单，帮助宾客探索菜品、了解选择并迈出下一步。',
      audience:'适用于餐厅、咖啡馆及接待场所', intro:'无论宾客正在计划到访，还是已经入座，都能以亲切直观的方式了解您的餐饮特色。',
      includesTitle:'呈现您的餐厅个性', includes:['按类别组织菜单，展示菜品照片、清晰的描述、价格及标注的饮食信息。','提供场所详情，以及双方商定的预订或联系链接。','围绕需求商定品牌视觉、菜单内容准备、实施与支持。'],
      scopeTitle:'共同商定下一步', scope:'点餐、支付、收银系统集成和菜单管理工具需要单独确定范围，并非默认包含的功能。',
      explore:'探索示例菜单', enquire:'讨论您的餐饮体验', close:'关闭餐饮详情',
      artNote:'这是概念视觉，并非可用的点餐界面。请选择任一示例菜单按钮体验实际演示。',
      demo:'演示 — 虚构菜单',
      backDetails:'返回餐饮详情', backMenu:'返回菜单', menu:'我们的菜单', tagline:'美好滋味，等您发现。', menuIntro:'一份新鲜菜肴，一口甜蜜收尾，一段惬意时光。探索这家虚构餐厅，寻找心仪滋味。',
      categories:['全部菜品','主食','甜点','饮品'], viewDish:'查看菜品详情', price:'示例价格（美元）', dietary:'饮食信息',
      allergy:'演示食谱：配料和过敏原未经核实。',
      dishNames:['招牌汉堡','烤蔬菜谷物碗','柑橘云朵蛋糕','蜜桃冰茶'],
      dishDescriptions:['烤牛肉汉堡搭配融化的奶酪，夹在芝麻面包中，配以金黄薯条。','色彩丰富的一碗烤蔬菜、谷物、鹰嘴豆、牛油果和新鲜叶菜，酱汁另配。','金黄的柑橘蛋糕切片，撒上糖粉，饰以柑橘角和新鲜薄荷。','清爽的蜜桃冰茶，加冰饮用，搭配水果切片和新鲜薄荷装饰。'],
      dishDietary:Array(4).fill('演示食谱：配料和过敏原未经核实。')
    }
  };
  const journeyCopy = {
    en: {
      brand:'Peachlight Kitchen', subtitle:'An Encompass fictional restaurant',
      venue:'Peachlight Kitchen is an Encompass fictional restaurant. Booking and contact links are agreed for each real venue.',
      demoNote:'Fictional dishes and sample prices. Ordering is simulated locally: nothing is sent or charged.',
      sessionNote:'Your table and cart stay while you browse. Restarting or opening a fresh demo clears them.',
      tableTitle:'Choose your table', tableLabel:'Table', tablePlaceholder:'Choose your table', tableOption:'Table {number}', tableSave:'Use this table', tableChange:'Change table', tableBrowse:'Browse menu first',
      tableNote:'Fictional tables 1–12. These numbers do not indicate availability, reservations or occupancy.', tableRequired:'Choose a table before placing your demo order.', tableSaved:'Table updated. Your cart is unchanged.',
      cart:'Cart', cartTitle:'Your demo cart', cartEmpty:'Your cart is empty. Explore a dish and add something you like.', browse:'Browse menu', quantity:'Quantity', unit:'Unit price', lineTotal:'Line total', total:'Total',
      increase:'Increase quantity', decrease:'Decrease quantity', remove:'Remove', add:'Add to cart', added:'Added to cart', removed:'Item removed.', updated:'Cart updated.', limit:'This demo allows up to 99 of each dish.',
      place:'Place demo order', placing:'Confirming your demo…', confirmed:'Your demo order is confirmed.',
      disclosure:'This is a demonstration. No order has been sent to a restaurant and no payment has been taken.', reference:'Demo reference', newOrder:'Start a new demo order', restart:'Restart demo', restarted:'New demo started. Table and cart cleared.',
      guide:'Optional guide', steps:['Choose a table.','Explore a dish and add it.','Review or edit your cart.','Place a demo order.'], hints:['Use the table selector. You can browse first.','Open a dish, choose its quantity, then select Add to cart.','Open Cart to check quantities and the total.','With a table and items selected, choose Place demo order.'], guideDone:'You’ve completed the demo journey.', step:'Step', of:'of',
      backCart:'Back to cart', orderNote:'Sample USD prices only. No payment, taxes or extra charges are applied.'
    },
    fr: {
      brand:'Peachlight Kitchen', subtitle:'Un restaurant fictif d’Encompass',
      venue:'Peachlight Kitchen est un restaurant fictif d’Encompass. Les liens de réservation et de contact sont convenus pour chaque établissement réel.',
      demoNote:'Plats fictifs et prix indicatifs. La commande est simulée localement : rien n’est envoyé ni facturé.',
      sessionNote:'Votre table et votre panier sont conservés pendant la visite. Un redémarrage ou une nouvelle démo les efface.',
      tableTitle:'Choisissez votre table', tableLabel:'Table', tablePlaceholder:'Choisissez votre table', tableOption:'Table {number}', tableSave:'Utiliser cette table', tableChange:'Changer de table', tableBrowse:'Parcourir la carte d’abord',
      tableNote:'Tables fictives de 1 à 12. Ces numéros n’indiquent aucune disponibilité, réservation ou occupation.', tableRequired:'Choisissez une table avant de passer la commande de démonstration.', tableSaved:'Table mise à jour. Votre panier est inchangé.',
      cart:'Panier', cartTitle:'Votre panier de démonstration', cartEmpty:'Votre panier est vide. Explorez un plat et ajoutez ce qui vous plaît.', browse:'Parcourir la carte', quantity:'Quantité', unit:'Prix unitaire', lineTotal:'Sous-total', total:'Total',
      increase:'Augmenter la quantité', decrease:'Diminuer la quantité', remove:'Retirer', add:'Ajouter au panier', added:'Ajouté au panier', removed:'Article retiré.', updated:'Panier mis à jour.', limit:'Cette démo autorise jusqu’à 99 unités par plat.',
      place:'Passer la commande de démonstration', placing:'Confirmation de la démo…', confirmed:'Votre commande de démonstration est confirmée.',
      disclosure:'Ceci est une démonstration. Aucune commande n’a été envoyée à un restaurant et aucun paiement n’a été effectué.', reference:'Référence de démonstration', newOrder:'Commencer une nouvelle commande de démonstration', restart:'Recommencer la démo', restarted:'Nouvelle démo commencée. Table et panier effacés.',
      guide:'Guide facultatif', steps:['Choisissez une table.','Explorez un plat et ajoutez-le.','Vérifiez ou modifiez votre panier.','Passez une commande de démonstration.'], hints:['Utilisez le sélecteur de table. Vous pouvez d’abord parcourir la carte.','Ouvrez un plat, choisissez sa quantité puis Ajouter au panier.','Ouvrez Panier pour vérifier les quantités et le total.','Avec une table et des articles, choisissez Passer la commande de démonstration.'], guideDone:'Vous avez terminé le parcours de démonstration.', step:'Étape', of:'sur',
      backCart:'Retour au panier', orderNote:'Prix indicatifs en dollars américains. Aucun paiement, taxe ou supplément n’est appliqué.'
    },
    zh: {
      brand:'Peachlight Kitchen', subtitle:'Encompass 虚构餐厅',
      venue:'Peachlight Kitchen 是 Encompass 的虚构餐厅。真实场所的预订和联系链接将另行商定。',
      demoNote:'虚构菜品和示例价格。点餐仅在本地模拟，不会发送订单或收取费用。',
      sessionNote:'浏览期间会保留餐桌与购物车。重新开始或打开新演示时会清空。',
      tableTitle:'选择您的餐桌', tableLabel:'餐桌', tablePlaceholder:'选择您的餐桌', tableOption:'{number} 号桌', tableSave:'使用此餐桌', tableChange:'更换餐桌', tableBrowse:'先浏览菜单',
      tableNote:'虚构餐桌编号为 1–12。这些编号不表示可用性、预订或实际占用情况。', tableRequired:'提交演示订单前请选择餐桌。', tableSaved:'餐桌已更新，购物车未改变。',
      cart:'购物车', cartTitle:'您的演示购物车', cartEmpty:'购物车为空。探索菜品并添加您喜欢的内容。', browse:'浏览菜单', quantity:'数量', unit:'单价', lineTotal:'小计', total:'合计',
      increase:'增加数量', decrease:'减少数量', remove:'移除', add:'加入购物车', added:'已加入购物车', removed:'已移除菜品。', updated:'购物车已更新。', limit:'本演示每种菜品最多可选 99 份。',
      place:'提交演示订单', placing:'正在确认演示订单…', confirmed:'您的演示订单已确认。',
      disclosure:'这是演示。没有向任何餐厅发送订单，也没有收取任何付款。', reference:'演示编号', newOrder:'开始新的演示订单', restart:'重新开始演示', restarted:'已开始新演示，餐桌与购物车已清空。',
      guide:'可选引导', steps:['选择餐桌。','探索菜品并添加。','查看或编辑购物车。','提交演示订单。'], hints:['使用餐桌选择器，也可以先浏览菜单。','打开菜品，选择数量，再选择加入购物车。','打开购物车，检查数量和合计。','选好餐桌和菜品后，选择提交演示订单。'], guideDone:'您已完成演示流程。', step:'步骤', of:'/',
      backCart:'返回购物车', orderNote:'价格仅为美元示例。不会付款，也不收取税费或额外费用。'
    }
  };
  Object.entries(journeyCopy).forEach(([language,values])=>Object.assign(copy[language],values));
  const currencyCopy={
    en:{currency:'Display currency',preview:'Preview currencies',play:'Play',pause:'Pause',rates:'Approximate demo conversions—not live exchange rates.',price:'Sample price',submitted:'Submitted currency'},
    fr:{currency:'Devise affichée',preview:'Aperçu des devises',play:'Démarrer',pause:'Pause',rates:'Conversions approximatives de démonstration — pas des taux de change en direct.',price:'Prix indicatif',submitted:'Devise de la commande'},
    zh:{currency:'显示货币',preview:'预览货币',play:'播放',pause:'暂停',rates:'演示换算仅供参考，并非实时汇率。',price:'示例价格',submitted:'提交时的货币'}
  };
  Object.entries(currencyCopy).forEach(([language,values])=>Object.assign(copy[language],values));
  copy.en.orderNote='Base prices are in USD. Displayed conversions are illustrative. No payment, taxes or extra fees.';
  copy.fr.orderNote='Les prix de base sont en USD. Les conversions affichées sont indicatives. Aucun paiement, taxe ni frais supplémentaire.';
  copy.zh.orderNote='基础价格以美元计。显示的换算仅供演示，不涉及付款、税款或额外费用。';
  const dialog = document.createElement('dialog');
  dialog.id = 'restaurant-dialog';
  dialog.setAttribute('aria-labelledby','restaurant-title');
  document.body.append(dialog);
  const t = () => copy[document.documentElement.lang] || copy.en;
  const dishes = [
    {category:1, cents:1690, image:{file:'signature-burger',width:1050,height:1400,card:'36% 36%',detail:'36% 47%',fit:'cover'}},
    {category:1, cents:1350, image:{file:'garden-bowl',width:1398,height:1400,card:'50% 62%',detail:'50% 50%',fit:'cover'}},
    {category:2, cents:750, image:{file:'citrus-cake',width:1007,height:1400,card:'50% 53%',detail:'50% 57%',fit:'cover'}},
    {category:3, cents:400, image:{file:'peach-iced-tea',width:1000,height:1000,card:'50% 50%',detail:'50% 50%',fit:'contain'}}
  ];
  const MAX_QUANTITY=99;
  let view='details', category=0, selectedDish=0, detailQuantity=1;
  let origin='restaurant-explore', tableReturn='menu', enquiryPending=false, sessionVersion=0, orderSequence=0;
  const currencies=['USD','ZAR','EUR','JPY'];
  // Fixed fictional demo rates per USD, represented as hundredths to avoid floating-point rate arithmetic.
  const rateHundredths={USD:100,ZAR:1800,EUR:90,JPY:15000};
  let currency='USD',previewTimer=null;
  let session;
  function resetSession(){
    stopPreview();
    sessionVersion++;
    session={table:null,cart:{},reviewed:false,confirmation:null,submitting:false,guideOpen:false};
    category=0;detailQuantity=1;
  }
  resetSession();
  const artwork=`<picture><source srcset="assets/restaurant-digital-menu.webp?v=be62858e200b" type="image/webp"><img src="assets/restaurant-digital-menu.png?v=be62858e200b" alt="" width="1536" height="1024"></picture>`;
  const minorAmount=(cents,code)=>Math.round(cents*rateHundredths[code]/(code==='JPY'?10000:100));
  const formatMoney=(cents,code)=>new Intl.NumberFormat('en-US',{style:'currency',currency:code,currencyDisplay:'narrowSymbol',minimumFractionDigits:code==='JPY'?0:2,maximumFractionDigits:code==='JPY'?0:2}).format(minorAmount(cents,code)/(code==='JPY'?1:100));
  const money=(cents,frozenCurrency)=>`<span class="restaurant-money" data-price-cents="${cents}" ${frozenCurrency?`data-price-currency="${frozenCurrency}"`:''}>${formatMoney(cents,frozenCurrency||currency)}</span>`;
  function currencyControls(){
    const c=t();
    return `<div class="restaurant-currency"><label for="restaurant-currency">${c.currency}</label><select id="restaurant-currency" aria-describedby="restaurant-rates">${currencies.map(code=>`<option ${code===currency?'selected':''}>${code}</option>`).join('')}</select><button type="button" id="restaurant-currency-preview" aria-pressed="false">${c.preview}: ${c.play}</button><p id="restaurant-rates">${c.rates}</p></div>`;
  }
  function syncPreview(){
    const button=dialog.querySelector('#restaurant-currency-preview');
    if(button){button.setAttribute('aria-pressed',String(previewTimer!==null));button.textContent=`${t().preview}: ${previewTimer!==null?t().pause:t().play}`;}
  }
  function stopPreview(){
    if(previewTimer!==null){clearInterval(previewTimer);previewTimer=null;}
    syncPreview();
  }
  function updatePrices(){
    const selector=dialog.querySelector('#restaurant-currency');if(selector)selector.value=currency;
    dialog.querySelectorAll('[data-price-cents]').forEach(node=>{
      node.textContent=formatMoney(Number(node.dataset.priceCents),node.dataset.priceCurrency||currency);
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){node.getAnimations().forEach(animation=>animation.cancel());node.animate([{opacity:.5},{opacity:1}],{duration:180});}
    });
  }
  function startPreview(){
    stopPreview();if(!dialog.open||document.hidden||view==='confirmation'||view==='details')return;
    previewTimer=setInterval(()=>{if(!dialog.open||document.hidden){stopPreview();return;}currency=currencies[(currencies.indexOf(currency)+1)%currencies.length];updatePrices();},5000);syncPreview();
  }

  const entries=()=>Object.entries(session.cart).map(([id,quantity])=>({id:Number(id),quantity,unit:dishes[id].cents,line:dishes[id].cents*quantity}));
  const count=()=>entries().reduce((sum,item)=>sum+item.quantity,0);
  const total=()=>entries().reduce((sum,item)=>sum+item.line,0);
  const validTable=()=>Number.isInteger(session.table)&&session.table>=1&&session.table<=12;
  const tableName=table=>t().tableOption.replace('{number}',String(table));
  const stage=()=>session.confirmation?4:!validTable()?0:!count()?1:!session.reviewed?2:3;
  const contentRoot=document.createElement('div');
  const announcement=document.createElement('p');
  announcement.className='restaurant-sr-only';announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');announcement.setAttribute('aria-atomic','true');
  dialog.append(contentRoot,announcement);
  function announce(message){
    announcement.textContent=message;
    const visible=dialog.querySelector('#restaurant-feedback');if(visible)visible.textContent=message;
  }
  function animate(){
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)dialog.querySelector('.restaurant-view').animate([{opacity:.3,transform:'scale(.98)'},{opacity:1,transform:'scale(1)'}],{duration:220,easing:'ease-out'});
  }
  function guide(){
    const c=t(),step=stage();
    return `<details id="restaurant-guide" data-guide-step="${step}" class="restaurant-guide" ${session.guideOpen?'open':''}><summary>${c.guide} · ${step===4?'✓':`${c.step} ${step+1} ${c.of} 4`}</summary><ol>${c.steps.map((label,i)=>`<li ${i===step?'aria-current="step"':''}><strong>${i<step?'✓ ':''}${label}</strong>${i===step?`<p>${c.hints[i]}</p>`:''}</li>`).join('')}</ol>${step===4?`<p>${c.guideDone}</p>`:''}</details>`;
  }
  function chrome(){
    const c=t();
    return `<div class="restaurant-demo-heading"><button type="button" id="restaurant-back-details">← ${c.backDetails}</button><p class="restaurant-demo">${c.demo}</p></div><div class="restaurant-menu-brand"><span aria-hidden="true">✳</span><div><strong>${c.brand}</strong><p>${c.subtitle}</p></div></div><p class="restaurant-caption">${c.demoNote}</p><div class="restaurant-toolbar"><button type="button" id="restaurant-change-table" aria-label="${validTable()?c.tableChange+': '+tableName(session.table):c.tablePlaceholder}">${validTable()?tableName(session.table):c.tablePlaceholder}</button><button type="button" id="restaurant-cart">${c.cart} <span id="restaurant-cart-count">${count()}</span></button><button type="button" id="restaurant-restart" class="restaurant-text-action">${c.restart}</button></div>${currencyControls()}${guide()}<p id="restaurant-feedback" class="restaurant-feedback"></p>`;
  }
  // Shared image configuration above keeps focal points consistent throughout the demo.
  function dishImage(id,context='card'){
    const image=dishes[id].image,name=t().dishNames[id];
    return `<span class="restaurant-food-frame restaurant-food-${context}" style="--food-card:${image.card};--food-detail:${image.detail};--food-fit:${image.fit}"><picture><source srcset="assets/restaurant/${image.file}.webp" type="image/webp"><img src="assets/restaurant/${image.file}.png" alt="${name}" width="${image.width}" height="${image.height}" loading="${context==='detail'?'eager':'lazy'}" decoding="async"></picture><span class="restaurant-food-fallback" hidden>${name}</span></span>`;
  }
  function itemRows(items,editable,frozenCurrency){
    const c=t();
    return `<ul class="restaurant-cart-lines">${items.map(item=>`<li data-cart-line="${item.id}"><div class="restaurant-cart-item-name">${dishImage(item.id,'thumb')}<div><strong>${c.dishNames[item.id]}</strong><span>${c.unit}: ${money(item.unit,frozenCurrency)}</span></div></div><div class="restaurant-cart-item-quantity">${editable?`<button type="button" data-decrease="${item.id}" aria-label="${c.decrease}: ${c.dishNames[item.id]}">−</button><span class="restaurant-line-quantity" aria-label="${c.quantity}: ${item.quantity}">${item.quantity}</span><button type="button" data-increase="${item.id}" aria-label="${c.increase}: ${c.dishNames[item.id]}" ${item.quantity>=MAX_QUANTITY?'disabled':''}>+</button>`:`<span class="restaurant-line-quantity">${c.quantity}: ${item.quantity}</span>`}</div><div class="restaurant-cart-item-total"><span>${c.lineTotal}</span><strong class="restaurant-line-total">${money(item.line,frozenCurrency)}</strong></div>${editable?`<button type="button" data-remove="${item.id}" class="restaurant-text-action" aria-label="${c.remove}: ${c.dishNames[item.id]}">${c.remove}</button>`:''}</li>`).join('')}</ul>`;
  }
  function render(focusId='restaurant-title'){
    stopPreview();
    const c=t();
    dialog.classList.toggle('restaurant-menu',view!=='details');
    dialog.setAttribute('aria-busy',String(session.submitting));
    let content;
    if(view==='details')content=`<p class="restaurant-eyebrow">ENCOMPASS / DATA</p><h2 id="restaurant-title" tabindex="-1">${c.title}</h2><p class="restaurant-lead">${c.kicker}</p><p>${c.description}</p><div class="restaurant-entry"><button type="button" id="restaurant-art-entry" aria-label="${c.explore}">${artwork}<span class="restaurant-entry-label">${c.explore}</span></button><div><p class="restaurant-caption">${c.artNote}</p><button type="button" class="restaurant-primary" id="restaurant-explore">${c.explore}</button><p class="restaurant-caption">${c.sessionNote}</p></div></div><h3>${c.audience}</h3><p>${c.intro}</p><h3>${c.includesTitle}</h3><ul>${c.includes.map(item=>`<li>${item}</li>`).join('')}</ul><h3>${c.scopeTitle}</h3><p>${c.scope}</p><button type="button" class="restaurant-primary" data-enquire>${c.enquire}</button>`;
    else if(view==='confirmation'){
      const order=session.confirmation;
      content=`<div class="restaurant-menu-brand"><span aria-hidden="true">✳</span><div><strong>${c.brand}</strong><p>${c.subtitle}</p></div></div><p class="restaurant-demo">${c.demo}</p><section class="restaurant-confirmation"><span class="restaurant-confirmation-check" aria-hidden="true">✓</span><h2 id="restaurant-title" tabindex="-1">${c.confirmed}</h2><p class="restaurant-order-disclosure">${c.disclosure}</p><dl class="restaurant-order-meta"><div><dt>${c.tableLabel}</dt><dd id="restaurant-confirmed-table">${tableName(order.table)}</dd></div><div><dt>${c.reference}</dt><dd id="restaurant-reference">${order.reference}</dd></div></dl><p>${c.submitted}: <strong id="restaurant-submitted-currency">${order.currency}</strong></p><p>${c.rates}</p>${itemRows(order.items,false,order.currency)}<p class="restaurant-total">${c.total} <strong id="restaurant-confirmed-total">${money(order.total,order.currency)}</strong></p><div class="restaurant-confirmation-actions"><button type="button" class="restaurant-primary" id="restaurant-new-order">${c.newOrder}</button><button type="button" id="restaurant-back-details">${c.backDetails}</button></div></section>`;
    }else{
      let screen='';
      if(view==='table')screen=`<section class="restaurant-table-panel"><p class="restaurant-eyebrow">${c.brand}</p><h2 id="restaurant-title" tabindex="-1">${c.tableTitle}</h2><p>${c.tableNote}</p><form id="restaurant-table-form"><label for="restaurant-table-select">${c.tableLabel}</label><select id="restaurant-table-select" required><option value="">${c.tablePlaceholder}</option>${Array.from({length:12},(_,i)=>`<option value="${i+1}">${tableName(i+1)}</option>`).join('')}</select><button type="submit" class="restaurant-primary">${c.tableSave}</button></form><p class="restaurant-caption">${c.tableRequired}</p><button type="button" id="restaurant-browse">${tableReturn==='cart'?c.backCart:c.tableBrowse}</button></section>`;
      if(view==='menu')screen=`<div class="restaurant-menu-hero"><p class="restaurant-eyebrow">${c.menu}</p><h2 id="restaurant-title" tabindex="-1">${c.tagline}</h2><p>${c.menuIntro}</p><span class="restaurant-sun" aria-hidden="true">✺</span></div><nav class="restaurant-categories" aria-label="${c.menu}">${c.categories.map((name,i)=>`<button type="button" id="restaurant-category-${i}" data-category="${i}" aria-pressed="${category===i}">${name}</button>`).join('')}</nav><div class="restaurant-dishes">${dishes.map((dish,i)=>category===0||dish.category===category?`<button type="button" class="restaurant-dish" id="restaurant-dish-${i}" data-dish="${i}" aria-label="${c.viewDish}: ${c.dishNames[i]}">${dishImage(i)}<span class="restaurant-dish-copy"><strong>${c.dishNames[i]}</strong><span>${c.dishDescriptions[i]}</span><span class="restaurant-dietary">${c.dishDietary[i]}</span><span class="restaurant-dish-bottom"><b>${money(dish.cents)}</b><span>${c.viewDish}</span></span></span></button>`:'').join('')}</div><p class="restaurant-caption">${c.allergy}</p><footer class="restaurant-menu-footer"><p>${c.venue}</p><button type="button" data-enquire>${c.enquire}</button></footer>`;
      if(view==='dish')screen=`<button type="button" id="restaurant-back-menu">← ${c.backMenu}</button><div class="restaurant-dish-detail">${dishImage(selectedDish,'detail')}<div><p class="restaurant-eyebrow">${c.categories[dishes[selectedDish].category]}</p><h2 id="restaurant-title" tabindex="-1">${c.dishNames[selectedDish]}</h2><p>${c.dishDescriptions[selectedDish]}</p><p class="restaurant-price"><span>${c.price}</span><strong>${money(dishes[selectedDish].cents)}</strong></p><h3>${c.dietary}</h3><p>${c.dishDietary[selectedDish]}</p><p class="restaurant-caption">${c.allergy}</p><form id="restaurant-add-form"><label for="restaurant-quantity">${c.quantity}</label><input id="restaurant-quantity" type="number" min="1" max="${MAX_QUANTITY}" step="1" value="${detailQuantity}" required inputmode="numeric"><button type="submit" id="restaurant-add" class="restaurant-primary">${c.add}</button></form></div></div>`;
      if(view==='cart')screen=`<h2 id="restaurant-title" tabindex="-1">${c.cartTitle}</h2>${count()?itemRows(entries(),true):`<div class="restaurant-empty"><p>${c.cartEmpty}</p></div>`}<p class="restaurant-total">${c.total} <strong id="restaurant-cart-total">${money(total())}</strong></p><p class="restaurant-caption">${c.orderNote}</p>${!validTable()?`<p class="restaurant-order-disclosure">${c.tableRequired}</p>`:''}<div class="restaurant-cart-actions"><button type="button" id="restaurant-browse">${c.browse}</button><button type="button" class="restaurant-primary" id="restaurant-place" ${!count()||!validTable()||session.submitting?'disabled':''}>${session.submitting?c.placing:c.place}</button></div>`;
      content=chrome()+screen;
    }
    contentRoot.innerHTML=`<button type="button" class="restaurant-close" aria-label="${c.close}">×</button><div class="restaurant-view" data-view="${view}">${content}</div>`;
    bind();
    dialog.querySelectorAll('.restaurant-food-frame img').forEach(image=>{image.onerror=()=>{const frame=image.closest('.restaurant-food-frame');frame.querySelector('picture').hidden=true;frame.querySelector('.restaurant-food-fallback').hidden=false;};});
    if(session.submitting)dialog.querySelectorAll('button,input,select').forEach(control=>{if(!control.matches('.restaurant-close,#restaurant-back-details,#restaurant-restart'))control.disabled=true;});
    const requested=dialog.querySelector('#'+focusId);
    const target=requested&&!requested.disabled?requested:dialog.querySelector('#restaurant-title');
    target?.focus({preventScroll:focusId.startsWith('restaurant-category-')||focusId==='restaurant-add'});
    if(focusId==='restaurant-title')dialog.scrollTop=0;
  }
  function route(next,focusId){
    stopPreview();
    if(session.submitting)return;
    view=next;if(view==='cart'&&count())session.reviewed=true;render(focusId);
  }
  function editCart(id,quantity,focusId){
    if(session.submitting)return;
    if(quantity>MAX_QUANTITY){announce(t().limit);return;}
    if(quantity<=0)delete session.cart[id];else session.cart[id]=quantity;
    session.reviewed=count()>0;
    render(focusId);announce(quantity<=0?t().removed:t().updated);
  }
  async function placeOrder(){
    stopPreview();
    if(session.submitting||!validTable()||!count())return;
    const version=sessionVersion;
    const order=Object.freeze({currency,convertedTotal:minorAmount(total(),currency),table:session.table,items:Object.freeze(entries().map(item=>Object.freeze({...item}))),total:total(),reference:`DEMO-${Date.now().toString(36).toUpperCase()}-${++orderSequence}`});
    session.submitting=true;render('restaurant-place');announce(t().placing);
    // Local simulation only. No fetch, Firebase, payment, analytics or order API.
    await new Promise(resolve=>setTimeout(resolve,300));
    if(version!==sessionVersion||!dialog.open)return;
    session.confirmation=order;session.cart={};session.submitting=false;view='confirmation';render();announce(t().confirmed+' '+t().disclosure);
  }
  function bind(){
    const wire=(id,action)=>{const button=dialog.querySelector('#'+id);if(button)button.onclick=action;};
    dialog.querySelector('.restaurant-close').onclick=()=>dialog.close();
    dialog.querySelectorAll('[data-enquire]').forEach(button=>button.onclick=enquire);
    dialog.querySelectorAll('#restaurant-art-entry,#restaurant-explore').forEach(button=>button.onclick=()=>{origin=button.id;resetSession();announcement.textContent='';tableReturn='menu';view='table';render();animate();});
    wire('restaurant-back-details',()=>{resetSession();announcement.textContent='';view='details';render(origin);});
    wire('restaurant-back-menu',()=>route('menu',`restaurant-dish-${selectedDish}`));
    wire('restaurant-cart',()=>route('cart'));
    wire('restaurant-change-table',()=>{tableReturn=view==='table'?tableReturn:view;route('table');});
    wire('restaurant-browse',()=>route(view==='table'?tableReturn:'menu'));
    wire('restaurant-restart',()=>{resetSession();tableReturn='menu';view='table';render();announce(t().restarted);});
    wire('restaurant-new-order',()=>{resetSession();tableReturn='menu';view='table';render();announce(t().restarted);});
    wire('restaurant-place',placeOrder);
    wire('restaurant-currency-preview',()=>previewTimer===null?startPreview():stopPreview());
    const currencySelector=dialog.querySelector('#restaurant-currency');
    if(currencySelector)currencySelector.onchange=()=>{stopPreview();if(currencies.includes(currencySelector.value)){currency=currencySelector.value;updatePrices();}};
    const guideElement=dialog.querySelector('#restaurant-guide');if(guideElement)guideElement.ontoggle=()=>{session.guideOpen=guideElement.open;};
    const tableForm=dialog.querySelector('#restaurant-table-form');
    if(tableForm){
      dialog.querySelector('#restaurant-table-select').value=session.table===null?'':String(session.table);
      tableForm.onsubmit=event=>{event.preventDefault();if(session.submitting||!tableForm.reportValidity())return;const table=Number(dialog.querySelector('#restaurant-table-select').value);if(!Number.isInteger(table)||table<1||table>12)return;session.table=table;route(tableReturn);announce(t().tableSaved);};
    }
    dialog.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>{if(session.submitting)return;category=Number(button.dataset.category);render(`restaurant-category-${category}`);announce(t().categories[category]);});
    dialog.querySelectorAll('[data-dish]').forEach(button=>button.onclick=()=>{selectedDish=Number(button.dataset.dish);detailQuantity=1;route('dish');});
    const addForm=dialog.querySelector('#restaurant-add-form');
    if(addForm)addForm.onsubmit=event=>{
      event.preventDefault();if(session.submitting||!addForm.reportValidity())return;
      const quantity=dialog.querySelector('#restaurant-quantity').valueAsNumber;
      if(!Number.isInteger(quantity)||quantity<1||quantity>MAX_QUANTITY)return;
      const next=(session.cart[selectedDish]||0)+quantity;
      if(next>MAX_QUANTITY){announce(t().limit);return;}
      session.cart[selectedDish]=next;session.reviewed=false;detailQuantity=quantity;
      render('restaurant-add');announce(`${t().added}: ${quantity} × ${t().dishNames[selectedDish]}. ${t().cart}: ${count()}`);
    };
    dialog.querySelectorAll('[data-increase]').forEach(button=>button.onclick=()=>{const id=Number(button.dataset.increase);editCart(id,session.cart[id]+1,`restaurant-increase-${id}`);});
    dialog.querySelectorAll('[data-decrease]').forEach(button=>button.onclick=()=>{const id=Number(button.dataset.decrease);editCart(id,session.cart[id]-1,session.cart[id]>1?`restaurant-decrease-${id}`:'restaurant-title');});
    dialog.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>editCart(Number(button.dataset.remove),0,'restaurant-title'));
    for(const name of ['increase','decrease'])dialog.querySelectorAll(`[data-${name}]`).forEach(button=>button.id=`restaurant-${name}-${button.dataset[name]}`);
  }
  function enquire(){
    enquiryPending=true;dialog.close();document.querySelector('#interest').selectedIndex=2;
    document.querySelector('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  // Only actionable controls pause playback; reading/clicking ordinary content does not.
  dialog.addEventListener('click',event=>{if(event.target.closest('button,input,select,a')&&!event.target.closest('#restaurant-currency-preview'))stopPreview();},true);
  for(const name of ['input','change'])dialog.addEventListener(name,event=>{if(!event.target.closest('#restaurant-currency-preview'))stopPreview();},true);
  window.addEventListener('pagehide',stopPreview);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPreview();});
  trigger.onclick=()=>{resetSession();announcement.textContent='';view='details';render();dialog.showModal();dialog.scrollTop=0;dialog.querySelector('#restaurant-title').focus({preventScroll:true});};
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape')stopPreview();
    if(event.key==='Escape'&&view!=='details'){
      event.preventDefault();event.stopPropagation();
      if(session.submitting){dialog.close();return;}
      if(view==='dish')route('menu',`restaurant-dish-${selectedDish}`);
      else if(view==='table'&&tableReturn!=='menu')route(tableReturn);
      else if(view==='cart')route('menu','restaurant-cart');
      else{resetSession();view='details';render(origin);}
      return;
    }
    if(event.key!=='Tab')return;
    const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),summary')],first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&(document.activeElement===first||document.activeElement.id==='restaurant-title')){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  dialog.addEventListener('close',()=>{resetSession();announcement.textContent='';const destination=enquiryPending?document.querySelector('#contact-form input[name="name"]'):trigger;enquiryPending=false;destination.focus({preventScroll:true});});
  document.querySelector('#language').addEventListener('change',()=>{if(dialog.open)render();});
})();
