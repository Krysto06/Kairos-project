/* GRE : scores, séances, points faibles et plan de la semaine. Fonctions pures.
   Test : { id, subject:'gre', date, kind, source, v, q, aw, note, createdAt }
   Séance : { id, subject:'gre', date, section:'q'|'v'|'aw', topic, minutes, attempted, correct, note, createdAt } */
import { GRE_SECTIONS } from '../data/content/gre.js';
import { fromKey, weekDays, addDays } from '../core/dates.js';

export const greTests = tests => tests.filter(t => t.subject === 'gre').sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || '').localeCompare(b.createdAt || ''));
export const greSessions = sessions => sessions.filter(s => s.subject === 'gre').sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
export const total = t => (t && t.v && t.q) ? t.v + t.q : null;
export const latest = tests => tests.length ? tests[tests.length - 1] : null;

export function daysUntil(dateKey, today) {
  if (!dateKey) return null;
  return Math.round((fromKey(dateKey) - fromKey(today)) / 864e5);
}

/* Écart au score cible, section par section (null si l'un des deux manque). */
export function gaps(target, last) {
  const g = k => (target && target[k] != null && last && last[k] != null) ? target[k] - last[k] : null;
  return { v: g('v'), q: g('q'), aw: g('aw') };
}

export const minutesSince = (sessions, fromKey_) => sessions.filter(s => s.date >= fromKey_).reduce((a, s) => a + (+s.minutes || 0), 0);

/* Précision par clé (section ou thème), sur les séances où des questions ont été comptées. */
export function accuracyBy(sessions, keyFn) {
  const m = new Map();
  for (const s of sessions) {
    if (!(+s.attempted > 0)) continue;
    const k = keyFn(s), cur = m.get(k) || { key: k, attempted: 0, correct: 0, minutes: 0 };
    cur.attempted += +s.attempted; cur.correct += Math.min(+s.correct || 0, +s.attempted); cur.minutes += +s.minutes || 0;
    m.set(k, cur);
  }
  return [...m.values()].map(x => ({ ...x, p: x.correct / x.attempted }));
}

/* Points faibles : thèmes avec au moins 10 questions, précision la plus basse d'abord. */
export function weakTopics(sessions, min = 10) {
  return accuracyBy(sessions.filter(s => s.section !== 'aw'), s => s.section + '|' + s.topic)
    .filter(x => x.attempted >= min).sort((a, b) => a.p - b.p)
    .map(x => { const [section, topic] = x.key.split('|'); return { ...x, section, topic }; });
}

/* Répartition hebdomadaire du temps : proportionnelle à l'écart de chaque section (minimum 1 point),
   Writing fixe à 10 % (15 % si l'écart en Writing est positif). Sans test : moitié Quant, moitié Verbal. */
export function allocation(weeklyMinutes, g) {
  const aw = (g.aw != null && g.aw > 0) ? 0.15 : 0.10;
  const wq = Math.max(g.q ?? 1, 1), wv = Math.max(g.v ?? 1, 1);
  const rest = 1 - aw;
  return { q: weeklyMinutes * rest * wq / (wq + wv), v: weeklyMinutes * rest * wv / (wq + wv), aw: weeklyMinutes * aw };
}

export function phase(daysLeft) {
  if (daysLeft == null) return { id: 'none', label: 'Date du test à fixer', detail: 'Fixe une date de test pour obtenir un plan.' };
  if (daysLeft < 0) return { id: 'past', label: 'Date passée', detail: 'Mets à jour la date du test.' };
  if (daysLeft <= 14) return { id: 'final', label: 'Dernière ligne droite', detail: 'Tests blancs complets, révision des erreurs, sommeil. Pas de nouvelle notion.' };
  if (daysLeft <= 42) return { id: 'tests', label: 'Tests blancs', detail: 'Un test blanc complet toutes les deux semaines, le reste sur les points faibles.' };
  if (daysLeft <= 84) return { id: 'target', label: 'Pratique ciblée', detail: 'Séries chronométrées sur les points faibles, vocabulaire tous les jours.' };
  return { id: 'base', label: 'Fondations', detail: 'Revoir les notions de base de chaque thème, sans chrono, et installer l’habitude.' };
}

/* Jours de travail proposés : du lundi au samedi, à partir d'aujourd'hui. Le dimanche reste libre ;
   s'il ne reste aucun jour cette semaine, on prépare la semaine suivante. */
export function planDays(today) {
  const rest = weekDays(today).slice(0, 6).filter(d => d >= today);
  return rest.length ? { next: false, days: rest } : { next: true, days: weekDays(addDays(today, 1)).slice(0, 6) };
}

/* Séances proposées : blocs de 45 min (30 pour l'essai) répartis sur `days` ;
   thème = point faible connu, sinon rotation des thèmes. */
export function weekPlan({ days, weeklyMinutes, gaps: g, weak, daysLeft }) {
  if (!weeklyMinutes || !days.length) return [];
  const alloc = allocation(weeklyMinutes, g);
  const blocks = [];
  for (const sec of ['q', 'v']) {
    const n = Math.max(1, Math.round(alloc[sec] / 45));
    const weakOf = weak.filter(w => w.section === sec).map(w => w.topic);
    const pool = weakOf.length ? weakOf : GRE_SECTIONS[sec].topics;
    for (let i = 0; i < n; i++) blocks.push({ section: sec, topic: pool[i % pool.length], minutes: 45 });
  }
  if (alloc.aw >= 20) blocks.push({ section: 'aw', topic: GRE_SECTIONS.aw.topics[0], minutes: 30 });
  if (daysLeft != null && daysLeft <= 42 && daysLeft > 0) blocks.push({ section: 'test', topic: 'Test blanc complet (POWERPREP)', minutes: 120 });
  // Alternance Quant / Verbal, puis répartition sur les jours restants.
  const q = blocks.filter(b => b.section === 'q'), v = blocks.filter(b => b.section === 'v'), other = blocks.filter(b => b.section !== 'q' && b.section !== 'v');
  const mixed = [];
  while (q.length || v.length) { if (q.length) mixed.push(q.shift()); if (v.length) mixed.push(v.shift()); }
  mixed.push(...other);
  return mixed.map((b, i) => ({ ...b, date: days[i % days.length] })).sort((a, b) => a.date.localeCompare(b.date));
}

export const sessionTitle = b => b.section === 'test' ? 'GRE · ' + b.topic : `GRE ${GRE_SECTIONS[b.section].short} · ${b.topic}`;
