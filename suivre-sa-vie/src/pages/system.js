/* Profil, état réel des connexions, inventaire des données et feuille de route des modules. */
import { h } from '../core/dom.js';
import { INTEGRATIONS } from '../config/integrations.js';
import { DATA_CATALOG } from '../config/dataCatalog.js';
import { MODULES } from '../config/modules.js';
import { CARD, IN } from '../ui/classes.js';
import { pageHeader, section, statusBadge, field } from '../ui/components.js';

const PROFILE_FIELDS = [['name', 'Nom'], ['headline', 'En une phrase'], ['education', 'Éducation'], ['children', 'Nombre d’enfants'], ['status', 'Statut'], ['city', 'Ville / pays'], ['languages', 'Langues'], ['motto', 'Ma devise']];
const REMOTE_STATUS = { pending: 'pending', connected: 'connected', unavailable: 'local', error: 'error' };
const WHERE = { state: ['connected', 'Enregistré'], collection: ['connected', 'Enregistré'], code: ['demo', 'Contenu fixe'], todo: ['placeholder', 'À créer'] };

const table = (head, rows) => h('div', { class: 'overflow-x-auto' },
  h('table', { class: 'w-full min-w-[560px] text-left text-sm' },
    h('thead', {}, h('tr', { class: 'border-b border-line text-[11px] uppercase tracking-[.14em] text-muted' }, head.map(t => h('th', { class: 'py-2.5 pr-4 font-semibold' }, t)))),
    h('tbody', { class: 'divide-y divide-line' }, rows)));

export default function system(ctx) {
  const p = ctx.state.profile, remote = ctx.status.remote;

  const profile = h('div', { class: CARD + ' grid gap-4 sm:grid-cols-2' }, PROFILE_FIELDS.map(([k, l]) =>
    field('pf-' + k, l, h('input', { class: IN, id: 'pf-' + k, value: p[k] || '', placeholder: l, oninput: e => { p[k] = e.target.value; ctx.commit(); } }))));

  const integrations = h('ul', { class: 'divide-y divide-line border-y border-line' }, INTEGRATIONS.map(i => {
    const st = i.status === 'runtime' ? REMOTE_STATUS[remote] : i.status;
    return h('li', { class: 'grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6' },
      h('div', { class: 'min-w-0' }, h('div', { class: 'font-medium' }, i.name), h('p', { class: 'text-[13px] text-muted' }, i.detail)),
      h('div', {}, statusBadge(st)));
  }));

  const data = table(['Donnée', 'Module', 'État', 'Emplacement'], DATA_CATALOG.map(d => {
    const [st, label] = WHERE[d.where];
    return h('tr', {}, h('td', { class: 'py-3 pr-4 font-medium' }, d.name), h('td', { class: 'py-3 pr-4 text-muted' }, d.module),
      h('td', { class: 'py-3 pr-4' }, statusBadge(st, label)),
      h('td', { class: 'py-3 pr-4 font-mono text-xs text-muted' }, d.where === 'state' ? 'life/state › ' + d.field : d.where === 'collection' ? 'life/state/' + d.field : d.where === 'todo' ? 'collection « ' + d.future + ' »' : 'code de l’app'));
  }));

  const roadmap = table(['Module', 'Rôle', 'État'], MODULES.map(m => h('tr', {},
    h('td', { class: 'py-3 pr-4' }, h('button', { type: 'button', class: 'font-medium underline decoration-line underline-offset-4 hover:decoration-current cursor-pointer', onclick: () => ctx.go(m.id) }, m.label)),
    h('td', { class: 'py-3 pr-4 text-muted' }, m.summary), h('td', { class: 'py-3 pr-4' }, statusBadge(m.status)))));

  return h('div', { class: 'view grid gap-16' },
    h('div', {}, pageHeader({ eyebrow: 'Réglages', title: 'Profil & système', lead: 'Ton profil, l’état réel des connexions et l’inventaire de ce qui est enregistré.' }), profile),
    section('Connexions', 'Ce que l’app peut réellement utiliser aujourd’hui. Rien n’est affiché comme connecté sans l’être.', integrations),
    section('Données', 'Ce qui est déjà enregistré, ce qui est écrit dans l’app, et ce qu’il faudra créer pour les prochains modules.', data),
    section('Modules', 'La feuille de route du système.', roadmap));
}
