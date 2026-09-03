// Shared SOP create/edit modal. Classic script, exposes global `TimePathSopForm`.
(function () {
    var U = window.TimePathUtils;
    var S = window.TimePathStore;
    var T = window.TimePathI18n.t;
    var overlayEl = null;

    function close() {
        if (overlayEl) { overlayEl.remove(); overlayEl = null; }
        document.removeEventListener("keydown", onKeydown);
    }

    function onKeydown(e) { if (e.key === "Escape") close(); }

    function stepRowHtml(step) {
        return '<div class="flex items-center gap-sm step-row" data-id="' + step.id + '">' +
            '<span class="material-symbols-outlined text-on-surface-variant cursor-grab">drag_indicator</span>' +
            '<input type="text" class="step-title flex-1 bg-surface border border-outline-variant rounded px-2 py-1 text-body-md" value="' + U.escapeHtml(step.title) + '"/>' +
            '<button type="button" class="step-up text-on-surface-variant hover:text-primary px-1">↑</button>' +
            '<button type="button" class="step-down text-on-surface-variant hover:text-primary px-1">↓</button>' +
            '<button type="button" class="step-remove text-on-surface-variant hover:text-error px-1">✕</button>' +
            '</div>';
    }

    function open(sopId, options) {
        options = options || {};
        close();
        var editable = sopId ? S.getSop(sopId) : null;
        var isNew = !editable;
        var sop = editable || { id: null, name: "", category: "Daily Operations", defaultDurationMinutes: 30, steps: [], minStandard: "", fullStandard: "", note: "" };

        overlayEl = document.createElement("div");
        overlayEl.className = "fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-md";
        overlayEl.innerHTML =
            '<div class="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">' +
            '  <div class="flex items-center justify-between p-md border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">' +
            '    <h3 class="text-headline-sm font-headline-sm font-bold text-on-surface">' + (isNew ? T("sopForm.new_title") : T("sopForm.edit_title")) + '</h3>' +
            '    <button type="button" data-modal-close class="sf-close text-on-surface-variant hover:text-primary p-1 rounded-full"><span class="material-symbols-outlined">close</span></button>' +
            '  </div>' +
            '  <form class="p-md flex flex-col gap-md">' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("sopForm.name_label") + '</span>' +
            '      <input name="name" required class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + U.escapeHtml(sop.name) + '"/>' +
            '    </label>' +
            '    <div class="flex gap-md">' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("sopForm.category_label") + '</span>' +
            '        <input name="category" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + U.escapeHtml(sop.category) + '"/>' +
            '      </label>' +
            '      <label class="flex-1 flex flex-col gap-1">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("sopForm.duration_label") + '</span>' +
            '        <input type="number" min="5" step="5" name="defaultDurationMinutes" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md" value="' + sop.defaultDurationMinutes + '"/>' +
            '      </label>' +
            '    </div>' +
            '    <div class="flex flex-col gap-sm">' +
            '      <div class="flex items-center justify-between">' +
            '        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("sopForm.steps_label") + '</span>' +
            '        <button type="button" class="sf-add-step text-primary text-body-md font-bold">' + T("sopForm.add_step") + '</button>' +
            '      </div>' +
            '      <div class="sf-steps flex flex-col gap-sm">' + sop.steps.map(stepRowHtml).join("") + '</div>' +
            '    </div>' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("sopForm.min_standard_label") + '</span>' +
            '      <textarea name="minStandard" rows="2" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' + U.escapeHtml(sop.minStandard) + '</textarea>' +
            '    </label>' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("sopForm.full_standard_label") + '</span>' +
            '      <textarea name="fullStandard" rows="2" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' + U.escapeHtml(sop.fullStandard) + '</textarea>' +
            '    </label>' +
            '    <label class="flex flex-col gap-1">' +
            '      <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">' + T("sopForm.note_label") + '</span>' +
            '      <textarea name="note" rows="2" class="bg-surface border border-outline-variant rounded px-3 py-2 text-body-md">' + U.escapeHtml(sop.note) + '</textarea>' +
            '    </label>' +
            '    <div class="flex items-center justify-between gap-md pt-sm border-t border-outline-variant">' +
            (isNew ? '<span></span>' : '<button type="button" class="sf-delete text-error text-body-md font-bold">' + T("sopForm.delete_sop") + '</button>') +
            '      <div class="flex gap-sm ml-auto">' +
            '        <button type="button" data-modal-cancel class="sf-cancel px-md py-sm rounded border border-outline text-on-surface">' + T("common.cancel") + '</button>' +
            '        <button type="submit" class="px-md py-sm rounded bg-primary text-on-primary font-bold">' + T("common.save") + '</button>' +
            '      </div>' +
            '    </div>' +
            '  </form>' +
            '</div>';

        document.body.appendChild(overlayEl);
        document.addEventListener("keydown", onKeydown);
        window.TimePathModal.attachCommonModalBehavior(overlayEl, close);

        var stepsEl = overlayEl.querySelector(".sf-steps");
        overlayEl.querySelector(".sf-add-step").addEventListener("click", function () {
            var wrapper = document.createElement("div");
            wrapper.innerHTML = stepRowHtml({ id: U.uid("step"), title: "" });
            var node = wrapper.firstElementChild;
            stepsEl.appendChild(node);
            node.querySelector(".step-title").focus();
        });
        stepsEl.addEventListener("click", function (e) {
            var row = e.target.closest(".step-row");
            if (!row) return;
            if (e.target.classList.contains("step-remove")) row.remove();
            if (e.target.classList.contains("step-up") && row.previousElementSibling) stepsEl.insertBefore(row, row.previousElementSibling);
            if (e.target.classList.contains("step-down") && row.nextElementSibling) stepsEl.insertBefore(row.nextElementSibling, row);
        });

        var form = overlayEl.querySelector("form");
        if (!isNew) {
            overlayEl.querySelector(".sf-delete").addEventListener("click", function () {
                S.deleteSop(sop.id);
                close();
                if (options.onSaved) options.onSaved();
            });
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var steps = Array.prototype.map.call(stepsEl.querySelectorAll(".step-row"), function (row) {
                return { id: row.dataset.id, title: row.querySelector(".step-title").value.trim() };
            }).filter(function (s) { return s.title; });

            var patch = {
                name: form.elements.name.value.trim() || "Untitled SOP",
                category: form.elements.category.value.trim() || "General",
                defaultDurationMinutes: Number(form.elements.defaultDurationMinutes.value) || 30,
                steps: steps,
                minStandard: form.elements.minStandard.value,
                fullStandard: form.elements.fullStandard.value,
                note: form.elements.note.value
            };

            if (isNew) S.addSop(patch); else S.updateSop(sop.id, patch);
            close();
            if (options.onSaved) options.onSaved();
        });

        form.querySelector('[name="name"]').focus();
    }

    window.TimePathSopForm = { open: open, close: close };
})();
