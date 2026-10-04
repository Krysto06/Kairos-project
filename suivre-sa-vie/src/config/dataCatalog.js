/* Inventaire des données : ce qui est déjà enregistré, ce qui est du contenu fixe, ce qui reste à créer.
   where: 'state' = champ du document life/state ; 'collection' = collection life/state/<nom> ; 'code' = contenu écrit dans l'app ; 'todo' = à créer. */
export const DATA_CATALOG = [
  { name: 'Profil', module: 'Profil & système', where: 'state', field: 'profile' },
  { name: 'Étapes de parcours cochées', module: 'Études, Anglais, GRE', where: 'state', field: 'done' },
  { name: 'Étapes ajoutées à la main', module: 'Études, Anglais, GRE', where: 'state', field: 'custom' },
  { name: 'Lien de l’artefact ABC', module: 'Études', where: 'state', field: 'abcLink' },
  { name: 'Modules de formation cochés', module: 'Compétences', where: 'state', field: 'skillsDone' },
  { name: 'Projets (dont projet principal)', module: 'Projets', where: 'state', field: 'projects' },
  { name: 'Budget du mois (salaire, devise, postes)', module: 'Finance', where: 'state', field: 'budget' },
  { name: 'Looks favoris et pièces capsule possédées', module: 'Style', where: 'state', field: 'favs, capsule' },

  { name: 'Parcours et leurs étapes', module: 'Études, Anglais, GRE', where: 'code' },
  { name: 'Formations et modules', module: 'Compétences', where: 'code' },
  { name: 'Looks et liste capsule', module: 'Style', where: 'code' },

  { name: 'Objectifs (long terme → semaine)', module: 'Planning', where: 'collection', field: 'goals' },
  { name: 'Actions datées (durée, objectif, fait le)', module: 'Planning', where: 'collection', field: 'tasks' },
  { name: 'Revues hebdomadaires', module: 'Planning', where: 'collection', field: 'reviews' },
  { name: 'Réglages GRE (cibles, date du test, heures)', module: 'GRE', where: 'state', field: 'gre' },
  { name: 'Réglages Anglais (niveau, cible, examen, heures)', module: 'Anglais', where: 'state', field: 'english' },
  { name: 'Tests et scores (GRE, EF SET, DET, TOEFL)', module: 'GRE, Anglais', where: 'collection', field: 'tests' },
  { name: 'Séances d’étude (durée, questions, mots appris)', module: 'GRE, Anglais', where: 'collection', field: 'sessions' },
  { name: 'Transactions', module: 'Finance', where: 'todo', future: 'transactions' },
  { name: 'Budgets mensuels archivés', module: 'Finance', where: 'todo', future: 'budgets' },
  { name: 'Notes et questions de recherche', module: 'Recherche', where: 'todo', future: 'notes' },
  { name: 'Ressources et sources', module: 'Recherche', where: 'todo', future: 'resources' },
  { name: 'Vêtements', module: 'Style', where: 'todo', future: 'wardrobe' },
  { name: 'Tenues composées', module: 'Style', where: 'todo', future: 'outfits' },
  { name: 'Événements du calendrier', module: 'Planning', where: 'todo', future: 'events' },
  { name: 'Journal d’activité horodaté', module: 'Analytics', where: 'todo', future: 'activity' },
  { name: 'Conversations et recommandations IA', module: 'Assistant IA', where: 'todo', future: 'ai' },
];
