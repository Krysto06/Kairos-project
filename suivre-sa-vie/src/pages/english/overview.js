import { h } from '../../core/dom.js';
import { todayKey, addDays, minutesLabel, shortDate, dayLabel, daysBetween } from '../../core/dates.js';
import { LEVELS, SKILLS, EXAMS, EN_LINKS, levelIndex } from '../../data/content/english.js';
import { lastOf, suggestedLevel, minutesBySkill, streak, activeDays, wordsSince } from '../../domain/english.js';
import { CARD, IN, H3, EYEBROW, GHOST, BTN_SM } from '../../ui/classes.js';
import { metric, field, linkChip, notice } from '../../ui/components.js';

export function settingsCard(E) {
  const s = E.settings, ex = s.exam && EXAMS[s.exam];
  return h('div', { class: CARD + ' grid gap-5' },
    h('div', {}, h('h2', { class: H3 }, 'Ton objectif'), h('p', { class: 'mt-1 text-sm text-muted' }, 'Ton niveau actuel, le niveau visé, l’examen que demandent tes masters et le temps que tu y consacres.')),
    h('div', { class: 'grid gap-3 grid-cols-2 lg:grid-cols-3' },
      field('en-level', 'Niveau actuel', h('select', { class: IN + ' cursor-pointer', id: 'en-level', onchange: e => E.set('level', e.target.value || null) },
        h('option', { value: '' }, 'À évaluer'), LEVELS.map(l => h('option', { value: l.id, selected: s.level === l.id }, `${l.id} · ${l.label}`)))),
      field('en-target', 'Niveau visé', h('select', { class: IN + ' cursor-pointer', id: 'en-target', onchange: e => E.set('target', e.target.value) },
        LEVELS.map(l => h('option', { value: l.id, selected: s.target === l.id }, `${l.id} · ${l.label}`)))),
      field('en-hours', 'Heures par semaine', h('input', { class: IN + ' font-mono', id: 'en-hours', type: 'number', min: 1, max: 40, inputmode: 'numeric', value: s.weeklyHours ?? '', placeholder: 'ex. 5',
        onchange: e => E.set('weeklyHours', e.target.value === '' ? null : Math.min(40, Math.max(1, Math.round(+e.target.value) || 1))) })),
      field('en-exam', 'Examen visé', h('select', { class: IN + ' cursor-pointer', id: 'en-exam', onchange: e => { E.settings.examTarget = null; E.set('exam', e.target.value || null); } },
        h('option', { value: '' }, 'Pas encore choisi'), ['det', 'toefl'].map(k => h('option', { value: k, selected: s.exam === k }, EXAMS[k].label)))),
      field('en-exam-t', 'Score visé', h('input', { class: IN + ' font-mono', id: 'en-exam-t', type: 'number', disabled: !ex, min: ex ? ex.min : 0, max: ex ? ex.max : 0, step: ex ? ex.step : 1, inputmode: 'numeric',
        value: s.examTarget ?? '', placeholder: ex ? `${ex.min}–${ex.max}` : 'choisis un examen',
        onchange: e => E.set('examTarget', e.target.value === '' ? null : Math.min(ex.max, Math.max(ex.min, Math.round(+e.target.value)))) })),
      field('en-exam-d', 'Date de l’examen', h('input', { class: IN, id: 'en-exam-d', type: 'date', disabled: !ex, value: s.examDate || '', onchange: e => E.set('examDate', e.target.value) }))));
}

/* Échelle A1 → C2 : niveau actuel plein, niveau visé cerclé. */
function ladder(current, target) {
  const ci = levelIndex(current), ti = levelIndex(target);
  return h('ol', { class: 'grid grid-cols-6 gap-1.5', 'aria-label': 'Échelle des niveaux CECRL' }, LEVELS.map((l, i) => {
    const reached = ci >= 0 && i <= ci, isCur = i === ci, isTgt = i === ti;
    return h('li', { class: 'grid gap-2 min-w-0', 'aria-current': isCur ? 'step' : null },
      h('div', { class: 'h-2 rounded-full ' + (reached ? 'bg-edu-ink' : 'bg-soft') + (isTgt ? ' ring-2 ring-gold ring-offset-2 ring-offset-surface' : '') }),
      h('div', { class: 'font-mono text-[13px] ' + (isCur ? 'font-semibold text-ink' : 'text-muted') }, l.id),
      h('div', { class: 'hidden sm:block text-[12px] leading-snug ' + (isCur ? 'text-ink' : 'text-muted') }, l.label));
  }));
}

export default function overview(ctx, E, go) {
  const s = E.settings, tests = E.tests(), sessions = E.sessions(), today = todayKey();
  const sugg = suggestedLevel(tests), cur = LEVELS.find(l => l.id === s.level);
  const by = minutesBySkill(sessions, addDays(today, -27)), maxM = Math.max(1, ...Object.values(by));
  const week = minutesBySkill(sessions, addDays(today, -6)), weekTotal = Object.values(week).reduce((a, b) => a + b, 0);
  const examLast = s.exam ? lastOf(tests, s.exam) : null, left = s.examDate ? daysBetween(today, s.examDate) : null;

  return h('div', { class: 'grid gap-12' },
    h('div', { class: 'grid gap-x-8 gap-y-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5' },
      metric({ label: 'Niveau actuel', value: s.level || '–', sub: s.level ? `visé : ${s.target}` : 'à évaluer (EF SET)', color: 'edu' }),
      metric({ label: s.exam ? EXAMS[s.exam].label : 'Examen', value: examLast ? examLast.total : '–', sub: s.exam ? (s.examTarget ? `cible ${s.examTarget}` : 'cible à fixer') : 'pas encore choisi', color: 'edu' }),
      metric({ label: 'Cette semaine', value: minutesLabel(weekTotal), sub: s.weeklyHours ? `objectif ${s.weeklyHours} h` : 'temps d’étude', p: s.weeklyHours ? weekTotal / (s.weeklyHours * 60) : null, color: 'edu' }),
      metric({ label: 'Régularité', value: `${streak(sessions, today)} j`, sub: `${activeDays(sessions, addDays(today, -13))} jours actifs sur 14`, color: 'edu' }),
      metric({ label: 'Mots appris', value: wordsSince(sessions, addDays(today, -29)), sub: 'sur 30 jours', color: 'edu' })),

    sugg && sugg.level !== s.level ? h('div', { class: 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/5 px-4 py-3' },
      h('p', { class: 'text-sm' }, `Ton dernier EF SET (${sugg.test.total}/100, le ${shortDate(sugg.test.date)}) correspond au niveau ${sugg.level}.`),
      h('button', { type: 'button', class: BTN_SM, onclick: () => E.set('level', sugg.level) }, `Passer mon niveau à ${sugg.level}`)) : null,

    h('div', { class: CARD + ' grid gap-6' },
      h('div', { class: 'flex flex-wrap items-baseline justify-between gap-2' }, h('h2', { class: H3 }, 'Ta progression vers ' + s.target),
        left != null ? h('span', { class: 'text-[13px] text-muted' }, left >= 0 ? `${EXAMS[s.exam].label} dans ${left} jours (${dayLabel(s.examDate, { day: 'numeric', month: 'long' })})` : 'Date d’examen passée') : null),
      ladder(s.level, s.target),
      cur ? h('p', { class: 'text-sm' }, h('span', { class: 'text-muted' }, `Au niveau ${cur.id}, tu peux : `), cur.can) : notice('Passe l’EF SET (gratuit, 50 min) pour connaître ton niveau, puis enregistre le score dans l’onglet Tests.', 'gold')),

    settingsCard(E),

    h('div', { class: 'grid gap-6 lg:grid-cols-[1.2fr_1fr]' },
      h('div', { class: CARD + ' grid gap-4 content-start' },
        h('div', {}, h('h2', { class: H3 }, 'Équilibre des compétences'), h('p', { class: 'mt-1 text-[13px] text-muted' }, 'Temps enregistré sur 4 semaines. Le plan renforce les compétences les moins travaillées.')),
        h('ul', { class: 'grid gap-3' }, Object.entries(SKILLS).map(([k, sk]) => h('li', { class: 'grid grid-cols-[110px_1fr_64px] items-center gap-3' },
          h('span', { class: 'text-sm' }, sk.short),
          h('div', { class: 'h-2.5 rounded-sm bg-soft overflow-hidden', title: `${sk.label} : ${minutesLabel(by[k])}` }, h('div', { class: 'h-full rounded-sm bg-edu-ink', style: `width:${by[k] / maxM * 100}%` })),
          h('span', { class: 'text-right font-mono text-xs text-muted tnum' }, minutesLabel(by[k])))))),
      h('div', { class: CARD + ' grid gap-3 content-start' },
        h('h2', { class: H3 }, 'Ressources'),
        h('div', { class: 'grid gap-2' }, EN_LINKS.map(([l, u]) => h('div', {}, linkChip(l, u)))),
        h('p', { class: 'border-t border-line pt-3 text-[12.5px] text-muted' }, 'Barèmes et formats d’examen écrits dans l’app : vérifie-les sur les sites officiels avant de t’inscrire.'))));
}
