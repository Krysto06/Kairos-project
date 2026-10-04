/* Stockage du navigateur. Peut être vide ou refusé (navigation privée, aperçu) : jamais d'exception. */
export function lsGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
export function lsSet(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignoré */ } }
export function lsGetJSON(key) { try { const v = lsGet(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
export function lsSetJSON(key, value) { lsSet(key, JSON.stringify(value)); }
