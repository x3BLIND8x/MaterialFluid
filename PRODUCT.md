# MaterialFluid

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, TypeScript, Vite. Confirmed in the 51-question design interview.

## Users

External developers building general web applications on desktop and touch devices.

## Product Purpose

A reusable 58-page component kit and dedicated-page bilingual showcase. Success means coherent visuals, usable component APIs, working keyboard/touch interactions, and package-ready distribution.

## Capabilities and Constraints

English/Persian and LTR/RTL; Gregorian/Persian calendars; sortable, filterable, paginated, selectable tables. No accounts or backend. Initial release excludes example websites, charts, rich text and complex upload engines. All dependencies must permit free redistribution. Source and package delivery; the owner has authorized a public GitHub v0.11 release.

## Brand Commitments

MaterialFluid. Material-inspired custom fluid identity. Gold seed #EEDD96. Rounded flat/outlined surfaces, no shadows; selective active/success glow. Nunito Latin, Vazirmatn RD Persian, JetBrains Mono code. Google Material Symbols Rounded Filled, with custom staged Wi-Fi/Bluetooth stroke animations from the earlier Forma toggles. Fluid selection indicators and expanding surfaces, soft controlled spring. Expressive/minimal motion with system reduced-motion respected. Code-first workflow explicitly chosen.

Every visible surface and control must remain smooth and rounded, including keyboard focus rings, accessibility-related controls, calendar ranges, table headers and scrollbars. Windows launcher prints a clickable local IP/port URL and opens only the default browser. Browser closure leaves the server running; closing the terminal stops it.

## Accessibility & Inclusion

WCAG 2.2 AA target, full keyboard and touch support, no hover-only functionality. Physical-device and manual screen-reader acceptance must be reported separately from automation.

## Product Principles

- Palette behavior is adjustable live in Settings and persists locally: light/dark action brightness, primary/secondary/tertiary saturation, secondary/tertiary hue shift, surface tint and contrast. Bright action fills use adaptive readable foregrounds across the kit while transparent-action ink stays independently readable. Reset colors restores the confirmed defaults (85/90 brightness, 50/75/100 saturation, 0/30 hue shifts, 25 surface tint, 0 contrast) without changing the accent seed. Accent selection is hue-only at full HSV saturation/brightness; seed Reset preserves the original gold.
- Advanced color roles adds separate light/dark controls for colored icon/accent ink (40/50), Outline/Ghost/plain icons (40/90), selection containers, neutral backgrounds, text and borders. Toolbar and search icons use the plain role. Dark-mode Outline icons match their readable text color. Saved values persist and missing settings migrate from defaults. Text uses separate readable tones.
- Danger follows the supplied reference image: solid bright red with white text/icons. Red brightness has its own light/dark controls, both defaulting to tone 49, within the generated error palette. Paired foregrounds adapt at custom brightness values.
- Outline is the shared opaque neutral treatment matching Variant/Size selectors in both themes; Ghost is transparent. Showcase actions use kit variants, including Outline for Fluid/Minimal and Ghost for language, with no separate custom button palette.
- Button and action-icon pages present five action variants together; other families use their single approved treatment, with shared Size and example-state controls and no Variant selector. Button has one five-variant row; the icon catalogue renders once with six selected-icon previews. Internal icon animations are globally paused while preserving the code.

- Action buttons expose Primary, Secondary, Tertiary, Outline, Ghost and Danger variants. Component families use the simplified treatments described below, with Small, Medium (default) and Large sizes. Small is intentionally compact on desktop. Per-component size is the only sizing setting; there is no global density API.
- Button color changes reveal from the center with a crisp ripple edge; hover does not trigger this reveal. Size changes spring actual dimensions and padding so parent layout changes continuously, with centered press transforms.

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

Surfaces & Data, Feedback, and Overlays now render one example treatment per component rather than six color variants. Neutral Outline surfaces, Primary selections, semantic badges, and Ghost actions follow the simplified controls/navigation direction. The catalogue has 58 pages: NotificationCenter replaces Snackbar, whose API and old route remain compatible through Toast. Notifications fit the available viewport height and support queued overflow, retained history, images, actions, and replies. The desktop sidebar collapses; constrained headers put global controls in a three-dot popover. Scrollbar tracks are transparent and the page canvas follows the active theme.


Standalone Chip is removed; Tree and CardGroup bring the catalogue to 58 pages. Notifications fit available height rather than a fixed count; opening the center dismisses active overlays while preserving history. Progress and Spinner use Material Expressive waves; upload progress reuses the shared indicator. Tables expose optional per-column search/value filters, stable widths, and drag/automatic column sizing. Field glyphs use a proportional 20/22/24px scale within separate 32/36/40px action targets, with 14px remove glyphs inside selected chips. Shared hover and press behavior follows IconButton.

Select, Combobox and MultiSelect expand the field outline into a continuous options surface without moving surrounding content. Height and corners morph over 300ms, including filtering, interrupted transitions and collapse; the chevron reverses over 400ms. Option rows rise 8px from a slight scale and 4px blur over 350ms, staggered by 50ms up to 250ms. The surface retains MaterialFluid colors and flat styling, follows upward collision placement, and skips spatial animation in Minimal or reduced-motion mode.

Persian language displays Persian digits in number fields (including editing, steppers, time units and calendar year editors), date fields and both calendar systems. Native number values and date-only callbacks retain their canonical numeric/ISO data. Date ranges use `----/--/-- - ----/--/--` for empty boundaries and zero-padded `yyyy/MM/dd` dates in chronological left-to-right order.

DatePicker is calendar-only: its field is a button trigger matching DateRangePicker, with no caret or soft keyboard, and opens the overlay on click or Enter/Space/Arrow Down. Persian calendar navigation uses cached date formatting with a single digit-localization pass.

## Consistency policy

Shared kit components are the source of truth for the showcase. Fix colors, shape, state and motion in shared code; do not compensate with isolated page treatments. TableOfContents and the catalogue both use Tree. The component stage uses a dotted canvas. Miscellaneous identity/status colors are independent of the seed, with paired accessible foregrounds. Toasts use the same floating-surface colors as dialogs and popovers. Size options follow COMPONENT_POLICY.md and the exported componentSizePolicy, with no decorative variants that lack a distinct use case.
