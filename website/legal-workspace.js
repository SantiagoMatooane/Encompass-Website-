/* Fictional workspace. Browser-memory state only. */
window.EncompassLegalWorkspace = ({root, language, onExit, onEnquire}) => {
  const copy = {
    en: {
      title:'Legal workspace', demo:'Demo — fictional data', sample:'A sample experience, not an exact production screenshot. Changes reset on restart or reopening. Nothing is saved or sent.',
      exit:'Exit workspace', restart:'Restart demo', guide:'Your guided visit', step:'Step', of:'of', done:'Workflow explored', nav:['Overview','Case detail','Documents','Tasks'],
      objectives:['Open the sample case','Record a document’s receipt','Assign the follow-up','Review the updated overview'],
      instructions:['Choose “Open case L-104” in the case card.','In Documents, check “Signed instruction form”.','In Tasks, select a staff member, then choose “Save assignment”.','Choose “Overview” to see the changes together.'],
      values:['A shared case record gives the team a clear starting point.','A receipt checklist helps staff identify the remaining documents.','A named owner makes the next action clear.','A shared summary keeps document progress and task ownership in view.'],
      feedback:['Case L-104 opened. Its status remains awaiting documents.','Instruction form recorded as received; verification is still pending.','Assignment saved. The task is still open.','Overview updated with your document and assignment changes.'],
      complete:'You have explored the sample workflow. Navigate freely or restart to try it again.',
      case:'Sample case', caseName:'Rowan Ellis · Initial consultation', openCase:'Open case L-104', status:'Awaiting documents', owner:'Case owner', caseStatus:'Case status', documents:'Documents received', tasks:'Open tasks', completed:'Completed tasks', received:'Received', missing:'Outstanding',
      docNames:['Identity document','Signed instruction form','Proof of address'], verification:'Receipt is separate from verification or compliance approval. Received documents still need staff review.', pending:'Verification pending', notReviewed:'Not yet reviewed', required:'Required documents',
      reviewDocs:'Review documents', reviewTasks:'Review follow-up', task:'Request outstanding proof of address', taskStatus:'Open', assignee:'Follow-up owner', unassigned:'Unassigned', choose:'Choose a staff member', save:'Save assignment', taskNote:'Assigning this task does not complete it. The case stays awaiting documents.', receiptFeedback:'Receipt updated. Proof of address remains outstanding.',
      checklist:'Document checklist', activity:'Next action', enquire:'Discuss your legal workflow', target:'Guide action', toDocs:'Go to Documents', toTasks:'Go to Tasks', toOverview:'Go to Overview', remaining:'Proof of address is still outstanding. Follow up with the client.', reference:'Reference'
    },
    fr: {
      title:'Espace juridique', demo:'Démo — données fictives', sample:'Un exemple d’expérience, pas une capture exacte du produit en production. Les changements sont réinitialisés au redémarrage ou à la réouverture. Rien n’est enregistré ni envoyé.',
      exit:'Quitter l’espace', restart:'Recommencer la démo', guide:'Votre visite guidée', step:'Étape', of:'sur', done:'Parcours exploré', nav:['Vue d’ensemble','Dossier','Documents','Tâches'],
      objectives:['Ouvrir le dossier fictif','Enregistrer la réception d’un document','Attribuer la relance','Consulter la synthèse actualisée'],
      instructions:['Choisissez « Ouvrir le dossier L-104 » dans la fiche du dossier.','Dans Documents, cochez « Formulaire d’instructions signé ».','Dans Tâches, choisissez un collaborateur puis « Enregistrer l’affectation ».','Choisissez « Vue d’ensemble » pour voir les changements réunis.'],
      values:['Un dossier partagé donne un point de départ clair à l’équipe.','Une liste de réception permet de repérer les documents manquants.','Un responsable désigné clarifie la prochaine action.','Une synthèse partagée rend visibles les documents reçus et les responsables des tâches.'],
      feedback:['Dossier L-104 ouvert. Il reste en attente de documents.','Formulaire enregistré comme reçu ; la vérification reste à faire.','Affectation enregistrée. La tâche reste ouverte.','Synthèse actualisée avec la réception et l’affectation.'],
      complete:'Vous avez exploré le processus fictif. Naviguez librement ou recommencez pour réessayer.',
      case:'Dossier fictif', caseName:'Rowan Ellis · Premier entretien', openCase:'Ouvrir le dossier L-104', status:'En attente de documents', owner:'Responsable du dossier', caseStatus:'Statut du dossier', documents:'Documents reçus', tasks:'Tâches ouvertes', completed:'Tâches terminées', received:'Reçu', missing:'Manquant',
      docNames:['Pièce d’identité','Formulaire d’instructions signé','Justificatif de domicile'], verification:'La réception ne vaut ni vérification ni approbation de conformité. Les documents reçus doivent encore être examinés par l’équipe.', pending:'Vérification à faire', notReviewed:'Pas encore examiné', required:'Documents requis',
      reviewDocs:'Consulter les documents', reviewTasks:'Consulter la relance', task:'Demander le justificatif de domicile manquant', taskStatus:'Ouverte', assignee:'Responsable de la relance', unassigned:'Non attribuée', choose:'Choisir un collaborateur', save:'Enregistrer l’affectation', taskNote:'L’affectation ne termine pas la tâche. Le dossier reste en attente de documents.', receiptFeedback:'Réception mise à jour. Le justificatif de domicile reste manquant.',
      checklist:'Liste des documents', activity:'Prochaine action', enquire:'Discutons de vos processus juridiques', target:'Action guidée', toDocs:'Aller aux documents', toTasks:'Aller aux tâches', toOverview:'Aller à la vue d’ensemble', remaining:'Le justificatif de domicile reste manquant. Relancez le client.', reference:'Référence'
    },
    zh: {
      title:'法律工作空间', demo:'演示 — 虚构数据', sample:'这是示例体验，并非生产系统的精确截图。重新开始或重新打开时会重置更改。不会保存或发送任何内容。',
      exit:'退出工作空间', restart:'重新开始演示', guide:'引导体验', step:'步骤', of:'/', done:'已体验工作流程', nav:['概览','案件详情','文件','任务'],
      objectives:['打开示例案件','记录文件接收情况','分配跟进任务','查看更新后的概览'],
      instructions:['在案件卡片中选择“打开案件 L-104”。','在文件页面勾选“已签署的委托表”。','在任务页面选择员工，然后选择“保存分配”。','选择“概览”，集中查看更改。'],
      values:['共享案件记录为团队提供明确的工作起点。','接收清单有助于员工识别仍缺少的文件。','明确负责人，让下一步行动更清晰。','共享摘要集中呈现文件进度和任务负责人。'],
      feedback:['已打开案件 L-104。案件仍在等待文件。','已将委托表记录为收到；仍需核验。','已保存分配。任务仍待处理。','概览已反映文件接收和任务分配的更改。'],
      complete:'您已体验示例工作流程。可以自由浏览，或重新开始再次体验。',
      case:'示例案件', caseName:'Rowan Ellis · 初次咨询', openCase:'打开案件 L-104', status:'等待文件', owner:'案件负责人', caseStatus:'案件状态', documents:'已接收文件', tasks:'待处理任务', completed:'已完成任务', received:'已收到', missing:'待补充',
      docNames:['身份证明','已签署的委托表','地址证明'], verification:'接收不等于核验或合规批准。收到的文件仍需员工审核。', pending:'待核验', notReviewed:'尚未审核', required:'必需文件',
      reviewDocs:'查看文件', reviewTasks:'查看跟进任务', task:'索取缺失的地址证明', taskStatus:'待处理', assignee:'跟进负责人', unassigned:'未分配', choose:'选择员工', save:'保存分配', taskNote:'分配任务不代表完成任务。案件仍在等待文件。', receiptFeedback:'已更新接收情况。地址证明仍待补充。',
      checklist:'文件清单', activity:'下一步行动', enquire:'讨论您的法律工作流程', target:'引导操作', toDocs:'前往文件', toTasks:'前往任务', toOverview:'前往概览', remaining:'地址证明仍待补充。请向客户跟进。', reference:'案件编号'
    }
  };
  const t = copy[language] || copy.en;
  const screens = ['overview', 'case', 'documents', 'tasks'];
  let state;
  const reset = () => { state = {screen:'overview', caseOpened:false, received:false, assigned:'', chosen:'', reviewed:false, feedback:''}; };
  const stage = () => !state.caseOpened ? 0 : !state.received ? 1 : !state.assigned ? 2 : !state.reviewed ? 3 : 4;
  const badge = () => `<span class="lw-badge">${t.target} →</span>`;
  const routeButton = (screen, label, guided = false) => `<button type="button" data-route="${screen}" ${guided ? 'class="lw-target"' : ''}>${label}${guided ? badge() : ''}</button>`;
  const docs = interactive => `<ul class="lw-documents">${t.docNames.map((name, i) => `<li><div>${interactive && i === 1 ? `<label class="lw-check"><input id="lw-document" type="checkbox" ${state.received ? 'checked' : ''}>${name}${stage() === 1 ? badge() : ''}</label>` : `<strong>${name}</strong>`}<small>${i === 0 || (i === 1 && state.received) ? t.pending : t.notReviewed}</small></div><span class="lw-pill">${i === 0 || (i === 1 && state.received) ? '✓ ' + t.received : '○ ' + t.missing}</span></li>`).join('')}</ul>`;
  const taskSummary = () => `<div class="lw-task-row"><strong>${t.task}</strong><span class="lw-pill">○ ${t.taskStatus}</span><p>${t.assignee}: <span data-summary-owner>${state.assigned || t.unassigned}</span></p></div>`;
  // Keep the announcement node mounted while the visible screen changes.
  const view = document.createElement('div');
  const announcement = document.createElement('p');
  announcement.className = 'lw-sr-only';
  announcement.setAttribute('role','status');
  announcement.setAttribute('aria-live','polite');
  announcement.setAttribute('aria-atomic','true');
  root.replaceChildren(view, announcement);
  function render(focus = true) {
    const step = stage();
    let content;
    if (state.screen === 'overview') content = `<div class="lw-stats"><article><span>${t.case}</span><strong>1</strong><small>${t.status}</small></article><article><span>${t.documents}</span><strong data-summary-documents>${state.received ? 2 : 1} / 3</strong><small>${t.pending}</small></article><article><span>${t.tasks}</span><strong>1</strong><small>${t.completed}: 0</small></article></div><div class="lw-columns"><section class="lw-card"><h3>${t.case}</h3><p class="lw-reference">L-104</p><h4>${t.caseName}</h4><p>${t.owner}: Maya Chen</p><p class="lw-pill">${t.status}</p>${routeButton('case',t.openCase,step === 0)}</section><section class="lw-card"><h3>${t.activity}</h3>${taskSummary()}<p>${t.remaining}</p>${routeButton('tasks',t.reviewTasks)}</section></div><section class="lw-card"><h3>${t.checklist}</h3>${docs(false)}${routeButton('documents',t.reviewDocs)}</section>`;
    if (state.screen === 'case') content = `<section class="lw-card"><p class="lw-reference">${t.reference} / L-104</p><h3>${t.caseName}</h3><dl class="lw-case-meta"><div><dt>${t.caseStatus}</dt><dd>${t.status}</dd></div><div><dt>${t.owner}</dt><dd>Maya Chen</dd></div></dl><h4>${t.required}</h4>${docs(false)}<div class="lw-actions">${routeButton('documents',t.reviewDocs,step === 1)}${routeButton('tasks',t.reviewTasks)}</div></section>`;
    if (state.screen === 'documents') content = `<section class="lw-card"><p class="lw-reference">L-104 / Rowan Ellis</p><h3>${t.checklist}</h3><p class="lw-note">${t.verification}</p>${docs(true)}<div class="lw-actions">${routeButton('tasks',t.reviewTasks,step === 2)}</div></section>`;
    if (state.screen === 'tasks') content = `<section class="lw-card"><p class="lw-reference">L-104 / Rowan Ellis</p><h3>${t.task}</h3>${taskSummary()}<form id="lw-assignment"><label for="lw-assignee">${t.assignee}</label><select id="lw-assignee" required><option value="">${t.choose}</option><option>Maya Chen</option><option>Alex Morgan</option></select><button type="submit" ${step === 2 ? 'class="lw-target"' : ''}>${t.save}${step === 2 ? badge() : ''}</button></form><p class="lw-note">${t.taskNote}</p>${routeButton('overview',t.toOverview,step === 3)}</section>`;
    view.innerHTML = `<div class="lw-shell"><header class="lw-header"><div><span class="lw-wordmark">ENCOMPASS / DATA</span><h2 id="legal-title">${t.title}</h2></div><button type="button" id="lw-exit">← ${t.exit}</button></header><div class="lw-disclosure"><strong>${t.demo}</strong><p>${t.sample}</p></div><div class="lw-layout"><aside class="lw-guide" aria-labelledby="lw-guide-title"><p class="lw-eyebrow">${t.guide}</p><p id="lw-step">${step < 4 ? `${t.step} ${step + 1} ${t.of} 4` : '✓ ' + t.done}</p><h3 id="lw-guide-title">${step < 4 ? t.objectives[step] : t.done}</h3><p>${step < 4 ? t.instructions[step] : t.complete}</p><p class="lw-value">${t.values[Math.min(step,3)]}</p><p class="lw-feedback" id="lw-feedback">${state.feedback}</p>${step === 1 ? routeButton('documents',t.toDocs) : step === 2 ? routeButton('tasks',t.toTasks) : step === 3 ? routeButton('overview',t.toOverview) : ''}<button type="button" id="lw-restart">↺ ${t.restart}</button>${step === 4 ? `<button type="button" class="lw-primary" id="lw-enquire">${t.enquire} ↗</button>` : ''}</aside><div class="lw-app"><nav class="lw-sidebar" aria-label="${t.title}"><span class="lw-sidebar-brand">E<span> / </span></span>${screens.map((s,i) => `<button type="button" data-route="${s}" ${state.screen === s ? 'aria-current="page"' : ''}><span aria-hidden="true">${['◫','▣','▤','☑'][i]}</span>${t.nav[i]}</button>`).join('')}</nav><main class="lw-main"><div class="lw-page-heading"><p class="lw-eyebrow">L-104 / Rowan Ellis</p><h3 id="lw-screen-title" tabindex="-1">${t.nav[screens.indexOf(state.screen)]}</h3></div><div id="lw-screen" data-screen="${state.screen}">${content}</div></main></div></div></div>`;
    root.querySelector('#lw-exit').onclick = onExit;
    root.querySelector('#lw-restart').onclick = () => { reset(); render(); };
    const enquiry = root.querySelector('#lw-enquire');
    if (enquiry) enquiry.onclick = onEnquire;
    root.querySelectorAll('[data-route]').forEach(button => button.onclick = () => {
      state.screen = button.dataset.route;
      if (state.screen === 'case' && !state.caseOpened) { state.caseOpened = true; state.feedback = t.feedback[0]; }
      if (state.screen === 'overview' && state.caseOpened && state.received && state.assigned) { state.reviewed = true; state.feedback = t.feedback[3]; }
      render();
    });
    const checkbox = root.querySelector('#lw-document');
    if (checkbox) checkbox.onchange = () => { state.received = checkbox.checked; state.reviewed = false; state.feedback = t.receiptFeedback + (state.received ? ' ' + t.feedback[1] : ''); render(false); root.querySelector('#lw-document').focus({preventScroll:true}); };
    const form = root.querySelector('#lw-assignment');
    if (form) {
      root.querySelector('#lw-assignee').value = state.chosen;
      root.querySelector('#lw-assignee').onchange = event => { state.chosen = event.target.value; };
      form.onsubmit = event => { event.preventDefault(); if (!state.chosen) return; state.assigned = state.chosen; state.reviewed = false; state.feedback = t.feedback[2]; render(); };
    }
    announcement.textContent = `${step < 4 ? t.objectives[step] : t.done}. ${state.feedback}`;
    if (focus) root.querySelector('#lw-screen-title').focus();
  }
  reset(); render();
};
