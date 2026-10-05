function vMoi(){
  const p=S.profile;
  const fact=(k,l)=>h('div',{class:'rounded-2xl bg-surface/80 px-3.5 py-3 min-w-0'},h('div',{class:EYEBROW},l),h('div',{class:'mt-0.5 break-words '+(p[k]?'font-semibold':'italic text-muted')},p[k]||'À compléter'));
  const fields=[['name','Nom'],['headline','En une phrase'],['education','Éducation'],['children','Nombre d’enfants'],['status','Statut'],['city','Ville / pays'],['languages','Langues'],['motto','Ma devise']];
  const profile=h('div',{'data-c':'me',class:'relative overflow-hidden rounded-3xl bg-gradient-to-br from-me via-me to-edu p-5 sm:p-7 shadow-soft ring-1 ring-line/60'},
    h('div',{class:'absolute -right-16 -top-16 h-56 w-56 rounded-full bg-surface/30 blur-2xl','aria-hidden':'true'}),
    h('div',{class:'relative flex flex-col sm:flex-row gap-5 sm:gap-7'},
      h('div',{class:'grid h-20 w-20 sm:h-24 sm:w-24 flex-none place-items-center rounded-[28px] bg-surface font-display text-4xl sm:text-5xl font-extrabold text-ci shadow-soft -rotate-6','aria-hidden':'true'},(p.name||'K').trim().charAt(0).toUpperCase()),
      h('div',{class:'min-w-0 flex-1'},
        h('div',{class:'flex flex-wrap items-start justify-between gap-3'},
          h('div',{},h('h3',{class:'font-display text-4xl sm:text-5xl font-extrabold tracking-tight'},p.name||'Ton nom'),h('p',{class:'mt-1 font-semibold text-ci'},p.headline||'Économiste · data · finance · Python')),
          h('button',{class:GHOST,onclick:()=>{UI.editProfile=!UI.editProfile;render();}},UI.editProfile?'✓ Terminer':'✎ Modifier mon profil')),
        UI.editProfile
          ? h('div',{class:'mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'},fields.map(([k,l])=>h('div',{class:'grid gap-1 min-w-0'},h('label',{class:LABEL,for:'pf-'+k},l),
              h('input',{class:IN+' bg-surface/80',id:'pf-'+k,value:p[k]||'',placeholder:l,oninput:e=>{p[k]=e.target.value;save();}}))))
          : [h('div',{class:'mt-5 grid gap-2.5 grid-cols-2 md:grid-cols-5'},fact('education','Éducation'),fact('children','Enfants'),fact('status','Statut'),fact('city','Ville / pays'),fact('languages','Langues')),
             p.motto?h('p',{class:'mt-4 font-display text-lg sm:text-xl text-ci'},'« '+p.motto+' »'):null])));

  const tile=(c,label,val,p,ringVar,on)=>h('button',{'data-c':c,onclick:on,class:'group flex items-center gap-3 rounded-2xl bg-surface/80 backdrop-blur p-4 ring-1 ring-line/80 shadow-soft hover:shadow-lift hover:-translate-y-0.5 hover:ring-ci/50 transition text-left cursor-pointer min-w-0'},
    ring(p,ringVar),h('div',{class:'min-w-0'},h('div',{class:'text-xs font-semibold text-muted'},label),h('div',{class:'font-display text-2xl font-extrabold tabular-nums'},val)));
  const all=SKILLS.reduce((a,s)=>{const q=skillProg(s);a.d+=q.d;a.n+=q.n;return a},{d:0,n:0});
  const bc=budgetCalc();
  const tiles=h('div',{class:'grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6'},
    TRACKS.map(tr=>{const pr=trackProg(tr);return tile('edu',tr.title,`${pr.d}/${pr.n}`,pr.p,'edu-ink',()=>go('education',tr.id));}),
    tile('sk','Skills',`${all.d}/${all.n}`,all.d/all.n,'sk-ink',()=>go('skills')),
    tile('fin','Taux d’épargne',bc.sal?Math.round(bc.saveRate*100)+' %':'–',bc.saveRate,'fin-ink',()=>go('finance')),
    tile('pro','Projets en cours',S.projects.filter(x=>x.status==='cours').length,S.projects.length?S.projects.filter(x=>x.status==='fini').length/S.projects.length:0,'pro-ink',()=>go('projets')));

  const nexts=[];
  for (const tr of TRACKS){ const s=trackSteps(tr).find(x=>!isDone(x.id)); if (s) nexts.push({c:'edu',tag:s.lvl||(s.summit?'★':'EX'),t:s.t,sub:tr.title,on:()=>go('education',tr.id)}); }
  for (const sk of SKILLS){ const i=sk.mods.findIndex((m,i)=>!S.skillsDone.includes(sk.id+':'+i)); if (i>=0) nexts.push({c:'sk',tag:sk.id.toUpperCase(),t:sk.mods[i][0],sub:sk.title,on:()=>go('skills')}); }
  for (const pr of S.projects.filter(x=>x.status==='cours'&&x.next)) nexts.push({c:'pro',tag:'PRJ',t:pr.next,sub:pr.name,on:()=>go('projets')});

  return h('section',{class:'view grid gap-6'},profile,
    h('div',{},h('div',{class:EYEBROW+' mb-3'},'Vue d’ensemble'),tiles),
    h('div',{class:CARD},
      h('h2',{class:'font-display text-2xl font-extrabold'},'Tes prochaines actions'),
      h('p',{class:'text-sm text-muted mt-0.5 mb-3'},'La première étape non cochée de chaque parcours.'),
      nexts.length ? h('div',{class:'divide-y divide-line'},nexts.slice(0,7).map(n=>h('button',{'data-c':n.c,onclick:n.on,class:'group flex w-full items-center gap-3 py-3 text-left cursor-pointer'},
          h('span',{class:'grid h-10 w-10 flex-none place-items-center rounded-xl bg-c text-ci font-mono text-[11px] font-semibold'},n.tag),
          h('span',{class:'min-w-0 flex-1'},h('span',{class:'block font-semibold'},n.t),h('span',{class:'block text-[13px] text-muted'},n.sub)),
          h('span',{class:'text-muted group-hover:text-ci group-hover:translate-x-1 transition'},'→'))))
        : h('p',{class:'text-muted'},'Tout est coché. Ajoute un nouveau projet ou une nouvelle étape.')));
}

