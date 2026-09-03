// Decides, on each page load, whether this signed-in user needs a first-login
// migration (device has local data, cloud account is empty — offer to upload)
// or a cloud pull (cloud already has data — hydrate this device from it), then
// gets out of the way. Classic script, exposes global `TimePathMigration`.
//
// Two guards keep this from doing unnecessary or unsafe work:
//  - `timepath:migrated:<userId>` (localStorage, permanent): set once this
//    device has resolved sync for this account at all — either migrated or
//    pulled. After that, ongoing local edits sync forward through
//    timepath-sync.js's queue on their own; this file doesn't act again for
//    that user except the per-session refresh below.
//  - `timepath:session-synced` (sessionStorage, cleared on sign-out and when
//    the tab closes): guards a once-per-session cloud refresh so a second
//    device's edits eventually show up here too, WITHOUT re-pulling on every
//    page navigation within the same session — a same-tab pull on every nav
//    could race a just-made local edit that's still in the sync queue and
//    hasn't reached the server yet, and briefly show stale data.
(function () {
    var SESSION_KEY = "timepath:session-synced";

    function everKey(userId) { return "timepath:migrated:" + userId; }

    // Untouched seedState() demo content doesn't count as "local data" — only
    // an actual create/update/delete (tracked by timepath-utils.js's dirty
    // flag, set from inside both stores' mutation functions) does. A device
    // that predates this flag has no key at all, which hasUserData() treats
    // as "assume real data" so existing installs still migrate as before.
    function localHasData() {
        return !!(window.TimePathUtils && window.TimePathUtils.hasUserData());
    }

    function offerMigration(userId) {
        if (!window.TimePathModal || !window.TimePathI18n) return;
        window.TimePathModal.confirmDialog(window.TimePathI18n.t("migration.confirm_message"), function () {
            window.TimePathSync.pushAllLocalToCloud().then(function (ok) {
                if (ok) {
                    try { localStorage.setItem(everKey(userId), "done"); } catch (e) {}
                    try { sessionStorage.setItem(SESSION_KEY, userId); } catch (e) {}
                } else {
                    console.warn("[timepath-migration] upload failed, will offer again next login");
                }
            });
        });
    }

    async function run() {
        if (!window.TimePathAuth || !window.TimePathSync) return;
        var user;
        try {
            await window.TimePathAuth.ready;
            user = window.TimePathAuth.getUser();
        } catch (e) {
            return;
        }
        if (!user) return;

        var resolvedBefore = false;
        try { resolvedBefore = localStorage.getItem(everKey(user.id)) === "done"; } catch (e) {}

        if (!resolvedBefore) {
            var cloudHasData = await window.TimePathSync.cloudHasAnyData();
            if (cloudHasData === null) return; // offline/unconfigured/unknown — try again next page load

            if (!cloudHasData && localHasData()) {
                offerMigration(user.id);
            } else {
                var pulled = await window.TimePathSync.pullAll();
                if (pulled) {
                    try { localStorage.setItem(everKey(user.id), "done"); } catch (e) {}
                    try { sessionStorage.setItem(SESSION_KEY, user.id); } catch (e) {}
                }
            }
            return;
        }

        var alreadyThisSession = false;
        try { alreadyThisSession = sessionStorage.getItem(SESSION_KEY) === user.id; } catch (e) {}
        if (!alreadyThisSession) {
            var refreshed = await window.TimePathSync.pullAll();
            if (refreshed) { try { sessionStorage.setItem(SESSION_KEY, user.id); } catch (e) {} }
        }
    }

    window.TimePathMigration = { run: run };
})();
