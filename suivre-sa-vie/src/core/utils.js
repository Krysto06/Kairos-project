export const clone = o => JSON.parse(JSON.stringify(o));
export const uid = () => Math.random().toString(36).slice(2, 9);
export const clamp01 = n => Math.max(0, Math.min(1, n || 0));

/* JSON à clés triées : sert à comparer deux états sans dépendre de l'ordre des clés. */
export const stable = v => Array.isArray(v) ? '[' + v.map(stable).join(',') + ']'
  : (v && typeof v === 'object') ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}'
  : JSON.stringify(v);

/* Ajoute https:// si besoin. N'accepte que http(s), ce qui écarte javascript: et autres schémas. */
export function normalizeUrl(u) {
  u = (u || '').trim();
  if (!u) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
  return /^https?:\/\//i.test(u) ? u : '';
}

export const toggleIn = (list, value) => list.includes(value) ? list.filter(x => x !== value) : list.concat(value);
