import { h, focusLater } from '../core/dom.js';
import { uid } from '../core/utils.js';
import { money, percent, monthYear } from '../core/format.js';
import { KINDS, CURRENCIES } from '../data/defaults.js';
import { budgetSummary, budgetInsight } from '../domain/budget.js';
import { CARD, BTN_SM, IN, EYEBROW, H3 } from '../ui/classes.js';
import { pageHeader, statusBadge, notice, field } from '../ui/components.js';

const SEG = { besoin: 'bg-edu text-edu-ink', envie: 'bg-sty text-sty-ink', epargne: 'bg-fin text-fin-ink', reste: 'text-muted' };

export default function finance(ctx) {
  const b = ctx.state.budget, fmt = n => money(n, b.currency);
  const chart = h('div', { class: 'grid gap-4' }), insight = h('p', { class: 'mt-6 border-t border-line pt-4 text-sm leading-relaxed' });
  const out = {}, pctCells = {};
  /* Mise à jour partielle pendant la saisie : on ne re-rend pas toute la page pour garder le focus. */
  const changed = () => { ctx.commit(); paint(); };

  function paint() {
    const c = budgetSummary(b);
    out.spent.textContent = fmt(c.spent); out.rest.textContent = fmt(c.rest);
    out.rest.classList.toggle('text-warn', c.rest < 0);
    out.rate.textContent = c.sal ? percent(c.saveRate) : '–';
    const seg = (k, v, lab) => h('span', { class: 'flex items-center justify-center overflow-hidden whitespace-nowrap font-mono text-[11px] transition-all duration-500 ' + SEG[k], style: `flex:0 0 ${Math.max(0, v) * 100}%`, title: `${lab} : ${percent(v)}` }, v >= 0.08 ? percent(v) : '');
    const tot = Math.max(c.sal, c.spent) || 1;
    const row = (l, ...segs) => h('div', { class: 'grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr] items-center gap-3' }, h('span', { class: EYEBROW }, l), h('div', { class: 'flex h-8 overflow-hidden rounded-md bg-soft' }, segs));
    chart.replaceChildren(
      row('Ton mois', seg('besoin', c.by.besoin / tot, 'Besoins'), seg('envie', c.by.envie / tot, 'Envies'), seg('epargne', c.by.epargne / tot, 'Épargne'), c.rest > 0 ? seg('reste', c.rest / tot, 'Non affecté') : null),
      row('Règle 50/30/20', seg('besoin', 0.5, 'Besoins'), seg('envie', 0.3, 'Envies'), seg('epargne', 0.2, 'Épargne')),
      h('div', { class: 'flex flex-wrap gap-4 text-[13px] text-muted' }, [['bg-edu', 'Besoins'], ['bg-sty', 'Envies'], ['bg-fin', 'Épargne & avenir'], ['bg-soft border border-line', 'Non affecté']].map(([cl, l]) => h('span', { class: 'inline-flex items-center gap-1.5' }, h('i', { class: 'inline-block h-2.5 w-2.5 rounded-sm ' + cl }), l))));
    insight.textContent = budgetInsight(c, b.currency);
    for (const l of b.lines) if (pctCells[l.id]) pctCells[l.id].textContent = c.sal ? percent((+l.amount || 0) / c.sal) : '';
  }

  const kpi = (label, key) => h('div', { class: 'grid gap-1 border-t border-line pt-4 min-w-0' }, h('div', { class: EYEBROW }, label), out[key] = h('div', { class: 'font-display text-[2rem] leading-tight font-semibold tnum' }));
  const kpis = h('div', { class: 'grid gap-x-8 gap-y-6 grid-cols-2 lg:grid-cols-4 mb-10' },
    h('div', { class: 'col-span-2 lg:col-span-1 grid gap-1 border-t-2 border-fin-ink pt-4 min-w-0' },
      h('label', { class: EYEBROW, for: 'salary' }, 'Salaire net · ' + monthYear(new Date())),
      h('input', { id: 'salary', type: 'number', min: 0, step: 10, inputmode: 'decimal', value: b.salary || '', placeholder: '0',
        class: 'w-full bg-transparent font-display text-[2rem] leading-tight font-semibold text-fin-ink tnum border-0 border-b border-dashed border-fin-ink/50 focus:border-solid focus:outline-none p-0',
        oninput: e => { b.salary = +e.target.value || 0; b.example = false; changed(); } })),
    kpi('Dépenses prévues', 'spent'), kpi('Reste à affecter', 'rest'), kpi('Taux d’épargne', 'rate'));

  const rows = b.lines.map(l => h('div', { class: 'grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_150px_110px_48px_28px] items-center gap-2 py-2 border-t border-line first:border-t-0' },
    h('input', { class: IN, id: 'bl-' + l.id, value: l.label, 'aria-label': 'Poste', oninput: e => { l.label = e.target.value; ctx.commit(); } }),
    h('button', { type: 'button', class: 'sm:hidden text-muted hover:text-warn px-1 cursor-pointer', 'aria-label': 'Supprimer ' + l.label, onclick: () => ctx.update(() => { b.lines = b.lines.filter(x => x.id !== l.id); }) }, '✕'),
    h('select', { class: IN + ' cursor-pointer', id: 'bk-' + l.id, 'aria-label': 'Type', onchange: e => { l.kind = e.target.value; changed(); } }, Object.entries(KINDS).map(([k, v]) => h('option', { value: k, selected: l.kind === k }, v))),
    h('input', { class: IN + ' text-right font-mono', id: 'ba-' + l.id, type: 'number', min: 0, step: 5, inputmode: 'decimal', value: l.amount || '', placeholder: '0', 'aria-label': 'Montant', oninput: e => { l.amount = +e.target.value || 0; b.example = false; changed(); } }),
    pctCells[l.id] = h('span', { class: 'hidden sm:block text-right font-mono text-xs text-muted tnum' }),
    h('button', { type: 'button', class: 'hidden sm:block text-muted hover:text-warn cursor-pointer', 'aria-label': 'Supprimer ' + l.label, onclick: () => ctx.update(() => { b.lines = b.lines.filter(x => x.id !== l.id); }) }, '✕')));

  const view = h('div', { class: 'view', 'data-c': 'fin' },
    pageHeader({ eyebrow: 'Vie & projets', title: 'Finance', lead: 'Ton salaire, ton budget du mois, et la comparaison avec la règle 50/30/20.',
      badges: [statusBadge('live'), statusBadge('connect', 'Banque : à connecter')],
      actions: h('div', { class: 'w-32' }, field('cur', 'Devise', h('select', { class: IN + ' cursor-pointer', id: 'cur', onchange: e => ctx.update(() => { b.currency = e.target.value; }) }, CURRENCIES.map(c => h('option', { value: c, selected: b.currency === c }, c))))) }),
    b.example ? h('div', { class: 'mb-6' }, notice('Chiffres d’exemple. Remplace-les par les tiens : ce message disparaît à ta première modification.', 'gold')) : null,
    kpis,
    h('div', { class: 'grid gap-6 lg:grid-cols-[1fr_1.15fr]' },
      h('div', { class: CARD }, h('h3', { class: H3 + ' mb-5' }, 'Répartition'), chart, insight),
      h('div', { class: CARD },
        h('div', { class: 'flex items-center justify-between gap-2 mb-3' }, h('h3', { class: H3 }, 'Budget du mois'),
          h('button', { type: 'button', class: BTN_SM, onclick: () => { const id = 'l' + uid(); ctx.update(() => { b.lines.push({ id, label: 'Nouveau poste', kind: 'besoin', amount: 0 }); }); focusLater('bl-' + id); } }, '+ Poste')),
        h('div', {}, rows))),
    h('p', { class: 'mt-6 text-[13px] text-muted' }, 'Saisie manuelle. Un seul budget, celui du mois en cours : l’historique mois par mois et les transactions viendront avec la base de données.'));
  paint();
  return view;
}
