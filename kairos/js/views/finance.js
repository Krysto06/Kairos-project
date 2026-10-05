function vFin(){
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
  const view=h('section',{class:'view','data-c':'fin'},
    secHead('Finance','Ton salaire, ton budget du mois, et la comparaison avec la règle 50/30/20.',
      h('div',{class:'grid gap-1'},h('label',{class:LABEL,for:'cur'},'Devise'),h('select',{class:IN+' cursor-pointer w-28',id:'cur',onchange:e=>{b.currency=e.target.value;save();render();}},['€','$','CHF','FCFA','HTG','CAD'].map(c=>h('option',{value:c,selected:b.currency===c},c))))),
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

