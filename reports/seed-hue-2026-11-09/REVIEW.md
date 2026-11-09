# Consistent hue selection — 2026-11-09

The shared accent picker now changes hue using the original gold's saturation and brightness. It is used by both the Color page and showcase preferences. Existing saved seeds are kept until the user changes or resets the hue.

Previously the default seed was `#eedd96` (HSV hue 48.409…°, saturation 36.975%, brightness 93.333%), but selecting 48° constructed `#ffcc00` with saturation and brightness both 100%. Hue alone could therefore never reproduce the default scheme.

New selections retain saturation 88/238 and brightness 238/255. The rounded default position, 48°, retains the original fractional hue and reproduces `#eedd96` exactly. All other integer positions round-trip to the correct displayed hue without cumulative drift.

| Hue | Previous selection | New selection |
| --- | --- | --- |
| 0° | `#ff0000` | `#ee9696` |
| 48° | `#ffcc00` | `#eedd96` |
| 120° | `#00ff00` | `#96ee96` |
| 240° | `#0000ff` | `#9696ee` |

This changes seed generation in the existing shared picker. Material algorithms and their Neutral + seed integration, original scheme defaults, component roles and contrast rules remain intact. No public component parameters were added.

## Validation

- All 175 unit tests across 11 files passed, including every one of the 360 selectable hues, exact default restoration, negative/wrapped hues and the existing 24 saved default color maps.
- Full ESLint and `git diff --check` passed.
- Full build passed: typecheck, production showcase/library bundles, declaration generation and asset copying. Existing large-bundle warnings remain. Installed-package smoke passed 77 exports/server rendering, foundation utilities, optional elements/icon assets and all consumer example/API-policy type fixtures.
- Browser regressions exercise the actual slider through keyboard input, compare complete inline theme tokens after a 120° → 48° round trip, compare rendered Button fill/ink, and verify reload persistence. Four configurations cover desktop English/light and Persian/dark, and 390px English/dark and Persian/light. The changed-hue Button configurations receive scoped axe A/AA checks. Screenshots are stored beside this report.
- All six selected production-preview Edge regressions passed: the four new configurations, existing settings hue persistence/reset, and rendering all 45 component routes. The four Color-page configurations also check document overflow. Desktop English/light and narrow Persian/light captures were visually inspected.
- The preview process tree started by this run required elevated cleanup after the cases completed because Windows denied ordinary termination. Only that verified temporary port-5174 process tree was stopped; Playwright then exited successfully with six passing tests.

These are targeted local checks. They do not establish physical-device, Safari/Firefox, manual screen-reader or exhaustive custom-palette acceptance. Fixed HSV saturation/brightness gives a consistent seed profile; it does not claim equal perceptual colorfulness across hues. The selected Material algorithm still generates the final component scheme.
