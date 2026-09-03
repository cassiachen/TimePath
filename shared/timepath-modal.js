(function () {
    function attachCommonModalBehavior(modal, closeHandler) {
        if (!modal || typeof closeHandler !== "function") return;
        if (modal.__timepathModalBound) return;

        var onOverlayClick = function (event) {
            if (event.target === modal) closeHandler();
        };

        var onKeydown = function (event) {
            if (event.key === "Escape") {
                closeHandler();
                document.removeEventListener("keydown", onKeydown);
            }
        };

        modal.addEventListener("click", onOverlayClick);
        modal.__timepathModalBound = true;
        modal.__timepathModalCleanup = function () {
            modal.removeEventListener("click", onOverlayClick);
            modal.__timepathModalBound = false;
            document.removeEventListener("keydown", onKeydown);
        };

        var closeBtn = modal.querySelector("[data-modal-close]");
        if (closeBtn) closeBtn.addEventListener("click", closeHandler);

        var cancelBtn = modal.querySelector("[data-modal-cancel]");
        if (cancelBtn) cancelBtn.addEventListener("click", closeHandler);

        document.addEventListener("keydown", onKeydown);
    }

    // Small confirm modal, used instead of window.confirm()/alert() which throw
    // in sandboxed/embedded browser contexts that disable native dialogs.
    function confirmDialog(message, onConfirm) {
        var T = window.TimePathI18n.t;
        var overlay = document.createElement("div");
        overlay.className = "fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-md";
        overlay.innerHTML =
            '<div class="bg-surface-container-lowest w-full max-w-sm rounded-xl border border-outline-variant shadow-lg p-md flex flex-col gap-md">' +
            '<p class="text-body-md text-on-surface">' + message + '</p>' +
            '<div class="flex justify-end gap-sm"><button class="tm-cancel px-md py-sm rounded border border-outline text-on-surface">' + T("common.cancel") + '</button>' +
            '<button class="tm-confirm px-md py-sm rounded bg-priority-must text-on-error font-bold">' + T("common.confirm") + '</button></div></div>';
        document.body.appendChild(overlay);
        function close() { overlay.remove(); }
        overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
        overlay.querySelector(".tm-cancel").addEventListener("click", close);
        overlay.querySelector(".tm-confirm").addEventListener("click", function () { close(); onConfirm(); });
    }

    window.TimePathModal = {
        attachCommonModalBehavior: attachCommonModalBehavior,
        confirmDialog: confirmDialog
    };
})();
