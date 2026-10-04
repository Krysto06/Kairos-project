/* Assemble l'état, la navigation et les pages. Les pages reçoivent un contexte (ctx) et renvoient un élément. */
import { $, isTyping } from '../core/dom.js';
import { lsGet, lsSet } from '../core/storage.js';
import { getState, getStatus, commit, onStatus, onExternalChange, connectRemote } from '../services/store.js';
import { collection, connectCollections, onCollectionsChange } from '../services/collections.js';
import { COLLECTIONS } from '../config/collections.js';
import { todayKey } from '../core/dates.js';
import { moduleById } from '../config/modules.js';
import { PAGES } from '../pages/index.js';
import { navContent, syncLine } from '../ui/shell.js';
import { initialRoute, writeRoute } from './router.js';

const ui = { route: initialRoute(), finTab: lsGet('ssv.finTab') || 'month', finMonth: todayKey().slice(0, 7), finDraft: null, finFilter: 'all', finImport: null, finSpan: 6, projOpen: lsGet('ssv.projOpen') || null, projTab: 'overview', projEdit: false, editProj: null, projFilter: 'all', confirm: null, laterOpen: lsGet('ssv.later') === '1', drawer: false,
  planTab: lsGet('ssv.planTab') || 'today', greTab: lsGet('ssv.greTab') || 'overview', enTab: lsGet('ssv.enTab') || 'overview', enDraft: null, enTestDraft: null, enConfirm: null, greDraft: null, greConfirm: null, planWeek: todayKey(), goalDraft: null, goalConfirm: null, goalAdd: null };
let deferred = false;

const ctx = {
  get state() { return getState(); },
  get status() { return getStatus(); },
  ui,
  commit,
  render,
  go,
  col: collection,
  /* Modifie l'état, enregistre et redessine. force : redessine même si un champ a le focus (après un envoi de formulaire). */
  update(fn, { force = false } = {}) { fn(getState()); commit(); render(force); },
};

/* keep : garde le projet ouvert (lien direct vers une fiche projet). */
function go(id, { keep = false } = {}) {
  if (!keep) { ui.projOpen = null; ui.projEdit = false; lsSet('ssv.projOpen', ''); }
  ui.route = id; ui.editProj = null; ui.confirm = null; ui.goalConfirm = null; ui.greConfirm = null; ui.enConfirm = null;
  writeRoute(id);
  setDrawer(false);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setDrawer(open) {
  ui.drawer = open;
  $('#drawer').hidden = !open;
  $('#menu-btn').setAttribute('aria-expanded', String(open));
}

function renderNav() {
  const opts = { route: ui.route, status: getStatus(), go, laterOpen: ui.laterOpen || moduleById(ui.route)?.status === 'placeholder',
    toggleLater: () => { ui.laterOpen = !ui.laterOpen; lsSet('ssv.later', ui.laterOpen ? '1' : '0'); renderNav(); } };
  $('#sidebar').replaceChildren(...navContent(opts));
  $('#drawer-panel').replaceChildren(...navContent(opts));
  $('#topbar-label').textContent = moduleById(ui.route)?.label || '';
}

export function render(force = false) {
  const main = $('#main');
  if (!force && isTyping(main)) { deferred = true; return; }
  deferred = false;
  renderNav();
  const page = PAGES[ui.route] || PAGES.dashboard;
  main.replaceChildren(page(ctx));
}

export function start() {
  $('#menu-btn').addEventListener('click', () => setDrawer(!ui.drawer));
  $('#drawer-scrim').addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui.drawer) setDrawer(false); });
  document.addEventListener('focusout', () => setTimeout(() => { if (deferred && !isTyping($('#main'))) { deferred = false; render(); } }, 0));
  window.addEventListener('hashchange', () => { const r = initialRoute(); if (r !== ui.route) go(r); });

  writeRoute(ui.route);
  render();
  // L'indicateur d'enregistrement se met à jour sans redessiner la page.
  onStatus(s => {
    for (const el of document.querySelectorAll('#sidebar [role=status], #drawer-panel [role=status]')) el.replaceWith(syncLine(s));
    if (ui.route === 'system' && !isTyping($('#main')) && s.save !== 'saving') render();
  });
  onExternalChange(() => render());
  onCollectionsChange(() => render());
  connectRemote();
  connectCollections(COLLECTIONS);
}
