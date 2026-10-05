/* ---------- Mes données : où elles sont et comment les sauvegarder ---------- */
function downloadText(name, text, type){
  const url=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));
  const a=h('a',{href:url,download:name}); document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function csvCell(v){ v=String(v==null?'':v); return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
function exportTxCSV(){
  const rows=[['date','type','categorie','detail','montant']].concat((S.budget.tx||[]).slice().sort((a,z)=>a.date<z.date?-1:1).map(t=>[t.date,TX_TYPES[t.type]||t.type,t.cat,t.label,t.amount]));
  downloadText('kairos-transactions-'+todayISO()+'.csv','﻿'+rows.map(r=>r.map(csvCell).join(';')).join('\n'),'text/csv');
}
function vBackup(){
  let fileIn;
  return h('div',{class:CARD},
    h('h3',{class:'font-display text-xl font-extrabold'},'Mes données et sauvegarde'),
    h('p',{class:'mt-1 text-sm text-muted'},'Tout ce que tu notes (finances, listes, étapes cochées) est enregistré automatiquement dans ce navigateur, sur cet appareil. Quand Kairos est ouvert dans Claude, une copie est aussi gardée dans la base intégrée. Si tu vides les données du navigateur ou changes d’appareil, elles ne suivent pas toutes seules : fais une sauvegarde de temps en temps.'),
    h('div',{class:'mt-4 flex flex-wrap gap-2'},
      h('button',{class:BTN_SM,onclick:()=>downloadText('kairos-sauvegarde-'+todayISO()+'.json',JSON.stringify(S,null,2),'application/json')},'⬇ Sauvegarder tout (JSON)'),
      h('button',{class:GHOST,onclick:exportTxCSV},'⬇ Transactions (CSV pour Excel)'),
      h('button',{class:GHOST,onclick:()=>fileIn.click()},'⬆ Restaurer une sauvegarde'),
      fileIn=h('input',{type:'file',accept:'.json,application/json',class:'hidden',id:'restore-file',onchange:e=>{
        const f=e.target.files&&e.target.files[0]; if(!f) return;
        f.text().then(t=>{ let d; try{ d=JSON.parse(t); }catch(err){ alert('Ce fichier n’est pas une sauvegarde Kairos valide.'); return; }
          if (!d || typeof d!=='object' || !d.profile){ alert('Ce fichier n’est pas une sauvegarde Kairos valide.'); return; }
          if (!confirm('Remplacer tes données actuelles par cette sauvegarde ?')) return;
          S=hydrate(d); save(); render(); }); e.target.value=''; }})));
}
