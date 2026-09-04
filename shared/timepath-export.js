// Data export: CSV (one file per data type, for opening in Excel/Numbers)
// and a full JSON backup. Pure client-side — builds a Blob and triggers a
// normal browser download, no server involved. Classic script, exposes
// global `TimePathExport`.
(function () {
    function csvField(value) {
        var s = value === null || value === undefined ? "" : String(value);
        if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
        return s;
    }

    // Leading ﻿ (UTF-8 BOM) so Excel opens Chinese text correctly
    // instead of guessing the wrong encoding and showing mojibake.
    function rowsToCsv(rows) {
        return "﻿" + rows.map(function (row) { return row.map(csvField).join(","); }).join("\r\n") + "\r\n";
    }

    function downloadFile(filename, content, mimeType) {
        var blob = new Blob([content], { type: mimeType + ";charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }

    function dateStamp() {
        var d = new Date();
        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }

    function priorityLabel(p, T) {
        return p === "must" ? T("priority.must") : p === "should" ? T("priority.should") : T("priority.optional");
    }
    function statusLabel(s, T) {
        var map = { todo: "status.todo", in_progress: "status.in_progress", done: "status.done", delayed: "status.delayed", skipped: "status.skipped" };
        return T(map[s] || "status.todo");
    }
    function energyLabel(e, T) {
        return e === "high" ? T("energy.high") : e === "low" ? T("energy.low") : T("energy.mid");
    }

    function exportTasksCsv() {
        var S = window.TimePathStore, T = window.TimePathI18n.t;
        var header = [
            T("export.col_title"), T("export.col_date"), T("export.col_start_time"),
            T("export.col_planned_min"), T("export.col_actual_min"), T("export.col_priority"),
            T("export.col_category"), T("export.col_status"), T("export.col_sop"),
            T("export.col_energy"), T("export.col_subtasks"), T("export.col_buffer"), T("export.col_note")
        ];
        var rows = [header];
        S.state.tasks.forEach(function (t) {
            var sop = t.sopId ? S.getSop(t.sopId) : null;
            var subtasksLabel = t.subtasks && t.subtasks.length
                ? (t.subtasks.filter(function (s) { return s.done; }).length + "/" + t.subtasks.length) : "";
            rows.push([
                t.title, t.date, t.startTime, t.estimatedMinutes, Math.round(S.actualMinutesFor(t)),
                priorityLabel(t.priority, T), t.category, statusLabel(t.status, T),
                sop ? sop.name : "", energyLabel(t.energy, T), subtasksLabel,
                t.isBuffer ? T("export.yes") : "", t.note || ""
            ]);
        });
        downloadFile("timepath-tasks-" + dateStamp() + ".csv", rowsToCsv(rows), "text/csv");
    }

    function exportSopsCsv() {
        var S = window.TimePathStore, T = window.TimePathI18n.t;
        var header = [
            T("export.col_name"), T("export.col_category"), T("export.col_duration_min"),
            T("export.col_steps_count"), T("export.col_min_standard"), T("export.col_full_standard"), T("export.col_note")
        ];
        var rows = [header];
        S.state.sops.forEach(function (s) {
            rows.push([s.name, s.category, s.defaultDurationMinutes, (s.steps || []).length, s.minStandard || "", s.fullStandard || "", s.note || ""]);
        });
        downloadFile("timepath-sops-" + dateStamp() + ".csv", rowsToCsv(rows), "text/csv");
    }

    function exportGoalsCsv() {
        var GS = window.TimePathGoalStore, T = window.TimePathI18n.t;
        var header = [
            T("export.col_name"), T("export.col_category"), T("export.col_status"),
            T("export.col_start_date"), T("export.col_end_date"),
            T("export.col_time_progress"), T("export.col_goal_progress"), T("export.col_nodes_done")
        ];
        var rows = [header];
        GS.listGoals().forEach(function (g) {
            var summary = GS.getGoalSummary(g.id) || {};
            rows.push([
                g.name, g.category, g.status, g.startDate, g.endDate,
                (summary.timeProgress != null ? summary.timeProgress : "") + "%",
                (summary.progress != null ? summary.progress : "") + "%",
                (summary.done != null ? summary.done : "") + "/" + (summary.total != null ? summary.total : "")
            ]);
        });
        downloadFile("timepath-goals-" + dateStamp() + ".csv", rowsToCsv(rows), "text/csv");
    }

    // Browsers treat several near-simultaneous downloads from one click as a
    // pop-up-like burst and may block them, so these are staggered slightly
    // rather than fired all at once.
    function exportAllCsv() {
        exportTasksCsv();
        setTimeout(exportSopsCsv, 300);
        setTimeout(exportGoalsCsv, 600);
    }

    function exportJsonBackup() {
        var S = window.TimePathStore, GS = window.TimePathGoalStore;
        var payload = {
            exportedAt: new Date().toISOString(),
            tasks: S.state.tasks,
            sops: S.state.sops,
            goals: GS.listGoals()
        };
        downloadFile("timepath-backup-" + dateStamp() + ".json", JSON.stringify(payload, null, 2), "application/json");
    }

    window.TimePathExport = {
        exportTasksCsv: exportTasksCsv,
        exportSopsCsv: exportSopsCsv,
        exportGoalsCsv: exportGoalsCsv,
        exportAllCsv: exportAllCsv,
        exportJsonBackup: exportJsonBackup
    };
})();
