# Fixed component defaults — 2026-11-08

Button icons now inherit the selected Appearance size. Independent icon-size input/API and Ripple input/API are removed from the preview model, both generated code formats, Button props and Web Component attributes. The default ripple animation remains.

Component pages no longer have Advanced panels, including Button, FAB, Toggle and the compatibility icon gallery. Public Button color/size/press/ripple tuning props, provider buttonMotion/textMorph overrides, AnimatedIcon timing/stroke overrides, Switch iconMotion overrides and Accordion/Dialog/AlertDialog/Menu motionSettings props are removed. Installed-package type fixtures explicitly require these old configuration props to produce TypeScript errors.

All authored default values remain. Button uses press depth 8%, stiffness 700, damping 20, mass 1.5, size damping 30, radius-depth ratio 4, color duration 330ms, ripple duration 550ms, opacity 20%, fast-start strength 85% and release speed 2. Text morph retains 100ms duration, 6px blur and 0% fade. Existing icon timing, accordion/dialog/menu presets and reduced-motion behavior remain.

Private composition contexts preserve passive ToggleGroup segments, Calendar/Collapsible sizing and stationary Menu triggers. The separate Motion playground uses a private context for experiments and exports experiment settings rather than unsupported public component props. Its values do not change component defaults. Active remains a boolean visual state that keeps the hover background visible; it does not change selection or fire an action.

## Evidence

- Final unit suite: 169 tests across ten files passed.
- All 21 targeted source-served Button tests passed: configuration, Web adapter, four fixed-content matrices and existing press/ripple/resize/keyboard/touch checks. The updated no-Advanced route assertion also passed against the production build with the actual animated-icon compatibility route.
- Production-preview Edge: eight configuration/calendar checks passed (including five repeated Button configuration/preset tests). Icons follow Small/Medium/XL geometry at 16/22/32px. Both code formats omit independent icon sizing and ripple configuration. Four paired theme/language/viewport captures passed scoped axe A/AA, overflow and runtime-error checks.
- Additional checks passed: all 45 catalogue pages render, Dialog focus trapping/Escape/restoration, and default opaque Toggle/FAB blur transitions. Production icon-gallery search/Persian mobile, independent connection switches and dense Motion playground slider increments passed.
- A dedicated production-preview regression passed private Button press-depth adjustment, Accordion opening, AlertDialog opening, Menu opening and a return to the component Button's unchanged 8% press depth. Its initial menu locator used the supplied label; it was corrected to the actual Radix accessible name supplied by the trigger before passing.
- Three older calendar assertions targeted hidden legacy captions or literal 999px radii. They now target the visible shared header and assert a radius equal to half the rendered endpoint diameter. All three pass. Calendar source geometry and radius defaults were preserved.
- `npm run build` passed typecheck, showcase/library bundles, complete declarations and assets. Full lint and final targeted lint passed. `git diff --check` passed. Existing large showcase/full-icon chunk warnings remain.
- Installed-package smoke passed 76 exports, server rendering, optional elements entry import, icons/assets, 45 default plus 45 appearance examples, 17 Button React examples, the custom-element type fixture, 34 compatibility examples and existing presentation/size checks. Negative type fixtures confirm the removed tuning APIs are rejected. Matching Web Component HTML recipes were generated; the adapter is browser-tested.
- Impeccable detector returned no findings for the changed playground/model/adapter and private context (`.cache/button-defaults-detector.json`). The four paired captures were visually inspected.

## Captures and limits

[English/light desktop](en-light-1440.png), [Persian/dark desktop](fa-dark-1440.png), [English/dark narrow](en-dark-390.png), [Persian/light narrow](fa-light-390.png).

These are targeted local automated checks, not the full browser suite, physical-device, Safari/Firefox, manual screen-reader or exhaustive custom-palette acceptance. The optional Web Component entry still uses the package's React/React DOM peers. Final README/report edits followed the successful package smoke; application and declaration builds are unchanged.
