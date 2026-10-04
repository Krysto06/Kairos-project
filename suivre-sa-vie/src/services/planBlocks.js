/* Envoie des séances proposées par un module (GRE, Anglais…) dans le Planning, sans doublon,
   rattachées à l'objectif le plus court terme lié à ce module s'il existe. */
import { HORIZONS } from '../domain/planning.js';
import { newId } from './collections.js';

export function moduleGoal(goals, moduleId) {
  const order = Object.keys(HORIZONS).reverse();
  return goals.filter(g => g.module === moduleId && !g.done).sort((a, b) => order.indexOf(a.horizon) - order.indexOf(b.horizon))[0] || null;
}

export function planBlocks(ctx, moduleId, blocks, titleOf) {
  const tasks = ctx.col('tasks'), existing = new Set(tasks.all().map(t => t.date + '|' + t.title));
  const planned = b => existing.has(b.date + '|' + titleOf(b));
  const fresh = blocks.filter(b => !planned(b));
  const goal = moduleGoal(ctx.col('goals').all(), moduleId);
  return {
    fresh, goal, planned,
    addAll() {
      const now = new Date().toISOString();
      for (const b of fresh) tasks.put({ id: newId('t'), title: titleOf(b), date: b.date, minutes: b.minutes, goalId: goal ? goal.id : null, module: moduleId, done: false, doneAt: null, createdAt: now });
      ctx.render(true);
    },
  };
}
