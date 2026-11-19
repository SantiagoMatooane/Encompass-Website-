const key='encompass-crm-theme';
const control=document.querySelector('#theme');
function apply(mode){
  const dark=mode==='dark';
  document.body.classList.toggle('dark',dark);
  document.documentElement.style.colorScheme=dark?'dark':'light';
  const label=dark?'Switch to light mode':'Switch to dark mode';
  control.setAttribute('aria-label',label);
  control.title=label;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#080b0e':'#f4f7f9');
}
let saved;
try{saved=localStorage.getItem(key)}catch{}
apply(saved);
control.addEventListener('click',()=>{
  const mode=document.body.classList.contains('dark')?'light':'dark';
  apply(mode);
  try{localStorage.setItem(key,mode)}catch{}
});
window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue)});
