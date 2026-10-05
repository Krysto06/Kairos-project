/* ---------- Calendrier : échéances du mois, ajout à Google Agenda, export .ics ---------- */
function calEvents(ym){
  const ev=[];
  for (const L of LISTS) for (const it of (S.lists[L.id]||[])) if (it.due) ev.push({date:it.due,title:it.t,src:L.title,c:L.c||'pro',done:it.done});
  for (const d of S.family.dates) ev.push({date:d.date,title:d.label,src:'Famille',c:'me',done:false});
  for (const e of (S.events||[])) ev.push({date:e.date,time:e.time||'',title:e.title,src:'Mon agenda',c:'edu',done:false,own:e.id});
  for (const bl of (S.budget.bills||[])){ const paid=!!(bl.paid&&bl.paid[ym]); ev.push({date:billDue(bl,ym),title:'Payer '+bl.label+(bl.amount?' ('+fmt(bl.amount)+')':''),src:'Factures',c:'fin',done:paid,recur:'MONTHLY'}); }
  return ev;
}
const d8 = iso => iso.replace(/-/g,'');
function nextDay8(iso){ const d=new Date(iso+'T12:00:00'); d.setDate(d.getDate()+1); return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'); }
function gcalUrl(e){
  let dates;
  if (e.time){ const s=d8(e.date)+'T'+e.time.replace(':','')+'00'; const t=new Date(e.date+'T'+e.time+':00'); t.setHours(t.getHours()+1);
    dates=s+'/'+t.getFullYear()+String(t.getMonth()+1).padStart(2,'0')+String(t.getDate()).padStart(2,'0')+'T'+String(t.getHours()).padStart(2,'0')+String(t.getMinutes()).padStart(2,'0')+'00'; }
  else dates=d8(e.date)+'/'+nextDay8(e.date);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(e.title)+'&dates='+dates+'&details='+encodeURIComponent('Ajouté depuis Kairos ('+e.src+')')+(e.recur?'&recur='+encodeURIComponent('RRULE:FREQ='+e.recur):'');
}
function icsEscape(s){ return String(s).replace(/\\/g,'\\\\').replace(/;/g,'\;').replace(/,/g,'\\,').replace(/\n/g,'\\n'); }
function exportICS(ym){
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kairos//FR','CALSCALE:GREGORIAN'];
  calEvents(ym).filter(e=>!e.done).forEach((e,i)=>{
    lines.push('BEGIN:VEVENT','UID:kairos-'+i+'-'+d8(e.date)+'@kairos.local','DTSTAMP:'+stamp);
    if (e.time){ lines.push('DTSTART:'+d8(e.date)+'T'+e.time.replace(':','')+'00'); const t=new Date(e.date+'T'+e.time+':00'); t.setHours(t.getHours()+1); lines.push('DTEND:'+t.getFullYear()+String(t.getMonth()+1).padStart(2,'0')+String(t.getDate()).padStart(2,'0')+'T'+String(t.getHours()).padStart(2,'0')+String(t.getMinutes()).padStart(2,'0')+'00'); }
    else lines.push('DTSTART;VALUE=DATE:'+d8(e.date),'DTEND;VALUE=DATE:'+nextDay8(e.date));
    lines.push('SUMMARY:'+icsEscape(e.title),'DESCRIPTION:'+icsEscape('Kairos · '+e.src));
    if (e.recur) lines.push('RRULE:FREQ='+e.recur);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  downloadText('kairos-calendrier.ics',lines.join('\r\n'),'text/calendar');
}

function vCalendrier(){
  UI.calMonth = UI.calMonth || ymNow();
  const ym=UI.calMonth, [y,m]=ym.split('-').map(Number);
  const shift=n=>{ const d=new Date(y,m-1+n,1); UI.calMonth=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); render(); };
  const monthName=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(new Date(y,m-1,15));
  const all=calEvents(ym).filter(e=>e.date.startsWith(ym)||e.recur&&false).sort((a,z)=>(a.date+(a.time||''))<(z.date+(z.time||''))?-1:1);
  const byDay={}; all.forEach(e=>{ (byDay[e.date]=byDay[e.date]||[]).push(e); });
  const first=new Date(y,m-1,1), lead=(first.getDay()+6)%7, days=new Date(y,m,0).getDate(), today=todayISO();
  const cells=[]; for (let i=0;i<lead;i++) cells.push(h('div',{class:'min-h-[74px] rounded-xl bg-soft/40'}));
  for (let d=1; d<=days; d++){
    const iso=ym+'-'+String(d).padStart(2,'0'), evs=byDay[iso]||[], isToday=iso===today;
    cells.push(h('div',{class:'min-h-[74px] min-w-0 rounded-xl p-1.5 ring-1 '+(isToday?'bg-ci text-white ring-ci':'bg-surface ring-line')},
      h('div',{class:'text-xs font-bold '+(isToday?'text-white':'text-muted')},d),
      evs.slice(0,2).map(e=>h('div',{'data-c':e.c,class:'mt-0.5 truncate rounded-md px-1 py-px text-[10px] font-semibold '+(e.done?'bg-soft text-muted line-through':'bg-c text-ci'),title:e.title},e.title)),
      evs.length>2?h('div',{class:'mt-0.5 text-[10px] font-semibold '+(isToday?'text-white':'text-muted')},'+'+(evs.length-2)+' autre'+(evs.length>3?'s':'')):null));
  }
  let tIn, dIn, hIn;
  const form=h('form',{class:'grid gap-2 grid-cols-1 sm:grid-cols-[1.6fr_1fr_110px_auto]',onsubmit:e=>{e.preventDefault(); const title=tIn.value.trim(); if(!title||!dIn.value) return;
      (S.events=S.events||[]).push({id:'e-'+uid(),title,date:dIn.value,time:hIn.value||''}); UI.calMonth=dIn.value.slice(0,7); save(); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); render(); }},
    tIn=h('input',{class:IN,id:'ev-title',placeholder:'Ex. : rendez-vous mémoire','aria-label':'Titre'}),
    dIn=h('input',{class:IN,id:'ev-date',type:'date',value:today.startsWith(ym)?today:ym+'-01','aria-label':'Date'}),
    hIn=h('input',{class:IN,id:'ev-time',type:'time','aria-label':'Heure (optionnel)'}),
    h('button',{class:BTN_SM,type:'submit'},'+ Ajouter'));
  const agenda=all.length?h('ul',{class:'grid gap-1'},all.map(e=>h('li',{'data-c':e.c,class:'flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-soft'},
      h('span',{class:'flex-none w-14 rounded-md bg-c px-1.5 py-0.5 text-center font-mono text-[10.5px] font-semibold text-ci'},dueLabel(e.date)),
      h('span',{class:'min-w-0 flex-1'},h('span',{class:'block text-sm font-medium break-words '+(e.done?'line-through text-muted':'')},(e.time?e.time+' · ':'')+e.title),h('small',{class:'block text-xs text-muted'},e.src)),
      h('a',{class:GHOST,href:gcalUrl(e),target:'_blank',rel:'noopener',title:'Ajouter cet événement à Google Agenda'},'Google Agenda ↗'),
      e.own?h('button',{class:'text-muted opacity-60 hover:opacity-100 hover:text-warn px-1 cursor-pointer','aria-label':'Retirer '+e.title,onclick:()=>{S.events=S.events.filter(x=>x.id!==e.own);save();render();}},'✕'):null)))
    :h('p',{class:'text-sm text-muted'},'Rien de prévu ce mois-ci.');
  return h('section',{class:'view grid gap-5','data-c':'edu'},
    secHead('Calendrier','Tes échéances du mois : to-do avec date, factures, dates de la famille et tes propres rendez-vous.',
      h('div',{class:'flex flex-wrap gap-2'},
        h('button',{class:BTN_SM,onclick:()=>exportICS(ym)},'⬇ Exporter (.ics)'),
        h('a',{class:GHOST,href:'https://calendar.google.com/',target:'_blank',rel:'noopener'},'Ouvrir Google Agenda ↗'))),
    h('div',{class:'rounded-2xl bg-pro px-4 py-3 text-sm text-pro-ink'},'Pas de synchronisation automatique : elle demanderait de te connecter à Google. À la place, chaque ligne a un bouton « Google Agenda » (un clic), et le fichier .ics s’importe dans Google Agenda, Apple Calendrier ou Outlook (les factures reviennent chaque mois).'),
    h('div',{class:CARD},
      h('div',{class:'flex items-center justify-between gap-3 mb-4'},
        h('button',{class:GHOST,onclick:()=>shift(-1),'aria-label':'Mois précédent'},'‹'),
        h('div',{class:'text-center'},h('div',{class:'font-display text-xl font-extrabold capitalize'},monthName),ym!==ymNow()?h('button',{class:'text-xs font-semibold text-ci cursor-pointer',onclick:()=>{UI.calMonth=ymNow();render();}},'Revenir à ce mois-ci'):null),
        h('button',{class:GHOST,onclick:()=>shift(1),'aria-label':'Mois suivant'},'›')),
      h('div',{class:'grid grid-cols-7 gap-1.5 mb-1.5'},['lun','mar','mer','jeu','ven','sam','dim'].map(x=>h('div',{class:'text-center text-[11px] font-bold uppercase tracking-wider text-muted'},x))),
      h('div',{class:'grid grid-cols-7 gap-1.5'},cells)),
    h('div',{class:'grid gap-5 lg:grid-cols-[1.4fr_1fr]'},
      h('div',{class:CARD},h('h3',{class:'font-display text-xl font-extrabold mb-3'},'Agenda du mois'),agenda),
      h('div',{class:CARD+' content-start'},h('h3',{class:'font-display text-xl font-extrabold'},'Ajouter un rendez-vous'),h('p',{class:'text-sm text-muted mb-3'},'Il apparaît ici et dans l’export .ics.'),form)));
}
