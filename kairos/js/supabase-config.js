/* Configuration de la connexion (Supabase).
   Ces deux valeurs sont publiques par conception : ce sont les règles de sécurité de la base
   (Row Level Security) qui protègent tes données, pas le secret de cette clé. */
const SUPABASE_URL = "https://eacrxvxrylxrwzyrarou.supabase.co";
const SUPABASE_KEY = "sb_publishable_AEm8LgFx62Z4gekl_lJQwA_-JfutR0j";
/* true = le bouton « Créer mon compte » est visible. Mets false une fois ton compte créé. */
const ALLOW_SIGNUP = true;
