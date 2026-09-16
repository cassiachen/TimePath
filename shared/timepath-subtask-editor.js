// Shared add/remove subtask-row editor, used by both the task form
// (shared/timepath-task-form.js) and the goal month/week node form
// (goals.html). Previously each had its own copy of this exact row
// markup/behavior, which had already drifted once (different input
// background class) — this is the single source of truth going forward.
// Classic script, exposes global `TimePathSubtaskEditor`.
(function () {
    var U = window.TimePathUtils;

    function rowHtml(sub) {
        return '<div class="flex items-center gap-sm subtask-row" data-id="' + sub.id + '">' +
            '<input type="checkbox" class="subtask-done w-4 h-4" ' + (sub.done ? "checked" : "") + '/>' +
            '<input type="text" class="subtask-title flex-1 bg-surface border border-outline-variant rounded px-2 py-1 text-body-md" value="' + U.escapeHtml(sub.title) + '"/>' +
            '<button type="button" class="subtask-remove text-on-surface-variant hover:text-error px-1">✕</button>' +
            '</div>';
    }

    // `container` holds the row elements; `addButton` appends a new blank
    // row when clicked. Returns { getValue() }, called at save time to read
    // back the current rows (trimmed, blank titles dropped — see
    // TimePathUtils.normalizeSubtasks, which the stores also apply
    // independently as a second line of defense).
    function mount(container, addButton, subtasks) {
        container.innerHTML = (subtasks || []).map(rowHtml).join("");

        addButton.addEventListener("click", function () {
            var wrap = document.createElement("div");
            wrap.innerHTML = rowHtml({ id: U.uid("sub"), title: "", done: false });
            var row = wrap.firstElementChild;
            container.appendChild(row);
            row.querySelector(".subtask-title").focus();
        });

        container.addEventListener("click", function (e) {
            if (e.target.classList.contains("subtask-remove")) {
                e.target.closest(".subtask-row").remove();
            }
        });

        return {
            getValue: function () {
                return U.normalizeSubtasks(Array.prototype.map.call(container.querySelectorAll(".subtask-row"), function (row) {
                    return {
                        id: row.dataset.id,
                        title: row.querySelector(".subtask-title").value,
                        done: row.querySelector(".subtask-done").checked
                    };
                }));
            }
        };
    }

    window.TimePathSubtaskEditor = { mount: mount };
})();
