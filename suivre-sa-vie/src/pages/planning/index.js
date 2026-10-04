/* Module Planning : objectifs → actions datées → revue hebdomadaire. */
import { h } from '../../core/dom.js';
import { lsSet } from '../../core/storage.js';
import { pageHeader, statusBadge, segmented } from '../../ui/components.js';
import { planning } from './common.js';
import today from './today.js';
import week from './week.js';
import goals from './goals.js';
import review from './review.js';

const TABS = [['today', 'Aujourd’hui', today], ['week', 'Semaine', week], ['goals', 'Objectifs', goals], ['review', 'Revue', review]];

export default function planningPage(ctx) {
  const P = planning(ctx), tab = TABS.find(t => t[0] === ctx.ui.planTab) || TABS[0];
  return h('div', { class: 'view', 'data-c': 'me' },
    pageHeader({ eyebrow: 'Pilotage', title: 'Planning', lead: 'De tes objectifs à long terme aux actions du jour, puis une revue chaque semaine.',
      badges: [statusBadge('live'), statusBadge('auth', 'Google Calendar : nécessite une autorisation')] }),
    h('div', { class: 'mb-10 border-b border-line pb-5' }, segmented(TABS.map(([k, l]) => [k, l]), tab[0], k => { ctx.ui.planTab = k; lsSet('ssv.planTab', k); ctx.render(); }, 'Vues du planning')),
    tab[2](ctx, P));
}
