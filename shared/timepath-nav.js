// Shared left sidebar navigation, used by all 4 pages. Classic script, exposes
// global `TimePathNav`. Previously every page hardcoded its own copy of this
// chrome (with drifting IDs, button shapes, and even a missing user profile
// block on some pages) — this is the single source of truth going forward.
//
// Usage: call TimePathNav.render({ active: 'today', showCalendar: true }) once,
// early in the page's script, before any code does getElementById() on nav
// internals (quick-add-btn, lang-switcher, calendar-month-label, etc).
(function () {
    var AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCVwwUGnIVUJ7JfzEg1n4MZkx8fZ-J4l9gVJZA_3frbDVz7JA22OFa0oPULvuil_D5i9ipuFcY1lXBN-FtTPF92X6pn65HDFkiGxPuKWXue8hqpesFjhYseCIZ2jMAg8jeN3htNU16zybab_pfJQLpjL_q7aqJNSxCm0uvXbRH9Dj86vh1uX06qq6R7P0oMCHbktTPOtz5EQrWkwLq1DiGXqnGVop2TQaGGJlF9vyCHh1nkLfKnHeL4_g";

    // Goals sits a tier above the other four: it's the strategic "why" (long-term
    // breakdown), while Today/Tasks/SOP/Review are the day-to-day "how" (execution).
    // Rendered as its own standalone entry + a labeled, divided group below it,
    // rather than five flat, equal-weight nav items.
    var GOAL_LINK = { key: "goals", href: "goals.html", icon: "flag", i18n: "nav.goals" };
    var EXEC_LINKS = [
        { key: "today", href: "today.html", icon: "calendar_today", i18n: "nav.today" },
        { key: "tasks", href: "tasks.html", icon: "format_list_bulleted", i18n: "nav.tasks" },
        { key: "sop", href: "sop.html", icon: "assignment", i18n: "nav.sop" },
        { key: "review", href: "review.html", icon: "analytics", i18n: "nav.review" }
    ];

    function linkClasses(isActive) {
        return "flex items-center gap-md py-sm px-md rounded-lg transition-colors active:scale-95 font-body-md text-body-md" +
            (isActive ? " text-primary font-bold border-r-4 border-primary bg-surface-container-high" : " text-on-surface-variant hover:bg-surface-container-high group");
    }

    function goalLinkHtml(active) {
        var isActive = GOAL_LINK.key === active;
        var iconClasses = isActive ? "" : " group-hover:text-primary transition-colors";
        var classes = "flex items-center gap-md py-md px-md rounded-lg transition-colors active:scale-95 font-headline-sm text-headline-sm font-bold" +
            (isActive ? " text-primary border-r-4 border-primary bg-surface-container-high" : " text-on-surface-variant hover:bg-surface-container-high group");
        return '<a class="' + classes + '" href="' + GOAL_LINK.href + '">' +
            '<span class="material-symbols-outlined text-[22px]' + iconClasses + '">' + GOAL_LINK.icon + '</span>' +
            '<span data-i18n="' + GOAL_LINK.i18n + '"></span></a>';
    }

    function execLinksHtml(active) {
        return EXEC_LINKS.map(function (link) {
            var isActive = link.key === active;
            var iconClasses = isActive ? "" : " group-hover:text-primary transition-colors";
            return '<li><a class="' + linkClasses(isActive) + '" href="' + link.href + '">' +
                '<span class="material-symbols-outlined' + iconClasses + '">' + link.icon + '</span>' +
                '<span data-i18n="' + link.i18n + '"></span></a></li>';
        }).join("");
    }

    // Mobile bottom tab bar. Injected straight onto <body> rather than
    // through the page's own header/main markup — the 5 pages' surrounding
    // structure differs too much page to page (sop.html has no top header
    // at all; it's a two-pane layout) to hang a nav off any of them
    // consistently. This is the ONLY mobile nav surface — there is no
    // hamburger/drawer alternative, so every page must reserve bottom
    // padding for it (see today.html etc.) or this bar covers their last
    // bit of content.
    function mobileTabBarHtml(active) {
        // Same 5 destinations as the desktop sidebar, in execution order
        // (today/tasks/sop/review) with Goals first — matches how the
        // desktop sidebar visually leads with Goals too.
        var tabs = [GOAL_LINK, EXEC_LINKS[0], EXEC_LINKS[1], EXEC_LINKS[2], EXEC_LINKS[3]];
        // 6th slot, account/sign-in — left EMPTY here on purpose. The
        // desktop sidebar's account block (#nav-user-block, populated by
        // timepath-auth.js's mountNavUser()) lives inside the "hidden
        // md:flex" sidebar, so it was simply unreachable on mobile before
        // this button existed: no way to sign in, see whose account is
        // active, or sign out. mountNavUser() fills this button's icon/
        // label/click-handler in too, same as the desktop block, so nav.js
        // only needs to reserve the slot, not know about auth state.
        return '<nav id="mobile-tab-bar" class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-low border-t border-outline-variant flex items-stretch" style="padding-bottom: env(safe-area-inset-bottom)">' +
            tabs.map(function (tab) {
                var isActive = tab.key === active;
                return '<a href="' + tab.href + '" class="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0' + (isActive ? " text-primary" : " text-on-surface-variant") + '">' +
                    '<span class="material-symbols-outlined text-[22px]"' + (isActive ? ' style="font-variation-settings: \'FILL\' 1;"' : '') + '>' + tab.icon + '</span>' +
                    '<span class="font-mono-sm text-[10px] truncate' + (isActive ? " font-bold" : "") + '" data-i18n="' + tab.i18n + '"></span>' +
                    '</a>';
            }).join("") +
            '<button type="button" id="mobile-account-btn" class="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 text-on-surface-variant"></button>' +
            '</nav>';
    }

    function calendarHtml() {
        var T = window.TimePathI18n.t;
        var weekdays = ["calendar.mon", "calendar.tue", "calendar.wed", "calendar.thu", "calendar.fri", "calendar.sat", "calendar.sun"];
        return '<div class="mt-lg mb-auto px-md">' +
            '<div class="flex justify-between items-center mb-sm">' +
            '<span id="calendar-month-label" class="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider"></span>' +
            '<div class="flex">' +
            '<button id="cal-prev" class="text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>' +
            '<button id="cal-next" class="text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>' +
            '</div></div>' +
            '<div class="grid grid-cols-7 gap-1 text-center font-mono-sm text-[10px] text-on-surface-variant mb-xs">' +
            weekdays.map(function (k) { return "<div>" + T(k) + "</div>"; }).join("") + '</div>' +
            '<div id="mini-calendar-grid" class="grid grid-cols-7 gap-1 text-center font-mono-sm text-mono-sm"></div>' +
            '</div>';
    }

    function render(opts) {
        opts = opts || {};
        var mount = document.querySelector(opts.mountSelector || "#nav-mount");
        if (!mount) return;

        mount.outerHTML =
            '<nav class="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-lg px-md z-40">' +
            '<div class="mb-xl">' +
            '<h1 class="text-headline-md font-headline-md font-bold text-primary">时程｜TimePath</h1>' +
            '<p data-i18n="brand.tagline" class="font-label-md text-label-md text-on-surface-variant mt-xs uppercase tracking-wider"></p>' +
            '</div>' +
            '<button id="quick-add-btn" class="bg-primary text-on-primary w-full py-sm px-md rounded font-label-md text-label-md mb-xl flex items-center justify-center gap-sm hover:bg-primary-container transition-colors active:scale-95">' +
            '<span class="material-symbols-outlined text-[18px]">add</span><span data-i18n="nav.quick_add_task"></span>' +
            '</button>' +
            goalLinkHtml(opts.active) +
            '<div class="my-lg border-t border-outline-variant"></div>' +
            '<p data-i18n="nav.execution_group" class="px-md mb-sm font-mono-sm text-[10px] text-on-surface-variant uppercase tracking-widest"></p>' +
            '<ul class="flex-1 space-y-sm">' + execLinksHtml(opts.active) + '</ul>' +
            (opts.showCalendar ? calendarHtml() : "") +
            '<div id="lang-switcher" class="mt-lg px-md"></div>' +
            '<div id="nav-user-block" class="mt-md pt-md border-t border-outline-variant">' +
            '<div class="flex items-center gap-md py-sm px-md">' +
            '<div class="w-8 h-8 rounded-full bg-surface-container-high animate-pulse shrink-0"></div>' +
            '<div class="flex-1"><div class="h-3 w-24 bg-surface-container-high rounded animate-pulse"></div></div>' +
            '</div></div>' +
            '<div class="mt-sm text-center"><span class="font-mono-sm text-[10px] text-on-surface-variant/70">Designed by Cassia</span></div>' +
            '</nav>';

        // Idempotent: re-running render() (shouldn't normally happen, but
        // cheap to guard) replaces rather than stacking duplicates.
        var existingTabBar = document.getElementById("mobile-tab-bar");
        if (existingTabBar) existingTabBar.remove();
        document.body.insertAdjacentHTML("beforeend", mobileTabBarHtml(opts.active));

        if (window.TimePathAuth && typeof window.TimePathAuth.mountNavUser === "function") {
            window.TimePathAuth.mountNavUser();
        }
    }

    window.TimePathNav = { render: render, AVATAR_URL: AVATAR_URL };
})();
