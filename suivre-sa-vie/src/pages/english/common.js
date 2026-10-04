/* Données Anglais : réglages dans l'état, tests et séances dans les collections partagées (subject:'en'). */
import { enTests, enSessions } from '../../domain/english.js';
import { newId } from '../../services/collections.js';

export function english(ctx) {
  const tests = ctx.col('tests'), sessions = ctx.col('sessions'), now = () => new Date().toISOString();
  const after = () => ctx.render(true);
  return {
    settings: ctx.state.english,
    tests: () => enTests(tests.all()),
    sessions: () => enSessions(sessions.all()),
    set(k, v) { ctx.state.english[k] = v; ctx.commit(); ctx.render(); },
    addTest(f) { tests.put({ id: newId('x'), subject: 'en', note: '', sub: {}, createdAt: now(), ...f }); after(); },
    removeTest(id) { tests.remove(id); after(); },
    addSession(f) { sessions.put({ id: newId('s'), subject: 'en', note: '', createdAt: now(), ...f }); after(); },
    removeSession(id) { sessions.remove(id); after(); },
  };
}
