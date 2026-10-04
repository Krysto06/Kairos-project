/* Dates locales au format clé « AAAA-MM-JJ » (pas d'UTC : une tâche de lundi reste lundi). */
const pad = n => String(n).padStart(2, '0');
export const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const todayKey = () => toKey(new Date());
export const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return toKey(d); };

/* Lundi de la semaine qui contient k. */
export const weekStart = k => { const d = fromKey(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toKey(d); };
export const weekDays = k => { const s = weekStart(k); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); };

/* Numéro de semaine ISO 8601, ex. « 2026-W40 ». */
export function isoWeekId(k) {
  const d = fromKey(k);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(((d - jan4) / 864e5 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${pad(week)}`;
}

export const dayLabel = (k, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => new Intl.DateTimeFormat('fr-FR', opts).format(fromKey(k));
export const shortDay = k => new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(fromKey(k));
export const shortDate = k => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(fromKey(k));

export function minutesLabel(m) {
  m = Math.round(m || 0);
  if (m < 60) return m + ' min';
  return Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + pad(m % 60) : '');
}
