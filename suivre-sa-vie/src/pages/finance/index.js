/* Module Finance : mois (prévu contre réel), transactions et import CSV, budget modèle, épargne, historique. */
import { h } from '../../core/dom.js';
import { lsSet } from '../../core/storage.js';
import { pageHeader, statusBadge, segmented } from '../../ui/components.js';
import { finance } from './common.js';
import month from './month.js';
import transactions from './transactions.js';
import budget from './budget.js';
import savings from './savings.js';
import historyView from './history.js';

const TABS = [['month', 'Mois'], ['transactions', 'Transactions'], ['budget', 'Budget'], ['savings', 'Épargne'], ['history', 'Historique']];

export default function financePage(ctx) {
  const F = finance(ctx), tab = TABS.some(t => t[0] === ctx.ui.finTab) ? ctx.ui.finTab : 'month';
  const go = k => { ctx.ui.finTab = k; lsSet('ssv.finTab', k); ctx.ui.confirm = null; ctx.render(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const views = { month: () => month(ctx, F, go), transactions: () => transactions(ctx, F), budget: () => budget(ctx), savings: () => savings(ctx, F), history: () => historyView(ctx, F) };
  return h('div', { class: 'view', 'data-c': 'fin' },
    pageHeader({ eyebrow: 'Vie & projets', title: 'Finance', lead: 'Ce que tu prévois, ce que tu dépenses vraiment, et ce que tu mets de côté, mois après mois.',
      badges: [statusBadge('live'), statusBadge('connect', 'Banque : à connecter · import CSV manuel')] }),
    h('div', { class: 'mb-10 border-b border-line pb-5' }, segmented(TABS, tab, go, 'Vues du module Finance')),
    views[tab]());
}
