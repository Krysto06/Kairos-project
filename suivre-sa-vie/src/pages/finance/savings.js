import { h, focusLater } from '../../core/dom.js';
import { todayKey, shortDate } from '../../core/dates.js';
import { savingsPlan, emergencyRange } from '../../domain/finance.js';
import { CARD, BTN, IN, H3, EYEBROW, DANGER } from '../../ui/classes.js';
import { field, emptyState, progressBar, notice } from '../../ui/components.js';

const num = v => { const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? 0 : Math.max(0, Math.round(n * 100) / 100); };

export default function savings(ctx, F) {
  const ui = ctx.ui, goals = F.savings(), today = todayKey(), er = emergencyRange(ctx.state.budget);
  const hasEmergency = goals.some(g => /urgence|précaution/i.test(g.name));
  let nIn, tIn, dIn;

  const form = h('form', { class: CARD + ' grid gap-3 grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_150px_170px_auto] items-end',
    onsubmit: e => { e.preventDefault(); const name = nIn.value.trim(), target = num(tIn.value); if (!name || !target) return; F.addGoal({ name, target, deadline: dIn.value || '' }); focusLater('sv-name', false); } },
    h('div', { class: 'col-span-2 lg:col-span-1' }, field('sv-name', 'Objectif d’épargne', nIn = h('input', { class: IN, id: 'sv-name', autocomplete: 'off', placeholder: 'Ex. : frais GRE et TOEFL' }))),
    field('sv-target', 'Montant visé', tIn = h('input', { class: IN + ' font-mono text-right', id: 'sv-target', inputmode: 'decimal', placeholder: '0', autocomplete: 'off' })),
    field('sv-date', 'Pour le', dIn = h('input', { class: IN, id: 'sv-date', type: 'date', min: today })),
    h('button', { type: 'submit', class: BTN + ' col-span-2 lg:col-span-1' }, 'Créer'));

  const card = g => {
    const sp = savingsPlan(g, today), confirming = ui.confirm === 'sv-' + g.id;
    return h('li', { class: CARD + ' grid gap-4', 'data-c': 'fin' },
      h('div', { class: 'flex flex-wrap items-start justify-between gap-3' },
        h('div', { class: 'min-w-0' }, h('h3', { class: H3 + ' break-words' }, g.name), h('p', { class: 'text-[13px] text-muted' }, g.deadline ? 'pour le ' + shortDate(g.deadline) : 'sans échéance')),
        h('button', { type: 'button', class: confirming ? DANGER : 'text-[12.5px] font-medium text-muted hover:text-warn cursor-pointer', onclick: () => { if (confirming) { ui.confirm = null; F.removeGoal(g.id); } else { ui.confirm = 'sv-' + g.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer')),
      h('div', { class: 'flex items-center gap-3' }, progressBar(sp.p, 'flex-1'), h('span', { class: 'font-mono text-xs text-muted tnum' }, `${Math.round(sp.p * 100)} %`)),
      h('div', { class: 'grid gap-3 grid-cols-2' },
        field('svs-' + g.id, 'Déjà épargné', h('input', { class: IN + ' font-mono text-right', id: 'svs-' + g.id, inputmode: 'decimal', value: g.saved || '', placeholder: '0', onchange: e => { F.patchGoal(g.id, { saved: num(e.target.value) }); ctx.render(); } })),
        field('svt-' + g.id, 'Montant visé', h('input', { class: IN + ' font-mono text-right', id: 'svt-' + g.id, inputmode: 'decimal', value: g.target, onchange: e => { F.patchGoal(g.id, { target: num(e.target.value) || g.target }); ctx.render(); } }))),
      h('p', { class: 'text-sm' }, sp.remaining <= 0 ? 'Objectif atteint.' : sp.monthly == null ? `Reste ${F.fmt(sp.remaining)}. Ajoute une échéance pour connaître l’effort mensuel.`
        : sp.months ? `Reste ${F.fmt(sp.remaining)}, soit ${F.fmt(Math.ceil(sp.monthly))} par mois pendant ${sp.months} mois.` : `Reste ${F.fmt(sp.remaining)} pour ce mois-ci.`));
  };

  return h('div', { class: 'grid gap-10' },
    h('p', { class: 'max-w-2xl text-sm text-muted' }, 'Des objectifs chiffrés avec une échéance : l’app calcule combien mettre de côté chaque mois. Le montant déjà épargné se met à jour à la main.'),
    er.monthly && !hasEmergency ? h('div', { class: 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3' },
      h('p', { class: 'text-sm' }, `Repère : un fonds d’urgence couvre 3 à 6 mois de dépenses essentielles, soit ${F.fmt(er.min)} à ${F.fmt(er.max)} d’après ton budget.`),
      h('button', { type: 'button', class: 'rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium hover:border-ink/40 cursor-pointer', onclick: () => F.addGoal({ name: 'Fonds d’urgence', target: er.min }) }, 'Créer cet objectif')) : null,
    form,
    goals.length ? h('ul', { class: 'grid gap-6 md:grid-cols-2' }, goals.map(card)) : emptyState('Aucun objectif d’épargne. Commence par le fonds d’urgence ou les frais d’examens (GRE, TOEFL).'));
}
