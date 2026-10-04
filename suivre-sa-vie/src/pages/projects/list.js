import { h } from '../../core/dom.js';
import { todayKey, shortDate } from '../../core/dates.js';
import { PROJECT_STATUS, PROJECT_STATUS_COLOR } from '../../data/defaults.js';
import { mainProject, projectProgress, nextMilestone, overdueMilestones } from '../../domain/projects.js';
import { CARD, BTN, EYEBROW, H3 } from '../../ui/classes.js';
import { pageHeader, statusBadge, progressBar, emptyState, segmented } from '../../ui/components.js';

export function statusPill(p) {
  return h('span', { 'data-c': PROJECT_STATUS_COLOR[p.status] || 'me', class: 'rounded-full bg-c px-2.5 py-0.5 text-xs font-medium text-ci' }, PROJECT_STATUS[p.status] || 'Idée');
}

export default function list(ctx, P) {
  const ui = ctx.ui, ms = P.milestones(), today = todayKey();
  const summary = p => {
    const pr = projectProgress(p, ms), nm = nextMilestone(p, ms), late = overdueMilestones(p, ms, today);
    return { pr, nm, late, next: nm ? nm.title : p.next };
  };

  const card = p => {
    const { pr, nm, late, next } = summary(p);
    return h('button', { type: 'button', onclick: () => P.open(p.id), 'data-c': 'pro',
      class: CARD + ' flex flex-col gap-3 text-left cursor-pointer hover:border-ink/30 transition' },
      h('div', { class: 'flex flex-wrap items-center gap-2' }, statusPill(p), p.cat ? h('span', { class: 'text-[13px] text-muted' }, p.cat) : null,
        late.length ? h('span', { class: 'text-[12px] font-medium text-warn' }, `${late.length} jalon${late.length > 1 ? 's' : ''} en retard`) : null),
      h('h3', { class: H3 + ' break-words' }, p.name || 'Sans titre'),
      h('div', { class: 'flex items-center gap-3' }, progressBar(pr.p, 'flex-1'), h('span', { class: 'font-mono text-xs text-muted tnum' }, pr.auto ? `${pr.d}/${pr.n} jalons` : Math.round(pr.p * 100) + ' %')),
      next ? h('div', { class: 'text-sm' }, h('div', { class: EYEBROW + ' mb-0.5' }, nm ? 'Prochain jalon' : 'Prochaine étape'), next, nm && nm.due ? h('span', { class: 'text-muted' }, ' · ' + shortDate(nm.due)) : null) : null,
      h('span', { class: 'mt-auto pt-1 text-[13px] font-medium text-muted' }, 'Ouvrir →'));
  };

  const mp = mainProject(ctx.state);
  const featured = mp ? (() => {
    const { pr, nm, late, next } = summary(mp);
    return h('button', { type: 'button', onclick: () => P.open(mp.id), 'data-c': 'pro', class: CARD + ' grid gap-4 text-left cursor-pointer hover:border-ink/30 transition' },
      h('div', { class: 'flex flex-wrap items-center gap-2.5' }, h('span', { class: EYEBROW }, 'Projet principal'), statusPill(mp), mp.cat ? h('span', { class: 'text-[13px] text-muted' }, mp.cat) : null),
      h('h2', { class: 'font-display text-[2rem] leading-tight font-semibold break-words' }, mp.name || 'Sans titre'),
      mp.description ? h('p', { class: 'max-w-2xl text-sm text-muted line-clamp-2' }, mp.description) : null,
      h('div', { class: 'flex items-center gap-3 max-w-lg' }, progressBar(pr.p, 'flex-1'), h('span', { class: 'font-mono text-xs text-muted tnum' }, pr.auto ? `${pr.d}/${pr.n} jalons` : Math.round(pr.p * 100) + ' %')),
      h('p', { class: 'text-sm ' + (next ? '' : 'text-muted') }, next ? (nm ? 'Prochain jalon : ' : 'Prochaine étape : ') + next : 'Aucun jalon pour l’instant. Ouvre le projet pour en ajouter.'),
      late.length ? h('p', { class: 'text-sm text-warn' }, `${late.length} jalon${late.length > 1 ? 's' : ''} en retard`) : null,
      h('span', { class: 'text-[13px] font-medium text-muted' }, 'Ouvrir le projet →'));
  })() : null;

  const others = P.list().filter(p => !p.main);
  const shown = others.filter(p => ui.projFilter === 'all' || p.status === ui.projFilter);
  const counts = k => k === 'all' ? others.length : others.filter(p => p.status === k).length;

  return h('div', { class: 'view grid gap-10', 'data-c': 'pro' },
    h('div', {}, pageHeader({ eyebrow: 'Vie & projets', title: 'Projets', lead: 'Tes projets, leurs jalons, les actions qui les font avancer et un journal de bord.', badges: [statusBadge('live')],
      actions: h('button', { type: 'button', class: BTN, onclick: P.create }, '+ Nouveau projet') }), featured),
    h('div', { class: 'grid gap-5' },
      h('div', { class: 'flex flex-wrap items-end justify-between gap-3' }, h('h2', { class: H3 }, 'Autres projets'),
        segmented([['all', 'Tous · ' + counts('all')]].concat(Object.entries(PROJECT_STATUS).map(([k, v]) => [k, v + ' · ' + counts(k)])), ui.projFilter, k => { ui.projFilter = k; ctx.render(); }, 'Filtrer par statut')),
      shown.length ? h('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' }, shown.map(card))
        : emptyState(others.length ? 'Aucun projet avec ce statut.' : 'Aucun autre projet pour l’instant. Clique sur « + Nouveau projet » pour en ajouter un.')));
}
