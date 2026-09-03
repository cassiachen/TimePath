// Shared time-budget settings modal (PRD section 3). Classic script, exposes
// global `TimePathSettingsForm`. Opened from the gear icon on every page.
(function () {
    var S = window.TimePathStore;
    var T = window.TimePathI18n.t;
    var overlayEl = null;
    var FIELDS = [
        ["sleep", "settingsForm.sleep"], ["work", "settingsForm.work"], ["meals", "settingsForm.meals"], ["commute", "settingsForm.commute"],
        ["exercise", "settingsForm.exercise"], ["study", "settingsForm.study"], ["entertainment", "settingsForm.entertainment"], ["other", "settingsForm.other"]
    ];

    function close() {
        if (overlayEl) { overlayEl.remove(); overlayEl = null; }
        document.removeEventListener("keydown", onKeydown);
    }

    function onKeydown(e) { if (e.key === "Escape") close(); }

    function open(options) {
        options = options || {};
        close();
        var budget = S.state.budget;

        var fieldsHtml = FIELDS.map(function (f) {
            var key = f[0], label = T(f[1]);
            return '<label class="flex items-center justify-between gap-md">' +
                '<span class="text-body-md text-on-surface">' + label + '</span>' +
                '<input type="number" min="0" max="24" step="0.5" name="' + key + '" value="' + (budget[key] || 0) + '" class="w-24 bg-surface border border-outline-variant rounded px-2 py-1 text-body-md text-right"/>' +
                '</label>';
        }).join("");

        overlayEl = document.createElement("div");
        overlayEl.className = "fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-md";
        overlayEl.innerHTML =
            '<div class="bg-surface-container-lowest w-full max-w-sm rounded-xl border border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">' +
            '  <div class="flex items-center justify-between p-md border-b border-outline-variant">' +
            '    <h3 class="text-headline-sm font-headline-sm font-bold text-on-surface">' + T(options.isFirstRun ? "settingsForm.first_run_title" : "settingsForm.title") + '</h3>' +
            '    <button type="button" class="gf-close text-on-surface-variant hover:text-primary p-1 rounded-full"><span class="material-symbols-outlined">close</span></button>' +
            '  </div>' +
            '  <form class="p-md flex flex-col gap-sm">' +
            '    <p class="text-body-md text-on-surface-variant mb-xs">' + T("settingsForm.desc") + '</p>' +
            fieldsHtml +
            '    <p class="gf-total text-body-md font-bold text-on-surface mt-sm"></p>' +
            '    <div class="flex justify-end gap-sm pt-sm border-t border-outline-variant mt-sm">' +
            '      <button type="button" class="gf-cancel px-md py-sm rounded border border-outline text-on-surface">' + T("common.cancel") + '</button>' +
            '      <button type="submit" class="px-md py-sm rounded bg-primary text-on-primary font-bold">' + T("common.save") + '</button>' +
            '    </div>' +
            '  </form>' +
            '</div>';

        document.body.appendChild(overlayEl);
        document.addEventListener("keydown", onKeydown);
        overlayEl.addEventListener("click", function (e) { if (e.target === overlayEl) close(); });
        overlayEl.querySelector(".gf-close").addEventListener("click", close);
        overlayEl.querySelector(".gf-cancel").addEventListener("click", close);

        var form = overlayEl.querySelector("form");
        var totalEl = overlayEl.querySelector(".gf-total");
        function updateTotal() {
            var sum = FIELDS.reduce(function (s, f) { return s + (Number(form.elements[f[0]].value) || 0); }, 0);
            var disposable = Math.max(0, 24 - sum);
            totalEl.textContent = T("settingsForm.summary", { fixed: sum, disposable: disposable });
        }
        FIELDS.forEach(function (f) { form.elements[f[0]].addEventListener("input", updateTotal); });
        updateTotal();

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var patch = {};
            FIELDS.forEach(function (f) { patch[f[0]] = Number(form.elements[f[0]].value) || 0; });
            S.state.budget = patch;
            S.state.budgetConfigured = true;
            S.save();
            close();
            if (options.onSaved) options.onSaved();
        });
    }

    window.TimePathSettingsForm = { open: open };
})();
