/* Normalise et fait évoluer un état venant du stockage (local ou base) vers le schéma courant.
   Règle : une migration ajoute ou renomme, elle ne supprime jamais une donnée de l'utilisateur. */
import { DEFAULT_STATE, newProject } from './defaults.js';
import { SKILLS } from './content/skills.js';
import { LFCS, PYTHON_PATH } from './content/certifications.js';
import { clone } from '../core/utils.js';

export const SCHEMA_VERSION = 8;

const MIGRATIONS = {
  // v2 : projet principal. Ajoute le laboratoire de recherche quantitative s'il n'y a pas encore de projet principal.
  2: s => {
    for (const p of s.projects) if (typeof p.main !== 'boolean') p.main = false;
    if (!s.projects.some(p => p.main)) {
      s.projects.unshift(newProject('p-lab', { name: 'Laboratoire de recherche quantitative', cat: 'Recherche', main: true }));
    }
  },
  // v3 : réglages GRE (score cible, date du test, heures par semaine). Vides : c'est à l'utilisatrice de les fixer.
  3: s => { s.gre = Object.assign(clone(DEFAULT_STATE.gre), s.gre || {}); },
  // v4 : réglages Anglais (niveau actuel à fixer, cible C2, examen visé).
  4: s => { s.english = Object.assign(clone(DEFAULT_STATE.english), s.english || {}); },
  // v5 : projets détaillés (description, dates, mode d'avancement). Un avancement déjà saisi reste manuel.
  // v6 : objectifs d'épargne (finance). Les transactions vivent dans une collection.
  6: s => { s.finance = Object.assign(clone(DEFAULT_STATE.finance), s.finance || {}); },
  // v7 : formations modifiables. Les 3 formations de départ sont copiées avec les modules déjà cochés (skillsDone conservé).
  7: s => {
    s.learning = Object.assign(clone(DEFAULT_STATE.learning), s.learning || {});
    if (s.learning.courses.length) return;
    s.learning.courses = SKILLS.map(sk => {
      const mods = sk.mods.map(([t, d], i) => ({ id: `${sk.id}-${i}`, t, d: d || '', done: s.skillsDone.includes(`${sk.id}:${i}`) }));
      const started = mods.some(m => m.done), finished = mods.every(m => m.done);
      return { id: sk.id, title: sk.title, sub: sk.sub, kind: sk.id === 'cfa' ? 'certification' : 'formation', provider: '', status: finished ? 'fini' : started ? 'cours' : 'afaire', target: '', url: '', mods, links: clone(sk.links) };
    });
  },
  // v8 : LFCS (plan de 17 semaines) et parcours Python (freeCodeCamp → Exercism → Real Python → PCAP → PCPP1), ajoutés s'ils manquent.
  8: s => { for (const c of [LFCS, ...PYTHON_PATH]) if (!s.learning.courses.some(x => x.id === c.id)) s.learning.courses.push(clone(c)); },
  5: s => { for (const p of s.projects) Object.assign(p, { description: p.description || '', start: p.start || '', end: p.end || '', progressMode: p.progressMode || (p.progress ? 'manual' : 'auto') }); },
};

export function hydrate(raw) {
  const d = raw && typeof raw === 'object' ? raw : {};
  const s = Object.assign(clone(DEFAULT_STATE), clone(d));
  s.profile = Object.assign(clone(DEFAULT_STATE.profile), d.profile || {});
  s.budget = Object.assign(clone(DEFAULT_STATE.budget), d.budget || {});
  s.gre = Object.assign(clone(DEFAULT_STATE.gre), d.gre || {});
  s.english = Object.assign(clone(DEFAULT_STATE.english), d.english || {});
  s.finance = Object.assign(clone(DEFAULT_STATE.finance), d.finance || {});
  s.learning = Object.assign(clone(DEFAULT_STATE.learning), d.learning || {});
  for (const k of ['courses', 'skills']) if (!Array.isArray(s.learning[k])) s.learning[k] = [];
  if (!Array.isArray(s.finance.savings)) s.finance.savings = [];
  s.gre.target = Object.assign(clone(DEFAULT_STATE.gre.target), (d.gre && d.gre.target) || {});
  if (!Array.isArray(s.budget.lines)) s.budget.lines = clone(DEFAULT_STATE.budget.lines);
  for (const k of ['done', 'skillsDone', 'favs', 'capsule', 'projects']) if (!Array.isArray(s[k])) s[k] = [];
  if (!s.custom || typeof s.custom !== 'object' || Array.isArray(s.custom)) s.custom = {};

  let v = Number(d.schemaVersion) || 1;
  while (v < SCHEMA_VERSION) { v += 1; MIGRATIONS[v]?.(s); }
  s.schemaVersion = SCHEMA_VERSION;
  return s;
}
