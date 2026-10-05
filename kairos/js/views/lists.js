/* ---------- Listes à cocher réutilisables (garde-robe, Glow Up, rentrée, etc.) ---------- */
function seedLists(lists){
  const out = (lists && typeof lists==='object') ? lists : {};
  for (const L of LISTS){
    if (!Array.isArray(out[L.id])) out[L.id] = L.items.map((it,i)=>({id:L.id+'-'+i, t:it[0], note:it[1]||'', due:it[2]||'', done:!!it[3]}));
  }
  return out;
}
function listProg(id){ const a=(S.lists&&S.lists[id])||[]; const d=a.filter(x=>x.done).length; return {d, n:a.length, p:a.length?d/a.length:0}; }
function todayISO(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dueLabel(due){ try{ return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(new Date(due+'T12:00:00')); }catch(e){ return due; } }

function vList(id, opts){
  opts = opts||{};
  const L = LISTS.find(x=>x.id===id); if (!L) return h('div');
  const items = S.lists[id] || (S.lists[id]=[]);
  UI.lh = UI.lh || {};
  const hide = !!UI.lh[id];
  const pr = listProg(id), today = todayISO();
  let tIn, nIn, dIn;
  const shown = items.filter(x=>!(hide && x.done));
  const rows = shown.map(it=>{
    const late = it.due && !it.done && it.due < today;
    return h('li',{class:'group flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-soft transition'},
      h('input',{type:'checkbox',class:'chk mt-0.5',id:'li-'+it.id,checked:it.done,'aria-label':it.t,onchange:e=>{it.done=e.target.checked;save();render();}}),
      h('label',{for:'li-'+it.id,class:'min-w-0 flex-1 cursor-pointer'},
        h('span',{class:'block text-sm '+(it.done?'line-through text-muted':'font-medium')},it.t),
        it.note?h('small',{class:'block text-xs text-muted font-normal'},it.note):null),
      it.due?h('span',{class:'flex-none rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-semibold '+(late?'bg-warn/15 text-warn':it.done?'bg-soft text-muted':'bg-pro text-pro-ink'),title:late?'En retard':'Date limite'},dueLabel(it.due)):null,
      h('button',{class:'flex-none text-muted opacity-60 hover:opacity-100 hover:text-warn px-1 cursor-pointer','aria-label':'Retirer '+it.t,onclick:()=>{S.lists[id]=items.filter(x=>x.id!==it.id);save();render();}},'✕'));
  });
  return h('div',{class:CARD+' flex flex-col','data-c':L.c||'me'},
    h('div',{class:'flex items-center gap-4 mb-3'},ring(pr.p,(L.c||'me')+'-ink',54),
      h('div',{class:'min-w-0 flex-1'},h('h3',{class:'font-display text-xl font-extrabold'},L.title),h('div',{class:'text-[13px] text-muted'},L.sub||'')),
      h('span',{class:'rounded-full bg-c px-3 py-1 font-mono text-xs font-semibold text-ci'},pr.d+' / '+pr.n)),
    items.some(x=>x.done)?h('button',{class:'self-start mb-2 text-xs font-semibold text-muted hover:text-ci cursor-pointer',onclick:()=>{UI.lh[id]=!hide;render();}},hide?'Afficher aussi ce qui est fait':'Masquer ce qui est fait'):null,
    rows.length?h('ul',{class:'grid gap-0.5'},rows):h('p',{class:'text-sm text-muted py-2'},items.length?'Tout est fait. Bravo !':'Rien pour l’instant. Ajoute une ligne ci-dessous.'),
    h('form',{class:'mt-4 grid gap-2 grid-cols-1 sm:grid-cols-[1.4fr_1fr_auto_auto]',onsubmit:e=>{e.preventDefault(); const t=tIn.value.trim(); if(!t) return;
        items.push({id:id+'-'+uid(),t,note:nIn.value.trim(),due:dIn.value||'',done:false}); S.lists[id]=items; save(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); render();}},
      tIn=h('input',{class:IN,id:'li-add-'+id,placeholder:'Ajouter une ligne','aria-label':'Nouvelle ligne : '+L.title}),
      nIn=h('input',{class:IN,id:'li-note-'+id,placeholder:'Note (optionnel)','aria-label':'Note'}),
      dIn=h('input',{class:IN,id:'li-due-'+id,type:'date','aria-label':'Date limite'}),
      h('button',{class:BTN_SM,type:'submit'},'+ Ajouter')));
}
