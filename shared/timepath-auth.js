// Supabase Auth wrapper + nav user-block rendering. Classic script, exposes
// global `TimePathAuth`. Login is OPTIONAL, not a gate: every page keeps
// working from LocalStorage alone when signed out or when cloud sync is
// unconfigured/offline — this only adds an account on top of that.
//
// Session state (`getUser()`) is populated asynchronously (it awaits
// TimePathSupabase.ready, then a real getSession() call), so callers that
// need to react to it — like the sync layer's first pull — should use
// `ready` or `onChange`, not assume `getUser()` is populated immediately
// after page load.
(function () {
    // A Supabase password-reset (or magic-link) redirect lands wherever the
    // project's Site URL / Redirect URLs config points — not necessarily
    // login.html specifically, if that exact page was never whitelisted.
    // login.html is the only page with a "set new password" UI, so a
    // recovery link landing anywhere else gets funneled there immediately,
    // before this page does anything else with the token (render, decide on
    // the onboarding tour, etc.) or the Supabase client quietly consumes it
    // as if it were just a normal sign-in.
    var isRecoveryLink = /type=recovery/.test(window.location.hash) || /type=recovery/.test(window.location.search);
    if (isRecoveryLink && !/\/login\.html$/.test(window.location.pathname)) {
        window.location.replace("login.html" + window.location.hash + window.location.search);
        return;
    }

    var user = null; // { id, email } | null
    var listeners = [];
    var recoveryListeners = [];

    function notify() {
        listeners.forEach(function (fn) {
            try { fn(user); } catch (e) { console.error("[timepath-auth] listener error", e); }
        });
        mountNavUser();
    }

    function fromSession(session) {
        return session && session.user ? { id: session.user.id, email: session.user.email } : null;
    }

    var ready = (async function init() {
        var client = null;
        try {
            client = await window.TimePathSupabase.ready;
        } catch (e) {
            client = null;
        }
        if (!client) return null;

        try {
            var res = await client.auth.getSession();
            user = fromSession(res && res.data && res.data.session);
        } catch (e) {
            user = null;
        }

        client.auth.onAuthStateChange(function (event, session) {
            user = fromSession(session);
            // Clicking the emailed reset link signs the browser into a
            // short-lived recovery session and fires this event — listeners
            // (login.html) use it to show the "set a new password" form
            // instead of treating it as a normal sign-in.
            if (event === "PASSWORD_RECOVERY") {
                recoveryListeners.forEach(function (fn) {
                    try { fn(); } catch (e) { console.error("[timepath-auth] recovery listener error", e); }
                });
            }
            notify();
        });

        mountNavUser();
        return client;
    })();

    function getUser() { return user; }
    function isConfigured() { return !!(window.TimePathSupabase && window.TimePathSupabase.isConfigured()); }
    function onChange(fn) { listeners.push(fn); }
    function onPasswordRecovery(fn) { recoveryListeners.push(fn); }

    async function signUp(email, password) {
        var client = await ready;
        if (!client) { var e1 = new Error("cloud_unavailable"); e1.code = "cloud_unavailable"; throw e1; }
        var res = await client.auth.signUp({ email: email, password: password });
        if (res.error) throw res.error;
        user = fromSession(res.data && res.data.session);
        notify();
        return res.data;
    }

    async function signIn(email, password) {
        var client = await ready;
        if (!client) { var e2 = new Error("cloud_unavailable"); e2.code = "cloud_unavailable"; throw e2; }
        var res = await client.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw res.error;
        user = fromSession(res.data && res.data.session);
        notify();
        return res.data;
    }

    // Sends the "reset your password" email. redirectTo must be pre-registered
    // in the Supabase project (Authentication -> URL Configuration -> Redirect
    // URLs) or Supabase silently redirects to its own default/error page
    // instead of back into the app.
    async function resetPasswordForEmail(email) {
        var client = await ready;
        if (!client) { var e1 = new Error("cloud_unavailable"); e1.code = "cloud_unavailable"; throw e1; }
        var res = await client.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        });
        if (res.error) throw res.error;
        return true;
    }

    // Only valid while signed into the short-lived recovery session created
    // by clicking the emailed reset link (see the PASSWORD_RECOVERY event
    // above) — calling this outside that flow fails because there's no
    // session to update.
    async function updateUserPassword(newPassword) {
        var client = await ready;
        if (!client) { var e2 = new Error("cloud_unavailable"); e2.code = "cloud_unavailable"; throw e2; }
        var res = await client.auth.updateUser({ password: newPassword });
        if (res.error) throw res.error;
        return res.data;
    }

    async function signOut() {
        var client = await ready;
        if (client) {
            try { await client.auth.signOut(); } catch (e) { /* still clear local user state below */ }
        }
        user = null;
        // So a re-login in this same tab re-runs the migration/pull decision in
        // timepath-migration.js instead of thinking this session already synced.
        try { sessionStorage.removeItem("timepath:session-synced"); } catch (e) {}
        notify();
    }

    function escapeHtml(str) {
        return window.TimePathUtils && window.TimePathUtils.escapeHtml
            ? window.TimePathUtils.escapeHtml(str)
            : String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
                return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
            });
    }

    function mountNavUser() {
        mountDesktopNavUser();
        mountMobileAccountButton();
    }

    function mountDesktopNavUser() {
        var mount = document.getElementById("nav-user-block");
        if (!mount) return;
        var T = window.TimePathI18n ? window.TimePathI18n.t : function (k) { return k; };
        var avatarUrl = window.TimePathNav ? window.TimePathNav.AVATAR_URL : "";

        if (!isConfigured()) {
            mount.innerHTML =
                '<div class="flex items-center gap-md py-sm px-md">' +
                '<span class="material-symbols-outlined text-on-surface-variant">cloud_off</span>' +
                '<div class="font-label-md text-label-md text-on-surface-variant">' + T("auth.local_only") + '</div>' +
                '</div>';
            return;
        }

        if (user) {
            mount.innerHTML =
                '<div class="flex items-center gap-md py-sm px-md rounded-lg hover:bg-surface-container-high transition-colors">' +
                '<img alt="" class="w-8 h-8 rounded-full object-cover shrink-0" src="' + avatarUrl + '"/>' +
                '<div class="flex-1 min-w-0">' +
                '<div class="font-label-md text-label-md text-on-surface truncate" title="' + escapeHtml(user.email) + '">' + escapeHtml(user.email) + '</div>' +
                '<button id="nav-sign-out-btn" type="button" class="font-mono-sm text-mono-sm text-on-surface-variant hover:text-primary">' + T("auth.sign_out") + '</button>' +
                '</div></div>';
            var btn = document.getElementById("nav-sign-out-btn");
            if (btn) btn.addEventListener("click", function () { signOut(); });
        } else {
            mount.innerHTML =
                '<a href="login.html" class="flex items-center gap-md py-sm px-md rounded-lg hover:bg-surface-container-high transition-colors">' +
                '<span class="material-symbols-outlined text-on-surface-variant">account_circle</span>' +
                '<div>' +
                '<div class="font-label-md text-label-md text-on-surface">' + T("auth.sign_in") + '</div>' +
                '<div class="font-mono-sm text-mono-sm text-on-surface-variant">' + T("auth.sign_in_hint") + '</div>' +
                '</div></a>';
        }
    }

    // The mobile bottom tab bar's 6th slot (see timepath-nav.js's
    // mobileTabBarHtml) — the only way to reach login.html, or sign out,
    // on a phone, since the desktop sidebar's #nav-user-block block that
    // normally does this lives inside "hidden md:flex". Same three states
    // as the desktop block, compressed into one icon+label tab: not
    // configured (inert), signed out (tap -> login.html), signed in (tap ->
    // confirm + sign out, since there's no separate account page to land on).
    function mountMobileAccountButton() {
        var btn = document.getElementById("mobile-account-btn");
        if (!btn) return;
        var T = window.TimePathI18n ? window.TimePathI18n.t : function (k) { return k; };
        btn.onclick = null;

        if (!isConfigured()) {
            btn.innerHTML =
                '<span class="material-symbols-outlined text-[22px]">cloud_off</span>' +
                '<span class="font-mono-sm text-[10px] truncate" data-i18n="auth.mobile_tab_local_only"></span>';
        } else if (user) {
            btn.innerHTML =
                '<span class="material-symbols-outlined text-[22px]">account_circle</span>' +
                '<span class="font-mono-sm text-[10px] truncate" data-i18n="auth.mobile_tab_signed_in"></span>';
            btn.onclick = function () {
                window.TimePathModal.confirmDialog(T("auth.confirm_sign_out"), function () { signOut(); });
            };
        } else {
            btn.innerHTML =
                '<span class="material-symbols-outlined text-[22px]">account_circle</span>' +
                '<span class="font-mono-sm text-[10px] truncate" data-i18n="auth.mobile_tab_signed_out"></span>';
            btn.onclick = function () { window.location.href = "login.html"; };
        }
        if (window.TimePathI18n) window.TimePathI18n.applyStatic(btn);
    }

    window.TimePathAuth = {
        ready: ready,
        getUser: getUser,
        isConfigured: isConfigured,
        onChange: onChange,
        onPasswordRecovery: onPasswordRecovery,
        signUp: signUp,
        signIn: signIn,
        signOut: signOut,
        resetPasswordForEmail: resetPasswordForEmail,
        updateUserPassword: updateUserPassword,
        mountNavUser: mountNavUser
    };
})();
