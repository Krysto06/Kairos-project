import { h } from '../../core/dom.js';
import { todayKey, shortDate } from '../../core/dates.js';
import { HORIZONS, goalProgress, parentCandidates } from '../../domain/planning.js';
import { MODULES, moduleById } from '../../config/modules.js';
import { CARD, BTN, IN, H3, EYEBROW, DANGER } from '../../ui/classes.js';
import { field, progressBar, emptyState } from '../../ui/components.js';
import { taskForm } from '../../ui/tasks.js';

const LINKABLE = MODULES.filter(m => m.status === 'live' && m.id !== 'dashboard' && m.id !== 'planning');

export default function goals(ctx, P) {
  const ui = ctx.ui, all = P.allGoals(), tasks = P.allTasks();
  const draft = ui.goalDraft || (ui.goalDraft = { horizon: 'trimestre' });

  let tIn, pIn, mIn, dIn;
  const parents = parentCandidates(all, draft.horizon);
  const form = h('form', { class: CARD + ' grid gap-4',
    onsubmit: e => {
      e.preventDefault();
      const title = tIn.value.trim(); if (!title) return;
      ui.goalDraft = { horizon: draft.horizon };
      P.addGoal({ title, horizon: draft.horizon, parentId: pIn.value || null, module: mIn.value || null, due: dIn.value || null });
    } },
    h('h2', { class: H3 }, 'Nouvel objectif'),
    field('goal-title', 'Objectif', tIn = h('input', { class: IN, id: 'goal-title', value: draft.title || '', oninput: e => { draft.title = e.target.value; }, placeholder: 'Ex. : 165+ en Quantitative Reasoning au GRE', autocomplete: 'off' })),
    h('div', { class: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4' },
      field('goal-h', 'Horizon', h('select', { class: IN + ' cursor-pointer', id: 'goal-h', onchange: e => { draft.horizon = e.target.value; ctx.render(true); } },
        Object.entries(HORIZONS).map(([k, v]) => h('option', { value: k, selected: draft.horizon === k }, v)))),
      field('goal-p', 'Contribue à', pIn = h('select', { class: IN + ' cursor-pointer', id: 'goal-p', disabled: !parents.length },
        h('option', { value: '' }, parents.length ? 'Aucun objectif parent' : 'Aucun parent possible'), parents.map(g => h('option', { value: g.id }, `${HORIZONS[g.horizon]} · ${g.title}`)))),
      field('goal-m', 'Module', mIn = h('select', { class: IN + ' cursor-pointer', id: 'goal-m', onchange: e => { draft.module = e.target.value; } }, h('option', { value: '' }, 'Aucun'), LINKABLE.map(m => h('option', { value: m.id, selected: draft.module === m.id }, m.label)))),
      field('goal-d', 'Échéance', dIn = h('input', { class: IN, id: 'goal-d', type: 'date', min: todayKey(), value: draft.due || '', onchange: e => { draft.due = e.target.value; } }))),
    h('div', {}, h('button', { type: 'submit', class: BTN }, 'Créer l’objectif')));

  const card = g => {
    const pr = goalProgress(all, tasks, g.id), parent = g.parentId && all.find(x => x.id === g.parentId), mod = g.module && moduleById(g.module);
    const confirming = ui.goalConfirm === g.id, adding = ui.goalAdd === g.id;
    const meta = [parent ? 'Contribue à : ' + parent.title : null, mod ? mod.label : null, g.due ? 'Échéance ' + shortDate(g.due) : null].filter(Boolean);
    return h('li', { class: 'grid gap-3 py-5', 'data-c': mod ? mod.color : 'me' },
      h('div', { class: 'flex items-start gap-3' },
        h('input', { type: 'checkbox', class: 'chk mt-1', id: 'gl-' + g.id, checked: !!g.done, 'aria-label': (g.done ? 'Rouvrir ' : 'Marquer atteint : ') + g.title, onchange: () => P.patchGoal(g.id, { done: !g.done }) }),
        h('div', { class: 'min-w-0 flex-1' },
          h('label', { for: 'gl-' + g.id, class: 'block cursor-pointer font-display text-[1.3rem] leading-snug font-semibold break-words ' + (g.done ? 'text-muted line-through decoration-muted/40' : '') }, g.title),
          meta.length ? h('div', { class: 'mt-0.5 text-[12.5px] text-muted' }, meta.join(' · ')) : null),
        h('div', { class: 'flex flex-none gap-1' },
          g.done ? null : h('button', { type: 'button', class: 'rounded-md px-2 py-1 text-[12.5px] font-medium text-muted hover:bg-soft hover:text-ink cursor-pointer', 'aria-expanded': adding, onclick: () => { ui.goalAdd = adding ? null : g.id; ctx.render(); } }, adding ? 'Fermer' : '+ Action'),
          h('button', { type: 'button', class: confirming ? DANGER : 'rounded-md px-2 py-1 text-[12.5px] font-medium text-muted hover:bg-soft hover:text-warn cursor-pointer',
            onclick: () => { if (confirming) { ui.goalConfirm = null; P.removeGoal(g.id); } else { ui.goalConfirm = g.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer'))),
      h('div', { class: 'flex items-center gap-3 pl-[30px]' }, progressBar(pr.p, 'flex-1 max-w-sm'),
        h('span', { class: 'font-mono text-xs text-muted tnum' }, pr.n ? `${pr.d}/${pr.n} actions` : 'aucune action liée')),
      adding ? h('div', { class: 'pl-[30px]' }, taskForm({ id: 'ga-' + g.id, goalId: g.id, submitLabel: 'Ajouter aujourd’hui', onAdd: f => P.addTask({ ...f, module: g.module || null }) })) : null);
  };

  const groups = Object.entries(HORIZONS).map(([k, label]) => {
    const list = all.filter(g => g.horizon === k).sort((a, b) => a.done - b.done);
    return list.length ? h('section', { class: 'grid gap-1' }, h('h3', { class: EYEBROW }, `${label} · ${list.length}`), h('ul', { class: 'divide-y divide-line border-y border-line' }, list.map(card))) : null;
  }).filter(Boolean);

  return h('div', { class: 'grid gap-10' },
    h('p', { class: 'max-w-2xl text-[15px] text-muted' }, 'Découpe chaque ambition du long terme jusqu’à la semaine, puis rattache-lui des actions datées. La progression d’un objectif se mesure par les actions terminées, les siennes et celles de ses sous-objectifs.'),
    form,
    groups.length ? h('div', { class: 'grid gap-10' }, groups) : emptyState('Aucun objectif pour l’instant. Commence par un objectif à long terme, par exemple l’admission en master.'));
}
