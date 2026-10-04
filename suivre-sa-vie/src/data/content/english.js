/* Anglais : niveaux CECRL, compétences, examens et activités conseillées.
   Barèmes écrits dans l'app : à revérifier sur les sites officiels, l'app ne les consulte pas. */
export const LEVELS = [
  { id: 'A1', label: 'Découverte', can: 'Se présenter, comprendre des phrases très simples.' },
  { id: 'A2', label: 'Survie', can: 'Échanger sur des sujets familiers, décrire son quotidien.' },
  { id: 'B1', label: 'Autonomie', can: 'Se débrouiller en voyage, raconter, donner son avis simplement.' },
  { id: 'B2', label: 'Indépendance', can: 'Argumenter, suivre un article de presse ou un cours en anglais.' },
  { id: 'C1', label: 'Avancé', can: 'Présenter un sujet économique, rédiger un rapport structuré.' },
  { id: 'C2', label: 'Maîtrise', can: 'Saisir les nuances, lire des papiers académiques sans effort.' },
];
export const levelIndex = id => LEVELS.findIndex(l => l.id === id);
export const bandOf = id => { const i = levelIndex(id); return i < 0 ? 'A' : i < 2 ? 'A' : i < 4 ? 'B' : 'C'; };

export const SKILLS = {
  listening: { label: 'Compréhension orale', short: 'Écoute' },
  reading: { label: 'Compréhension écrite', short: 'Lecture' },
  speaking: { label: 'Expression orale', short: 'Oral' },
  writing: { label: 'Expression écrite', short: 'Écrit' },
  vocab: { label: 'Vocabulaire & grammaire', short: 'Vocabulaire' },
};

/* Activités conseillées par compétence et par palier (A, B, C). */
export const ACTIVITIES = {
  listening: { A: 'BBC Learning English, épisode court', B: '6 Minute English + 5 mots notés', C: 'Podcast économique (Planet Money, The Economist)' },
  reading: { A: 'Texte gradué niveau A + vocabulaire', B: 'Un article de presse, résumé en 3 phrases', C: 'Un papier NBER ou un article The Economist annoté' },
  speaking: { A: 'Répéter 10 phrases à voix haute', B: 'Parler 3 min sur un sujet, s’enregistrer', C: 'Présenter un sujet économique en 5 min' },
  writing: { A: '5 lignes sur ta journée', B: 'Essai argumenté de 150 mots (Write & Improve)', C: 'Rapport structuré de 300 mots' },
  vocab: { A: '10 mots du quotidien', B: '15 mots + révision des anciens', C: 'Expressions idiomatiques et collocations' },
};

/* Examens. scale: bornes de saisie ; sub: sous-scores facultatifs. */
export const EXAMS = {
  efset: { label: 'EF SET', min: 0, max: 100, step: 1, sub: [], note: 'Test gratuit en ligne, score sur 100 converti en niveau CECRL.' },
  det: { label: 'Duolingo English Test', min: 10, max: 160, step: 5, sub: [['literacy', 'Literacy'], ['comprehension', 'Comprehension'], ['conversation', 'Conversation'], ['production', 'Production']],
    note: 'Score de 10 à 160 par pas de 5. Beaucoup de masters demandent 120 à 135.' },
  toefl: { label: 'TOEFL iBT', min: 0, max: 120, step: 1, sub: [['reading', 'Reading'], ['listening', 'Listening'], ['speaking', 'Speaking'], ['writing', 'Writing']], subMax: 30,
    note: 'Score sur 120 (4 sections sur 30). ETS a annoncé une nouvelle échelle de 1 à 6 à partir de 2026 : vérifie l’échelle de ton relevé.' },
};

/* Barème EF SET (score sur 100) → niveau CECRL. */
export function efsetLevel(score) {
  if (score == null) return null;
  return score > 70 ? 'C2' : score > 60 ? 'C1' : score > 50 ? 'B2' : score > 40 ? 'B1' : score > 30 ? 'A2' : 'A1';
}

export const EN_LINKS = [
  ['EF SET (gratuit)', 'https://www.efset.org'],
  ['Duolingo English Test', 'https://englishtest.duolingo.com'],
  ['TOEFL iBT – ETS', 'https://www.ets.org/toefl.html'],
  ['BBC Learning English', 'https://www.bbc.co.uk/learningenglish'],
  ['Write & Improve', 'https://writeandimprove.com'],
];
