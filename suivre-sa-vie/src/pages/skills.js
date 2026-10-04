import { h } from '../core/dom.js';
import { toggleIn } from '../core/utils.js';
import { SKILLS } from '../data/content/skills.js';
import { skillProgress, skillKey } from '../domain/progress.js';
import { CARD, H3 } from '../ui/classes.js';
import { pageHeader, statusBadge, ring, linkChip } from '../ui/components.js';

export default function skills(ctx) {
  const S = ctx.state;
  return h('div', { class: 'view', 'data-c': 'sk' },
    pageHeader({ eyebrow: 'Apprentissage', title: 'Compétences', lead: 'Tes formations en cours. Coche chaque module terminé.', badges: [statusBadge('live')] }),
    h('div', { class: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' }, SKILLS.map(sk => {
      const pr = skillProgress(S, sk);
      return h('article', { class: CARD + ' flex flex-col' },
        h('div', { class: 'flex items-center gap-4 mb-5' }, ring(pr.p, 'sk-ink', 48),
          h('div', { class: 'min-w-0' }, h('h3', { class: H3 }, sk.title), h('div', { class: 'text-[13px] text-muted' }, `${sk.sub} · ${pr.d}/${pr.n}`))),
        h('ul', { class: 'grid gap-0.5' }, sk.mods.map(([t, d], i) => {
          const key = skillKey(sk, i), on = S.skillsDone.includes(key);
          return h('li', {}, h('label', { class: 'flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-soft/70 cursor-pointer transition' },
            h('input', { type: 'checkbox', class: 'chk mt-0.5', id: 'm-' + sk.id + '-' + i, checked: on, onchange: () => ctx.update(st => { st.skillsDone = toggleIn(st.skillsDone, key); }) }),
            h('span', { class: 'text-sm ' + (on ? 'line-through text-muted' : 'font-medium') }, t, d ? h('small', { class: 'block text-xs text-muted font-normal' }, d) : null)));
        })),
        h('div', { class: 'mt-auto pt-5 flex flex-wrap gap-x-4 gap-y-1.5' }, sk.links.map(([l, u]) => linkChip(l, u))));
    })));
}
