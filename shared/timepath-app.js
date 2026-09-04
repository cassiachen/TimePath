(function () {
    function initPage(options) {
        options = options || {};

        if (window.TimePathStore && typeof window.TimePathStore.load === "function") {
            window.TimePathStore.load();
        }

        if (window.TimePathNav && typeof window.TimePathNav.render === "function") {
            window.TimePathNav.render(options.nav || { active: options.active || "today", showCalendar: !!options.showCalendar });
        }

        if (window.TimePathI18n) {
            if (typeof window.TimePathI18n.applyStatic === "function") {
                window.TimePathI18n.applyStatic();
            }

            var langSwitcher = document.getElementById("lang-switcher");
            if (langSwitcher && typeof window.TimePathI18n.renderSwitcher === "function") {
                window.TimePathI18n.renderSwitcher(langSwitcher);
            }
        }

        if (options.titleKey && window.TimePathI18n && typeof window.TimePathI18n.t === "function") {
            document.title = "时程｜TimePath · " + window.TimePathI18n.t(options.titleKey);
        } else if (options.title) {
            document.title = options.title;
        }

        // Fire-and-forget as far as this function's own caller is concerned —
        // decides migrate-vs-pull for a signed-in user, or does nothing when
        // signed out, and never blocks the page's own render above. The
        // promise is still returned (not awaited here) so callers that
        // specifically need to know once cloud data has actually landed —
        // e.g. today.html deciding whether to show the new-device onboarding
        // tour — can wait on it instead of checking local state before the
        // pull has had a chance to finish.
        var migrationPromise = Promise.resolve();
        if (window.TimePathMigration && typeof window.TimePathMigration.run === "function") {
            migrationPromise = window.TimePathMigration.run();
        }
        return migrationPromise;
    }

    window.TimePathApp = { initPage: initPage };
})();
