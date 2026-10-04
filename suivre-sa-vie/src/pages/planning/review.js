import { h } from '../../core/dom.js';
import { weekDays, isoWeekId, minutesLabel } from '../../core/dates.js';
import { tasksInWeek, stats } from '../../domain/planning.js';
import { CARD, IN, H3, LABEL } from '../../ui/classes.js';
import { metric, statusBadge } from '../../ui/components.js';
import { weekNav } from './week.js';

const QUESTIONS = [['worked', 'Ce qui a marché'], ['blocked', 'Ce qui a bloqué'], ['adjust', 'Ce que j’ajuste la semaine prochaine']];

export default function review(ctx, P) {
  const days = weekDays(ctx.ui.planWeek), id = isoWeekId(days[0]);
  const week = tasksInWeek(P.allTasks(), days), st = stats(week);
  const saved = P.reviews.get(id) || {};
  const byGoal = new Map();
  for (const t of week.filter(x => x.done && x.goalId)) { const g = P.goalOf(t); if (g) byGoal.set(g.title, (byGoal.get(g.title) || 0) + 1); }

  const write = (k, v) => P.reviews.put({ ...(P.reviews.get(id) || { id }), id, [k]: v, updatedAt: new Date().toISOString() });

  return h('div', { class: 'grid gap-10' },
    weekNav(ctx),
    h('div', { class: 'grid gap-x-8 gap-y-6 grid-cols-2 md:grid-cols-3' },
      metric({ label: 'Actions faites', value: `${st.d}/${st.n}`, p: st.p }),
      metric({ label: 'Temps accompli', value: minutesLabel(st.spent), sub: 'sur ' + minutesLabel(st.planned) + ' prévues' }),
      metric({ label: 'Objectifs avancés', value: byGoal.size, sub: byGoal.size ? [...byGoal.entries()].map(([t, n]) => `${t} (${n})`).join(', ') : 'aucune action liée terminée' })),
    h('div', { class: CARD + ' grid gap-5' },
      h('div', { class: 'flex flex-wrap items-center justify-between gap-2' }, h('h2', { class: H3 }, 'Revue de la semaine'), saved.updatedAt ? h('span', { class: 'text-[12.5px] text-muted' }, 'Modifiée le ' + new Date(saved.updatedAt).toLocaleDateString('fr-FR')) : null),
      QUESTIONS.map(([k, label]) => h('div', { class: 'grid gap-1.5' }, h('label', { class: LABEL, for: `rv-${id}-${k}` }, label),
        h('textarea', { class: IN + ' min-h-[96px] leading-relaxed', id: `rv-${id}-${k}`, rows: 3, oninput: e => write(k, e.target.value) }, saved[k] || '')))),
    h('div', { class: 'flex flex-wrap items-center gap-2.5 text-[13px] text-muted' }, statusBadge('connect'), 'Analyse de la revue par l’IA et ajustement automatique du plan : viendront avec l’Assistant IA.'));
}
