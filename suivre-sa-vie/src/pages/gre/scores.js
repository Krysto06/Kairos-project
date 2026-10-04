import { h } from '../../core/dom.js';
import { todayKey, shortDate } from '../../core/dates.js';
import { TEST_KINDS, SCORE_RANGE, AW_RANGE } from '../../data/content/gre.js';
import { total } from '../../domain/gre.js';
import { CARD, BTN, IN, H3 } from '../../ui/classes.js';
import { field, emptyState } from '../../ui/components.js';
import { lineChart } from '../../ui/lineChart.js';
import { parse } from './common.js';

export function scoreChart(tests, target) {
  const pts = k => tests.filter(t => t[k] != null).map(t => ({ x: t.date, y: t[k] }));
  return lineChart({ label: 'Évolution des scores Verbal et Quant', yMin: SCORE_RANGE.min, yMax: SCORE_RANGE.max,
    series: [{ label: 'Quant', color: 'sq', points: pts('q'), target: target.q }, { label: 'Verbal', color: 'sv', points: pts('v'), target: target.v }] });
}

export default function scores(ctx, G) {
  const tests = G.tests(), ui = ctx.ui;
  let dIn, kIn, sIn, vIn, qIn, aIn, nIn, err;
  const form = h('form', { class: CARD + ' grid gap-4', onsubmit: e => {
      e.preventDefault();
      const v = parse.score(vIn.value), q = parse.score(qIn.value), aw = parse.aw(aIn.value);
      if (!dIn.value || (v == null && q == null)) { err.textContent = 'Indique au moins la date et un score Verbal ou Quant (entre 130 et 170).'; err.hidden = false; return; }
      G.addTest({ date: dIn.value, kind: kIn.value, source: sIn.value.trim(), v, q, aw, note: nIn.value.trim() });
    } },
    h('h2', { class: H3 }, 'Enregistrer un test'),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
      field('gt-date', 'Date', dIn = h('input', { class: IN, id: 'gt-date', type: 'date', value: todayKey(), max: todayKey() })),
      field('gt-kind', 'Type', kIn = h('select', { class: IN + ' cursor-pointer', id: 'gt-kind' }, Object.entries(TEST_KINDS).map(([k, l]) => h('option', { value: k, selected: k === (tests.length ? 'blanc' : 'diagnostic') }, l)))),
      h('div', { class: 'col-span-2' }, field('gt-src', 'Source', sIn = h('input', { class: IN, id: 'gt-src', placeholder: 'Ex. : POWERPREP 1, Manhattan, ETS', autocomplete: 'off' })))),
    h('div', { class: 'grid gap-3 grid-cols-3' },
      field('gt-v', 'Verbal', vIn = h('input', { class: IN + ' font-mono', id: 'gt-v', type: 'number', min: SCORE_RANGE.min, max: SCORE_RANGE.max, inputmode: 'numeric', placeholder: '130–170' })),
      field('gt-q', 'Quant', qIn = h('input', { class: IN + ' font-mono', id: 'gt-q', type: 'number', min: SCORE_RANGE.min, max: SCORE_RANGE.max, inputmode: 'numeric', placeholder: '130–170' })),
      field('gt-aw', 'Writing', aIn = h('input', { class: IN + ' font-mono', id: 'gt-aw', type: 'number', min: AW_RANGE.min, max: AW_RANGE.max, step: AW_RANGE.step, inputmode: 'decimal', placeholder: '0–6' }))),
    field('gt-note', 'Note (facultatif)', nIn = h('input', { class: IN, id: 'gt-note', placeholder: 'Ex. : fatiguée, manque de temps en Verbal 2', autocomplete: 'off' })),
    err = h('p', { class: 'text-sm text-warn', role: 'alert', hidden: true }),
    h('div', {}, h('button', { type: 'submit', class: BTN }, 'Enregistrer le test')));

  const rows = tests.slice().reverse().map(t => {
    const confirming = ui.greConfirm === t.id;
    return h('tr', {},
      h('td', { class: 'py-3 pr-4 whitespace-nowrap' }, shortDate(t.date)),
      h('td', { class: 'py-3 pr-4' }, TEST_KINDS[t.kind] || '', t.source ? h('span', { class: 'block text-[12.5px] text-muted' }, t.source) : null),
      h('td', { class: 'py-3 pr-4 font-mono tnum text-right' }, t.v ?? '–'), h('td', { class: 'py-3 pr-4 font-mono tnum text-right' }, t.q ?? '–'),
      h('td', { class: 'py-3 pr-4 font-mono tnum text-right font-semibold' }, total(t) ?? '–'),
      h('td', { class: 'py-3 pr-4 font-mono tnum text-right' }, t.aw != null ? t.aw.toFixed(1).replace('.', ',') : '–'),
      h('td', { class: 'py-3 text-right' }, h('button', { type: 'button', class: 'text-[12.5px] font-medium cursor-pointer ' + (confirming ? 'text-warn' : 'text-muted hover:text-warn'),
        onclick: () => { if (confirming) { ui.greConfirm = null; G.removeTest(t.id); } else { ui.greConfirm = t.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer')));
  });

  return h('div', { class: 'grid gap-10' },
    form,
    tests.length ? h('div', { class: 'grid gap-8' },
      tests.some(t => t.v && t.q) ? h('div', { class: CARD }, scoreChart(tests, G.settings.target)) : null,
      h('div', { class: 'overflow-x-auto' }, h('table', { class: 'w-full min-w-[560px] text-sm' },
        h('thead', {}, h('tr', { class: 'border-b border-line text-[11px] uppercase tracking-[.14em] text-muted' },
          ['Date', 'Test', 'Verbal', 'Quant', 'Total', 'Writing', ''].map((t, i) => h('th', { class: 'py-2.5 pr-4 font-semibold ' + (i >= 2 && i <= 5 ? 'text-right' : 'text-left') }, t)))),
        h('tbody', { class: 'divide-y divide-line' }, rows))))
      : emptyState('Aucun test enregistré. Tes scores apparaîtront ici et sur la courbe d’évolution.'));
}
