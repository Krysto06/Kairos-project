import { h } from '../../core/dom.js';
import { todayKey, addDays, minutesLabel } from '../../core/dates.js';
import { SKILL_LEVELS } from '../../data/content/skills.js';
import { courseProgress, allSkillsProgress } from '../../domain/progress.js';
import { minutesByCourse, skillGaps, reachedCount, nextModuleBlocks, blockTitle } from '../../domain/skills.js';
import { planDays } from '../../domain/planning.js';
import { planBlocks } from '../../services/planBlocks.js';
import { CARD, BTN, GHOST, H3 } from '../../ui/classes.js';
import { metric, emptyState, statusBadge, progressBar } from '../../ui/components.js';

export default function overview(ctx, K, go) {
  const courses = K.courses(), today = todayKey(), all = allSkillsProgress(ctx.state);
  const mins = minutesByCourse(K.sessions(), addDays(today, -29)), total30 = [...mins.values()].reduce((a, b) => a + b, 0);
  const gaps = skillGaps(K.skills()).slice(0, 5), reached = reachedCount(K.skills());
  const blocks = nextModuleBlocks(ctx.state, planDays(today, { sunday: true }));
  const pb = planBlocks(ctx, 'skills', blocks, blockTitle);

  return h('div', { class: 'grid gap-12', 'data-c': 'sk' },
    h('div', { class: 'grid gap-x-8 gap-y-6 grid-cols-2 lg:grid-cols-4' },
      metric({ label: 'Formations en cours', value: courses.filter(c => c.status === 'cours').length, sub: `${courses.length} au total · ${courses.filter(c => c.status === 'fini').length} terminée${courses.filter(c => c.status === 'fini').length > 1 ? 's' : ''}`, color: 'sk' }),
      metric({ label: 'Modules terminés', value: `${all.d}/${all.n}`, p: all.p, color: 'sk' }),
      metric({ label: 'Temps sur 30 jours', value: minutesLabel(total30), sub: 'séances enregistrées', color: 'sk' }),
      metric({ label: 'Niveaux visés atteints', value: reached.n ? `${reached.d}/${reached.n}` : '–', p: reached.n ? reached.d / reached.n : null, sub: reached.n ? 'compétences avec une cible' : 'aucune cible fixée', color: 'sk' })),

    h('div', { class: CARD + ' grid gap-4' },
      h('div', { class: 'flex flex-wrap items-end justify-between gap-3' },
        h('div', {}, h('h2', { class: H3 }, 'Prochains modules'), h('div', { class: 'mt-1 flex flex-wrap items-center gap-2' }, statusBadge('live', 'Règle simple'), h('span', { class: 'text-[13px] text-muted' }, 'Le premier module non coché de chaque formation en cours ou à commencer.'))),
        pb.fresh.length ? h('button', { type: 'button', class: BTN, onclick: pb.addAll }, `Ajouter ${pb.fresh.length} séance${pb.fresh.length > 1 ? 's' : ''} au planning`) : null),
      blocks.length ? h('ul', { class: 'divide-y divide-line' }, blocks.map(b => {
        const c = K.course(b.courseId), pr = courseProgress(c);
        return h('li', { class: 'grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-center sm:gap-6' },
          h('div', { class: 'min-w-0' }, h('div', { class: 'font-medium' }, b.topic), h('div', { class: 'text-[12.5px] text-muted' }, `${c.title} · ${mins.get(c.id) ? minutesLabel(mins.get(c.id)) + ' sur 30 jours' : 'pas de séance récente'}`)),
          h('div', { class: 'flex items-center gap-2' }, progressBar(pr.p, 'flex-1'), h('span', { class: 'font-mono text-[11px] text-muted tnum' }, `${pr.d}/${pr.n}`)),
          h('span', { class: 'text-[12.5px] ' + (pb.planned(b) ? 'text-muted' : 'text-muted/70') }, pb.planned(b) ? 'déjà au planning' : ''));
      })) : emptyState('Aucun module à venir. Ajoute une formation ou des modules dans l’onglet Formations.', h('button', { type: 'button', class: GHOST, onclick: () => go('courses') }, 'Ouvrir les formations')),
      pb.goal ? h('p', { class: 'border-t border-line pt-3 text-[12.5px] text-muted' }, `Les séances seront rattachées à ton objectif « ${pb.goal.title} ».`) : null),

    h('div', { class: CARD + ' grid gap-4' },
      h('div', { class: 'flex flex-wrap items-end justify-between gap-3' }, h('h2', { class: H3 }, 'Plus grands écarts'), h('button', { type: 'button', class: GHOST, onclick: () => go('map') }, 'Voir le référentiel')),
      gaps.length ? h('ul', { class: 'grid gap-3' }, gaps.map(s => h('li', { class: 'grid gap-1 sm:grid-cols-[minmax(0,220px)_1fr_auto] sm:items-center sm:gap-4' },
          h('span', { class: 'text-sm font-medium' }, s.name), levelBar(s.level, s.target),
          h('span', { class: 'text-[12.5px] text-muted' }, `${SKILL_LEVELS[s.level]} → ${SKILL_LEVELS[s.target]}`))))
        : h('p', { class: 'text-sm text-muted' }, K.skills().length ? 'Fixe un niveau actuel et un niveau visé à tes compétences pour voir où concentrer tes efforts.' : 'Ton référentiel est vide. Ajoute tes compétences (ou les suggestions) dans l’onglet Référentiel.')));
}

/* Barre 0–5 : niveau actuel plein, écart jusqu'à la cible hachuré. */
export function levelBar(level, target) {
  return h('div', { class: 'grid grid-cols-5 gap-1', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5].map(i => h('span', { class: 'h-2 rounded-sm ' + (level != null && i <= level ? 'bg-sk-ink' : target != null && i <= target ? 'bg-sk-ink/25' : 'bg-soft') })));
}
