/* Connexion Kairos : email + mot de passe (Supabase Auth) et données dans Supabase (table kairos_state).
   Dans Claude (aperçu avec la base intégrée), la connexion est ignorée. */
const Auth = (() => {
  const inClaude = !!(window.claude && window.claude.use);
  let sb = null;
  const cfgOk = () => typeof SUPABASE_URL === "string" && /^https:\/\/.+\.supabase\.co/.test(SUPABASE_URL) && typeof SUPABASE_KEY === "string" && SUPABASE_KEY.length > 20;
  const back = () => location.origin + location.pathname;

  const css = document.createElement("style");
  css.textContent = "body.locked #main,body.locked #tabs,body.locked header,body.locked footer{display:none!important}";
  document.head.appendChild(css);
  if (!inClaude) document.body.classList.add("locked");

  const ERR = {
    invalid_credentials: "Email ou mot de passe incorrect.",
    email_not_confirmed: "Ton email n'est pas encore confirmé. Ouvre le message que nous t'avons envoyé et clique sur le lien.",
    user_already_exists: "Un compte existe déjà avec cet email. Connecte-toi.",
    email_exists: "Un compte existe déjà avec cet email. Connecte-toi.",
    weak_password: "Mot de passe trop faible : 6 caractères minimum.",
    validation_failed: "Cet email n'a pas l'air valide.",
    email_address_invalid: "Cet email n'a pas l'air valide.",
    over_email_send_rate_limit: "Trop d'emails envoyés pour le moment. Attends une heure puis réessaie.",
    over_request_rate_limit: "Trop d'essais. Attends quelques minutes puis réessaie.",
    signup_disabled: "La création de compte est désactivée.",
    email_provider_disabled: "La connexion par email n'est pas activée dans Supabase."
  };
  const msg = e => {
    if (!e) return "Erreur inconnue.";
    if (ERR[e.code]) return ERR[e.code];
    const m = String(e.message || e);
    if (/Failed to fetch|NetworkError|network/i.test(m)) return "Pas de connexion internet.";
    if (/Invalid login credentials/i.test(m)) return ERR.invalid_credentials;
    if (/already registered/i.test(m)) return ERR.user_already_exists;
    if (/Email not confirmed/i.test(m)) return ERR.email_not_confirmed;
    if (/rate limit/i.test(m)) return ERR.over_email_send_rate_limit;
    return "Erreur : " + m;
  };

  let gate = null;
  function shell(inner) {
    if (!gate) { gate = document.createElement("div"); gate.id = "gate"; document.body.appendChild(gate); }
    gate.className = "fixed inset-0 z-[100] overflow-y-auto bg-bg";
    gate.style.cssText = "background-image:radial-gradient(60% 50% at 10% 0%,rgb(var(--edu)),transparent),radial-gradient(50% 45% at 100% 10%,rgb(var(--sty)),transparent),radial-gradient(60% 50% at 40% 100%,rgb(var(--fin)),transparent)";
    gate.replaceChildren(h("div", { class: "min-h-full grid place-items-center px-4 py-10" }, inner));
  }
  const logo = () => h("h1", { class: "font-display font-extrabold text-5xl tracking-tight text-center" }, "Kai", h("span", { class: "bg-gradient-to-r from-edu-ink via-sk-ink to-sty-ink bg-clip-text text-transparent" }, "ros"));
  const CARD_W = "w-full max-w-md rounded-3xl bg-surface/90 backdrop-blur-xl ring-1 ring-line/80 shadow-lift p-6 sm:p-8 grid gap-4";

  function showSetup() {
    shell(h("div", { class: CARD_W }, logo(),
      h("p", { class: "text-center font-semibold" }, "La connexion n'est pas encore configurée."),
      h("p", { class: "text-sm text-muted" }, "Le propriétaire doit renseigner SUPABASE_URL et SUPABASE_KEY dans js/supabase-config.js.")));
  }
  function showFatal(t) {
    shell(h("div", { class: CARD_W }, logo(), h("p", { class: "text-center text-sm text-warn font-semibold" }, t)));
  }

  /* Formulaire « nouveau mot de passe » (après clic sur le lien de réinitialisation) */
  function showNewPassword() {
    let err = "", busy = false;
    const draw = () => {
      let pw;
      const submit = async e => {
        e.preventDefault();
        if (busy) return;
        busy = true; err = ""; draw();
        const { error } = await sb.auth.updateUser({ password: pw.value });
        if (error) { err = msg(error); busy = false; draw(); }
        else { history.replaceState(null, "", back()); location.reload(); }
      };
      pw = h("input", { class: IN, id: "np", type: "password", autocomplete: "new-password", required: true, minlength: 6, placeholder: "••••••••" });
      shell(h("div", { class: CARD_W },
        logo(), h("p", { class: "text-center text-muted -mt-2" }, "Choisis ton nouveau mot de passe."),
        h("form", { class: "grid gap-4", onsubmit: submit },
          h("div", { class: "grid gap-1" }, h("label", { class: LABEL, for: "np" }, "Nouveau mot de passe"), pw),
          err ? h("p", { class: "rounded-xl bg-warn/10 px-3 py-2 text-sm font-semibold text-warn", role: "alert" }, err) : null,
          h("button", { class: BTN + " w-full py-3 text-base", type: "submit", disabled: busy }, busy ? "Un instant…" : "Enregistrer"))));
    };
    draw();
  }

  function showLogin(finish) {
    let mode = "in", busy = false, info = "", err = "";
    const draw = () => {
      let em, pw;
      const submit = async e => {
        e.preventDefault();
        if (busy) return;
        const a = em.value.trim(), b = pw.value;
        err = ""; info = ""; busy = true; draw0(true, a);
        try {
          if (mode === "up") {
            const { data, error } = await sb.auth.signUp({ email: a, password: b, options: { emailRedirectTo: back() } });
            if (error) throw error;
            if (data.session) return finish(data.session.user);
            if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw { code: "user_already_exists" };
            mode = "in"; busy = false;
            info = "Compte créé. Un email de confirmation a été envoyé à " + a + ". Clique sur le lien (regarde aussi tes spams), puis reviens te connecter.";
            return draw0(false, a);
          }
          const { data, error } = await sb.auth.signInWithPassword({ email: a, password: b });
          if (error) throw error;
          finish(data.session.user);
        } catch (x) { err = msg(x); busy = false; draw0(false, a); }
      };
      const reset = async () => {
        const a = em.value.trim();
        if (!a) { err = "Écris d'abord ton email, puis clique sur « Mot de passe oublié »."; info = ""; return draw0(false, a); }
        const { error } = await sb.auth.resetPasswordForEmail(a, { redirectTo: back() });
        if (error) { err = msg(error); info = ""; } else { info = "Email envoyé à " + a + ". Regarde aussi tes spams."; err = ""; }
        draw0(false, a);
      };
      const eye = h("button", { type: "button", class: "absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-ci px-2 py-1 cursor-pointer", onclick: () => { pw.type = pw.type === "password" ? "text" : "password"; eye.textContent = pw.type === "password" ? "Voir" : "Cacher"; } }, "Voir");
      const form = h("form", { class: "grid gap-4", onsubmit: submit },
        h("div", { class: "grid gap-1" }, h("label", { class: LABEL, for: "lg-email" }, "Email"),
          em = h("input", { class: IN, id: "lg-email", type: "email", autocomplete: "username", inputmode: "email", required: true, placeholder: "toi@exemple.com" })),
        h("div", { class: "grid gap-1" }, h("label", { class: LABEL, for: "lg-pw" }, "Mot de passe"),
          h("div", { class: "relative" }, pw = h("input", { class: IN + " pr-16", id: "lg-pw", type: "password", autocomplete: mode === "up" ? "new-password" : "current-password", required: true, minlength: 6, placeholder: "••••••••" }), eye)),
        err ? h("p", { class: "rounded-xl bg-warn/10 px-3 py-2 text-sm font-semibold text-warn", role: "alert" }, err) : null,
        info ? h("p", { class: "rounded-xl bg-fin px-3 py-2 text-sm font-semibold text-fin-ink", role: "status" }, info) : null,
        h("button", { class: BTN + " w-full py-3 text-base", type: "submit", disabled: busy }, busy ? "Un instant…" : (mode === "up" ? "Créer mon compte" : "Me connecter")),
        h("div", { class: "flex flex-wrap items-center justify-between gap-2 text-[13px]" },
          mode === "in" ? h("button", { type: "button", class: "font-semibold text-muted hover:text-ci cursor-pointer", onclick: reset }, "Mot de passe oublié ?") : h("span"),
          (typeof ALLOW_SIGNUP !== "undefined" && ALLOW_SIGNUP)
            ? h("button", { type: "button", class: "font-semibold text-ci cursor-pointer", onclick: () => { mode = mode === "in" ? "up" : "in"; err = ""; info = ""; draw0(false, em.value); } }, mode === "in" ? "Créer mon compte" : "J'ai déjà un compte")
            : null));
      shell(h("div", { class: "w-full max-w-sm rounded-3xl bg-surface/90 backdrop-blur-xl ring-1 ring-line/80 shadow-lift p-6 sm:p-8 grid gap-5 border-t-4 border-ci/70", "data-c": "me" },
        logo(), h("p", { class: "text-center text-muted -mt-2" }, mode === "up" ? "Crée ton compte personnel." : "Connecte-toi pour retrouver ton tableau de bord."), form));
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
    const old = document.getElementById("logout"); if (old) old.remove();
    const b = h("button", { id: "logout", class: GHOST, title: user.email || "", onclick: () => {
      try { localStorage.removeItem("ssv.cache"); localStorage.removeItem("ssv.uid"); } catch (e) {}
      setTimeout(() => sb.auth.signOut().finally(() => location.reload()), 900);
    } }, "Se déconnecter");
    const save = document.getElementById("save");
    if (save && save.parentNode) save.parentNode.appendChild(b);
  }

  /* Même interface que l'ancienne base : doc().set(d) et doc().onSnapshot(ok, err) */
  function dbFor(user) {
    const snapOf = json => ({ metadata: { hasPendingWrites: false, fromCache: false }, exists: json != null, data: () => json });
    return { doc: () => ({
      set: async d => {
        const { error } = await sb.from("kairos_state").upsert({ user_id: user.id, json: d, updated_at: new Date().toISOString() });
        if (error) throw error;
      },
      onSnapshot: (ok, err) => {
        const load = async () => {
          const { data, error } = await sb.from("kairos_state").select("json").eq("user_id", user.id).maybeSingle();
          if (error) { if (err) err(error); return; }
          ok(snapOf(data ? data.json : null));
        };
        load();
        try {
          sb.channel("kairos-" + user.id)
            .on("postgres_changes", { event: "*", schema: "public", table: "kairos_state", filter: "user_id=eq." + user.id },
              p => { if (p.new && p.new.json) ok(snapOf(p.new.json)); })
            .subscribe();
        } catch (e) { /* le temps réel est facultatif */ }
        document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
        return () => {};
      }
    }) };
  }

  function start() {
    if (inClaude) return Promise.resolve({ user: null });
    if (!cfgOk()) { showSetup(); return new Promise(() => {}); }
    if (typeof supabase === "undefined" || !supabase.createClient) { showFatal("Impossible de charger le service de connexion. Vérifie ta connexion internet puis recharge la page."); return new Promise(() => {}); }
    try { sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }); }
    catch (e) { showFatal(msg(e)); return new Promise(() => {}); }
    return new Promise(resolve => {
      let done = false, recovery = false;
      const finish = u => {
        if (done) return;
        done = true;
        document.body.classList.remove("locked");
        if (gate) { gate.remove(); gate = null; }
        const user = { uid: u.id, email: u.email };
        mountLogout(user);
        resolve({ user, db: dbFor(u) });
      };
      sb.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") { recovery = true; showNewPassword(); }
        else if (event === "SIGNED_IN" && session && !recovery && !done) finish(session.user);
        else if (event === "SIGNED_OUT" && done) location.reload();
      });
      sb.auth.getSession().then(({ data }) => {
        if (recovery || done) return;
        if (data && data.session) finish(data.session.user);
        else setTimeout(() => { if (!done && !recovery) showLogin(finish); }, 50);
      });
    });
  }
  return { start };
})();
