/* Fiche d'un projet : vue d'ensemble, jalons, actions, journal, ressources. */
import { h, focusLater } from '../../core/dom.js';
import { normalizeUrl } from '../../core/utils.js';
import { todayKey, addDays, shortDate, dayLabel, daysBetween, minutesLabel } from '../../core/dates.js';
import { PROJECT_STATUS } from '../../data/defaults.js';
import { LAB_TEMPLATE, RESOURCE_KINDS, NOTE_KINDS } from '../../data/content/projectTemplates.js';
import { projectProgress, nextMilestone, overdueMilestones } from '../../domain/projects.js';
import { DURATIONS, stats } from '../../domain/planning.js';
import { CARD, BTN, BTN_SM, GHOST, DANGER, IN, LABEL, EYEBROW, H3 } from '../../ui/classes.js';
import { statusBadge, progressBar, emptyState, field, segmented, metric, linkChip, notice } from '../../ui/components.js';
import { taskRow } from '../../ui/tasks.js';
import { statusPill } from './list.js';

const TABS = [['overview', 'Vue d’ensemble'], ['milestones', 'Jalons'], ['actions', 'Actions'], ['journal', 'Journal'], ['resources', 'Ressources']];
const SMALL = 'rounded-md px-2 py-1 text-[12.5px] font-medium text-muted hover:bg-soft hover:text-ink transition cursor-pointer disabled:opacity-30 disabled:cursor-default';

function confirmBtn(ctx, key, label, onConfirm) {
  const on = ctx.ui.confirm === key;
  return h('button', { type: 'button', class: on ? DANGER : SMALL + ' hover:text-warn', onclick: () => { if (on) { ctx.ui.confirm = null; onConfirm(); } else { ctx.ui.confirm = key; ctx.render(); } } }, on ? 'Confirmer' : label);
}

/* Modèle de jalons proposé pour le laboratoire (ou tout projet dont le nom s'en approche), tant qu'il n'a aucun jalon. */
function templateCard(ctx, P, p) {
  if (!LAB_TEMPLATE.match.test(p.name) || P.milestonesOf(p.id).length) return null;
  return h('div', { class: CARD + ' grid gap-4 border-gold/40' },
    h('div', { class: 'flex flex-wrap items-center gap-2.5' }, h('h2', { class: H3 }, LAB_TEMPLATE.title), statusBadge('demo', 'Modèle proposé')),
    h('p', { class: 'text-sm text-muted' }, 'Sept jalons classiques pour monter un laboratoire de recherche quantitative. Ajoute-les, puis modifie, réordonne ou supprime ce qui ne te correspond pas.'),
    h('ol', { class: 'grid gap-2 text-sm' }, LAB_TEMPLATE.milestones.map(([t, d], i) => h('li', { class: 'grid grid-cols-[24px_1fr] gap-2' }, h('span', { class: 'font-mono text-xs text-muted pt-0.5' }, i + 1), h('div', {}, h('div', { class: 'font-medium' }, t), h('div', { class: 'text-[13px] text-muted' }, d))))),
    h('div', {}, h('button', { type: 'button', class: BTN, onclick: () => LAB_TEMPLATE.milestones.forEach(([title, detail]) => P.addMilestone(p.id, { title, detail })) }, 'Ajouter ces 7 jalons')));
}

function editForm(ctx, P, p) {
  const set = (k, v) => P.update(p.id, { [k]: v });
  const pr = projectProgress(p, P.milestones());
  return h('div', { class: CARD + ' grid gap-4' },
    h('h2', { class: H3 }, 'Informations du projet'),
    field('pe-name', 'Nom', h('input', { class: IN, id: 'pe-name', value: p.name, oninput: e => set('name', e.target.value) })),
    field('pe-desc', 'Description et objectif', h('textarea', { class: IN + ' min-h-[90px] leading-relaxed', id: 'pe-desc', rows: 3, placeholder: 'Pourquoi ce projet, ce qu’il doit produire, pour qui.', oninput: e => set('description', e.target.value) }, p.description || '')),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
      field('pe-cat', 'Catégorie', h('input', { class: IN, id: 'pe-cat', value: p.cat || '', placeholder: 'Recherche, data, perso…', oninput: e => set('cat', e.target.value) })),
      field('pe-status', 'Statut', h('select', { class: IN + ' cursor-pointer', id: 'pe-status', onchange: e => set('status', e.target.value) }, Object.entries(PROJECT_STATUS).map(([k, v]) => h('option', { value: k, selected: p.status === k }, v)))),
      field('pe-start', 'Début', h('input', { class: IN, id: 'pe-start', type: 'date', value: p.start || '', onchange: e => set('start', e.target.value) })),
      field('pe-end', 'Échéance', h('input', { class: IN, id: 'pe-end', type: 'date', value: p.end || '', onchange: e => set('end', e.target.value) }))),
    h('div', { class: 'grid gap-3 sm:grid-cols-2' },
      field('pe-link', 'Lien principal (dépôt, document…)', h('input', { class: IN, id: 'pe-link', value: p.link || '', placeholder: 'https://…', onchange: e => { const u = normalizeUrl(e.target.value); e.target.value = u; set('link', u); } })),
      field('pe-next', 'Prochaine étape (si pas de jalons)', h('input', { class: IN, id: 'pe-next', value: p.next || '', oninput: e => set('next', e.target.value) }))),
    h('div', { class: 'grid gap-2' },
      h('span', { class: LABEL }, 'Avancement'),
      segmented([['auto', 'Calculé avec les jalons'], ['manual', 'Saisi à la main']], p.progressMode || 'auto', k => { set('progressMode', k); ctx.render(true); }, 'Mode d’avancement'),
      (p.progressMode === 'manual') ? h('div', { class: 'flex items-center gap-3 max-w-md' },
        h('input', { id: 'pe-prog', type: 'range', min: 0, max: 100, step: 5, value: p.progress || 0, class: 'flex-1', style: 'accent-color:rgb(var(--pro-ink))', 'aria-label': 'Avancement en pourcentage',
          oninput: e => { set('progress', +e.target.value); document.getElementById('pe-prog-v').textContent = e.target.value + ' %'; } }),
        h('span', { class: 'font-mono text-xs tnum', id: 'pe-prog-v' }, (p.progress || 0) + ' %'))
        : h('p', { class: 'text-[13px] text-muted' }, pr.n ? `${pr.d} jalon${pr.d > 1 ? 's' : ''} atteint${pr.d > 1 ? 's' : ''} sur ${pr.n}.` : 'Ajoute des jalons pour que l’avancement se calcule.')),
    h('label', { class: 'flex items-center gap-3 text-sm cursor-pointer', 'data-c': 'pro' },
      h('input', { type: 'checkbox', class: 'chk', id: 'pe-main', checked: !!p.main, onchange: e => P.setMain(p.id, e.target.checked) }), 'Projet principal (mis en avant sur le tableau de bord)'),
    h('div', { class: 'flex flex-wrap gap-2 border-t border-line pt-4' },
      h('button', { type: 'button', class: BTN_SM, onclick: () => { ctx.ui.projEdit = false; ctx.render(); } }, 'Terminer'),
      confirmBtn(ctx, 'del-' + p.id, 'Supprimer le projet', () => P.remove(p.id))),
    ctx.ui.confirm === 'del-' + p.id ? h('p', { class: 'text-[13px] text-warn' }, 'Les jalons, le journal et les ressources seront supprimés. Les actions restent dans le Planning.') : null);
}

function overview(ctx, P, p) {
  const ms = P.milestones(), today = todayKey(), pr = projectProgress(p, ms), nm = nextMilestone(p, ms), late = overdueMilestones(p, ms, today);
  const tasks = P.tasksOf(p.id), st = stats(tasks), notes = P.notesOf(p.id).slice(0, 3);
  const left = p.end ? daysBetween(today, p.end) : null;
  return h('div', { class: 'grid gap-10' },
    ctx.ui.projEdit ? editForm(ctx, P, p) : null,
    h('div', { class: 'grid gap-x-8 gap-y-6 grid-cols-2 md:grid-cols-4', 'data-c': 'pro' },
      metric({ label: 'Avancement', value: Math.round(pr.p * 100) + ' %', p: pr.p, sub: pr.auto ? `${pr.d}/${pr.n} jalons` : 'saisi à la main', color: 'pro' }),
      metric({ label: 'Échéance', value: left == null ? '–' : left >= 0 ? `J-${left}` : 'Dépassée', sub: p.end ? dayLabel(p.end, { day: 'numeric', month: 'long', year: 'numeric' }) : 'non fixée', color: 'pro' }),
      metric({ label: 'Actions', value: `${st.d}/${st.n}`, sub: 'terminées', color: 'pro' }),
      metric({ label: 'Temps investi', value: minutesLabel(st.spent), sub: 'actions terminées', color: 'pro' })),
    templateCard(ctx, P, p),
    h('div', { class: 'grid gap-6 lg:grid-cols-2' },
      h('div', { class: CARD + ' grid gap-3 content-start' },
        h('h2', { class: H3 }, 'Objectif'),
        p.description ? h('p', { class: 'text-[15px] leading-relaxed whitespace-pre-line' }, p.description) : h('p', { class: 'text-sm text-muted' }, 'Pas encore de description. Clique sur « Modifier » pour écrire pourquoi ce projet existe et ce qu’il doit produire.'),
        p.link ? h('div', { class: 'pt-1' }, linkChip('Lien principal', p.link)) : null),
      h('div', { class: CARD + ' grid gap-3 content-start' },
        h('h2', { class: H3 }, 'Prochain pas'),
        nm ? h('div', {}, h('div', { class: 'font-medium' }, nm.title), h('div', { class: 'text-[13px] text-muted' }, [nm.due ? 'pour le ' + shortDate(nm.due) : 'sans date', nm.detail].filter(Boolean).join(' · ')))
          : h('p', { class: 'text-sm ' + (p.next ? '' : 'text-muted') }, p.next || 'Aucun jalon ouvert.'),
        late.length ? notice(`${late.length} jalon${late.length > 1 ? 's' : ''} en retard : ${late.map(m => m.title).join(', ')}.`, 'warn') : null,
        h('div', { class: 'flex flex-wrap gap-2 pt-1' },
          h('button', { type: 'button', class: GHOST, onclick: () => { ctx.ui.projTab = 'milestones'; ctx.render(); } }, 'Voir les jalons'),
          h('button', { type: 'button', class: GHOST, onclick: () => { ctx.ui.projTab = 'actions'; ctx.render(); } }, 'Planifier une action')))),
    h('div', { class: 'grid gap-3' },
      h('div', { class: 'flex items-end justify-between gap-3' }, h('h2', { class: H3 }, 'Journal récent'), h('button', { type: 'button', class: GHOST, onclick: () => { ctx.ui.projTab = 'journal'; ctx.render(); } }, 'Écrire dans le journal')),
      notes.length ? h('ul', { class: 'divide-y divide-line border-y border-line' }, notes.map(noteItem)) : h('p', { class: 'text-sm text-muted' }, 'Aucune note. Le journal garde la trace de tes décisions et de ce que tu apprends.')));
}

function milestones(ctx, P, p) {
  const list = P.milestonesOf(p.id), today = todayKey();
  let tIn, dIn, xIn;
  return h('div', { class: 'grid gap-8' },
    templateCard(ctx, P, p),
    h('form', { class: CARD + ' grid gap-3 grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_160px_minmax(0,1fr)_auto] items-end',
      onsubmit: e => { e.preventDefault(); const title = tIn.value.trim(); if (!title) return; P.addMilestone(p.id, { title, due: dIn.value || null, detail: xIn.value.trim() }); focusLater('ms-title', false); } },
      field('ms-title', 'Nouveau jalon', tIn = h('input', { class: IN, id: 'ms-title', autocomplete: 'off', placeholder: 'Ex. : premier jeu de données nettoyé' })),
      field('ms-due', 'Pour le', dIn = h('input', { class: IN, id: 'ms-due', type: 'date' })),
      field('ms-detail', 'Précision (facultatif)', xIn = h('input', { class: IN, id: 'ms-detail', autocomplete: 'off' })),
      h('button', { type: 'submit', class: BTN }, 'Ajouter')),
    list.length ? h('ol', { class: 'divide-y divide-line border-y border-line' }, list.map((m, i) => {
      const late = !m.done && m.due && m.due < today;
      return h('li', { class: 'flex items-start gap-3 py-4', 'data-c': 'pro' },
        h('span', { class: 'w-6 flex-none pt-0.5 font-mono text-xs text-muted' }, i + 1),
        h('input', { type: 'checkbox', class: 'chk mt-0.5', id: 'ms-' + m.id, checked: !!m.done, 'aria-label': (m.done ? 'Rouvrir ' : 'Marquer atteint : ') + m.title, onchange: () => P.toggleMilestone(m) }),
        h('div', { class: 'min-w-0 flex-1' },
          h('label', { for: 'ms-' + m.id, class: 'block cursor-pointer font-medium break-words ' + (m.done ? 'text-muted line-through decoration-muted/50' : '') }, m.title),
          h('div', { class: 'text-[12.5px] ' + (late ? 'text-warn' : 'text-muted') }, [m.due ? (late ? 'en retard · prévu le ' : 'pour le ') + shortDate(m.due) : null, m.done && m.doneAt ? 'atteint le ' + shortDate(m.doneAt.slice(0, 10)) : null, m.detail || null].filter(Boolean).join(' · '))),
        h('div', { class: 'flex flex-none gap-0.5' },
          h('button', { type: 'button', class: SMALL, disabled: i === 0, 'aria-label': 'Monter ' + m.title, onclick: () => P.moveMilestone(p.id, m, -1) }, '↑'),
          h('button', { type: 'button', class: SMALL, disabled: i === list.length - 1, 'aria-label': 'Descendre ' + m.title, onclick: () => P.moveMilestone(p.id, m, 1) }, '↓'),
          confirmBtn(ctx, 'ms-' + m.id, 'Supprimer', () => P.removeMilestone(m))));
    })) : emptyState('Aucun jalon. Découpe le projet en 4 à 8 étapes vérifiables, chacune avec une date.'));
}

function actions(ctx, P, p) {
  const all = P.tasksOf(p.id), open = all.filter(t => !t.done).sort((a, b) => (a.date || '9').localeCompare(b.date || '9')), done = all.filter(t => t.done);
  const today = todayKey();
  let tIn, mIn, wIn;
  const row = t => taskRow(t, { showDate: true, onToggle: () => P.toggleTask(t), actions: [['Supprimer', () => P.removeTask(t), 'Supprimer ' + t.title]] });
  return h('div', { class: 'grid gap-8' },
    h('p', { class: 'text-sm text-muted max-w-2xl' }, 'Les actions d’un projet apparaissent aussi dans le Planning, à leur date. Cocher ici ou là-bas revient au même.'),
    h('form', { class: CARD + ' grid gap-3 grid-cols-2 md:grid-cols-[minmax(0,2fr)_120px_150px_auto] items-end',
      onsubmit: e => { e.preventDefault(); const title = tIn.value.trim(); if (!title) return; P.addTask(p.id, { title, minutes: +mIn.value || 30, date: wIn.value === 'later' ? null : wIn.value }); focusLater('pa-title', false); } },
      h('div', { class: 'col-span-2 md:col-span-1' }, field('pa-title', 'Action', tIn = h('input', { class: IN, id: 'pa-title', autocomplete: 'off', placeholder: 'Ex. : tester l’API FRED en Python' }))),
      field('pa-min', 'Durée', mIn = h('select', { class: IN + ' cursor-pointer', id: 'pa-min' }, DURATIONS.map(m => h('option', { value: m, selected: m === 60 }, minutesLabel(m))))),
      field('pa-when', 'Quand', wIn = h('select', { class: IN + ' cursor-pointer', id: 'pa-when' }, h('option', { value: today }, 'Aujourd’hui'), h('option', { value: addDays(today, 1) }, 'Demain'), h('option', { value: 'later' }, 'À planifier'))),
      h('button', { type: 'submit', class: BTN + ' col-span-2 md:col-span-1' }, 'Ajouter')),
    h('div', { class: 'grid gap-3' }, h('h2', { class: H3 }, `À faire · ${open.length}`),
      open.length ? h('ul', { class: 'divide-y divide-line border-y border-line' }, open.map(row)) : h('p', { class: 'text-sm text-muted' }, 'Aucune action ouverte.')),
    done.length ? h('div', { class: 'grid gap-3' }, h('h2', { class: H3 }, `Terminées · ${done.length}`), h('ul', { class: 'divide-y divide-line border-y border-line' }, done.slice(0, 20).map(row))) : null);
}

function noteItem(n) {
  return h('li', { class: 'grid gap-1 py-3' },
    h('div', { class: 'flex flex-wrap items-center gap-2 text-[12.5px] text-muted' }, h('span', { class: 'font-mono' }, shortDate(n.date)), h('span', { class: 'rounded bg-soft px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wider' }, NOTE_KINDS[n.kind] || 'Note')),
    h('p', { class: 'text-[14.5px] leading-relaxed whitespace-pre-line break-words' }, n.text));
}

function journal(ctx, P, p) {
  const list = P.notesOf(p.id);
  let kIn, tIn;
  return h('div', { class: 'grid gap-8' },
    h('form', { class: CARD + ' grid gap-3', onsubmit: e => { e.preventDefault(); const text = tIn.value.trim(); if (!text) return; P.addNote(p.id, { kind: kIn.value, text }); } },
      h('div', { class: 'grid gap-3 sm:grid-cols-[180px_1fr]' },
        field('pj-kind', 'Type', kIn = h('select', { class: IN + ' cursor-pointer', id: 'pj-kind' }, Object.entries(NOTE_KINDS).map(([k, v]) => h('option', { value: k }, v)))),
        field('pj-text', 'Entrée du ' + shortDate(todayKey()), tIn = h('textarea', { class: IN + ' min-h-[90px] leading-relaxed', id: 'pj-text', rows: 3, placeholder: 'Ex. : choix de FRED plutôt que la BCE pour les taux, plus simple à automatiser.' }))),
      h('div', {}, h('button', { type: 'submit', class: BTN }, 'Ajouter au journal'))),
    list.length ? h('ul', { class: 'divide-y divide-line border-y border-line' }, list.map(n => {
      const li = noteItem(n);
      li.firstChild.append(h('span', { class: 'ml-auto' }, confirmBtn(ctx, 'nt-' + n.id, 'Supprimer', () => P.removeNote(n))));
      return li;
    })) : emptyState('Le journal est vide. Note tes décisions, tes blocages et ce que tu apprends : c’est la mémoire du projet.'));
}

function resources(ctx, P, p) {
  const list = P.resourcesOf(p.id);
  let tIn, uIn, kIn, err;
  return h('div', { class: 'grid gap-8' },
    h('form', { class: CARD + ' grid gap-3 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_170px_auto] items-end',
      onsubmit: e => { e.preventDefault(); const title = tIn.value.trim(), url = normalizeUrl(uIn.value);
        if (!title || (uIn.value.trim() && !url)) { err.textContent = !title ? 'Donne un titre à la ressource.' : 'Le lien doit commencer par http:// ou https://.'; err.hidden = false; return; }
        P.addResource(p.id, { title, url, kind: kIn.value }); focusLater('pr-title', false); } },
      field('pr-title', 'Titre', tIn = h('input', { class: IN, id: 'pr-title', autocomplete: 'off', placeholder: 'Ex. : FRED – séries économiques' })),
      field('pr-url', 'Lien (facultatif)', uIn = h('input', { class: IN, id: 'pr-url', autocomplete: 'off', placeholder: 'https://fred.stlouisfed.org' })),
      field('pr-kind', 'Type', kIn = h('select', { class: IN + ' cursor-pointer', id: 'pr-kind' }, Object.entries(RESOURCE_KINDS).map(([k, v]) => h('option', { value: k }, v)))),
      h('button', { type: 'submit', class: BTN }, 'Ajouter')),
    err = h('p', { class: 'text-sm text-warn -mt-6', role: 'alert', hidden: true }),
    list.length ? h('div', { class: 'grid gap-8' }, Object.entries(RESOURCE_KINDS).map(([k, label]) => {
      const items = list.filter(r => r.kind === k);
      return items.length ? h('section', { class: 'grid gap-2' }, h('h3', { class: EYEBROW }, `${label} · ${items.length}`),
        h('ul', { class: 'divide-y divide-line border-y border-line' }, items.map(r => h('li', { class: 'flex items-center gap-3 py-3' },
          h('div', { class: 'min-w-0 flex-1' }, r.url ? linkChip(r.title, r.url) : h('span', { class: 'font-medium' }, r.title), r.url ? h('div', { class: 'truncate text-[12px] text-muted' }, r.url) : null),
          confirmBtn(ctx, 'rs-' + r.id, 'Supprimer', () => P.removeResource(r)))))) : null;
    })) : emptyState('Aucune ressource. Range ici les papiers, jeux de données, outils et cours du projet.'),
    h('p', { class: 'text-[12.5px] text-muted' }, 'Les liens s’ouvrent dans un nouvel onglet. L’app ne lit pas le contenu des pages.'));
}

export default function detail(ctx, P, p) {
  const tab = TABS.some(t => t[0] === ctx.ui.projTab) ? ctx.ui.projTab : 'overview';
  const views = { overview, milestones, actions, journal, resources };
  return h('div', { class: 'view', 'data-c': 'pro' },
    h('button', { type: 'button', class: 'mb-6 text-[13px] font-medium text-muted hover:text-ink cursor-pointer', onclick: () => P.open(null) }, '← Tous les projets'),
    h('header', { class: 'mb-8 grid gap-4' },
      h('div', { class: 'flex flex-wrap items-center gap-2.5' }, h('span', { class: EYEBROW }, p.main ? 'Projet principal' : 'Projet'), statusPill(p), p.cat ? h('span', { class: 'text-[13px] text-muted' }, p.cat) : null),
      h('div', { class: 'flex flex-wrap items-end justify-between gap-5' },
        h('h1', { class: 'font-display text-[2.3rem] sm:text-[3rem] leading-[1.05] font-semibold break-words min-w-0' }, p.name || 'Sans titre'),
        ctx.ui.projEdit ? null : h('button', { type: 'button', class: GHOST, onclick: () => { ctx.ui.projEdit = true; ctx.ui.projTab = 'overview'; ctx.render(); focusLater('pe-name', false); } }, 'Modifier'))),
    h('div', { class: 'mb-10 border-b border-line pb-5' }, segmented(TABS, tab, k => { ctx.ui.projTab = k; ctx.ui.confirm = null; ctx.render(); }, 'Sections du projet')),
    views[tab](ctx, P, p));
}
