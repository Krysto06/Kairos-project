/* ---------- Factures, coach et retours personnalisés ---------- */
function billDue(b, ym){
  const [y,m]=ym.split('-').map(Number), last=new Date(y,m,0).getDate();
  const d=Math.min(Math.max(1,+b.day||1),last);
  return ym+'-'+String(d).padStart(2,'0');
}
function billsAlerts(){
  const ym=ymNow(), out=[];
  for (const b of (S.budget.bills||[])){
    if (b.paid && b.paid[ym]) continue;
    const due=billDue(b,ym), n=daysTo(due);
    if (n<=3) out.push({b,due,n});
  }
  return out.sort((x,y)=>x.n-y.n);
}
function coachMessages(){
  const out=[], b=S.budget, ym=ymNow(), c=finMonthCalc(ym), today=todayISO();
  for (const a of billsAlerts()){
    const when=a.n<0?'c’était prévu le '+dueLabel(a.due)+' ('+(-a.n)+' jour'+(-a.n>1?'s':'')+' de retard)':a.n===0?'c’est aujourd’hui':'dans '+a.n+' jour'+(a.n>1?'s':'');
    out.push({tone:'warn',text:'N’oublie pas de payer '+a.b.label+(a.b.amount?' ('+fmt(a.b.amount)+')':'')+' : '+when+'.'});
  }
  if (!c.n) out.push({tone:'tip',text:'Aucune transaction notée ce mois-ci. Ajoute ton salaire et tes premières dépenses dans Finance : je pourrai alors te dire comment tu t’en sors.'});
  else {
    if (c.rev){
      const pct=Math.round(c.rate*100);
      if (c.rate>=.2) out.push({tone:'good',text:'Bon mois ! Tu mets '+pct+' % de côté, au-dessus de l’objectif de 20 %. Continue comme ça.'});
      else if (c.rate>=.1) out.push({tone:'tip',text:'Pas mal : '+pct+' % d’épargne. Tu peux faire mieux, il manque '+fmt(.2*c.rev-c.epa)+' pour atteindre 20 %.'});
      else out.push({tone:'warn',text:'Tu peux faire mieux : seulement '+pct+' % d’épargne ce mois-ci. Essaie de mettre '+fmt(.1*c.rev)+' de côté dès que le salaire arrive.'});
    } else out.push({tone:'tip',text:'Ajoute ton salaire du mois pour calculer ton taux d’épargne.'});
    if (c.solde<0) out.push({tone:'warn',text:'Tu as dépensé '+fmt(-c.solde)+' de plus que tes revenus ce mois-ci. Regarde d’abord les envies avant les besoins.'});
    const byCat={}; txMonth(ym).filter(t=>t.type==='depense').forEach(t=>{ byCat[t.cat]=(byCat[t.cat]||0)+(+t.amount||0); });
    for (const l of (b.lines||[])){ const sp=byCat[l.label]||0, pl=+l.amount||0; if (pl>0 && sp>pl) out.push({tone:'warn',text:'Budget « '+l.label+' » dépassé de '+fmt(sp-pl)+'.'}); }
  }
  let late=0; for (const id of ['glow','bizi','nails']) for (const it of (S.lists[id]||[])) if (it.due && !it.done && it.due<today) late++;
  if (late) out.push({tone:'tip',text:late+' tâche'+(late>1?'s':'')+' en retard dans Perso. Choisis-en une et fais-la aujourd’hui.'});
  if (b.goal && b.goal.target>0){
    const saved=(b.tx||[]).filter(t=>t.type==='epargne').reduce((x,t)=>x+(+t.amount||0),0), p=Math.round(Math.min(1,saved/b.goal.target)*100);
    out.push({tone:p>=100?'good':'tip',text:'Objectif'+(b.goal.label?' « '+b.goal.label+' »':'')+' : '+p+' % atteint ('+fmt(saved)+' sur '+fmt(b.goal.target)+').'});
  }
  return out.slice(0,6);
}
function vCoach(){
  const msgs=coachMessages(); if (!msgs.length) return null;
  const T={good:['bg-fin text-fin-ink','✓'],warn:['bg-sty text-sty-ink','!'],tip:['bg-pro text-pro-ink','→']};
  return h('div',{class:CARD+' border-ci'},
    h('div',{class:'flex items-center justify-between gap-2 mb-3'},h('h3',{class:'font-display text-xl font-extrabold text-ci'},'Ton coach du jour')),
    h('div',{class:'grid gap-2'},msgs.map(m=>h('div',{class:'flex items-start gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium '+T[m.tone][0]},
      h('span',{class:'mt-px grid h-5 w-5 flex-none place-items-center rounded-full bg-white/70 font-mono text-[11px] font-bold','aria-hidden':'true'},T[m.tone][1]),h('span',{class:'min-w-0 break-words'},m.text)))));
}

/* Carte « Factures à payer » (dans Finance) */
function vBills(ym){
  const b=S.budget; b.bills=b.bills||[];
  let nIn, aIn, dIn;
  const rows=b.bills.slice().sort((x,y)=>(+x.day||1)-(+y.day||1)).map(bl=>{
    const paid=!!(bl.paid&&bl.paid[ym]), due=billDue(bl,ym), late=!paid && daysTo(due)<0 && ym<=ymNow();
    return h('li',{class:'flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-soft'},
      h('input',{type:'checkbox',class:'chk',id:'bill-'+bl.id,checked:paid,'aria-label':'Payée : '+bl.label,onchange:e=>{
        bl.paid=bl.paid||{};
        if (e.target.checked){ bl.paid[ym]=true; b.tx.push({id:'t-'+uid(),date:ym===ymNow()?todayISO():due,type:'depense',cat:'Autre',label:bl.label,amount:+bl.amount||0,bill:bl.id+'|'+ym}); }
        else { delete bl.paid[ym]; b.tx=b.tx.filter(t=>t.bill!==bl.id+'|'+ym); }
        save(); render(); }}),
      h('label',{for:'bill-'+bl.id,class:'min-w-0 flex-1 cursor-pointer'},h('span',{class:'block text-sm '+(paid?'line-through text-muted':'font-medium')},bl.label),h('small',{class:'block text-xs text-muted'},'Chaque mois, le '+bl.day)),
      h('span',{class:'flex-none rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-semibold '+(paid?'bg-soft text-muted':late?'bg-warn/15 text-warn':'bg-pro text-pro-ink')},paid?'Payée':dueLabel(due)),
      h('span',{class:'flex-none font-mono text-sm font-semibold tabular-nums'},fmt(bl.amount)),
      h('button',{class:'text-muted opacity-60 hover:opacity-100 hover:text-warn px-1 cursor-pointer','aria-label':'Retirer '+bl.label,onclick:()=>{b.bills=b.bills.filter(x=>x.id!==bl.id);save();render();}},'✕'));
  });
  return h('div',{class:CARD},
    h('h3',{class:'font-display text-xl font-extrabold'},'Factures à payer'),
    h('p',{class:'text-sm text-muted mb-3'},'Loyer, internet, électricité, école… Coche quand c’est payé : la dépense s’ajoute toute seule, et le coach te rappelle les échéances.'),
    rows.length?h('ul',{class:'grid gap-0.5'},rows):h('p',{class:'text-sm text-muted py-1'},'Aucune facture récurrente pour l’instant.'),
    h('form',{class:'mt-4 grid gap-2 grid-cols-1 sm:grid-cols-[1.4fr_1fr_90px_auto]',onsubmit:e=>{e.preventDefault(); const label=nIn.value.trim(); const day=Math.round(+dIn.value); if(!label||!(day>=1&&day<=31)) { dIn.focus(); return; }
        b.bills.push({id:'b-'+uid(),label,amount:+aIn.value||0,day,paid:{}}); save(); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); render(); }},
      nIn=h('input',{class:IN,id:'bill-name',placeholder:'Ex. : internet','aria-label':'Nom de la facture'}),
      aIn=h('input',{class:IN+' text-right font-mono',id:'bill-amt',type:'number',min:0,step:'any',inputmode:'decimal',placeholder:'Montant','aria-label':'Montant'}),
      dIn=h('input',{class:IN+' text-right font-mono',id:'bill-day',type:'number',min:1,max:31,placeholder:'Jour','aria-label':'Jour du mois'}),
      h('button',{class:BTN_SM,type:'submit'},'+ Ajouter')));
}
