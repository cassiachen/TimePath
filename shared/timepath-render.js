(function () {
    function priorityLabel(priority, T) {
        return priority === "must" ? T("priority.must") : priority === "should" ? T("priority.should") : T("priority.optional");
    }

    function statusLabel(status, T) {
        return { todo: T("status.todo"), in_progress: T("status.in_progress"), done: T("status.done"), delayed: T("status.delayed"), skipped: T("status.skipped") }[status] || status;
    }

    function energyLabel(energy, T) {
        return energy === "high" ? T("energy.high") : energy === "low" ? T("energy.low") : T("energy.mid");
    }

    function energyIcon(energy) {
        return energy === "high" ? "battery_5_bar" : energy === "low" ? "battery_2_bar" : "battery_3_bar";
    }

    function statusPct(task) {
        if (task.subtasks && task.subtasks.length) {
            return Math.round((task.subtasks.filter(function (s) { return s.done; }).length / task.subtasks.length) * 100);
        }
        return task.status === "done" ? 100 : task.status === "in_progress" ? 50 : 0;
    }

    function taskRowHtml(task, ctx) {
        var U = ctx.U, S = ctx.S, T = ctx.T;
        var sop = task.sopId ? S.getSop(task.sopId) : null;
        var endTime = U.minutesToTime(U.timeToMinutes(task.startTime) + task.estimatedMinutes);
        var estH = (task.estimatedMinutes / 60).toFixed(1);
        var actH = (S.actualMinutesFor(task) / 60).toFixed(1);
        var barColor = U.statusDotClass(task.status);
        var accentColor = U.priorityBgClass(task.priority);

        return '<div class="task-row bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-0 hover:border-outline hover:shadow-sm transition-all group relative overflow-hidden cursor-pointer" data-task-id="' + task.id + '">' +
            '<div class="absolute left-0 top-0 bottom-0 w-[3px] ' + accentColor + '"></div>' +
            '<div class="md:grid md:grid-cols-12 md:gap-md md:items-center md:px-lg md:py-md pl-sm">' +
            '<div class="col-span-3 mb-sm md:mb-0"><div class="flex items-start gap-sm">' +
            '<div class="mt-0.5"><div class="w-5 h-5 border-2 ' + (task.status === "done" ? "bg-primary border-primary" : "border-outline") + ' rounded flex items-center justify-center hover:border-primary transition-colors">' +
            (task.status === "done" ? '<span class="material-symbols-outlined text-[12px] text-on-primary">check</span>' : "") + '</div></div>' +
            '<div><h3 class="font-body-md text-body-md font-semibold text-on-surface leading-snug ' + (task.status === "done" ? "line-through" : "") + '">' + U.escapeHtml(task.title) + '</h3>' +
            '<div class="flex items-center gap-xs mt-1 text-on-surface-variant"><span class="material-symbols-outlined text-[14px]">account_tree</span>' +
            '<span class="font-label-md text-label-md text-[10px]">' + T("tasks.subtasks_count", { count: task.subtasks.length }) + (task.recurrence !== "none" ? " · " + T("taskForm.repeat_" + task.recurrence) : "") + '</span></div></div></div></div>' +
            '<div class="col-span-2 mb-sm md:mb-0 flex items-center gap-xs ' + (sop ? "text-primary" : "text-on-surface-variant opacity-50") + '">' +
            (sop ? '<span class="material-symbols-outlined text-[16px]">link</span><span class="font-label-md text-label-md">' + U.escapeHtml(sop.name) + '</span>' : '<span class="material-symbols-outlined text-[16px]">link_off</span><span class="font-label-md text-label-md">' + T("tasks.no_sop") + '</span>') + '</div>' +
            '<div class="col-span-2 mb-sm md:mb-0 flex flex-col text-on-surface-variant"><div class="font-mono-sm text-mono-sm text-on-surface">' + task.startTime + ' - ' + endTime + '</div>' +
            '<div class="font-label-md text-[10px] md:mt-0.5">' + estH + 'h / ' + (actH > 0 ? actH + "h" : "--") + '</div></div>' +
            '<div class="col-span-1 mb-sm md:mb-0"><span class="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest font-label-md text-[10px] border ' + U.priorityBorderClass(task.priority) + ' ' + U.priorityTextClass(task.priority) + '">' + priorityLabel(task.priority, T) + '</span></div>' +
            '<div class="col-span-1 mb-sm md:mb-0"><span class="inline-flex items-center gap-1 text-on-surface-variant font-label-md text-[10px]"><span class="material-symbols-outlined text-[14px] text-primary">' + energyIcon(task.energy) + '</span> ' + energyLabel(task.energy, T) + '</span></div>' +
            '<div class="col-span-2 mb-sm md:mb-0 flex items-center gap-sm"><div class="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden"><div class="h-full ' + barColor + '" style="width:' + statusPct(task) + '%"></div></div>' +
            '<span class="font-label-md text-[10px] flex items-center gap-1 ' + U.statusTextClass(task.status) + '"><span class="w-1.5 h-1.5 rounded-full ' + U.statusDotClass(task.status) + '"></span>' + statusLabel(task.status, T) + '</span></div>' +
            '<div class="col-span-1 flex items-center justify-end gap-xs text-on-surface-variant opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">' +
            '<button data-action="row-edit" class="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded-full" title="Edit"><span class="material-symbols-outlined text-[18px]">edit</span></button></div>' +
            '</div></div>';
    }

    function taskDrawerHtml(task, ctx) {
        var U = ctx.U, S = ctx.S, T = ctx.T;
        var sop = task.sopId ? S.getSop(task.sopId) : null;
        var endTime = U.minutesToTime(U.timeToMinutes(task.startTime) + task.estimatedMinutes);
        var estH = (task.estimatedMinutes / 60).toFixed(1);
        var actH = (S.actualMinutesFor(task) / 60).toFixed(1);

        var subtasksHtml = task.subtasks.length
            ? task.subtasks.map(function (s) {
                return '<div class="flex items-center gap-sm bg-surface p-sm border border-outline-variant rounded-md" data-sub-id="' + s.id + '">' +
                    '<div class="subtask-toggle w-4 h-4 ' + (s.done ? "bg-primary" : "border-2 border-outline") + ' rounded flex items-center justify-center cursor-pointer">' +
                    (s.done ? '<span class="material-symbols-outlined text-[12px] text-on-primary">check</span>' : "") + '</div>' +
                    '<span class="font-body-md text-on-surface ' + (s.done ? "line-through opacity-70" : "") + '">' + U.escapeHtml(s.title) + '</span></div>';
            }).join("")
            : '<p class="text-on-surface-variant text-body-md">' + T("tasks.no_subtasks") + '</p>';

        return '<div><h3 class="font-headline-md text-on-surface mb-xs">' + U.escapeHtml(task.title) + '</h3>' +
            '<div class="flex items-center gap-sm text-on-surface-variant font-label-md flex-wrap">' +
            '<span class="bg-surface-container-highest px-2 py-0.5 rounded border ' + U.priorityBorderClass(task.priority) + ' ' + U.priorityTextClass(task.priority) + '">' + priorityLabel(task.priority, T) + '</span>' +
            '<span class="bg-surface-container-highest px-2 py-0.5 rounded border border-outline-variant flex items-center gap-1 ' + U.statusTextClass(task.status) + '"><span class="w-1.5 h-1.5 rounded-full ' + U.statusDotClass(task.status) + '"></span>' + statusLabel(task.status, T) + '</span>' +
            (sop ? '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">link</span>' + U.escapeHtml(sop.name) + '</span>' : "") +
            '</div>' + (task.note ? '<p class="text-body-md text-on-surface-variant mt-sm">' + U.escapeHtml(task.note) + '</p>' : "") + '</div>' +
            '<div class="grid grid-cols-2 gap-sm">' +
            '<div class="bg-surface-container p-sm rounded-lg"><p class="font-label-md text-on-surface-variant mb-1">' + T("tasks.time_label") + '</p>' +
            '<p class="font-mono-sm text-on-surface">' + task.startTime + ' - ' + endTime + '</p>' +
            '<p class="font-label-md text-[10px] text-on-surface-variant mt-1">' + T("tasks.est_act", { est: estH, act: actH }) + '</p></div>' +
            '<div class="bg-surface-container p-sm rounded-lg"><p class="font-label-md text-on-surface-variant mb-1">' + T("tasks.energy_required") + '</p>' +
            '<p class="font-label-md text-on-surface flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-primary">' + energyIcon(task.energy) + '</span> ' + energyLabel(task.energy, T) + '</p></div>' +
            '</div>' +
            '<div><div class="flex justify-between items-center mb-sm"><h4 class="font-headline-sm text-on-surface text-[16px]">' + T("tasks.task_breakdown") + '</h4></div>' +
            '<div class="flex flex-col gap-sm">' + subtasksHtml + '</div></div>';
    }

    window.TimePathRender = {
        priorityLabel: priorityLabel,
        statusLabel: statusLabel,
        energyLabel: energyLabel,
        energyIcon: energyIcon,
        statusPct: statusPct,
        taskRowHtml: taskRowHtml,
        taskDrawerHtml: taskDrawerHtml
    };
})();
