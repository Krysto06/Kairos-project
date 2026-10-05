/* Connexion Kairos : email + mot de passe (Firebase Auth) et données dans Firestore.
   Dans Claude (aperçu avec la base intégrée), la connexion est ignorée. */
const Auth = (() => {
  const inClaude = !!(window.claude && window.claude.use);
  let fbAuth = null, fbDb = null;
  const cfgOk = () => typeof FIREBASE_CONFIG === 'object' && FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId && !/^COLLE/i.test(FIREBASE_CONFIG.apiKey);

  const css = document.createElement('style');
  css.textContent = 'body.locked #main,body.locked #tabs,body.locked header,body.locked footer{display:none!important}';
  document.head.appendChild(css);
  if (!inClaude) document.body.classList.add('locked');

  const ERR = {
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/wrong-password': 'Email ou mot de passe incorrect.',
    'auth/user-not-found': 'Email ou mot de passe incorrect.',
    'auth/invalid-email': 'Cet email n’a pas l’air valide.',
    'auth/missing-password': 'Entre ton mot de passe.',
    'auth/weak-password': 'Mot de passe trop court : 6 caractères minimum.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet email. Connecte-toi.',
    'auth/too-many-requests': 'Trop d’essais. Attends quelques minutes puis réessaie.',
    'auth/network-request-failed': 'Pas de connexion internet.',
    'auth/operation-not-allowed': 'La connexion par email n’est pas activée dans Firebase (Authentication > Méthode de connexion).',
    'auth/unauthorized-domain': 'Cette adresse n’est pas autorisée dans Firebase (Authentication > Paramètres > Domaines autorisés).'
  };
  const msg = e => ERR[e && e.code] || ('Erreur : ' + ((e && e.message) || e));

  let gate = null;
  function shell(inner) {
    if (!gate) { gate = document.createElement('div'); gate.id = 'gate'; document.body.appendChild(gate); }
    gate.className = 'fixed inset-0 z-[100] overflow-y-auto bg-bg';
    gate.style.cssText = 'background-image:radial-gradient(60% 50% at 10% 0%,rgb(var(--edu)),transparent),radial-gradient(50% 45% at 100% 10%,rgb(var(--sty)),transparent),radial-gradient(60% 50% at 40% 100%,rgb(var(--fin)),transparent)';
    gate.replaceChildren(h('div', { class: 'min-h-full grid place-items-center px-4 py-10' }, inner));
  }
  const logo = () => h('h1', { class: 'font-display font-extrabold text-5xl tracking-tight text-center' }, 'Kai', h('span', { class: 'bg-gradient-to-r from-edu-ink via-sk-ink to-sty-ink bg-clip-text text-transparent' }, 'ros'));

  function showSetup() {
    shell(h('div', { class: 'w-full max-w-md rounded-3xl bg-surface/90 backdrop-blur-xl ring-1 ring-line/80 shadow-lift p-6 sm:p-8 grid gap-4' },
      logo(),
      h('p', { class: 'text-center font-semibold' }, 'La connexion n’est pas encore configurée.'),
      h('p', { class: 'text-sm text-muted' }, 'Le propriétaire doit créer un projet Firebase (gratuit), puis coller sa configuration dans js/firebase-config.js.')));
  }
  function showFatal(t) {
    shell(h('div', { class: 'w-full max-w-md rounded-3xl bg-surface/90 backdrop-blur-xl ring-1 ring-line/80 shadow-lift p-6 sm:p-8 grid gap-4' }, logo(), h('p', { class: 'text-center text-sm text-warn font-semibold' }, t)));
  }

  function showLogin() {
    let mode = 'in', busy = false, info = '', err = '';
    const draw = () => {
      let em, pw;
      const submit = async e => {
        e.preventDefault();
        if (busy) return;
        const a = em.value.trim(), b = pw.value;
        err = ''; info = ''; busy = true; draw0(true, a);
        try {
          if (mode === 'up') await fbAuth.createUserWithEmailAndPassword(a, b);
          else await fbAuth.signInWithEmailAndPassword(a, b);
        } catch (x) { err = msg(x); busy = false; draw0(false, a); }
      };
      const a0 = el => el.value;
      const reset = async () => {
        const a = em.value.trim();
        if (!a) { err = 'Écris d’abord ton email, puis clique sur « Mot de passe oublié ».'; info = ''; return draw0(false, a); }
        try { await fbAuth.sendPasswordResetEmail(a); info = 'Email envoyé à ' + a + '. Regarde aussi tes spams.'; err = ''; } catch (x) { err = msg(x); info = ''; }
        draw0(false, a);
      };
      const eye = h('button', { type: 'button', class: 'absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-ci px-2 py-1 cursor-pointer', onclick: () => { pw.type = pw.type === 'password' ? 'text' : 'password'; eye.textContent = pw.type === 'password' ? 'Voir' : 'Cacher'; } }, 'Voir');
      const form = h('form', { class: 'grid gap-4', onsubmit: submit },
        h('div', { class: 'grid gap-1' }, h('label', { class: LABEL, for: 'lg-email' }, 'Email'),
          em = h('input', { class: IN, id: 'lg-email', type: 'email', autocomplete: 'username', inputmode: 'email', required: true, placeholder: 'toi@exemple.com' })),
        h('div', { class: 'grid gap-1' }, h('label', { class: LABEL, for: 'lg-pw' }, 'Mot de passe'),
          h('div', { class: 'relative' }, pw = h('input', { class: IN + ' pr-16', id: 'lg-pw', type: 'password', autocomplete: mode === 'up' ? 'new-password' : 'current-password', required: true, minlength: 6, placeholder: '••••••••' }), eye)),
        err ? h('p', { class: 'rounded-xl bg-warn/10 px-3 py-2 text-sm font-semibold text-warn', role: 'alert' }, err) : null,
        info ? h('p', { class: 'rounded-xl bg-fin px-3 py-2 text-sm font-semibold text-fin-ink', role: 'status' }, info) : null,
        h('button', { class: BTN + ' w-full py-3 text-base', type: 'submit', disabled: busy }, busy ? 'Un instant…' : (mode === 'up' ? 'Créer mon compte' : 'Me connecter')),
        h('div', { class: 'flex flex-wrap items-center justify-between gap-2 text-[13px]' },
          mode === 'in' ? h('button', { type: 'button', class: 'font-semibold text-muted hover:text-ci cursor-pointer', onclick: reset }, 'Mot de passe oublié ?') : h('span'),
          (typeof ALLOW_SIGNUP !== 'undefined' && ALLOW_SIGNUP)
            ? h('button', { type: 'button', class: 'font-semibold text-ci cursor-pointer', onclick: () => { mode = mode === 'in' ? 'up' : 'in'; err = ''; info = ''; draw0(false, em.value); } }, mode === 'in' ? 'Créer mon compte' : 'J’ai déjà un compte')
            : null));
      shell(h('div', { class: 'w-full max-w-sm rounded-3xl bg-surface/90 backdrop-blur-xl ring-1 ring-line/80 shadow-lift p-6 sm:p-8 grid gap-5 border-t-4 border-ci/70', 'data-c': 'me' },
        logo(), h('p', { class: 'text-center text-muted -mt-2' }, mode === 'up' ? 'Crée ton compte personnel.' : 'Connecte-toi pour retrouver ton tableau de bord.'), form));
      return { em, pw };
    };
    function draw0(disabled, email) {
      const r = draw();
      if (email) r.em.value = email;
      if (disabled) { r.em.disabled = r.pw.disabled = true; }
      else (email ? r.pw : r.em).focus();
    }
    draw0(false);
  }

  function mountLogout(user) {
    const old = document.getElementById('logout'); if (old) old.remove();
    const b = h('button', { id: 'logout', class: GHOST, title: user.email || '', onclick: () => {
      try { localStorage.removeItem('ssv.cache'); localStorage.removeItem('ssv.uid'); } catch (e) {}
      setTimeout(() => fbAuth.signOut(), 900);
    } }, 'Se déconnecter');
    const save = document.getElementById('save');
    if (save && save.parentNode) save.parentNode.appendChild(b);
  }

  function dbFor(user) {
    const ref = fbDb.doc('users/' + user.uid + '/data/state');
    return { doc: () => ({
      set: d => ref.set({ json: JSON.stringify(d), t: Date.now() }),
      onSnapshot: (ok, err) => ref.onSnapshot(s => ok({ metadata: s.metadata, exists: s.exists, data: () => JSON.parse(s.data().json) }), err)
    }) };
  }

  function start() {
    if (inClaude) return Promise.resolve({ user: null });
    if (!cfgOk()) { showSetup(); return new Promise(() => {}); }
    if (typeof firebase === 'undefined') { showFatal('Impossible de charger le service de connexion. Vérifie ta connexion internet puis recharge la page.'); return new Promise(() => {}); }
    try { firebase.initializeApp(FIREBASE_CONFIG); fbAuth = firebase.auth(); fbDb = firebase.firestore(); }
    catch (e) { showFatal(msg(e)); return new Promise(() => {}); }
    return new Promise(resolve => {
      let first = true, done = false;
      fbAuth.onAuthStateChanged(u => {
        if (u) {
          if (done) return;
          done = true;
          document.body.classList.remove('locked');
          if (gate) { gate.remove(); gate = null; }
          mountLogout(u);
          resolve({ user: u, db: dbFor(u) });
        } else {
          if (!first || done) { location.reload(); return; }
          first = false; showLogin();
        }
      });
    });
  }
  return { start };
})();
