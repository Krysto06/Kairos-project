/* Modèles de jalons proposés, à adapter. Rien n'est ajouté sans que l'utilisatrice clique. */
export const LAB_TEMPLATE = {
  match: /recherche quantitative|laboratoire|lab/i,
  title: 'Plan de démarrage d’un laboratoire de recherche quantitative',
  milestones: [
    ['Question de recherche et périmètre', 'Choisir 1 ou 2 questions précises (ex. : inflation et politique monétaire, prime de risque des actions), le marché et la période étudiés.'],
    ['Environnement de travail', 'Python, Jupyter, Git et un dépôt GitHub organisé (data/, notebooks/, src/, reports/).'],
    ['Sources de données', 'Lister et tester l’accès aux données publiques : FRED, Banque mondiale, INSEE, BCE. Documenter licences et fréquences.'],
    ['Pipeline de données reproductible', 'Scripts qui téléchargent, nettoient et versionnent les données, relançables en une commande.'],
    ['Réplication d’un papier', 'Reproduire les résultats principaux d’un article publié pour valider la méthode et les outils.'],
    ['Méthodologie d’évaluation', 'Tests de robustesse, échantillons hors-période, backtest sans biais d’anticipation.'],
    ['Première note de recherche', 'Rédiger 5 à 10 pages : question, données, méthode, résultats, limites. Publier code et note.'],
  ],
};

export const RESOURCE_KINDS = { article: 'Article / papier', dataset: 'Données', outil: 'Outil', cours: 'Cours', autre: 'Autre' };
export const NOTE_KINDS = { note: 'Note', decision: 'Décision', apprentissage: 'Apprentissage', blocage: 'Blocage' };
