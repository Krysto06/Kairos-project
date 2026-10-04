import { h } from '../../core/dom.js';
import { percent } from '../../core/format.js';
import { todayKey } from '../../core/dates.js';
import { KINDS } from '../../data/defaults.js';
import { monthSummary, monthLabel } from '../../domain/finance.js';
import { CARD, BTN_SM, GHOST, H3, EYEBROW } from '../../ui/classes.js';
import { metric, notice, emptyState, statusBadge } from '../../ui/components.js';
import { monthNav } from './common.js';

export default function month(ctx, F, go) {
  const m = ctx.ui.finMonth, txs = F.month(m), budget = F.budgetOf(m), c = monthSummary(txs, budget), fmt = F.fmt;
  const closed = F.closed(m), isPast = m < todayKey().slice(0, 7);
  const planned = l => +l.amount || 0;

  const lineRow = l => {
    const real = c.byLine[l.id] || 0, plan = planned(l), over = plan ? real > plan : real > 0, p = plan ? Math.min(1, real / plan) : (real ? 1 : 0);
    const kc = { besoin: 'edu', envie: 'sty', epargne: 'fin' }[l.kind];
    return h('li', { class: 'grid gap-1.5 py-3', 'data-c': kc },
      h('div', { class: 'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5' },
        h('span', { class: 'font-medium' }, l.label, h('span', { class: 'ml-2 text-[12px] text-muted' }, KINDS[l.kind])),
        h('span', { class: 'font-mono text-[13px] tnum ' + (over && l.kind !== 'epargne' ? 'text-warn' : 'text-muted') }, `${fmt(real)} / ${fmt(plan)}`)),
      h('div', { class: 'h-1.5 rounded-full bg-soft overflow-hidden' }, h('div', { class: 'h-full rounded-full transition-all ' + (over && l.kind !== 'epargne' ? 'bg-warn' : 'bg-ci'), style: `width:${p * 100}%` })));
  };

  const dev = c.base ? { besoin: c.byKind.besoin / c.base, envie: c.byKind.envie / c.base, epargne: c.byKind.epargne / c.base } : null;

  return h('div', { class: 'grid gap-10', 'data-c': 'fin' },
    h('div', { class: 'flex flex-wrap items-center justify-between gap-4' }, monthNav(ctx),
      h('div', { class: 'flex flex-wrap items-center gap-2' },
        closed ? statusBadge('connected', 'Mois clôturé') : null,
        closed ? h('button', { type: 'button', class: GHOST, onclick: () => F.reopenMonth(m) }, 'Rouvrir')
          : isPast || txs.length ? h('button', { type: 'button', class: GHOST, onclick: () => F.closeMonth(m), title: 'Archive le budget prévu de ce mois tel qu’il est aujourd’hui' }, 'Clôturer le mois') : null,
        h('button', { type: 'button', class: BTN_SM, onclick: () => go('transactions') }, '+ Transaction'))),
    h('div', { class: 'grid gap-x-8 gap-y-6 grid-cols-2 lg:grid-cols-4' },
      metric({ label: 'Revenus', value: fmt(c.base), sub: c.incomeIsPlanned ? 'salaire prévu (aucun revenu saisi)' : c.income ? 'revenus enregistrés' : 'aucun revenu', color: 'fin' }),
      metric({ label: 'Dépenses réelles', value: fmt(c.spent), sub: `${c.count} opération${c.count > 1 ? 's' : ''}`, color: 'fin' }),
      metric({ label: 'Reste', value: fmt(c.rest), sub: c.rest < 0 ? 'dépassement' : 'non dépensé', color: 'fin' }),
      metric({ label: 'Taux d’épargne réel', value: c.base ? percent(c.saveRate) : '–', p: c.base ? c.saveRate / 0.2 : null, sub: 'objectif : 20 %', color: 'fin' })),
    c.uncategorized ? notice(`${fmt(c.uncategorized)} de dépenses sans poste. Classe-les dans l’onglet Transactions pour une comparaison juste.`, 'gold') : null,
    txs.length ? h('div', { class: 'grid gap-6 lg:grid-cols-[1.4fr_1fr]' },
      h('div', { class: CARD },
        h('div', { class: 'flex flex-wrap items-baseline justify-between gap-2 mb-2' }, h('h2', { class: H3 }, 'Prévu et réel par poste'), h('span', { class: 'text-[12.5px] text-muted' }, closed ? 'budget archivé du mois' : 'budget modèle actuel')),
        h('ul', { class: 'divide-y divide-line' }, budget.lines.map(lineRow))),
      h('div', { class: CARD + ' grid gap-4 content-start' },
        h('h2', { class: H3 }, 'Règle 50/30/20'),
        dev ? h('dl', { class: 'grid gap-3 text-sm' }, [['besoin', 0.5], ['envie', 0.3], ['epargne', 0.2]].map(([k, ref]) => h('div', { class: 'grid gap-1' },
          h('div', { class: 'flex justify-between gap-3' }, h('dt', {}, KINDS[k]), h('dd', { class: 'font-mono tnum' }, `${percent(dev[k])} · repère ${percent(ref)}`)),
          h('div', { class: 'h-1.5 rounded-full bg-soft overflow-hidden', 'data-c': { besoin: 'edu', envie: 'sty', epargne: 'fin' }[k] }, h('div', { class: 'h-full rounded-full bg-ci', style: `width:${Math.min(1, dev[k]) * 100}%` })))))
          : h('p', { class: 'text-sm text-muted' }, 'Ajoute un revenu ou un salaire prévu pour comparer.'),
        h('p', { class: 'border-t border-line pt-3 text-[12.5px] text-muted' }, 'Calculé sur tes transactions classées. Les virements vers l’épargne se classent dans un poste « Épargne & avenir ».')))
      : emptyState(`Aucune transaction en ${monthLabel(m)}. Ajoute-les une par une ou importe un relevé CSV exporté depuis ta banque.`, h('button', { type: 'button', class: GHOST, onclick: () => go('transactions') }, 'Ajouter des transactions')));
}
