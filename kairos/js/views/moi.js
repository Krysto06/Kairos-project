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
          h('div',{},h('h3',{class:'font-display text-4xl sm:text-5xl font-extrabold tracking-tight'},p.name||'Ton nom'),h('p',{class:'mt-1 font-semibold text-ci'},p.headline||'Économiste · Data analyst · Financial analyst · Python · Linux')),
          h('button',{class:GHOST,onclick:()=>{UI.editProfile=!UI.editProfile;render();}},UI.editProfile?'✓ Terminer':'✎ Modifier mon profil')),
        UI.editProfile
          ? h('div',{class:'mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'},fields.map(([k,l])=>h('div',{class:'grid gap-1 min-w-0'},h('label',{class:LABEL,for:'pf-'+k},l),
              h('input',{class:IN+' bg-surface/80',id:'pf-'+k,value:p[k]||'',placeholder:l,oninput:e=>{p[k]=e.target.value;save();}}))))
          : [h('div',{class:'mt-5 grid gap-2.5 grid-cols-2 md:grid-cols-5'},fact('education','Éducation'),fact('children','Enfants'),fact('status','Statut'),fact('city','Ville / pays'),fact('languages','Langues')),
             p.motto?h('p',{class:'mt-4 font-display text-lg sm:text-xl text-ci'},'« '+p.motto+' »'):null])));

  const card=(c,title,big,cap,p,tab)=>h('button',{'data-c':c,onclick:()=>go(tab),class:'group relative overflow-hidden rounded-3xl p-5 text-left cursor-pointer min-w-0 bg-gradient-to-br from-c to-surface ring-1 ring-ci/25 shadow-soft hover:shadow-lift hover:-translate-y-1 transition'},
    h('div',{class:'flex items-start justify-between gap-2'},h('span',{class:'font-display text-lg font-extrabold text-ci'},title),h('span',{class:'grid h-8 w-8 flex-none place-items-center rounded-full bg-ci text-white text-sm group-hover:translate-x-0.5 transition','aria-hidden':'true'},'→')),
    h('div',{class:'mt-4 font-display text-3xl font-extrabold tabular-nums whitespace-nowrap'},big),
    h('div',{class:'mt-0.5 text-[13px] text-muted truncate'},cap),
    bar(p,'mt-3'));
  const sumTracks=g=>{ const ts=TRACKS.filter(t=>(t.group||'langues')===g); const a=ts.reduce((x,t)=>{const q=trackProg(t);x.d+=q.d;x.n+=q.n;return x},{d:0,n:0}); return {d:a.d,n:a.n,p:a.n?a.d/a.n:0,cap:ts.map(t=>t.title.replace(' Roadmap','')).join(' · ')}; };
  const lg=sumTracks('langues'), dp=sumTracks('diplomes');
  const sk=SKILLS.reduce((a,x)=>{const q=skillProg(x);a.d+=q.d;a.n+=q.n;return a},{d:0,n:0});
  const ym=ymNow(), fm=finMonthCalc(ym);
  const wd=['wd-day','wd-norah','wd-work'].reduce((a,id)=>{const q=listProg(id);a.d+=q.d;a.n+=q.n;return a},{d:0,n:0});
  const gl=listProg('glow'), ka=listProg('rentree');
  const encours=S.projects.filter(x=>x.status==='cours').length, projDone=S.projects.length?S.projects.filter(x=>x.status==='fini').length/S.projects.length:0;
  const cards=[
    card('edu','Langues',lg.d+'/'+lg.n,lg.cap,lg.p,'langues'),
    card('edu','Diplômes',dp.d+'/'+dp.n,dp.cap,dp.p,'diplomes'),
    card('sk','Skills',sk.d+'/'+sk.n,SKILLS.length+' roadmaps : Linux, Python, data…',sk.n?sk.d/sk.n:0,'skills'),
    card('fin','Finance',fm.n?money(fm.solde):'$0',fm.rev?('Reste du mois · épargne '+Math.round(fm.rate*100)+' %'):'Reste du mois',fm.rev?Math.max(0,Math.min(1,fm.solde/fm.rev)):0,'finance'),
    card('sty','Style',wd.d+'/'+wd.n,'Garde-robes · looks · capsule',wd.n?wd.d/wd.n:0,'style'),
    card('pro','Projets',String(encours),encours===1?'projet en cours':'projets en cours',projDone,'projets'),
    card('me','Famille',ka.d+'/'+ka.n,'Rentrée de Norah · dates · objectifs',ka.p,'famille'),
    card('pro','Perso',gl.d+'/'+gl.n,'Glow Up · Kit Nails · Bizi',gl.p,'perso')
  ];

  const nexts=[];
  for (const tr of TRACKS){ const s=trackSteps(tr).find(x=>!isDone(x.id)); if (s) nexts.push({c:'edu',tag:s.lvl||(s.summit?'★':'EX'),t:s.t,sub:tr.title,on:()=>go(tr.group||'langues',tr.id)}); }
  for (const sk of SKILLS){ const i=sk.mods.findIndex((m,i)=>!S.skillsDone.includes(sk.id+':'+i)); if (i>=0) nexts.push({c:'sk',tag:sk.id.toUpperCase().slice(0,4),t:sk.mods[i][0],sub:sk.title,on:()=>go('skills')}); }
  for (const pr of S.projects.filter(x=>x.status==='cours'&&x.next)) nexts.push({c:'pro',tag:'PRJ',t:pr.next,sub:pr.name,on:()=>go('projets')});
  const today=todayISO();
  const dated=[]; for (const id of ['glow','bizi','nails','rentree']) { const L=LISTS.find(x=>x.id===id); for (const it of (S.lists[id]||[])) if (it.due && !it.done) dated.push({it,L}); }
  dated.sort((a,z)=>a.it.due<z.it.due?-1:1);
  const todo=dated.slice(0,4).map(({it,L})=>({c:'pro',tag:'TODO',t:it.t,sub:L.title+' · '+(it.due<today?'en retard depuis le ':'pour le ')+dueLabel(it.due),on:()=>go(L.id==='rentree'?'famille':'perso')}));
  const actions=todo.concat(nexts);

  const coach=vCoach();
  return h('section',{class:'view grid gap-6'},profile,coach,
    h('div',{},h('div',{class:EYEBROW+' mb-3'},'Vue d’ensemble'),h('div',{class:'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'},cards)),
    h('div',{class:CARD},
      h('h2',{class:'font-display text-2xl font-extrabold'},'Tes prochaines actions'),
      h('p',{class:'text-sm text-muted mt-0.5 mb-3'},'Les to-do avec une date, puis la première étape non cochée de chaque parcours.'),
      actions.length ? h('div',{class:'divide-y divide-line'},actions.slice(0,6).map(n=>h('button',{'data-c':n.c,onclick:n.on,class:'group flex w-full items-center gap-3 py-3 text-left cursor-pointer'},
          h('span',{class:'grid h-10 w-10 flex-none place-items-center rounded-xl bg-c text-ci font-mono text-[11px] font-semibold'},n.tag),
          h('span',{class:'min-w-0 flex-1'},h('span',{class:'block font-semibold'},n.t),h('span',{class:'block text-[13px] text-muted'},n.sub)),
          h('span',{class:'text-muted group-hover:text-ci group-hover:translate-x-1 transition'},'→'))))
        : h('p',{class:'text-muted'},'Tout est coché. Ajoute un nouveau projet ou une nouvelle étape.')),
    vBackup());
}
