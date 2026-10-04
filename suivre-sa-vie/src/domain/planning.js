/* Planning : objectifs (long terme → semaine), tâches datées, revues hebdomadaires. Fonctions pures.
   Tâche : { id, title, date ('AAAA-MM-JJ' ou null = à planifier), time ('HH:MM' ou null), minutes, goalId, module, projectId, done, doneAt, createdAt }
   Objectif : { id, title, horizon, parentId, module, due, done, createdAt }
   Revue : { id = semaine ISO, worked, blocked, adjust, updatedAt } */
import { nextActions } from './progress.js';
import { addDays } from '../core/dates.js';

/* Jours proposés pour un plan : les 7 prochains jours à partir d'aujourd'hui (glissants),
   sans les dimanches si sunday est faux. */
export function planDays(today, { sunday = false } = {}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  return sunday ? days : days.filter(d => new Date(d + 'T12:00').getDay() !== 0);
}

export const HORIZONS = { long: 'Long terme', trimestre: 'Trimestre', mois: 'Mois', semaine: 'Semaine' };
export const DURATIONS = [15, 25, 30, 45, 60, 90, 120];

const byCreated = (a, b) => (a.createdAt || '').localeCompare(b.createdAt || '');
/* Ouvertes d'abord ; puis celles qui ont une heure, dans l'ordre de la journée ; puis par création. */
const byTime = (a, b) => (a.time ? 0 : 1) - (b.time ? 0 : 1) || (a.time || '').localeCompare(b.time || '');
const openFirst = (a, b) => (a.done - b.done) || byTime(a, b) || byCreated(a, b);

/* Fin d'une action horodatée : « 09:30 » + 45 min → « 10:15 ». */
export function endTime(time, minutes) {
  const [hh, mm] = time.split(':').map(Number), t = hh * 60 + mm + (+minutes || 0);
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export const tasksOn = (tasks, day) => tasks.filter(t => t.date === day).sort(openFirst);
export const overdue = (tasks, today) => tasks.filter(t => !t.done && t.date && t.date < today).sort((a, b) => a.date.localeCompare(b.date));
export const unplanned = tasks => tasks.filter(t => !t.done && !t.date).sort(byCreated);

export function stats(tasks) {
  const done = tasks.filter(t => t.done);
  const sum = l => l.reduce((a, t) => a + (+t.minutes || 0), 0);
  return { n: tasks.length, d: done.length, planned: sum(tasks), spent: sum(done), p: tasks.length ? done.length / tasks.length : 0 };
}

export const tasksInWeek = (tasks, days) => tasks.filter(t => t.date && t.date >= days[0] && t.date <= days[6]);

/* Ids d'un objectif et de tous ses sous-objectifs. */
export function goalFamily(goals, id) {
  const ids = new Set([id]);
  let grew = true;
  while (grew) { grew = false; for (const g of goals) if (g.parentId && ids.has(g.parentId) && !ids.has(g.id)) { ids.add(g.id); grew = true; } }
  return ids;
}

/* Progression mesurable d'un objectif : tâches liées (à lui ou à ses sous-objectifs) terminées. */
export function goalProgress(goals, tasks, id) {
  const fam = goalFamily(goals, id);
  return stats(tasks.filter(t => t.goalId && fam.has(t.goalId)));
}

/* Objectifs qu'un objectif peut avoir pour parent : un horizon plus long, et pas lui-même ni ses descendants. */
export function parentCandidates(goals, horizon, selfId) {
  const order = Object.keys(HORIZONS), i = order.indexOf(horizon);
  const banned = selfId ? goalFamily(goals, selfId) : new Set();
  return goals.filter(g => !g.done && order.indexOf(g.horizon) < i && !banned.has(g.id));
}

/* Suggestions issues des autres modules (règle simple, pas d'IA), sans doublon avec une tâche ouverte. */
export function suggestions(state, tasks, routeOfTrack) {
  const open = new Set(tasks.filter(t => !t.done).map(t => t.title.trim().toLowerCase()));
  return nextActions(state, routeOfTrack).filter(a => !open.has(a.t.trim().toLowerCase()));
}
