/* Registre des modules. Ajouter un module = une entrée ici + une page dans pages/index.js.
   status: 'live' (fonctionne), 'placeholder' (prévu, rien de fonctionnel). Un module placeholder
   n'apparaît que dans la section « À venir » de la navigation ; il rejoint son groupe quand il passe à 'live'. */
export const GROUPS = [
  { id: 'pilotage', label: 'Pilotage' },
  { id: 'learning', label: 'Apprentissage' },
  { id: 'life', label: 'Vie & projets' },
];

export const MODULES = [
  { id: 'dashboard', label: 'Tableau de bord', group: 'pilotage', status: 'live', color: 'me',
    summary: 'Ta situation en un coup d’œil : projet principal, progression, prochaines actions.' },
  { id: 'learning', label: 'Études', group: 'learning', status: 'live', color: 'edu', track: 'lic',
    summary: 'Licence en économie, de la L1 à la soutenance.' },
  { id: 'english', label: 'Anglais', group: 'learning', status: 'live', color: 'edu', track: 'en',
    summary: 'Parcours de A1 à C2, puis Duolingo English Test et TOEFL.' },
  { id: 'gre', label: 'GRE & master', group: 'learning', status: 'live', color: 'edu', track: 'gre',
    summary: 'Préparation au GRE et dossier de candidature en master.' },
  { id: 'skills', label: 'Compétences', group: 'learning', status: 'live', color: 'sk',
    summary: 'Formations en cours : Python pour la data, CFA niveau I, SQL.' },
  { id: 'projects', label: 'Projets', group: 'life', status: 'live', color: 'pro',
    summary: 'Tes projets, avec le projet principal mis en avant.' },
  { id: 'finance', label: 'Finance', group: 'life', status: 'live', color: 'fin',
    summary: 'Budget du mois et comparaison avec la règle 50/30/20.' },
  { id: 'style', label: 'Style', group: 'life', status: 'live', color: 'sty',
    summary: 'Idées de tenues et garde-robe capsule.' },

  { id: 'planning', label: 'Planning', group: 'pilotage', status: 'placeholder', color: 'me',
    summary: 'Transformer tes objectifs en journées concrètes.',
    plan: {
      features: ['Objectifs à long terme découpés en objectifs du trimestre, de la semaine, du jour', 'Blocs de travail planifiés (étude GRE, anglais, projet)', 'Revue hebdomadaire : fait, pas fait, ajustement', 'Vue calendrier jour et semaine'],
      data: ['Objectifs', 'Tâches', 'Sessions d’étude', 'Événements du calendrier', 'Revues hebdomadaires'],
      needs: [['Base de données (collections dédiées)', 'connect'], ['Google Calendar', 'auth']],
    } },
  { id: 'analytics', label: 'Analytics', group: 'pilotage', status: 'placeholder', color: 'me',
    summary: 'Mesurer ta progression dans le temps.',
    plan: {
      features: ['Courbes de progression par module', 'Heures d’étude par semaine', 'Scores des tests blancs (GRE, TOEFL, DET)', 'Taux d’épargne mois par mois'],
      data: ['Journal d’activité horodaté', 'Sessions d’étude', 'Résultats de tests', 'Budgets mensuels archivés'],
      needs: [['Historique daté (aujourd’hui, l’app ne garde que l’état actuel, sans dates)', 'connect']],
    } },
  { id: 'research', label: 'Recherche', group: 'life', status: 'placeholder', color: 'edu',
    summary: 'Espace de recherche et de connaissances, relié au laboratoire quantitatif.',
    plan: {
      features: ['Notes de recherche et questions ouvertes', 'Bibliothèque de sources (papiers, livres, jeux de données)', 'Liste de lecture avec statut', 'Liens vers les projets, dont le laboratoire de recherche quantitative'],
      data: ['Notes', 'Sources et ressources', 'Jeux de données', 'Questions de recherche'],
      needs: [['Base de données', 'connect'], ['Recherche web par l’IA', 'auth'], ['Fichiers (PDF, CSV)', 'connect']],
    } },
  { id: 'assistant', label: 'Assistant IA', group: 'pilotage', status: 'placeholder', color: 'sk',
    summary: 'Une couche IA qui lit tes données pour recommander, planifier et ajuster.',
    plan: {
      features: ['Rechercher → analyser → recommander → planifier → suivre → évaluer → adapter', 'Résumé hebdomadaire de ta progression', 'Plan d’étude GRE ajusté à tes scores', 'Questions sur ton budget et tes projets'],
      data: ['Toutes les sections (lecture)', 'Historique des conversations', 'Recommandations acceptées ou refusées'],
      needs: [['Claude depuis la page (capacité « sample »)', 'connect'], ['Recherche web', 'auth'], ['Base de données', 'connect']],
    } },
];

export const SYSTEM_MODULE = { id: 'system', label: 'Profil & système', status: 'live', color: 'me',
  summary: 'Ton profil, l’état des connexions et les données enregistrées.' };

/* Anciennes adresses (#moi, #education…) redirigées vers les nouveaux modules. */
export const LEGACY_ROUTES = { moi: 'dashboard', education: 'learning', skills: 'skills', projets: 'projects', finance: 'finance', style: 'style' };

export const ALL_MODULES = MODULES.concat(SYSTEM_MODULE);
export const moduleById = id => ALL_MODULES.find(m => m.id === id);
export const routeOfTrack = trackId => (MODULES.find(m => m.track === trackId) || {}).id || 'learning';
