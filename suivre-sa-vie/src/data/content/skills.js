/* Formations et leurs modules : contenu fixe. Les modules cochés vivent dans l'état utilisateur (skillsDone). */
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
