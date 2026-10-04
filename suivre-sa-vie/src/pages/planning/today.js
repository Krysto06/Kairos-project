import { h } from '../../core/dom.js';
import { todayKey, dayLabel, minutesLabel } from '../../core/dates.js';
import { tasksOn, overdue, unplanned, stats, suggestions } from '../../domain/planning.js';
import { routeOfTrack } from '../../config/modules.js';
import { CARD, H3, EYEBROW } from '../../ui/classes.js';
import { metric, emptyState, statusBadge, progressBar } from '../../ui/components.js';
import { taskRow, taskForm } from '../../ui/tasks.js';

const list = rows => h('ul', { class: 'divide-y divide-line' }, rows);

export default function today(ctx, P) {
  const day = todayKey(), all = P.allTasks(), goals = P.allGoals().filter(g => !g.done);
  const todays = tasksOn(all, day), late = overdue(all, day), inbox = unplanned(all), st = stats(todays);
  const sugg = suggestions(ctx.state, all, routeOfTrack).slice(0, 5);

  const row = (t, extra = []) => taskRow(t, { goal: P.goalOf(t), project: P.projectOf(t), onToggle: () => P.toggle(t), actions: extra });

  return h('div', { class: 'grid gap-10' },
    h('div', { class: 'grid gap-x-8 gap-y-6 grid-cols-2 md:grid-cols-3' },
      metric({ label: 'Actions faites', value: `${st.d}/${st.n}`, p: st.p, color: 'me' }),
      metric({ label: 'Temps prévu', value: minutesLabel(st.planned), sub: 'aujourd’hui' }),
      metric({ label: 'Temps accompli', value: minutesLabel(st.spent), sub: st.planned ? Math.round(st.spent / st.planned * 100) + ' % du prévu' : 'rien de prévu' })),

    h('div', { class: CARD + ' grid gap-5' },
      h('div', { class: 'flex flex-wrap items-baseline justify-between gap-2' }, h('h2', { class: H3 + ' first-letter:uppercase' }, dayLabel(day)), h('span', { class: 'text-[13px] text-muted' }, `${st.n} action${st.n > 1 ? 's' : ''}`)),
      taskForm({ id: 'today-add', goals, onAdd: f => P.addTask({ ...f, date: day }) }),
      todays.length ? list(todays.map(t => row(t, t.done ? [['Supprimer', () => P.remove(t), 'Supprimer ' + t.title]] : [['Demain', () => P.tomorrow(t), 'Reporter à demain : ' + t.title], ['Supprimer', () => P.remove(t), 'Supprimer ' + t.title]])))
        : emptyState('Aucune action pour aujourd’hui. Ajoute-en une ci-dessus, ou reprends une suggestion plus bas.')),

    late.length ? h('div', { class: 'grid gap-3' },
      h('div', { class: 'flex items-center gap-2.5' }, h('h2', { class: H3 }, 'En retard'), statusBadge('error', String(late.length))),
      list(late.map(t => taskRow(t, { goal: P.goalOf(t), project: P.projectOf(t), showDate: true, onToggle: () => P.toggle(t),
        actions: [['Aujourd’hui', () => P.move(t, day), 'Déplacer à aujourd’hui : ' + t.title], ['Supprimer', () => P.remove(t), 'Supprimer ' + t.title]] })))) : null,

    inbox.length ? h('div', { class: 'grid gap-3' }, h('h2', { class: H3 }, 'À planifier'),
      list(inbox.map(t => row(t, [['Aujourd’hui', () => P.move(t, day), 'Planifier aujourd’hui : ' + t.title], ['Supprimer', () => P.remove(t), 'Supprimer ' + t.title]])))) : null,

    sugg.length ? h('div', { class: 'grid gap-3' },
      h('div', { class: 'flex flex-wrap items-center gap-2.5' }, h('h2', { class: H3 }, 'Suggestions de tes modules'), statusBadge('live', 'Règle simple')),
      h('p', { class: 'text-[13px] text-muted -mt-1' }, 'La prochaine étape de chaque parcours, formation et projet en cours. Ce n’est pas encore une recommandation de l’IA.'),
      h('ul', { class: 'divide-y divide-line border-y border-line' }, sugg.map(s => h('li', { class: 'flex items-center gap-3 py-3', 'data-c': s.c },
        h('span', { class: 'grid h-8 w-11 flex-none place-items-center rounded-md bg-c font-mono text-[10.5px] text-ci' }, s.tag),
        h('div', { class: 'min-w-0 flex-1' }, h('div', { class: 'font-medium' }, s.t), h('div', { class: 'text-[12.5px] text-muted' }, s.sub)),
        h('button', { type: 'button', class: 'rounded-md border border-line px-2.5 py-1 text-[12.5px] font-medium hover:border-ink/40 cursor-pointer', onclick: () => P.addTask({ title: s.t, module: s.route, date: day }) }, '+ Aujourd’hui'))))) : null);
}
