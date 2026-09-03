// PLACEHOLDER — overwritten at build time by scripts/generate-config.js from
// the SUPABASE_URL / SUPABASE_ANON_KEY environment variables (set them in
// Vercel Project Settings -> Environment Variables). Committed with empty
// values on purpose so the repo runs out of the box: with no config, cloud
// sync just stays disabled and the app works entirely from LocalStorage.
//
// For local testing with real Supabase: copy .env.example to .env, fill in
// your project's URL/anon key, then run `node scripts/generate-config.js`
// (or `npm run build`) to regenerate this file locally.
window.__SUPABASE_CONFIG__ = {
  "url": "",
  "anonKey": ""
};
