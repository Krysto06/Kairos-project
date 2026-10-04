/* Lecture de relevés bancaires CSV exportés à la main. Formats français et internationaux. */

/* Découpe un CSV (séparateur ; , ou tabulation détecté sur l'en-tête), guillemets gérés. */
export function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/).find(l => l.trim()) || '';
  const sep = [';', '\t', ','].map(c => [c, first.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === sep) { row.push(cell.trim()); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell.trim()); if (row.some(x => x)) rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  row.push(cell.trim()); if (row.some(x => x)) rows.push(row);
  return { sep, header: rows[0] || [], rows: rows.slice(1) };
}

/* « 1 234,56 », « -45.10 », « 1,234.56 € » → nombre (null si illisible). */
export function parseAmount(s) {
  if (s == null) return null;
  let t = String(s).replace(/[\s  €$£]|CHF|EUR|USD|FCFA|HTG|CAD/gi, '');
  if (!t) return null;
  const neg = /^\(.*\)$/.test(t) || /-$/.test(t); t = t.replace(/[()]/g, '').replace(/-$/, '');
  const lc = t.lastIndexOf(','), ld = t.lastIndexOf('.');
  if (lc > ld) t = t.replace(/\./g, '').replace(',', '.'); else t = t.replace(/,/g, '');
  const n = parseFloat(t);
  return isNaN(n) ? null : (neg ? -Math.abs(n) : n);
}

/* « 03/10/2026 », « 2026-10-03 », « 03.10.26 » → « 2026-10-03 » (jour avant mois pour les formats à barres). */
export function parseDate(s) {
  s = String(s || '').trim();
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; }
  return null;
}

/* Devine les colonnes date / libellé / montant (ou débit + crédit) d'après l'en-tête. */
export function guessColumns(header) {
  const find = re => header.findIndex(h => re.test(h));
  return {
    date: find(/date/i),
    label: find(/libell|label|description|intitul|détail|detail|opération|operation|motif/i),
    amount: find(/^montant$|amount|montant(?!.*(débit|crédit|debit|credit))/i),
    debit: find(/débit|debit/i),
    credit: find(/crédit|credit/i),
  };
}
