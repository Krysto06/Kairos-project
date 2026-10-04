import { h } from '../core/dom.js';
import { toggleIn } from '../core/utils.js';
import { LOOKS, CAPSULE } from '../data/content/style.js';
import { CARD, H3 } from '../ui/classes.js';
import { pageHeader, statusBadge, progressBar, linkChip, section } from '../ui/components.js';

const HEART = '<svg viewBox="0 0 24 24" class="h-[17px] w-[17px]" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.3 3.2 5 6.4 5c2 0 3.3 1.1 4 2.3h3.2C14.3 6.1 15.6 5 17.6 5c3.2 0 5.1 3.3 3.6 6.4C19 15.6 12 20 12 20z" stroke-width="1.6" stroke="currentColor" fill="var(--hf,none)"/></svg>';
const isDark = c => parseInt(c.slice(1, 3), 16) * 0.3 + parseInt(c.slice(3, 5), 16) * 0.59 + parseInt(c.slice(5, 7), 16) * 0.11 < 140;

export default function style(ctx) {
  const S = ctx.state;
  const looks = LOOKS.slice().sort((a, b) => (S.favs.includes(b.id) ? 1 : 0) - (S.favs.includes(a.id) ? 1 : 0));

  const lookCard = L => {
    const fav = S.favs.includes(L.id);
    return h('article', { class: 'flex flex-col overflow-hidden rounded-2xl border border-line bg-surface' },
      h('div', { class: 'grid h-28', 'aria-hidden': 'true', style: `grid-template-columns:repeat(${L.pal.length},1fr)` },
        L.pal.map(([c, n]) => h('span', { class: 'flex items-end p-2 text-[10px] font-medium uppercase tracking-wider leading-tight', style: `background:${c};color:${isDark(c) ? 'rgba(255,255,255,.82)' : 'rgba(27,32,48,.68)'}` }, n))),
      h('div', { class: 'flex flex-1 flex-col gap-3 p-5' },
        h('div', { class: 'flex items-start justify-between gap-2' },
          h('div', {}, h('h3', { class: H3 }, L.name), h('p', { class: 'text-sm text-muted' }, L.vibe)),
          h('button', { type: 'button', html: HEART, 'aria-pressed': fav, 'aria-label': (fav ? 'Retirer des favoris ' : 'Ajouter aux favoris ') + L.name, style: fav ? '--hf:currentColor' : '',
            class: 'grid h-9 w-9 flex-none place-items-center rounded-full border transition cursor-pointer ' + (fav ? 'border-sty-ink/40 bg-sty text-sty-ink' : 'border-line text-muted hover:text-sty-ink'),
            onclick: () => ctx.update(st => { st.favs = toggleIn(st.favs, L.id); }) })),
        h('ul', { class: 'grid gap-1 text-sm' }, L.pieces.map(p => h('li', { class: 'flex gap-2' }, h('span', { class: 'text-sty-ink' }, '·'), p))),
        h('p', { class: 'border-t border-line pt-3 text-[13px] text-muted' }, L.tip),
        h('div', { class: 'mt-auto pt-1' }, linkChip('Chercher sur Pinterest', 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(L.q)))));
  };

  return h('div', { class: 'view grid gap-14', 'data-c': 'sty' },
    h('div', {}, pageHeader({ eyebrow: 'Vie & projets', title: 'Style', lead: 'Des idées de tenues et une garde-robe de base. Mets un cœur sur tes looks préférés : ils passent en premier.',
      badges: [statusBadge('live'), statusBadge('demo', 'Looks : suggestions fixes')] }),
      h('div', { class: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' }, looks.map(lookCard)),
      h('p', { class: 'mt-5 text-[13px] text-muted' }, 'Ces six looks sont des suggestions écrites dans l’app, pas ta garde-robe réelle. Les liens Pinterest ouvrent une recherche dans un nouvel onglet ; l’app ne consulte pas Pinterest.')),
    section('Garde-robe capsule', 'Les 12 pièces de base qui vont avec tous les looks. Coche celles que tu as déjà.',
      h('div', { class: CARD },
        h('div', { class: 'flex items-center gap-4' }, progressBar(S.capsule.length / CAPSULE.length, 'flex-1'), h('span', { class: 'font-mono text-xs text-muted tnum' }, `${S.capsule.length} / ${CAPSULE.length}`)),
        h('div', { class: 'mt-5 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' }, CAPSULE.map((c, i) => {
          const on = S.capsule.includes(c);
          return h('label', { class: 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition ' + (on ? 'bg-sty text-sty-ink font-medium' : 'border border-line hover:border-sty-ink/40') },
            h('input', { type: 'checkbox', class: 'chk', id: 'cap-' + i, checked: on, onchange: () => ctx.update(st => { st.capsule = toggleIn(st.capsule, c); }) }), c);
        })))));
}
