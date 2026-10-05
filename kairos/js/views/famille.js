function ageOf(birth){
  if (!birth) return '';
  const b=new Date(birth+'T12:00:00'); if (isNaN(b)) return '';
  const n=new Date(); let a=n.getFullYear()-b.getFullYear();
  if (n.getMonth()<b.getMonth() || (n.getMonth()===b.getMonth() && n.getDate()<b.getDate())) a--;
  return a>=0 ? a+' ans' : '';
}
function daysTo(date){ const t=new Date(todayISO()+'T12:00:00'), d=new Date(date+'T12:00:00'); return Math.round((d-t)/86400000); }

function vFamille(){
  const F=S.family;
  let nName, nRel, nBirth, nNote, dLabel, dDate;
  const members=h('div',{class:CARD},
    h('h3',{class:'font-display text-xl font-extrabold'},'Les membres'),
    h('p',{class:'text-sm text-muted mb-4'},'Les personnes qui comptent pour toi, avec une note utile (école, santé, cadeaux, etc.).'),
    F.members.length?h('div',{class:'grid gap-3 sm:grid-cols-2'},F.members.map(m=>h('div',{class:'rounded-2xl bg-soft/70 p-4 min-w-0'},
        h('div',{class:'flex items-start justify-between gap-2'},
          h('div',{class:'min-w-0'},h('div',{class:'font-display text-lg font-extrabold break-words'},m.name),h('div',{class:'text-[13px] text-muted'},[m.rel,ageOf(m.birth)].filter(Boolean).join(' · '))),
          h('button',{class:'text-muted hover:text-warn px-1 cursor-pointer','aria-label':'Retirer '+m.name,onclick:()=>{F.members=F.members.filter(x=>x.id!==m.id);save();render();}},'✕')),
        m.note?h('p',{class:'mt-2 text-sm break-words'},m.note):null)))
      :h('p',{class:'text-sm text-muted'},'Aucun membre pour l’instant. Ajoute Norah, ta maman, etc.'),
    h('form',{class:'mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.4fr_auto]',onsubmit:e=>{e.preventDefault(); const name=nName.value.trim(); if(!name) return;
        F.members.push({id:'m-'+uid(),name,rel:nRel.value.trim(),birth:nBirth.value||'',note:nNote.value.trim()}); save(); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); render();}},
      nName=h('input',{class:IN,id:'fm-name',placeholder:'Prénom','aria-label':'Prénom'}),
      nRel=h('input',{class:IN,id:'fm-rel',placeholder:'Lien (fille, maman…)','aria-label':'Lien'}),
      nBirth=h('input',{class:IN,id:'fm-birth',type:'date','aria-label':'Date de naissance'}),
      nNote=h('input',{class:IN,id:'fm-note',placeholder:'Note (optionnel)','aria-label':'Note'}),
      h('button',{class:BTN_SM,type:'submit'},'+ Ajouter')));
  const dates=F.dates.slice().sort((a,b)=>a.date<b.date?-1:1);
  const dateCard=h('div',{class:CARD},
    h('h3',{class:'font-display text-xl font-extrabold'},'Dates importantes'),
    h('p',{class:'text-sm text-muted mb-3'},'Anniversaires, rentrée, rendez-vous, passeports à renouveler.'),
    dates.length?h('ul',{class:'grid gap-1'},dates.map(d=>{const n=daysTo(d.date); const txt=n<0?'passé':n===0?'aujourd’hui':'dans '+n+' j';
      return h('li',{class:'flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-soft'},
        h('span',{class:'flex-none rounded-md bg-me px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-me-ink'},dueLabel(d.date)),
        h('span',{class:'min-w-0 flex-1 text-sm font-medium break-words '+(n<0?'text-muted':'')},d.label),
        h('span',{class:'flex-none text-xs '+(n>=0&&n<=14?'font-semibold text-ci':'text-muted')},txt),
        h('button',{class:'text-muted hover:text-warn px-1 cursor-pointer','aria-label':'Retirer '+d.label,onclick:()=>{F.dates=F.dates.filter(x=>x.id!==d.id);save();render();}},'✕'));}))
      :h('p',{class:'text-sm text-muted'},'Aucune date pour l’instant.'),
    h('form',{class:'mt-4 grid gap-2 grid-cols-1 sm:grid-cols-[1.5fr_1fr_auto]',onsubmit:e=>{e.preventDefault(); const label=dLabel.value.trim(); if(!label||!dDate.value) return;
        F.dates.push({id:'d-'+uid(),label,date:dDate.value}); save(); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); render();}},
      dLabel=h('input',{class:IN,id:'fd-label',placeholder:'Ex. : anniversaire de Norah','aria-label':'Intitulé'}),
      dDate=h('input',{class:IN,id:'fd-date',type:'date','aria-label':'Date'}),
      h('button',{class:BTN_SM,type:'submit'},'+ Ajouter')));
  return h('section',{class:'view grid gap-5','data-c':'me'},
    secHead('Famille','Ceux qui comptent : membres, dates, rentrée de Norah et objectifs communs.'),
    members,
    h('div',{class:'grid gap-5 lg:grid-cols-2'},dateCard,vList('famgoals')),
    vList('rentree'));
}
