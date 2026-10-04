/* Module GRE : objectif de score, tests, séances mesurées, plan de la semaine, parcours. */
import { h } from '../../core/dom.js';
import { lsSet } from '../../core/storage.js';
import { trackById } from '../../data/content/tracks.js';
import { pageHeader, statusBadge, segmented } from '../../ui/components.js';
import { trackPath } from '../../ui/trackPath.js';
import { gre } from './common.js';
import overview from './overview.js';
import scores from './scores.js';
import sessions from './sessions.js';
import plan from './plan.js';

const TABS = [['overview', 'Vue d’ensemble'], ['scores', 'Scores'], ['sessions', 'Séances'], ['plan', 'Plan'], ['path', 'Parcours']];

export default function grePage(ctx) {
  const G = gre(ctx), tab = TABS.some(t => t[0] === ctx.ui.greTab) ? ctx.ui.greTab : 'overview';
  const go = k => { ctx.ui.greTab = k; lsSet('ssv.greTab', k); ctx.ui.greConfirm = null; ctx.render(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const views = { overview: () => overview(ctx, G, go), scores: () => scores(ctx, G), sessions: () => sessions(ctx, G), plan: () => plan(ctx, G),
    path: () => trackPath(ctx, trackById('gre')) };
  return h('div', { class: 'view', 'data-c': 'edu' },
    pageHeader({ eyebrow: 'Apprentissage', title: 'GRE & master', lead: 'Ton score cible, tes tests, tes séances mesurées et un plan pour chaque semaine jusqu’au jour J.',
      badges: [statusBadge('live'), statusBadge('connect', 'Scores ETS : saisie manuelle')] }),
    h('div', { class: 'mb-10 border-b border-line pb-5' }, segmented(TABS, tab, go, 'Vues du module GRE')),
    views[tab]());
}
