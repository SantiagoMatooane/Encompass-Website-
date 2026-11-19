(() => {
  const selector=document.querySelector('#portfolio-language');
  let lang='en'; try {lang=localStorage.getItem('encompass-language')||'en';}catch{}
  if(!window.marketingCopy[lang])lang='en';
  function translate(){const t=window.marketingCopy[lang];document.documentElement.lang=lang;document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t[el.dataset.t]);document.querySelector('.preview-close').setAttribute('aria-label',t.closePreview);selector.value=lang;document.title=t.portfolioLabel+' — Encompass Corp.';}
  translate();selector.onchange=()=>{lang=selector.value;translate();try{localStorage.setItem('encompass-language',lang);}catch{}};
  const dialog=document.querySelector('#image-preview');
  document.querySelectorAll('.work-card').forEach(card=>card.onclick=()=>{const image=card.querySelector('img');dialog.querySelector('img').src=image.src;dialog.querySelector('img').alt=image.alt;dialog.querySelector('p').textContent=image.alt;dialog.showModal();});
  document.querySelector('.preview-close').onclick=()=>dialog.close();
  dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};
})();
