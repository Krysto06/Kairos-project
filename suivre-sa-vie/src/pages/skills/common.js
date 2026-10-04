/* Données Compétences : formations et référentiel dans l'état ; séances dans la collection partagée (subject:'skills'). */
import { uid, normalizeUrl } from '../../core/utils.js';
import { skillSessions } from '../../domain/skills.js';
import { newId } from '../../services/collections.js';

export function skills(ctx) {
  const L = ctx.state.learning, sessions = ctx.col('sessions'), now = () => new Date().toISOString();
  const save = (force = true) => { ctx.commit(); ctx.render(force); };
  const course = id => L.courses.find(c => c.id === id);
  return {
    courses: () => L.courses,
    course,
    skills: () => L.skills,
    sessions: () => skillSessions(sessions.all()),

    addCourse(f) { const id = 'c' + uid(); L.courses.push({ id, title: 'Nouvelle formation', sub: '', kind: 'formation', provider: '', status: 'afaire', target: '', url: '', mods: [], links: [], ...f }); save(); return id; },
    updateCourse(id, f) { if (f.url != null) f.url = normalizeUrl(f.url); Object.assign(course(id), f); ctx.commit(); },
    removeCourse(id) { L.courses = L.courses.filter(c => c.id !== id); save(); },
    addModule(id, t, d = '') { course(id).mods.push({ id: id + '-' + uid(), t, d, done: false }); save(); },
    toggleModule(id, mid) {
      const c = course(id), m = c.mods.find(x => x.id === mid); m.done = !m.done;
      // Statut suivi automatiquement : en cours dès un module coché, terminé quand tout est coché.
      if (c.mods.length && c.mods.every(x => x.done)) c.status = 'fini';
      else if (c.mods.some(x => x.done) && (c.status === 'afaire' || c.status === 'fini')) c.status = 'cours';
      save(false);
    },
    removeModule(id, mid) { const c = course(id); c.mods = c.mods.filter(m => m.id !== mid); save(); },
    moveModule(id, mid, dir) { const c = course(id), i = c.mods.findIndex(m => m.id === mid), j = i + dir; if (j < 0 || j >= c.mods.length) return; [c.mods[i], c.mods[j]] = [c.mods[j], c.mods[i]]; save(); },

    addSkill(f) { L.skills.push({ id: 'k' + uid(), level: null, target: null, evidence: '', category: 'data', ...f }); save(); },
    updateSkill(id, f) { Object.assign(L.skills.find(s => s.id === id), f); ctx.commit(); },
    removeSkill(id) { L.skills = L.skills.filter(s => s.id !== id); save(); },

    addSession(f) { sessions.put({ id: newId('s'), subject: 'skills', note: '', createdAt: now(), ...f }); ctx.render(true); },
    removeSession(id) { sessions.remove(id); ctx.render(true); },
  };
}
