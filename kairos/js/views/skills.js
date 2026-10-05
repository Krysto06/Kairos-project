function vSkills(){
  return h('section',{class:'view','data-c':'sk'},
    secHead('Skills','Tes formations en cours. Coche chaque module terminé.'),
    h('div',{class:'grid gap-5 md:grid-cols-2 lg:grid-cols-3'},SKILLS.map(sk=>{const pr=skillProg(sk);return h('div',{class:CARD+' flex flex-col'},
      h('div',{class:'flex items-center gap-4 mb-4'},ring(pr.p,'sk-ink',58),h('div',{class:'min-w-0'},h('h3',{class:'font-display text-xl font-extrabold'},sk.title),h('div',{class:'text-[13px] text-muted'},sk.sub))),
      h('ul',{class:'grid gap-0.5'},sk.mods.map(([t,d],i)=>{const key=sk.id+':'+i, on=S.skillsDone.includes(key);return h('li',{},h('label',{class:'flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-soft cursor-pointer transition'},
        h('input',{type:'checkbox',class:'chk mt-0.5',id:'m-'+sk.id+'-'+i,checked:on,onchange:e=>{S.skillsDone=e.target.checked?S.skillsDone.concat(key):S.skillsDone.filter(x=>x!==key);save();render();}}),
        h('span',{class:'text-sm '+(on?'line-through text-muted':'font-medium')},t,d?h('small',{class:'block text-xs text-muted font-normal no-underline'},d):null)));})),
      h('div',{class:'mt-auto pt-4 flex flex-wrap gap-1.5'},sk.links.map(([l,u])=>linkA(l,u))));})));
}

