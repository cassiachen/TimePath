(function () {
    var STORAGE_KEY = "timepath:goals:v1";
    var state = null;

    function uid(prefix) {
        return (prefix || "goal") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function todayStr() {
        var d = new Date();
        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }

    function addDays(dateStr, n) {
        var d = new Date(dateStr + "T00:00:00");
        d.setDate(d.getDate() + n);
        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }

    function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
    }

    function normalizeLinkedTaskIds(raw) {
        var list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        var seen = {};
        return list.filter(function (id) {
            if (!id || typeof id !== "string") return false;
            if (seen[id]) return false;
            seen[id] = true;
            return true;
        });
    }

    // Month/week nodes carry their own subtask checklist (same {id, title,
    // done} shape as a task's subtasks) — filters out anything with no
    // title (an abandoned empty row from the editor) and backfills a
    // missing id, so cloud data with a slightly different shape still loads.
    function normalizeSubtasks(raw) {
        var list = Array.isArray(raw) ? raw : [];
        return list.filter(function (s) { return s && typeof s.title === "string" && s.title.trim(); })
            .map(function (s) {
                return { id: s.id || uid("sub"), title: s.title.trim(), done: !!s.done };
            });
    }

    // Goal levels: the Goal itself is the ~year-scale target. It breaks down into
    // "month" nodes, which break down further into "week" nodes (nested via
    // parentId). There is no "day" level here — day-to-day scheduling of the
    // actual linked tasks happens on the Today page, not on the Goals page.
    function defaultGoal() {
        var today = todayStr();
        var end = addDays(today, 365);
        var monthId = uid("node");
        return {
            id: uid("goal"),
            name: "雅思 7.5 分",
            description: "一年内达到雅思 7.5 分，保持稳定的月度学习节奏。",
            category: "学习",
            status: "active",
            startDate: today,
            endDate: end,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            nodes: [
                { id: monthId, goalId: null, parentId: null, level: "month", title: "2026 年 9 月：打好基础", description: "完成词汇基础 + Reading 基础", startDate: today, endDate: addDays(today, 30), status: "active", linkedTaskIds: [] },
                { id: uid("node"), goalId: null, parentId: monthId, level: "week", title: "第 1 周", description: "背 300 词 + 完成 3 套 Reading", startDate: today, endDate: addDays(today, 7), status: "active", linkedTaskIds: [] }
            ]
        };
    }

    function seedState() {
        var goal = defaultGoal();
        goal.nodes.forEach(function (node) { node.goalId = goal.id; });
        return { goals: [goal] };
    }

    function migrate(raw) {
        if (!raw || typeof raw !== "object") return { goals: [] };
        return {
            goals: Array.isArray(raw.goals) ? raw.goals.map(function (goal) {
                return {
                    id: goal.id || uid("goal"),
                    name: goal.name || "Untitled goal",
                    description: goal.description || "",
                    category: goal.category || "General",
                    status: goal.status || "active",
                    startDate: goal.startDate || todayStr(),
                    endDate: goal.endDate || addDays(todayStr(), 30),
                    createdAt: goal.createdAt || Date.now(),
                    updatedAt: goal.updatedAt || Date.now(),
                    nodes: Array.isArray(goal.nodes) ? goal.nodes.map(function (node) {
                        return {
                            id: node.id || uid("node"),
                            goalId: goal.id,
                            parentId: node.parentId || null,
                            level: node.level || "week",
                            title: node.title || "New node",
                            description: node.description || "",
                            startDate: node.startDate || goal.startDate || todayStr(),
                            endDate: node.endDate || goal.endDate || addDays(todayStr(), 7),
                            status: node.status || "active",
                            linkedTaskIds: normalizeLinkedTaskIds(Array.isArray(node.linkedTaskIds) ? node.linkedTaskIds : (node.linkedTaskId ? [node.linkedTaskId] : [])),
                            subtasks: normalizeSubtasks(node.subtasks)
                        };
                    }) : []
                };
            }) : []
        };
    }

    function ensureLoaded() {
        if (!state) load();
        return state;
    }

    function load() {
        var isFreshSeed = false;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                state = migrate(JSON.parse(raw));
            } else {
                state = seedState();
                isFreshSeed = true;
            }
        } catch (e) {
            state = seedState();
            isFreshSeed = true;
        }
        save();
        // Only marks "no real user data yet" the first time this device ever
        // seeds demo content — never touches an existing real-data flag (e.g.
        // if timepath-store.js already marked it dirty on this same page load).
        if (isFreshSeed && window.TimePathUtils) window.TimePathUtils.markSeedOnlyIfUnset();
        return state;
    }

    function save() {
        if (!state) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function now() {
        return Date.now();
    }

    // Replaces all goals wholesale with the user's cloud data (login hydration,
    // or after a first-login migration). Local-shape objects in, straight
    // through — Supabase row mapping lives entirely in timepath-sync.js.
    function hydrateFromCloud(cloudGoals) {
        ensureLoaded();
        state.goals = cloudGoals || [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function listGoals() {
        ensureLoaded();
        return state.goals.slice();
    }

    function getGoal(id) {
        ensureLoaded();
        return state.goals.find(function (goal) { return goal.id === id; }) || null;
    }

    function addGoal(partial) {
        ensureLoaded();
        var goal = Object.assign({
            id: uid("goal"),
            name: "Untitled Goal",
            description: "",
            category: "General",
            status: "active",
            startDate: todayStr(),
            endDate: addDays(todayStr(), 30),
            createdAt: now(),
            updatedAt: now(),
            nodes: []
        }, partial || {});
        goal.updatedAt = now();
        state.goals.push(goal);
        save();
        if (window.TimePathUtils) window.TimePathUtils.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncGoalUpsert(goal);
        return goal;
    }

    function updateGoal(id, patch) {
        ensureLoaded();
        var goal = getGoal(id);
        if (!goal) return null;
        Object.assign(goal, patch, { updatedAt: now() });
        save();
        if (window.TimePathUtils) window.TimePathUtils.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncGoalUpsert(goal);
        return goal;
    }

    function deleteGoal(id) {
        ensureLoaded();
        state.goals = state.goals.filter(function (goal) { return goal.id !== id; });
        save();
        if (window.TimePathUtils) window.TimePathUtils.markUserDataDirty();
        if (window.TimePathSync) window.TimePathSync.syncGoalDelete(id);
    }

    function getNodes(goalId) {
        ensureLoaded();
        var goal = getGoal(goalId);
        if (!goal) return [];
        return (goal.nodes || []).slice();
    }

    function getNodesByLevel(goalId, level) {
        return getNodes(goalId).filter(function (n) { return n.level === level; })
            .sort(function (a, b) { return (a.startDate || "").localeCompare(b.startDate || ""); });
    }

    function getChildNodes(goalId, parentId) {
        return getNodes(goalId).filter(function (n) { return n.parentId === parentId; })
            .sort(function (a, b) { return (a.startDate || "").localeCompare(b.startDate || ""); });
    }

    // Reverse lookup used by the Today page to show which goal/week a task
    // belongs to, without Today needing to know anything about goal internals.
    function findLinkedNode(taskId) {
        ensureLoaded();
        for (var i = 0; i < state.goals.length; i++) {
            var goal = state.goals[i];
            var nodes = goal.nodes || [];
            for (var j = 0; j < nodes.length; j++) {
                var node = nodes[j];
                if (Array.isArray(node.linkedTaskIds) && node.linkedTaskIds.indexOf(taskId) > -1) {
                    return { goal: goal, node: node };
                }
            }
        }
        return null;
    }

    function addNode(goalId, partial) {
        ensureLoaded();
        var goal = getGoal(goalId);
        if (!goal) return null;
        var node = Object.assign({
            id: uid("node"),
            goalId: goalId,
            parentId: null,
            level: "week",
            title: "New node",
            description: "",
            startDate: goal.startDate || todayStr(),
            endDate: goal.endDate || addDays(todayStr(), 7),
            status: "active",
            linkedTaskIds: [],
            subtasks: []
        }, partial || {});
        node.subtasks = normalizeSubtasks(node.subtasks);
        goal.nodes.push(node);
        goal.updatedAt = now();
        save();
        if (window.TimePathUtils) window.TimePathUtils.markUserDataDirty();
        if (window.TimePathSync) {
            window.TimePathSync.syncNodeUpsert(node);
            window.TimePathSync.syncNodeLinkedTasksDiff(node, []);
        }
        return node;
    }

    function updateNode(goalId, id, patch) {
        ensureLoaded();
        var goal = getGoal(goalId);
        if (!goal) return null;
        var node = (goal.nodes || []).find(function (item) { return item.id === id; });
        if (!node) return null;
        var oldLinkedTaskIds = (node.linkedTaskIds || []).slice();
        if (patch && patch.linkedTaskIds) {
            patch.linkedTaskIds = normalizeLinkedTaskIds(patch.linkedTaskIds);
        }
        if (patch && patch.subtasks) {
            patch.subtasks = normalizeSubtasks(patch.subtasks);
        }
        Object.assign(node, patch);
        if (Array.isArray(node.linkedTaskIds)) {
            node.linkedTaskIds = normalizeLinkedTaskIds(node.linkedTaskIds);
        }
        if (Array.isArray(node.subtasks)) {
            node.subtasks = normalizeSubtasks(node.subtasks);
        }
        goal.updatedAt = now();
        save();
        if (window.TimePathUtils) window.TimePathUtils.markUserDataDirty();
        if (window.TimePathSync) {
            window.TimePathSync.syncNodeUpsert(node);
            window.TimePathSync.syncNodeLinkedTasksDiff(node, oldLinkedTaskIds);
        }
        return node;
    }

    function deleteNode(goalId, id) {
        ensureLoaded();
        var goal = getGoal(goalId);
        if (!goal) return;
        goal.nodes = (goal.nodes || []).filter(function (node) { return node.id !== id; });
        goal.updatedAt = now();
        save();
        if (window.TimePathUtils) window.TimePathUtils.markUserDataDirty();
        // goal_nodes -> goal_node_tasks is "on delete cascade" in the schema, so
        // deleting the node row alone is enough to drop its links server-side too.
        if (window.TimePathSync) window.TimePathSync.syncNodeDelete(id);
    }

    function getGoalSummary(goalId) {
        ensureLoaded();
        var goal = getGoal(goalId);
        if (!goal) return null;
        var start = new Date(goal.startDate + "T00:00:00").getTime();
        var end = new Date(goal.endDate + "T00:00:00").getTime();
        var nowTs = Date.now();
        var totalMs = Math.max(1, end - start);
        var timeProgress = clamp(((nowTs - start) / totalMs) * 100, 0, 100);
        var nodes = goal.nodes || [];
        var total = Math.max(1, nodes.length);
        var done = nodes.filter(function (node) { return node.status === "done"; }).length;
        var progress = Math.round((done / total) * 100);
        var remainingDays = Math.max(0, Math.ceil((end - nowTs) / 86400000));
        var gap = progress - timeProgress;
        return {
            timeProgress: Math.round(timeProgress),
            progress: progress,
            gap: Math.round(gap),
            remainingDays: remainingDays,
            done: done,
            total: total
        };
    }

    window.TimePathGoalStore = {
        load: load,
        save: save,
        listGoals: listGoals,
        getGoal: getGoal,
        addGoal: addGoal,
        updateGoal: updateGoal,
        deleteGoal: deleteGoal,
        getNodes: getNodes,
        getNodesByLevel: getNodesByLevel,
        getChildNodes: getChildNodes,
        findLinkedNode: findLinkedNode,
        addNode: addNode,
        updateNode: updateNode,
        deleteNode: deleteNode,
        getGoalSummary: getGoalSummary,
        hydrateFromCloud: hydrateFromCloud,
        uid: uid,
        todayStr: todayStr,
        addDays: addDays
    };
})();
