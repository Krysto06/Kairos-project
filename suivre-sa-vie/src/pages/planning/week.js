import { h, focusLater } from '../../core/dom.js';
import { todayKey, addDays, weekDays, shortDay, shortDate, minutesLabel, isoWeekId } from '../../core/dates.js';
import { tasksOn, tasksInWeek, stats } from '../../domain/planning.js';
import { GHOST, IN } from '../../ui/classes.js';
import { progressBar } from '../../ui/components.js';
import { taskRow } from '../../ui/tasks.js';

export function weekNav(ctx) {
  const days = weekDays(ctx.ui.planWeek), isNow = days.includes(todayKey());
  const shift = n => { ctx.ui.planWeek = addDays(ctx.ui.planWeek, n); ctx.render(); };
  return h('div', { class: 'flex flex-wrap items-center gap-2' },
    h('button', { type: 'button', class: GHOST, onclick: () => shift(-7), 'aria-label': 'Semaine précédente' }, '←'),
    h('div', { class: 'min-w-[200px] text-center' }, h('div', { class: 'font-medium' }, `${shortDate(days[0])} – ${shortDate(days[6])}`), h('div', { class: 'font-mono text-[11px] text-muted' }, isoWeekId(days[0]))),
    h('button', { type: 'button', class: GHOST, onclick: () => shift(7), 'aria-label': 'Semaine suivante' }, '→'),
    isNow ? null : h('button', { type: 'button', class: GHOST, onclick: () => { ctx.ui.planWeek = todayKey(); ctx.render(); } }, 'Cette semaine'));
}

export default function week(ctx, P) {
  const days = weekDays(ctx.ui.planWeek), all = P.allTasks(), today = todayKey(), ws = stats(tasksInWeek(all, days));

  /* Agenda : une ligne par jour, le jour à gauche, ses actions à droite. */
  const row = day => {
    const list = tasksOn(all, day), st = stats(list), isToday = day === today;
    let input;
    return h('section', { class: 'grid gap-3 py-5 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-8', 'aria-label': shortDay(day) },
      h('div', { class: 'grid content-start gap-2' },
        h('div', { class: 'flex items-baseline gap-2' },
          h('span', { class: 'font-display text-[1.35rem] font-semibold first-letter:uppercase ' + (isToday ? '' : 'text-ink/80') }, shortDay(day)),
          isToday ? h('span', { class: 'text-[11px] font-semibold uppercase tracking-[.14em] text-accent' }, 'Aujourd’hui') : null),
        st.n ? h('div', { class: 'flex items-center gap-2' }, progressBar(st.p, 'flex-1 max-w-[120px]'), h('span', { class: 'font-mono text-[11px] text-muted tnum' }, `${st.d}/${st.n}`)) : null,
        st.planned ? h('div', { class: 'text-[12px] text-muted' }, minutesLabel(st.planned) + ' prévues') : null),
      h('div', { class: 'grid gap-1 min-w-0' },
        list.length ? h('ul', { class: 'divide-y divide-line' }, list.map(t => taskRow(t, { compact: true, goal: P.goalOf(t), project: P.projectOf(t), onToggle: () => P.toggle(t),
          actions: t.done ? [] : [['Lendemain', () => P.tomorrow(t), 'Décaler au lendemain : ' + t.title]] }))) : null,
        h('form', { class: 'max-w-md', onsubmit: e => { e.preventDefault(); const t = input.value.trim(); if (t) { P.addTask({ title: t, date: day }); focusLater('wk-add-' + day, false); } } },
          input = h('input', { class: IN + ' py-1.5 text-[13px]', id: 'wk-add-' + day, placeholder: list.length ? '+ Ajouter une action' : 'Libre · ajouter une action', 'aria-label': 'Ajouter une action le ' + shortDay(day), autocomplete: 'off' }))));
  };

  return h('div', { class: 'grid gap-6' },
    h('div', { class: 'flex flex-wrap items-center justify-between gap-4' }, weekNav(ctx),
      h('p', { class: 'text-sm text-muted tnum' }, `${ws.d}/${ws.n} actions · ${minutesLabel(ws.spent)} sur ${minutesLabel(ws.planned)} prévues`)),
    h('div', { class: 'divide-y divide-line border-y border-line' }, days.map(row)),
    h('p', { class: 'text-[13px] text-muted' }, 'Durée par défaut des ajouts rapides : 30 min. Pour choisir la durée et l’objectif, ajoute depuis l’onglet Aujourd’hui ou Objectifs.'));
}
