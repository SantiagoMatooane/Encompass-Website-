(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'service-dialog';
  dialog.setAttribute('aria-labelledby', 'service-title');
  document.body.append(dialog);
  let selected = 0;
  const language = () => document.documentElement.lang;
  const strings = () => window.marketingCopy[language()] || window.marketingCopy.en;
  function render() {
    const t = strings(), web = selected === 1;
    dialog.replaceChildren();
    const close = document.createElement('button');
    close.className = 'close'; close.textContent = '×';
    close.setAttribute('aria-label', {en:'Close service details',fr:'Fermer les détails du service',zh:'关闭服务详情'}[language()] || 'Close service details');
    close.onclick = () => dialog.close();
    const layout = document.createElement('div'); layout.className = 'service-layout';
    const visual = document.createElement('div'); visual.className = 'service-visual';
    const photo = document.createElement('img'); photo.src = web ? 'assets/web-development.jpg' : 'assets/social-work.jpg';
    photo.alt = web ? 'Website development on a laptop' : 'Planning social media content with a laptop and smartphone';
    visual.append(photo);
    if (web) { const examples = document.createElement('a'); examples.className = 'solid-button'; examples.href = 'website-examples.html'; examples.textContent = t.examples; visual.append(examples); }
    const body = document.createElement('div'); body.className = 'service-copy';
    const kicker = document.createElement('p'); kicker.className = 'eyebrow'; kicker.textContent = 'ENCOMPASS / '+ (web ? '02' : '01');
    const title = document.createElement('h2'); title.id = 'service-title'; title.textContent = web ? t.flow : t.law;
    const intro = document.createElement('p'); intro.className = 'service-intro'; intro.textContent = web ? t.webIntro : t.digitalIntro;
    body.append(kicker,title,intro);
    for (const [heading,description] of web ? t.webItems : t.digitalItems) { const section = document.createElement('section'); const h = document.createElement('h3'); h.textContent = heading; const p = document.createElement('p'); p.textContent = description; section.append(h,p); body.append(section); }
    const scope = document.createElement('div'); scope.className = 'service-scope';
    const h = document.createElement('h3'); h.textContent = t.scopeTitle;
    const p = document.createElement('p'); p.textContent = web ? t.scope : t.solutionText;
    scope.append(h,p); body.append(scope);
    const enquire = document.createElement('button'); enquire.className = 'solid-button'; enquire.textContent = document.querySelector('[data-t="meet"]').textContent+' ↗';
    enquire.onclick = () => { dialog.close(); document.querySelector('#interest').selectedIndex = selected+1; document.querySelector('#contact').scrollIntoView({behavior:'instant'}); document.querySelector('#interest').focus({preventScroll:true}); };
    body.append(enquire); layout.append(visual,body); dialog.append(close,layout);
  }
  function open(index) { selected=index; render(); if(!dialog.open) dialog.showModal(); dialog.scrollTop=0; }
  document.querySelectorAll('[data-product]').forEach((button,index) => { button.onclick = () => open(index); });
  dialog.addEventListener('click',event => { if(event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close(); } });
  document.querySelector('#language').addEventListener('change',()=>{if(dialog.open)render();});
  function route() { if(location.hash==='#website-creation') open(1); }
  window.addEventListener('hashchange',route); route();
  dialog.addEventListener('close',()=>{if(location.hash==='#website-creation')history.replaceState(null,'',location.pathname+'#products');});
})();
