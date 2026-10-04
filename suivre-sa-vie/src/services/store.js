/* État de l'application et enregistrement.
   - L'état est muté par les pages puis validé avec commit().
   - Chaque commit écrit une copie sur l'appareil, puis (après 600 ms) dans la base claude.ai si elle répond.
   - Une modification venue d'ailleurs (autre appareil) remplace l'état et prévient l'app. */
import { clone, stable } from '../core/utils.js';
import { hydrate } from '../data/migrations.js';
import { localAdapter } from './persistence/local.js';
import { connectClaudeDb } from './persistence/claudeDb.js';

let state = hydrate(localAdapter.load());
let remote = null, lastRemote = '', timer = null, writing = false, again = false, pushedInitial = false;
let status = { save: 'idle', remote: 'pending' };
const statusListeners = new Set(), changeListeners = new Set();

export const getState = () => state;
export const getStatus = () => status;
export const onStatus = fn => { statusListeners.add(fn); fn(status); };
export const onExternalChange = fn => changeListeners.add(fn);

function setStatus(patch) { status = { ...status, ...patch }; statusListeners.forEach(f => f(status)); }
const busy = () => writing || status.save === 'saving';

export function commit() {
  localAdapter.save(state);
  setStatus({ save: 'saving' });
  clearTimeout(timer);
  timer = setTimeout(flush, 600);
}

async function flush() {
  if (writing) { again = true; return; }
  if (!remote) { setStatus({ save: 'saved' }); return; }
  writing = true;
  const snap = clone(state);
  try { await remote.save(snap); lastRemote = stable(snap); setStatus({ save: 'saved' }); }
  catch (e) { setStatus({ save: 'error' }); }
  writing = false;
  if (again) { again = false; flush(); }
}

export async function connectRemote() {
  remote = await connectClaudeDb({
    onData(d) {
      const j = stable(d);
      if (j === lastRemote || busy()) return;
      lastRemote = j;
      state = hydrate(d);
      localAdapter.save(state);
      changeListeners.forEach(f => f());
    },
    onSnapshotMeta({ exists, definitive }) {
      setStatus({ remote: 'connected' });
      // Base encore vide : on y envoie l'état de cet appareil une seule fois.
      if (!exists && definitive && !pushedInitial) { pushedInitial = true; flush(); }
    },
    onError() { setStatus({ remote: 'error' }); },
  });
  if (!remote) setStatus({ remote: 'unavailable' });
}
