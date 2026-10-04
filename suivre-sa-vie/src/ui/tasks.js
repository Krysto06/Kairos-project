/* Ligne de tâche et formulaire d'ajout, partagés par Aujourd'hui, Semaine, Objectifs et le tableau de bord. */
import { h, focusLater } from '../core/dom.js';
import { minutesLabel, shortDate } from '../core/dates.js';
import { DURATIONS } from '../domain/planning.js';
import { moduleById } from '../config/modules.js';
import { BTN, IN } from './classes.js';
import { field } from './components.js';

const ACTION = 'rounded-md px-2 py-1 text-[12.5px] font-medium text-muted hover:bg-soft hover:text-ink transition cursor-pointer';

export function taskRow(task, { goal, project, onToggle, actions = [], showDate = false, compact = false }) {
  const mod = task.module && moduleById(task.module);
  const meta = [showDate && task.date ? shortDate(task.date) : null, task.minutes ? minutesLabel(task.minutes) : null, goal ? goal.title : null, project ? project.name : (mod ? mod.label : null)].filter(Boolean);
  return h('li', { class: 'flex items-start gap-3 ' + (compact ? 'py-2' : 'py-3'), 'data-c': mod ? mod.color : 'me' },
    h('input', { type: 'checkbox', class: 'chk mt-0.5', id: 'tk-' + task.id, checked: !!task.done, 'aria-label': (task.done ? 'Rouvrir ' : 'Terminer ') + task.title, onchange: onToggle }),
    h('div', { class: 'min-w-0 flex-1' },
      h('label', { for: 'tk-' + task.id, class: 'block cursor-pointer break-words ' + (compact ? 'text-[13px] ' : 'text-[14.5px] ') + (task.done ? 'text-muted line-through decoration-muted/50' : 'font-medium') }, task.title),
      meta.length ? h('div', { class: 'mt-0.5 text-[12.5px] text-muted' }, meta.join(' · ')) : null),
    actions.length ? h('div', { class: 'flex flex-none flex-wrap justify-end gap-0.5' }, actions.map(([label, fn, aria]) => h('button', { type: 'button', class: ACTION, onclick: fn, 'aria-label': aria || label }, label))) : null);
}

/* Formulaire d'ajout rapide. onAdd({title, minutes, goalId}) ; le champ titre garde le focus pour enchaîner. */
export function taskForm({ id, goals = [], goalId = '', onAdd, submitLabel = 'Ajouter' }) {
  let tIn, mIn, gIn;
  return h('form', { class: 'grid gap-2 grid-cols-2 md:grid-cols-[minmax(0,2fr)_120px_minmax(0,1fr)_auto] items-end',
    onsubmit: e => {
      e.preventDefault();
      const title = tIn.value.trim(); if (!title) return;
      onAdd({ title, minutes: +mIn.value || 0, goalId: gIn ? gIn.value || null : goalId || null });
      focusLater(id + '-title', false);
    } },
    h('div', { class: 'col-span-2 md:col-span-1' }, field(id + '-title', 'Action', tIn = h('input', { class: IN, id: id + '-title', placeholder: 'Ex. : 20 mots de vocabulaire GRE', autocomplete: 'off' }))),
    field(id + '-min', 'Durée', mIn = h('select', { class: IN + ' cursor-pointer', id: id + '-min' }, DURATIONS.map(m => h('option', { value: m, selected: m === 30 }, minutesLabel(m))))),
    goals.length ? field(id + '-goal', 'Objectif', gIn = h('select', { class: IN + ' cursor-pointer', id: id + '-goal' },
      h('option', { value: '' }, 'Aucun'), goals.map(g => h('option', { value: g.id, selected: g.id === goalId }, g.title)))) : h('span', { class: 'hidden md:block' }),
    h('button', { type: 'submit', class: BTN + (goals.length ? ' col-span-2 md:col-span-1' : '') }, submitLabel));
}
