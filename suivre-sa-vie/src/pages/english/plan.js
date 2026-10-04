import { h } from '../../core/dom.js';
import { todayKey, addDays, shortDay, minutesLabel } from '../../core/dates.js';
import { SKILLS, EN_LINKS } from '../../data/content/english.js';
import { minutesBySkill, weights, weekPlan, sessionTitle } from '../../domain/english.js';
import { planDays } from '../../domain/planning.js';
import { planBlocks } from '../../services/planBlocks.js';
import { CARD, BTN, H3, EYEBROW } from '../../ui/classes.js';
import { statusBadge, notice, linkChip } from '../../ui/components.js';
import { settingsCard } from './overview.js';

export default function plan(ctx, E) {
  const s = E.settings, today = todayKey();
  const head = h('div', { class: 'flex flex-wrap items-center gap-2.5' }, statusBadge('live', 'Règle simple'),
    h('span', { class: 'text-[13px] text-muted' }, 'Des séances de 30 min chaque jour, adaptées à ton niveau, qui renforcent les compétences les moins travaillées ces 14 derniers jours. Pas encore l’IA.'));
  if (!s.weeklyHours) return h('div', { class: 'grid gap-8' }, head, notice('Indique tes heures par semaine pour calculer ton plan.', 'gold'), settingsCard(E));

  const by = minutesBySkill(E.sessions(), addDays(today, -13)), w = weights(by), sum = Object.values(w).reduce((a, b) => a + b, 0);
  const days = planDays(today, { sunday: true }), blocks = weekPlan({ days, weeklyMinutes: s.weeklyHours * 60, level: s.level, bySkill: by });
  const pb = planBlocks(ctx, 'english', blocks, sessionTitle);

  return h('div', { class: 'grid gap-10' },
    head,
    s.level ? null : notice('Niveau non renseigné : les activités proposées sont de niveau A. Passe l’EF SET pour un plan adapté.', 'gold'),
    h('div', { class: 'grid gap-6 lg:grid-cols-[1fr_1.3fr]' },
      h('div', { class: CARD + ' grid gap-4 content-start' },
        h('div', { class: EYEBROW }, 'Répartition de la semaine'),
        h('dl', { class: 'grid gap-2.5 text-sm' }, Object.entries(SKILLS).map(([k, sk]) => h('div', { class: 'flex items-baseline justify-between gap-3' },
          h('dt', {}, sk.label, by[k] === 0 ? h('span', { class: 'ml-2 text-[12px] text-gold' }, 'non travaillée') : null),
          h('dd', { class: 'font-mono tnum' }, Math.round(w[k] / sum * 100) + ' %')))),
        h('p', { class: 'border-t border-line pt-3 text-[12.5px] text-muted' }, `Sur 14 jours : ${Object.entries(by).map(([k, m]) => `${SKILLS[k].short} ${minutesLabel(m)}`).join(' · ')}`)),
      h('div', { class: CARD + ' grid gap-4 content-start' },
        h('div', { class: 'flex flex-wrap items-end justify-between gap-3' }, h('h2', { class: H3 }, 'Séances des 7 prochains jours'),
          pb.fresh.length ? h('button', { type: 'button', class: BTN, onclick: pb.addAll }, `Ajouter ${pb.fresh.length} séance${pb.fresh.length > 1 ? 's' : ''} au planning`) : null),
        h('ul', { class: 'divide-y divide-line' }, blocks.map(b => h('li', { class: 'flex items-baseline gap-4 py-2.5' },
          h('span', { class: 'w-16 flex-none text-[13px] text-muted first-letter:uppercase' }, shortDay(b.date)),
          h('span', { class: 'min-w-0 flex-1 text-sm ' + (pb.planned(b) ? 'text-muted' : 'font-medium') }, sessionTitle(b), pb.planned(b) ? h('span', { class: 'ml-2 text-[12px]' }, '· déjà au planning') : null),
          h('span', { class: 'font-mono text-xs text-muted tnum' }, minutesLabel(b.minutes))))),
        h('p', { class: 'border-t border-line pt-3 text-[12.5px] text-muted' }, pb.goal ? `Les séances seront rattachées à ton objectif « ${pb.goal.title} ».` : 'Astuce : crée un objectif lié au module Anglais dans Planning → Objectifs pour y rattacher ces séances.'))),
    h('div', { class: 'flex flex-wrap gap-x-4 gap-y-1.5' }, EN_LINKS.map(([l, u]) => linkChip(l, u))));
}
