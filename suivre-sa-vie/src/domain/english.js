/* Anglais : tests, séances, équilibre des compétences, régularité et plan. Fonctions pures.
   Test : { id, subject:'en', exam:'efset'|'det'|'toefl', date, total, scale, sub:{…}, note, createdAt }
   Séance : { id, subject:'en', date, section: compétence, topic: activité, minutes, attempted, correct, words, note, createdAt } */
import { SKILLS, ACTIVITIES, bandOf, efsetLevel } from '../data/content/english.js';
import { addDays } from '../core/dates.js';

export const enTests = tests => tests.filter(t => t.subject === 'en').sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || '').localeCompare(b.createdAt || ''));
export const enSessions = sessions => sessions.filter(s => s.subject === 'en').sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
export const lastOf = (tests, exam) => { const l = tests.filter(t => t.exam === exam); return l.length ? l[l.length - 1] : null; };
export const suggestedLevel = tests => { const t = lastOf(tests, 'efset'); return t ? { level: efsetLevel(t.total), test: t } : null; };

export function minutesBySkill(sessions, from) {
  const m = Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0]));
  for (const s of sessions) if (s.date >= from && m[s.section] != null) m[s.section] += +s.minutes || 0;
  return m;
}

/* Jours d'affilée avec au moins une séance, en comptant jusqu'à aujourd'hui (ou hier si rien aujourd'hui). */
export function streak(sessions, today) {
  const days = new Set(sessions.map(s => s.date));
  let d = days.has(today) ? today : addDays(today, -1), n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
export const activeDays = (sessions, from) => new Set(sessions.filter(s => s.date >= from).map(s => s.date)).size;
export const wordsSince = (sessions, from) => sessions.filter(s => s.date >= from).reduce((a, s) => a + (+s.words || 0), 0);

/* Plan : blocs de 30 min, tous les jours. Chaque compétence pèse 1 (vocabulaire 0,6), plus jusqu'à +1
   si elle a été moins travaillée que la moyenne ces 14 derniers jours. Activité adaptée au palier du niveau actuel. */
export function weights(bySkill) {
  const keys = Object.keys(SKILLS), avg = keys.reduce((a, k) => a + bySkill[k], 0) / keys.length;
  return Object.fromEntries(keys.map(k => [k, (k === 'vocab' ? 0.6 : 1) + (avg ? Math.max(0, (avg - bySkill[k]) / avg) : 0)]));
}

export function weekPlan({ days, weeklyMinutes, level, bySkill }) {
  if (!weeklyMinutes || !days.length) return [];
  const w = weights(bySkill), sum = Object.values(w).reduce((a, b) => a + b, 0), band = bandOf(level);
  const n = Math.max(1, Math.round(weeklyMinutes / 30));
  // Plus forts restes : le total des blocs vaut exactement n.
  const raw = Object.fromEntries(Object.keys(w).map(k => [k, n * w[k] / sum]));
  const counts = Object.fromEntries(Object.keys(raw).map(k => [k, Math.floor(raw[k])]));
  let rest = n - Object.values(counts).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(raw).sort((a, b) => (raw[b] % 1) - (raw[a] % 1))) { if (rest <= 0) break; counts[k]++; rest--; }
  const blocks = [], order = Object.keys(w).sort((a, b) => w[b] - w[a]);
  let left = true;
  while (left) { left = false; for (const k of order) if (counts[k] > 0) { counts[k]--; left = true; blocks.push({ section: k, topic: ACTIVITIES[k][band], minutes: 30 }); } }
  return blocks.map((b, i) => ({ ...b, date: days[i % days.length] })).sort((a, b) => a.date.localeCompare(b.date));
}

export const sessionTitle = b => `Anglais ${SKILLS[b.section].short} · ${b.topic}`;
