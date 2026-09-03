(function () {
    var U = window.TimePathUtils;
    var S = window.TimePathGoalStore;
    var T = window.TimePathI18n.t;
    var overlayEl = null;

    function close() {
        if (overlayEl) { overlayEl.remove(); overlayEl = null; }
        document.removeEventListener("keydown", handleKeydown);
    }

    function handleKeydown(event) {
        if (event.key === "Escape") close();
    }

    function open(goalId, options) {
        options = options || {};
        close();
        var goal = goalId ? S.getGoal(goalId) : null;
        var isNew = !goal;
        var values = goal || {
            id: null,
            name: "",
            description: "",
            category: "Study",
            startDate: U.todayStr(),
            endDate: U.todayStr()
        };

        overlayEl = document.createElement("div");
        overlayEl.className = "fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-md";
        overlayEl.innerHTML =
            '<div class="bg-surface-container-lowest w-full max-w-lg rounded-xl border border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">' +
            '  <div class="flex items-center justify-between p-md border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">' +
            '    <h3 class="text-headline-sm font-headline-sm font-bold text-on-surface">' + (isNew ? T("goalForm.new_title") : T("goalForm.edit_title")) + '</h3>' +
            '    <button type="button" data-modal-close class="text-on-surface-variant hover:text-primary p-1 rounded-full"><span class="material-symbols-outlined">close</span></button>' +
            '  </div>' +
            '  <form class="p-md flex flex-col gap-md">' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("goalForm.name_label") + '</span>' +
            '      <input name="name" required class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + U.escapeHtml(values.name) + '"/>' +
            '    </label>' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("goalForm.category_label") + '</span>' +
            '      <input name="category" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + U.escapeHtml(values.category) + '"/>' +
            '    </label>' +
            '    <div class="flex gap-md">' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("goalForm.start_label") + '</span>' +
            '        <input type="date" name="startDate" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + (values.startDate || U.todayStr()) + '"/>' +
            '      </label>' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("goalForm.end_label") + '</span>' +
            '        <input type="date" name="endDate" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + (values.endDate || U.todayStr()) + '"/>' +
            '      </label>' +
            '    </div>' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("goalForm.description_label") + '</span>' +
            '      <textarea name="description" rows="4" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' + U.escapeHtml(values.description) + '</textarea>' +
            '    </label>' +
            '    <div class="flex items-center justify-between gap-md pt-sm border-t border-outline-variant">' +
            (isNew ? '<span></span>' : '<button type="button" class="text-error text-body-md font-bold" data-goal-delete>' + T("goalForm.delete_goal") + '</button>') +
            '      <div class="flex gap-sm ml-auto">' +
            '        <button type="button" data-modal-cancel class="px-md py-sm rounded border border-outline text-on-surface">' + T("common.cancel") + '</button>' +
            '        <button type="submit" class="px-md py-sm rounded bg-primary text-on-primary font-bold">' + T("common.save") + '</button>' +
            '      </div>' +
            '    </div>' +
            '  </form>' +
            '</div>';

        document.body.appendChild(overlayEl);
        document.addEventListener("keydown", handleKeydown);
        window.TimePathModal.attachCommonModalBehavior(overlayEl, close);

        var form = overlayEl.querySelector("form");

        if (!isNew) {
            overlayEl.querySelector("[data-goal-delete]").addEventListener("click", function () {
                S.deleteGoal(goal.id);
                close();
                if (options.onSaved) options.onSaved();
            });
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var payload = {
                name: form.elements.name.value.trim() || "Untitled Goal",
                description: form.elements.description.value.trim(),
                category: form.elements.category.value.trim() || "General",
                startDate: form.elements.startDate.value || U.todayStr(),
                endDate: form.elements.endDate.value || U.todayStr(),
                status: "active"
            };

            if (isNew) {
                S.addGoal(payload);
            } else {
                S.updateGoal(goal.id, payload);
            }

            close();
            if (options.onSaved) options.onSaved();
        });
    }

    window.TimePathGoalForm = { open: open, close: close };
})();
