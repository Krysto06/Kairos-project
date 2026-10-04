import { h } from '../../core/dom.js';
import { todayKey, addDays, shortDate, minutesLabel } from '../../core/dates.js';
import { DURATIONS } from '../../domain/planning.js';
import { minutesByCourse } from '../../domain/skills.js';
import { CARD, BTN, IN, H3 } from '../../ui/classes.js';
import { field, emptyState } from '../../ui/components.js';

export default function sessions(ctx, K) {
  const ui = ctx.ui, courses = K.courses(), all = K.sessions(), today = todayKey();
  const d = ui.skDraft || (ui.skDraft = { courseId: (courses.find(c => c.status === 'cours') || courses[0] || {}).id });
  const course = K.course(d.courseId);
  let dIn, mIn, modIn, nIn, doneIn;
  const form = courses.length ? h('form', { class: CARD + ' grid gap-4', onsubmit: e => {
      e.preventDefault();
      K.addSession({ date: dIn.value || today, courseId: d.courseId, moduleId: modIn.value || null, minutes: +mIn.value || 0, note: nIn.value.trim() });
      if (doneIn.checked && modIn.value) { const m = course.mods.find(x => x.id === modIn.value); if (m && !m.done) K.toggleModule(course.id, m.id); }
    } },
    h('h2', { class: H3 }, 'Enregistrer une séance'),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
      field('ss-date', 'Date', dIn = h('input', { class: IN, id: 'ss-date', type: 'date', value: today, max: today })),
      field('ss-course', 'Formation', h('select', { class: IN + ' cursor-pointer', id: 'ss-course', onchange: e => { d.courseId = e.target.value; ctx.render(true); } }, courses.map(c => h('option', { value: c.id, selected: c.id === d.courseId }, c.title)))),
      field('ss-mod', 'Module', modIn = h('select', { class: IN + ' cursor-pointer', id: 'ss-mod' }, h('option', { value: '' }, 'Général'), (course ? course.mods : []).map(m => h('option', { value: m.id, selected: course && m.id === (course.mods.find(x => !x.done) || {}).id }, (m.done ? '✓ ' : '') + m.t)))),
      field('ss-min', 'Durée', mIn = h('select', { class: IN + ' cursor-pointer', id: 'ss-min' }, DURATIONS.map(m => h('option', { value: m, selected: m === 60 }, minutesLabel(m)))))),
    field('ss-note', 'Note (facultatif)', nIn = h('input', { class: IN, id: 'ss-note', autocomplete: 'off', placeholder: 'Ex. : exercices pandas sur les fusions, à revoir' })),
    h('label', { class: 'flex items-center gap-3 text-sm cursor-pointer', 'data-c': 'sk' }, doneIn = h('input', { type: 'checkbox', class: 'chk', id: 'ss-done' }), 'J’ai terminé ce module'),
    h('div', {}, h('button', { type: 'submit', class: BTN }, 'Enregistrer la séance'))) : emptyState('Ajoute d’abord une formation.');

  const by = minutesByCourse(all, addDays(today, -29));
  const name = id => (K.course(id) || {}).title || 'Formation supprimée';
  const modName = s => { const c = K.course(s.courseId), m = c && c.mods.find(x => x.id === s.moduleId); return m ? m.t : null; };

  return h('div', { class: 'grid gap-10', 'data-c': 'sk' },
    form,
    by.size ? h('div', { class: 'grid gap-3' }, h('h2', { class: H3 }, 'Temps sur 30 jours'),
      h('ul', { class: 'grid gap-2' }, [...by.entries()].sort((a, b) => b[1] - a[1]).map(([id, m]) => { const max = Math.max(...by.values()); return h('li', { class: 'grid grid-cols-[minmax(0,200px)_1fr_70px] items-center gap-3' },
        h('span', { class: 'truncate text-sm' }, name(id)), h('div', { class: 'h-2.5 rounded-sm bg-soft overflow-hidden' }, h('div', { class: 'h-full rounded-sm bg-sk-ink', style: `width:${m / max * 100}%` })),
        h('span', { class: 'text-right font-mono text-xs text-muted tnum' }, minutesLabel(m))); }))) : null,
    h('div', { class: 'grid gap-3' }, h('h2', { class: H3 }, 'Dernières séances'),
      all.length ? h('ul', { class: 'divide-y divide-line border-y border-line' }, all.slice(0, 30).map(s => {
        const confirming = ui.confirm === 'ss-' + s.id;
        return h('li', { class: 'flex items-start gap-4 py-3' },
          h('span', { class: 'w-16 flex-none font-mono text-xs text-muted pt-0.5' }, shortDate(s.date)),
          h('div', { class: 'min-w-0 flex-1' }, h('div', { class: 'font-medium' }, [name(s.courseId), modName(s)].filter(Boolean).join(' · ')), h('div', { class: 'text-[12.5px] text-muted' }, [minutesLabel(s.minutes), s.note || null].filter(Boolean).join(' · '))),
          h('button', { type: 'button', class: 'text-[12.5px] font-medium cursor-pointer ' + (confirming ? 'text-warn' : 'text-muted hover:text-warn'), onclick: () => { if (confirming) { ui.confirm = null; K.removeSession(s.id); } else { ui.confirm = 'ss-' + s.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer'));
      })) : emptyState('Aucune séance enregistrée.')));
}
