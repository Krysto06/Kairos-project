function vEdu(group){
  group = group || 'langues';
  const pool=TRACKS.filter(t=>(t.group||'langues')===group);
  const tr=pool.find(t=>t.id===UI.track)||pool[0]||TRACKS[0];
  const pr=trackProg(tr), steps=trackSteps(tr);
  const toggle=id=>{ S.done=isDone(id)?S.done.filter(x=>x!==id):S.done.concat(id); save(); render(); };
  let tIn, uIn;
  const list=h('ol',{class:'path mt-6 grid gap-4'},steps.map(s=>{
    const done=isDone(s.id);
    const badge = s.summit? null : s.mine? h('span',{class:'rounded-md bg-sk px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-sk-ink'},'PERSO') : s.exam? h('span',{class:'rounded-md bg-pro px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-pro-ink'},'EXAMEN') : h('span',{class:'rounded-md bg-edu px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-edu-ink'},s.lvl);
    const links=(s.links||[]).slice();
    if (s.abc && S.abcLink) links.unshift(['Ouvrir mon ABC',S.abcLink]);
    const nodeCls = 'relative z-10 grid h-11 w-11 flex-none place-items-center rounded-full border-2 font-mono text-[11px] font-semibold transition hover:scale-110 cursor-pointer '+
      (s.summit ? (done?'bg-gold border-gold text-surface shadow-lift':'bg-surface border-gold text-gold') : (done?'bg-edu-ink border-edu-ink text-surface':'bg-surface border-line text-muted hover:border-edu-ink'));
    const bodyCls = 'min-w-0 flex-1 rounded-2xl p-4 transition '+
      (s.summit ? 'bg-gradient-to-br from-pro to-surface ring-2 ring-gold/70 shadow-soft' : done ? 'bg-soft/70 ring-1 ring-line/60' : 'bg-surface ring-1 ring-line/80 hover:shadow-soft');
    return h('li',{class:'flex gap-3 sm:gap-4'},
      h('button',{class:nodeCls,role:'checkbox','aria-checked':done,'aria-label':(done?'Décocher ':'Cocher ')+s.t,title:done?'Fait ! (cliquer pour décocher)':'Marquer comme fait',onclick:()=>toggle(s.id)},
        done? (s.summit?'★':'✓') : (s.summit?'★':(s.lvl||(s.exam?'EX':'•')).slice(0,3))),
      h('div',{class:bodyCls},
        s.summit?h('div',{class:'text-[11px] font-extrabold uppercase tracking-[.12em] text-pro-ink'},'✦ Summum'):null,
        h('h4',{class:'flex flex-wrap items-center gap-2 '+(s.summit?'font-display text-xl font-extrabold':'font-semibold')+(done&&!s.summit?' line-through decoration-muted/60 text-muted':'')},badge,s.t,
          s.mine?h('button',{class:'ml-auto text-xs font-semibold text-muted hover:text-warn cursor-pointer',onclick:()=>{S.custom[tr.id]=(S.custom[tr.id]||[]).filter(c=>c.id!==s.id);S.done=S.done.filter(x=>x!==s.id);save();render();}},'Retirer'):null),
        s.d?h('p',{class:'mt-1 text-sm text-muted'},s.d):null,
        s.tasks?h('ul',{class:'mt-3 grid gap-2 text-sm'},s.tasks.map(([k,v])=>h('li',{class:'flex gap-2'},h('span',{class:'flex-none w-[88px] rounded-md bg-soft px-1.5 py-0.5 text-center font-mono text-[10.5px] font-semibold text-muted'},k),h('span',{class:'min-w-0 text-ink'},v)))):null,
        s.abc? h('div',{class:'mt-3 grid gap-1'},h('label',{class:LABEL,for:'abc-link'},'Lien de ton artefact ABC'),h('input',{class:IN,id:'abc-link',type:'url',placeholder:'https://claude.ai/…',value:S.abcLink,onchange:e=>{let u=e.target.value.trim(); if(u&&!/^https?:\/\//i.test(u)) u='https://'+u; S.abcLink=u;save();render();}})) : null,
        links.length?h('div',{class:'mt-3 flex flex-wrap gap-1.5'},links.map(([l,u])=>linkA(l,u))):null));
  }));
  const nextTr = tr.next && TRACKS.find(t=>t.id===tr.next);
  const afterLabel = tr.id==='lic' ? 'Après la soutenance' : 'Ensuite';
  const parts=[]; pool.forEach(t=>{ const p=t.part||''; let g=parts.find(x=>x.name===p); if(!g) parts.push(g={name:p,list:[]}); g.list.push(t); });
  const picker=h('div',{class:'grid gap-4 mb-5'},parts.map(g=>h('div',{},
    g.name?h('div',{class:EYEBROW+' mb-2'},g.name):null,
    h('div',{class:'grid gap-2.5 grid-cols-1 sm:grid-cols-3',role:'group','aria-label':g.name||'Parcours'},g.list.map(t=>{const q=trackProg(t);const on=t.id===tr.id;
      return h('button',{'aria-pressed':on,onclick:()=>{UI.track=t.id;lsSet('ssv.track',t.id);render();},
        class:'rounded-2xl p-4 text-left transition cursor-pointer '+(on?'bg-edu ring-2 ring-edu-ink/40 shadow-soft':'bg-surface/80 ring-1 ring-line/80 hover:ring-edu-ink/40')},
        h('div',{class:'flex items-center justify-between gap-2'},h('b',{class:'font-display text-lg '+(on?'text-edu-ink':'')},t.title),h('span',{class:'font-mono text-xs text-muted'},`${q.d}/${q.n}`)),
        h('div',{class:'text-[13px] text-muted mb-2'},t.sub), bar(q.p));})))));
  const HEAD = group==='diplomes' ? ['Diplômes','Licence (ton mémoire, étape par étape) et master (GRE et admissions). Clique sur un rond pour cocher une étape.'] : ['Langues','Anglais et espagnol : un parcours par niveau, avec des tâches par compétence. Clique sur un rond pour cocher une étape.'];
  return h('section',{class:'view','data-c':'edu'},
    secHead(HEAD[0],HEAD[1]),
    picker,
    h('div',{class:CARD},
      h('div',{class:'flex flex-wrap items-center gap-4'},h('h3',{class:'font-display text-2xl font-extrabold'},tr.title),bar(pr.p,'flex-1 min-w-[140px] h-2.5'),h('span',{class:'font-mono text-sm text-muted'},`${Math.round(pr.p*100)} %`)),
      h('p',{class:'mt-1 text-muted'},tr.desc),
      list,
      nextTr? h('div',{class:'mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-edu to-sk p-5'},
        h('div',{},h('div',{class:EYEBROW},afterLabel),h('div',{class:'font-display text-xl font-extrabold text-edu-ink'},nextTr.title)),
        h('button',{class:BTN,onclick:()=>go(nextTr.group||group,nextTr.id)},'Continuer vers le master →')):null,
      h('form',{class:'mt-6 grid gap-2 grid-cols-1 md:grid-cols-[1.3fr_1fr_auto]',onsubmit:e=>{e.preventDefault(); const t=tIn.value.trim(); if(!t) return; let u=uIn.value.trim(); if(u&&!/^https?:\/\//i.test(u)) u='https://'+u; (S.custom[tr.id]=S.custom[tr.id]||[]).push({id:'c-'+uid(),t,url:u}); save(); render();}},
        tIn=h('input',{class:IN,id:'add-step-'+tr.id,placeholder:'Ajouter une étape (ex. : cours particulier)','aria-label':'Nom de l’étape'}),
        uIn=h('input',{class:IN,id:'add-link-'+tr.id,placeholder:'Lien (optionnel)','aria-label':'Lien'}),
        h('button',{class:BTN,type:'submit'},'+ Ajouter'))));
}

