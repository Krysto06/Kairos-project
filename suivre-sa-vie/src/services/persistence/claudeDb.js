/* Adaptateur « base claude.ai » (capacité db de l'artefact).
   Renvoie null quand la base n'est pas disponible (page ouverte hors de claude.ai, accès refusé…).
   Pour passer plus tard à plusieurs collections (tâches, sessions…), c'est ce fichier qu'on étend. */
export const STATE_DOC = 'life/state';

let dbPromise = null;
/* La base, ou null. Mémorisée : un seul appel à claude.use('db') par chargement. */
export function getDb() {
  if (!dbPromise) dbPromise = window.claude && window.claude.use ? window.claude.use('db').catch(() => null) : Promise.resolve(null);
  return dbPromise;
}

export async function connectClaudeDb({ onData, onSnapshotMeta, onError }) {
  const db = await getDb();
  if (!db) return null;
  const ref = db.doc(STATE_DOC);
  ref.onSnapshot(snap => {
    if (snap.metadata.hasPendingWrites) return;
    if (snap.exists) onData(snap.data());
    onSnapshotMeta({ exists: snap.exists, definitive: !snap.metadata.fromCache });
  }, onError);
  return { save: data => ref.set(data) };
}
