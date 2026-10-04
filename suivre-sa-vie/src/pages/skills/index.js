/* Module Compétences : formations modifiables, référentiel de compétences, séances, prochains modules. */
import { h } from '../../core/dom.js';
import { lsSet } from '../../core/storage.js';
import { pageHeader, statusBadge, segmented } from '../../ui/components.js';
import { skills } from './common.js';
import overview from './overview.js';
import courses from './courses.js';
import map from './map.js';
import sessions from './sessions.js';

const TABS = [['overview', 'Vue d’ensemble'], ['courses', 'Formations'], ['map', 'Référentiel'], ['sessions', 'Séances']];

export default function skillsPage(ctx) {
  const K = skills(ctx), tab = TABS.some(t => t[0] === ctx.ui.skTab) ? ctx.ui.skTab : 'overview';
  const go = k => { ctx.ui.skTab = k; lsSet('ssv.skTab', k); ctx.ui.confirm = null; ctx.render(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const views = { overview: () => overview(ctx, K, go), courses: () => courses(ctx, K), map: () => map(ctx, K), sessions: () => sessions(ctx, K) };
  return h('div', { class: 'view', 'data-c': 'sk' },
    pageHeader({ eyebrow: 'Apprentissage', title: 'Compétences', lead: 'Tes formations et certifications, ce que tu sais faire aujourd’hui, et ce que tu veux maîtriser.',
      badges: [statusBadge('live'), statusBadge('auth', 'LinkedIn : non connecté')] }),
    h('div', { class: 'mb-10 border-b border-line pb-5' }, segmented(TABS, tab, go, 'Vues du module Compétences')),
    views[tab]());
}
