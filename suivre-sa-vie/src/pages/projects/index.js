/* Module Projets : liste, ou fiche d'un projet ouverte. */
import { projects } from './common.js';
import list from './list.js';
import detail from './detail.js';

export default function projectsPage(ctx) {
  const P = projects(ctx), open = ctx.ui.projOpen && P.get(ctx.ui.projOpen);
  return open ? detail(ctx, P, open) : list(ctx, P);
}
