/* Assemble l'état, la navigation et les pages. Les pages reçoivent un contexte (ctx) et renvoient un élément. */
import { $, isTyping } from '../core/dom.js';
import { lsGet, lsSet } from '../core/storage.js';
import { getState, getStatus, commit, onStatus, onExternalChange, connectRemote } from '../services/store.js';
import { moduleById } from '../config/modules.js';
import { PAGES } from '../pages/index.js';
import { navContent, syncLine } from '../ui/shell.js';
import { initialRoute, writeRoute } from './router.js';

const ui = { route: initialRoute(), editProj: null, projFilter: 'all', confirm: null, laterOpen: lsGet('ssv.later') === '1', drawer: false };
let deferred = false;

const ctx = {
  get state() { return getState(); },
  get status() { return getStatus(); },
  ui,
  commit,
  render,
  go,
  /* Modifie l'état, enregistre et redessine. */
  update(fn) { fn(getState()); commit(); render(); },
};

function go(id) {
  ui.route = id; ui.editProj = null; ui.confirm = null;
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

export function render() {
  const main = $('#main');
  if (isTyping(main)) { deferred = true; return; }
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
  onExternalChange(render);
  connectRemote();
}
