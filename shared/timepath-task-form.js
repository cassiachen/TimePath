// Shared task create/edit modal. Classic script, exposes global `TimePathTaskForm`.
// Injects itself into document.body on open() and removes itself on close, so it
// can be called from any page (Today's "+", Tasks' "New Task"/"Edit", etc.)
// without duplicating the form markup per page.
(function () {
    var U = window.TimePathUtils;
    var S = window.TimePathStore;
    var T = window.TimePathI18n.t;
    var overlayEl = null;

    function close() {
        if (overlayEl) { overlayEl.remove(); overlayEl = null; }
        document.removeEventListener("keydown", onKeydown);
    }

    function onKeydown(e) {
        if (e.key === "Escape") close();
    }

    function sopOptionsHtml(selectedId) {
        var opts = ['<option value="">' + T("common.none") + '</option>'];
        S.state.sops.forEach(function (sop) {
            opts.push('<option value="' + sop.id + '"' + (sop.id === selectedId ? " selected" : "") + '>' + U.escapeHtml(sop.name) + '</option>');
        });
        return opts.join("");
    }

    function subtaskRowHtml(sub) {
        return '<div class="flex items-center gap-sm subtask-row" data-id="' + sub.id + '">' +
            '<input type="checkbox" class="subtask-done w-4 h-4" ' + (sub.done ? "checked" : "") + '/>' +
            '<input type="text" class="subtask-title flex-1 bg-surface border border-outline-variant rounded px-2 py-1 text-body-md" value="' + U.escapeHtml(sub.title) + '"/>' +
            '<button type="button" class="subtask-remove text-on-surface-variant hover:text-error px-1">✕</button>' +
            '</div>';
    }

    function open(taskId, options) {
        options = options || {};
        close();
        var editable = null;
        if (taskId) {
            var resolvedId = S.resolveEditableTaskId(taskId);
            editable = S.getTask(resolvedId);
        }
        var isNew = !editable;
        var task = editable || Object.assign({
            id: null, title: "", date: options.defaultDate || U.todayStr(), startTime: options.defaultStartTime || "09:00",
            estimatedMinutes: 30, priority: "should", category: "Work", status: "todo", sopId: null,
            energy: "mid", note: "", subtasks: [], isBuffer: !!options.isBuffer, recurrence: "none"
        });

        overlayEl = document.createElement("div");
        overlayEl.className = "fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-md";
        overlayEl.innerHTML =
            '<div class="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">' +
            '  <div class="flex items-center justify-between p-md border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">' +
            '    <h3 class="text-headline-sm font-headline-sm font-bold text-on-surface">' + (isNew ? T("taskForm.new_title") : T("taskForm.edit_title")) + '</h3>' +
            '    <button type="button" data-modal-close class="tf-close text-on-surface-variant hover:text-primary p-1 rounded-full">' +
            '      <span class="material-symbols-outlined">close</span>' +
            '    </button>' +
            '  </div>' +
            '  <form class="p-md flex flex-col gap-md">' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.title_label") + '</span>' +
            '      <input name="title" required class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + U.escapeHtml(task.title) + '"/>' +
            '    </label>' +
            '    <div class="flex gap-md">' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.date_label") + '</span>' +
            '        <input type="date" name="date" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + task.date + '"/>' +
            '      </label>' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.start_time_label") + '</span>' +
            '        <input type="time" name="startTime" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + task.startTime + '"/>' +
            '      </label>' +
            '    </div>' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.duration_label") + '</span>' +
            '      <input type="number" min="5" step="5" name="estimatedMinutes" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + task.estimatedMinutes + '"/>' +
            '    </label>' +
            '    <p class="tf-conflict text-body-md text-error hidden"></p>' +
            '    <div class="flex gap-md">' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.priority_label") + '</span>' +
            '        <select name="priority" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' +
            '          <option value="must"' + (task.priority === "must" ? " selected" : "") + '>' + T("priority.must") + '</option>' +
            '          <option value="should"' + (task.priority === "should" ? " selected" : "") + '>' + T("priority.should") + '</option>' +
            '          <option value="optional"' + (task.priority === "optional" ? " selected" : "") + '>' + T("priority.optional") + '</option>' +
            '        </select>' +
            '      </label>' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.energy_label") + '</span>' +
            '        <select name="energy" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' +
            '          <option value="high"' + (task.energy === "high" ? " selected" : "") + '>' + T("energy.high") + '</option>' +
            '          <option value="mid"' + (task.energy === "mid" ? " selected" : "") + '>' + T("energy.mid") + '</option>' +
            '          <option value="low"' + (task.energy === "low" ? " selected" : "") + '>' + T("energy.low") + '</option>' +
            '        </select>' +
            '      </label>' +
            '    </div>' +
            '    <div class="flex gap-md">' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.category_label") + '</span>' +
            '        <input name="category" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + U.escapeHtml(task.category) + '"/>' +
            '      </label>' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.repeat_label") + '</span>' +
            '        <select name="recurrence" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' +
            '          <option value="none"' + (task.recurrence === "none" ? " selected" : "") + '>' + T("taskForm.repeat_none") + '</option>' +
            '          <option value="daily"' + (task.recurrence === "daily" ? " selected" : "") + '>' + T("taskForm.repeat_daily") + '</option>' +
            '          <option value="weekly"' + (task.recurrence === "weekly" ? " selected" : "") + '>' + T("taskForm.repeat_weekly") + '</option>' +
            '        </select>' +
            '      </label>' +
            '    </div>' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.sop_label") + '</span>' +
            '      <select name="sopId" class="tf-sop bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' + sopOptionsHtml(task.sopId) + '</select>' +
            '    </label>' +
            '    <label class="flex items-center gap-sm">' +
            '      <input type="checkbox" name="isBuffer" class="w-4 h-4" ' + (task.isBuffer ? "checked" : "") + '/>' +
            '      <span class="text-body-md text-on-surface">' + T("taskForm.mark_buffer") + '</span>' +
            '    </label>' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.note_label") + '</span>' +
            '      <textarea name="note" rows="2" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' + U.escapeHtml(task.note) + '</textarea>' +
            '    </label>' +
            '    <div class="flex flex-col gap-sm">' +
            '      <div class="flex items-center justify-between">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("taskForm.subtasks_label") + '</span>' +
            '        <button type="button" class="tf-add-subtask text-primary text-body-md font-bold">' + T("taskForm.add_subtask") + '</button>' +
            '      </div>' +
            '      <div class="tf-subtasks flex flex-col gap-sm">' + task.subtasks.map(subtaskRowHtml).join("") + '</div>' +
            '    </div>' +
            '    <div class="flex items-center justify-between gap-md pt-sm border-t border-outline-variant">' +
            (isNew ? '<span></span>' : '<button type="button" class="tf-delete text-error text-body-md font-bold">' + T("taskForm.delete_task") + '</button>') +
            '      <div class="flex gap-sm ml-auto">' +
            '        <button type="button" data-modal-cancel class="tf-cancel px-md py-sm rounded border border-outline text-on-surface">' + T("common.cancel") + '</button>' +
            '        <button type="submit" class="px-md py-sm rounded bg-primary text-on-primary font-bold">' + T("common.save") + '</button>' +
            '      </div>' +
            '    </div>' +
            '  </form>' +
            '</div>';

        document.body.appendChild(overlayEl);
        document.addEventListener("keydown", onKeydown);
        window.TimePathModal.attachCommonModalBehavior(overlayEl, close);

        var form = overlayEl.querySelector("form");
        var subtasksEl = overlayEl.querySelector(".tf-subtasks");

        overlayEl.querySelector(".tf-add-subtask").addEventListener("click", function () {
            var row = document.createElement("div");
            row.innerHTML = subtaskRowHtml({ id: U.uid("sub"), title: "", done: false });
            var node = row.firstElementChild;
            subtasksEl.appendChild(node);
            node.querySelector(".subtask-title").focus();
        });
        subtasksEl.addEventListener("click", function (e) {
            if (e.target.classList.contains("subtask-remove")) {
                e.target.closest(".subtask-row").remove();
            }
        });

        var sopSelect = overlayEl.querySelector(".tf-sop");
        var durationInput = form.elements.estimatedMinutes;
        sopSelect.addEventListener("change", function () {
            var sop = S.getSop(sopSelect.value);
            if (sop) durationInput.value = sop.defaultDurationMinutes;
        });

        var conflictEl = overlayEl.querySelector(".tf-conflict");
        function checkConflict() {
            var date = form.elements.date.value;
            var start = form.elements.startTime.value;
            var dur = Number(form.elements.estimatedMinutes.value) || 0;
            var excludeId = task.id;
            var conflicts = S.detectConflict(date, start, dur, excludeId);
            if (conflicts.length) {
                conflictEl.textContent = T("taskForm.overlaps_with", { names: conflicts.map(function (t) { return t.title; }).join(", ") });
                conflictEl.classList.remove("hidden");
            } else {
                conflictEl.classList.add("hidden");
            }
        }
        ["date", "startTime", "estimatedMinutes"].forEach(function (name) {
            form.elements[name].addEventListener("input", checkConflict);
        });
        checkConflict();

        if (!isNew) {
            overlayEl.querySelector(".tf-delete").addEventListener("click", function () {
                S.deleteTask(task.id);
                close();
                if (options.onSaved) options.onSaved();
            });
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var subtasks = Array.prototype.map.call(subtasksEl.querySelectorAll(".subtask-row"), function (row) {
                return {
                    id: row.dataset.id,
                    title: row.querySelector(".subtask-title").value.trim(),
                    done: row.querySelector(".subtask-done").checked
                };
            }).filter(function (s) { return s.title; });

            var patch = {
                title: form.elements.title.value.trim() || "Untitled task",
                date: form.elements.date.value,
                startTime: form.elements.startTime.value,
                estimatedMinutes: Number(form.elements.estimatedMinutes.value) || 5,
                priority: form.elements.priority.value,
                energy: form.elements.energy.value,
                category: form.elements.category.value.trim() || "General",
                recurrence: form.elements.recurrence.value,
                sopId: form.elements.sopId.value || null,
                isBuffer: form.elements.isBuffer.checked,
                note: form.elements.note.value,
                subtasks: subtasks
            };

            if (isNew) {
                S.addTask(patch);
            } else {
                S.updateTask(task.id, patch);
            }
            close();
            if (options.onSaved) options.onSaved();
        });

        form.querySelector('[name="title"]').focus();
    }

    window.TimePathTaskForm = { open: open, close: close };
})();
