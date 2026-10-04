/* Accès aux collections du planning et actions partagées entre les onglets. */
import { todayKey, addDays } from '../../core/dates.js';
import { newId } from '../../services/collections.js';

export function planning(ctx) {
  const tasks = ctx.col('tasks'), goals = ctx.col('goals'), reviews = ctx.col('reviews');
  const now = () => new Date().toISOString();
  const after = () => ctx.render(true);
  return {
    tasks, goals, reviews,
    allTasks: () => tasks.all(),
    allGoals: () => goals.all().sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')),
    goalOf: t => (t.goalId && goals.get(t.goalId)) || null,
    addTask(fields) { tasks.put({ id: newId('t'), title: '', date: todayKey(), minutes: 30, goalId: null, module: null, done: false, doneAt: null, createdAt: now(), ...fields }); after(); },
    toggle(t) { tasks.patch(t.id, { done: !t.done, doneAt: t.done ? null : now() }); after(); },
    move(t, date) { tasks.patch(t.id, { date }); after(); },
    tomorrow(t) { tasks.patch(t.id, { date: addDays(t.date || todayKey(), 1) }); after(); },
    remove(t) { tasks.remove(t.id); after(); },
    addGoal(fields) { goals.put({ id: newId('g'), title: '', horizon: 'trimestre', parentId: null, module: null, due: null, done: false, createdAt: now(), ...fields }); after(); },
    patchGoal(id, fields) { goals.patch(id, fields); after(); },
    /* Supprime l'objectif ; ses tâches et sous-objectifs restent, détachés. */
    removeGoal(id) {
      for (const t of tasks.all()) if (t.goalId === id) tasks.patch(t.id, { goalId: null });
      for (const g of goals.all()) if (g.parentId === id) goals.patch(g.id, { parentId: null });
      goals.remove(id); after();
    },
  };
}
