/* A standalone, fictional demo. No storage, requests, or production connections. */
(() => {
  'use strict';
  const trigger = document.querySelector('body:not(.marketing-page) [data-product="0"]');
  if (!trigger) return;

  const translations = {
    en: {
      title: 'Legal Practice Software', close: 'Close legal details', explore: 'Explore the workspace',
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
      demoNote: 'Changes stay in this demonstration and reset when you restart or reopen it. Nothing is saved or sent.',
      enquire: 'Discuss your legal workflow'
    },
    fr: {
      title: 'Logiciel de gestion juridique', close: 'Fermer les détails du logiciel juridique', explore: 'Explorer l’espace de travail',
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
      demoNote: 'Les changements restent dans cette démonstration et sont réinitialisés au redémarrage ou à la réouverture. Rien n’est enregistré ni envoyé.',
      enquire: 'Discutons de vos processus juridiques'
    },
    zh: {
      title: '法律事务管理软件', close: '关闭法律软件详情', explore: '探索工作空间',
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
      demoNote: '更改仅限本演示，重新开始或重新打开时会重置。不会保存或发送任何内容。',
      enquire: '讨论您的法律工作流程'
    }
  };

  const dialog = document.createElement('dialog');
  dialog.id = 'legal-dialog';
  dialog.setAttribute('aria-labelledby', 'legal-title');
  document.body.append(dialog);
  let inWorkspace = false;
  let enquiryPending = false;
  const currentCopy = () => translations[document.documentElement.lang] || translations.en;
  // Every value interpolated below is maintained local copy or a fixed fictional name.
  function render() {
    const t = currentCopy();
    dialog.innerHTML = `<button type="button" class="close" aria-label="${t.close}">×</button>
      <p class="eyebrow">ENCOMPASS / ${document.documentElement.lang === 'en' ? 'DATA' : document.documentElement.lang === 'fr' ? 'DONNÉES' : '数据'}</p>
      <h2 id="legal-title" tabindex="-1">${t.title}</h2><p>${t.intro}</p><p>${t.scope}</p>
      <button type="button" class="legal-primary" id="legal-explore">${t.explore} ↗</button><p>${t.demoNote}</p>
      <h3>${t.problemTitle}</h3><p>${t.problem}</p>
      <h3>${t.capabilitiesTitle}</h3><ul class="legal-capabilities">${t.capabilities.map(([title, body]) => `<li><strong>${title}</strong>${body}</li>`).join('')}</ul>
      <h3>${t.workflowTitle}</h3><p>${t.workflow}</p>
      <h3>${t.deliveryTitle}</h3><ol>${t.delivery.map(item => `<li>${item}</li>`).join('')}</ol><p>${t.proposal}</p>
      <button type="button" class="legal-primary legal-enquiry">${t.enquire} ↗</button>`;
    dialog.querySelector('.close').onclick = () => dialog.close();
    dialog.querySelector('#legal-explore').onclick = openWorkspace;
    dialog.querySelector('.legal-enquiry').onclick = enquire;
  }
  function enquire() {
    enquiryPending = true;
    dialog.close();
    document.querySelector('#interest').selectedIndex = 1;
    document.querySelector('#contact').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  function exitWorkspace() {
    inWorkspace = false;
    dialog.classList.remove('legal-workspace');
    render();
    dialog.querySelector('#legal-explore').focus();
  }
  function openWorkspace() {
    inWorkspace = true;
    dialog.classList.add('legal-workspace');
    window.EncompassLegalWorkspace({root:dialog, language:document.documentElement.lang, onExit:exitWorkspace, onEnquire:enquire});
    dialog.scrollTop = 0;
  }
  dialog.addEventListener('cancel', event => {
    if (inWorkspace) { event.preventDefault(); exitWorkspace(); }
  });
  // Replace only the Data Centre legal card handler installed by app.js.
  trigger.onclick = () => {
    inWorkspace = false; dialog.classList.remove('legal-workspace'); render(); dialog.showModal(); dialog.scrollTop = 0;
    dialog.querySelector('#legal-title').focus({preventScroll: true});
  };
  // Keep keyboard focus on the dialog controls, including when cycling past the last one.
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape' && inWorkspace) {
      event.preventDefault(); event.stopPropagation(); exitWorkspace(); return;
    }
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
  document.querySelector('#language').addEventListener('change', () => { if (dialog.open) { if (inWorkspace) openWorkspace(); else render(); } });
})();
