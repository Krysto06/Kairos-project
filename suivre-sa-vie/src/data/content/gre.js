/* GRE General Test : faits de référence (format en vigueur depuis septembre 2023) et thèmes de travail.
   À revérifier sur ets.org avant l'inscription : l'app ne consulte pas le site d'ETS. */
export const GRE_SECTIONS = {
  q: { label: 'Quantitative Reasoning', short: 'Quant', color: 'sq', scored: true,
    topics: ['Arithmétique', 'Algèbre', 'Géométrie', 'Analyse de données', 'Comparaison quantitative', 'Interprétation de graphiques'] },
  v: { label: 'Verbal Reasoning', short: 'Verbal', color: 'sv', scored: true,
    topics: ['Compréhension écrite', 'Text completion', 'Sentence equivalence', 'Vocabulaire'] },
  aw: { label: 'Analytical Writing', short: 'Writing', color: 'me-ink', scored: false,
    topics: ['Analyze an Issue (30 min)', 'Plan et structure', 'Relecture'] },
};

export const SCORE_RANGE = { min: 130, max: 170 };
export const AW_RANGE = { min: 0, max: 6, step: 0.5 };

export const TEST_KINDS = { diagnostic: 'Diagnostic', blanc: 'Test blanc', officiel: 'GRE officiel' };

export const GRE_FORMAT = [
  ['Durée totale', 'Environ 1 h 58'],
  ['Analytical Writing', '1 essai « Analyze an Issue », 30 min, noté de 0 à 6 (pas de 0,5)'],
  ['Verbal Reasoning', '2 sections, 27 questions, 41 min, score de 130 à 170'],
  ['Quantitative Reasoning', '2 sections, 27 questions, 47 min, score de 130 à 170, calculatrice à l’écran'],
  ['Validité des scores', '5 ans'],
];

export const GRE_LINKS = [
  ['ETS – GRE General Test', 'https://www.ets.org/gre.html'],
  ['POWERPREP (tests officiels gratuits)', 'https://www.ets.org/gre/test-takers/general-test/prepare/powerprep.html'],
  ['GregMat', 'https://www.gregmat.com'],
  ['Khan Academy – maths', 'https://www.khanacademy.org/math'],
];
