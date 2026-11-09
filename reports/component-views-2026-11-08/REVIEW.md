# Configuration and Documentation — 2026-11-08

All catalogue pages now use the exported Tabs component to separate Configuration from Documentation. Configuration is the initial view and contains the preview and configuration controls. Documentation contains usage code, React/Web Components recipes, API tables, behavior notes, in-page navigation and previous/next links. The catalogue ordinal and Button preview footer caption are removed. Configuration values and the code framework remain owned by the page, so switching tabs retains them. Changing component routes resets the active view to Configuration.

Enabled Button and IconButton use the Active background while matching `:focus-visible`. The existing focus ring remains; keyboard focus does not mutate toggle selection. Explicit Active continues to work. This shared CSS state needs no extra public prop or focus state. Motion (`motion/react`) drives the authored springs, ripple and content compensation. CSS supplies styling and simple transitions/keyframes. GSAP is not a dependency.

The structure follows the [reference Button page](https://md3.io/components/button/): preview followed by Configuration with Example Presets, Appearance, Content and Behavior. MaterialFluid retains its own identity and the explicitly requested exclusions and fixed defaults.

## Shared nesting fix

Putting the code selector inside exported Tabs exposed an overly broad Material color rule: it recolored a nested ToggleGroup indicator with a dark container while retaining its dark primary-fill text. The Tabs color rule now targets its own direct indicator. Tab-list sizing and surfaces also target their direct list, preserving nested tab geometry. This is a shared component fix, without a documentation-specific palette override. A real narrow dark capture/axe scan found the defect; all four paired configurations passed after correction.

## Evidence

- Unit suite: 169 tests across ten files passed.
- New source-served component-view checks passed keyboard navigation between views in English/Persian, scoped axe A/AA checks for both views, no document overflow or page errors, absence of documentation on Configuration, and keyboard-focused Button/IconButton backgrounds matching explicit Active. An initial focus locator matched a decorative field-adornment span and was corrected to target actual buttons.
- Existing additive Button checks passed the new Documentation tab location for both frameworks and verified that selected/custom text/icon state persists on returning to Configuration. The Web Component adapter and four configuration matrices also passed.
- Nested component Tabs selection passed pointer and keyboard interaction independently of the outer catalogue view tabs. Existing compact nested Tabs geometry and the shared-navigation integration check passed after moving documentation navigation behind its tab.
- Full lint and final targeted lint passed; `git diff --check` passed. Typecheck, production showcase/library builds, declarations and copied assets passed. Final CSS-only nesting changes were bundled again without deleting completed declarations. Existing large showcase/full-icon bundle warnings remain.
- All 11 final production-preview checks passed: four view matrices, keyboard Active appearance, nested Tabs, four fixed-content press matrices and a sweep of all 45 catalogue pages (including opening each Documentation tab and checking its usage code).
- Installed-package smoke passed 76 exports/server rendering, optional elements import, icons/assets, 45 default and 45 appearance examples, 17 Button examples, 34 compatibility examples and the existing size/presentation/API-removal fixtures. Final report/validation prose followed that smoke without changing application or declaration builds.
- Impeccable detector: zero primary findings. Its 49 advisories are in pre-existing portions of appearance.css (authored easing, radii, typography); these are outside this change and the owner's chosen defaults remain.

## Captures

Eight captures cover Configuration and Documentation in desktop English/light and Persian/dark, and 390px English/dark and Persian/light. Desktop English and both narrow views were visually inspected in the bounded review pass. Screenshot names identify the view, locale and width.

## Limits

These are targeted local automated/rendered checks. Physical devices, Safari/Firefox, manual screen readers, every custom palette and the complete browser suite are outside this pass. The showcase split does not add per-component configuration controls to families whose dedicated reference implementation has not yet been requested.
