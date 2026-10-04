/* Budget du mois : fonctions pures. */
import { money, percent } from '../core/format.js';

export function budgetSummary(budget) {
  const sal = +budget.salary || 0, by = { besoin: 0, envie: 0, epargne: 0 };
  for (const l of budget.lines) by[l.kind] = (by[l.kind] || 0) + (+l.amount || 0);
  const spent = by.besoin + by.envie + by.epargne;
  return { sal, by, spent, rest: sal - spent, saveRate: sal ? (by.epargne + Math.max(0, sal - spent)) / sal : 0 };
}

/* Phrase de lecture du budget, comparée à la règle 50/30/20. */
export function budgetInsight(c, currency) {
  const f = n => money(n, currency);
  if (!c.sal) return 'Entre ton salaire net du mois pour voir la répartition.';
  if (c.rest < 0) return `Tu prévois ${f(-c.rest)} de plus que ton salaire ce mois-ci. Commence par réduire les envies.`;
  const e = c.by.epargne / c.sal;
  return e >= 0.2
    ? `${percent(e)} de ton salaire va à l’épargne et à l’avenir. Tu dépasses l’objectif de 20 %.`
    : `Tu mets ${percent(e)} de côté. Pour atteindre 20 %, il faudrait ${f(0.2 * c.sal - c.by.epargne)} de plus par mois. Les ${f(c.rest)} non affectés peuvent servir.`;
}
