/* ---------- Finance : suivi des transactions (en dollars par défaut) ---------- */
const TX_TYPES = {revenu:'Revenu', depense:'Dépense', epargne:'Épargne'};
function ymNow(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function money(n){ return (n<0?'−':'')+fmt(Math.abs(n)); }
function txCats(type){
  const lines=S.budget.lines||[];
  if (type==='revenu') return ['Salaire','Autre revenu','Cadeau','Vente'];
  if (type==='epargne') return lines.filter(l=>l.kind==='epargne').map(l=>l.label).concat('Autre épargne');
  return lines.filter(l=>l.kind!=='epargne').map(l=>l.label).concat('Autre');
}
function txMonth(ym){ return (S.budget.tx||[]).filter(t=>t.date && t.date.startsWith(ym)); }
function finMonthCalc(ym){
  const a=txMonth(ym), sum=ty=>a.filter(t=>t.type===ty).reduce((x,t)=>x+(+t.amount||0),0);
  const rev=sum('revenu'), dep=sum('depense'), epa=sum('epargne');
  return {rev, dep, epa, solde:rev-dep-epa, rate:rev?epa/rev:0, n:a.length};
}

function vFin(){
  const b=S.budget; if(!Array.isArray(b.tx)) b.tx=[]; if(!b.goal) b.goal={label:'',target:0};
  UI.finMonth = UI.finMonth || ymNow(); UI.finType = UI.finType || 'depense';
  const ym=UI.finMonth, c=finMonthCalc(ym);
  const monthName=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(new Date(ym+'-15T12:00:00'));
  const shift=n=>{ const [y,m]=ym.split('-').map(Number); const d=new Date(y,m-1+n,1); UI.finMonth=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); render(); };
  const kpi=(label,val,cls,sub)=>h('div',{class:'rounded-2xl bg-surface/80 backdrop-blur p-4 ring-1 ring-line/80 shadow-soft min-w-0'},
    h('div',{class:EYEBROW},label),h('div',{class:'mt-1 font-display text-2xl sm:text-3xl font-extrabold tabular-nums break-words '+(cls||'')},val),sub?h('div',{class:'mt-0.5 text-xs text-muted'},sub):null);
  const kpis=h('div',{class:'grid gap-3 grid-cols-2 lg:grid-cols-4'},
    kpi('Revenus',money(c.rev),'text-fin-ink'), kpi('Dépenses',money(c.dep)), kpi('Épargne',money(c.epa),'text-edu-ink'),
    kpi('Reste du mois',money(c.solde),c.solde<0?'text-warn':'', c.rev?('Taux d’épargne : '+Math.round(c.rate*100)+' %'):'Ajoute un revenu pour voir ton taux d’épargne'));
  const monthBar=h('div',{class:'flex items-center justify-between gap-3 my-4'},
    h('button',{class:GHOST,onclick:()=>shift(-1),'aria-label':'Mois précédent'},'‹'),
    h('div',{class:'text-center'},h('div',{class:'font-display text-xl font-extrabold capitalize'},monthName),
      ym!==ymNow()?h('button',{class:'text-xs font-semibold text-ci cursor-pointer',onclick:()=>{UI.finMonth=ymNow();render();}},'Revenir au mois en cours'):null),
    h('button',{class:GHOST,onclick:()=>shift(1),'aria-label':'Mois suivant'},'›'));

  /* --- Formulaire d’ajout --- */
  let typeSel, dateIn, catSel, labelIn, amtIn;
  const field=(label,input)=>h('div',{class:'grid gap-1 min-w-0'},h('label',{class:LABEL,for:input.id},label),input);
  const fillCats=()=>{ catSel.replaceChildren(...txCats(typeSel.value).map(x=>h('option',{value:x},x))); };
  const today=todayISO();
  const form=h('form',{class:'grid gap-3 grid-cols-2 lg:grid-cols-[130px_150px_1fr_1.2fr_130px_auto] items-end',onsubmit:e=>{
      e.preventDefault(); const amount=+amtIn.value; if(!(amount>0)||!dateIn.value){ amtIn.focus(); return; }
      b.tx.push({id:'t-'+uid(),date:dateIn.value,type:typeSel.value,cat:catSel.value,label:labelIn.value.trim(),amount});
      b.example=false; UI.finMonth=dateIn.value.slice(0,7); save(); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); render(); }},
    field('Type',typeSel=h('select',{class:IN+' cursor-pointer',id:'tx-type',onchange:()=>{UI.finType=typeSel.value;fillCats();}},Object.entries(TX_TYPES).map(([k,v])=>h('option',{value:k,selected:k===UI.finType},v)))),
    field('Date',dateIn=h('input',{class:IN,id:'tx-date',type:'date',value:today.startsWith(ym)?today:ym+'-01'})),
    field('Catégorie',catSel=h('select',{class:IN+' cursor-pointer',id:'tx-cat'})),
    field('Détail (optionnel)',labelIn=h('input',{class:IN,id:'tx-label',placeholder:'Ex. : courses du samedi'})),
    field('Montant ('+b.currency+')',amtIn=h('input',{class:IN+' text-right font-mono',id:'tx-amt',type:'number',min:0,step:'any',inputmode:'decimal',placeholder:'0'})),
    h('button',{class:BTN,type:'submit'},'+ Ajouter'));
  fillCats();

  /* --- Transactions du mois --- */
  const txs=txMonth(ym).sort((a,z)=>a.date<z.date?1:a.date>z.date?-1:0);
  const color={revenu:'text-fin-ink',depense:'text-ink',epargne:'text-edu-ink'}, sign={revenu:'+',depense:'−',epargne:'→'};
  const list=txs.length?h('ul',{},txs.map(t=>h('li',{class:'grid grid-cols-[52px_1fr_auto_24px] items-center gap-2 py-2 border-t border-line first:border-t-0'},
      h('span',{class:'font-mono text-xs text-muted'},dueLabel(t.date)),
      h('span',{class:'min-w-0'},h('span',{class:'block text-sm font-medium break-words'},t.label||t.cat),h('small',{class:'block text-xs text-muted'},t.cat+' · '+TX_TYPES[t.type])),
      h('span',{class:'font-mono text-sm font-semibold tabular-nums '+color[t.type]},sign[t.type]+fmt(t.amount)),
      h('button',{class:'text-muted opacity-60 hover:opacity-100 hover:text-warn cursor-pointer','aria-label':'Supprimer cette ligne',onclick:()=>{b.tx=b.tx.filter(x=>x.id!==t.id);save();render();}},'✕'))))
    :h('p',{class:'text-sm text-muted py-2'},'Aucune transaction ce mois-ci. Ajoute ton salaire, puis tes dépenses au fil de l’eau.');

  /* --- Dépenses par catégorie (réel contre prévu) --- */
  const byCat={}; txMonth(ym).filter(t=>t.type==='depense').forEach(t=>{ byCat[t.cat]=(byCat[t.cat]||0)+(+t.amount||0); });
  const planned={}; (b.lines||[]).forEach(l=>{ planned[l.label]=+l.amount||0; });
  const cats=Object.keys(byCat).sort((x,y)=>byCat[y]-byCat[x]);
  const maxv=Math.max(1,...cats.map(k=>Math.max(byCat[k],planned[k]||0)));
  const breakdown=cats.length?h('div',{class:'grid gap-3'},cats.map(k=>{ const sp=byCat[k], pl=planned[k]||0, over=pl>0&&sp>pl;
      return h('div',{},h('div',{class:'flex items-baseline justify-between gap-2 text-sm'},h('span',{class:'font-medium'},k),h('span',{class:'font-mono text-xs '+(over?'text-warn font-semibold':'text-muted')},fmt(sp)+(pl?' / '+fmt(pl):''))),
        h('div',{class:'mt-1 h-2 rounded-full bg-soft overflow-hidden'},h('div',{class:'h-full rounded-full '+(over?'bg-warn':'bg-ci'),style:'width:'+(sp/maxv*100)+'%'})));}))
    :h('p',{class:'text-sm text-muted'},'Les dépenses du mois apparaîtront ici, comparées à ton budget prévu quand tu en as défini un.');

  /* --- Objectif d’épargne --- */
  const g=b.goal, saved=b.tx.filter(t=>t.type==='epargne').reduce((x,t)=>x+(+t.amount||0),0);
  const gBar=h('div',{class:'h-full rounded-full bg-fin-ink transition-all duration-500'}), gTxt=h('div',{class:'mt-1 font-mono text-xs text-muted'});
  const paintGoal=()=>{ const p=g.target>0?Math.min(1,saved/g.target):0; gBar.style.width=(p*100)+'%'; gTxt.textContent=g.target>0?(fmt(saved)+' mis de côté sur '+fmt(g.target)+' ('+Math.round(p*100)+' %)'):(fmt(saved)+' mis de côté au total. Fixe un objectif pour suivre ta progression.'); };
  const goal=h('div',{class:CARD},
    h('h3',{class:'font-display text-xl font-extrabold'},'Objectif d’épargne'),
    h('p',{class:'text-sm text-muted mb-3'},'Toutes tes lignes « Épargne » comptent, tous mois confondus.'),
    h('div',{class:'grid gap-2 grid-cols-[1fr_130px]'},
      h('input',{class:IN,id:'goal-label',value:g.label||'',placeholder:'Ex. : fonds d’urgence','aria-label':'Nom de l’objectif',oninput:e=>{g.label=e.target.value;save();}}),
      h('input',{class:IN+' text-right font-mono',id:'goal-target',type:'number',min:0,step:'any',inputmode:'decimal',value:g.target||'',placeholder:'0','aria-label':'Montant visé',oninput:e=>{g.target=+e.target.value||0;save();paintGoal();}})),
    h('div',{class:'mt-3 h-2.5 rounded-full bg-soft overflow-hidden'},gBar), gTxt);
  paintGoal();

  const plan=vFinBudget();
  return h('section',{class:'view','data-c':'fin'},
    secHead('Finance','Note chaque revenu, dépense et épargne du mois, et regarde où va ton argent. Tout est en dollars ($) par défaut.',
      h('div',{class:'grid gap-1'},h('label',{class:LABEL,for:'cur'},'Devise'),h('select',{class:IN+' cursor-pointer w-28',id:'cur',onchange:e=>{b.currency=e.target.value;save();render();}},['$','€','CHF','FCFA','HTG','CAD'].map(x=>h('option',{value:x,selected:b.currency===x},x))))),
    (function(){ const co=vCoach(); return co?h('div',{class:'mb-5'},co):null; })(),
    monthBar, kpis,
    h('div',{class:CARD+' mt-5'},h('h3',{class:'font-display text-xl font-extrabold mb-3'},'Ajouter une transaction'),form),
    h('div',{class:'mt-5'},vBills(ym)),
    h('div',{class:'mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]'},
      h('div',{class:CARD},h('div',{class:'flex items-center justify-between gap-2 mb-2'},h('h3',{class:'font-display text-xl font-extrabold'},'Transactions du mois'),h('span',{class:'rounded-full bg-fin px-3 py-1 font-mono text-xs font-semibold text-fin-ink'},txs.length)),list),
      h('div',{class:'grid gap-5 content-start'},h('div',{class:CARD},h('h3',{class:'font-display text-xl font-extrabold mb-3'},'Dépenses par catégorie'),breakdown),goal)),
    h('div',{class:CARD+' mt-5'},plan),
    h('div',{class:'mt-5'},vBackup()));
}

function vFinBudget(){
  const b=S.budget;
  const month=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(new Date());
  const chart=h('div',{class:'grid gap-4'}), insight=h('p',{class:'mt-5 rounded-2xl bg-fin/60 px-4 py-3 text-sm'});
  const out={}, pctCells={};
  const SEG={besoin:'bg-edu text-edu-ink',envie:'bg-sty text-sty-ink',epargne:'bg-fin text-fin-ink',reste:'text-muted'};
  function paint(){
    const c=budgetCalc();
    out.spent.textContent=fmt(c.spent); out.rest.textContent=fmt(c.rest);
    out.rest.classList.toggle('text-warn', c.rest<0);
    out.rate.textContent=c.sal?Math.round(c.saveRate*100)+' %':'–';
    const seg=(k,v,lab)=>h('span',{class:'flex items-center justify-center overflow-hidden whitespace-nowrap font-mono text-[11px] font-semibold transition-all duration-500 '+SEG[k],style:`flex:0 0 ${Math.max(0,v)*100}%`,title:`${lab} : ${Math.round(v*100)} %`},v>=.08?Math.round(v*100)+' %':'');
    const tot=Math.max(c.sal,c.spent)||1;
    const row=(l,...segs)=>h('div',{class:'grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr] items-center gap-3'},h('span',{class:EYEBROW},l),h('div',{class:'flex h-9 overflow-hidden rounded-xl bg-soft'},segs));
    chart.replaceChildren(
      row('Ton mois',seg('besoin',c.by.besoin/tot,'Besoins'),seg('envie',c.by.envie/tot,'Envies'),seg('epargne',c.by.epargne/tot,'Épargne'),c.rest>0?seg('reste',c.rest/tot,'Non affecté'):null),
      row('Règle 50/30/20',seg('besoin',.5,'Besoins'),seg('envie',.3,'Envies'),seg('epargne',.2,'Épargne')),
      h('div',{class:'flex flex-wrap gap-4 text-[13px] text-muted'},[['bg-edu','Besoins'],['bg-sty','Envies'],['bg-fin','Épargne & avenir'],['bg-soft ring-1 ring-line','Non affecté']].map(([cl,l])=>h('span',{class:'inline-flex items-center gap-1.5'},h('i',{class:'inline-block h-2.5 w-2.5 rounded '+cl}),l))));
    if (!c.sal) insight.textContent='Entre ton salaire net du mois pour voir la répartition.';
    else if (c.rest<0) insight.textContent=`Tu dépenses ${fmt(-c.rest)} de plus que ton salaire ce mois-ci. Commence par les « Envies » pour rééquilibrer.`;
    else { const e=c.by.epargne/c.sal; insight.textContent = e>=.2 ? `Bravo : ${Math.round(e*100)} % de ton salaire va à l’épargne et à l’avenir. Tu dépasses l’objectif de 20 %.` : `Tu mets ${Math.round(e*100)} % de côté. Pour atteindre 20 %, il faudrait ${fmt(.2*c.sal-c.by.epargne)} de plus par mois. Les ${fmt(c.rest)} non affectés peuvent servir.`; }
    for (const l of b.lines) if (pctCells[l.id]) pctCells[l.id].textContent = c.sal? Math.round((+l.amount||0)/c.sal*100)+' %':'';
  }
  const kpi=(label,key)=>h('div',{class:'rounded-2xl bg-surface/80 backdrop-blur p-4 ring-1 ring-line/80 shadow-soft min-w-0'},h('div',{class:EYEBROW},label),out[key]=h('div',{class:'mt-1 font-display text-2xl sm:text-3xl font-extrabold tabular-nums'}));
  const kpis=h('div',{class:'grid gap-3 grid-cols-2 lg:grid-cols-4 mb-5'},
    h('div',{class:'col-span-2 lg:col-span-1 rounded-2xl bg-gradient-to-br from-fin to-me p-4 shadow-soft min-w-0'},
      h('label',{class:EYEBROW+' block',for:'salary'},'Salaire net · '+month),
      h('input',{id:'salary',type:'number',min:0,step:10,inputmode:'decimal',value:b.salary||'',placeholder:'0',
        class:'mt-1 w-full bg-transparent font-display text-3xl font-extrabold text-fin-ink tabular-nums border-0 border-b-2 border-dashed border-fin-ink/60 focus:border-solid focus:outline-none p-0',
        oninput:e=>{b.salary=+e.target.value||0;b.example=false;save();paint();}})),
    kpi('Dépenses prévues','spent'), kpi('Reste à affecter','rest'), kpi('Taux d’épargne','rate'));
  const rows=b.lines.map(l=>h('div',{class:'grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_140px_110px_44px_28px] items-center gap-2 py-2 border-t border-line first:border-t-0'},
    h('input',{class:IN,id:'bl-'+l.id,value:l.label,'aria-label':'Poste',oninput:e=>{l.label=e.target.value;save();}}),
    h('button',{class:'sm:hidden text-muted hover:text-warn px-1 cursor-pointer','aria-label':'Supprimer '+l.label,onclick:()=>{b.lines=b.lines.filter(x=>x.id!==l.id);save();render();}},'✕'),
    h('select',{class:IN+' cursor-pointer',id:'bk-'+l.id,'aria-label':'Type',onchange:e=>{l.kind=e.target.value;save();paint();}},Object.entries(KINDS).map(([k,v])=>h('option',{value:k,selected:l.kind===k},v))),
    h('input',{class:IN+' text-right font-mono',id:'ba-'+l.id,type:'number',min:0,step:5,inputmode:'decimal',value:l.amount||'',placeholder:'0','aria-label':'Montant',oninput:e=>{l.amount=+e.target.value||0;b.example=false;save();paint();}}),
    pctCells[l.id]=h('span',{class:'hidden sm:block text-right font-mono text-xs text-muted'}),
    h('button',{class:'hidden sm:block text-muted hover:text-warn cursor-pointer','aria-label':'Supprimer '+l.label,onclick:()=>{b.lines=b.lines.filter(x=>x.id!==l.id);save();render();}},'✕')));
  const view=h('div',{'data-c':'fin'},
    h('div',{class:'mb-4'},h('h3',{class:'font-display text-2xl font-extrabold'},'Budget prévu'),h('p',{class:'text-sm text-muted'},'Planifie ton mois : salaire, postes de dépenses et comparaison avec la règle 50/30/20. Les postes servent aussi de catégories pour tes transactions.')),
    b.example?h('div',{class:'mb-4 rounded-2xl bg-pro px-4 py-3 text-sm text-pro-ink'},'✦ Chiffres d’exemple. Remplace-les par les tiens : le message disparaît dès ta première modification.'):null,
    kpis,
    h('div',{class:'grid gap-5 lg:grid-cols-[1fr_1.15fr]'},
      h('div',{class:CARD},h('h3',{class:'font-display text-xl font-extrabold mb-4'},'Répartition'),chart,insight),
      h('div',{class:CARD},
        h('div',{class:'flex items-center justify-between gap-2 mb-2'},h('h3',{class:'font-display text-xl font-extrabold'},'Budget du mois'),
          h('button',{class:BTN_SM,onclick:()=>{b.lines.push({id:'l'+uid(),label:'Nouveau poste',kind:'besoin',amount:0});save();render();setTimeout(()=>{const el=document.getElementById('bl-'+b.lines[b.lines.length-1].id);el&&el.select();},30);}},'+ Poste')),
        h('div',{},rows))));
  paint();
  return view;
}

