/* Formations de départ : copiées une fois dans l'état (migration v7), ensuite modifiables par l'utilisatrice. */
export const SKILLS = [
  { id:'py', title:'Python pour la data', sub:'De zéro à l’économétrie en Python',
    mods:[['Bases','variables, boucles, fonctions, listes'],['pandas','charger, nettoyer, fusionner des données'],['Visualisation','matplotlib, seaborn'],['Statistiques & économétrie','statsmodels : OLS, séries temporelles'],['Données publiques','APIs Banque mondiale, FRED, INSEE'],['Projet final','une analyse complète publiée sur GitHub']],
    links:[['Kaggle Learn – Python','https://www.kaggle.com/learn/python'],['QuantEcon – Python','https://python-programming.quantecon.org'],['statsmodels','https://www.statsmodels.org']] },
  { id:'cfa', title:'CFA Niveau I', sub:'Les 10 thèmes du programme',
    mods:[['Ethical & Professional Standards',''],['Quantitative Methods',''],['Economics',''],['Financial Statement Analysis',''],['Corporate Issuers',''],['Equity Investments',''],['Fixed Income',''],['Derivatives',''],['Alternative Investments',''],['Portfolio Management','']],
    links:[['CFA Institute – Level I','https://www.cfainstitute.org/programs/cfa-program'],['300 Hours – ressources','https://300hours.com']] },
  { id:'sql', title:'SQL', sub:'Le langage des bases de données',
    mods:[['SELECT, WHERE, ORDER BY',''],['JOIN',''],['GROUP BY & agrégats',''],['Window functions',''],['Projet : base de données économiques','']],
    links:[['SQLBolt','https://sqlbolt.com'],['Mode SQL Tutorial','https://mode.com/sql-tutorial']] },
];

export const COURSE_KINDS = { formation: 'Formation', certification: 'Certification', mooc: 'Cours en ligne', livre: 'Livre', autre: 'Autre' };
export const COURSE_STATUS = { afaire: 'À commencer', cours: 'En cours', pause: 'En pause', fini: 'Terminé' };
export const COURSE_STATUS_COLOR = { afaire: 'me', cours: 'sk', pause: 'pro', fini: 'fin' };

export const SKILL_CATEGORIES = { data: 'Data & programmation', quant: 'Statistiques & économétrie', finance: 'Finance', eco: 'Économie', research: 'Recherche & rédaction', tools: 'Outils', soft: 'Savoir-être' };

/* Échelle d'auto-évaluation, de 0 à 5. */
export const SKILL_LEVELS = ['Aucune notion', 'Notions', 'Débutante', 'Autonome', 'Avancée', 'Experte'];

/* Compétences suggérées pour un profil économie / data / finance. Ajoutées seulement sur demande, sans niveau. */
export const SUGGESTED_SKILLS = [
  ['Python', 'data'], ['pandas', 'data'], ['SQL', 'data'], ['Visualisation de données', 'data'], ['Git et GitHub', 'tools'],
  ['Statistiques inférentielles', 'quant'], ['Économétrie (OLS, panels)', 'quant'], ['Séries temporelles', 'quant'], ['Machine learning', 'quant'],
  ['Analyse financière', 'finance'], ['Valorisation d’entreprise', 'finance'], ['Gestion de portefeuille', 'finance'],
  ['Macroéconomie', 'eco'], ['Microéconomie', 'eco'],
  ['Revue de littérature', 'research'], ['Rédaction académique en anglais', 'research'], ['LaTeX', 'tools'],
  ['Prise de parole en public', 'soft'],
];
