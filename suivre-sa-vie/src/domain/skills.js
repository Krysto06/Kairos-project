/* Compétences : formations (state.learning.courses), référentiel (state.learning.skills), séances (collection sessions, subject:'skills').
   Séance : { id, subject:'skills', date, courseId, moduleId, minutes, note, createdAt } */

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

/* Module à travailler un jour donné : celui dont les dates couvrent ce jour, sinon le premier non coché. */
export function moduleFor(course, day) {
  return course.mods.find(m => m.start && m.start <= day && day <= m.end && !m.done) || course.mods.find(m => !m.done) || null;
}

/* Jours ISO (lundi = 1 … dimanche = 7). */
const isoDay = day => { const d = new Date(day + 'T12:00').getDay(); return d === 0 ? 7 : d; };

/* Séances proposées pour les formations en cours :
   - avec un rythme (schedule : jours + durée) : une séance chaque jour prévu, sur le module du moment ;
   - sans rythme : une séance de 60 min sur le prochain module. */
export function nextModuleBlocks(state, days) {
  const out = []; let k = 0;
  for (const c of state.learning.courses.filter(x => x.status === 'cours')) {
    const name = c.short || c.title;
    if (c.schedule && c.schedule.days && c.schedule.days.length) {
      for (const day of days) if (c.schedule.days.includes(isoDay(day))) { const m = moduleFor(c, day); if (m) out.push({ courseId: c.id, moduleId: m.id, topic: m.t, course: name, minutes: c.schedule.minutes || 60, date: day }); }
    } else {
      const m = c.mods.find(x => !x.done);
      if (m) out.push({ courseId: c.id, moduleId: m.id, topic: m.t, course: name, minutes: 60, date: days[k++ % days.length] });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
export const blockTitle = b => `${b.course} · ${b.topic}`;
