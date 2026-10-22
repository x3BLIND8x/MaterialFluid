# MaterialFluid v0.1 validation

Current release verification uses Linux, Node.js 26.12.0, and the repository lockfile. Package support requires Node.js 22.12 or newer.

## Completed

- All 130 unit and component tests pass, including palette contrast/defaults, forms, notifications, responsive navigation, pointer interactions, and the bounded table-resize regression.
- ESLint passes.
- TypeScript strict checks, the production showcase, library bundles, declarations, and asset copy all build successfully.
- The source ZIP passes independent CRC and file-list verification. It excludes installed dependencies, builds, caches, local configuration, credentials, and reports, and preserves the Linux launcher's executable permission.

## Package and browser verification

- Isolated installation of the packed library passes: 58 exports, server rendering, the optional icon pack, styles, fonts, and all 56 default plus 56 size examples.
- All 61 Chromium browser regressions pass across the final suite and focused rerun. Coverage includes all 56 routes, keyboard/touch interactions, English/Persian, mobile layout, navigation motion, anchored dropdowns, menu holds, and trailing field alignment at every size.
- Automated accessibility checks pass on seven representative component pages.
- Impeccable review includes 24 desktop/mobile English/Persian captures across light/dark themes, plus open-overlay and navigation inspections. No page overflow or runtime exceptions were found in those captures.
- The portable launcher prints its URL, keeps serving after the browser closes, and stops its server when its terminal process exits.

The optional icon catalogue is loaded separately. Vite reports a large-chunk warning for that catalogue and the main showcase bundle; this is documented rather than suppressed.

## Acceptance boundaries

Automated checks support the WCAG 2.2 AA target; they do not certify conformance. Manual screen-reader output, physical phones, Safari, and Firefox are not verified by this run.

The optional Material Symbols pack contains 4,301 source symbols plus 21 compatibility aliases. Generated animation classification is heuristic; tests of paths, registration, and representative glyphs do not establish individual visual approval of every symbol.

The showcase contains illustrative people and data, runs without an account or backend, and uses local font and icon assets. The complete icon catalogue is loaded separately and is substantially larger than the core library.
