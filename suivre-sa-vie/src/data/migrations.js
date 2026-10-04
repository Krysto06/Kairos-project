/* Normalise et fait évoluer un état venant du stockage (local ou base) vers le schéma courant.
   Règle : une migration ajoute ou renomme, elle ne supprime jamais une donnée de l'utilisateur. */
import { DEFAULT_STATE, newProject } from './defaults.js';
import { clone } from '../core/utils.js';

export const SCHEMA_VERSION = 2;

const MIGRATIONS = {
  // v2 : projet principal. Ajoute le laboratoire de recherche quantitative s'il n'y a pas encore de projet principal.
  2: s => {
    for (const p of s.projects) if (typeof p.main !== 'boolean') p.main = false;
    if (!s.projects.some(p => p.main)) {
      s.projects.unshift(newProject('p-lab', { name: 'Laboratoire de recherche quantitative', cat: 'Recherche', main: true }));
    }
  },
};

export function hydrate(raw) {
  const d = raw && typeof raw === 'object' ? raw : {};
  const s = Object.assign(clone(DEFAULT_STATE), clone(d));
  s.profile = Object.assign(clone(DEFAULT_STATE.profile), d.profile || {});
  s.budget = Object.assign(clone(DEFAULT_STATE.budget), d.budget || {});
  if (!Array.isArray(s.budget.lines)) s.budget.lines = clone(DEFAULT_STATE.budget.lines);
  for (const k of ['done', 'skillsDone', 'favs', 'capsule', 'projects']) if (!Array.isArray(s[k])) s[k] = [];
  if (!s.custom || typeof s.custom !== 'object' || Array.isArray(s.custom)) s.custom = {};

  let v = Number(d.schemaVersion) || 1;
  while (v < SCHEMA_VERSION) { v += 1; MIGRATIONS[v]?.(s); }
  s.schemaVersion = SCHEMA_VERSION;
  return s;
}
