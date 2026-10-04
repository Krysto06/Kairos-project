import { h } from '../../core/dom.js';
import { todayKey, shortDate, minutesLabel } from '../../core/dates.js';
import { SKILLS, ACTIVITIES, bandOf } from '../../data/content/english.js';
import { DURATIONS } from '../../domain/planning.js';
import { CARD, BTN, IN, H3 } from '../../ui/classes.js';
import { field, emptyState } from '../../ui/components.js';

export default function sessions(ctx, E) {
  const ui = ctx.ui, all = E.sessions(), today = todayKey(), band = bandOf(E.settings.level);
  const d = ui.enDraft || (ui.enDraft = { section: 'listening' });
  let dIn, tIn, mIn, aIn, cIn, wIn, nIn, err;

  const form = h('form', { class: CARD + ' grid gap-4', onsubmit: e => {
      e.preventDefault();
      const n = v => v === '' ? null : Math.max(0, Math.round(+v));
      const attempted = n(aIn.value), correct = n(cIn.value);
      if (attempted != null && correct != null && correct > attempted) { err.textContent = 'Les bonnes réponses ne peuvent pas dépasser le nombre de questions.'; err.hidden = false; return; }
      E.addSession({ date: dIn.value || today, section: d.section, topic: tIn.value.trim() || ACTIVITIES[d.section][band], minutes: +mIn.value || 0, attempted, correct, words: n(wIn.value), note: nIn.value.trim() });
    } },
    h('div', {}, h('h2', { class: H3 }, 'Enregistrer une séance'), h('p', { class: 'mt-1 text-sm text-muted' }, 'Même 20 minutes comptent. La régularité pèse plus que la durée.')),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
      field('es-date', 'Date', dIn = h('input', { class: IN, id: 'es-date', type: 'date', value: today, max: today })),
      field('es-skill', 'Compétence', h('select', { class: IN + ' cursor-pointer', id: 'es-skill', onchange: e => { d.section = e.target.value; ctx.render(true); } },
        Object.entries(SKILLS).map(([k, s]) => h('option', { value: k, selected: d.section === k }, s.label)))),
      h('div', { class: 'col-span-2' }, field('es-topic', 'Activité', tIn = h('input', { class: IN, id: 'es-topic', list: 'es-acts', autocomplete: 'off', placeholder: ACTIVITIES[d.section][band] })),
        h('datalist', { id: 'es-acts' }, Object.values(ACTIVITIES[d.section]).map(a => h('option', { value: a }))))),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
      field('es-min', 'Durée', mIn = h('select', { class: IN + ' cursor-pointer', id: 'es-min' }, DURATIONS.map(m => h('option', { value: m, selected: m === 30 }, minutesLabel(m))))),
      field('es-words', 'Mots nouveaux', wIn = h('input', { class: IN + ' font-mono', id: 'es-words', type: 'number', min: 0, inputmode: 'numeric', placeholder: 'facultatif' })),
      field('es-att', 'Questions faites', aIn = h('input', { class: IN + ' font-mono', id: 'es-att', type: 'number', min: 0, inputmode: 'numeric', placeholder: 'facultatif' })),
      field('es-cor', 'Bonnes réponses', cIn = h('input', { class: IN + ' font-mono', id: 'es-cor', type: 'number', min: 0, inputmode: 'numeric', placeholder: 'facultatif' }))),
    field('es-note', 'Note (facultatif)', nIn = h('input', { class: IN, id: 'es-note', autocomplete: 'off', placeholder: 'Ex. : accent écossais difficile' })),
    err = h('p', { class: 'text-sm text-warn', role: 'alert', hidden: true }),
    h('div', {}, h('button', { type: 'submit', class: BTN }, 'Enregistrer la séance')));

  return h('div', { class: 'grid gap-10' }, form,
    h('div', { class: 'grid gap-3' }, h('h2', { class: H3 }, 'Dernières séances'),
      all.length ? h('ul', { class: 'divide-y divide-line border-y border-line' }, all.slice(0, 30).map(s => {
        const confirming = ui.enConfirm === s.id;
        const meta = [minutesLabel(s.minutes), s.words ? s.words + ' mots' : null, s.attempted ? `${s.correct ?? 0}/${s.attempted} (${Math.round((s.correct || 0) / s.attempted * 100)} %)` : null, s.note || null].filter(Boolean);
        return h('li', { class: 'flex items-start gap-4 py-3' },
          h('span', { class: 'w-16 flex-none font-mono text-xs text-muted pt-0.5' }, shortDate(s.date)),
          h('div', { class: 'min-w-0 flex-1' }, h('div', { class: 'font-medium' }, `${SKILLS[s.section] ? SKILLS[s.section].short : s.section} · ${s.topic}`), h('div', { class: 'text-[12.5px] text-muted tnum' }, meta.join(' · '))),
          h('button', { type: 'button', class: 'text-[12.5px] font-medium cursor-pointer ' + (confirming ? 'text-warn' : 'text-muted hover:text-warn'),
            onclick: () => { if (confirming) { ui.enConfirm = null; E.removeSession(s.id); } else { ui.enConfirm = s.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer'));
      })) : emptyState('Aucune séance enregistrée.')));
}
