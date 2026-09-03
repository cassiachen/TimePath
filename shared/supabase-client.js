// Thin Supabase client wrapper. Classic script (not type="module") like every
// other shared/*.js — it uses the dynamic import() *expression* to pull the
// Supabase JS SDK from an ESM CDN at runtime, which classic scripts are
// allowed to do. This keeps the whole app bundler-free: no npm install, no
// build step for app code (the one Node build step only stamps env vars into
// shared/supabase-config.js, see scripts/generate-config.js).
//
// window.TimePathSupabase.ready is a Promise every other module awaits
// before touching .client. If SUPABASE_URL/ANON_KEY are empty (unconfigured
// build) or the CDN import fails (offline), client stays null and
// isConfigured() reports false — callers are expected to fall back to
// LocalStorage-only behavior rather than throw.
(function () {
    var SDK_URL = "https://esm.sh/@supabase/supabase-js@2";

    var client = null;
    var configured = false;

    function isConfigured() { return configured; }
    function getClient() { return client; }

    var ready = (async function init() {
        var cfg = window.__SUPABASE_CONFIG__ || {};
        if (!cfg.url || !cfg.anonKey) {
            console.warn("[supabase-client] not configured (empty url/anonKey) — cloud sync disabled, LocalStorage-only mode.");
            return null;
        }
        try {
            var mod = await import(SDK_URL);
            client = mod.createClient(cfg.url, cfg.anonKey, {
                auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
            });
            configured = true;
            return client;
        } catch (err) {
            console.warn("[supabase-client] failed to load Supabase SDK (offline or CDN blocked) — cloud sync disabled for this session.", err);
            return null;
        }
    })();

    window.TimePathSupabase = { ready: ready, getClient: getClient, isConfigured: isConfigured };
})();
