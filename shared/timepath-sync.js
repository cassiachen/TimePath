// Background sync layer: local-first writes stay instant and synchronous
// (timepath-store.js / timepath-goal-store.js never await this file); every
// mutation additionally enqueues a small job here, persisted to localStorage
// so it survives a refresh or going offline mid-sync, and pushed to Supabase
// in the background on a best-effort basis. Classic script, exposes global
// `TimePathSync`.
//
// Sync only runs while a user is signed in (see timepath-auth.js) — signed
// out is just today's LocalStorage-only behavior, unchanged. A failed push
// (offline, RLS error, etc.) stops the queue at that item and retries later;
// it never throws into the caller, and local data is never blocked on it.
(function () {
    var QUEUE_KEY = "timepath:sync:queue:v1";
    var RETRY_MS = 20000;

    var queue = loadQueue();
    var flushing = false;
    var retryTimer = null;
    var settingsDebounceTimer = null;

    function loadQueue() {
        try {
            var raw = localStorage.getItem(QUEUE_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function persistQueue() {
        try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch (e) { /* ignore quota errors */ }
    }

    function currentUserId() {
        var user = window.TimePathAuth && window.TimePathAuth.getUser();
        return user ? user.id : null;
    }

    function enqueue(item) {
        queue.push(item);
        persistQueue();
        flush();
    }

    // ---- Row mappers: local (camelCase, app shape) <-> Supabase row (snake_case) ----

    function taskToRow(userId, t) {
        return {
            id: t.id, user_id: userId, title: t.title || "", date: t.date, start_time: t.startTime,
            estimated_minutes: t.estimatedMinutes || 0, priority: t.priority || "should", category: t.category || "",
            status: t.status || "todo", sop_id: t.sopId || null, energy: t.energy || "mid", note: t.note || "",
            subtasks: t.subtasks || [], is_buffer: !!t.isBuffer, recurrence: t.recurrence || "none",
            time_log: t.timeLog || [], running_since: t.runningSince ? new Date(t.runningSince).toISOString() : null,
            delay_history: t.delayHistory || []
        };
    }
    function rowToTask(r) {
        return {
            id: r.id, title: r.title, date: r.date, startTime: r.start_time, estimatedMinutes: r.estimated_minutes,
            priority: r.priority, category: r.category, status: r.status, sopId: r.sop_id, energy: r.energy,
            note: r.note || "", subtasks: r.subtasks || [], isBuffer: !!r.is_buffer, recurrence: r.recurrence || "none",
            timeLog: r.time_log || [], runningSince: r.running_since ? Date.parse(r.running_since) : null,
            delayHistory: r.delay_history || []
        };
    }

    function sopToRow(userId, s) {
        return {
            id: s.id, user_id: userId, name: s.name || "", category: s.category || "",
            default_duration_minutes: s.defaultDurationMinutes || 0, steps: s.steps || [],
            min_standard: s.minStandard || "", full_standard: s.fullStandard || "", note: s.note || ""
        };
    }
    function rowToSop(r) {
        return {
            id: r.id, name: r.name, category: r.category, defaultDurationMinutes: r.default_duration_minutes,
            steps: r.steps || [], minStandard: r.min_standard || "", fullStandard: r.full_standard || "", note: r.note || ""
        };
    }

    function goalToRow(userId, g) {
        return {
            id: g.id, user_id: userId, name: g.name || "", description: g.description || "", category: g.category || "",
            status: g.status || "active", start_date: g.startDate, end_date: g.endDate
        };
    }
    function rowToGoal(r) {
        return {
            id: r.id, name: r.name, description: r.description || "", category: r.category || "", status: r.status || "active",
            startDate: r.start_date, endDate: r.end_date,
            createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
            updatedAt: r.updated_at ? Date.parse(r.updated_at) : Date.now(),
            nodes: []
        };
    }

    function nodeToRow(userId, n) {
        return {
            id: n.id, user_id: userId, goal_id: n.goalId, parent_id: n.parentId || null, level: n.level,
            title: n.title || "", description: n.description || "", start_date: n.startDate, end_date: n.endDate,
            status: n.status || "active"
        };
    }
    function rowToNode(r) {
        return {
            id: r.id, goalId: r.goal_id, parentId: r.parent_id, level: r.level, title: r.title,
            description: r.description || "", startDate: r.start_date, endDate: r.end_date, status: r.status || "active",
            linkedTaskIds: []
        };
    }

    // ---- Public enqueue helpers, called from the store mutation functions ----

    function syncTaskUpsert(task) {
        var uid = currentUserId(); if (!uid || !task) return;
        enqueue({ op: "upsert", table: "tasks", row: taskToRow(uid, task) });
    }
    function syncTaskDelete(id) {
        var uid = currentUserId(); if (!uid || !id) return;
        enqueue({ op: "delete", table: "tasks", id: id });
    }

    function syncSopUpsert(sop) {
        var uid = currentUserId(); if (!uid || !sop) return;
        enqueue({ op: "upsert", table: "sops", row: sopToRow(uid, sop) });
    }
    function syncSopDelete(id) {
        var uid = currentUserId(); if (!uid || !id) return;
        enqueue({ op: "delete", table: "sops", id: id });
    }

    function syncGoalUpsert(goal) {
        var uid = currentUserId(); if (!uid || !goal) return;
        enqueue({ op: "upsert", table: "goals", row: goalToRow(uid, goal) });
    }
    function syncGoalDelete(id) {
        var uid = currentUserId(); if (!uid || !id) return;
        enqueue({ op: "delete", table: "goals", id: id });
    }

    function syncNodeUpsert(node) {
        var uid = currentUserId(); if (!uid || !node) return;
        enqueue({ op: "upsert", table: "goal_nodes", row: nodeToRow(uid, node) });
    }
    function syncNodeDelete(id) {
        var uid = currentUserId(); if (!uid || !id) return;
        enqueue({ op: "delete", table: "goal_nodes", id: id });
    }

    // Node.linkedTaskIds is a plain array locally but a join table (goal_node_tasks)
    // in Supabase — diff old vs new so only the actual add/remove crosses the wire.
    function syncNodeLinkedTasksDiff(node, oldIds) {
        var uid = currentUserId(); if (!uid || !node) return;
        var newIds = node.linkedTaskIds || [];
        oldIds = oldIds || [];
        var oldSet = {}, newSet = {};
        oldIds.forEach(function (id) { oldSet[id] = true; });
        newIds.forEach(function (id) { newSet[id] = true; });
        newIds.forEach(function (id) {
            if (!oldSet[id]) enqueue({ op: "upsert", table: "goal_node_tasks", row: { node_id: node.id, task_id: id, user_id: uid } });
        });
        oldIds.forEach(function (id) {
            if (!newSet[id]) enqueue({ op: "delete", table: "goal_node_tasks", match: { node_id: node.id, task_id: id } });
        });
    }

    // Single-row-per-user settings (budget / selectedDate / budgetConfigured /
    // language). Debounced since it piggybacks on every store.save() call
    // (including rapid ones like dragging a task), not just deliberate edits.
    function syncUserSettingsDebounced() {
        var uid = currentUserId(); if (!uid) return;
        clearTimeout(settingsDebounceTimer);
        settingsDebounceTimer = setTimeout(function () {
            var S = window.TimePathStore;
            if (!S) return;
            var st = S.state;
            enqueue({
                op: "upsert", table: "user_settings",
                row: {
                    user_id: uid,
                    language: window.TimePathI18n ? window.TimePathI18n.getLang() : "zh",
                    budget: st.budget, budget_configured: !!st.budgetConfigured, selected_date: st.selectedDate
                }
            });
        }, 600);
    }

    // ---- Queue draining ----

    function conflictKeyFor(table) {
        if (table === "user_settings") return "user_id";
        if (table === "goal_node_tasks") return "node_id,task_id";
        return "id";
    }

    async function sendOne(client, item) {
        try {
            var res;
            if (item.op === "delete") {
                var q = client.from(item.table).delete();
                q = item.table === "goal_node_tasks" ? q.match(item.match) : q.eq("id", item.id);
                res = await q;
            } else {
                res = await client.from(item.table).upsert(item.row, { onConflict: conflictKeyFor(item.table) });
            }
            if (res.error) throw res.error;
            return true;
        } catch (err) {
            console.warn("[timepath-sync] push failed, will retry later:", item.table, item.op, err && err.message);
            return false;
        }
    }

    async function flush() {
        if (flushing || !queue.length) return;
        var user = window.TimePathAuth && window.TimePathAuth.getUser();
        if (!user) return; // signed out — stays queued locally, retried after next sign-in

        var client = null;
        try { client = window.TimePathSupabase && await window.TimePathSupabase.ready; } catch (e) { client = null; }
        if (!client) return; // unconfigured or offline — retried on the timer/online event below

        flushing = true;
        try {
            while (queue.length) {
                var ok = await sendOne(client, queue[0]);
                if (!ok) break;
                queue.shift();
                persistQueue();
            }
        } finally {
            flushing = false;
        }
        if (queue.length) {
            clearTimeout(retryTimer);
            retryTimer = setTimeout(flush, RETRY_MS);
        }
    }

    window.addEventListener("online", function () { flush(); });

    // Leftover queue from a previous session (closed the tab mid-sync, was
    // offline, etc.) — try again once auth/session state is known.
    (async function retryLeftoverQueueOnLoad() {
        try { if (window.TimePathAuth) await window.TimePathAuth.ready; } catch (e) {}
        if (queue.length) flush();
    })();

    // ---- First-login migration: cloud-empty check + one-shot bulk upload ----

    // Returns true/false, or null when the check itself couldn't be answered
    // (offline, unconfigured, RLS error) — callers should treat null as "don't
    // know yet" and try again later, never as "cloud is empty".
    async function cloudHasAnyData() {
        var user = window.TimePathAuth && window.TimePathAuth.getUser();
        var client = null;
        try { client = window.TimePathSupabase && await window.TimePathSupabase.ready; } catch (e) { client = null; }
        if (!client || !user) return null;
        try {
            var results = await Promise.all([
                client.from("tasks").select("id", { count: "exact", head: true }),
                client.from("sops").select("id", { count: "exact", head: true }),
                client.from("goals").select("id", { count: "exact", head: true })
            ]);
            if (results.some(function (r) { return r.error; })) return null;
            return results.some(function (r) { return (r.count || 0) > 0; });
        } catch (e) {
            return null;
        }
    }

    // One-shot bulk upload of everything currently in LocalStorage, used only
    // for the first-login "this device has local data, cloud has none" case.
    // Upload order respects foreign keys: sops/goals before the tasks/nodes
    // that reference them, nodes before the links that reference them.
    async function pushAllLocalToCloud() {
        var user = window.TimePathAuth && window.TimePathAuth.getUser();
        var client = null;
        try { client = window.TimePathSupabase && await window.TimePathSupabase.ready; } catch (e) { client = null; }
        if (!client || !user) return false;

        try {
            var S = window.TimePathStore, GS = window.TimePathGoalStore;
            var sops = (S ? S.state.sops : []) || [];
            var tasks = (S ? S.state.tasks : []) || [];
            var goals = (GS ? GS.listGoals() : []) || [];

            if (sops.length) {
                var r1 = await client.from("sops").upsert(sops.map(function (s) { return sopToRow(user.id, s); }));
                if (r1.error) throw r1.error;
            }
            if (tasks.length) {
                var r2 = await client.from("tasks").upsert(tasks.map(function (t) { return taskToRow(user.id, t); }));
                if (r2.error) throw r2.error;
            }
            if (goals.length) {
                var r3 = await client.from("goals").upsert(goals.map(function (g) { return goalToRow(user.id, g); }));
                if (r3.error) throw r3.error;
            }

            var nodes = [], links = [];
            goals.forEach(function (g) {
                (g.nodes || []).forEach(function (n) {
                    nodes.push(n);
                    (n.linkedTaskIds || []).forEach(function (taskId) {
                        links.push({ node_id: n.id, task_id: taskId, user_id: user.id });
                    });
                });
            });
            if (nodes.length) {
                var r4 = await client.from("goal_nodes").upsert(nodes.map(function (n) { return nodeToRow(user.id, n); }));
                if (r4.error) throw r4.error;
            }
            if (links.length) {
                var r5 = await client.from("goal_node_tasks").upsert(links, { onConflict: "node_id,task_id" });
                if (r5.error) throw r5.error;
            }

            var r6 = await client.from("user_settings").upsert({
                user_id: user.id,
                language: window.TimePathI18n ? window.TimePathI18n.getLang() : "zh",
                budget: S ? S.state.budget : null,
                budget_configured: !!(S && S.state.budgetConfigured),
                selected_date: S ? S.state.selectedDate : null
            }, { onConflict: "user_id" });
            if (r6.error) throw r6.error;

            return true;
        } catch (err) {
            console.warn("[timepath-sync] first-login migration push failed:", err && err.message);
            return false;
        }
    }

    // ---- Full hydration (login pull / one-time migration) ----

    async function pullAll() {
        var user = window.TimePathAuth && window.TimePathAuth.getUser();
        var client = null;
        try { client = window.TimePathSupabase && await window.TimePathSupabase.ready; } catch (e) { client = null; }
        if (!client || !user) return false;

        var results = await Promise.all([
            client.from("sops").select("*"),
            client.from("tasks").select("*"),
            client.from("goals").select("*"),
            client.from("goal_nodes").select("*"),
            client.from("goal_node_tasks").select("*"),
            client.from("user_settings").select("*").maybeSingle()
        ]);
        var sopsRes = results[0], tasksRes = results[1], goalsRes = results[2], nodesRes = results[3], linksRes = results[4], settingsRes = results[5];
        var firstError = sopsRes.error || tasksRes.error || goalsRes.error || nodesRes.error || linksRes.error;
        if (firstError) {
            console.warn("[timepath-sync] pullAll failed:", firstError.message);
            return false;
        }

        var linksByNode = {};
        (linksRes.data || []).forEach(function (l) {
            (linksByNode[l.node_id] = linksByNode[l.node_id] || []).push(l.task_id);
        });

        var goals = (goalsRes.data || []).map(rowToGoal);
        var nodesByGoal = {};
        (nodesRes.data || []).forEach(function (r) {
            var node = rowToNode(r);
            node.linkedTaskIds = linksByNode[node.id] || [];
            (nodesByGoal[node.goal_id] = nodesByGoal[node.goal_id] || []).push(node);
        });
        goals.forEach(function (g) { g.nodes = nodesByGoal[g.id] || []; });

        var tasks = (tasksRes.data || []).map(rowToTask);
        var sops = (sopsRes.data || []).map(rowToSop);

        if (window.TimePathStore && window.TimePathStore.hydrateFromCloud) {
            window.TimePathStore.hydrateFromCloud(tasks, sops);
        }
        if (window.TimePathGoalStore && window.TimePathGoalStore.hydrateFromCloud) {
            window.TimePathGoalStore.hydrateFromCloud(goals);
        }
        // hydrateFromCloud() only touches LocalStorage, not the "has this
        // device ever seen real data" dirty flag — without this, a device
        // that just pulled down a whole real account (e.g. after a password
        // reset) still reads as "never touched" and the onboarding tour
        // wrongly offers itself to a returning user.
        if ((tasks.length || sops.length || goals.length) && window.TimePathUtils) {
            window.TimePathUtils.markUserDataDirty();
        }

        var settings = settingsRes && settingsRes.data;
        if (settings) {
            if (window.TimePathStore && window.TimePathStore.hydrateSettings) {
                window.TimePathStore.hydrateSettings({
                    budget: settings.budget, budgetConfigured: settings.budget_configured, selectedDate: settings.selected_date
                });
            }
            if (settings.language) {
                try { localStorage.setItem("timepath:lang", settings.language); } catch (e) {}
            }
        }

        // hydrateFromCloud()/hydrateSettings() write straight to LocalStorage and
        // don't touch the DOM — a page's already-rendered view (built from seed
        // data before this async pull finished) would otherwise keep showing
        // stale content until some unrelated user action happened to re-render
        // it. Each page listens for this and re-runs its own render function.
        window.dispatchEvent(new CustomEvent("timepath:hydrated"));
        return true;
    }

    function hasPendingSync() { return queue.length > 0; }

    window.TimePathSync = {
        syncTaskUpsert: syncTaskUpsert, syncTaskDelete: syncTaskDelete,
        syncSopUpsert: syncSopUpsert, syncSopDelete: syncSopDelete,
        syncGoalUpsert: syncGoalUpsert, syncGoalDelete: syncGoalDelete,
        syncNodeUpsert: syncNodeUpsert, syncNodeDelete: syncNodeDelete, syncNodeLinkedTasksDiff: syncNodeLinkedTasksDiff,
        syncUserSettingsDebounced: syncUserSettingsDebounced,
        cloudHasAnyData: cloudHasAnyData, pushAllLocalToCloud: pushAllLocalToCloud,
        pullAll: pullAll, flush: flush, hasPendingSync: hasPendingSync
    };
})();
