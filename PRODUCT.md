# MaterialFluid

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, TypeScript, Vite. Confirmed in the 51-question design interview.

## Users

External developers building general web applications on desktop and touch devices.

## Product Purpose

A reusable component kit and dedicated-page bilingual showcase. The active catalogue has 45 components in five groups: Actions, Selection & input, Navigation, Containment and Communication. Success means coherent visuals, usable component APIs, working keyboard/touch interactions, and package-ready distribution.

The owner replaced both previous navigation lists on 2026-11-08. Only the active catalogue appears in navigation, search, counts and previous/next links. Existing package APIs and direct component routes remain compatible. The catalogue changes names and grouping; it retains MaterialFluid's palette, typography, geometry and authored motion.

The separate #/motion playground provides ten interactive motion studies with live parameters, individual saved settings, presets, replay, and configuration export. Experiments remain local to that page; they do not overwrite kit defaults or the original catalogue.

## Capabilities and Constraints

English/Persian and LTR/RTL; Gregorian/Persian calendars; sortable, filterable, paginated, selectable tables. No accounts or backend. Initial release excludes example websites, charts, rich text and complex upload engines. All dependencies must permit free redistribution. Source and package delivery; the owner has authorized a public GitHub 0.2.0 complete-overhaul release.

## Brand Commitments

MaterialFluid. Material-inspired custom fluid identity. Gold seed #EEDD96. Rounded flat/outlined surfaces, no shadows; selective active/success glow. Nunito Latin, Vazirmatn RD Persian, JetBrains Mono code. Google Material Symbols Rounded Filled, with custom staged Wi-Fi/Bluetooth stroke animations from the earlier Forma toggles. Fluid selection indicators and expanding surfaces, soft controlled spring. Expressive/minimal motion with system reduced-motion respected. Code-first workflow explicitly chosen.

Every visible surface and control must remain smooth and rounded, including keyboard focus rings, accessibility-related controls, calendar ranges, table headers and scrollbars. Windows launcher prints a clickable local IP/port URL and opens only the default browser. Browser closure leaves the server running; closing the terminal stops it.

## Accessibility & Inclusion

WCAG 2.2 AA target, full keyboard and touch support, no hover-only functionality. Physical-device and manual screen-reader acceptance must be reported separately from automation.

## Product Principles

- Palette behavior is adjustable live in Settings and persists locally: light/dark action brightness, primary/secondary/tertiary saturation, secondary/tertiary hue shift, surface tint and contrast. Bright action fills use adaptive readable foregrounds across the kit while transparent-action ink stays independently readable. Reset colors restores the confirmed defaults (85/90 brightness, 50/75/100 saturation, 0/30 hue shifts, 25 surface tint, 0 contrast) without changing the accent seed. Accent selection changes HSV hue while retaining the original gold's saturation and brightness. Its rounded 48-degree position restores the exact original gold, as does seed Reset.
- Advanced color roles adds separate light/dark controls for colored icon/accent ink (40/50), Outline/Ghost/plain icons (40/90), selection containers, neutral backgrounds, text and borders. Toolbar and search icons use the plain role. Dark-mode Outline icons match their readable text color. Saved values persist and missing settings migrate from defaults. Text uses separate readable tones.
- Danger follows the supplied reference image: solid bright red with white text/icons. Red brightness has its own light/dark controls, both defaulting to tone 49, within the generated error palette. Paired foregrounds adapt at custom brightness values.
- Outline is the shared opaque neutral treatment matching Variant/Size selectors in both themes; Ghost is transparent. Showcase actions use kit variants, including Outline for Fluid/Minimal and Ghost for language, with no separate custom button palette.
- Button has a live configurable example grouped into Example Presets, Appearance, Content and Behavior, with synchronized Web Components and React code. Its full-catalogue icon picker loads the optional pack only when needed. Square and Elevated treatments are excluded; Elevated is excluded for every component. Other families retain their current presentations until requested. Internal icon animations are globally paused while preserving the code.

- Action buttons expose Primary, Secondary, Tertiary, Outline, Ghost and Danger variants. Component families use the simplified treatments described below, with Small, Medium (default) and Large sizes. Small is intentionally compact on desktop. Per-component size is the only sizing setting; there is no global density API.
- Button color changes fade across the whole surface; the click ripple stays independent feedback. Size changes spring actual dimensions and padding so parent layout changes continuously, with centered surface press transforms. Button and IconButton text/icons stay at their resting size and position during press and release; only the surface silhouette and ripple animate.

- Working behavior and cohesion before elaborate effects.
- Component examples lead; supporting interface stays quiet.
- Library exports remain independent of showcase code.
- When adding an adjustable feature, include temporary showcase sliders so the owner can tune its behavior before settling the defaults.
- Theme, language and motion changes apply consistently.

## Selection-control refinement

Selection controls override the earlier five-variant rule: Toggle is Outline off / Primary on; ToggleGroup is Ghost off / Primary selected; Checkbox is Outline off or partial (minus only) / Primary checked, with filling hooked to press depth like Toggle; RadioGroup is outlined with a centered Primary dot and the same hooked filling; Switch has an Outline track off / Primary track on and a thumb that swaps Primary and Outline colors with its track, with animated connection icons; Slider uses split Primary/neutral tracks with continuous and stepped values, expressive movement, and press/release feedback. These controls render once in the showcase and expose size rather than action-color variants. Respect minimal and reduced motion. Explicitly enabled icon animations are allowed for Switch while the global default icon pause remains in place elsewhere.

All forms are Outline-only and render once per showcase page, including selects, comboboxes, OTP, file inputs and date/time controls. Text Field and Textarea rest with 8px horizontal padding (6px Small, 10px Large). Focus springs their horizontal content inset outward by 8px without moving their outer boundary. Textarea uses compact vertical padding. Reduced motion applies the inset immediately.

Sliders use split active/inactive tracks with a gap around each handle, rounded outer caps and an end marker, following the supplied Material Design 3 Expressive reference. Track heights are 12/16/24px and solid handle widths are 3/4/6px for Small/Medium/Large; handle lengths are 32/44/52px, with at least a 44px pointer target. Press/release narrows the handle with expressive easing. The handle and split track share one continuous physical spring for track clicks, dragging and release, inspired by the supplied Image Comparison Spring demo. A damping ratio of 0.7 gives its 0.3 bounce character; changing the pointer target preserves momentum instead of restarting a fixed-duration tween. Values remain quantized while the visual spring can move between steps; release settles onto the committed step. Expressive narrowing and release rebound remain active throughout. Keyboard changes and 5%-of-range wheel changes use a 340ms expressive glide. Held navigation keys keep the pressed handle active and animate each repeated change until release. Mouse selection hides the focus outline throughout the interaction and after release; keyboard navigation restores it. Fully empty/full tracks animate their rounded caps. Range sliders apply press narrowing and gap changes only to the active handle. Values stay in the heading, with no floating tooltip, glow or shadow.

Switch dragging snaps the thumb to the nearest endpoint with a short eased transition and no spring or bounce.

Checkbox ticks draw in over 180ms once the fill visibly covers the whole checkbox, without waiting for spring settling. Partial minus marks remain immediate. Radio rings and dots share one SVG coordinate system at every size. Switch thumbs anticipate a click with a small movement on press and complete the snap on release. Sliders initialize at their values without load animation.

Surfaces & Data, Feedback, and Overlays now render one example treatment per component rather than six color variants. Neutral Outline surfaces, Primary selections, semantic badges, and Ghost actions follow the simplified controls/navigation direction. The previous catalogue had 58 pages: NotificationCenter replaces Snackbar, whose API and old route remain compatible through Toast. Notifications fit the available viewport height and support queued overflow, retained history, images, actions, and replies. The desktop sidebar collapses; constrained headers put global controls in a three-dot popover. Scrollbar tracks are transparent and the page canvas follows the active theme.


Standalone Chip is removed; Tree and CardGroup were part of the previous catalogue. Notifications fit available height rather than a fixed count; opening the center dismisses active overlays while preserving history. Progress and Spinner use Material Expressive waves; upload progress reuses the shared indicator. Tables expose optional per-column search/value filters, stable widths, and drag/automatic column sizing. Field glyphs use a proportional 20/22/24px scale within separate 32/36/40px action targets, with 14px remove glyphs inside selected chips. Shared hover and press behavior follows IconButton.

Select, Combobox and MultiSelect expand the field outline into a continuous options surface without moving surrounding content. Height and corners morph over 300ms, including filtering, interrupted transitions and collapse; the chevron reverses over 400ms. Option rows rise 8px from a slight scale and 4px blur over 350ms, staggered by 50ms up to 250ms. The surface retains MaterialFluid colors and flat styling, follows upward collision placement, and skips spatial animation in Minimal or reduced-motion mode.

Persian language displays Persian digits in number fields (including editing, steppers, time units and calendar year editors), date fields and both calendar systems. Native number values and date-only callbacks retain their canonical numeric/ISO data. Date ranges use `----/--/-- - ----/--/--` for empty boundaries and zero-padded `yyyy/MM/dd` dates in chronological left-to-right order.

DatePicker is calendar-only: its field is a button trigger matching DateRangePicker, with no caret or soft keyboard, and opens the overlay on click or Enter/Space/Arrow Down. Persian calendar navigation uses cached date formatting with a single digit-localization pass.

## Consistency policy

Shared kit components are the source of truth for the showcase. Fix colors, shape, state and motion in shared code; do not compensate with isolated page treatments. TableOfContents and the catalogue both use Tree. The component stage uses a dotted canvas. Miscellaneous identity/status colors are independent of the seed, with paired accessible foregrounds. Toasts use the same floating-surface colors as dialogs and popovers. Size options follow COMPONENT_POLICY.md and the exported componentSizePolicy, with no decorative variants that lack a distinct use case.


The optional Neutral + seed preset combines neutral surface hierarchy with high-lightness primary fills generated from the accent seed. The showcase defaults to this preset and retains Original palette; the library provider preserves its standard default. Surface tint and accent strength are separate persisted controls.

## Additive Button API, 2026-11-08

Button preserves Small/Medium/Large and adds XS/XL (24/96px desktop), with s/m/l aliases. Registered icon names and React icon nodes support logical start/end placement with icon dimensions inherited from the Appearance size. Controlled/uncontrolled toggle selection exposes aria-pressed and selection callbacks; active, disabled, loading labels and determinate/indeterminate progress are supported. Native type/name/value/form/ref/event behavior remains available. Loading preserves the original label/icon and any explicit disabled state. Press content remains visually fixed. No Square or Elevated treatment is supported.

The optional materialfluid/elements entry defines mf-button through defineMaterialFluidButton. It renders the same Button using the React peers, inherits native form behavior through the inner button and provides reflected attributes/properties plus asynchronous updateComplete. Importing this optional entry is safe on the server; registration requires a browser. It does not register or ship adapters for unrelated components.


## Fixed component motion defaults, 2026-11-08

Component pages have no Advanced panels. Button icons inherit their Appearance size, with no independent icon-size or ripple option in either code format. Button color/size/press/ripple overrides, provider buttonMotion/textMorph overrides, and icon/switch timing knobs are removed from public APIs. Keep all authored default values and animations. Private composition rules retain passive ToggleGroup segments and Calendar/Collapsible sizing behavior. The separate Motion playground retains isolated experiments through a private context. Active is a visual held hover background; it does not select, disable or activate the button.


## Configuration and documentation tabs, 2026-11-08

Catalogue pages open in Configuration with the live component and configuration controls only. Usage code, Web Components/React recipes, API tables, behavior notes, in-page documentation navigation and previous/next links live in the separate Documentation tab. Reuse exported Tabs and keep configuration state when switching tabs; changing component routes returns to Configuration. Button configuration follows the preview, Configuration heading and Example Presets, Appearance, Content and Behavior groups. Remove the preview footer caption and catalogue ordinal from this surface. Keyboard-visible focus on enabled Button and IconButton uses the same surface background as Active while retaining the focus ring. Focus does not change toggle selection. Motion drives authored springs/ripples; CSS owns styling and simple transitions; GSAP is not used.


## Foundation adaptation, 2026-11-08

Before the foundation work, a complete source/design snapshot (536 files) was saved and verified in backups/MaterialFluid-before-foundations-20261108-180759.zip. The foundation architecture adapts selected MIT source from Grenish/expressive revision eb96d3df46790079ae5bf7b22d721491260c1485; provenance is in reports/foundations-2026-11-08/upstream-source.json. Keep the owner theme and motion layers authoritative. There is no elevation system, shadow treatment, GSAP dependency, Tailwind migration or component replacement.

The provider uses createFoundationTheme to combine the existing Material/Previous/Neutral + seed color engines, independent status palette and new semantic foundation variables. Tonal Spot remains the default; nine generation algorithms are available without changing saved/default palettes. All 24 pre-migration default color matrices remain exact. Owner fonts, original component metrics and 14/24/29px control radii remain. The exported Foundations namespace adds role-driven type styles, scoped CSS generation, 35 Material shape paths and morphing utilities, shared interaction/a11y policy, color-pair checks and a Motion adapter using the authored press/resize/dialog/popup springs. Effects retain fixed fades rather than spatial overshoot. No new per-component tuning props are added.

The five foundation pages use their own Tree alongside the unchanged 45-component catalogue: Color, Typography, Shape, Motion and Accessibility. Typography/Shape/Accessibility separate Configuration from Documentation. Color keeps the original color page and adds the algorithm/palette explorer. Motion keeps the existing isolated experiments and adds a live overview of owner curves. Reference foundation structure is adapted to MaterialFluid visuals. Individual component copying is deferred to later owner requests. Accessibility checks demonstrate actual active color pairs and focus behavior; do not claim full accessibility certification.

The foundation workbenches now include semantic typography formatting, continuously retargetable shapes, synchronized curve playback and functional accessibility presets. Button toggles are restricted to Tonal, Outlined and Ghost/Text, with Primary selected styling; progress follows the size variant's icon slot. See reports/foundation-workbenches-2026-11-09/REVIEW.md for local verification and limits.

## Action refinements, 2026-11-09

Button and IconButton expose emphasize as a boolean toggle behavior, independently of Appearance, with paired Primary fill and ink in both states. It requires toggle; it is never an appearance variant. Tonal, Outlined and Ghost/Text retain their own off treatment and Primary on treatment when emphasize is false. Emphasize also permits Filled toggles. Danger remains an ordinary action. IconButton has five sizes and narrow/default/wide widths, with no Square or Elevated option. A nullable selectedIcon uses the same Material symbol, outlined off and filled on through a smooth crossfade between the actual outline and filled artwork; a separate selectedIcon swaps artwork. selectedLabel optionally names the selected action. Do not expose Playback/playing modes or new animation tuning parameters. Both action pages use grouped Example Presets, Appearance, Content and Behavior; React and optional Web Component recipes remain in Documentation.


## Button Group additions, 2026-11-09

ButtonGroup adds standard/connected layouts, action/single/multi selection, required selection, selected-only labels, five owner action sizes, density, orientation, equal widths, per-item disabled states and native keyboard activation. ButtonGroupItem or the buttons list opts into these additions; existing arbitrary-child frames remain compatible. Standard buttons retain their layout width during selection and pressing; selected-only labels reserve their width in Standard groups. Connected selected buttons round all four corners; unselected buttons retain joined corners. All buttons preserve the shared radius press animation with fixed text/icons. Groups use a 16px overflow painting margin so spring overshoot remains visible horizontally and vertically without scrollbars. React and optional Web Component APIs and recipes follow the selected configuration. Keep only grouped Example Presets, Appearance, Content and Behavior in Configuration. No Square, Elevated or public press/ripple timing knobs.


## Button color and ripple sizing, 2026-11-10

All Button color changes use a simple whole-surface fade, including toggle selection, appearance and theme changes. The click ripple stays independent feedback and never becomes the selected color. Remove the color-wave layers and tracking. Active ripples follow the button's current unscaled dimensions, including selected-label and size growth, without restarting their progress or changing the original click point. Preserve press-driven radius deformation, fixed content and reduced motion.


## Button Group activation performance, 2026-11-10

Live selection must not rerender the unchanged catalogue navigation and configuration form. Keep callbacks current when those surfaces are cached so later item removal, selection-mode changes and framework recipes retain the actual current selection. Activating a preset example changes its runtime selection without marking its configuration Custom. Preserve authored motion and native click/keyboard behavior.


## Split Button additions, 2026-11-10

SplitButton composes the shared Button and Menu: paired owner colors, five owner sizes, 2px gap, press-linked radii, fixed content, inner-corner feedback and a rotating/centering chevron. Opening rounds the trailing half without selecting either half or replacing its appearance. Preserve label/menuLabel and the native leading-button ref. Add text/children, trailingLabel/groupLabel/ariaLabel, items or SplitButtonItem declarations (including nested choices, headings and separators), controlled/default expansion, select/expand/collapse/change and open/close aliases, external expansion without items, native submit/reset, top-layer menus and imperative content/state/lifecycle methods. Small coarse-pointer targets stay enlarged. Keep the 45-entry catalogue unchanged. Configuration contains only Example Presets, Appearance, Content (full optional icon catalogue) and Behavior; React/Web Components recipes and API stay in Documentation. No Elevated, Square or public motion overrides. All ordinary color changes fade; ripples remain independent feedback and track live geometry.
