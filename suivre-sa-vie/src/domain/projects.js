export const mainProject = state => state.projects.find(p => p.main) || null;

/* Un seul projet principal à la fois. */
export function setMainProject(state, id) {
  for (const p of state.projects) p.main = p.id === id;
}
