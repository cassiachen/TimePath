// First-run spotlight tour: dims the page, cuts a highlight "hole" around one
// target element at a time (a small rect + a huge box-shadow — no SVG/canvas
// needed), and shows a step card next to it with a one-line explanation.
// Runs once per device (localStorage flag) and is pure vanilla JS/CSS, same
// as every other shared/*.js in this app. Classic script, exposes global
// `TimePathOnboarding`.
//
// Usage: TimePathOnboarding.start([{ target: "#css-selector"|null, titleKey, bodyKey }, ...])
// A step with target: null (or a target that isn't present/visible on this
// page) renders as a centered card with no spotlight, instead of breaking.
(function () {
    var SEEN_KEY = "timepath:onboarding-seen:v1";
    var GAP = 8; // px between the spotlight box and the target's real edges
    var CARD_MARGIN = 12; // px between the spotlight and the step card

    var els = null; // { catcher, spotlight, card }
    var steps = [];
    var index = 0;
    var onComplete = null;

    function hasSeenOnboarding() {
        try { return localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return true; }
    }
    function markSeen() {
        try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
    }

    function T(key) {
        return window.TimePathI18n && window.TimePathI18n.t ? window.TimePathI18n.t(key) : key;
    }

    function buildChrome() {
        var catcher = document.createElement("div");
        catcher.className = "fixed inset-0 z-[300]";

        var spotlight = document.createElement("div");
        spotlight.className = "fixed z-[301] rounded-lg pointer-events-none transition-all duration-300 ease-out";
        spotlight.style.boxShadow = "0 0 0 9999px rgba(0,0,0,0.6)";

        var card = document.createElement("div");
        card.className = "fixed z-[302] w-[300px] max-w-[calc(100vw-24px)] bg-surface-container-lowest border border-outline rounded-xl shadow-lg p-md flex flex-col gap-sm transition-all duration-300 ease-out";

        document.body.appendChild(catcher);
        document.body.appendChild(spotlight);
        document.body.appendChild(card);
        return { catcher: catcher, spotlight: spotlight, card: card };
    }

    function teardown() {
        if (!els) return;
        [els.catcher, els.spotlight, els.card].forEach(function (el) { if (el && el.parentNode) el.parentNode.removeChild(el); });
        els = null;
        window.removeEventListener("resize", positionCurrent);
        window.removeEventListener("scroll", positionCurrent, true);
    }

    function finish() {
        markSeen();
        teardown();
        if (typeof onComplete === "function") onComplete();
    }

    // A target that doesn't exist on this page, or exists but is hidden
    // (display:none via a responsive class, most commonly), is skipped
    // rather than shown as a broken zero-size spotlight in the corner.
    function resolveTarget(step) {
        if (!step.target) return null;
        var el = document.querySelector(step.target);
        if (!el) return null;
        var rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return null;
        return el;
    }

    function positionCurrent() {
        if (!els || !steps[index]) return;
        render(steps[index]);
    }

    function render(step) {
        var target = resolveTarget(step);

        if (target) {
            target.scrollIntoView({ block: "center", behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
            var r = target.getBoundingClientRect();
            var top = Math.max(4, r.top - GAP);
            var left = Math.max(4, r.left - GAP);
            var width = r.width + GAP * 2;
            var height = r.height + GAP * 2;
            els.spotlight.style.display = "block";
            els.spotlight.style.top = top + "px";
            els.spotlight.style.left = left + "px";
            els.spotlight.style.width = width + "px";
            els.spotlight.style.height = height + "px";

            // Prefer below the target; flip above if there isn't room; clamp
            // horizontally so the card never runs off either edge.
            var cardWidth = 300;
            var vh = window.innerHeight, vw = window.innerWidth;
            var placeBelow = (top + height + CARD_MARGIN + 160) < vh;
            var cardTop = placeBelow ? (top + height + CARD_MARGIN) : Math.max(4, top - CARD_MARGIN - 160);
            var cardLeft = Math.min(Math.max(4, left), vw - cardWidth - 4);
            els.card.style.top = cardTop + "px";
            els.card.style.left = cardLeft + "px";
        } else {
            // No target (or it's not visible on this page) — dim everything,
            // center the card.
            els.spotlight.style.display = "block";
            els.spotlight.style.top = "50%";
            els.spotlight.style.left = "50%";
            els.spotlight.style.width = "0px";
            els.spotlight.style.height = "0px";
            els.card.style.top = "calc(50% - 90px)";
            els.card.style.left = "calc(50% - 150px)";
        }

        var isLast = index === steps.length - 1;
        els.card.innerHTML =
            '<div class="flex items-center justify-between">' +
            '<span class="font-mono-sm text-mono-sm text-on-surface-variant">' + (index + 1) + ' / ' + steps.length + '</span>' +
            '<button data-tp-onboarding="skip" class="text-on-surface-variant hover:text-on-surface"><span class="material-symbols-outlined text-[18px]">close</span></button>' +
            '</div>' +
            '<h4 class="font-headline-sm text-headline-sm text-on-surface">' + T(step.titleKey) + '</h4>' +
            '<p class="font-body-md text-body-md text-on-surface-variant">' + T(step.bodyKey) + '</p>' +
            '<div class="flex items-center justify-between mt-xs">' +
            (index > 0 ? '<button data-tp-onboarding="prev" class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-sm py-xs">' + T("onboarding.prev") + '</button>' : '<span></span>') +
            '<button data-tp-onboarding="next" class="font-label-md text-label-md text-on-primary bg-primary rounded px-md py-xs hover:bg-primary-container">' + (isLast ? T("onboarding.finish") : T("onboarding.next")) + '</button>' +
            '</div>';
    }

    function bindCardActions() {
        els.card.addEventListener("click", function (e) {
            var actionEl = e.target.closest("[data-tp-onboarding]");
            if (!actionEl) return;
            var action = actionEl.dataset.tpOnboarding;
            if (action === "skip") finish();
            else if (action === "prev") { index = Math.max(0, index - 1); render(steps[index]); }
            else if (action === "next") {
                if (index === steps.length - 1) finish();
                else { index++; render(steps[index]); }
            }
        });
    }

    // opts.onComplete fires once, whether the tour was finished or skipped —
    // callers use it to defer something that would otherwise visually
    // collide with the tour (e.g. today.html's first-run budget setup modal).
    function start(stepList, opts) {
        opts = opts || {};
        onComplete = opts.onComplete || null;
        if (!stepList || !stepList.length) {
            if (typeof onComplete === "function") onComplete();
            return;
        }
        steps = stepList;
        index = 0;
        els = buildChrome();
        bindCardActions();
        window.addEventListener("resize", positionCurrent);
        window.addEventListener("scroll", positionCurrent, true);
        render(steps[0]);
    }

    // Only runs on a genuinely new device: never seen before, AND no real
    // user-created data yet (timepath-utils.js's dirty flag — the same one
    // timepath-migration.js uses to tell "untouched seed data" apart from
    // real content). A device that already has real data — including an
    // existing user who just updated to a version of the app that happens
    // to have this tour for the first time — gets silently marked as seen
    // instead of shown the tour; this is a new-user-only walkthrough, not a
    // "what's new" announcement for people who already know the app.
    // Returns true if the tour started, false if it was already resolved
    // (so the caller knows to run its own onComplete-equivalent logic
    // immediately).
    function maybeStart(stepList, opts) {
        if (hasSeenOnboarding()) return false;
        if (window.TimePathUtils && window.TimePathUtils.hasUserData()) {
            markSeen();
            return false;
        }
        start(stepList, opts);
        return true;
    }

    window.TimePathOnboarding = { start: start, maybeStart: maybeStart, hasSeenOnboarding: hasSeenOnboarding };
})();
