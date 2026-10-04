import { h, focusLater } from '../core/dom.js';
import { uid, normalizeUrl } from '../core/utils.js';
import { PROJECT_STATUS, PROJECT_STATUS_COLOR, newProject } from '../data/defaults.js';
import { mainProject, setMainProject } from '../domain/projects.js';
import { CARD, BTN, BTN_SM, GHOST, DANGER, IN, LABEL, EYEBROW, H3 } from '../ui/classes.js';
import { pageHeader, statusBadge, progressBar, emptyState, field, segmented } from '../ui/components.js';

export default function projects(ctx) {
  const S = ctx.state, ui = ctx.ui;
  const list = S.projects.filter(p => !p.main && (ui.projFilter === 'all' || p.status === ui.projFilter));

  const editor = p => h('div', { class: CARD + ' grid gap-4 border-pro-ink/40' },
    field('pn-' + p.id, 'Nom du projet', h('input', { class: IN, id: 'pn-' + p.id, value: p.name, oninput: e => { p.name = e.target.value; ctx.commit(); } })),
    h('div', { class: 'grid gap-4 sm:grid-cols-2' },
      field('pc-' + p.id, 'Catégorie', h('input', { class: IN, id: 'pc-' + p.id, value: p.cat || '', placeholder: 'Data, finance, perso…', oninput: e => { p.cat = e.target.value; ctx.commit(); } })),
      field('ps-' + p.id, 'Statut', h('select', { class: IN + ' cursor-pointer', id: 'ps-' + p.id, onchange: e => { p.status = e.target.value; ctx.commit(); } }, Object.entries(PROJECT_STATUS).map(([k, v]) => h('option', { value: k, selected: p.status === k }, v))))),
    h('div', { class: 'grid gap-1.5' }, h('label', { class: LABEL, for: 'pp-' + p.id }, 'Avancement : ', h('span', { class: 'font-mono', id: 'ppv-' + p.id }, (p.progress || 0) + ' %')),
      h('input', { id: 'pp-' + p.id, type: 'range', min: 0, max: 100, step: 5, value: p.progress || 0, class: 'w-full', style: 'accent-color:rgb(var(--pro-ink))',
        oninput: e => { p.progress = +e.target.value; document.getElementById('ppv-' + p.id).textContent = p.progress + ' %'; ctx.commit(); } })),
    field('px-' + p.id, 'Prochaine étape', h('input', { class: IN, id: 'px-' + p.id, value: p.next || '', oninput: e => { p.next = e.target.value; ctx.commit(); } })),
    field('pl-' + p.id, 'Lien', h('input', { class: IN, id: 'pl-' + p.id, value: p.link || '', placeholder: 'https://…', onchange: e => { p.link = normalizeUrl(e.target.value); e.target.value = p.link; ctx.commit(); } })),
    h('label', { class: 'flex items-center gap-3 text-sm cursor-pointer', 'data-c': 'pro' },
      h('input', { type: 'checkbox', class: 'chk', id: 'pm-' + p.id, checked: !!p.main, onchange: e => { if (e.target.checked) setMainProject(S, p.id); else p.main = false; ctx.commit(); } }),
      'Projet principal (mis en avant sur le tableau de bord)'),
    h('div', { class: 'flex flex-wrap gap-2 pt-1' },
      h('button', { type: 'button', class: BTN_SM, onclick: () => { ui.editProj = null; ctx.render(); } }, 'Terminer'),
      h('button', { type: 'button', class: DANGER, onclick: () => {
        if (ui.confirm === p.id) { ui.editProj = null; ui.confirm = null; ctx.update(st => { st.projects = st.projects.filter(x => x.id !== p.id); }); }
        else { ui.confirm = p.id; ctx.render(); }
      } }, ui.confirm === p.id ? 'Confirmer la suppression' : 'Supprimer')));

  const card = p => {
    if (ui.editProj === p.id) return editor(p);
    const link = normalizeUrl(p.link);
    return h('article', { 'data-c': PROJECT_STATUS_COLOR[p.status] || 'me', class: CARD + ' flex flex-col gap-3' },
      h('div', { class: 'flex flex-wrap items-center gap-2' }, h('span', { class: 'rounded-full bg-c px-2.5 py-0.5 text-xs font-medium text-ci' }, PROJECT_STATUS[p.status] || 'Idée'), p.cat ? h('span', { class: 'text-[13px] text-muted' }, p.cat) : null),
      h('h3', { class: H3 + ' break-words' }, p.name || 'Sans titre'),
      h('div', { class: 'flex items-center gap-3', 'data-c': 'pro' }, progressBar((p.progress || 0) / 100, 'flex-1'), h('span', { class: 'font-mono text-xs text-muted tnum' }, (p.progress || 0) + ' %')),
      p.next ? h('div', { class: 'text-sm' }, h('div', { class: EYEBROW + ' mb-0.5' }, 'Prochaine étape'), p.next) : null,
      h('div', { class: 'mt-auto flex flex-wrap gap-2 pt-2' },
        h('button', { type: 'button', class: GHOST, onclick: () => { ui.editProj = p.id; ui.confirm = null; ctx.render(); focusLater('pn-' + p.id, false); } }, 'Modifier'),
        link ? h('a', { class: GHOST, href: link, target: '_blank', rel: 'noopener' }, 'Ouvrir ↗') : null));
  };

  const mp = mainProject(S);
  const featured = mp ? (ui.editProj === mp.id ? editor(mp) : h('div', { class: CARD + ' grid gap-4', 'data-c': 'pro' },
    h('div', { class: 'flex flex-wrap items-center gap-2.5' }, h('span', { class: EYEBROW }, 'Projet principal'), h('span', { class: 'rounded-full bg-c px-2.5 py-0.5 text-xs font-medium text-ci' }, PROJECT_STATUS[mp.status] || 'Idée'), mp.cat ? h('span', { class: 'text-[13px] text-muted' }, mp.cat) : null),
    h('h2', { class: 'font-display text-[2rem] leading-tight font-semibold break-words' }, mp.name || 'Sans titre'),
    h('div', { class: 'flex items-center gap-3 max-w-lg' }, progressBar((mp.progress || 0) / 100, 'flex-1'), h('span', { class: 'font-mono text-xs text-muted tnum' }, (mp.progress || 0) + ' %')),
    h('p', { class: 'text-sm ' + (mp.next ? '' : 'text-muted') }, mp.next ? 'Prochaine étape : ' + mp.next : 'Aucune prochaine étape. Clique sur Modifier pour en ajouter une.'),
    h('p', { class: 'text-[13px] text-muted' }, 'Le découpage en jalons, tâches et ressources de recherche arrivera avec les modules Planning et Recherche.'),
    h('div', { class: 'flex flex-wrap gap-2' }, h('button', { type: 'button', class: GHOST, onclick: () => { ui.editProj = mp.id; ui.confirm = null; ctx.render(); } }, 'Modifier'),
      normalizeUrl(mp.link) ? h('a', { class: GHOST, href: normalizeUrl(mp.link), target: '_blank', rel: 'noopener' }, 'Ouvrir ↗') : null))) : null;

  const others = S.projects.filter(p => !p.main);
  const counts = k => k === 'all' ? others.length : others.filter(p => p.status === k).length;

  return h('div', { class: 'view grid gap-10', 'data-c': 'pro' },
    h('div', {}, pageHeader({ eyebrow: 'Vie & projets', title: 'Projets', lead: 'Tout ce que tu construis, avec la prochaine étape de chaque projet.', badges: [statusBadge('live')],
      actions: h('button', { type: 'button', class: BTN, onclick: () => { const id = 'p' + uid(); ui.editProj = id; ui.projFilter = 'all'; ctx.update(st => { st.projects.push(newProject(id)); }); focusLater('pn-' + id); } }, '+ Nouveau projet') }),
      featured),
    h('div', { class: 'grid gap-5' },
      h('div', { class: 'flex flex-wrap items-end justify-between gap-3' }, h('h2', { class: H3 }, 'Autres projets'),
        segmented([['all', 'Tous · ' + counts('all')]].concat(Object.entries(PROJECT_STATUS).map(([k, v]) => [k, v + ' · ' + counts(k)])), ui.projFilter, k => { ui.projFilter = k; ctx.render(); }, 'Filtrer par statut')),
      list.length ? h('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' }, list.map(card))
        : emptyState(others.length ? 'Aucun projet avec ce statut.' : 'Aucun autre projet pour l’instant. Clique sur « + Nouveau projet » pour en ajouter un.')));
}
