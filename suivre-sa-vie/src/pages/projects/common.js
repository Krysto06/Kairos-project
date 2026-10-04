/* Données d'un projet et actions partagées entre la liste et la fiche. */
import { lsSet } from '../../core/storage.js';
import { uid, normalizeUrl } from '../../core/utils.js';
import { todayKey } from '../../core/dates.js';
import { newProject } from '../../data/defaults.js';
import { setMainProject, ofProject, sortMilestones } from '../../domain/projects.js';
import { newId } from '../../services/collections.js';

export function projects(ctx) {
  const S = ctx.state, ms = ctx.col('milestones'), notes = ctx.col('notes'), res = ctx.col('resources'), tasks = ctx.col('tasks');
  const now = () => new Date().toISOString(), after = () => ctx.render(true);
  const P = {
    list: () => S.projects,
    get: id => S.projects.find(p => p.id === id) || null,
    milestones: () => ms.all(),
    milestonesOf: id => sortMilestones(ofProject(ms.all(), id)),
    notesOf: id => ofProject(notes.all(), id).sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || '')),
    resourcesOf: id => ofProject(res.all(), id).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')),
    tasksOf: id => tasks.all().filter(t => t.projectId === id),

    open(id) { ctx.ui.projOpen = id; ctx.ui.projTab = 'overview'; ctx.ui.projEdit = false; ctx.ui.confirm = null; lsSet('ssv.projOpen', id || ''); ctx.render(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    create() { const id = 'p' + uid(); S.projects.push(newProject(id)); ctx.commit(); ctx.ui.projOpen = id; ctx.ui.projTab = 'overview'; ctx.ui.projEdit = true; lsSet('ssv.projOpen', id); ctx.render(); },
    update(id, fields) { Object.assign(P.get(id), fields); ctx.commit(); },
    setMain(id, on) { if (on) setMainProject(S, id); else P.get(id).main = false; ctx.commit(); ctx.render(); },
    /* Supprime le projet, ses jalons, notes et ressources ; ses actions restent dans le Planning, détachées. */
    remove(id) {
      for (const m of ofProject(ms.all(), id)) ms.remove(m.id);
      for (const n of ofProject(notes.all(), id)) notes.remove(n.id);
      for (const r of ofProject(res.all(), id)) res.remove(r.id);
      for (const t of tasks.all()) if (t.projectId === id) tasks.patch(t.id, { projectId: null });
      S.projects = S.projects.filter(p => p.id !== id); ctx.commit();
      P.open(null);
    },

    addMilestone(id, f) { const order = P.milestonesOf(id).length; ms.put({ id: newId('m'), projectId: id, detail: '', due: null, done: false, doneAt: null, order, createdAt: now(), ...f }); after(); },
    toggleMilestone(m) { ms.patch(m.id, { done: !m.done, doneAt: m.done ? null : now() }); after(); },
    moveMilestone(id, m, dir) {
      const list = P.milestonesOf(id), i = list.findIndex(x => x.id === m.id), j = i + dir;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      list.forEach((x, k) => { if (x.order !== k) ms.patch(x.id, { order: k }); });
      after();
    },
    removeMilestone(m) { ms.remove(m.id); after(); },

    addNote(id, f) { notes.put({ id: newId('n'), projectId: id, kind: 'note', date: todayKey(), createdAt: now(), ...f }); after(); },
    removeNote(n) { notes.remove(n.id); after(); },
    addResource(id, f) { res.put({ id: newId('r'), projectId: id, kind: 'autre', createdAt: now(), ...f, url: normalizeUrl(f.url) }); after(); },
    removeResource(r) { res.remove(r.id); after(); },

    addTask(id, f) { tasks.put({ id: newId('t'), title: '', date: todayKey(), minutes: 30, goalId: null, module: 'projects', projectId: id, done: false, doneAt: null, createdAt: now(), ...f }); after(); },
    toggleTask(t) { tasks.patch(t.id, { done: !t.done, doneAt: t.done ? null : now() }); after(); },
    removeTask(t) { tasks.remove(t.id); after(); },
  };
  return P;
}
