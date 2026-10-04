import { h } from '../../core/dom.js';
import { todayKey, addDays, minutesLabel, dayLabel } from '../../core/dates.js';
import { GRE_SECTIONS, GRE_FORMAT, GRE_LINKS, SCORE_RANGE, AW_RANGE } from '../../data/content/gre.js';
import { latest, total, gaps, daysUntil, minutesSince, weakTopics, accuracyBy } from '../../domain/gre.js';
import { CARD, IN, H3, EYEBROW, GHOST } from '../../ui/classes.js';
import { metric, field, emptyState, linkChip, progressBar } from '../../ui/components.js';
import { scoreChart } from './scores.js';

const signed = n => n == null ? '–' : n > 0 ? '+' + n : String(n);

export function targetCard(ctx, G) {
  const t = G.settings.target;
  const num = (k, label) => field('gre-t-' + k, label, h('input', { class: IN + ' font-mono', id: 'gre-t-' + k, type: 'number', min: SCORE_RANGE.min, max: SCORE_RANGE.max, step: 1, inputmode: 'numeric',
    value: t[k] ?? '', placeholder: `${SCORE_RANGE.min}–${SCORE_RANGE.max}`, onchange: e => G.setTarget(k, e.target.value) }));
  const awOpts = []; for (let v = AW_RANGE.min; v <= AW_RANGE.max; v += AW_RANGE.step) awOpts.push(v);
  return h('div', { class: CARD + ' grid gap-5' },
    h('div', {}, h('h2', { class: H3 }, 'Ton objectif'), h('p', { class: 'mt-1 text-sm text-muted' }, 'Le score visé par tes masters, ta date de test et le temps que tu peux y consacrer. Le plan en dépend.')),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-5' },
      num('v', 'Cible Verbal'), num('q', 'Cible Quant'),
      field('gre-t-aw', 'Cible Writing', h('select', { class: IN + ' cursor-pointer', id: 'gre-t-aw', onchange: e => G.setTarget('aw', e.target.value) },
        h('option', { value: '' }, '–'), awOpts.map(v => h('option', { value: v, selected: t.aw === v }, v.toFixed(1).replace('.', ','))))),
      field('gre-date', 'Date du test', h('input', { class: IN, id: 'gre-date', type: 'date', value: G.settings.testDate || '', onchange: e => G.setSetting('testDate', e.target.value) })),
      field('gre-hours', 'Heures par semaine', h('input', { class: IN + ' font-mono', id: 'gre-hours', type: 'number', min: 1, max: 40, step: 1, inputmode: 'numeric', value: G.settings.weeklyHours ?? '', placeholder: 'ex. 8',
        onchange: e => G.setSetting('weeklyHours', e.target.value === '' ? null : Math.min(40, Math.max(1, Math.round(+e.target.value) || 1))) }))));
}

export default function overview(ctx, G, go) {
  const tests = G.tests(), sessions = G.sessions(), last = latest(tests), target = G.settings.target, today = todayKey();
  const g = gaps(target, last), left = daysUntil(G.settings.testDate, today);
  const tgtTotal = target.v != null && target.q != null ? target.v + target.q : null;
  const weak = weakTopics(sessions).slice(0, 3);
  const acc = accuracyBy(sessions.filter(s => s.date >= addDays(today, -29)), s => s.section);

  return h('div', { class: 'grid gap-12' },
    h('div', { class: 'grid gap-x-8 gap-y-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5' },
      metric({ label: 'Score actuel', value: total(last) ?? '–', sub: last ? (tgtTotal ? `cible ${tgtTotal} · ${last.v} V + ${last.q} Q` : `${last.v} V + ${last.q} Q`) : 'aucun test enregistré', color: 'edu' }),
      metric({ label: 'Écart Quant', value: signed(g.q), sub: target.q ? 'cible ' + target.q : 'cible à fixer', color: 'edu' }),
      metric({ label: 'Écart Verbal', value: signed(g.v), sub: target.v ? 'cible ' + target.v : 'cible à fixer', color: 'edu' }),
      metric({ label: 'Avant le test', value: left == null ? '–' : left >= 0 ? `J-${left}` : 'Passé', sub: G.settings.testDate ? dayLabel(G.settings.testDate, { day: 'numeric', month: 'long', year: 'numeric' }) : 'date à fixer', color: 'edu' }),
      metric({ label: 'Étude sur 7 jours', value: minutesLabel(minutesSince(sessions, addDays(today, -6))), sub: G.settings.weeklyHours ? `objectif ${G.settings.weeklyHours} h` : 'séances enregistrées', color: 'edu' })),

    targetCard(ctx, G),

    h('div', { class: CARD + ' grid gap-4' },
      h('div', { class: 'flex flex-wrap items-end justify-between gap-2' }, h('h2', { class: H3 }, 'Évolution des scores'), h('button', { type: 'button', class: GHOST, onclick: () => go('scores') }, 'Ajouter un test')),
      tests.some(t => t.v && t.q) ? scoreChart(tests, target)
        : emptyState('Aucun score pour l’instant. Commence par un diagnostic POWERPREP (gratuit sur le site d’ETS), puis enregistre tes scores ici.', linkChip('Ouvrir POWERPREP', GRE_LINKS[1][1]))),

    h('div', { class: 'grid gap-6 lg:grid-cols-2' },
      h('div', { class: CARD + ' grid gap-4 content-start' },
        h('h2', { class: H3 }, 'Points faibles'),
        weak.length ? h('ul', { class: 'grid gap-3' }, weak.map(w => h('li', { class: 'grid gap-1.5', 'data-c': 'edu' },
            h('div', { class: 'flex items-baseline justify-between gap-3 text-sm' }, h('span', { class: 'font-medium' }, `${GRE_SECTIONS[w.section].short} · ${w.topic}`), h('span', { class: 'font-mono text-xs text-muted tnum' }, `${Math.round(w.p * 100)} % · ${w.attempted} q.`)),
            progressBar(w.p))))
          : h('p', { class: 'text-sm text-muted' }, 'Enregistre tes séances avec le nombre de questions et de bonnes réponses. Un thème apparaît ici à partir de 10 questions.'),
        acc.length ? h('p', { class: 'border-t border-line pt-3 text-[13px] text-muted tnum' }, 'Précision sur 30 jours : ' + acc.map(a => `${GRE_SECTIONS[a.key].short} ${Math.round(a.p * 100)} %`).join(' · ')) : null),
      h('div', { class: CARD + ' grid gap-4 content-start' },
        h('h2', { class: H3 }, 'Format du test'),
        h('dl', { class: 'grid gap-2.5 text-sm' }, GRE_FORMAT.map(([k, v]) => h('div', { class: 'grid gap-0.5 sm:grid-cols-[150px_1fr] sm:gap-4' }, h('dt', { class: 'text-muted' }, k), h('dd', {}, v)))),
        h('p', { class: 'border-t border-line pt-3 text-[12.5px] text-muted' }, 'Format en vigueur depuis septembre 2023, écrit dans l’app. Vérifie-le sur le site d’ETS avant de t’inscrire : l’app ne le consulte pas.'),
        h('div', { class: 'flex flex-wrap gap-x-4 gap-y-1.5' }, GRE_LINKS.map(([l, u]) => linkChip(l, u))))));
}
