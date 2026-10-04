/* Compétences : formations (state.learning.courses), référentiel (state.learning.skills), séances (collection sessions, subject:'skills').
   Séance : { id, subject:'skills', date, courseId, moduleId, minutes, note, createdAt } */
import { activeCourses } from './progress.js';

export const skillSessions = sessions => sessions.filter(s => s.subject === 'skills').sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));

export function minutesByCourse(sessions, from = '0000') {
  const m = new Map();
  for (const s of sessions) if (s.date >= from) m.set(s.courseId, (m.get(s.courseId) || 0) + (+s.minutes || 0));
  return m;
}

/* Écart au niveau visé (compétences dont la cible est fixée), le plus grand d'abord. */
export function skillGaps(skills) {
  return skills.filter(s => s.target != null && s.level != null && s.target > s.level).map(s => ({ ...s, gap: s.target - s.level })).sort((a, b) => b.gap - a.gap);
}
export const reachedCount = skills => { const t = skills.filter(s => s.target != null); return { d: t.filter(s => (s.level ?? 0) >= s.target).length, n: t.length }; };

/* Prochain module de chaque formation active : séance proposée de 60 min, aujourd'hui puis les jours suivants. */
export function nextModuleBlocks(state, days) {
  return activeCourses(state).map(c => ({ c, m: c.mods.find(x => !x.done) })).filter(x => x.m)
    .map((x, i) => ({ courseId: x.c.id, moduleId: x.m.id, topic: x.m.t, course: x.c.title, minutes: 60, date: days[i % days.length] }));
}
export const blockTitle = b => `${b.course} · ${b.topic}`;
