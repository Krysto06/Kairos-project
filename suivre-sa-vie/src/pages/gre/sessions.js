import { h } from '../../core/dom.js';
import { todayKey, addDays, shortDate, minutesLabel } from '../../core/dates.js';
import { GRE_SECTIONS } from '../../data/content/gre.js';
import { accuracyBy, minutesSince } from '../../domain/gre.js';
import { DURATIONS } from '../../domain/planning.js';
import { CARD, BTN, IN, H3, EYEBROW } from '../../ui/classes.js';
import { field, emptyState, progressBar } from '../../ui/components.js';

export default function sessions(ctx, G) {
  const ui = ctx.ui, all = G.sessions(), today = todayKey();
  const draft = ui.greDraft || (ui.greDraft = { section: 'q' });
  let dIn, tIn, mIn, aIn, cIn, nIn, err;

  const form = h('form', { class: CARD + ' grid gap-4', onsubmit: e => {
      e.preventDefault();
      const attempted = aIn.value === '' ? null : Math.max(0, Math.round(+aIn.value));
      const correct = cIn.value === '' ? null : Math.max(0, Math.round(+cIn.value));
      if (attempted != null && correct != null && correct > attempted) { err.textContent = 'Les bonnes réponses ne peuvent pas dépasser le nombre de questions.'; err.hidden = false; return; }
      G.addSession({ date: dIn.value || today, section: draft.section, topic: tIn.value, minutes: +mIn.value || 0, attempted, correct, note: nIn.value.trim() });
    } },
    h('div', {}, h('h2', { class: H3 }, 'Enregistrer une séance'), h('p', { class: 'mt-1 text-sm text-muted' }, 'Compte les questions et les bonnes réponses : c’est ce qui mesure ta progression entre deux tests.')),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
      field('gs-date', 'Date', dIn = h('input', { class: IN, id: 'gs-date', type: 'date', value: today, max: today })),
      field('gs-sec', 'Section', h('select', { class: IN + ' cursor-pointer', id: 'gs-sec', onchange: e => { draft.section = e.target.value; ctx.render(true); } },
        Object.entries(GRE_SECTIONS).map(([k, s]) => h('option', { value: k, selected: draft.section === k }, s.label)))),
      field('gs-topic', 'Thème', tIn = h('select', { class: IN + ' cursor-pointer', id: 'gs-topic' }, GRE_SECTIONS[draft.section].topics.map(t => h('option', { value: t }, t)))),
      field('gs-min', 'Durée', mIn = h('select', { class: IN + ' cursor-pointer', id: 'gs-min' }, DURATIONS.map(m => h('option', { value: m, selected: m === 45 || (m === 30 && !DURATIONS.includes(45)) }, minutesLabel(m)))))),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
      field('gs-att', 'Questions faites', aIn = h('input', { class: IN + ' font-mono', id: 'gs-att', type: 'number', min: 0, inputmode: 'numeric', placeholder: 'ex. 20' })),
      field('gs-cor', 'Bonnes réponses', cIn = h('input', { class: IN + ' font-mono', id: 'gs-cor', type: 'number', min: 0, inputmode: 'numeric', placeholder: 'ex. 14' })),
      h('div', { class: 'col-span-2' }, field('gs-note', 'Note (facultatif)', nIn = h('input', { class: IN, id: 'gs-note', placeholder: 'Ex. : erreurs sur les probabilités conditionnelles', autocomplete: 'off' })))),
    err = h('p', { class: 'text-sm text-warn', role: 'alert', hidden: true }),
    h('div', {}, h('button', { type: 'submit', class: BTN }, 'Enregistrer la séance')));

  const week = all.filter(s => s.date >= addDays(today, -6));
  const bySection = Object.keys(GRE_SECTIONS).map(k => {
    const list = all.filter(s => s.section === k), acc = accuracyBy(list, () => k)[0];
    return h('div', { class: 'grid gap-1.5 border-t border-line pt-4 min-w-0', 'data-c': 'edu' },
      h('span', { class: EYEBROW }, GRE_SECTIONS[k].label),
      h('span', { class: 'font-display text-[1.9rem] leading-none font-semibold tnum' }, acc ? Math.round(acc.p * 100) + ' %' : '–'),
      acc ? progressBar(acc.p) : null,
      h('span', { class: 'text-[12.5px] text-muted tnum' }, `${minutesLabel(minutesSince(week.filter(s => s.section === k), '0000'))} cette semaine · ${acc ? acc.attempted + ' questions au total' : 'pas de questions comptées'}`));
  });

  const topics = accuracyBy(all.filter(s => s.section !== 'aw'), s => s.section + '|' + s.topic).sort((a, b) => a.p - b.p);
  const recent = all.slice(0, 20);

  return h('div', { class: 'grid gap-10' },
    form,
    h('div', { class: 'grid gap-x-8 gap-y-6 md:grid-cols-3' }, bySection),
    topics.length ? h('div', { class: 'grid gap-3' }, h('h2', { class: H3 }, 'Précision par thème'),
      h('ul', { class: 'grid gap-3' }, topics.map(t => { const [sec, topic] = t.key.split('|'); return h('li', { class: 'grid gap-1.5 sm:grid-cols-[minmax(0,260px)_1fr_120px] sm:items-center sm:gap-4', 'data-c': 'edu' },
        h('span', { class: 'text-sm font-medium' }, `${GRE_SECTIONS[sec].short} · ${topic}`), progressBar(t.p),
        h('span', { class: 'font-mono text-xs text-muted tnum sm:text-right' }, `${Math.round(t.p * 100)} % · ${t.correct}/${t.attempted}`)); }))) : null,
    h('div', { class: 'grid gap-3' }, h('h2', { class: H3 }, 'Dernières séances'),
      recent.length ? h('ul', { class: 'divide-y divide-line border-y border-line' }, recent.map(s => {
        const confirming = ui.greConfirm === s.id;
        return h('li', { class: 'flex items-start gap-4 py-3' },
          h('span', { class: 'w-16 flex-none font-mono text-xs text-muted pt-0.5' }, shortDate(s.date)),
          h('div', { class: 'min-w-0 flex-1' }, h('div', { class: 'font-medium' }, `${GRE_SECTIONS[s.section].short} · ${s.topic}`),
            h('div', { class: 'text-[12.5px] text-muted tnum' }, [minutesLabel(s.minutes), s.attempted ? `${s.correct ?? 0}/${s.attempted} (${Math.round((s.correct || 0) / s.attempted * 100)} %)` : null, s.note || null].filter(Boolean).join(' · '))),
          h('button', { type: 'button', class: 'text-[12.5px] font-medium cursor-pointer ' + (confirming ? 'text-warn' : 'text-muted hover:text-warn'),
            onclick: () => { if (confirming) { ui.greConfirm = null; G.removeSession(s.id); } else { ui.greConfirm = s.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer'));
      })) : emptyState('Aucune séance enregistrée.')));
}
