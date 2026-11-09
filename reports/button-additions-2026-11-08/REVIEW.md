# Button additions — 2026-11-08

The Button page now has Example Presets, Appearance, Content and Behavior controls. A single configuration model drives the live example, copy action and Web Components/React recipes. The optional icon picker searches all 4,322 icons, with pagination, retry and removal. The complete pack loads on demand.

The exported Button adds XS/XL alongside its original sizes, s/m/l aliases, logical icon placement and explicit icon dimensions, controlled/uncontrolled toggle selection, active state, temporary loading text, determinate/indeterminate progress and boolean ripple control. Native form attributes, DOM refs, keyboard behavior and existing motion APIs remain available. Loading restores the authored text/icon and respects an explicitly disabled state. Content stays compensated during press and release. Square and Elevated are excluded; Elevated is excluded across all components.

The optional `materialfluid/elements` entry registers a real `<mf-button>` that reuses Button in light DOM. It provides attributes, reflected selection, change events, focus/click delegation, native form submission/reset, progress/loading methods and cleanup. React and React DOM remain package peers for this adapter. This entry currently covers Button only; the generated recipes are bundler-oriented.

Reference inspection covered [Button documentation](https://md3.io/docs/components/button/) and the [source implementation](https://github.com/floor/material/tree/main/src/components/button), including types, configuration, toggle/progress features and Web Component/React wrappers. API equivalents are implemented at the MaterialFluid boundary; the existing palette, shape and motion remain owned by MaterialFluid.

## Evidence

- Unit suite: 169 tests across ten files passed. The six new Button/model tests passed again after the quoted-string code-generation correction.
- Production-preview Microsoft Edge: all 20 targeted tests passed. Coverage includes the configuration UI, full-pack icon selection, synchronized recipes, five sizes, native submit behavior, four bilingual/theme/viewport accessibility scans, fixed content during press/release, resize springs, rapid taps, keyboard and CDP touch holds, reduced/minimal motion and tuning reset.
- Source-served Web Component browser regression passed, including selection payload, disabled loading/restoration, progress, focus/blur, native submit/reset, accessible icon-only content and disconnect/reconnect label retention. All six new browser tests passed together before the production run.
- The resize regression now begins recording at the actual size-class change, retains its initial measurement and keeps the preview and size selector in view. Assertions still require continuous geometry/layout updates and physically bounded spring overshoot. Source motion settings were preserved.
- Full ESLint passed; targeted ESLint and `git diff --check` passed after the final test/model changes.
- `npm run build` passed TypeScript, showcase/library production bundles, complete declarations (including the optional elements entry) and asset copying.
- Installed-package smoke passed 76 exports, server rendering, server-safe optional elements imports, complete icon registration/assets, 45 default and 45 appearance examples, 17 new Button React examples (including quoted custom text/form values), the element API type fixture, 34 compatibility composition examples and existing presentation/size-policy checks. Seventeen matching Web Component HTML recipes were generated.
- Impeccable detector: no findings in the new playground, model, picker and optional adapter (`.cache/button-additions-detector.json`).
- Visual review: English/light and Persian/dark at 1440px; English/dark and Persian/light at 390px. The paired matrix covers both languages, themes and viewport classes, rather than every Cartesian combination. No page errors, document overflow or scoped axe A/AA violations were detected in these checked states.

## Captures

- [Desktop English/light](en-light-1440.png)
- [Desktop Persian/dark](fa-dark-1440.png)
- [Narrow English/dark](en-dark-390.png)
- [Narrow Persian/light](fa-light-390.png)

## Limits

These are targeted local automated checks. Physical devices, Safari/Firefox, manual screen readers, exhaustive custom palettes and every icon/progress combination are not established by this pass. The full optional icon pack retains its existing large-chunk warning. Web Component HTML recipes are generated and the adapter is exercised in a browser; HTML files are not TypeScript compilation units.
