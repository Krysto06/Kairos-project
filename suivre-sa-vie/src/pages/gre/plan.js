import { h } from '../../core/dom.js';
import { todayKey, shortDay, minutesLabel } from '../../core/dates.js';
import { GRE_SECTIONS, GRE_LINKS } from '../../data/content/gre.js';
import { latest, gaps, daysUntil, phase, allocation, weekPlan, planDays, weakTopics, sessionTitle } from '../../domain/gre.js';
import { planBlocks } from '../../services/planBlocks.js';
import { CARD, BTN, H3, EYEBROW } from '../../ui/classes.js';
import { statusBadge, notice, linkChip } from '../../ui/components.js';
import { targetCard } from './overview.js';

export default function plan(ctx, G) {
  const s = G.settings, today = todayKey(), tests = G.tests(), last = latest(tests);
  const left = daysUntil(s.testDate, today), ph = phase(left), g = gaps(s.target, last);
  const missing = [!s.testDate && 'la date du test', !s.weeklyHours && 'tes heures par semaine', (s.target.v == null || s.target.q == null) && 'tes scores cibles'].filter(Boolean);

  const head = h('div', { class: 'flex flex-wrap items-center gap-2.5' }, statusBadge('live', 'Règle simple'),
    h('span', { class: 'text-[13px] text-muted' }, 'Plan calculé à partir de l’écart à ta cible, de tes points faibles et du temps restant. Ce n’est pas encore une recommandation de l’IA.'));

  if (missing.length) return h('div', { class: 'grid gap-8' }, head, notice('Pour calculer ton plan, il manque ' + missing.join(', ') + '.', 'gold'), targetCard(ctx, G));

  const weekly = s.weeklyHours * 60, alloc = allocation(weekly, g), weak = weakTopics(G.sessions());
  const days = planDays(today), blocks = weekPlan({ days, weeklyMinutes: weekly, gaps: g, weak, daysLeft: left });
  const pb = planBlocks(ctx, 'gre', blocks, sessionTitle), { fresh, goal } = pb, addAll = pb.addAll;

  return h('div', { class: 'grid gap-10' },
    head,
    !last ? notice('Aucun test enregistré : la répartition est à parts égales entre Quant et Verbal. Passe un diagnostic POWERPREP pour un plan ciblé.', 'gold') : null,
    h('div', { class: 'grid gap-6 lg:grid-cols-[1fr_1.2fr]' },
      h('div', { class: CARD + ' grid gap-4 content-start' },
        h('div', { class: EYEBROW }, left != null && left >= 0 ? `J-${left} · phase actuelle` : 'Phase'),
        h('h2', { class: 'font-display text-[1.9rem] leading-tight font-semibold' }, ph.label),
        h('p', { class: 'text-sm text-muted' }, ph.detail),
        h('dl', { class: 'mt-2 grid gap-2 border-t border-line pt-4 text-sm' },
          [['q', g.q], ['v', g.v], ['aw', g.aw]].map(([k, gap]) => h('div', { class: 'flex items-baseline justify-between gap-3' },
            h('dt', {}, GRE_SECTIONS[k].label, h('span', { class: 'ml-2 text-[12.5px] text-muted' }, gap == null ? '' : gap > 0 ? `écart +${String(gap).replace('.', ',')}` : 'cible atteinte')),
            h('dd', { class: 'font-mono tnum' }, minutesLabel(alloc[k]) + ' / sem.'))))),
      h('div', { class: CARD + ' grid gap-4 content-start' },
        h('div', { class: 'flex flex-wrap items-end justify-between gap-3' }, h('h2', { class: H3 }, 'Séances des 7 prochains jours'),
          fresh.length ? h('button', { type: 'button', class: BTN, onclick: addAll }, `Ajouter ${fresh.length} séance${fresh.length > 1 ? 's' : ''} au planning`) : null),
        blocks.length ? h('ul', { class: 'divide-y divide-line' }, blocks.map(b => h('li', { class: 'flex items-baseline gap-4 py-2.5' },
          h('span', { class: 'w-16 flex-none text-[13px] text-muted first-letter:uppercase' }, shortDay(b.date)),
          h('span', { class: 'min-w-0 flex-1 text-sm ' + (pb.planned(b) ? 'text-muted' : 'font-medium') }, sessionTitle(b), pb.planned(b) ? h('span', { class: 'ml-2 text-[12px]' }, '· déjà au planning') : null),
          h('span', { class: 'font-mono text-xs text-muted tnum' }, minutesLabel(b.minutes)))))
          : h('p', { class: 'text-sm text-muted' }, 'Aucune séance à proposer.'),
        h('p', { class: 'border-t border-line pt-3 text-[12.5px] text-muted' }, goal ? `Les séances seront rattachées à ton objectif « ${goal.title} ».` : 'Astuce : crée un objectif lié au module GRE dans Planning → Objectifs pour y rattacher ces séances.'))),
    h('div', { class: 'flex flex-wrap gap-x-4 gap-y-1.5' }, GRE_LINKS.map(([l, u]) => linkChip(l, u))));
}
