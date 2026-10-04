import { h } from '../../core/dom.js';
import { todayKey, shortDate } from '../../core/dates.js';
import { EXAMS, efsetLevel } from '../../data/content/english.js';
import { CARD, BTN, IN, H3 } from '../../ui/classes.js';
import { field, emptyState } from '../../ui/components.js';
import { lineChart } from '../../ui/lineChart.js';

/* Échelle de saisie : le TOEFL peut être sur 120 ou sur la nouvelle échelle 1–6. */
const scaleOf = (exam, scale) => exam === 'toefl' && scale === '6' ? { min: 1, max: 6, step: 0.5, subMax: 6 } : EXAMS[exam];
const clamp = (v, sc, max = sc.max) => (v === '' || v == null || isNaN(+v)) ? null : Math.min(max, Math.max(sc.min, Math.round(+v / sc.step) * sc.step));
const fmt = v => v == null ? '–' : String(v).replace('.', ',');

export default function tests(ctx, E) {
  const ui = ctx.ui, all = E.tests();
  const d = ui.enTestDraft || (ui.enTestDraft = { exam: 'efset', scale: '120' });
  const ex = EXAMS[d.exam], sc = scaleOf(d.exam, d.scale);
  let dIn, tIn, nIn, err; const subIns = {};

  const form = h('form', { class: CARD + ' grid gap-4', onsubmit: e => {
      e.preventDefault();
      const total = clamp(tIn.value, sc);
      if (!dIn.value || total == null) { err.textContent = `Indique la date et le score total (${fmt(sc.min)} à ${fmt(sc.max)}).`; err.hidden = false; return; }
      const sub = {}; for (const [k] of ex.sub) { const v = clamp(subIns[k].value, sc, sc.subMax || sc.max); if (v != null) sub[k] = v; }
      E.addTest({ exam: d.exam, scale: d.exam === 'toefl' ? d.scale : null, date: dIn.value, total, sub, note: nIn.value.trim() });
    } },
    h('div', {}, h('h2', { class: H3 }, 'Enregistrer un test'), h('p', { class: 'mt-1 text-sm text-muted' }, ex.note)),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
      field('et-exam', 'Examen', h('select', { class: IN + ' cursor-pointer', id: 'et-exam', onchange: e => { d.exam = e.target.value; ctx.render(true); } },
        Object.entries(EXAMS).map(([k, x]) => h('option', { value: k, selected: d.exam === k }, x.label)))),
      d.exam === 'toefl' ? field('et-scale', 'Échelle', h('select', { class: IN + ' cursor-pointer', id: 'et-scale', onchange: e => { d.scale = e.target.value; ctx.render(true); } },
        h('option', { value: '120', selected: d.scale === '120' }, 'Sur 120'), h('option', { value: '6', selected: d.scale === '6' }, 'Sur 6 (nouvelle échelle)'))) : null,
      field('et-date', 'Date', dIn = h('input', { class: IN, id: 'et-date', type: 'date', value: todayKey(), max: todayKey() })),
      field('et-total', 'Score total', tIn = h('input', { class: IN + ' font-mono', id: 'et-total', type: 'number', min: sc.min, max: sc.max, step: sc.step, inputmode: 'decimal', placeholder: `${fmt(sc.min)}–${fmt(sc.max)}` }))),
    ex.sub.length ? h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' }, ex.sub.map(([k, l]) => field('et-' + k, l + ' (facultatif)',
      subIns[k] = h('input', { class: IN + ' font-mono', id: 'et-' + k, type: 'number', min: sc.min, max: sc.subMax || sc.max, step: sc.step, inputmode: 'decimal' })))) : null,
    field('et-note', 'Note (facultatif)', nIn = h('input', { class: IN, id: 'et-note', autocomplete: 'off', placeholder: 'Ex. : Speaking stressant, manque de temps en Reading' })),
    err = h('p', { class: 'text-sm text-warn', role: 'alert', hidden: true }),
    h('div', {}, h('button', { type: 'submit', class: BTN }, 'Enregistrer le test')));

  const byExam = Object.entries(EXAMS).map(([k, x]) => {
    const list = all.filter(t => t.exam === k);
    if (!list.length) return null;
    const scales = [...new Set(list.map(t => t.scale || '120'))];
    const chartable = list.length >= 2 && scales.length === 1;
    const s = scaleOf(k, scales[0]);
    return h('section', { class: CARD + ' grid gap-5' },
      h('h2', { class: H3 }, x.label),
      chartable ? lineChart({ label: 'Évolution ' + x.label, yMin: s.min, yMax: s.max, yStep: s.max <= 6 ? 1 : s.max === 160 ? 30 : 20,
        series: [{ label: 'Total', color: 'sv', points: list.map(t => ({ x: t.date, y: t.total })), target: E.settings.exam === k ? E.settings.examTarget : null }] }) : null,
      h('div', { class: 'overflow-x-auto' }, h('table', { class: 'w-full min-w-[480px] text-sm' },
        h('thead', {}, h('tr', { class: 'border-b border-line text-[11px] uppercase tracking-[.14em] text-muted' },
          ['Date', 'Total', ...(k === 'efset' ? ['Niveau'] : x.sub.map(([, l]) => l)), ''].map((t, i) => h('th', { class: 'py-2.5 pr-4 font-semibold ' + (i ? 'text-right' : 'text-left') }, t)))),
        h('tbody', { class: 'divide-y divide-line' }, list.slice().reverse().map(t => {
          const confirming = ui.enConfirm === t.id;
          return h('tr', {},
            h('td', { class: 'py-3 pr-4 whitespace-nowrap' }, shortDate(t.date), t.note ? h('span', { class: 'block text-[12px] text-muted' }, t.note) : null),
            h('td', { class: 'py-3 pr-4 text-right font-mono font-semibold tnum' }, fmt(t.total) + (t.scale === '6' ? ' /6' : '')),
            ...(k === 'efset' ? [h('td', { class: 'py-3 pr-4 text-right font-mono tnum' }, efsetLevel(t.total))] : x.sub.map(([sk]) => h('td', { class: 'py-3 pr-4 text-right font-mono tnum' }, fmt(t.sub && t.sub[sk])))),
            h('td', { class: 'py-3 text-right' }, h('button', { type: 'button', class: 'text-[12.5px] font-medium cursor-pointer ' + (confirming ? 'text-warn' : 'text-muted hover:text-warn'),
              onclick: () => { if (confirming) { ui.enConfirm = null; E.removeTest(t.id); } else { ui.enConfirm = t.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer')));
        })))),
      !chartable && list.length >= 2 ? h('p', { class: 'text-[12.5px] text-muted' }, 'Courbe masquée : ces tests utilisent deux échelles différentes.') : null);
  }).filter(Boolean);

  return h('div', { class: 'grid gap-10' }, form, byExam.length ? h('div', { class: 'grid gap-8' }, byExam) : emptyState('Aucun test enregistré. Commence par l’EF SET : il est gratuit et donne ton niveau CECRL.'));
}
