/* Forme de l'état utilisateur persistant (document « life/state »).
   Toute nouvelle donnée persistante s'ajoute ici avec une valeur par défaut, puis dans migrations.js si besoin. */
export const KINDS = { besoin: 'Besoins', envie: 'Envies', epargne: 'Épargne & avenir' };
export const CURRENCIES = ['€', '$', 'CHF', 'FCFA', 'HTG', 'CAD'];
export const PROJECT_STATUS = { idee: 'Idée', cours: 'En cours', pause: 'En pause', fini: 'Terminé' };
export const PROJECT_STATUS_COLOR = { idee: 'me', cours: 'edu', pause: 'pro', fini: 'fin' };

export const DEFAULT_STATE = {
  schemaVersion: 1,
  profile: { name: 'Krystofia', headline: '', education: '', children: '', status: '', city: '', languages: '', motto: '' },
  done: [],          // ids des étapes de parcours cochées
  custom: {},        // étapes ajoutées à la main, par parcours : { [trackId]: [{id, t, url}] }
  abcLink: '',
  skillsDone: [],    // "skillId:indexModule"
  favs: [],          // ids de looks favoris
  capsule: [],       // pièces de la garde-robe capsule déjà possédées
  projects: [],      // [{id, name, cat, status, progress, progressMode, next, link, main, description, start, end}]
  gre: { target: { v: null, q: null, aw: null }, testDate: '', weeklyHours: null },
  english: { level: null, target: 'C2', exam: null, examTarget: null, examDate: '', weeklyHours: null },
  budget: {
    salary: 0, currency: '€', example: false,
    lines: [
      { id: 'l1', label: 'Logement', kind: 'besoin', amount: 0 }, { id: 'l2', label: 'Alimentation', kind: 'besoin', amount: 0 },
      { id: 'l3', label: 'Transport', kind: 'besoin', amount: 0 }, { id: 'l4', label: 'Enfants & famille', kind: 'besoin', amount: 0 },
      { id: 'l5', label: 'Loisirs & sorties', kind: 'envie', amount: 0 }, { id: 'l6', label: 'Style & shopping', kind: 'envie', amount: 0 },
      { id: 'l7', label: 'Formations (CFA, TOEFL, GRE)', kind: 'epargne', amount: 0 }, { id: 'l8', label: 'Épargne de précaution', kind: 'epargne', amount: 0 },
      { id: 'l9', label: 'Investissement', kind: 'epargne', amount: 0 },
    ],
  },
};

export const newProject = (id, fields = {}) => ({ id, name: 'Nouveau projet', cat: '', status: 'idee', progress: 0, progressMode: 'auto', next: '', link: '', main: false, description: '', start: '', end: '', ...fields });
