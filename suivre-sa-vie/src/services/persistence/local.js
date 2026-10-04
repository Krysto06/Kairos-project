/* Adaptateur « appareil » : copie de l'état dans le navigateur. Toujours disponible, jamais partagé. */
import { lsGetJSON, lsSetJSON } from '../../core/storage.js';

const KEY = 'ssv.cache';
export const localAdapter = {
  load: () => lsGetJSON(KEY),
  save: state => lsSetJSON(KEY, state),
};
