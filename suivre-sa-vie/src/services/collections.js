/* Collections de documents (tâches, objectifs, revues…), pour les données qui grossissent dans le temps.
   Emplacement : base claude.ai « life/state/<nom> » quand elle répond, sinon copie sur l'appareil seulement.
   Chaque document a un champ id. Les écritures vers la base sont regroupées (400 ms) par document. */
import { lsGetJSON, lsSetJSON } from '../core/storage.js';
import { clone } from '../core/utils.js';
import { getDb, STATE_DOC } from './persistence/claudeDb.js';
import { reportSave } from './store.js';

const registry = new Map();
const listeners = new Set();
export const onCollectionsChange = fn => listeners.add(fn);
const emit = () => listeners.forEach(f => f());

function create(name) {
  const key = 'ssv.col.' + name;
  let items = new Map(Object.entries(lsGetJSON(key) || {}));
  let ref = null, pushedInitial = false;
  const timers = new Map();      // id -> minuteur d'écriture
  const inflight = new Set();    // ids en cours d'écriture
  const saveLocal = () => lsSetJSON(key, Object.fromEntries(items));
  const dirty = id => timers.has(id) || inflight.has(id);

  function write(id) {
    timers.delete(id);
    if (!ref) { reportSave('saved'); return; }
    const doc = items.get(id);
    inflight.add(id);
    const op = doc ? ref.doc(id).set(clone(doc)) : ref.doc(id).delete();
    op.then(() => { inflight.delete(id); if (!timers.size && !inflight.size) reportSave('saved'); })
      .catch(() => { inflight.delete(id); reportSave('error'); });
  }
  function schedule(id) {
    reportSave('saving');
    clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => write(id), 400));
  }

  const col = {
    name,
    all: () => [...items.values()],
    get: id => items.get(id) || null,
    put(doc) { items.set(doc.id, doc); saveLocal(); schedule(doc.id); return doc; },
    patch(id, fields) { const d = items.get(id); if (d) col.put(Object.assign(d, fields)); },
    remove(id) { items.delete(id); saveLocal(); schedule(id); },

    attach(collectionRef) {
      ref = collectionRef;
      ref.onSnapshot(snap => {
        if (snap.metadata.hasPendingWrites || snap.metadata.fromCache) return;
        // Base encore vide pour cette collection : on y envoie la copie de l'appareil, une fois.
        if (snap.empty && !pushedInitial && items.size) { pushedInitial = true; for (const id of items.keys()) schedule(id); return; }
        pushedInitial = true;
        const next = new Map(snap.docs.map(d => [d.id, { ...clone(d.data()), id: d.id }]));
        for (const id of items.keys()) if (dirty(id)) { const mine = items.get(id); if (mine) next.set(id, mine); }
        for (const id of next.keys()) if (dirty(id) && !items.has(id)) next.delete(id);
        items = next;
        saveLocal();
        emit();
      }, () => reportSave('error'));
    },
  };
  return col;
}

export function collection(name) {
  if (!registry.has(name)) registry.set(name, create(name));
  return registry.get(name);
}

/* Relie toutes les collections déclarées à la base, si elle répond. */
export async function connectCollections(names) {
  const db = await getDb();
  if (!db) return false;
  for (const n of names) collection(n).attach(db.collection(STATE_DOC + '/' + n));
  return true;
}

export const newId = prefix => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
