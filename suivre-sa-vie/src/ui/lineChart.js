/* Courbes d'évolution sur un seul axe (ex. scores GRE 130–170), redessinées à la largeur réelle du conteneur.
   series: [{ label, color (jeton CSS), points: [{ x: 'AAAA-MM-JJ', y }], target }]
   Survol et clavier (flèches) : ligne verticale + bulle listant toutes les séries à cette date. */
import { h } from '../core/dom.js';
import { fromKey, shortDate } from '../core/dates.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const col = (c, a = 1) => `rgb(var(--${c}) / ${a})`;

export function lineChart({ series, yMin, yMax, yStep = 10, height = 260, label, xFormat = shortDate, yFormat = String }) {
  const wrap = h('div', { class: 'relative w-full' });
  const tip = h('div', { class: 'pointer-events-none absolute z-10 hidden min-w-[150px] rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] shadow-lg' });
  const xs = [...new Set(series.flatMap(s => s.points.map(p => p.x)))].sort();
  let idx = xs.length - 1;

  function draw(W) {
    const M = { l: 48, r: 110, t: 14, b: 30 }, iw = Math.max(W - M.l - M.r, 60), ih = height - M.t - M.b;
    const t0 = fromKey(xs[0]).getTime(), t1 = fromKey(xs[xs.length - 1]).getTime();
    const X = x => M.l + (t1 === t0 ? iw / 2 : (fromKey(x).getTime() - t0) / (t1 - t0) * iw);
    const Y = y => M.t + (1 - (y - yMin) / (yMax - yMin)) * ih;
    const svg = el('svg', { width: W, height, viewBox: `0 0 ${W} ${height}`, role: 'img', 'aria-label': label, tabindex: 0, class: 'block focus:outline-none' });

    for (let y = yMin; y <= yMax; y += yStep) {
      svg.append(el('line', { x1: M.l, x2: M.l + iw, y1: Y(y), y2: Y(y), stroke: col('line'), 'stroke-width': 1 }));
      svg.append(el('text', { x: M.l - 8, y: Y(y), dy: '0.32em', 'text-anchor': 'end', 'font-size': 11, fill: col('muted'), 'font-family': 'var(--font-mono)' }, yFormat(y)));
    }
    const ticks = xs.length <= 6 ? xs : xs.filter((_, i) => i % Math.ceil(xs.length / 6) === 0 || i === xs.length - 1);
    for (const x of ticks) svg.append(el('text', { x: X(x), y: height - 8, 'text-anchor': 'middle', 'font-size': 11, fill: col('muted') }, xFormat(x)));

    const ends = [];
    for (const s of series) {
      if (s.target != null) svg.append(el('line', { x1: M.l, x2: M.l + iw, y1: Y(s.target), y2: Y(s.target), stroke: col(s.color, 0.55), 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }));
      if (s.points.length > 1) svg.append(el('polyline', { points: s.points.map(p => `${X(p.x)},${Y(p.y)}`).join(' '), fill: 'none', stroke: col(s.color), 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      for (const p of s.points) svg.append(el('circle', { cx: X(p.x), cy: Y(p.y), r: 4.5, fill: col(s.color), stroke: col('surface'), 'stroke-width': 2 }));
      const last = s.points[s.points.length - 1];
      if (last) ends.push({ s, y: Y(last.y), x: X(last.x), v: last.y });
    }
    // Étiquettes directes en bout de courbe, écartées si elles se chevauchent.
    ends.sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 16) ends[i].y = ends[i - 1].y + 16;
    for (const e of ends) svg.append(el('text', { x: M.l + iw + 10, y: e.y, dy: '0.32em', 'font-size': 12, fill: col('ink'), 'font-weight': 600 }, `${e.s.label} ${yFormat(e.v)}`));

    const hair = el('line', { y1: M.t, y2: M.t + ih, stroke: col('ink', 0.35), 'stroke-width': 1, visibility: 'hidden' });
    svg.append(hair);
    const show = i => {
      idx = Math.max(0, Math.min(xs.length - 1, i));
      const x = xs[idx], px = X(x);
      hair.setAttribute('x1', px); hair.setAttribute('x2', px); hair.setAttribute('visibility', 'visible');
      tip.replaceChildren(h('div', { class: 'mb-1 text-muted' }, xFormat(x)),
        ...series.map(s => { const p = s.points.find(q => q.x === x); return h('div', { class: 'flex items-center gap-2' },
          h('i', { class: 'inline-block h-0.5 w-3 rounded', style: `background:${col(s.color)}` }),
          h('b', { class: 'tnum' }, p ? yFormat(p.y) : '–'), h('span', { class: 'text-muted' }, s.label)); }));
      tip.classList.remove('hidden');
      const left = Math.min(Math.max(px + 12, 0), W - 170);
      tip.style.left = left + 'px'; tip.style.top = M.t + 'px';
    };
    const hide = () => { hair.setAttribute('visibility', 'hidden'); tip.classList.add('hidden'); };
    const hit = el('rect', { x: M.l - 10, y: 0, width: iw + 20, height, fill: 'transparent' });
    hit.addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect(), mx = e.clientX - r.left;
      let best = 0; xs.forEach((x, i) => { if (Math.abs(X(x) - mx) < Math.abs(X(xs[best]) - mx)) best = i; });
      show(best);
    });
    hit.addEventListener('pointerleave', hide);
    svg.append(hit);
    svg.addEventListener('focus', () => show(idx));
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); } if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); } });
    wrap.replaceChildren(svg, tip);
  }

  let lastW = 0;
  const ro = new ResizeObserver(entries => { const w = Math.floor(entries[0].contentRect.width); if (w && w !== lastW) { lastW = w; draw(w); } });
  ro.observe(wrap);

  const legend = h('div', { class: 'mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted' },
    series.map(s => h('span', { class: 'inline-flex items-center gap-1.5' }, h('i', { class: 'inline-block h-0.5 w-4 rounded', style: `background:${col(s.color)}` }), s.label,
      s.target != null ? h('span', {}, `· cible ${s.target} (pointillés)`) : null)));
  return h('figure', { class: 'min-w-0' }, wrap, legend);
}
