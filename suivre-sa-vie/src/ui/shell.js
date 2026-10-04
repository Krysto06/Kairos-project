/* Navigation : barre latérale (ordinateur) et tiroir (téléphone), générées depuis le registre des modules. */
import { h } from '../core/dom.js';
import { GROUPS, MODULES, SYSTEM_MODULE } from '../config/modules.js';
import { EYEBROW } from './classes.js';

const SAVE_TEXT = {
  idle: 'Prêt', saving: 'Enregistrement…', saved: 'Enregistré', error: 'Échec de l’enregistrement. Nouvel essai à la prochaine modification.',
};
const REMOTE_TEXT = {
  pending: 'Connexion à la base…', connected: 'Synchronisé avec claude.ai', unavailable: 'Enregistré sur cet appareil uniquement', error: 'Synchronisation interrompue. Recharge la page.',
};

export function syncLine(status) {
  const tone = status.save === 'error' || status.remote === 'error' ? 'bg-warn' : status.save === 'saving' ? 'bg-gold animate-pulse' : status.remote === 'connected' ? 'bg-ok' : 'bg-muted/60';
  const text = status.save === 'saving' || status.save === 'error' ? SAVE_TEXT[status.save] : REMOTE_TEXT[status.remote];
  return h('p', { class: 'flex items-start gap-2 text-xs text-muted', role: 'status' }, h('i', { class: 'mt-1.5 h-1.5 w-1.5 flex-none rounded-full ' + tone, 'aria-hidden': 'true' }), text);
}

function item(m, active, go, muted) {
  const on = active === m.id;
  return h('button', { type: 'button', 'data-c': m.color, 'aria-current': on ? 'page' : null, onclick: () => go(m.id),
    class: 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] transition cursor-pointer '
      + (on ? 'bg-soft font-semibold text-ink' : muted ? 'text-muted hover:bg-soft/70' : 'text-ink/80 hover:bg-soft/70 hover:text-ink') },
    h('span', { class: 'h-2 w-2 flex-none rounded-sm ' + (muted ? 'border border-muted/60' : 'bg-ci'), 'aria-hidden': 'true' }),
    h('span', { class: 'min-w-0 flex-1 truncate' }, m.label),
    muted ? h('span', { class: 'text-[10.5px] uppercase tracking-wider text-muted/80' }, 'Bientôt') : null);
}

export function navContent({ route, status, go, laterOpen, toggleLater }) {
  const later = MODULES.filter(m => m.status !== 'live');
  return [
    h('div', { class: 'px-3 mb-9' },
      h('div', { class: 'font-display text-[1.9rem] font-semibold leading-none' }, 'Suivre sa vie'),
      h('div', { class: EYEBROW + ' mt-2' }, 'Système personnel')),
    h('div', { class: 'grid gap-7' },
      GROUPS.map(g => {
        const items = MODULES.filter(m => m.group === g.id && m.status === 'live');
        return items.length ? h('div', { class: 'grid gap-0.5' }, h('div', { class: EYEBROW + ' px-3 mb-1.5' }, g.label), items.map(m => item(m, route, go))) : null;
      }),
      later.length ? h('div', { class: 'grid gap-0.5' },
        h('button', { type: 'button', 'aria-expanded': laterOpen, onclick: toggleLater,
          class: 'flex items-center justify-between px-3 mb-1.5 cursor-pointer ' + EYEBROW + ' hover:text-ink' },
          `À venir · ${later.length}`, h('span', { 'aria-hidden': 'true', class: 'transition ' + (laterOpen ? 'rotate-90' : '') }, '›')),
        laterOpen ? later.map(m => item(m, route, go, true)) : null) : null),
    h('div', { class: 'mt-auto pt-10 grid gap-3' },
      h('div', { class: 'border-t border-line pt-4 grid gap-0.5' }, item(SYSTEM_MODULE, route, go)),
      h('div', { class: 'px-3' }, syncLine(status))),
  ];
}
