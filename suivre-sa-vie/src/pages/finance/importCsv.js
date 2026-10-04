/* Import d'un relevé CSV exporté à la main depuis la banque : lecture locale, colonnes à confirmer, doublons ignorés. */
import { h } from '../../core/dom.js';
import { parseCSV, parseAmount, parseDate, guessColumns } from '../../core/csv.js';
import { shortDate } from '../../core/dates.js';
import { dupKey, categoryMemory } from '../../domain/finance.js';
import { CARD, BTN, GHOST, IN, H3, LABEL } from '../../ui/classes.js';
import { field, notice } from '../../ui/components.js';

function rowsToTx(imp) {
  const c = imp.cols, out = [];
  for (const r of imp.rows) {
    const date = parseDate(r[c.date]), label = (r[c.label] || '').replace(/\s+/g, ' ').trim();
    let amt = null;
    if (imp.mode === 'single') { amt = parseAmount(r[c.amount]); if (amt != null && imp.invert) amt = -amt; }
    else { const d = parseAmount(r[c.debit]), cr = parseAmount(r[c.credit]); amt = cr ? Math.abs(cr) : d ? -Math.abs(d) : null; }
    if (!date || amt == null || amt === 0) continue;
    out.push({ date, label: label || 'Sans libellé', amount: Math.abs(amt), type: amt < 0 ? 'out' : 'in', source: 'csv' });
  }
  return out;
}

export function importCard(ctx, F) {
  const ui = ctx.ui, imp = ui.finImport;
  if (!imp) {
    return h('div', { class: CARD + ' grid gap-3' },
      h('h2', { class: H3 }, 'Importer un relevé'),
      h('p', { class: 'text-sm text-muted' }, 'Exporte tes opérations en CSV depuis l’espace en ligne de ta banque, puis choisis le fichier. Il est lu dans ton navigateur ; aucune connexion à ta banque n’est faite.'),
      h('div', {}, h('input', { type: 'file', id: 'csv-file', accept: '.csv,text/csv,.txt', class: 'text-sm file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-ink cursor-pointer',
        onchange: e => {
          const file = e.target.files[0]; if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const parsed = parseCSV(String(reader.result)), g = guessColumns(parsed.header);
            ui.finImport = { name: file.name, header: parsed.header, rows: parsed.rows, mode: g.amount >= 0 || g.debit < 0 ? 'single' : 'split', invert: false,
              cols: { date: Math.max(0, g.date), label: Math.max(0, g.label), amount: Math.max(0, g.amount), debit: Math.max(0, g.debit), credit: Math.max(0, g.credit) } };
            ctx.render(true);
          };
          reader.onerror = () => { ui.finImport = null; ctx.render(); };
          reader.readAsText(file);
        } })));
  }

  const colSel = (k, label) => field('csv-' + k, label, h('select', { class: IN + ' cursor-pointer', id: 'csv-' + k, onchange: e => { imp.cols[k] = +e.target.value; ctx.render(true); } },
    imp.header.map((hd, i) => h('option', { value: i, selected: imp.cols[k] === i }, hd || `Colonne ${i + 1}`))));
  const parsed = rowsToTx(imp), existing = new Set(F.all().map(dupKey)), fresh = parsed.filter(t => !existing.has(dupKey(t)));
  const memo = categoryMemory(F.all());

  return h('div', { class: CARD + ' grid gap-5' },
    h('div', { class: 'flex flex-wrap items-baseline justify-between gap-2' }, h('h2', { class: H3 }, 'Importer « ' + imp.name + ' »'), h('span', { class: 'text-[13px] text-muted' }, `${imp.rows.length} lignes lues`)),
    h('div', { class: 'grid gap-2' }, h('span', { class: LABEL }, 'Montants'),
      h('div', { class: 'flex flex-wrap gap-4 text-sm' },
        h('label', { class: 'flex items-center gap-2 cursor-pointer' }, h('input', { type: 'radio', name: 'csv-mode', checked: imp.mode === 'single', onchange: () => { imp.mode = 'single'; ctx.render(true); } }), 'Une colonne (négatif = dépense)'),
        h('label', { class: 'flex items-center gap-2 cursor-pointer' }, h('input', { type: 'radio', name: 'csv-mode', checked: imp.mode === 'split', onchange: () => { imp.mode = 'split'; ctx.render(true); } }), 'Deux colonnes Débit / Crédit'))),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' }, colSel('date', 'Date'), colSel('label', 'Libellé'),
      imp.mode === 'single' ? [colSel('amount', 'Montant'), h('label', { class: 'flex items-end gap-2 pb-2.5 text-sm cursor-pointer' }, h('input', { type: 'checkbox', class: 'chk', id: 'csv-inv', checked: imp.invert, onchange: () => { imp.invert = !imp.invert; ctx.render(true); } }), 'Dépenses en positif')]
        : [colSel('debit', 'Débit'), colSel('credit', 'Crédit')]),
    parsed.length ? h('div', { class: 'overflow-x-auto' }, h('table', { class: 'w-full min-w-[480px] text-sm' },
      h('thead', {}, h('tr', { class: 'border-b border-line text-[11px] uppercase tracking-[.14em] text-muted' }, ['Date', 'Libellé', 'Montant', 'Poste'].map((t, i) => h('th', { class: 'py-2 pr-4 font-semibold ' + (i === 2 ? 'text-right' : 'text-left') }, t)))),
      h('tbody', { class: 'divide-y divide-line' }, parsed.slice(0, 8).map(t => h('tr', { class: existing.has(dupKey(t)) ? 'text-muted line-through' : '' },
        h('td', { class: 'py-2 pr-4 whitespace-nowrap' }, shortDate(t.date)), h('td', { class: 'py-2 pr-4 break-words' }, t.label),
        h('td', { class: 'py-2 pr-4 text-right font-mono tnum ' + (t.type === 'in' ? 'text-ok' : '') }, (t.type === 'in' ? '+' : '−') + F.fmt(t.amount)),
        h('td', { class: 'py-2 pr-4 text-muted' }, t.type === 'out' ? (F.lineName(memo(t.label)) || '–') : 'Revenu')))))) 
      : notice('Aucune ligne lisible avec ces colonnes. Vérifie la date et le montant.', 'warn'),
    parsed.length ? h('p', { class: 'text-[13px] text-muted' }, `${parsed.length} opérations reconnues, dont ${parsed.length - fresh.length} déjà présentes (ignorées). Aperçu des 8 premières.`) : null,
    h('div', { class: 'flex flex-wrap gap-2' },
      fresh.length ? h('button', { type: 'button', class: BTN, onclick: () => { F.addMany(fresh.map(t => ({ ...t, category: t.type === 'out' ? memo(t.label) : null }))); ui.finImport = null; ctx.render(true); } }, `Importer ${fresh.length} opération${fresh.length > 1 ? 's' : ''}`) : null,
      h('button', { type: 'button', class: GHOST, onclick: () => { ui.finImport = null; ctx.render(); } }, 'Annuler')));
}
