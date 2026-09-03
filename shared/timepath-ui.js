(function () {
    function sortTasksByTime(tasks) {
        return tasks.slice().sort(function (a, b) {
            var aTime = a && a.startTime ? a.startTime : "00:00";
            var bTime = b && b.startTime ? b.startTime : "00:00";
            if (a.date === b.date) return (aTime < bTime ? -1 : aTime > bTime ? 1 : 0);
            return a.date < b.date ? -1 : 1;
        });
    }

    function matchesTextFilter(item, query, textResolver) {
        if (!query) return true;
        var target = typeof textResolver === "function" ? textResolver(item) : (item && item.title ? item.title : "");
        return String(target).toLowerCase().indexOf(String(query).trim().toLowerCase()) !== -1;
    }

    function bindDelegatedActions(container, handlers) {
        if (!container || typeof handlers !== "object") return;

        container.addEventListener("click", function (event) {
            var actionEl = event.target.closest("[data-action]");
            if (actionEl) {
                var action = actionEl.dataset.action;
                if (handlers[action] && typeof handlers[action] === "function") {
                    handlers[action](event, actionEl);
                }
                return;
            }

            if (handlers.default && typeof handlers.default === "function") {
                handlers.default(event, event.target.closest(".task-row") || event.target.closest("[data-task-id]") || null);
            }
        });
    }

    function bindInputChange(elementIds, handler) {
        if (!Array.isArray(elementIds) || typeof handler !== "function") return;
        elementIds.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener("change", handler);
        });
    }

    window.TimePathUI = {
        sortTasksByTime: sortTasksByTime,
        matchesTextFilter: matchesTextFilter,
        bindDelegatedActions: bindDelegatedActions,
        bindInputChange: bindInputChange
    };
})();
