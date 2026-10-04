import { h, focusLater } from '../../core/dom.js';
import { shortDate, todayKey, minutesLabel } from '../../core/dates.js';
import { COURSE_KINDS, COURSE_STATUS, COURSE_STATUS_COLOR } from '../../data/content/skills.js';
import { courseProgress } from '../../domain/progress.js';
import { CARD, BTN, BTN_SM, GHOST, DANGER, IN, H3, EYEBROW } from '../../ui/classes.js';
import { field, emptyState, segmented, progressBar, ring, linkChip } from '../../ui/components.js';

const SMALL = 'rounded-md px-2 py-1 text-[12.5px] font-medium text-muted hover:bg-soft hover:text-ink transition cursor-pointer disabled:opacity-30 disabled:cursor-default';
const pill = c => h('span', { 'data-c': COURSE_STATUS_COLOR[c.status] || 'me', class: 'rounded-full bg-c px-2.5 py-0.5 text-xs font-medium text-ci' }, COURSE_STATUS[c.status] || '');

const DAYS = [[1, 'L'], [2, 'M'], [3, 'M'], [4, 'J'], [5, 'V'], [6, 'S'], [7, 'D']];
const DAY_NAMES = ['', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/* Rythme de travail : jours de la semaine et durée par séance. Sert au Planning. */
function scheduleField(ctx, K, c) {
  const sc = c.schedule || { days: [], minutes: 60 };
  const save = next => { K.updateCourse(c.id, { schedule: next }); ctx.render(); };
  return h('div', { class: 'grid gap-2' },
    h('span', { class: 'text-xs font-medium text-muted' }, 'Rythme de travail (pour le Planning)'),
    h('div', { class: 'flex flex-wrap items-center gap-3' },
      h('div', { class: 'flex gap-1', role: 'group', 'aria-label': 'Jours de travail' }, DAYS.map(([d, l]) => { const on = sc.days.includes(d); return h('button', { type: 'button', 'aria-pressed': on, title: DAY_NAMES[d],
        class: 'grid h-8 w-8 place-items-center rounded-md border text-[12px] font-medium transition cursor-pointer ' + (on ? 'border-sk-ink bg-sk-ink text-surface' : 'border-line text-muted hover:border-sk-ink/50'),
        onclick: () => save({ ...sc, days: on ? sc.days.filter(x => x !== d) : sc.days.concat(d).sort() }) }, l); })),
      h('select', { class: IN.replace('w-full', 'w-auto') + ' cursor-pointer py-1.5', id: 'co-sched-min', 'aria-label': 'Durée par séance', onchange: e => save({ ...sc, minutes: +e.target.value }) },
        [30, 45, 60, 90, 120].map(v => h('option', { value: v, selected: sc.minutes === v }, minutesLabel(v) + ' par séance'))),
      h('span', { class: 'text-[12.5px] text-muted' }, sc.days.length ? `${minutesLabel(sc.days.length * sc.minutes)} par semaine` : 'aucun jour fixé')));
}

function editor(ctx, K, c) {
  const ui = ctx.ui, set = (k, v) => K.updateCourse(c.id, { [k]: v }), today = todayKey();
  let mIn, dIn;
  return h('article', { class: CARD + ' grid gap-6', 'data-c': 'sk' },
    h('div', { class: 'flex flex-wrap items-center justify-between gap-3' }, h('div', { class: 'flex items-center gap-2.5' }, pill(c), h('span', { class: 'text-[13px] text-muted' }, COURSE_KINDS[c.kind])),
      h('button', { type: 'button', class: BTN_SM, onclick: () => { ui.skOpen = null; ctx.render(); } }, 'Fermer')),
    h('div', { class: 'grid gap-3' },
      field('co-title', 'Intitulé', h('input', { class: IN, id: 'co-title', value: c.title, oninput: e => set('title', e.target.value) })),
      field('co-sub', 'Description courte', h('input', { class: IN, id: 'co-sub', value: c.sub || '', oninput: e => set('sub', e.target.value) })),
      h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-4' },
        field('co-kind', 'Type', h('select', { class: IN + ' cursor-pointer', id: 'co-kind', onchange: e => set('kind', e.target.value) }, Object.entries(COURSE_KINDS).map(([k, v]) => h('option', { value: k, selected: c.kind === k }, v)))),
        field('co-status', 'Statut', h('select', { class: IN + ' cursor-pointer', id: 'co-status', onchange: e => { set('status', e.target.value); ctx.render(); } }, Object.entries(COURSE_STATUS).map(([k, v]) => h('option', { value: k, selected: c.status === k }, v)))),
        field('co-prov', 'Organisme', h('input', { class: IN, id: 'co-prov', value: c.provider || '', placeholder: 'Ex. : CFA Institute, Coursera', oninput: e => set('provider', e.target.value) })),
        field('co-target', c.kind === 'certification' ? 'Date de l’examen' : 'Pour le', h('input', { class: IN, id: 'co-target', type: 'date', value: c.target || '', onchange: e => set('target', e.target.value) }))),
      scheduleField(ctx, K, c),
      field('co-url', 'Lien de la formation', h('input', { class: IN, id: 'co-url', value: c.url || '', placeholder: 'https://…', onchange: e => { set('url', e.target.value); e.target.value = K.course(c.id).url; } }))),
    h('div', { class: 'grid gap-3' },
      h('h3', { class: EYEBROW }, `Modules · ${c.mods.filter(m => m.done).length}/${c.mods.length}`),
      c.mods.length ? h('ol', { class: 'divide-y divide-line border-y border-line' }, c.mods.map((m, i) => h('li', { class: 'flex items-start gap-3 py-2.5' },
        h('input', { type: 'checkbox', class: 'chk mt-0.5', id: 'mo-' + m.id, checked: m.done, onchange: () => K.toggleModule(c.id, m.id) }),
        h('label', { for: 'mo-' + m.id, class: 'min-w-0 flex-1 cursor-pointer text-sm ' + (m.done ? 'text-muted line-through decoration-muted/50' : 'font-medium') }, m.t,
          m.start ? h('small', { class: 'block text-xs font-normal ' + (!m.done && m.start <= today && today <= m.end ? 'text-sk-ink font-medium' : 'text-muted') }, `${shortDate(m.start)} → ${shortDate(m.end)}` + (!m.done && m.start <= today && today <= m.end ? ' · en ce moment' : '')) : null,
          m.d ? h('small', { class: 'block text-xs font-normal text-muted no-underline' }, m.d) : null),
        h('div', { class: 'flex flex-none gap-0.5' },
          h('button', { type: 'button', class: SMALL, disabled: i === 0, 'aria-label': 'Monter ' + m.t, onclick: () => K.moveModule(c.id, m.id, -1) }, '↑'),
          h('button', { type: 'button', class: SMALL, disabled: i === c.mods.length - 1, 'aria-label': 'Descendre ' + m.t, onclick: () => K.moveModule(c.id, m.id, 1) }, '↓'),
          h('button', { type: 'button', class: SMALL + ' hover:text-warn', 'aria-label': 'Supprimer ' + m.t, onclick: () => K.removeModule(c.id, m.id) }, '✕'))))) : null,
      h('form', { class: 'grid gap-2 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end', onsubmit: e => { e.preventDefault(); const t = mIn.value.trim(); if (!t) return; K.addModule(c.id, t, dIn.value.trim()); focusLater('mo-new', false); } },
        field('mo-new', 'Nouveau module', mIn = h('input', { class: IN, id: 'mo-new', autocomplete: 'off', placeholder: 'Ex. : Fixed Income – duration' })),
        field('mo-new-d', 'Contenu (facultatif)', dIn = h('input', { class: IN, id: 'mo-new-d', autocomplete: 'off' })),
        h('button', { type: 'submit', class: BTN }, 'Ajouter'))),
    (c.links || []).length ? h('div', { class: 'flex flex-wrap gap-x-4 gap-y-1.5' }, c.links.map(([l, u]) => linkChip(l, u))) : null,
    h('div', { class: 'border-t border-line pt-4' }, ui.confirm === 'co-' + c.id
      ? h('button', { type: 'button', class: DANGER, onclick: () => { ui.confirm = null; ui.skOpen = null; K.removeCourse(c.id); } }, 'Confirmer la suppression de la formation')
      : h('button', { type: 'button', class: 'text-[13px] font-medium text-muted hover:text-warn cursor-pointer', onclick: () => { ui.confirm = 'co-' + c.id; ctx.render(); } }, 'Supprimer la formation')));
}

export default function courses(ctx, K) {
  const ui = ctx.ui, list = K.courses(), filter = ui.skFilter || 'all';
  const shown = filter === 'all' ? list : list.filter(c => c.status === filter);
  const card = c => {
    if (ui.skOpen === c.id) return editor(ctx, K, c);
    const pr = courseProgress(c), next = c.mods.find(m => !m.done);
    return h('button', { type: 'button', 'data-c': 'sk', onclick: () => { ui.skOpen = c.id; ui.confirm = null; ctx.render(); }, class: CARD + ' flex flex-col gap-4 text-left cursor-pointer hover:border-ink/30 transition' },
      h('div', { class: 'flex items-center gap-4' }, ring(pr.p, 'sk-ink', 46),
        h('div', { class: 'min-w-0' }, h('h3', { class: H3 + ' break-words' }, c.title), h('div', { class: 'text-[13px] text-muted' }, [COURSE_KINDS[c.kind], c.provider, c.cost, `${pr.d}/${pr.n} modules`].filter(Boolean).join(' · ')))),
      h('div', { class: 'flex flex-wrap items-center gap-2' }, pill(c), c.target ? h('span', { class: 'text-[12.5px] text-muted' }, (c.kind === 'certification' ? 'examen le ' : 'pour le ') + shortDate(c.target)) : null),
      next && c.status !== 'fini' ? h('p', { class: 'text-sm' }, h('span', { class: 'text-muted' }, 'Prochain module : '), next.t) : null,
      h('span', { class: 'mt-auto text-[13px] font-medium text-muted' }, 'Ouvrir →'));
  };
  const counts = k => k === 'all' ? list.length : list.filter(c => c.status === k).length;
  return h('div', { class: 'grid gap-8' },
    h('div', { class: 'flex flex-wrap items-end justify-between gap-3' },
      segmented([['all', 'Toutes · ' + counts('all')]].concat(Object.entries(COURSE_STATUS).map(([k, v]) => [k, v + ' · ' + counts(k)])), filter, k => { ui.skFilter = k; ctx.render(); }, 'Filtrer les formations'),
      h('button', { type: 'button', class: BTN, onclick: () => { const id = K.addCourse({}); ui.skOpen = id; ui.skFilter = 'all'; ctx.render(true); focusLater('co-title'); } }, '+ Nouvelle formation')),
    shown.length ? h('div', { class: 'grid gap-6 md:grid-cols-2' }, shown.map(c => ui.skOpen === c.id ? h('div', { class: 'md:col-span-2' }, card(c)) : card(c)))
      : emptyState(list.length ? 'Aucune formation avec ce statut.' : 'Aucune formation. Ajoute la première avec « + Nouvelle formation ».'));
}
