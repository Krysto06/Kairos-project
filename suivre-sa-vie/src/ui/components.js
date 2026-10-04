/* Composants réutilisables. Chacun renvoie un élément DOM ; aucun ne lit ni n'écrit l'état global. */
import { h } from '../core/dom.js';
import { clamp01 } from '../core/utils.js';
import { STATUS } from '../config/status.js';
import { EYEBROW, H1, H2, LABEL } from './classes.js';

const TONE = {
  ok: 'text-ok border-ok/30 bg-ok/5', gold: 'text-gold border-gold/40 bg-gold/5',
  warn: 'text-warn border-warn/30 bg-warn/5', muted: 'text-muted border-line bg-soft/60',
};
const DOT = { ok: 'bg-ok', gold: 'bg-gold', warn: 'bg-warn', muted: 'bg-muted/60' };

/* Pastille d'état : Actif, Demo, Placeholder, À connecter, Nécessite une autorisation… */
export function statusBadge(key, text) {
  const s = STATUS[key] || STATUS.placeholder;
  return h('span', { class: 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ' + TONE[s.tone] },
    h('i', { class: 'h-1.5 w-1.5 rounded-full ' + DOT[s.tone], 'aria-hidden': 'true' }), text || s.label);
}

/* En-tête de page : surtitre, titre, chapeau, pastilles d'état et actions. */
export function pageHeader({ eyebrow, title, lead, badges = [], actions }) {
  return h('header', { class: 'mb-10 sm:mb-12 last:mb-0 grid gap-4' },
    h('div', { class: 'flex flex-wrap items-center gap-2.5' }, eyebrow ? h('span', { class: EYEBROW }, eyebrow) : null, badges),
    h('div', { class: 'flex flex-wrap items-end justify-between gap-5' },
      h('div', { class: 'min-w-0 max-w-2xl' }, h('h1', { class: H1 }, title), lead ? h('p', { class: 'mt-3 text-[15.5px] text-muted leading-relaxed' }, lead) : null),
      actions || null));
}

/* Section titrée à l'intérieur d'une page. */
export function section(title, sub, ...children) {
  return h('section', { class: 'grid gap-5 min-w-0' },
    h('div', {}, h('h2', { class: H2 }, title), sub ? h('p', { class: 'mt-1 text-sm text-muted max-w-2xl' }, sub) : null),
    children);
}

export function progressBar(p, extra = '') {
  const v = clamp01(p);
  return h('div', { class: 'h-1.5 rounded-full bg-soft overflow-hidden ' + extra, role: 'progressbar', 'aria-valuenow': Math.round(v * 100), 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('div', { class: 'h-full rounded-full bg-ci transition-all duration-500', style: `width:${v * 100}%` }));
}

export function ring(p, colorVar = 'ci', size = 44) {
  const v = clamp01(p), r = (size - 4) / 2, C = 2 * Math.PI * r, off = C * (1 - v), m = size / 2;
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('width', size); el.setAttribute('height', size); el.setAttribute('viewBox', `0 0 ${size} ${size}`);
  el.setAttribute('class', 'flex-none'); el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<circle cx="${m}" cy="${m}" r="${r}" fill="none" stroke="rgb(var(--line))" stroke-width="2"/>`
    + `<circle cx="${m}" cy="${m}" r="${r}" fill="none" stroke="rgb(var(--${colorVar}))" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}" transform="rotate(-90 ${m} ${m})" style="transition:stroke-dashoffset .6s ease"/>`;
  return el;
}

export const linkChip = (label, url) => h('a', { class: 'inline-flex items-center gap-1 text-[13px] font-medium text-ci underline decoration-line underline-offset-4 hover:decoration-current', href: url, target: '_blank', rel: 'noopener' }, label, h('span', { 'aria-hidden': 'true' }, '↗'));

/* Chiffre clé cliquable : libellé, valeur, sous-texte, barre de progression facultative. */
export function metric({ label, value, sub, p, color = 'me', onClick }) {
  return h(onClick ? 'button' : 'div', { 'data-c': color, type: onClick ? 'button' : null, onclick: onClick,
    class: 'group grid gap-2 border-t border-line pt-4 text-left min-w-0 ' + (onClick ? 'cursor-pointer' : '') },
    h('span', { class: EYEBROW + ' group-hover:text-ci transition' }, label),
    h('span', { class: 'font-display text-[2.1rem] leading-none font-semibold tnum' }, value),
    p != null ? progressBar(p, 'mt-1') : null,
    sub ? h('span', { class: 'text-[13px] text-muted' }, sub) : null);
}

/* Remarque d'honnêteté : explique ce qui est réel, simulé ou non connecté. */
export function notice(text, tone = 'muted') {
  return h('p', { class: 'rounded-xl border px-4 py-3 text-[13.5px] leading-relaxed ' + TONE[tone] }, text);
}

export const emptyState = (text, action) => h('div', { class: 'grid justify-items-center gap-4 rounded-2xl border border-dashed border-line px-6 py-12 text-center text-muted' }, h('p', {}, text), action || null);

export const field = (id, label, input) => h('div', { class: 'grid gap-1.5 min-w-0' }, h('label', { class: LABEL, for: id }, label), input);

/* Boutons à choix unique (filtres, sélecteurs). */
export function segmented(options, value, onChange, label) {
  return h('div', { class: 'flex flex-wrap gap-1.5', role: 'group', 'aria-label': label },
    options.map(([k, text]) => h('button', { type: 'button', 'aria-pressed': value === k, onclick: () => onChange(k),
      class: 'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition cursor-pointer ' + (value === k ? 'border-ink bg-ink text-surface' : 'border-line hover:border-ink/40') }, text)));
}
