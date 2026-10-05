function vProj(){
  const list=S.projects.filter(p=>UI.filter==='all'||p.status===UI.filter);
  const fld=(id,label,input)=>h('div',{class:'grid gap-1 min-w-0'},h('label',{class:LABEL,for:id},label),input);
  const card=p=>{
    if (UI.editProj===p.id) return h('div',{class:CARD+' grid gap-3 ring-2 ring-pro-ink/40'},
      fld('pn-'+p.id,'Nom du projet',h('input',{class:IN,id:'pn-'+p.id,value:p.name,oninput:e=>{p.name=e.target.value;save();}})),
      fld('pc-'+p.id,'Catégorie',h('input',{class:IN,id:'pc-'+p.id,value:p.cat||'',placeholder:'Data, finance, perso…',oninput:e=>{p.cat=e.target.value;save();}})),
      fld('ps-'+p.id,'Statut',h('select',{class:IN+' cursor-pointer',id:'ps-'+p.id,onchange:e=>{p.status=e.target.value;save();}},Object.entries(STATUS).map(([k,v])=>h('option',{value:k,selected:p.status===k},v)))),
      h('div',{class:'grid gap-1'},h('label',{class:LABEL,for:'pp-'+p.id},'Avancement : ',h('span',{class:'font-mono',id:'ppv-'+p.id},(p.progress||0)+' %')),
        h('input',{id:'pp-'+p.id,type:'range',min:0,max:100,step:5,value:p.progress||0,class:'w-full',style:'accent-color:rgb(var(--pro-ink))',oninput:e=>{p.progress=+e.target.value;document.getElementById('ppv-'+p.id).textContent=p.progress+' %';save();}})),
      fld('px-'+p.id,'Prochaine étape',h('input',{class:IN,id:'px-'+p.id,value:p.next||'',oninput:e=>{p.next=e.target.value;save();}})),
      fld('pl-'+p.id,'Lien',h('input',{class:IN,id:'pl-'+p.id,value:p.link||'',placeholder:'https://…',oninput:e=>{p.link=e.target.value.trim();save();}})),
      h('div',{class:'flex flex-wrap gap-2 pt-1'},h('button',{class:BTN_SM,onclick:()=>{UI.editProj=null;render();}},'✓ Terminer'),
        h('button',{class:'rounded-xl px-3 py-1.5 text-[13px] font-semibold text-warn ring-1 ring-line hover:ring-warn/50 cursor-pointer transition',onclick:()=>{ if(UI.confirm===p.id){S.projects=S.projects.filter(x=>x.id!==p.id);UI.editProj=null;UI.confirm=null;save();}else UI.confirm=p.id; render(); }},UI.confirm===p.id?'Confirmer la suppression':'Supprimer')));
    let link=p.link; if (link&&!/^https?:\/\//i.test(link)) link='https://'+link;
    return h('div',{'data-c':STATUS_C[p.status]||'me',class:CARD+' flex flex-col gap-3 hover:shadow-lift hover:-translate-y-0.5 transition'},
      h('div',{class:'flex flex-wrap items-center gap-2'},h('span',{class:'rounded-full bg-c px-2.5 py-0.5 text-xs font-bold text-ci'},STATUS[p.status]||'Idée'),p.cat?h('span',{class:'text-[13px] text-muted'},p.cat):null),
      h('h3',{class:'font-display text-xl font-extrabold break-words'},p.name||'Sans titre'),
      h('div',{class:'flex items-center gap-3','data-c':'pro'},bar((p.progress||0)/100,'flex-1'),h('span',{class:'font-mono text-xs text-muted'},(p.progress||0)+' %')),
      p.next?h('div',{class:'rounded-xl bg-soft/80 px-3 py-2 text-sm'},h('div',{class:EYEBROW},'Prochaine étape'),p.next):null,
      h('div',{class:'mt-auto flex flex-wrap gap-2 pt-1','data-c':'pro'},h('button',{class:GHOST,onclick:()=>{UI.editProj=p.id;UI.confirm=null;render();}},'✎ Modifier'),link?h('a',{class:GHOST,href:link,target:'_blank',rel:'noopener'},'Ouvrir ↗'):null));
  };
  return h('section',{class:'view','data-c':'pro'},
    secHead('Projets','Tout ce que tu construis, avec la prochaine étape de chaque projet.',
      h('button',{class:BTN,onclick:()=>{const id='p'+uid();S.projects.unshift({id,name:'Nouveau projet',cat:'',status:'idee',progress:0,next:'',link:''});UI.editProj=id;UI.filter='all';save();render();setTimeout(()=>{const el=document.getElementById('pn-'+id);el&&el.select();},30);}},'+ Nouveau projet')),
    h('div',{class:'flex flex-wrap gap-1.5 mb-5'},[['all','Tous']].concat(Object.entries(STATUS)).map(([k,v])=>{const on=UI.filter===k;return h('button',{'aria-pressed':on,onclick:()=>{UI.filter=k;render();},
      class:'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition cursor-pointer '+(on?'bg-pro text-pro-ink shadow-soft':'bg-surface/70 ring-1 ring-line hover:ring-pro-ink/40')},
      v+' · '+(k==='all'?S.projects.length:S.projects.filter(p=>p.status===k).length));})),
    list.length? h('div',{class:'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'},list.map(card))
      : h('div',{class:'rounded-3xl border-2 border-dashed border-line p-10 text-center text-muted'},S.projects.length?'Aucun projet avec ce statut.':'Aucun projet pour l’instant. Clique sur « + Nouveau projet » pour ajouter le premier.'));
}

