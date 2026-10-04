import { h } from '../../core/dom.js';
import { todayKey } from '../../core/dates.js';
import { percent } from '../../core/format.js';
import { history, monthLabel, monthSummary, txOfMonth } from '../../domain/finance.js';
import { CARD, H3 } from '../../ui/classes.js';
import { emptyState, segmented, statusBadge } from '../../ui/components.js';
import { lineChart } from '../../ui/lineChart.js';

/* Pas de graduation lisible : 1, 2 ou 5 × une puissance de 10. */
function niceStep(max) { const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw || 1))); return [1, 2, 5, 10].map(k => k * p).find(s => s >= raw) || p * 10; }

export default function historyView(ctx, F) {
  const n = ctx.ui.finSpan || 6, all = history(F.all(), todayKey().slice(0, 7), n);
  // Même définition de l'épargne que l'onglet Mois ; les mois vides du début ne sont pas tracés.
  const first = all.findIndex(r => r.count), rows = (first < 0 ? all : all.slice(Math.min(first, n - 2)))
    .map(r => ({ ...r, save: r.count ? monthSummary(txOfMonth(F.all(), r.month), F.budgetOf(r.month)) : null }));
  const any = rows.some(r => r.count);
  const max = Math.max(...rows.map(r => Math.max(r.income, r.spent)), 1), step = niceStep(max), top = Math.ceil(max / step) * step;
  const short = m => new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(+m.slice(0, 4), +m.slice(5, 7) - 1, 1));
  const compact = v => v >= 1000 ? (Math.round(v / 100) / 10).toString().replace('.', ',') + ' k' : String(Math.round(v));
  const closed = rows.filter(r => F.closed(r.month)).length;

  return h('div', { class: 'grid gap-8' },
    h('div', { class: 'flex flex-wrap items-center justify-between gap-3' },
      segmented([[6, '6 mois'], [12, '12 mois']], n, k => { ctx.ui.finSpan = k; ctx.render(); }, 'Période'),
      h('span', { class: 'text-[13px] text-muted' }, `${closed} mois clôturé${closed > 1 ? 's' : ''} sur la période`)),
    any ? h('div', { class: CARD + ' grid gap-3' }, h('h2', { class: H3 }, 'Revenus et dépenses'),
      lineChart({ label: 'Revenus et dépenses par mois', yMin: 0, yMax: top, yStep: step, xFormat: x => short(x.slice(0, 7)), yFormat: compact,
        series: [{ label: 'Revenus', color: 'sv', points: rows.map(r => ({ x: r.month + '-01', y: Math.round(r.income) })) }, { label: 'Dépenses', color: 'sq', points: rows.map(r => ({ x: r.month + '-01', y: Math.round(r.spent) })) }] }))
      : emptyState('Pas encore d’historique. Il se construit à partir de tes transactions, mois après mois.'),
    any ? h('div', { class: 'overflow-x-auto' }, h('table', { class: 'w-full min-w-[520px] text-sm' },
      h('thead', {}, h('tr', { class: 'border-b border-line text-[11px] uppercase tracking-[.14em] text-muted' }, ['Mois', 'Revenus', 'Dépenses', 'Solde', 'Épargne', ''].map((t, i) => h('th', { class: 'py-2.5 pr-4 font-semibold ' + (i && i < 5 ? 'text-right' : 'text-left') }, t)))),
      h('tbody', { class: 'divide-y divide-line' }, rows.slice().reverse().map(r => h('tr', {},
        h('td', { class: 'py-3 pr-4 first-letter:uppercase' }, monthLabel(r.month)),
        h('td', { class: 'py-3 pr-4 text-right font-mono tnum' }, F.fmt(r.income)), h('td', { class: 'py-3 pr-4 text-right font-mono tnum' }, F.fmt(r.spent)),
        h('td', { class: 'py-3 pr-4 text-right font-mono tnum ' + (r.net < 0 ? 'text-warn' : '') }, F.fmt(r.net)),
        h('td', { class: 'py-3 pr-4 text-right font-mono tnum' }, r.save && r.save.base ? percent(r.save.saveRate) : '–'),
        h('td', { class: 'py-3' }, F.closed(r.month) ? statusBadge('connected', 'Clôturé') : null)))))) : null,
    h('p', { class: 'text-[12.5px] text-muted' }, 'Solde = revenus − toutes les opérations sortantes, virements vers l’épargne inclus. Épargne = part des revenus non consommée (ni besoins, ni envies, ni dépenses sans poste), comme dans l’onglet Mois.'));
}
