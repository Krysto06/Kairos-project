/* Correspondance module → page. Un module sans page dédiée affiche sa page « placeholder ». */
import { MODULES } from '../config/modules.js';
import dashboard from './dashboard.js';
import skills from './skills.js';
import finance from './finance.js';
import projects from './projects/index.js';
import style from './style.js';
import planning from './planning/index.js';
import gre from './gre/index.js';
import english from './english/index.js';
import system from './system.js';
import { trackPage } from './trackPages.js';
import { placeholderPage } from './placeholder.js';

export const PAGES = {
  dashboard, planning, skills, finance, projects, style, system,
  gre, english, learning: trackPage('learning'),
};
for (const m of MODULES) if (!PAGES[m.id] && m.plan) PAGES[m.id] = placeholderPage(m);
