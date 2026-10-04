/* Calculs de progression : fonctions pures, sans DOM. */
import { TRACKS } from '../data/content/tracks.js';

export const isDone = (state, id) => state.done.includes(id);

/* Étapes d'un parcours, avec les étapes perso insérées juste avant le sommet. */
export function trackSteps(state, track) {
  const custom = (state.custom[track.id] || []).map(c => ({ id: c.id, t: c.t, d: c.d || '', links: c.url ? [['Ouvrir le lien', c.url]] : [], mine: true }));
  const i = track.steps.findIndex(s => s.summit);
  return i < 0 ? track.steps.concat(custom) : track.steps.slice(0, i).concat(custom, track.steps.slice(i));
}

export function trackProgress(state, track) {
  const steps = trackSteps(state, track);
  const d = steps.filter(s => isDone(state, s.id)).length;
  return { d, n: steps.length, p: steps.length ? d / steps.length : 0 };
}

/* Formations (state.learning.courses) : modules cochés / modules. */
export function courseProgress(course) {
  const d = course.mods.filter(m => m.done).length;
  return { d, n: course.mods.length, p: course.mods.length ? d / course.mods.length : 0 };
}

export function allSkillsProgress(state) {
  const t = state.learning.courses.reduce((a, c) => { const q = courseProgress(c); a.d += q.d; a.n += q.n; return a; }, { d: 0, n: 0 });
  return { ...t, p: t.n ? t.d / t.n : 0 };
}

export const activeCourses = state => state.learning.courses.filter(c => c.status !== 'fini' && c.status !== 'pause');

/* Prochaines actions : règle simple et explicable (première étape non cochée de chaque parcours,
   premier module non coché de chaque formation, prochaine étape des projets en cours). Pas d'IA. */
export function nextActions(state, routeOfTrack) {
  const out = [];
  for (const tr of TRACKS) {
    const s = trackSteps(state, tr).find(x => !isDone(state, x.id));
    if (s) out.push({ c: 'edu', tag: s.lvl || (s.summit ? '★' : 'EX'), t: s.t, sub: tr.title, route: routeOfTrack(tr.id) });
  }
  for (const c of activeCourses(state)) {
    const m = c.mods.find(x => !x.done);
    if (m) out.push({ c: 'sk', tag: c.id.length <= 4 ? c.id.toUpperCase() : (c.title.match(/[A-Za-zÀ-ÿ]/g) || ['?']).slice(0, 3).join('').toUpperCase(), t: m.t, sub: c.title, route: 'skills' });
  }
  for (const p of state.projects.filter(x => x.status === 'cours' && x.next)) {
    out.push({ c: 'pro', tag: 'PRJ', t: p.next, sub: p.name, route: 'projects' });
  }
  return out;
}
