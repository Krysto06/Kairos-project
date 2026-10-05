function vStyle(){
  const heart='<svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.3 3.2 5 6.4 5c2 0 3.3 1.1 4 2.3h3.2C14.3 6.1 15.6 5 17.6 5c3.2 0 5.1 3.3 3.6 6.4C19 15.6 12 20 12 20z" stroke-width="2" stroke="currentColor" fill="var(--hf,none)"/></svg>';
  const favFirst=LOOKS.slice().sort((a,b)=>(S.favs.includes(b.id)?1:0)-(S.favs.includes(a.id)?1:0));
  return h('section',{class:'view','data-c':'sty'},
    secHead('Style','Des idées de tenues façon moodboard Pinterest. Mets un cœur sur tes préférées : elles remontent en premier.'),
    h('div',{class:'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'},favFirst.map(L=>{const fav=S.favs.includes(L.id);return h('article',{class:'group flex flex-col overflow-hidden rounded-3xl bg-surface/85 backdrop-blur-xl ring-1 ring-line/80 shadow-soft hover:shadow-lift hover:-translate-y-1 transition duration-300'},
      h('div',{class:'grid h-36','aria-hidden':'true',style:`grid-template-columns:repeat(${L.pal.length},1fr)`},L.pal.map(([c,n],i)=>{const dark=parseInt(c.slice(1,3),16)*.3+parseInt(c.slice(3,5),16)*.59+parseInt(c.slice(5,7),16)*.11<140;
        return h('span',{class:'flex items-end p-2 text-[10px] font-bold uppercase tracking-wider leading-tight transition-all duration-300 group-hover:pb-4',style:`background:${c};color:${dark?'rgba(255,255,255,.85)':'rgba(27,32,48,.7)'};transition-delay:${i*40}ms`},n);})),
      h('div',{class:'flex flex-1 flex-col gap-3 p-5'},
        h('div',{class:'flex items-start justify-between gap-2'},
          h('div',{},h('h3',{class:'font-display text-xl font-extrabold'},L.name),h('p',{class:'text-sm text-muted'},L.vibe)),
          h('button',{class:'grid h-10 w-10 flex-none place-items-center rounded-full transition cursor-pointer '+(fav?'bg-sty text-sty-ink ring-1 ring-sty-ink/40 scale-105':'ring-1 ring-line text-muted hover:text-sty-ink hover:ring-sty-ink/40'),style:fav?'--hf:currentColor':'','aria-pressed':fav,'aria-label':(fav?'Retirer des favoris ':'Ajouter aux favoris ')+L.name,html:heart,onclick:()=>{S.favs=fav?S.favs.filter(x=>x!==L.id):S.favs.concat(L.id);save();render();}})),
        h('ul',{class:'grid gap-1 text-sm'},L.pieces.map(p=>h('li',{class:'flex gap-2'},h('span',{class:'text-sty-ink'},'•'),p))),
        h('div',{class:'rounded-xl bg-sty/70 px-3 py-2 text-[13px] text-sty-ink'},L.tip),
        h('div',{class:'mt-auto pt-1'},linkA('Voir sur Pinterest','https://www.pinterest.com/search/pins/?q='+encodeURIComponent(L.q)))));})),
    h('div',{class:CARD+' mt-6'},
      h('div',{class:'flex flex-wrap items-center justify-between gap-3'},
        h('div',{},h('h3',{class:'font-display text-xl font-extrabold'},'Ma garde-robe capsule'),h('p',{class:'text-sm text-muted'},'Les 12 pièces de base qui vont avec tous les looks. Coche celles que tu as déjà.')),
        h('span',{class:'rounded-full bg-sty px-3 py-1 font-mono text-xs font-semibold text-sty-ink'},`${S.capsule.length} / ${CAPSULE.length}`)),
      bar(S.capsule.length/CAPSULE.length,'mt-4'),
      h('div',{class:'mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'},CAPSULE.map((c,i)=>{const on=S.capsule.includes(c);return h('label',{class:'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer transition '+(on?'bg-sty text-sty-ink font-semibold':'ring-1 ring-line hover:ring-sty-ink/40')},
        h('input',{type:'checkbox',class:'chk',id:'cap-'+i,checked:on,onchange:e=>{S.capsule=e.target.checked?S.capsule.concat(c):S.capsule.filter(x=>x!==c);save();render();}}),c);}))));
}

