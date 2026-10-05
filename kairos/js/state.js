const CAPSULE = ['Blazer bien coupé','Chemise blanche','T-shirts blanc & noir','Jean droit brut','Pantalon à pinces','Pull col roulé','Trench beige','Manteau long','Sneakers blanches','Mocassins','Sac en cuir','Montre simple'];
const KINDS = {besoin:'Besoins',envie:'Envies',epargne:'Épargne & avenir'};
const STATUS = {idee:'Idée',cours:'En cours',pause:'En pause',fini:'Terminé'};
const STATUS_C = {idee:'me',cours:'edu',pause:'pro',fini:'fin'};
const DEFAULT = {
  profile:{name:'Krystofia',headline:'',education:'',children:'',status:'',city:'',languages:'',motto:''},
  done:[], custom:{}, abcLink:'', skillsDone:[], favs:[], capsule:[], projects:[],
  budget:{salary:0,currency:'€',example:false,lines:[
    {id:'l1',label:'Logement',kind:'besoin',amount:0},{id:'l2',label:'Alimentation',kind:'besoin',amount:0},
    {id:'l3',label:'Transport',kind:'besoin',amount:0},{id:'l4',label:'Enfants & famille',kind:'besoin',amount:0},
    {id:'l5',label:'Loisirs & sorties',kind:'envie',amount:0},{id:'l6',label:'Style & shopping',kind:'envie',amount:0},
    {id:'l7',label:'Formations (CFA, TOEFL, GRE)',kind:'epargne',amount:0},{id:'l8',label:'Épargne de précaution',kind:'epargne',amount:0},
    {id:'l9',label:'Investissement',kind:'epargne',amount:0}]}
};

/* ---------- Classes réutilisées ---------- */
const CARD='rounded-3xl bg-surface/80 backdrop-blur-xl ring-1 ring-line/80 shadow-soft p-5 sm:p-6 min-w-0';
const BTN='inline-flex items-center justify-center gap-1.5 rounded-xl bg-btn text-btnink px-4 py-2.5 text-sm font-semibold shadow-soft hover:opacity-90 active:scale-[.98] transition cursor-pointer';
const BTN_SM='inline-flex items-center justify-center gap-1.5 rounded-xl bg-btn text-btnink px-3 py-1.5 text-[13px] font-semibold hover:opacity-90 active:scale-[.98] transition cursor-pointer';
const GHOST='inline-flex items-center justify-center gap-1.5 rounded-xl ring-1 ring-line bg-surface/70 px-3 py-1.5 text-[13px] font-semibold hover:ring-ci hover:text-ci transition cursor-pointer no-underline';
const IN='w-full min-w-0 rounded-xl bg-soft/80 px-3 py-2.5 text-sm ring-1 ring-transparent focus:bg-surface focus:ring-2 focus:ring-ci/60 focus:outline-none transition placeholder:text-muted/70';
const LABEL='text-xs font-semibold text-muted';
const EYEBROW='text-[11px] font-bold uppercase tracking-[.1em] text-muted';
const H2='font-display font-extrabold text-3xl sm:text-4xl tracking-tight';
const LINKCHIP='inline-flex items-center gap-1 rounded-lg bg-soft px-2.5 py-1 text-xs font-semibold text-ink no-underline ring-1 ring-transparent hover:ring-ci hover:text-ci transition';

/* ---------- Utilitaires ---------- */
const clone = o => JSON.parse(JSON.stringify(o));
const $ = s => document.querySelector(s);
function h(tag, attrs, ...kids){
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs||{})){
    if (v==null || v===false) continue;
    if (k==='class') el.className=v;
    else if (k==='style') el.style.cssText=v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2),v);
    else if (k==='html') el.innerHTML=v;
    else el.setAttribute(k, v===true?'':v);
  }
  for (const c of kids.flat(9)){ if (c==null||c===false) continue; el.append(c.nodeType?c:document.createTextNode(String(c))); }
  return el;
}
const uid = () => Math.random().toString(36).slice(2,9);
const stable = v => Array.isArray(v) ? '['+v.map(stable).join(',')+']' : (v && typeof v==='object') ? '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}' : JSON.stringify(v);
function lsGet(k){ try{ return localStorage.getItem(k) }catch(e){ return null } }
function lsSet(k,v){ try{ localStorage.setItem(k,v) }catch(e){} }
function fmt(n){ const c=S.budget.currency; const s=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Math.round(n||0)); return c==='$'?'$'+s : s+' '+c; }
const linkA = (l,u) => h('a',{class:LINKCHIP,href:u,target:'_blank',rel:'noopener'},l,h('span',{class:'text-muted'},'↗'));
function ring(p, v, size=48){
  const r=(size-7)/2, C=2*Math.PI*r, off=C*(1-Math.max(0,Math.min(1,p)));
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width',size); svg.setAttribute('height',size); svg.setAttribute('viewBox',`0 0 ${size} ${size}`); svg.setAttribute('class','flex-none'); svg.setAttribute('aria-hidden','true');
  svg.innerHTML=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgb(var(--soft))" stroke-width="6"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgb(var(--${v}))" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}" transform="rotate(-90 ${size/2} ${size/2})" style="transition:stroke-dashoffset .6s ease"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-size="${size*.24}" font-family="JetBrains Mono,monospace" font-weight="600" fill="rgb(var(--ink))">${Math.round(p*100)}</text>`;
  return svg;
}
const bar = (p, extra='') => h('div',{class:'h-2 rounded-full bg-soft overflow-hidden '+extra,role:'progressbar','aria-valuenow':Math.round(p*100),'aria-valuemin':0,'aria-valuemax':100},h('div',{class:'h-full rounded-full bg-ci transition-all duration-500',style:`width:${p*100}%`}));
const secHead = (title, sub, right) => h('div',{class:'flex flex-wrap items-end justify-between gap-3 mb-5'},h('div',{},h('h2',{class:H2},title),h('p',{class:'mt-1 text-muted max-w-2xl'},sub)),right||null);

/* ---------- État & sauvegarde ---------- */
let S = clone(DEFAULT);
let docRef = null, lastJSON = '', timer = null, writing = false, again = false, deferRender = false;
const UI = { tab:'moi', track: lsGet('ssv.track') || 'en', editProfile:false, editProj:null, filter:'all', confirm:null };

function hydrate(d){
  const b = Object.assign(clone(DEFAULT), d || {});
  b.profile = Object.assign(clone(DEFAULT.profile), (d&&d.profile)||{});
  b.budget = Object.assign(clone(DEFAULT.budget), (d&&d.budget)||{});
  for (const k of ['done','skillsDone','favs','capsule','projects']) if (!Array.isArray(b[k])) b[k]=[];
  if (!b.custom || typeof b.custom!=='object') b.custom={};
  return b;
}
function setSave(s, txt){
  const el=$('#save'); el.dataset.s=s; el.lastElementChild.textContent=txt;
  el.firstElementChild.className='h-2 w-2 rounded-full '+({saved:'bg-fin-ink',saving:'bg-gold animate-pulse',error:'bg-warn'}[s]||'bg-muted');
}
function save(){ setSave('saving','Enregistrement…'); clearTimeout(timer); timer=setTimeout(flush, 600); lsSet('ssv.cache', JSON.stringify(S)); }
async function flush(){
  if (writing){ again=true; return; }
  writing=true;
  const snap = clone(S);
  try{
    if (docRef){ await docRef.set(snap); lastJSON = stable(snap); setSave('saved','Enregistré'); }
    else setSave('idle','Enregistré sur cet appareil');
  }catch(e){ setSave('error','Échec de l’enregistrement, nouvel essai à la prochaine modification'); }
  writing=false;
  if (again){ again=false; flush(); }
}
const busy = () => writing || $('#save').dataset.s==='saving';
const typing = () => { const a=document.activeElement; return a && $('#main').contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type!=='checkbox'; };
document.addEventListener('focusout', () => setTimeout(()=>{ if (deferRender && !typing()){ deferRender=false; render(); } }, 0));

/* ---------- Progression ---------- */
function trackSteps(tr){
  const custom = (S.custom[tr.id]||[]).map(c=>({id:c.id,t:c.t,d:c.d||'',links:c.url?[['Ouvrir le lien',c.url]]:[],mine:true}));
  const i = tr.steps.findIndex(s=>s.summit);
  return i<0 ? tr.steps.concat(custom) : tr.steps.slice(0,i).concat(custom, tr.steps.slice(i));
}
const isDone = id => S.done.includes(id);
function trackProg(tr){ const st=trackSteps(tr); const d=st.filter(s=>isDone(s.id)).length; return {d, n:st.length, p: st.length? d/st.length:0}; }
function skillProg(sk){ const d=sk.mods.filter((m,i)=>S.skillsDone.includes(sk.id+':'+i)).length; return {d,n:sk.mods.length,p:d/sk.mods.length}; }
function budgetCalc(){
  const b=S.budget, sal=+b.salary||0, by={besoin:0,envie:0,epargne:0};
  for (const l of b.lines) by[l.kind]=(by[l.kind]||0)+(+l.amount||0);
  const spent=by.besoin+by.envie+by.epargne;
  return {sal, by, spent, rest: sal-spent, saveRate: sal? (by.epargne+Math.max(0,sal-spent))/sal : 0};
}

/* ---------- Rendu ---------- */
function renderTabs(){
  $('#tabs').replaceChildren(...TABS.map(([id,label,c])=>{
    const on=UI.tab===id;
    return h('button',{role:'tab','aria-selected':on,'data-c':c,onclick:()=>go(id),
      class:'flex-none inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer '+(on?'bg-c text-ci shadow-soft':'text-ink/80 hover:bg-soft')},
      h('span',{class:'h-2 w-2 rounded-full bg-ci'}),label);
  }));
}
