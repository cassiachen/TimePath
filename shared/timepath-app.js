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

        // Fire-and-forget: decides migrate-vs-pull for a signed-in user, or does
        // nothing when signed out. Never blocks the page's own render above.
        if (window.TimePathMigration && typeof window.TimePathMigration.run === "function") {
            window.TimePathMigration.run();
        }
    }

    window.TimePathApp = { initPage: initPage };
})();
