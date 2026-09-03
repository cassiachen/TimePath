// Shared data layer for TimePath V1. Classic script, exposes global `TimePathStore`.
// Persists everything to localStorage under STORAGE_KEY. Every page loads this
// script (after timepath-utils.js) and calls TimePathStore.load() once on startup.
(function () {
    var U = window.TimePathUtils;
    var STORAGE_KEY = "timepath:v1";
    var STORAGE_VERSION = 1;
    var state = null;

    function migrateState(raw) {
        if (!raw || typeof raw !== "object") return null;

        var migrated = Object.assign({}, raw);
        migrated.version = migrated.version || STORAGE_VERSION;
        migrated.tasks = Array.isArray(migrated.tasks) ? migrated.tasks : [];
        migrated.sops = Array.isArray(migrated.sops) ? migrated.sops : [];
        migrated.budget = Object.assign(defaultBudget(), migrated.budget || {});
        if (!migrated.selectedDate) migrated.selectedDate = U.todayStr();
        // Existing installs (state saved before this flag existed) are treated
        // as already configured — only a genuinely fresh seed prompts for it.
        migrated.budgetConfigured = typeof raw.budgetConfigured === "boolean" ? raw.budgetConfigured : true;
        return migrated;
    }

    function defaultBudget() {
        return { sleep: 8, work: 8.5, meals: 1.5, commute: 1, exercise: 0, study: 0, entertainment: 0, other: 0 };
    }

    function seedState() {
        var today = U.todayStr();
        return {
            tasks: [
                {
                    id: U.uid("task"), title: "晨间回顾", date: today, startTime: "08:00",
                    estimatedMinutes: 30, priority: "optional", category: "行政", status: "done",
                    sopId: null, energy: "low", note: "", subtasks: [], isBuffer: false, recurrence: "none",
                    timeLog: [{ start: Date.now() - 30 * 60000, end: Date.now() - 1000 }], runningSince: null,
                    delayHistory: []
                },
                {
                    id: U.uid("task"), title: "市场分析", date: today, startTime: "09:00",
                    estimatedMinutes: 45, priority: "must", category: "工作", status: "in_progress",
                    sopId: null, energy: "high", note: "", subtasks: [
                        { id: U.uid("sub"), title: "收集数据", done: true },
                        { id: U.uid("sub"), title: "分析竞品", done: true },
                        { id: U.uid("sub"), title: "总结发现", done: false },
                        { id: U.uid("sub"), title: "撰写结论", done: false }
                    ], isBuffer: false, recurrence: "none", timeLog: [], runningSince: null, delayHistory: []
                },
                {
                    id: U.uid("task"), title: "缓冲时段", date: today, startTime: "09:45",
                    estimatedMinutes: 15, priority: "optional", category: "缓冲", status: "todo",
                    sopId: null, energy: "low", note: "", subtasks: [], isBuffer: true, recurrence: "none",
                    timeLog: [], runningSince: null, delayHistory: []
                },
                {
                    id: U.uid("task"), title: "雅思阅读", date: today, startTime: "10:00",
                    estimatedMinutes: 60, priority: "must", category: "学习", status: "in_progress",
                    sopId: null, energy: "high", note: "第 3 套模拟题 - 第二部分", subtasks: [],
                    isBuffer: false, recurrence: "none", timeLog: [], runningSince: null, delayHistory: []
                },
                {
                    id: U.uid("task"), title: "客户电话 - Alpha 项目", date: today, startTime: "11:00",
                    estimatedMinutes: 45, priority: "should", category: "工作", status: "todo",
                    sopId: null, energy: "mid", note: "", subtasks: [], isBuffer: false, recurrence: "none",
                    timeLog: [], runningSince: null, delayHistory: []
                }
            ],
            sops: [
                {
                    id: U.uid("sop"), name: "收件箱清空", category: "日常流程",
                    defaultDurationMinutes: 30,
                    steps: ["按优先级排序", "回复紧急事项", "归档或删除其余邮件"].map(function (t) { return { id: U.uid("step"), title: t }; }),
                    minStandard: "未读邮件低于 10 封", fullStandard: "收件箱清空为零", note: ""
                },
                {
                    id: U.uid("sop"), name: "每周复盘", category: "每周节奏",
                    defaultDurationMinutes: 45,
                    steps: ["回顾本周已完成任务", "回顾本周延期任务", "规划下周的必须做事项"].map(function (t) { return { id: U.uid("step"), title: t }; }),
                    minStandard: "下周必须做清单已列好", fullStandard: "完整复盘并写好调整方案", note: ""
                },
                {
                    id: U.uid("sop"), name: "晨间流程", category: "日常流程",
                    defaultDurationMinutes: 45,
                    steps: ["起床", "洗漱", "早餐", "阅读15分钟", "开始工作"].map(function (t) { return { id: U.uid("step"), title: t }; }),
                    minStandard: "起床、洗漱、开始工作", fullStandard: "五个步骤全部完成，按时开始工作", note: "作为每天的默认开场，可以直接绑定到 Today 的第一个任务上。"
                },
                {
                    id: U.uid("sop"), name: "晚间收尾", category: "日常流程",
                    defaultDurationMinutes: 30,
                    steps: ["整理桌面", "写好明日待办", "阅读", "按时关灯"].map(function (t) { return { id: U.uid("step"), title: t }; }),
                    minStandard: "写好明日待办", fullStandard: "四个步骤全部完成，按时休息", note: ""
                },
                {
                    id: U.uid("sop"), name: "开发客户", category: "工作",
                    defaultDurationMinutes: 60,
                    steps: ["找客户", "判断客户", "寻找联系人", "研究客户", "发送开发信", "记录客户"].map(function (t) { return { id: U.uid("step"), title: t }; }),
                    minStandard: "找到客户并完成记录", fullStandard: "六个步骤全部完成，开发信已发出并跟进记录", note: ""
                },
                {
                    id: U.uid("sop"), name: "深度工作准备", category: "工作",
                    defaultDurationMinutes: 15,
                    steps: ["关闭通知", "准备好水和纸笔", "明确本次目标", "设置计时器", "开始专注"].map(function (t) { return { id: U.uid("step"), title: t }; }),
                    minStandard: "关闭通知并明确目标", fullStandard: "五个步骤全部完成，专注时段无打断", note: "适合绑定到高脑力消耗的任务上。"
                }
            ],
            budget: defaultBudget(),
            selectedDate: today,
            budgetConfigured: false
        };
    }

    function load() {
        var isFreshSeed = false;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                state = migrateState(JSON.parse(raw));
            } else {
                state = seedState();
                isFreshSeed = true;
            }
        } catch (e) {
            state = seedState();
            isFreshSeed = true;
        }
        if (!state || !state.selectedDate) { state = Object.assign(seedState(), state || {}); isFreshSeed = true; }
        state.version = STORAGE_VERSION;
        if (!state.selectedDate) state.selectedDate = U.todayStr();
        save();
        // Only marks "no real user data yet" the first time this device ever
        // seeds demo content — never touches an existing real-data flag.
        if (isFreshSeed) U.markSeedOnlyIfUnset();
        return state;
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        // Budget/selectedDate/budgetConfigured live in this same state object and
        // are mutated directly by callers (e.g. S.state.selectedDate = ...; S.save()),
        // so there's no single setter to hook — piggyback on save() itself instead.
        if (window.TimePathSync) window.TimePathSync.syncUserSettingsDebounced();
    }

    function ensureLoaded() {
        if (!state) load();
        return state;
    }

    // Replaces tasks/sops wholesale with the user's cloud data (login hydration,
    // or after a first-login migration). Local-shape objects in, straight through
    // — the mapping to/from Supabase's row shape lives entirely in timepath-sync.js.
    function hydrateFromCloud(cloudTasks, cloudSops) {
        ensureLoaded();
        state.tasks = cloudTasks || [];
        state.sops = cloudSops || [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function hydrateSettings(settings) {
        ensureLoaded();
        if (settings.budget) state.budget = Object.assign(defaultBudget(), settings.budget);
        if (typeof settings.budgetConfigured === "boolean") state.budgetConfigured = settings.budgetConfigured;
        if (settings.selectedDate) state.selectedDate = settings.selectedDate;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // ---- Tasks ----

    function newTaskDefaults() {
        return {
            id: U.uid("task"), title: "", date: U.todayStr(), startTime: "09:00", estimatedMinutes: 30,
            priority: "should", category: "Work", status: "todo", sopId: null, energy: "mid", note: "",
            subtasks: [], isBuffer: false, recurrence: "none", timeLog: [], runningSince: null, delayHistory: []
        };
    }

    function addTask(partial) {
        ensureLoaded();
        var task = Object.assign(newTaskDefaults(), partial);
        state.tasks.push(task);
        save();
        U.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncTaskUpsert(task);
        return task;
    }

    function updateTask(id, patch) {
        ensureLoaded();
        var task = state.tasks.find(function (t) { return t.id === id; });
        if (!task) return null;
        Object.assign(task, patch);
        save();
        U.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncTaskUpsert(task);
        return task;
    }

    function deleteTask(id) {
        ensureLoaded();
        state.tasks = state.tasks.filter(function (t) { return t.id !== id; });
        save();
        U.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncTaskDelete(id);
    }

    function getTask(id) {
        ensureLoaded();
        return state.tasks.find(function (t) { return t.id === id; }) || null;
    }

    // Recurrence is intentionally simple: "daily" appears every day from its own
    // date onward, "weekly" appears on the same weekday from its own date onward.
    // Recurring instances beyond the original row are virtual (id suffixed with
    // the occurrence date) and resolve back to the template on edit/complete.
    function getTasksForDate(dateStr) {
        ensureLoaded();
        var direct = state.tasks.filter(function (t) { return t.date === dateStr; });
        var virtual = state.tasks.filter(function (t) {
            if (t.date === dateStr || t.recurrence === "none") return false;
            if (dateStr < t.date) return false;
            if (t.recurrence === "daily") return true;
            if (t.recurrence === "weekly") return U.weekdayIndex(dateStr) === U.weekdayIndex(t.date);
            return false;
        }).map(function (t) {
            return Object.assign({}, t, { id: t.id + "@" + dateStr, templateId: t.id, date: dateStr, isVirtualOccurrence: true, status: "todo", timeLog: [], runningSince: null });
        });
        return direct.concat(virtual).sort(function (a, b) { return U.timeToMinutes(a.startTime) - U.timeToMinutes(b.startTime); });
    }

    function resolveEditableTaskId(id) {
        // A virtual occurrence ("<id>@<date>") edits back to its template task.
        var at = id.indexOf("@");
        return at === -1 ? id : id.slice(0, at);
    }

    // ---- SOPs ----

    function addSop(partial) {
        ensureLoaded();
        var sop = Object.assign({ id: U.uid("sop"), name: "", category: "Daily Operations", defaultDurationMinutes: 30, steps: [], minStandard: "", fullStandard: "", note: "" }, partial);
        state.sops.push(sop);
        save();
        U.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncSopUpsert(sop);
        return sop;
    }

    function updateSop(id, patch) {
        ensureLoaded();
        var sop = state.sops.find(function (s) { return s.id === id; });
        if (!sop) return null;
        Object.assign(sop, patch);
        save();
        U.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncSopUpsert(sop);
        return sop;
    }

    function deleteSop(id) {
        ensureLoaded();
        state.sops = state.sops.filter(function (s) { return s.id !== id; });
        save();
        U.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncSopDelete(id);
    }

    function getSop(id) {
        ensureLoaded();
        return state.sops.find(function (s) { return s.id === id; }) || null;
    }

    // ---- Budget & stats ----

    function computeBudget(dateStr) {
        ensureLoaded();
        var b = state.budget;
        var fixedHours = (b.sleep || 0) + (b.work || 0) + (b.meals || 0) + (b.commute || 0) + (b.exercise || 0) + (b.study || 0) + (b.entertainment || 0) + (b.other || 0);
        var disposableMinutes = Math.max(0, 24 * 60 - fixedHours * 60);
        var tasks = getTasksForDate(dateStr).filter(function (t) { return !t.isBuffer; });
        var plannedMinutes = tasks.reduce(function (sum, t) { return sum + (t.estimatedMinutes || 0); }, 0);
        var remainingMinutes = disposableMinutes - plannedMinutes;
        return {
            disposableMinutes: disposableMinutes, plannedMinutes: plannedMinutes,
            remainingMinutes: remainingMinutes, overload: remainingMinutes < 0
        };
    }

    function actualMinutesFor(task) {
        var log = task.timeLog || [];
        var total = log.reduce(function (sum, seg) { return sum + Math.max(0, (seg.end - seg.start)); }, 0);
        if (task.runningSince) total += Math.max(0, Date.now() - task.runningSince);
        return total / 60000;
    }

    function computeDayStats(dateStr) {
        ensureLoaded();
        var tasks = getTasksForDate(dateStr).filter(function (t) { return !t.isBuffer; });
        var total = tasks.length;
        var done = tasks.filter(function (t) { return t.status === "done"; }).length;
        var delayed = tasks.filter(function (t) { return t.status === "delayed"; }).length;
        var skipped = tasks.filter(function (t) { return t.status === "skipped"; }).length;
        var plannedMinutes = tasks.reduce(function (s, t) { return s + (t.estimatedMinutes || 0); }, 0);
        var actualMinutes = tasks.reduce(function (s, t) { return s + actualMinutesFor(t); }, 0);
        var byCategory = {};
        tasks.forEach(function (t) {
            var cat = t.category || "Other";
            byCategory[cat] = (byCategory[cat] || 0) + (t.estimatedMinutes || 0);
        });
        var delayReasons = [];
        tasks.forEach(function (t) {
            (t.delayHistory || []).forEach(function (entry) {
                delayReasons.push({ taskTitle: t.title, date: entry.date, reason: entry.reason, action: entry.action });
            });
        });
        return {
            total: total, done: done, delayed: delayed, skipped: skipped,
            completionRate: total ? done / total : 0,
            plannedMinutes: plannedMinutes, actualMinutes: actualMinutes,
            efficiency: plannedMinutes ? actualMinutes / plannedMinutes : null,
            byCategory: byCategory, delayReasons: delayReasons
        };
    }

    function detectConflict(dateStr, startTime, durationMin, excludeTaskId) {
        ensureLoaded();
        var start = U.timeToMinutes(startTime);
        var end = start + durationMin;
        return getTasksForDate(dateStr).filter(function (t) {
            if (t.isBuffer) return false;
            var tid = t.templateId || t.id;
            if (tid === excludeTaskId) return false;
            var tStart = U.timeToMinutes(t.startTime);
            var tEnd = tStart + (t.estimatedMinutes || 0);
            return start < tEnd && end > tStart;
        });
    }

    function anyTaskHasDot(dateStr) {
        return getTasksForDate(dateStr).length > 0;
    }

    window.TimePathStore = {
        load: load, save: save,
        get state() { return ensureLoaded(); },
        addTask: addTask, updateTask: updateTask, deleteTask: deleteTask, getTask: getTask,
        getTasksForDate: getTasksForDate, resolveEditableTaskId: resolveEditableTaskId,
        addSop: addSop, updateSop: updateSop, deleteSop: deleteSop, getSop: getSop,
        computeBudget: computeBudget, computeDayStats: computeDayStats, detectConflict: detectConflict,
        actualMinutesFor: actualMinutesFor, anyTaskHasDot: anyTaskHasDot,
        hydrateFromCloud: hydrateFromCloud, hydrateSettings: hydrateSettings
    };
})();
