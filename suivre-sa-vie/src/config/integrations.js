/* Connexions externes et leur état réel. 'runtime' = l'état est mesuré au chargement de la page. */
export const INTEGRATIONS = [
  { id: 'db', name: 'Base de données claude.ai', status: 'runtime',
    detail: 'Le document « life/state » et les collections (actions, objectifs, revues, tests, séances, jalons, journal, ressources). Disponible quand l’app est ouverte depuis claude.ai. Lecture et écriture réservées à toi.' },
  { id: 'device', name: 'Copie sur cet appareil', status: 'connected',
    detail: 'Copie de secours dans ce navigateur. Elle ne passe pas d’un appareil à l’autre.' },
  { id: 'ai', name: 'Assistant IA (Claude depuis la page)', status: 'connect',
    detail: 'Non activé. Aucune réponse IA n’est générée par l’app aujourd’hui.' },
  { id: 'web', name: 'Recherche web et navigateur', status: 'auth',
    detail: 'L’app ne consulte pas Internet. Les liens ouvrent un nouvel onglet ; aucune recherche n’est faite à ta place.' },
  { id: 'calendar', name: 'Google Calendar', status: 'auth',
    detail: 'Aucun accès à ton calendrier.' },
  { id: 'linkedin', name: 'LinkedIn', status: 'auth',
    detail: 'Aucun accès. Rien n’est lu depuis ton profil.' },
  { id: 'bank', name: 'Banque ou agrégateur bancaire', status: 'connect',
    detail: 'Le budget est saisi à la main. Aucun compte n’est relié.' },
  { id: 'opendata', name: 'Données publiques (FRED, Banque mondiale, INSEE)', status: 'connect',
    detail: 'La page ne peut pas appeler ces API directement (règles de sécurité de l’artefact). Il faudra passer par un connecteur ou par Claude.' },
];
