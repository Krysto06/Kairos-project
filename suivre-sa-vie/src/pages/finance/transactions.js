import { h, focusLater } from '../../core/dom.js';
import { todayKey, shortDate } from '../../core/dates.js';
import { KINDS } from '../../data/defaults.js';
import { CARD, BTN, IN, H3 } from '../../ui/classes.js';
import { field, emptyState, segmented } from '../../ui/components.js';
import { monthNav } from './common.js';
import { importCard } from './importCsv.js';

export default function transactions(ctx, F) {
  const ui = ctx.ui, m = ui.finMonth, lines = ctx.state.budget.lines, today = todayKey();
  const d = ui.finDraft || (ui.finDraft = { type: 'out' });
  let all = F.month(m);
  const filter = ui.finFilter || 'all';
  const shown = filter === 'all' ? all : filter === 'none' ? all.filter(t => t.type === 'out' && !t.category) : filter === 'in' ? all.filter(t => t.type === 'in') : all.filter(t => t.category === filter);
  let dIn, lIn, aIn, cIn, err;

  const catSelect = (id, value, onchange) => h('select', { class: IN + ' cursor-pointer', id, onchange },
    h('option', { value: '' }, 'Sans poste'), Object.entries(KINDS).map(([k, label]) => h('optgroup', { label }, lines.filter(l => l.kind === k).map(l => h('option', { value: l.id, selected: value === l.id }, l.label)))));

  const form = h('form', { class: CARD + ' grid gap-4', onsubmit: e => {
      e.preventDefault();
      const amount = Math.abs(parseFloat(String(aIn.value).replace(',', '.')));
      if (!lIn.value.trim() || !amount) { err.textContent = 'Indique un libellé et un montant supérieur à 0.'; err.hidden = false; return; }
      F.add({ date: dIn.value || today, label: lIn.value.trim(), amount: Math.round(amount * 100) / 100, type: d.type, category: d.type === 'out' ? (cIn.value || null) : null });
      focusLater('tx-label', false);
    } },
    h('div', { class: 'flex flex-wrap items-center justify-between gap-3' }, h('h2', { class: H3 }, 'Ajouter une opération'),
      segmented([['out', 'Dépense'], ['in', 'Revenu']], d.type, k => { d.type = k; ctx.render(true); }, 'Type d’opération')),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-[150px_minmax(0,1.4fr)_130px_minmax(0,1fr)_auto] items-end' },
      field('tx-date', 'Date', dIn = h('input', { class: IN, id: 'tx-date', type: 'date', value: m === today.slice(0, 7) ? today : m + '-01', max: today })),
      h('div', { class: 'col-span-2 lg:col-span-1' }, field('tx-label', 'Libellé', lIn = h('input', { class: IN, id: 'tx-label', autocomplete: 'off', placeholder: d.type === 'out' ? 'Ex. : courses Carrefour' : 'Ex. : salaire d’octobre' }))),
      field('tx-amount', 'Montant', aIn = h('input', { class: IN + ' font-mono text-right', id: 'tx-amount', type: 'text', inputmode: 'decimal', placeholder: '0,00', autocomplete: 'off' })),
      d.type === 'out' ? field('tx-cat', 'Poste', cIn = catSelect('tx-cat', null)) : h('span', {}),
      h('button', { type: 'submit', class: BTN + ' col-span-2 lg:col-span-1' }, 'Ajouter')),
    err = h('p', { class: 'text-sm text-warn', role: 'alert', hidden: true }));

  const counts = { all: all.length, none: all.filter(t => t.type === 'out' && !t.category).length, in: all.filter(t => t.type === 'in').length };
  return h('div', { class: 'grid gap-10', 'data-c': 'fin' },
    monthNav(ctx),
    form,
    importCard(ctx, F),
    h('div', { class: 'grid gap-4' },
      h('div', { class: 'flex flex-wrap items-end justify-between gap-3' }, h('h2', { class: H3 }, 'Opérations du mois'),
        segmented([['all', 'Toutes · ' + counts.all], ['none', 'Sans poste · ' + counts.none], ['in', 'Revenus · ' + counts.in]], ['all', 'none', 'in'].includes(filter) ? filter : 'all', k => { ui.finFilter = k; ctx.render(); }, 'Filtrer les opérations')),
      shown.length ? h('ul', { class: 'divide-y divide-line border-y border-line' }, shown.map(t => {
        const confirming = ui.confirm === 'tx-' + t.id;
        return h('li', { class: 'grid gap-2 py-3 sm:grid-cols-[64px_minmax(0,1fr)_200px_110px_auto] sm:items-center sm:gap-4' },
          h('span', { class: 'font-mono text-xs text-muted' }, shortDate(t.date)),
          h('span', { class: 'min-w-0 break-words font-medium' }, t.label, t.source === 'csv' ? h('span', { class: 'ml-2 text-[11px] font-normal text-muted' }, 'importé') : null),
          t.type === 'out' ? catSelect('tc-' + t.id, t.category, e => F.patch(t.id, { category: e.target.value || null })) : h('span', { class: 'text-sm text-muted' }, 'Revenu'),
          h('span', { class: 'font-mono tnum sm:text-right ' + (t.type === 'in' ? 'text-ok' : '') }, (t.type === 'in' ? '+' : '−') + F.fmt(t.amount)),
          h('button', { type: 'button', class: 'justify-self-start sm:justify-self-end text-[12.5px] font-medium cursor-pointer ' + (confirming ? 'text-warn' : 'text-muted hover:text-warn'),
            onclick: () => { if (confirming) { ui.confirm = null; F.remove(t.id); } else { ui.confirm = 'tx-' + t.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer'));
      })) : emptyState(all.length ? 'Aucune opération dans ce filtre.' : 'Aucune opération ce mois-ci.')));
}
