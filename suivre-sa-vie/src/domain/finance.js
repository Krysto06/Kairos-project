/* Finance : transactions réelles, mois, épargne, historique. Fonctions pures.
   Transaction : { id, date, label, amount (positif), type:'out'|'in', category: id de poste | null, note, source:'manual'|'csv', createdAt }
   Mois archivé : { id:'AAAA-MM', salary, currency, lines, closedAt }
   Objectif d'épargne (état) : { id, name, target, saved, deadline } */
import { addDays, fromKey, toKey } from '../core/dates.js';

export const monthOf = dateKey => dateKey.slice(0, 7);
export const monthLabel = m => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(+m.slice(0, 4), +m.slice(5, 7) - 1, 1));
export function shiftMonth(m, n) { const d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + n, 1); return toKey(d).slice(0, 7); }

export const txOfMonth = (txs, m) => txs.filter(t => t.date && monthOf(t.date) === m).sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));

/* Prévu (budget du mois : archivé s'il existe, sinon modèle actuel) contre réel (transactions). */
export function monthSummary(txs, budget) {
  const income = txs.filter(t => t.type === 'in').reduce((a, t) => a + t.amount, 0);
  const outs = txs.filter(t => t.type === 'out');
  const byLine = Object.fromEntries(budget.lines.map(l => [l.id, 0]));
  const kindOf = Object.fromEntries(budget.lines.map(l => [l.id, l.kind]));
  const byKind = { besoin: 0, envie: 0, epargne: 0 };
  let uncategorized = 0;
  for (const t of outs) {
    if (t.category && byLine[t.category] != null) { byLine[t.category] += t.amount; byKind[kindOf[t.category]] += t.amount; }
    else uncategorized += t.amount;
  }
  const spent = outs.reduce((a, t) => a + t.amount, 0);
  const base = income || +budget.salary || 0;
  const consumption = byKind.besoin + byKind.envie + uncategorized;
  return { income, incomeIsPlanned: !income && !!budget.salary, base, spent, byLine, byKind, uncategorized, rest: base - spent,
    saveRate: base ? Math.max(0, base - consumption) / base : 0, count: txs.length };
}

/* Revenus, dépenses et épargne des n derniers mois (le mois courant inclus). */
export function history(txs, currentMonth, n = 6) {
  return Array.from({ length: n }, (_, i) => shiftMonth(currentMonth, i - n + 1)).map(m => {
    const list = txOfMonth(txs, m);
    const income = list.filter(t => t.type === 'in').reduce((a, t) => a + t.amount, 0);
    const spent = list.filter(t => t.type === 'out').reduce((a, t) => a + t.amount, 0);
    return { month: m, income, spent, net: income - spent, count: list.length };
  });
}

/* Objectif d'épargne : reste à mettre de côté et effort mensuel jusqu'à l'échéance. */
export function savingsPlan(goal, today) {
  const remaining = Math.max(0, (+goal.target || 0) - (+goal.saved || 0));
  const p = goal.target ? Math.min(1, (+goal.saved || 0) / goal.target) : 0;
  if (!goal.deadline) return { remaining, p, months: null, monthly: null };
  const a = fromKey(today), b = fromKey(goal.deadline);
  const months = Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth());
  return { remaining, p, months, monthly: months ? remaining / months : remaining };
}

/* Fonds d'urgence conseillé : 3 à 6 mois de dépenses essentielles (postes « Besoins » du budget). */
export const emergencyRange = budget => { const b = budget.lines.filter(l => l.kind === 'besoin').reduce((a, l) => a + (+l.amount || 0), 0); return { min: 3 * b, max: 6 * b, monthly: b }; };

/* Catégorie déjà donnée à un libellé identique : réutilisée à l'import. */
const norm = s => (s || '').toLowerCase().replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
export function categoryMemory(txs) {
  const m = new Map();
  for (const t of txs) if (t.category && t.type === 'out') m.set(norm(t.label), t.category);
  return label => m.get(norm(label)) || null;
}

/* Clé de doublon pour l'import : même date, même montant, même libellé. */
export const dupKey = t => `${t.date}|${t.type}|${Math.round(t.amount * 100)}|${norm(t.label)}`;
