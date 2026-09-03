// Shared date/time/id helpers used by every TimePath page. Classic script (no
// `type="module"`), exposes a single global `TimePathUtils` object.
(function () {
    function pad2(n) { return String(n).padStart(2, "0"); }

    function uid(prefix) {
        return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function todayStr() {
        return formatDate(new Date());
    }

    function formatDate(d) {
        return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
    }

    // Parses "YYYY-MM-DD" as a local-time midnight Date (avoids UTC shift bugs).
    function parseDate(dateStr) {
        var parts = dateStr.split("-").map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function addDays(dateStr, n) {
        var d = parseDate(dateStr);
        d.setDate(d.getDate() + n);
        return formatDate(d);
    }

    function weekdayIndex(dateStr) {
        // Monday = 0 ... Sunday = 6, to match the Mon-first calendar grid in the mockups.
        var jsDay = parseDate(dateStr).getDay(); // Sunday = 0
        return (jsDay + 6) % 7;
    }

    function formatDateLabel(dateStr) {
        return parseDate(dateStr).toLocaleDateString(currentLocale(), {
            weekday: "long", month: "short", day: "numeric"
        });
    }

    function formatMonthLabel(year, monthIndex) {
        return new Date(year, monthIndex, 1).toLocaleDateString(currentLocale(), { month: "long", year: "numeric" });
    }

    function currentLocale() {
        return window.TimePathI18n && window.TimePathI18n.getLang() === "zh" ? "zh-CN" : "en-US";
    }

    function timeToMinutes(hhmm) {
        var parts = hhmm.split(":").map(Number);
        return parts[0] * 60 + parts[1];
    }

    function minutesToTime(mins) {
        mins = ((mins % 1440) + 1440) % 1440;
        return pad2(Math.floor(mins / 60)) + ":" + pad2(mins % 60);
    }

    function minutesLabel(mins) {
        mins = Math.round(mins);
        if (mins < 60) return mins + "m";
        var h = Math.floor(mins / 60), m = mins % 60;
        return m === 0 ? h + "h" : h + "h " + m + "m";
    }

    function roundTo15(mins) {
        return Math.round(mins / 15) * 15;
    }

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    // Returns a 6x7 matrix of { dateStr, inMonth, isToday } for the given year/month (0-indexed month),
    // Monday-first, matching the mockup's M T W T F S S header row.
    function buildMonthGrid(year, monthIndex) {
        var first = new Date(year, monthIndex, 1);
        var startOffset = (first.getDay() + 6) % 7; // days before the 1st to back-fill
        var gridStart = new Date(year, monthIndex, 1 - startOffset);
        var today = todayStr();
        var weeks = [];
        var cursor = new Date(gridStart);
        for (var w = 0; w < 6; w++) {
            var week = [];
            for (var d = 0; d < 7; d++) {
                var dateStr = formatDate(cursor);
                week.push({
                    dateStr: dateStr,
                    day: cursor.getDate(),
                    inMonth: cursor.getMonth() === monthIndex,
                    isToday: dateStr === today
                });
                cursor.setDate(cursor.getDate() + 1);
            }
            weeks.push(week);
        }
        return weeks;
    }

    // Tracks whether the user has ever created/edited/deleted anything, as
    // distinct from the untouched demo content seedState() ships with in both
    // stores — used by timepath-migration.js so a brand-new account with only
    // demo data doesn't get offered a "migrate to cloud" prompt for it.
    // Absent (no key at all) means this device predates this flag and already
    // has real data sitting in LocalStorage, so it must default to "true" —
    // never re-interpret a pre-existing install as demo-only.
    var USER_DATA_KEY = "timepath:has-user-data:v1";

    function markUserDataDirty() {
        try { localStorage.setItem(USER_DATA_KEY, "1"); } catch (e) {}
    }

    // Called only right after a store seeds fresh demo content for the first
    // time on this device. Never overwrites an existing "1" — e.g. if the task
    // store seeds fresh (marks "0") and the goal store also seeds fresh right
    // after on the same page load, the second call is a no-op, not a downgrade.
    function markSeedOnlyIfUnset() {
        try {
            if (localStorage.getItem(USER_DATA_KEY) === null) localStorage.setItem(USER_DATA_KEY, "0");
        } catch (e) {}
    }

    function hasUserData() {
        try {
            var v = localStorage.getItem(USER_DATA_KEY);
            return v === null ? true : v === "1";
        } catch (e) {
            return true;
        }
    }

    function escapeHtml(str) {
        return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    // Shared priority/status → color mapping, so Today/Tasks/Review can't drift
    // into showing different colors for the same semantic state again.
    var PRIORITY_COLOR = { must: "priority-must", should: "priority-should", optional: "outline-variant" };
    var PRIORITY_TEXT_COLOR = { must: "priority-must", should: "priority-should", optional: "on-surface-variant" };
    var STATUS_COLOR = { done: "status-done", in_progress: "status-progress", delayed: "priority-must", skipped: "on-surface-variant", todo: "on-surface-variant" };

    function priorityBorderClass(priority) { return "border-" + (PRIORITY_COLOR[priority] || "outline-variant"); }
    function priorityBgClass(priority) { return "bg-" + (PRIORITY_COLOR[priority] || "outline-variant"); }
    function priorityTextClass(priority) { return "text-" + (PRIORITY_TEXT_COLOR[priority] || "on-surface-variant"); }
    function statusTextClass(status) { return "text-" + (STATUS_COLOR[status] || "on-surface-variant"); }
    function statusDotClass(status) { return "bg-" + (STATUS_COLOR[status] || "on-surface-variant"); }

    window.TimePathUtils = {
        uid: uid, todayStr: todayStr, formatDate: formatDate, parseDate: parseDate, addDays: addDays,
        weekdayIndex: weekdayIndex, formatDateLabel: formatDateLabel, formatMonthLabel: formatMonthLabel,
        priorityBorderClass: priorityBorderClass, priorityBgClass: priorityBgClass, priorityTextClass: priorityTextClass,
        statusTextClass: statusTextClass, statusDotClass: statusDotClass,
        timeToMinutes: timeToMinutes, minutesToTime: minutesToTime, minutesLabel: minutesLabel,
        roundTo15: roundTo15, clamp: clamp, buildMonthGrid: buildMonthGrid, escapeHtml: escapeHtml,
        markUserDataDirty: markUserDataDirty, markSeedOnlyIfUnset: markSeedOnlyIfUnset, hasUserData: hasUserData
    };
})();
