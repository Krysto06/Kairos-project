function render(){
  if (typing()){ deferRender=true; return; }
  renderTabs();
  const views={moi:vMoi,education:vEdu,finance:vFin,skills:vSkills,style:vStyle,projets:vProj};
  $('#main').replaceChildren((views[UI.tab]||vMoi)());
  $('#greet').textContent = `Bonjour ${S.profile.name||'toi'} ✦ Voici où tu en es : études, argent, compétences, style et projets.`;
}
function go(tab, track){ UI.tab=tab; if (track){ UI.track=track; lsSet('ssv.track',track); } lsSet('ssv.tab',tab); try{ history.replaceState(null,'','#'+tab) }catch(e){} render(); window.scrollTo({top:0,behavior:'smooth'}); }

/* ---------- Démarrage ---------- */
$('#today').textContent = new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
{ const hash=(location.hash||'').slice(1), t=lsGet('ssv.tab'), ids=TABS.map(x=>x[0]); UI.tab=ids.includes(hash)?hash:(ids.includes(t)?t:'moi'); }
try{ const c=lsGet('ssv.cache'); if (c) S=hydrate(JSON.parse(c)); }catch(e){}
render();
(async()=>{
  const db = window.claude && window.claude.use ? await window.claude.use('db').catch(()=>null) : null;
  if (!db){ setSave('idle','Enregistré sur cet appareil'); return; }
  docRef = db.doc('life/state');
  setSave('idle','Synchronisation…');
  docRef.onSnapshot(snap=>{
    if (snap.metadata.hasPendingWrites) return;
    if (snap.exists){
      const d=snap.data(), j=stable(d);
      if (j!==lastJSON && !busy()){ lastJSON=j; S=hydrate(clone(d)); lsSet('ssv.cache',JSON.stringify(S)); render(); }
    }
    setSave('saved','Synchronisé');
  }, ()=>setSave('error','Synchronisation interrompue. Recharge la page.'));
})();
