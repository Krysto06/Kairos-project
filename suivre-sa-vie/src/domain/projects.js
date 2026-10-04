/* Projets : le projet vit dans l'état ; jalons, notes de journal et ressources dans des collections (projectId).
   Jalon : { id, projectId, title, detail, due, done, doneAt, order, createdAt }
   Note : { id, projectId, kind, text, date, createdAt }
   Ressource : { id, projectId, title, url, kind, createdAt } */
export const mainProject = state => state.projects.find(p => p.main) || null;

/* Un seul projet principal à la fois. */
export function setMainProject(state, id) {
  for (const p of state.projects) p.main = p.id === id;
}

export const ofProject = (items, id) => items.filter(x => x.projectId === id);
export const sortMilestones = list => list.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.createdAt || '').localeCompare(b.createdAt || ''));

/* Avancement : automatique (jalons atteints / jalons) s'il y a des jalons et que le mode n'est pas manuel. */
export function projectProgress(p, milestones) {
  const ms = ofProject(milestones, p.id);
  if (p.progressMode !== 'manual' && ms.length) return { p: ms.filter(m => m.done).length / ms.length, auto: true, d: ms.filter(m => m.done).length, n: ms.length };
  return { p: (p.progress || 0) / 100, auto: false, d: null, n: ms.length };
}

export const nextMilestone = (p, milestones) => sortMilestones(ofProject(milestones, p.id)).find(m => !m.done) || null;
export const overdueMilestones = (p, milestones, today) => ofProject(milestones, p.id).filter(m => !m.done && m.due && m.due < today);
