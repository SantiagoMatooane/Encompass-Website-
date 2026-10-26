/* A standalone, fictional demo. No storage, requests, or production connections. */
(() => {
  'use strict';
  const trigger = document.querySelector('body:not(.marketing-page) [data-product="0"]');
  if (!trigger) return;

  const translations = {
    en: {
      title: 'Legal Practice Software', close: 'Close legal details',
      intro: 'A legal operations workspace for firms coordinating cases, documents and staff. Developed from a real client implementation, with scope and setup agreed for each firm.',
      scope: 'Available as a scoped implementation. It is not currently a production-ready multi-firm SaaS subscription.',
      problemTitle: 'Keep the next action in view',
      problem: 'Bring scattered case information, missing-document follow-ups and unclear task ownership into one workspace, so staff can see what needs attention.',
      capabilitiesTitle: 'What the workspace supports',
      capabilities: [
        ['Case records and status tracking', 'Keep case details together and follow each case’s current stage.'],
        ['Case documents', 'Associate documents with the case they belong to.'],
        ['Required-document and compliance checklists', 'Track required items and outstanding checks for staff review. Checklists do not certify compliance.'],
        ['Staff tasks and assignments', 'Give work a named owner and track its status.'],
        ['Dashboard summaries', 'Review case, document and task progress in one overview.'],
        ['Role-based access and audit logs', 'Set access by staff role and review recorded activity.']
      ],
      workflowTitle: 'An example day-to-day workflow',
      workflow: 'Open a case → review its required documents → assign a follow-up → check progress in the dashboard.',
      deliveryTitle: 'From discovery to handover',
      delivery: ['Discovery: understand your case workflow and staff roles.', 'Scoping: agree requirements, boundaries and deliverables.', 'Configuration: set up the agreed workflow and access roles.', 'Review: walk through the workspace with your team and confirm the agreed scope.', 'Handover: provide the agreed guidance and next steps.'],
      proposal: 'Integrations, data migration, customisation and support are agreed in the proposal.',
      demoTitle: 'Explore a sample workflow', demoLabel: 'Interactive demonstration using fictional data.',
      demoNote: 'Changes stay in this demonstration and reset when you restart or reopen it. Nothing is saved or sent.',
      step: 'Step', of: 'of', restart: 'Restart demonstration',
      steps: ['Open a case', 'Review required documents', 'Assign a task', 'Review progress'],
      caseName: 'Sample case L-104 · Rowan Ellis', open: 'Open fictional case',
      status: 'Case status: awaiting documents.', review: 'Review checklist',
      identity: 'Identity document: received', address: 'Proof of address: outstanding',
      consent: 'Signed instruction form', received: 'Received', outstanding: 'Outstanding',
      checkHint: 'Mark the sample instruction form as received. Proof of address will remain outstanding.',
      next: 'Continue to task assignment', owner: 'Assign the address follow-up to',
      task: 'Task: request the outstanding proof of address.', assign: 'Assign task and view summary',
      summary: 'Case remains awaiting documents. Documents: 2 of 3 received. Proof of address is outstanding.',
      taskSummary: 'Task: request proof of address. Status: open. Assigned to',
      summaryNote: 'The overview reflects the checklist and assignment. Assigning a task does not complete it.',
      enquire: 'Discuss your legal workflow'
    },
    fr: {
      title: 'Logiciel de gestion juridique', close: 'Fermer les détails du logiciel juridique',
      intro: 'Un espace de gestion pour les cabinets qui coordonnent dossiers, documents et collaborateurs. Issu d’une réalisation pour un client, avec un périmètre et une configuration convenus pour chaque cabinet.',
      scope: 'Proposé sous forme de projet au périmètre défini. Il ne s’agit pas actuellement d’un abonnement SaaS multi-cabinets prêt pour la production.',
      problemTitle: 'Gardez la prochaine action en vue',
      problem: 'Rassemblez les informations dispersées, le suivi des documents manquants et les responsabilités des tâches pour que chaque collaborateur sache ce qui demande son attention.',
      capabilitiesTitle: 'Les fonctions de l’espace de travail',
      capabilities: [
        ['Dossiers et suivi des statuts', 'Regroupez les informations et suivez l’étape actuelle de chaque dossier.'],
        ['Documents liés aux dossiers', 'Associez chaque document au dossier concerné.'],
        ['Listes de documents requis et de contrôles de conformité', 'Suivez les pièces requises et les vérifications à effectuer par l’équipe. Ces listes ne certifient pas la conformité.'],
        ['Tâches et affectations', 'Désignez un responsable et suivez le statut du travail.'],
        ['Tableaux de bord', 'Consultez une synthèse de l’avancement des dossiers, documents et tâches.'],
        ['Accès par rôle et journaux d’audit', 'Définissez les accès selon les rôles et consultez l’activité enregistrée.']
      ],
      workflowTitle: 'Un exemple de déroulement',
      workflow: 'Ouvrir un dossier → vérifier les documents requis → attribuer une relance → consulter l’avancement dans le tableau de bord.',
      deliveryTitle: 'De la découverte à la prise en main',
      delivery: ['Découverte : comprendre vos processus et les rôles de l’équipe.', 'Cadrage : convenir des besoins, limites et livrables.', 'Configuration : mettre en place le processus et les accès convenus.', 'Revue : parcourir l’espace avec votre équipe et vérifier le périmètre convenu.', 'Prise en main : fournir les conseils et les prochaines étapes convenus.'],
      proposal: 'Les intégrations, la migration des données, les adaptations et le support sont définis dans la proposition.',
      demoTitle: 'Explorez un exemple de processus', demoLabel: 'Démonstration interactive utilisant des données fictives.',
      demoNote: 'Les changements restent dans cette démonstration et sont réinitialisés au redémarrage ou à la réouverture. Rien n’est enregistré ni envoyé.',
      step: 'Étape', of: 'sur', restart: 'Recommencer la démonstration',
      steps: ['Ouvrir un dossier', 'Vérifier les documents requis', 'Attribuer une tâche', 'Consulter l’avancement'],
      caseName: 'Dossier fictif L-104 · Rowan Ellis', open: 'Ouvrir le dossier fictif',
      status: 'Statut du dossier : en attente de documents.', review: 'Consulter la liste',
      identity: 'Pièce d’identité : reçue', address: 'Justificatif de domicile : manquant',
      consent: 'Formulaire d’instructions signé', received: 'Reçu', outstanding: 'Manquant',
      checkHint: 'Marquez le formulaire fictif comme reçu. Le justificatif de domicile restera manquant.',
      next: 'Passer à l’attribution de la tâche', owner: 'Attribuer la relance du justificatif à',
      task: 'Tâche : demander le justificatif de domicile manquant.', assign: 'Attribuer la tâche et voir la synthèse',
      summary: 'Le dossier reste en attente de documents. Documents : 2 sur 3 reçus. Le justificatif de domicile est manquant.',
      taskSummary: 'Tâche : demander le justificatif de domicile. Statut : ouverte. Responsable :',
      summaryNote: 'La synthèse reflète les documents et l’affectation. Attribuer une tâche ne la termine pas.',
      enquire: 'Discutons de vos processus juridiques'
    },
    zh: {
      title: '法律事务管理软件', close: '关闭法律软件详情',
      intro: '为需要协调案件、文件和员工的律师事务所提供的法律运营工作空间。基于真实客户项目开发，服务范围和配置由双方针对每家事务所商定。',
      scope: '以约定范围的实施项目形式提供。目前并非可直接用于生产环境的多事务所 SaaS 订阅服务。',
      problemTitle: '明确下一步行动',
      problem: '将分散的案件信息、缺失文件的跟进和任务负责人集中呈现，让员工了解哪些工作需要处理。',
      capabilitiesTitle: '工作空间的功能',
      capabilities: [
        ['案件记录与状态跟踪', '集中管理案件信息，查看每个案件当前所处的阶段。'],
        ['案件关联文件', '将文件关联到对应案件。'],
        ['必需文件与合规检查清单', '跟踪所需材料和待员工审核的检查项。清单不代表合规认证。'],
        ['员工任务与分配', '指定任务负责人并跟踪任务状态。'],
        ['仪表板摘要', '集中查看案件、文件和任务进度。'],
        ['基于角色的访问与审计日志', '按员工角色设置访问权限，并查看已记录的活动。']
      ],
      workflowTitle: '日常工作流程示例',
      workflow: '打开案件 → 检查必需文件 → 分配跟进任务 → 在仪表板查看进度。',
      deliveryTitle: '从需求了解到交付',
      delivery: ['需求了解：了解案件流程与员工角色。', '范围确定：商定需求、边界和交付内容。', '配置：设置约定的工作流程与访问角色。', '评审：与团队演示工作空间，核对约定范围。', '交付：提供约定的使用指导和后续步骤。'],
      proposal: '集成、数据迁移、定制和支持将在项目提案中商定。',
      demoTitle: '体验示例工作流程', demoLabel: '使用虚构数据的交互演示。',
      demoNote: '更改仅限本演示，重新开始或重新打开时会重置。不会保存或发送任何内容。',
      step: '步骤', of: '/', restart: '重新开始演示',
      steps: ['打开案件', '检查必需文件', '分配任务', '查看进度'],
      caseName: '虚构案件 L-104 · Rowan Ellis', open: '打开虚构案件',
      status: '案件状态：等待文件。', review: '查看清单',
      identity: '身份证明：已收到', address: '地址证明：待补充',
      consent: '已签署的委托表', received: '已收到', outstanding: '待补充',
      checkHint: '将示例委托表标记为已收到。地址证明仍待补充。',
      next: '继续分配任务', owner: '将地址证明跟进任务分配给',
      task: '任务：索取缺失的地址证明。', assign: '分配任务并查看摘要',
      summary: '案件仍在等待文件。文件：已收到 3 份中的 2 份。地址证明待补充。',
      taskSummary: '任务：索取地址证明。状态：待处理。负责人：',
      summaryNote: '摘要反映清单和分配情况。分配任务并不意味着完成任务。',
      enquire: '讨论您的法律工作流程'
    }
  };

  const dialog = document.createElement('dialog');
  dialog.id = 'legal-dialog';
  dialog.setAttribute('aria-labelledby', 'legal-title');
  document.body.append(dialog);
  let step = 0, opened = false, received = false, assignee = 'Maya Chen';
  let enquiryPending = false;
  const currentCopy = () => translations[document.documentElement.lang] || translations.en;
  // Every value interpolated below is maintained local copy or a fixed fictional name.
  function render() {
    const t = currentCopy();
    dialog.innerHTML = `<button type="button" class="close" aria-label="${t.close}">×</button>
      <p class="eyebrow">ENCOMPASS / ${document.documentElement.lang === 'en' ? 'DATA' : document.documentElement.lang === 'fr' ? 'DONNÉES' : '数据'}</p>
      <h2 id="legal-title" tabindex="-1">${t.title}</h2><p>${t.intro}</p><p>${t.scope}</p>
      <h3>${t.problemTitle}</h3><p>${t.problem}</p>
      <h3>${t.capabilitiesTitle}</h3><ul class="legal-capabilities">${t.capabilities.map(([title, body]) => `<li><strong>${title}</strong>${body}</li>`).join('')}</ul>
      <h3>${t.workflowTitle}</h3><p>${t.workflow}</p>
      <section class="legal-demo" aria-labelledby="legal-demo-title">
        <h3 id="legal-demo-title">${t.demoTitle}</h3><p>${t.demoLabel}</p><p>${t.demoNote}</p>
        <p class="legal-step" id="legal-step" role="status"></p>
        <div class="legal-demo-panel" id="legal-demo-panel"></div>
        <div class="legal-controls"><button type="button" id="legal-restart">${t.restart}</button></div>
      </section>
      <h3>${t.deliveryTitle}</h3><ol>${t.delivery.map(item => `<li>${item}</li>`).join('')}</ol><p>${t.proposal}</p>
      <button type="button" class="legal-primary legal-enquiry">${t.enquire} ↗</button>`;
    dialog.querySelector('.close').onclick = () => dialog.close();
    dialog.querySelector('#legal-restart').onclick = () => { reset(); renderStep(true); };
    dialog.querySelector('.legal-enquiry').onclick = () => {
      enquiryPending = true;
      dialog.close();
      document.querySelector('#interest').selectedIndex = 1;
      document.querySelector('#contact').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    renderStep();
  }
  function renderStep(focus = false) {
    const t = currentCopy();
    const panel = dialog.querySelector('#legal-demo-panel');
    dialog.querySelector('#legal-step').textContent = `${t.step} ${step + 1} ${t.of} 4 · ${t.steps[step]}`;
    let body = '';
    if (step === 0) body = `<p>${t.caseName}</p>${opened ? `<p class="legal-summary">${t.status}</p><button type="button" data-next>${t.review}</button>` : `<button type="button" id="legal-open">${t.open}</button>`}`;
    if (step === 1) body = `<p>${t.caseName}</p><ul><li>${t.identity}</li><li>${t.address}</li></ul><p>${t.checkHint}</p><label class="legal-check"><input type="checkbox" id="legal-document" ${received ? 'checked' : ''}>${t.consent}</label><p id="legal-document-status" role="status">${received ? t.received : t.outstanding}</p><button type="button" data-next ${received ? '' : 'disabled'}>${t.next}</button>`;
    if (step === 2) body = `<p>${t.task}</p><label for="legal-assignee">${t.owner}</label><select id="legal-assignee"><option>Maya Chen</option><option>Alex Morgan</option></select><div class="legal-controls"><button type="button" data-next>${t.assign}</button></div>`;
    if (step === 3) body = `<div class="legal-summary"><p>${t.caseName}</p><p>${t.summary}</p><p>${t.taskSummary} ${assignee}.</p></div><p>${t.summaryNote}</p>`;
    panel.innerHTML = `<h4 tabindex="-1">${t.steps[step]}</h4>${body}`;
    const open = panel.querySelector('#legal-open');
    if (open) open.onclick = () => { opened = true; renderStep(true); };
    const checkbox = panel.querySelector('#legal-document');
    if (checkbox) checkbox.onchange = () => {
      received = checkbox.checked;
      panel.querySelector('[data-next]').disabled = !received;
      panel.querySelector('#legal-document-status').textContent = received ? t.received : t.outstanding;
    };
    const select = panel.querySelector('#legal-assignee');
    if (select) { select.value = assignee; select.onchange = () => { assignee = select.value; }; }
    const next = panel.querySelector('[data-next]');
    if (next) next.onclick = () => { step += 1; renderStep(true); };
    if (focus) panel.querySelector('h4').focus({preventScroll: true});
  }
  function reset() { step = 0; opened = false; received = false; assignee = 'Maya Chen'; }
  // Replace only the Data Centre legal card handler installed by app.js.
  trigger.onclick = () => {
    reset(); render(); dialog.showModal(); dialog.scrollTop = 0;
    dialog.querySelector('#legal-title').focus({preventScroll: true});
  };
  // Keep keyboard focus on the dialog controls, including when cycling past the last one.
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled), input, select')];
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement.id === 'legal-title')) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  // Native dialog handles Escape; restore focus after dismissal or enquiry routing.
  dialog.addEventListener('close', () => {
    const destination = enquiryPending ? document.querySelector('#contact-form input[name="name"]') : trigger;
    enquiryPending = false;
    destination.focus({preventScroll: true});
  });
  document.querySelector('#language').addEventListener('change', () => { if (dialog.open) render(); });
})();
