/* Accès aux données GRE (réglages dans l'état, tests et séances en collections) et actions partagées. */
import { greTests, greSessions } from '../../domain/gre.js';
import { newId } from '../../services/collections.js';
import { SCORE_RANGE, AW_RANGE } from '../../data/content/gre.js';

const clampScore = v => (v === '' || v == null || isNaN(+v)) ? null : Math.min(SCORE_RANGE.max, Math.max(SCORE_RANGE.min, Math.round(+v)));
const clampAw = v => (v === '' || v == null || isNaN(+v)) ? null : Math.min(AW_RANGE.max, Math.max(AW_RANGE.min, Math.round(+v * 2) / 2));
export const parse = { score: clampScore, aw: clampAw };

export function gre(ctx) {
  const tests = ctx.col('tests'), sessions = ctx.col('sessions'), now = () => new Date().toISOString();
  const after = () => ctx.render(true);
  return {
    settings: ctx.state.gre,
    tests: () => greTests(tests.all()),
    sessions: () => greSessions(sessions.all()),
    setTarget(k, v) { ctx.state.gre.target[k] = k === 'aw' ? clampAw(v) : clampScore(v); ctx.commit(); ctx.render(); },
    setSetting(k, v) { ctx.state.gre[k] = v; ctx.commit(); ctx.render(); },
    addTest(f) { tests.put({ id: newId('x'), subject: 'gre', note: '', source: '', createdAt: now(), ...f }); after(); },
    removeTest(id) { tests.remove(id); after(); },
    addSession(f) { sessions.put({ id: newId('s'), subject: 'gre', note: '', createdAt: now(), ...f }); after(); },
    removeSession(id) { sessions.remove(id); after(); },
  };
}
