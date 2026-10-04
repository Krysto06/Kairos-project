/* Vocabulaire d'état, partagé par les modules, les intégrations et les données.
   Règle : on n'affiche « Connecté » que si la connexion a réellement répondu. */
export const STATUS = {
  live:        { label: 'Actif',                        tone: 'ok' },
  demo:        { label: 'Demo',                         tone: 'gold' },
  placeholder: { label: 'Placeholder',                  tone: 'muted' },
  connect:     { label: 'À connecter',                  tone: 'muted' },
  auth:        { label: 'Nécessite une autorisation',   tone: 'warn' },
  connected:   { label: 'Connecté',                     tone: 'ok' },
  local:       { label: 'Cet appareil uniquement',      tone: 'gold' },
  pending:     { label: 'Connexion en cours',           tone: 'muted' },
  error:       { label: 'Interrompu',                   tone: 'warn' },
};
