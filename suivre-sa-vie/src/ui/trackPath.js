/* Parcours en étapes (Études, Anglais, GRE) : frise verticale à cocher + ajout d'étapes perso. */
import { h } from '../core/dom.js';
import { uid, normalizeUrl, toggleIn } from '../core/utils.js';
import { trackSteps, trackProgress, isDone } from '../domain/progress.js';
import { CARD, BTN, IN, LABEL, H3 } from './classes.js';
import { progressBar, linkChip, field } from './components.js';
import { percent } from '../core/format.js';

const TAG = 'rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium';

export function trackPath(ctx, track, { after } = {}) {
  const S = ctx.state, pr = trackProgress(S, track), steps = trackSteps(S, track);
  const toggle = id => ctx.update(s => { s.done = toggleIn(s.done, id); });

  const list = h('ol', { class: 'path mt-8 grid gap-3' }, steps.map(s => {
    const done = isDone(S, s.id);
    const badge = s.summit ? null
      : s.mine ? h('span', { class: TAG + ' bg-sk text-sk-ink' }, 'PERSO')
      : s.exam ? h('span', { class: TAG + ' bg-pro text-pro-ink' }, 'EXAMEN')
      : h('span', { class: TAG + ' bg-edu text-edu-ink' }, s.lvl);
    const links = (s.links || []).slice();
    if (s.abc && S.abcLink) links.unshift(['Ouvrir mon ABC', S.abcLink]);

    const node = h('button', { type: 'button', role: 'checkbox', 'aria-checked': done, 'aria-label': (done ? 'Décocher ' : 'Cocher ') + s.t,
      title: done ? 'Fait. Cliquer pour décocher.' : 'Marquer comme fait', onclick: () => toggle(s.id),
      class: 'relative z-10 grid h-10 w-10 flex-none place-items-center rounded-full border font-mono text-[11px] font-medium transition hover:scale-105 cursor-pointer '
        + (s.summit ? (done ? 'bg-gold border-gold text-surface' : 'bg-surface border-gold text-gold')
          : (done ? 'bg-ci border-ci text-surface' : 'bg-surface border-line text-muted hover:border-ci')) },
      done ? (s.summit ? '★' : '✓') : (s.summit ? '★' : (s.lvl || (s.exam ? 'EX' : '•')).slice(0, 3)));

    const body = h('div', { class: 'min-w-0 flex-1 rounded-xl px-4 py-3.5 transition '
        + (s.summit ? 'border border-gold/50 bg-pro/40' : done ? 'bg-soft/50' : 'border border-line bg-surface') },
      s.summit ? h('div', { class: 'text-[11px] font-semibold uppercase tracking-[.16em] text-gold' }, 'Objectif final') : null,
      h('h4', { class: 'flex flex-wrap items-center gap-2 ' + (s.summit ? 'font-display text-xl font-semibold' : 'font-medium') + (done && !s.summit ? ' text-muted line-through decoration-muted/50' : '') },
        badge, s.t,
        s.mine ? h('button', { type: 'button', class: 'ml-auto text-xs font-medium text-muted hover:text-warn cursor-pointer',
          onclick: () => ctx.update(st => { st.custom[track.id] = (st.custom[track.id] || []).filter(c => c.id !== s.id); st.done = st.done.filter(x => x !== s.id); }) }, 'Retirer') : null),
      s.d ? h('p', { class: 'mt-1 text-sm text-muted' }, s.d) : null,
      s.abc ? h('div', { class: 'mt-3 max-w-md' }, field('abc-link', 'Lien de ton artefact ABC',
        h('input', { class: IN, id: 'abc-link', type: 'url', placeholder: 'https://claude.ai/…', value: S.abcLink,
          onchange: e => ctx.update(st => { st.abcLink = normalizeUrl(e.target.value); }) }))) : null,
      links.length ? h('div', { class: 'mt-3 flex flex-wrap gap-x-4 gap-y-1.5' }, links.map(([l, u]) => linkChip(l, u))) : null);

    return h('li', { class: 'flex gap-4' }, node, body);
  }));

  let tIn, uIn;
  const addForm = h('form', { class: 'mt-8 grid gap-2 grid-cols-1 md:grid-cols-[1.3fr_1fr_auto] items-end',
    onsubmit: e => {
      e.preventDefault();
      const t = tIn.value.trim(); if (!t) return;
      const url = normalizeUrl(uIn.value);
      ctx.update(st => { (st.custom[track.id] = st.custom[track.id] || []).push({ id: 'c-' + uid(), t, url }); });
    } },
    field('add-step-' + track.id, 'Ajouter une étape', tIn = h('input', { class: IN, id: 'add-step-' + track.id, placeholder: 'Ex. : cours particulier' })),
    field('add-link-' + track.id, 'Lien (facultatif)', uIn = h('input', { class: IN, id: 'add-link-' + track.id, placeholder: 'https://…' })),
    h('button', { class: BTN, type: 'submit' }, 'Ajouter'));

  return h('div', { class: CARD, 'data-c': 'edu' },
    h('div', { class: 'flex flex-wrap items-center gap-x-6 gap-y-3' },
      h('h3', { class: H3 }, track.title),
      h('div', { class: 'flex flex-1 items-center gap-3 min-w-[180px]' }, progressBar(pr.p, 'flex-1'), h('span', { class: 'font-mono text-xs text-muted tnum' }, `${pr.d}/${pr.n} · ${percent(pr.p)}`))),
    h('p', { class: 'mt-2 text-muted max-w-2xl' }, track.desc),
    list,
    after || null,
    h('div', { class: 'mt-8 border-t border-line pt-6' }, h('p', { class: LABEL + ' mb-3' }, 'Tu peux ajouter tes propres étapes. Elles se placent avant l’objectif final.'), addForm));
}
