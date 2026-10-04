/* Données Finance : budget modèle et épargne dans l'état ; transactions et mois clôturés en collections. */
import { clone, uid } from '../../core/utils.js';
import { money } from '../../core/format.js';
import { h } from '../../core/dom.js';
import { todayKey } from '../../core/dates.js';
import { txOfMonth, monthLabel, shiftMonth } from '../../domain/finance.js';
import { GHOST } from '../../ui/classes.js';
import { newId } from '../../services/collections.js';

export function finance(ctx) {
  const S = ctx.state, txs = ctx.col('transactions'), budgets = ctx.col('budgets'), now = () => new Date().toISOString();
  const after = () => ctx.render(true);
  const F = {
    fmt: n => money(n, S.budget.currency),
    all: () => txs.all(),
    month: m => txOfMonth(txs.all(), m),
    /* Budget d'un mois : la copie archivée s'il a été clôturé, sinon le modèle actuel. */
    budgetOf: m => budgets.get(m) || S.budget,
    closed: m => budgets.get(m),
    lineName: id => (S.budget.lines.find(l => l.id === id) || {}).label,
    add(f) { txs.put({ id: newId('f'), note: '', category: null, source: 'manual', createdAt: now(), ...f }); after(); },
    addMany(list) { const c = now(); for (const f of list) txs.put({ id: newId('f'), note: '', category: null, createdAt: c, ...f }); after(); },
    patch(id, f) { txs.patch(id, f); ctx.render(); },
    remove(id) { txs.remove(id); after(); },
    closeMonth(m) { budgets.put({ id: m, salary: S.budget.salary, currency: S.budget.currency, lines: clone(S.budget.lines), closedAt: now() }); after(); },
    reopenMonth(m) { budgets.remove(m); after(); },
    savings: () => S.finance.savings,
    addGoal(f) { S.finance.savings.push({ id: 'e' + uid(), saved: 0, deadline: '', ...f }); ctx.commit(); after(); },
    patchGoal(id, f) { Object.assign(S.finance.savings.find(g => g.id === id), f); ctx.commit(); },
    removeGoal(id) { S.finance.savings = S.finance.savings.filter(g => g.id !== id); ctx.commit(); after(); },
  };
  return F;
}

/* Sélecteur de mois partagé par les onglets Mois et Transactions. */

export function monthNav(ctx) {
  const m = ctx.ui.finMonth, cur = todayKey().slice(0, 7);
  const set = v => { ctx.ui.finMonth = v; ctx.ui.confirm = null; ctx.render(); };
  return h('div', { class: 'flex flex-wrap items-center gap-2' },
    h('button', { type: 'button', class: GHOST, onclick: () => set(shiftMonth(m, -1)), 'aria-label': 'Mois précédent' }, '←'),
    h('div', { class: 'min-w-[160px] text-center font-display text-xl font-semibold first-letter:uppercase' }, monthLabel(m)),
    h('button', { type: 'button', class: GHOST, onclick: () => set(shiftMonth(m, 1)), disabled: m >= cur, 'aria-label': 'Mois suivant' }, '→'),
    m === cur ? null : h('button', { type: 'button', class: GHOST, onclick: () => set(cur) }, 'Ce mois-ci'));
}
