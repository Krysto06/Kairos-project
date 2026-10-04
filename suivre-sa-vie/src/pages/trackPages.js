/* Études, Anglais et GRE partagent le même composant de parcours. */
import { h } from '../core/dom.js';
import { trackById } from '../data/content/tracks.js';
import { moduleById } from '../config/modules.js';
import { BTN, EYEBROW } from '../ui/classes.js';
import { pageHeader, statusBadge } from '../ui/components.js';
import { trackPath } from '../ui/trackPath.js';

const LEADS = {
  learning: 'Ta licence étape par étape. Clique sur un cercle pour cocher une étape.',
  english: 'Un niveau à la fois, avec un test gratuit à mi-chemin et les deux examens officiels comme objectif final.',
  gre: 'Le GRE, le dossier, puis l’admission en master.',
};

export function trackPage(moduleId) {
  return function render(ctx) {
    const mod = moduleById(moduleId), track = trackById(mod.track);
    const next = track.next && moduleById(Object.keys(LEADS).find(id => moduleById(id).track === track.next));
    const after = next ? h('div', { class: 'mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-edu/60 px-5 py-4' },
      h('div', {}, h('div', { class: EYEBROW }, 'Après la soutenance'), h('div', { class: 'font-display text-xl font-semibold text-edu-ink' }, next.label)),
      h('button', { type: 'button', class: BTN, onclick: () => ctx.go(next.id) }, 'Continuer vers ' + next.label)) : null;
    return h('div', { class: 'view', 'data-c': 'edu' },
      pageHeader({ eyebrow: 'Apprentissage', title: mod.label, lead: LEADS[moduleId], badges: [statusBadge('live')] }),
      trackPath(ctx, track, { after }));
  };
}
