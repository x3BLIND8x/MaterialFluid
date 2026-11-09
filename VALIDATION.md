# MaterialFluid validation

## 2026-11-04: Trace expansion and responsive layout

Fixed the shared Collapsible trigger to follow authored layout instead of retaining animated intrinsic pixel widths. Trace titles/status text now shrink and wrap within the row. Trace shows its summary once and only renders an expansion button when separate details exist; the example now supplies distinct details rather than repeating descriptions. Status nodes have accessible state labels. Both timeline and compact layouts remain available.

Scoped ESLint and whitespace checks pass. Chrome tests verify keyboard opening, closing, distinct detail content, compact mode and English/Persian layout after resizing from 1200px to 390px. The 312px Trace content has 312px scroll width in both locales; its buttons remain within their parent. No sampled page errors. Evidence and narrow screenshots are in reports/trace-fix-2026-11-04/. No full release suite was repeated.

## 2026-11-04: calendar performance and immediate labels; real tooltip width

The owner superseded the calendar text-morph request: month/year labels now update immediately, with no blur/fade or geometry animation. The persistent header and day press/ripple remain. Button now supports sizeMotion={false} for controls whose geometry is fixed by their parent. This bypasses intrinsic-size probe cloning and geometry observers, while preserving the same Button press/ripple parameters. colorMotion={false} now also avoids color probes/observers rather than merely hiding the color transition. Calendar uses both on fixed day cells and its immediate header labels.

A matched local Chrome sample over four month changes reduced hidden probes from 797 to 77, layouts from 983 to 143, and measured layout time from 337ms to 50ms. Total sampled task time fell from 1.88s to 1.12s. Results are in reports/component-refinements-2026-11-04/calendar-perf-before.json and calendar-perf-after.json. These are local development-browser samples, not hardware-independent latency promises. Saved press/ripple parameters were not changed.

Tooltip now measures its inner content once and animates the actual surface width from 0 to that measured width. A stable centered positioning wrapper prevents lateral drift. Padding belongs to the content, and surface borders/minimum width do not prevent a true zero-width start. Fade begins before width expands; reduced motion opens directly at full width. This replaces the previous clip-only reveal. English/Persian browser samples are in tooltip-real-width.json. Immediate labels, native date selection, actual press/ripple and unchanged 40px day geometry pass the English/Persian browser confirmation in calendar-button-motion.json. Thirty-two targeted calendar/date/button tests pass; scoped ESLint and whitespace checks pass.

## 2026-11-04: persistent calendar header, shared text morph and date press

Supersedes the snapshot-caption workaround below. Calendar now renders one persistent month/year/navigation header above DayPicker's replaceable month grids. Native captions remain only as invisible animation lifecycle markers. Month/year changes reuse the same exported MorphingLabel module as the Toggle examples, with blur and fade; unchanged text does not animate. Accessible month/year names update immediately while visible text morphs. Date cells now use the exported Button with its press/radius/ripple settings, retaining DayPicker focus and selection handlers. The separate CSS date-selection pulse was removed.

English/Persian Chrome checks pass for stable live header position, text returning to sharp/opaque, actual Button ripple while holding a date, correct selection, and unchanged 40px day geometry. Results are in calendar-button-motion.json. Thirty calendar/date/checkbox/navigation tests passed in the scoped run; its two initial failures were accessible-name timing and header aria-disabled, both corrected and verified by a passing focused rerun. Scoped ESLint passes. Calendar's original variable-week behavior is retained.

Tooltip now fades in over 100ms and reveals rounded width symmetrically from the center over 240ms, with a 40ms reveal delay and no translation. English/Persian frame samples confirm symmetric clipping, rising opacity and no transform; see tooltip-center.json. Reduced motion still bypasses the entrance.

## 2026-11-04: indicator geometry, compact breadcrumbs, calendar, carousel and drawer

Removed Slider's generated endpoint dot and Progress's SVG stop markers at the shared library boundary. Progress inactive tracks now draw asymmetric rounded shapes: 2px internal segment ends and rounded exterior ends, preserving the 2px gap and paired surface roles. Empty tracks begin at the leading edge. Completed fills remain straight and active waves retain their incremental ramp and alternating orientation.

Breadcrumb spacing is reduced to 2px between items with 28px minimum link height, smaller separators and reduced frame padding; the current item is noninteractive text. DayPicker's exiting snapshot is anchored to the same bounds and its cloned navigation buttons are hidden, preventing duplicate arrows from shifting during month changes.

Carousel now retains all slides in one horizontal track with shared spring pagination, mouse/touch pointer capture, edge resistance, vertical-scroll cancellation and RTL direction. Inactive slides are inert. Checkbox shape uses the shared layout spring from 25% corner rounding when empty to 50% for checked and indeterminate states. Drawer (the collection's BottomSheet alias) springs upward from below the viewport, without scaling, retaining drag offset, dismissal and reduced motion.

Chrome checks in reports/component-refinements-2026-11-04/result.json pass for desktop light English and narrow dark Persian: dots absent, compact breadcrumb dimensions, stable live calendar arrows and hidden snapshot arrows. Mouse Carousel dragging and checkbox morphing pass in both languages. Native emulated touch Carousel dragging passes; Drawer samples show an offscreen entrance, overshoot and settling at exact zero with scale 1. Reduced motion opens it directly at rest. These samples are recorded in drawer-touch.json. Scoped ESLint and whitespace checks pass. Five design-policy tests and 94 unchanged core tests pass; the breadcrumb assertion was updated to reflect its intentionally noninteractive current item, and both navigation treatment tests pass in the focused rerun. The showcase production build passes. No physical touch device or full release acceptance is claimed.

## 2026-11-04: segmented waves start straight

Removed the segmented-only override disabling incremental amplitude. Segments now use the same wave options and straight-to-wave ramp as continuous progress. Completed segments remain straight; alternating orientation and 2px spacing remain. A focused Chrome check samples the active wave at two times and confirms its starting point stays on the centerline while the rest moves, with completed geometry stationary.

## 2026-11-04: completed progress segments straighten

Per the owner clarification, completed segments become straight while the active segment remains wavy. The shared LinearWave amplitude now settles to zero at completion for both continuous and segmented progress. Existing 2px segment spacing, zero leading inset and alternating orientation are preserved. The five design-policy tests pass, including assertions for straight completed segments and a wavy active segment. A focused Chrome check confirms completed geometry remains stationary while the active wave moves. No full release suite was repeated for this change.

## 2026-11-03: shared motion and component overhaul

Applied Impeccable review while preserving the owner's MaterialFluid design and saved motion. The original 58-entry catalogue remains; the reference collection now has 65 routes after removing Native Select. All animated component families consume the shared motion-engine entry and helpers. The per-family motion and composition mapping is in reports/component-overhaul-2026-11-03/shared-components.md.

Changes include neutral Alert roles; shared Dialog/AlertDialog motion and non-scaling Drawer/Sheet; immediately reusable nonmodal menus; tooltip fade/width reveal; unframed HoverCard content without nested tooltips; shared Input/TextField composition with pointer-only border-color focus; compact Menubar; message metadata alignment; primary ToggleGroup selection and active-value reset; initial DataTable auto-fit; table row/column striping; four chart types with pointer/focus values; selectable image/attachment aspect ratios; weighted wave progress with optional status and alternating orientation; circular-track/wavy-arc Spinner; Slider-shared snapping physics for Resizable; responsive Sidebar and operation Trace.

Current local evidence: all 155 unit/component tests pass across seven files; all 123 routes (58 original and 65 reference) load without page errors; all nine focused interaction groups pass; five wave/progress browser regressions pass in Chrome. Dialog center and non-scaling edge surfaces, selection reset and initial column sizing pass focused checks. Screenshots cover desktop light and narrow dark/Persian/reduced-motion layouts. Scoped ESLint and whitespace checks pass. Showcase/library production builds, library declarations and installed-package smoke pass: 60 checked exports, server render, optional icons/assets and 116 original default/size examples plus updated Progress API examples. The final incremental full TypeScript check passes after the tooltip/spacing follow-up; scoped lint and five design-policy tests pass. Both production builds pass after the tooltip suppression change.

The follow-up removes tooltip opening from focus events bubbling out of portaled menus and dismisses a trigger tooltip while its popup is expanded. Segmented progress uses a 2px gap and the wave begins at x=0. Filled segments retain their wave rather than flattening it. Focused verification is stored in menu-tooltip-progress.json.

These checks cover local Chrome automation; physical touch devices, Firefox, Safari and manual screen-reader acceptance were not run. The complete historical browser suite was not repeated. Vite retains its existing large-chunk warning. Working-tree changes are not published.

## 2026-11-03: remaining defaults, non-modal menus and immediate unblur

Read the owner's matching Chrome write-log record at sequence 21474, excluding the Stagger/layout entry. Preserved the selected configuration snapshot in reports/remaining-motion-2026-11-03/selected-settings.json. Added typed shared remaining presets for Dropdown, Notification stack, Drag & return and Text reveal in src/kit/motion-presets.ts. Moving selection continues to use the saved Button Press depth/radius defaults. Previously promoted Spring, Button, Accordion and Alert Dialog values still match the saved effective configuration. Stagger/layout's authored defaults and the owner's locally persisted Stagger adjustments are unchanged. Per the follow-up, notification entry uses a negative Y offset so new messages travel from above to their resting position and existing stack items move downward.

Both the playground Dropdown and the component catalogue now use the same exported Menu. It is non-modal, with controlled/uncontrolled open state and optional typed motionSettings. Motion owns entrance/exit, and closed exit surfaces cannot intercept pointer events. This removes modal body pointer suppression and scroll locking while retaining keyboard navigation and dismissal. The saved dropdown defaults enter at y -10px, scale 0.95 and blur 5px. Native notification entry also consumes the shared preset; its viewport is anchored at the top with newest notifications first so older items move downward. Stack measurement uses resting offsetHeight rather than animated bounds.

Stagger's filter transition explicitly starts with delay zero; item placement/opacity still follow the configured stagger. Focused Chrome checks passed for all remaining promoted preset values (including top-down notification direction), absence of Stagger in promoted defaults, retention of local Stagger adjustments, unchanged scrollbar width/body overflow and usable outside buttons while dismissing the menu, keyboard menu focus/Escape, blur clearing while a later row still waits to appear, and downward notification entry. The native notification page also passed single/stack entry checks and a top-anchored newest-first check. No sampled page errors. Results are in reports/remaining-motion-2026-11-03/result.json. Scoped ESLint and whitespace checks passed; no full release suites were run.

## 2026-11-03: selection press shape and mouse/touch dragging

The owner clarified that Moving selection should inherit Button Press & Ripple's depth and radius deformation, superseding the previous interpretation of shared Spring & Transform timing. Removed that timing link and restored the independent selection travel spring. The playground now uses exported Tabs and shares button press settings for depth, radius-depth ratio and press physics. Spring & Transform values remain independent, and the saved Alert Dialog defaults remain in place.

The shared Tabs component owns a persistent pill press value across active-tab changes. Pointer capture supports mouse/touch dragging across tabs, live selection follows enabled tab hit areas, release focuses the committed tab, and cancellation restores the selection at drag start. Vertical touch gestures release the selection drag; the shared tab list allows pan-y. Keyboard activation/arrow selection retain the same press/release feedback. Only the pill deforms, while labels and hit areas stay stable.

Scoped ESLint and whitespace checks passed. Focused Chrome checks measured pill scale near 0.92 with reduced radius while held, return to exact scale 1, keyboard press feedback, linked Button Press parameter changes without changing Spring & Transform, and reduced-motion operation. Native Chrome touch-event checks verified Persian RTL drag selection, cancellation restore, release settling, focus and narrow-screen overflow, alongside mouse drag with held deformation. Results are in reports/selection-press-2026-11-03/. These are emulated native browser touch events; no physical touchscreen test or full release suite was run.

## 2026-11-03: saved Alert Dialog and shared moving selection

Promoted the owner's latest saved Alert Dialog settings (matching Chrome write-log sequence 21430) to shared defaults: stiffness 500, damping 30, mass 1, initial scale 0.95 and fade duration 0.15s. Moving selection surfaces now share the owner's Spring & Transform duration-spring timing (0.5s, bounce 0.3, delay 0) through src/kit/selection-motion.ts. This applies to navigation indicators, ToggleGroup's moving selection surface and Tree's selected-row surface; arrow/branch expansion and press motion retain their own behavior. Selection destinations follow actual item geometry rather than inheriting the standalone transform demo's fixed 80px displacement.

The Moving selection playground reads and edits the Spring & Transform configuration live, with a visible linked-settings note, and reset targets that shared configuration. Its prior independent saved settings are left stored but no longer determine the preview. Scoped ESLint and whitespace checks passed. Focused Chrome verification confirmed exact saved dialog defaults, shared duration/bounce, visible pill overshoot followed by accurate landing, arrow-key selection, a timing edit reflected immediately in Spring & Transform, and Alert Dialog opening/Escape dismissal with no sampled runtime errors. Results are in reports/dialog-selection-2026-11-03/result.json. No full release suites were run.

## 2026-11-03: spring settling without long subpixel tails

Added shared unit-aware spring stopping thresholds in src/kit/spring-rest.ts: pixel channels stop within 0.2px with speed below 4px/s, normalized scale/opacity channels use 0.0005 and 0.01 units/s, and rotations use 0.1 degrees and 2 degrees/s. Progress channels convert the pixel budget by their visible extent. Applied this policy to shared press/geometry/size springs, fields, selections, tree expansion/rotation, Accordion, Alert Dialog, notifications, progress, and playground transitions. Moving frames remain unrounded; springs finish at the exact intended target. User stiffness, damping, mass, bounce, durations, and saved component adjustments are preserved. Clock-based duration springs retain their explicit timing; the rest thresholds principally govern physical springs.

The playground shows rest values in pixel units. Legacy saved default rest pairs (0.01 distance and 0.1 speed) migrate once to the new defaults; deliberate non-default values are retained. Mixed-property transitions use separate scale/angle tolerances to avoid premature large scale corrections.

Focused generator checks sampled at 120Hz and confirmed identical physical trajectories until the final bounded correction, exact endpoints, and shorter tails: selected button return 1042ms to 733ms, geometry resize 967ms to 442ms, representative height spring 992ms to 675ms. Results are in reports/spring-settling-2026-11-03/generator-results.json. The focused ten-example Chrome interaction check passed again, including persistence/export, native Accordion preview, keyboard/menu/dialog interactions and dark Persian narrow-screen reduced-motion rendering, with no sampled page errors. Scoped ESLint, the new helper's isolated TypeScript check, and whitespace checks passed. Full release/typecheck/build suites were not run. These measurements validate numerical settling and sampled browser behavior; final perceived rasterization varies with display/browser zoom.

## 2026-11-03: owner-selected motion defaults and closing/anchor fixes

Read the saved materialfluid.motion-playground.v1 entry for http://127.0.0.1:5173 from the active Chrome profile's latest matching LevelDB write-log record (sequence 21383). The selected three configurations are preserved in reports/motion-defaults-2026-11-03/selected-settings.json. Promoted Spring & Transform to duration spring 0.5s, bounce 0.3, x 80px, y 0px, scale 1.15, rotation 0; button settings to color 330ms, resize damping 30, press depth 8%, stiffness 700, damping 20, mass 1.5, radius-depth ratio 4, with the saved ripple settings unchanged; Accordion to stiffness 500, damping 30, mass 1.5, preview 10px, reveal blur 5px and reveal duration 0.2s. Shared exports now supply playground/reset defaults and actual button/Accordion behavior. Alert Dialog retains its separate existing physics defaults.

Accordion's spring previously emitted negative CSS heights, which the browser rejected, retaining a positive height for about 200ms before jumping to the next valid value. The shared component now observes intrinsic content height and animates a numeric custom property; CSS max clamps the painted height to zero while the spring continues. This preserves the configured physics and interrupted motion, with no fade during closing and an empty hold preview. Alert Dialog uses independent translate before scale, with a centered origin, removing the scale-dependent displacement caused by a centering transform applied after scale.

Scoped ESLint passed. Focused Chrome checks compared all exposed promoted defaults against the actual saved values, verified the native component's empty 10px preview, traced closing frame by frame including negative spring values painted at exactly zero, and sampled centered dialog entrance frames at 1280x900 and 390x850 with an exaggerated 0.5 starting scale. No sampled browser errors. Trace data are in reports/motion-defaults-2026-11-03/result.json. Full release/build/typecheck suites were not run.

## 2026-11-03: motion playground

Added #/motion and a sidebar link without adding to or changing the original 58-entry component catalogue. Ten studies cover spring transforms, original button press/ripple, original Accordion, original Alert Dialog, shared selection, dropdown menus, stagger/layout lists, notification stacks, drag/return, and text reveal. Each example has separate live numeric/slider settings, applicable physics/timing engines, presets, reset/replay, local persistence, configuration copy, and JSON export. Accordion and AlertDialog expose optional typed motionSettings; omitted values preserve existing defaults. The remaining studies are showcase compositions, not additional kit roots. Example coverage references https://motion.dev/examples rather than copying its paid implementations.

Scoped ESLint passed. Focused Chrome checks passed for all ten example routes/selections, the unchanged 58 original navigation entries, an adjusted 16px empty Accordion hold preview, tween controls, Alert Dialog Escape dismissal, selection arrow keys, menu actions, list add/remove/reverse, notifications, keyboard drag controls, per-example persistence/reload, configuration view/export, and dark Persian narrow-screen rendering with system reduced motion and no page overflow. No sampled runtime errors. Captures and result JSON are in reports/motion-playground-2026-11-03/. Initial inspection found numeric fields too narrow for NumberField's stepper; using exported TextField with native number input and sufficient width fixed direct numeric entry. Full release/typecheck/build suites were not run, honoring the request to limit checks. This is not a release-validation claim.

## 2026-11-03: Accordion and alert motion

Accordion now uses spring height expansion, a short content blur/opacity reveal, and an 8px hold preview. Per the owner's follow-up, the title/trigger stays stationary without button press scaling. Closed content is inert and hidden from accessibility navigation. Alert Dialog has a spring scale entrance that preserves its centering transform. Alerts use paired miscellaneous blue/green/rose roles, inherited icon ink, and no glow or flashing animations.

Focused Chrome check (`.cache/check-spring-alert.mjs`) passed in light/expressive and dark/reduced-motion settings: hold preview measured 8.08px and 0px respectively; expansion, settled blur, Space toggling, closed-content inertness, centered Alert Dialog, Escape dismissal, and matching alert text/icon colors without shadows or pseudo-element glow. No sampled browser errors. Scoped ESLint and whitespace checks passed. Full typecheck, build and release suites were intentionally not run, per the owner's request to keep checks limited.

## 2026-11-03: additive shadcn collection

The original 58-entry catalogue and original control implementations remain unchanged. Added one separately expandable Tree branch and #/shadcn routes for the 66 entries at https://ui.shadcn.com/docs/components, checked on this date. The comparison maps 36 existing components and 30 new patterns. New compositions are exported through the Shadcn namespace; original public APIs, geometry, palette and animations are retained.

Scoped ESLint and whitespace checks pass. One focused browser pass verified the original 58 navigation links, the new branch and comparison table, rendering of all 66 reference pages, Command keyboard selection, Context Menu right-click/action, Resizable keyboard resizing, Questionnaire submission, Carousel advancement, mobile Persian navigation, reduced-motion mobile rendering and absence of sampled runtime errors. Initial inspection captures and the result JSON are under reports/shadcn-collection-2026-11-03/. The visual pass prompted an RTL counter isolation correction and simpler generated usage snippets.

Per the owner's request to avoid excessive checks, no full release build, full typecheck, unit suite or complete historical browser suite was run for this addition. This is component-pattern coverage using MaterialFluid props, not every upstream variant or drop-in API compatibility; Chart currently provides a native column chart rather than Recharts. The exhaustive coverage table is in reports/shadcn-collection-2026-11-03/COMPARISON.md and on the collection overview.

## Historical baseline: 2026-10-30

Verified on 2026-10-30 on Linux with Node.js 26.12.1, npm 12.2.1, Chromium through Playwright, and the repository lockfile. Package version remains 0.11.0; these working-tree changes have not been published.

## Automated checks

- Strict TypeScript, ESLint, showcase/library production builds, declarations and asset copying pass.
- All 155 unit/component tests pass across seven files.
- All 121 browser scenarios pass across the final full sweep and focused reruns. The sweep passed 120; the narrow RTL Progress check was updated to wait for the existing responsive button spring to settle, and all five Progress/Spinner checks passed in the focused rerun. The earlier selection-control resize-centering defect was fixed in the shared grid layout and passes in both languages. The previously intermittent continuous-slider scenario passed in the final sweep.
- Browser coverage includes all 58 component pages, keyboard/touch interaction, English/Persian, mobile viewports, reduced motion, connected options expansion, press/radius animation, passive labels, Tree icon modes, shared concentric frame radii, Switch color pairs, circular field icon actions, and centered AM/PM controls in both directions, shared size transitions and interruption, variable calendar week counts, connected date ranges, wavy indicators, and segmented/status-row Progress presentations.
- The earlier default-theme automated color-contrast scans found no violations across all 58 routes in the default light theme and all 58 routes in the default dark theme. Miscellaneous identity/status color pairs meet 4.5:1 in both themes in unit checks.
- A narrow-screen sweep covered all 58 pages in both themes and both languages at 390px: no runtime errors or document overflow. Tabs and pagination intentionally retain internal horizontal scrolling for controls that exceed the available width.
- The packed library installs into a separate consumer fixture. Its 60 checked public exports, server rendering, complete optional icon pack, icon registration, fonts and styles pass smoke checks. All 58 default and 58 size examples, plus the new Progress presentation APIs and FileInput size restriction, typecheck against the installed package.

## Design verification

The shared component policy is documented in COMPONENT_POLICY.md. Controls retain press/radius animation; framed surfaces add their real inset and border to the inner control radius. Icon actions begin circular at their actual diameter. The showcase uses a continuous dotted canvas with a solid, divided variant header. Tree navigation and nested contents share library rendering, neutral text, and optional icons without empty slots. Tonal Spot is the sole scheme; identity/status colors are independent of the seed. Toasts use the shared raised surface.

The time-picker period group is visually centered and its bounding-box center differs from the popover center by less than 1px in English and Persian browser checks.

## Boundaries

These results establish local automated behavior and viewport checks, not physical-device, Safari, Firefox or manual screen-reader acceptance. Automated contrast and accessibility checks do not certify WCAG conformance; custom palette adjustments and untested interaction states need their own review.

Vite reports large-chunk warnings for the main showcase and optional full icon catalogue. The full icon pack remains a separate, lazy-loaded asset. The showcase uses local font/icon assets and illustrative data, with no account or backend. The FileInput example explicitly requires the consumer's own upload endpoint.

## Follow-up component work

All supported size variants share the Button sizing spring, including Spinner and explicit icon dimensions. FileInput exposes only Small and Medium, with inherited unsupported sizes normalized to Medium. Calendar arrows and caption buttons share their size and header alignment, month precedes year, entirely empty weeks are omitted, and date-range selection paints one continuous band. Progress supports Wave, Segmented and With status; the Wave uses the supplied 60/20/31/5/20 tailward incremental configuration. This reference style applies to Progress only. Spinner and loading buttons reuse a circular wave. Visual checks cover all three Progress presentations in light/dark; browser checks cover English/Persian and narrow layouts.


## Shadcn Impeccable review - 2026-11-04

- Reviewed all 65 additive collection entries; all 58 original catalogue entries remain. Per-component variant decisions and limitations: [review](reports/shadcn-review-2026-11-04/REVIEW.md).
- Before/after default-state audits each covered 130 route visits: desktop light/English and narrow dark/Persian, the latter with reduced motion. No page errors, document overflow or axe A/AA violations were detected within live examples. This is a paired configuration matrix, not every possible theme/locale/state combination.
- Focused variant checks passed for Accordion independent sections; Field external naming; Item muted surface; horizontal/both-axis scrolling; CodeBlock raw-source copying; vertical Resizable pointer snaps and keys; vertical Separator; vertical Carousel dragging after the preceding Select finishes closing; original Button appearance/size; vertical Tabs keyboard navigation; DateRangePicker; and 6/8px notification dots. The route sweeps preceded the final Badge/Tabs/DateRangePicker examples; those have focused coverage.
- The complete unit suite passed 159 tests across eight files before the final Trace follow-up. The changed variant suite then passed all five tests, including the added Trace regression for independent Accordion triggers and non-expandable waiting steps.
- Trace browser follow-up passed in desktop light/English and narrow dark/Persian: original Accordion spring/hidden-content hold preview, independent rows, exact final closed height, no ripple, meaningful diagnostic output, visibly distinct Timeline/Compact layouts and no focused axe violations. Evidence: reports/shadcn-review-2026-11-04/trace.json and locale-specific screenshots.
- Typecheck and targeted ESLint passed. Showcase/library production builds passed before the Trace follow-up. Installed-package smoke passed public exports, server rendering, the optional icon pack/assets, all 116 original usage examples and all 34 generated shadcn examples. An initial incremental declaration build failed because Vite cleaned unchanged declaration files; regenerating the complete declarations resolved it. The final Trace showcase/library builds, complete declaration emission, asset copying, targeted lint and interaction tests also pass. The installed-package smoke preceded the internal Trace follow-up; its public API was unchanged.
- Existing large showcase/full-icon chunk warnings remain. Physical device, Safari/Firefox, screen-reader, custom palette and exhaustive open/error/loading-state acceptance are not established by these checks.


## Neutral + seed and readability - 2026-11-04

The showcase now defaults to Neutral + seed, with independently persisted surface tint and accent strength and high-lightness primary fills in both themes. The library provider retains its standard default and exposes the new preset explicitly. Original/Previous palettes remain available.

- 123 component routes (58 original, 65 shadcn), each scanned in light/dark desktop English and narrow Persian: 492 default full-page contrast scans, plus 79 successful opened-state scans. No document overflow. Five opening attempts timed out under parallel load.
- Fixed the only two text-contrast defects found: Calendar selected dates inherited Ghost text instead of their paired fill foreground in dark mode; Carousel slide numerals used a pale fill token instead of readable accent ink in light mode.
- All 21 focused confirmations passed, including failed contrast configurations, timed-out opening attempts, and original/shared date and date-range popups. No remaining axe text-contrast violations in those checked states.
- Six-seed palette matrix covers both modes and tint/strength extremes (96 palettes), with high-lightness primary fills, 7:1 primary/text and neutral text/ink pairs, and 3:1 functional outlines. Palette/preference/core tests passed 98 tests; the three palette tests passed again after the final seed-chroma refinement.
- TypeScript, targeted ESLint, final showcase/library builds, declarations, assets and installed-package smoke passed. Consumer checks include all 116 original and 34 shadcn examples plus the new neutral provider API. Existing large-chunk warnings remain.

Evidence and precise limits: [readability review](reports/neutral-seed-2026-11-04/REVIEW.md), readability.json and readability-confirmation.json. This is automated rendered text/token verification, not exhaustive variant/custom-content/non-text contrast or manual accessibility acceptance.

## Single component catalogue - 2026-11-08

The active showcase contains 45 components in one ordered Tree: Actions (7), Selection & input (9), Navigation (9), Containment (12), Communication (8). Both previous lists are removed from navigation. Search, counts, breadcrumbs and previous/next links use this catalogue. Existing package exports and direct component routes remain available for compatibility. The color system, typography and authored motion remain in place.

- Final `npm run build` passed typecheck, showcase and library production builds, complete declarations and asset copying. Existing large showcase/full-icon chunk warnings remain.
- `npm run lint` passed; the later test-only address correction also passed targeted ESLint.
- `npm test`: 163 tests passed across nine files, including the exact ordered 45-entry catalogue assertion.
- Production-preview browser regressions in installed Microsoft Edge: 15 of 16 passed in the main run; the remaining local-font/external-request test passed separately after replacing its hard-coded development port with Playwright's configured base URL. All 16 targeted checks now pass. The initial development-server run was affected by live reloads; final acceptance uses the fixed production build at port 5174. Bundled Playwright Chromium was unavailable, so installed Edge was used.
- All 45 visible component pages rendered without runtime errors. New component pages were checked in desktop English/light and Persian/dark, and 390px English/dark and Persian/light with reduced motion: no document overflow or page errors. Focused axe A/AA checks on the new Chips documentation passed in all four configurations. The representative-page audit also passed A/AA checks, including text contrast, local fonts and absence of external network requests.
- New interaction coverage passed for primary/alternative split actions, FAB menu callbacks, independently selected chips via pointer/keyboard, toolbar arrow-key focus, carousel advance, and SideSheet Escape/focus restoration. Existing dialog focus trapping, bilingual search/persistence, fields/date selection, touch/RTL behavior and connected option surfaces also passed.
- Fixed the shared documentation properties region to support keyboard scrolling on narrow screens. New component property tables describe their actual APIs rather than inheriting generic action variants.
- Installed-package smoke passed 74 public exports, server rendering, optional icon registration/assets, all 45 default and 45 appearance examples, 34 compatibility composition examples, and the existing presentation/size-policy checks.
- Impeccable detector completed. Its only advisory flagged the Toolbar's calculated 9px radius inset; this is the documented 8px padding plus 1px border required for concentric curves. Toolbar uses the shared size-dependent radius token.
- `git diff --check` passed.

Visual evidence: [catalogue captures](reports/catalogue-2026-11-08/REVIEW.md). This is a targeted automated regression pass, not the entire browser suite. It does not establish physical-device, Safari/Firefox, manual screen-reader or exhaustive custom-content/open-state acceptance.

## Fixed button content during press - 2026-11-08

Button and IconButton now retain text/icon size and position while their surfaces compress and corners/ripples animate. One shared content layer cancels the outer press scale on each frame; leading/trailing content and loading indicators use that layer too. Intrinsic sizing removes the compensation from its unpressed measurement probe. Existing icon-size selectors follow the new content layer. Explicit size changes still use the authored Small/Medium/Large geometry.

- 163 unit tests passed across nine files.
- All 15 targeted browser motion checks passed in installed Microsoft Edge: four new configuration tests (each checks Button and IconButton), plus all 11 existing button-press regressions. The new tests measure rendered content width, height and center on each frame across press/hold/release, within 0.6 CSS px, while confirming that the outer surface actually scales. They also check the final Small size.
- Configurations: desktop English/light and Persian/dark, narrow English/dark and Persian/light. Existing checks cover rapid clicks, size springs, temporary tuning/reset, keyboard activation, actual CDP touch holds, Minimal/reduced motion, hover color behavior and ripple completion.
- Older press assertions were aligned with the current provider defaults (8% press depth, configured radius ratio and underdamped size spring); the source spring settings were not changed. The first new test attempt selected a decorative field-adornment span; its locator was corrected to target the actual example buttons before the passing run.
- Full ESLint passed; targeted lint also passed after the test updates. Final `npm run build` passed typecheck, showcase/library bundles, complete declaration generation and asset copying. Existing large-bundle warnings remain. Installed-package smoke passed 74 exports, server rendering, the optional icon pack/assets, all 45 default and 45 appearance examples, 34 compatibility composition examples, and presentation/size-policy checks.
- The Impeccable detector ran over the changed shared sources. It reported existing palette/type/radius advisories outside the changed behavior; this change adds no new palette, typography or radius values.
- Visual evidence: [button content captures](reports/button-content-2026-11-08/REVIEW.md), plus held-button captures under .impeccable/review/.

These are targeted automated and rendered checks; physical-device, Safari/Firefox and manual screen-reader acceptance are not established by this pass.

## Button configuration and additive APIs — 2026-11-08

Button now includes Example Presets, Appearance, Content and Behavior configuration with synchronized Web Components/React recipes. The optional icon picker searches all 4,322 icons on demand. Shared APIs add XS/XL, icon placement/dimensions, toggle selection, active state, loading text and determinate/indeterminate progress. The optional `materialfluid/elements` entry supplies a real Button custom element backed by the shared component. Square and Elevated are excluded; Elevated is excluded across the system.

- All 169 unit tests passed across ten files. The six new tests passed again after the final quoted-string generation fix.
- All 20 production-preview browser regressions passed in installed Microsoft Edge, covering new configuration behavior and the existing content/press/resize/keyboard/touch/motion checks. The source-served Web Component regression also passed selection, focus/blur, loading/restoration, progress, native submit/reset, icon-only accessibility and reconnect behavior. All six new browser tests passed together.
- Four paired configurations passed scoped axe A/AA, runtime-error and overflow checks: desktop English/light and Persian/dark, narrow English/dark and Persian/light with reduced motion. Full-page captures were visually reviewed.
- `npm run build` passed typecheck, showcase/library bundles, complete declarations and assets. Full lint passed, with targeted lint after the final test/model changes. `git diff --check` passed. Existing large showcase/full-icon chunk warnings remain.
- Installed-package smoke passed 76 exports, server rendering, server-safe optional elements entry imports, icon registration/assets, 45 default and 45 appearance examples, 17 new Button React examples, an element API type fixture, 34 compatibility examples and existing presentation/size-policy checks. Matching Web Component HTML recipes were generated; their adapter is browser-tested rather than treating HTML as TypeScript.
- Impeccable detector returned no findings for the new configuration sources and adapter.

Feature coverage, captures and limits: [Button additions review](reports/button-additions-2026-11-08/REVIEW.md). These checks establish targeted local behavior; they do not establish physical-device, Safari/Firefox, manual screen-reader or exhaustive custom-palette acceptance. The Web Component adapter currently covers Button and retains React/React DOM package peers.

## Fixed component defaults — 2026-11-08

Independent Button icon sizing, Ripple configuration and component Advanced panels are removed. Button motion props, provider buttonMotion/textMorph overrides, icon/switch timing knobs and component motionSettings props are removed from public types and examples. Authored default values and animations remain. Private composition rules preserve existing component behavior, and the separate Motion playground retains isolated experiments. Active keeps the hover background visible.

- Final 169 unit tests passed across ten files. All 21 targeted Button browser tests passed, plus the corrected production no-Advanced route check.
- Eight production configuration/calendar checks passed. Additional passing checks cover all 45 rendered routes, Dialog focus handling, opaque Toggle/FAB text morphs, icon-gallery search/Persian mobile, connection switches, dense playground sliders and isolated Button/Accordion/Dialog/Menu experiments returning to unchanged component defaults.
- Four paired configurations passed scoped axe A/AA, overflow and page-error checks: desktop English/light and Persian/dark, narrow English/dark and Persian/light. Captures were visually reviewed.
- Production build, full lint, final targeted lint and diff checks passed. Installed-package smoke passed 76 exports, server rendering, optional element imports/assets/icons, all catalogue/compatibility examples, 17 Button recipes and explicit type-rejection checks for removed APIs. Existing large-bundle warnings remain.
- Three stale calendar tests were corrected to inspect the visible current header and half-diameter endpoint radii; source calendar geometry was preserved. The detector returned no findings for the new configuration/private-context sources.

Evidence, exact scope and remaining acceptance limits: [fixed defaults review](reports/button-defaults-2026-11-08/REVIEW.md). Final documentation edits followed the successful package smoke without changes to application or declaration builds.

## Configuration and Documentation tabs — 2026-11-08

Catalogue pages now default to Configuration, containing the live preview and controls. Usage code, React/Web Components recipes, API tables, behavior notes, documentation navigation and previous/next links live in Documentation. Changing views retains the Button configuration; changing routes returns to Configuration. Enabled Button and IconButton use the Active background on keyboard-visible focus, with the existing focus ring and independent toggle selection.

- All 169 unit tests passed. Full lint, final targeted lint and diff checks passed. Typecheck, production showcase/library builds, declarations and assets passed; final CSS-only nesting fixes were bundled again while retaining completed declarations.
- All 11 final production-preview Edge checks passed: four paired Configuration/Documentation matrices, keyboard focus/blur with Active styling, nested Tabs independence, four Button/IconButton fixed-content press matrices, and rendering all 45 catalogue pages and their documentation examples.
- Existing additive Button checks passed state preservation and both framework recipes in their new Documentation location; the Web Component adapter and four configuration matrices passed. Shared navigation integration and compact nested Tabs geometry passed.
- A narrow dark axe scan exposed a Tabs color rule that leaked into the nested React/Web Components ToggleGroup. The shared selector now targets the tab indicator directly, and direct tab-list sizing preserves nested component geometry. All four paired configurations then passed scoped axe A/AA checks in both views, overflow checks and page-error checks. Captures were visually reviewed.
- Installed-package smoke passed 76 exports/server rendering, optional elements import, icons/assets, all 45 default and 45 appearance examples, 17 Button examples, 34 compatibility examples and existing presentation/size/API-removal fixtures. Report/validation prose followed that smoke without changing application or declaration builds.
- The Impeccable detector reported zero primary findings and 49 advisories in existing appearance.css easing/radius/type rules outside this change. Authored defaults were preserved. Existing large-bundle warnings remain.

Evidence and limits: [Configuration/Documentation review](reports/component-views-2026-11-08/REVIEW.md). This pass establishes targeted local behavior, not physical-device, Safari/Firefox, manual screen-reader, exhaustive custom-palette or full-browser-suite acceptance. Motion supplies authored animation; CSS supplies styling and simple transitions/keyframes; GSAP is not used.

## Owner-preserving foundation adaptation — 2026-11-08

A verified 536-file source/design backup precedes the foundation changes. Selected MIT foundation source from Grenish/expressive is adapted into the exported Foundations namespace and integrated with the existing provider. Six foundation pages cover color, typography, shape, motion, interaction and accessibility. Owner fonts, existing component metrics, 14/24/29px radii, flat surfaces, color behavior and authored springs remain. Component migration is deferred.

- 174 unit tests across 11 files passed, including exact comparison of 24 saved default color token maps, nine algorithms, shape utilities, owner springs and scoped CSS output.
- Full lint, typecheck, showcase/library production builds, declarations, assets and diff checks passed. Existing large-bundle warnings remain. The final preview-frame CSS adjustment was bundled again.
- All 15 targeted production-preview Edge checks passed, including all 45 catalogue routes, four paired foundation matrices with 40 scoped axe A/AA scans, persisted algorithms, typography/shape controls, live announcements, dialog focus, keyboard Active styling, fixed button content, interrupted morphs, forced colors and reduced motion changed during animation.
- Installed-package smoke passed 77 exports/server rendering, foundation utilities, optional elements/icon assets, 45 default and 45 size examples, 17 Button and 34 compatibility examples, plus installed foundation/API policy type fixtures.
- Desktop and narrow rendered captures were inspected. Impeccable reported zero primary findings and eight advisories; the new preview frame now uses its actual padding/border inset, while existing authored motion-page choices remain.

Source, backup hash, coverage and limits: [foundation review](reports/foundations-2026-11-08/REVIEW.md). This is targeted local validation, not full-browser-suite, physical-device, Safari/Firefox, manual screen-reader or exhaustive custom-palette acceptance.

## Selected algorithms on Neutral + seed components — 2026-11-08

Fixed the shared Neutral + seed engine overriding every selected algorithm with a seed-only accent palette. Non-default algorithms now supply primary, secondary, tertiary and neutral hue/chroma families before the owner's tone-86 fill, paired ink, chroma cap, accent-strength and surface-tint rules. Tonal Spot retains the exact authored default. All component roles and their palette aliases update together; the separate Previous engine and independent semantic status colors remain unchanged.

- 175 unit tests passed across 11 files, including all 24 saved default token maps and new all-nine-algorithm checks across two seeds, both themes and accent-strength extremes. Paired fills/plain ink retain at least 7:1 contrast on the tested neutral surfaces.
- Four browser regressions passed in installed Edge using the actual algorithm selector, navigation to Button, rendered fill comparison and reload persistence. Desktop English/light and Persian/dark, and narrow English/dark and Persian/light passed scoped axe A/AA checks. Untinted neutral canvases remained unchanged. Captures are under reports/foundations-2026-11-08/algorithm-button-*.png; desktop paired captures were inspected.
- The first new unit run exposed an overly broad test assertion: distinct algorithms can legitimately share a primary after chroma capping. The regression now checks changed accent families without requiring every individual primary to differ. All final unit checks pass.
- All five final production-preview Edge checks passed: the four new algorithm/persistence/contrast matrices and rendering all 45 catalogue pages without runtime errors or overflow. Full ESLint and diff checks passed.
- Typecheck, production showcase/library builds, complete declarations and assets passed. Installed-package smoke passed 77 exports/server rendering, foundation utilities, optional elements/icon assets and all consumer example/API-policy type fixtures. Existing large-bundle warnings remain.

This fixes the shared library theme boundary rather than adding component-specific overrides. Automated checks do not establish manual screen-reader, physical-device or exhaustive custom-seed acceptance.

## Hue selection matching the default profile — 2026-11-09

The shared accent picker previously displayed the original gold as 48° but generated every manual selection at 100% HSV saturation/brightness. The original #eedd96 is approximately 48.409° / 36.975% / 93.333%, so selecting 48° produced a different seed and scheme. Hue selection now retains the original gold's saturation/brightness for every hue. The rounded 48° position preserves the original fractional hue and restores the exact seed and complete theme.

- All 175 unit tests across 11 files passed, including all 360 hue positions, fixed saturation/brightness, exact original restoration, wrapped hue values and the existing 24 default token-map snapshots. Full lint and diff checks passed.
- All six selected production-preview Edge regressions passed: four new hue/profile round-trip matrices, the existing settings persistence/reset regression and all 45 catalogue routes. The new tests select 120° and manually return to 48°, compare all inline theme variables and actual Button fill/ink with the original, and verify reload persistence. Scoped axe A/AA checks pass for the changed-hue Button in desktop English/light and Persian/dark, and narrow English/dark and Persian/light. All four Color views have no document overflow.
- Rendered desktop English/light and narrow Persian/light captures were inspected. The updated helper text describes the retained profile in both languages. Existing custom saved seeds are retained until the user changes or resets the hue.
- Full build passed typecheck, showcase/library bundles, declarations and asset copying. Installed-package smoke passed 77 exports/server rendering, foundation utilities, optional elements/icon assets and consumer example/API-policy fixtures. Existing large-bundle warnings remain. The temporary browser preview server required elevated cleanup after all cases passed; Playwright then exited successfully with six passing tests.

Evidence and limits: [hue profile review](reports/seed-hue-2026-11-09/REVIEW.md). Fixed HSV saturation/brightness does not assert equal perceptual colorfulness; the selected Material algorithm still generates the final component colors. Physical-device, Safari/Firefox, manual screen-reader and exhaustive custom-palette acceptance remain unverified.

## Foundation workbenches and Button follow-up — 2026-11-09

Completed grouped foundation controls, semantic typography formatting and examples, continuous Shape morphs, synchronized finite-curve playback, working accessibility presets and shared Dialog content focus. Interaction is removed from navigation. The owner-requested curves now finish after two endpoint crossings, three for Press; typography metrics ease without springs. The motion sample has a compact filled chip, with original curve geometry retained and RTL timestamps corrected.

Fixed parameter-update latency in shared Button measurement hooks: unchanged parent renders no longer clone each Button for color/geometry measurement. Built-in Shape points are generated offline and interrupted morphs reuse visible points. Dedicated browser regressions assert bounded clone counts and no interaction-time SVG sampling. Observed production startup changed approximately 89→25 ms for Button, 170→21 ms for Shape, 47→15 ms for type; these are local observations, not guarantees under competing CPU work.

Only Tonal, Outlined and Ghost/Text Buttons now toggle. Off retains its own treatment; On uses paired Primary fill/ink. Filled/Danger ignore toggle behavior, and incompatible showcase changes clear selection. Both code formats normalize unsupported combinations. Progress now shares icon size tokens (14/16/22/24/32 px), centers its SVG and respects start/end positioning in LTR/RTL.

- Final unit run: 177 tests across 11 files passed with one worker and a 20-second timeout. A concurrent initial run hit three default 5-second timeouts; the complete rerun passed.
- All nine foundation-workbench tests passed after the measurement fix, including paired light/dark, English/Persian, desktop/narrow axe/overflow matrices; typography formats and semantic presets; Shape intermediate frames/selection; Dialog traversal and validation/status behavior; timeline playback/seek/reduced motion; and actual finite crossing counts on Button motion.
- All seven dedicated toggle-color/latency tests passed, including four paired color matrices and three measurement regressions.
- All 15 final Button press/progress tests passed: eleven motion/keyboard/touch checks and four progress matrices covering 80 size/mode/position combinations.
- An isolated size-motion regression passed across ten component families. The live development-server Web Component test passed selection events, loading/progress, focus, submit/reset and reconnect behavior. Earlier targeted production checks passed all 45 routes and four fixed-content matrices.
- Full ESLint and subsequent targeted ESLint passed. Final root typecheck, production showcase/library builds, 68 declaration files and packaged font/assets passed. Final CSS was rebundled while preserving the completed current declarations. Existing large optional-icon/application chunk warnings remain.
- Desktop/narrow captures of typography, motion and dialog were reviewed; narrow Persian RTL timestamps and XL progress were confirmed after fixes. The temporary test preview was stopped without stopping the existing development server.

Evidence and limits: reports/foundation-workbenches-2026-11-09/REVIEW.md. An earlier broader run's TOC scroll-position assertion remains outside these passing targeted checks; this does not establish full-browser-suite, physical-device, Safari/Firefox, manual screen-reader or exhaustive custom-palette acceptance.

Installed-package smoke passed after the final changes: 77 exports and server rendering, foundation utilities/35 shapes, safe optional Web Component import, full optional icon registration, package assets, all 45 default and 45 size examples, 17 additive Button React examples and 34 compatibility examples, plus presentation/size/API-policy type fixtures. The first smoke exposed an extensionless runtime import in the Node-executed showcase recipe model; the explicit .ts import fixes it, and the complete rerun passed.

## 0.2.0 complete overhaul and folder cleanup, 2026-11-09

The release audit removed 314 residual targets (13,048 files, 202.75 MiB) plus 17.68 MiB of unreferenced npm cache blobs. Active compatibility exports, regeneration assets and the verified pre-foundation backup were retained. Package metadata is 0.2.0 as requested.

Root typecheck, full lint and production showcase/library builds passed. The initial full 185-case browser run passed 163 and failed 22; all 22 failures subsequently passed targeted follow-up checks after shared field geometry, pagination and expanded-focus border fixes and updated assertions for approved showcase behavior. These results combine the broad run with reruns; they are not one final uninterrupted green run. All seven final options-expansion cases passed. The seven IconButton additions cover paired locale/theme/viewport matrices, axe, nullable selected icons, reversible fill animation, full icon choices, native forms and optional Web Component API behavior.

The final unit rerun passed all 185 tests across 12 files. A clean declaration emission produced 69 declaration files. Installed-package smoke passed again against those final outputs, including all 26 IconButton consumer examples. The final production pagination and expanded-combobox checks also passed. Full details, evidence and limits: reports/release-0.2.0/REVIEW.md and reports/icon-button-2026-11-09/REVIEW.md.
