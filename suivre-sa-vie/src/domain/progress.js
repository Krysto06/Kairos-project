/* Calculs de progression : fonctions pures, sans DOM. */
import { TRACKS } from '../data/content/tracks.js';
import { SKILLS } from '../data/content/skills.js';

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

export const skillKey = (skill, i) => skill.id + ':' + i;

export function skillProgress(state, skill) {
  const d = skill.mods.filter((m, i) => state.skillsDone.includes(skillKey(skill, i))).length;
  return { d, n: skill.mods.length, p: skill.mods.length ? d / skill.mods.length : 0 };
}

export function allSkillsProgress(state) {
  const t = SKILLS.reduce((a, s) => { const q = skillProgress(state, s); a.d += q.d; a.n += q.n; return a; }, { d: 0, n: 0 });
  return { ...t, p: t.n ? t.d / t.n : 0 };
}

/* Prochaines actions : règle simple et explicable (première étape non cochée de chaque parcours,
   premier module non coché de chaque formation, prochaine étape des projets en cours). Pas d'IA. */
export function nextActions(state, routeOfTrack) {
  const out = [];
  for (const tr of TRACKS) {
    const s = trackSteps(state, tr).find(x => !isDone(state, x.id));
    if (s) out.push({ c: 'edu', tag: s.lvl || (s.summit ? '★' : 'EX'), t: s.t, sub: tr.title, route: routeOfTrack(tr.id) });
  }
  for (const sk of SKILLS) {
    const i = sk.mods.findIndex((m, j) => !state.skillsDone.includes(skillKey(sk, j)));
    if (i >= 0) out.push({ c: 'sk', tag: sk.id.toUpperCase(), t: sk.mods[i][0], sub: sk.title, route: 'skills' });
  }
  for (const p of state.projects.filter(x => x.status === 'cours' && x.next)) {
    out.push({ c: 'pro', tag: 'PRJ', t: p.next, sub: p.name, route: 'projects' });
  }
  return out;
}
