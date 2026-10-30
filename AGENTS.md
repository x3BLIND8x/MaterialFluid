# MaterialFluid development policy

Use the global Impeccable skill for every UI change. Read PRODUCT.md, DESIGN.md, and COMPONENT_POLICY.md before changing the system.

- Build the showcase from exported kit components. Tree owns nested navigation, including the catalogue and TableOfContents. Reuse library controls rather than creating showcase-only substitutes.
- Fix a defect in its shared component or semantic token. Do not add page-specific color, radius, or interaction patches to compensate for library drift.
- Controls use a 14/24/29px base radius. Framed containers add their real padding inset and border to it for concentric curves; icon actions use half their actual diameter at rest. Preserve the existing press/ripple radius animation. Expanded selects retain their trigger's measured radius.
- Use paired background/foreground roles. Neutral text and transparent actions target 7:1 contrast; all readable content must meet 4.5:1 and interactive boundaries 3:1. Verify light and dark, English and Persian, desktop and narrow screens.
- Use the shared miscellaneous palette for identity and semantic status, independently of the accent seed. Toasts and other floating surfaces share the same surface roles.
- Size options come from componentSizePolicy. Add a variant only when it serves a distinct use case, and implement it at the library boundary as well as in the showcase.
- Preserve passive field labels, accessible naming, keyboard access, reduced-motion behavior, and optional full-icon-pack loading.
- A release needs typecheck, lint, unit tests, browser regressions, a production build, and the installed-package smoke check. Record actual evidence and limits in VALIDATION.md.
