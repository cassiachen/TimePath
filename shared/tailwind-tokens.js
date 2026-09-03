// Shared Tailwind theme tokens, identical across every TimePath page. Sourced
// from DESIGN.md (the canonical spec) so the 4 pages can't drift from each
// other or from the written design system the way they previously did —
// each page's "near-black" text color, for example, used to be a different
// hex value purely by accident of independent AI generation.
window.TIMEPATH_TOKENS = {
    colors: {
        "surface": "#f9f9f9",
        "surface-dim": "#dadada",
        "surface-bright": "#f9f9f9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f3",
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#4c4546",
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f1f1f1",
        "outline": "#7e7576",
        "outline-variant": "#cfc4c5",
        "surface-tint": "#5e5e5e",
        "primary": "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#1b1b1b",
        "on-primary-container": "#848484",
        "inverse-primary": "#c6c6c6",
        "secondary": "#5e5e5e",
        "on-secondary": "#ffffff",
        "secondary-container": "#e3e2e2",
        "on-secondary-container": "#646464",
        "tertiary": "#000000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#1a1c1c",
        "on-tertiary-container": "#838484",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#e2e2e2",
        "primary-fixed-dim": "#c6c6c6",
        "on-primary-fixed": "#1b1b1b",
        "on-primary-fixed-variant": "#474747",
        "secondary-fixed": "#e3e2e2",
        "secondary-fixed-dim": "#c7c6c6",
        "on-secondary-fixed": "#1b1c1c",
        "on-secondary-fixed-variant": "#464747",
        "tertiary-fixed": "#e3e2e2",
        "tertiary-fixed-dim": "#c6c6c6",
        "on-tertiary-fixed": "#1a1c1c",
        "on-tertiary-fixed-variant": "#464747",
        "background": "#f9f9f9",
        "on-background": "#1a1c1c",
        "surface-variant": "#e2e2e2",
        // Small, restrained semantic accent set — used only as functional state
        // indicators (priority/status), never as decoration. Kept to 4 hues so
        // the monochrome base still reads as the dominant look.
        "priority-must": "#ba1a1a",
        "priority-should": "#b75b00",
        "status-done": "#1e7d34",
        "status-progress": "#1d4ed8"
    },
    // Sharp/architectural corners — the look 3 of the 4 original pages already
    // used. DESIGN.md's "Rounded (0.5rem)" spec does NOT match the intended
    // style; don't resync borderRadius from it.
    borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
    },
    spacing: {
        "md": "16px",
        "xs": "4px",
        "sm": "8px",
        "gutter": "16px",
        "margin-desktop": "40px",
        "margin-mobile": "16px",
        "base": "4px",
        "xl": "32px",
        "lg": "24px"
    },
    fontFamily: {
        "mono-sm": ["JetBrains Mono"],
        "headline-sm": ["Inter"],
        "body-md": ["Inter"],
        "label-md": ["Inter"],
        "headline-lg": ["Inter"],
        "headline-md": ["Inter"],
        "body-lg": ["Inter"]
    },
    fontSize: {
        "mono-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }],
        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
    }
};
