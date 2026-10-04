/* Référentiel de compétences : niveau actuel et visé sur 0–5, et preuves (projet, certificat, cours). */
import { h, focusLater } from '../../core/dom.js';
import { SKILL_CATEGORIES, SKILL_LEVELS, SUGGESTED_SKILLS } from '../../data/content/skills.js';
import { CARD, BTN, GHOST, IN, H3, EYEBROW } from '../../ui/classes.js';
import { field, emptyState, statusBadge } from '../../ui/components.js';

export default function map(ctx, K) {
  const ui = ctx.ui, list = K.skills(), names = new Set(list.map(s => s.name.toLowerCase()));
  const missing = SUGGESTED_SKILLS.filter(([n]) => !names.has(n.toLowerCase()));
  let nIn, cIn;

  const levelPicker = s => h('div', { class: 'flex gap-1', role: 'radiogroup', 'aria-label': 'Niveau actuel : ' + s.name },
    SKILL_LEVELS.map((label, i) => h('button', { type: 'button', role: 'radio', 'aria-checked': s.level === i, title: `${i} · ${label}`,
      onclick: () => { K.updateSkill(s.id, { level: s.level === i ? null : i }); ctx.render(); },
      class: 'grid h-7 w-7 place-items-center rounded-md border font-mono text-[11px] transition cursor-pointer '
        + (s.level != null && i <= s.level ? 'border-sk-ink bg-sk-ink text-surface' : s.target != null && i <= s.target ? 'border-sk-ink/40 text-sk-ink' : 'border-line text-muted hover:border-sk-ink/50') }, i)));

  const row = s => {
    const confirming = ui.confirm === 'sk-' + s.id;
    return h('li', { class: 'grid gap-3 py-4 lg:grid-cols-[minmax(0,200px)_auto_150px_minmax(0,1fr)_auto] lg:items-center lg:gap-5', 'data-c': 'sk' },
      h('div', { class: 'min-w-0' }, h('div', { class: 'font-medium break-words' }, s.name), h('div', { class: 'text-[12px] text-muted' }, s.level != null ? SKILL_LEVELS[s.level] : 'niveau non évalué')),
      levelPicker(s),
      h('select', { class: IN + ' cursor-pointer py-1.5', id: 'skt-' + s.id, 'aria-label': 'Niveau visé : ' + s.name, onchange: e => { K.updateSkill(s.id, { target: e.target.value === '' ? null : +e.target.value }); ctx.render(); } },
        h('option', { value: '' }, 'Cible : –'), SKILL_LEVELS.map((l, i) => i ? h('option', { value: i, selected: s.target === i }, `Cible : ${i} · ${l}`) : null)),
      h('input', { class: IN + ' py-1.5', id: 'ske-' + s.id, value: s.evidence || '', placeholder: 'Preuve : projet, certificat, cours…', 'aria-label': 'Preuve pour ' + s.name, oninput: e => K.updateSkill(s.id, { evidence: e.target.value }) }),
      h('button', { type: 'button', class: 'justify-self-start text-[12.5px] font-medium cursor-pointer ' + (confirming ? 'text-warn' : 'text-muted hover:text-warn'),
        onclick: () => { if (confirming) { ui.confirm = null; K.removeSkill(s.id); } else { ui.confirm = 'sk-' + s.id; ctx.render(); } } }, confirming ? 'Confirmer' : 'Supprimer'));
  };

  const groups = Object.entries(SKILL_CATEGORIES).map(([k, label]) => {
    const items = list.filter(s => s.category === k);
    return items.length ? h('section', { class: 'grid gap-1' }, h('h3', { class: EYEBROW }, `${label} · ${items.length}`), h('ul', { class: 'divide-y divide-line border-y border-line' }, items.map(row))) : null;
  }).filter(Boolean);

  return h('div', { class: 'grid gap-10' },
    h('p', { class: 'max-w-2xl text-sm text-muted' }, 'Évalue-toi de 0 (aucune notion) à 5 (experte), fixe le niveau visé et note la preuve qui le montre. Les cases claires montrent l’écart jusqu’à la cible.'),
    h('form', { class: CARD + ' grid gap-3 grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px_auto] items-end', onsubmit: e => { e.preventDefault(); const name = nIn.value.trim(); if (!name) return; K.addSkill({ name, category: cIn.value }); focusLater('skn', false); } },
      field('skn', 'Compétence', nIn = h('input', { class: IN, id: 'skn', autocomplete: 'off', placeholder: 'Ex. : modèles VAR' })),
      field('skc', 'Catégorie', cIn = h('select', { class: IN + ' cursor-pointer', id: 'skc' }, Object.entries(SKILL_CATEGORIES).map(([k, v]) => h('option', { value: k }, v)))),
      h('button', { type: 'submit', class: BTN }, 'Ajouter')),
    missing.length ? h('div', { class: 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3' },
      h('div', { class: 'flex flex-wrap items-center gap-2.5' }, statusBadge('demo', 'Suggestions'), h('span', { class: 'text-sm' }, `${missing.length} compétences courantes en économie, data et finance (Python, économétrie, analyse financière…). Ajoutées sans niveau : à toi de t’évaluer.`)),
      h('button', { type: 'button', class: GHOST, onclick: () => { for (const [name, category] of missing) ctx.state.learning.skills.push({ id: 'k' + Math.random().toString(36).slice(2, 9), name, category, level: null, target: null, evidence: '' }); ctx.commit(); ctx.render(true); } }, 'Ajouter les suggestions')) : null,
    groups.length ? h('div', { class: 'grid gap-10' }, groups) : emptyState('Ton référentiel est vide.'));
}
