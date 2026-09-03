// Build-time only. Reads SUPABASE_URL / SUPABASE_ANON_KEY from the environment
// (set in Vercel Project Settings -> Environment Variables) and writes them
// into shared/supabase-config.js as a plain classic script, so the rest of
// the app can read window.__SUPABASE_CONFIG__ without any bundler.
//
// Local dev: create a ".env" file (see .env.example) in the project root with
// the same two keys; this script reads it if the real env vars aren't set.
// Run manually with: node scripts/generate-config.js
const fs = require("fs");
const path = require("path");

function loadDotEnvFallback() {
    var envPath = path.join(__dirname, "..", ".env");
    if (!fs.existsSync(envPath)) return {};
    var out = {};
    fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach(function (line) {
        var trimmed = line.trim();
        if (!trimmed || trimmed.indexOf("#") === 0) return;
        var eq = trimmed.indexOf("=");
        if (eq === -1) return;
        var key = trimmed.slice(0, eq).trim();
        var value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        out[key] = value;
    });
    return out;
}

var dotEnv = loadDotEnvFallback();
var url = process.env.SUPABASE_URL || dotEnv.SUPABASE_URL || "";
var anonKey = process.env.SUPABASE_ANON_KEY || dotEnv.SUPABASE_ANON_KEY || "";

if (!url || !anonKey) {
    console.warn(
        "[generate-config] SUPABASE_URL / SUPABASE_ANON_KEY not set (checked process.env and .env). " +
        "Writing an empty config — cloud sync will stay disabled and the app falls back to LocalStorage only."
    );
}

var outPath = path.join(__dirname, "..", "shared", "supabase-config.js");
var contents =
    "// GENERATED FILE — do not edit by hand. Produced by scripts/generate-config.js\n" +
    "// from SUPABASE_URL / SUPABASE_ANON_KEY at build time. Safe to be public:\n" +
    "// the anon key only grants what Row Level Security allows.\n" +
    "window.__SUPABASE_CONFIG__ = " + JSON.stringify({ url: url, anonKey: anonKey }, null, 2) + ";\n";

fs.writeFileSync(outPath, contents, "utf8");
console.log("[generate-config] wrote " + outPath + (url ? " (configured)" : " (empty — see warning above)"));
