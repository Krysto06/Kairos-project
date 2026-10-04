/* Module Anglais : niveau CECRL, tests (EF SET, DET, TOEFL), séances, plan, parcours. */
import { h } from '../../core/dom.js';
import { lsSet } from '../../core/storage.js';
import { trackById } from '../../data/content/tracks.js';
import { pageHeader, statusBadge, segmented } from '../../ui/components.js';
import { trackPath } from '../../ui/trackPath.js';
import { english } from './common.js';
import overview from './overview.js';
import tests from './tests.js';
import sessions from './sessions.js';
import plan from './plan.js';

const TABS = [['overview', 'Vue d’ensemble'], ['tests', 'Tests'], ['sessions', 'Séances'], ['plan', 'Plan'], ['path', 'Parcours']];

export default function englishPage(ctx) {
  const E = english(ctx), tab = TABS.some(t => t[0] === ctx.ui.enTab) ? ctx.ui.enTab : 'overview';
  const go = k => { ctx.ui.enTab = k; lsSet('ssv.enTab', k); ctx.ui.enConfirm = null; ctx.render(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const views = { overview: () => overview(ctx, E, go), tests: () => tests(ctx, E), sessions: () => sessions(ctx, E), plan: () => plan(ctx, E), path: () => trackPath(ctx, trackById('en')) };
  return h('div', { class: 'view', 'data-c': 'edu' },
    pageHeader({ eyebrow: 'Apprentissage', title: 'Anglais', lead: 'De ton niveau actuel jusqu’au C2 : tests, séances régulières et un plan qui équilibre les compétences.',
      badges: [statusBadge('live'), statusBadge('connect', 'Scores officiels : saisie manuelle')] }),
    h('div', { class: 'mb-10 border-b border-line pb-5' }, segmented(TABS, tab, go, 'Vues du module Anglais')),
    views[tab]());
}
