import { h } from '../core/dom.js';
import { longDate, percent } from '../core/format.js';
import { TRACKS } from '../data/content/tracks.js';
import { PROJECT_STATUS } from '../data/defaults.js';
import { trackProgress, allSkillsProgress, nextActions } from '../domain/progress.js';
import { budgetSummary } from '../domain/budget.js';
import { mainProject } from '../domain/projects.js';
import { routeOfTrack } from '../config/modules.js';
import { CARD, GHOST, BTN_SM, EYEBROW, H2 } from '../ui/classes.js';
import { pageHeader, section, metric, progressBar, emptyState, statusBadge } from '../ui/components.js';

export default function dashboard(ctx) {
  const S = ctx.state, p = S.profile;
  const facts = [['education', 'Éducation'], ['status', 'Statut'], ['city', 'Ville / pays'], ['languages', 'Langues']].filter(([k]) => p[k]);

  const header = pageHeader({
    eyebrow: longDate(new Date()),
    title: `Bonjour ${p.name || 'toi'}.`,
    lead: p.headline || 'Voici où tu en es : études, argent, compétences, style et projets.',
    actions: h('button', { type: 'button', class: GHOST, onclick: () => ctx.go('system') }, 'Modifier le profil'),
  });

  const mp = mainProject(S);
  const main = mp
    ? h('div', { class: CARD + ' grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end', 'data-c': 'pro' },
        h('div', { class: 'grid gap-3 min-w-0' },
          h('div', { class: 'flex flex-wrap items-center gap-2.5' }, h('span', { class: EYEBROW }, 'Projet principal'), h('span', { class: 'text-[13px] text-muted' }, '· ' + (PROJECT_STATUS[mp.status] || 'Idée'))),
          h('h2', { class: H2 + ' break-words' }, mp.name || 'Sans titre'),
          h('div', { class: 'flex items-center gap-3 max-w-md' }, progressBar((mp.progress || 0) / 100, 'flex-1'), h('span', { class: 'font-mono text-xs text-muted tnum' }, (mp.progress || 0) + ' %')),
          h('p', { class: 'text-sm ' + (mp.next ? '' : 'text-muted') }, mp.next ? 'Prochaine étape : ' + mp.next : 'Aucune prochaine étape définie.')),
        h('button', { type: 'button', class: BTN_SM, onclick: () => ctx.go('projects') }, 'Ouvrir le projet'))
    : emptyState('Aucun projet principal. Choisis-en un dans Projets.', h('button', { type: 'button', class: GHOST, onclick: () => ctx.go('projects') }, 'Aller aux projets'));

  const skills = allSkillsProgress(S), bc = budgetSummary(S.budget);
  const metrics = h('div', { class: 'grid gap-x-8 gap-y-8 grid-cols-2 md:grid-cols-3' },
    TRACKS.map(tr => { const q = trackProgress(S, tr); return metric({ label: tr.title, value: `${q.d}/${q.n}`, p: q.p, color: 'edu', sub: 'étapes franchies', onClick: () => ctx.go(routeOfTrack(tr.id)) }); }),
    metric({ label: 'Compétences', value: `${skills.d}/${skills.n}`, p: skills.p, color: 'sk', sub: 'modules terminés', onClick: () => ctx.go('skills') }),
    metric({ label: 'Taux d’épargne', value: bc.sal ? percent(bc.saveRate) : '–', p: bc.sal ? bc.saveRate / 0.2 : null, color: 'fin', sub: bc.sal ? 'objectif : 20 %' : 'salaire non renseigné', onClick: () => ctx.go('finance') }),
    metric({ label: 'Projets en cours', value: S.projects.filter(x => x.status === 'cours').length, color: 'pro', sub: `${S.projects.length} au total`, onClick: () => ctx.go('projects') }));

  const nexts = nextActions(S, routeOfTrack);
  const actions = nexts.length
    ? h('ul', { class: 'divide-y divide-line border-y border-line' }, nexts.slice(0, 7).map(n => h('li', {},
        h('button', { type: 'button', 'data-c': n.c, onclick: () => ctx.go(n.route), class: 'group flex w-full items-center gap-4 py-3.5 text-left cursor-pointer' },
          h('span', { class: 'grid h-9 w-12 flex-none place-items-center rounded-md bg-c font-mono text-[10.5px] font-medium text-ci' }, n.tag),
          h('span', { class: 'min-w-0 flex-1' }, h('span', { class: 'block font-medium' }, n.t), h('span', { class: 'block text-[13px] text-muted' }, n.sub)),
          h('span', { class: 'text-muted group-hover:text-ink group-hover:translate-x-0.5 transition', 'aria-hidden': 'true' }, '→')))))
    : emptyState('Tout est coché. Ajoute un projet ou une nouvelle étape.');

  return h('div', { class: 'view grid gap-14' },
    h('div', {}, header,
      facts.length ? h('dl', { class: '-mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm' }, facts.map(([k, l]) => h('div', { class: 'flex gap-2' }, h('dt', { class: 'text-muted' }, l), h('dd', { class: 'font-medium' }, p[k])))) : null),
    main,
    section('Vue d’ensemble', 'Clique sur un chiffre pour ouvrir le module.', metrics),
    section('Prochaines actions', null,
      h('div', { class: 'flex flex-wrap items-center gap-2 -mt-3' }, statusBadge('live', 'Règle simple'), h('span', { class: 'text-[13px] text-muted' }, 'Première étape non cochée de chaque parcours et formation. Les recommandations par IA viendront avec l’Assistant.')),
      actions),
    p.motto ? h('p', { class: 'font-display text-2xl italic text-muted' }, '« ' + p.motto + ' »') : null);
}
