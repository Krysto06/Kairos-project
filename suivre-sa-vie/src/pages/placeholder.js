/* Page générique d'un module prévu mais pas encore construit. Tout son contenu vient du registre. */
import { h } from '../core/dom.js';
import { GROUPS } from '../config/modules.js';
import { CARD, H3 } from '../ui/classes.js';
import { pageHeader, statusBadge, notice } from '../ui/components.js';

const list = items => h('ul', { class: 'grid gap-2 text-sm' }, items.map(t => h('li', { class: 'flex gap-2.5' }, h('span', { class: 'text-muted', 'aria-hidden': 'true' }, '—'), h('span', {}, t))));

export function placeholderPage(mod) {
  return function render() {
    const group = GROUPS.find(g => g.id === mod.group);
    return h('div', { class: 'view', 'data-c': mod.color },
      pageHeader({ eyebrow: group ? group.label : '', title: mod.label, lead: mod.summary, badges: [statusBadge('placeholder')] }),
      h('div', { class: 'mb-8' }, notice('Ce module n’est pas encore construit. Rien ici n’est fonctionnel : cette page décrit ce qui est prévu.')),
      h('div', { class: 'grid gap-6 md:grid-cols-2' },
        h('div', { class: CARD + ' grid gap-4' }, h('h2', { class: H3 }, 'Ce que le module fera'), list(mod.plan.features)),
        h('div', { class: 'grid gap-6' },
          h('div', { class: CARD + ' grid gap-4' }, h('h2', { class: H3 }, 'Données nécessaires'), list(mod.plan.data)),
          h('div', { class: CARD + ' grid gap-4' }, h('h2', { class: H3 }, 'Connexions requises'),
            h('ul', { class: 'grid gap-3 text-sm' }, mod.plan.needs.map(([t, st]) => h('li', { class: 'flex flex-wrap items-center justify-between gap-2' }, h('span', {}, t), statusBadge(st))))))));
  };
}
