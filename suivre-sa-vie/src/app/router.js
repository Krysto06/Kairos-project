/* Adresse de la page : #dashboard, #english… (ancre simple, seule forme transmise par claude.ai). */
import { ALL_MODULES, LEGACY_ROUTES } from '../config/modules.js';
import { lsGet, lsSet } from '../core/storage.js';

const known = new Set(ALL_MODULES.map(m => m.id));
const resolve = token => { token = LEGACY_ROUTES[token] || token; return known.has(token) ? token : null; };

export const initialRoute = () => resolve((location.hash || '').slice(1)) || resolve(lsGet('ssv.route')) || resolve(lsGet('ssv.tab')) || 'dashboard';

export function writeRoute(id) {
  lsSet('ssv.route', id);
  try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignoré */ }
}
