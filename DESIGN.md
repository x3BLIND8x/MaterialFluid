---
name: MaterialFluid
description: Rounded Material-inspired components with gold tonal surfaces and controlled fluid motion.
colors:
  accent-seed: "#eedd96"
  primary-ink: "#695e30"
  primary-ink-dark: "#827746"
  primary: "#695e30"
  on-primary: "#ffffff"
  primary-container: "#f1e3a8"
  on-primary-container: "#211b00"
  secondary: "#645e48"
  secondary-container: "#ebe2c6"
  on-secondary-container: "#1f1c0a"
  primary-fill: "#e3d49b"
  on-primary-fill: "#211b00"
  secondary-fill: "#ddd4b8"
  tertiary-fill: "#cadbaa"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#410002"
  canvas: "#fcf6ec"
  surface: "#ffffff"
  surface-container: "#f6f0e7"
  surface-high: "#eae5dc"
  on-surface: "#3e3b35"
  on-surface-variant: "#6a6557"
  outline: "#343024"
  outline-variant: "#7c7768"
  primary-dark: "#ada16b"
  on-primary-dark: "#383005"
  primary-container-dark: "#d5c78e"
  on-primary-container-dark: "#5c5225"
  secondary-dark: "#a8a087"
  secondary-container-dark: "#cfc6ab"
  on-secondary-container-dark: "#58523d"
  primary-fill-dark: "#f1e3a8"
  on-primary-fill-dark: "#383005"
  secondary-fill-dark: "#ebe2c6"
  tertiary-fill-dark: "#d8e9b8"
  error-dark: "#ff7669"
  on-error-dark: "#690005"
  error-container-dark: "#ffb4ab"
  on-error-container-dark: "#a80710"
  canvas-dark: "#12110c"
  surface-dark: "#1f1d18"
  surface-container-dark: "#2c2a24"
  surface-high-dark: "#393731"
  on-surface-dark: "#e7e2d9"
  on-surface-variant-dark: "#cdc6b4"
  outline-dark: "#e9e2d0"
  outline-variant-dark: "#969080"
typography:
  display:
    fontFamily: '"Nunito Variable", "Vazirmatn RD", sans-serif'
    fontSize: "clamp(36px, 4vw, 58px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Nunito Variable", "Vazirmatn RD", sans-serif'
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: '"Nunito Variable", "Vazirmatn RD", sans-serif'
    fontSize: "22px"
    lineHeight: 1.2
  body:
    fontFamily: '"Nunito Variable", "Vazirmatn RD", sans-serif'
    fontSize: "15px"
    lineHeight: 1.55
  label:
    fontFamily: '"Nunito Variable", "Vazirmatn RD", sans-serif'
    fontSize: "14px"
    fontWeight: 750
    lineHeight: 1.55
  code:
    fontFamily: '"JetBrains Mono Variable", monospace'
    fontSize: "12px"
    lineHeight: 1.9
rounded:
  checkbox: "6px"
  link: "8px"
  focus-default: "12px"
  field: "14px"
  list: "16px"
  table: "18px"
  card: "20px"
  fab: "22px"
  stage: "24px"
  frame-mobile: "26px"
  overlay: "28px"
  frame: "32px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  compact: "12px"
  comfortable: "16px"
  md: "20px"
  lg: "24px"
  xl: "28px"
  xxl: "32px"
  stage: "48px"
components:
  button-filled:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "11px 24px"
    height: "var(--mf-control-height, 48px)"
  button-tonal:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.pill}"
    padding: "11px 24px"
  button-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "11px 24px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "11px 24px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
  chip-selected:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.focus-default}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  navigation:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.stage}"
    padding: "{spacing.sm}"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.overlay}"
    padding: "{spacing.xl}"
---

# Design System: MaterialFluid

## Overview

**Creative North Star: "MaterialFluid"**

MaterialFluid gives Material-inspired controls a soft, rounded, flat character. Warm gold selection surfaces, restrained outlines and controlled springs make changes visible while the working component stays central. The approved identity rejects elevation shadows and reserves a brief glow for successful feedback.

The same component world supports English and Persian, light and dark themes, comfortable and compact density, and expressive or minimal motion. System reduced-motion preference overrides animation. Typography and geometry carry the identity across these settings; language and theme are functional modes of the same system.

**Key Characteristics:**

- Rounded flat and outlined surfaces.
- Gold seed with generated semantic foreground/container pairs.
- Nunito Latin, Vazirmatn RD Persian and isolated JetBrains Mono code.
- Fluid selections, growing surfaces and soft controlled springs.
- Keyboard focus follows each control's rounded silhouette.

## Colors

Settings exposes nine live palette controls: separate light/dark solid-action brightness, three role saturation multipliers, secondary/tertiary hue offsets, neutral surface tint and contrast strength. Confirmed defaults are brightness 85/90, saturation 50/75/100, hue shifts 0/30, surface tint 75 and contrast 0. Solid fill tokens (`*-fill`, `on-*-fill`, `*-fill-hover`) are separate from readable accent/Outline/Ghost ink and apply throughout the kit, including checked controls, sliders, calendar selections and progress. Foregrounds use actual gamut-mapped luminance and hover shifts away from the foreground tone. Color tuning persists locally, remains bilingual and has its own reset. The accent hue slider selects fully saturated, fully bright HSV seeds, while Reset retains the original gold seed.

The palette combines a gold primary family, muted sand secondary containers and warm neutral surfaces.

Button and action-icon pages present Primary, Secondary, Tertiary, Outline, Ghost and Danger together. Other families use their single approved treatment and one Size control. Button retains its existing six-button row and removes the redundant Create project example. The icon catalogue is not duplicated; its selected-icon stage shows six variants. Internal glyph motion, including Wi-Fi/Bluetooth slash drawing, is temporarily gated off globally while preserving static state changes and the animation code.

Outline is an opaque neutral-surface treatment matching the Variant/Size selectors: `--mf-outline-surface` derives from the theme surface, `--mf-on-outline-surface` from its text and `--mf-outline-stroke` from the subtle neutral border. It stays white/light and dark with the respective theme. Ghost stays transparent. Fluid/Minimal is a kit Outline Button; language is a Ghost Icon Button. Search, selector controls and the advanced-role disclosure share Outline instead of standalone color rules. Outline component surfaces, tracks and indicators follow these same tokens.

Danger uses the supplied reference's solid bright red background with white text/icons, replacing the earlier inversion. Both light/dark red fill tones default to 49, using the generated error family, with independent brightness controls. Paired foregrounds remain readable at custom values. Cards and other Danger surfaces use the same solid red treatment.

Advanced color roles exposes separate light/dark tone controls for colored icon/accent ink (40/50), Outline/Ghost/plain icon ink (40/90), Danger brightness (49/49), colored containers (90/80), neutral canvas/surfaces (97/5), text (25/90) and borders (20/90). They are collapsed by default and saved with the existing palette controls. Related neutral layers keep their tone offsets. Primary/Secondary/Tertiary icons follow direct `*-ink` tones; Outline/Ghost, toolbar and search icons follow `*-plain-ink`, except dark-mode Outline icons match their readable text color. Danger icons use the solid fill's readable white foreground. Readable accent text remains independently fitted. Reset restores all roles. Pre-split preferences receive the new defaults; the former global dark default 85 migrates to colored 50 and the former light plain default 60 migrates to 40, while other explicit values are preserved.

### Primary

**Gold seed** generates the semantic palette through Material Color Utilities in `src/kit/theme.ts`; it is not the filled button color. Readable accent roles supply focus and transparent-action ink; brighter solid roles supply filled controls in both themes. Primary containers hold selected chips, tabs, navigation indicators and success feedback. Always pair each background role with its matching `on-*` foreground.

### Secondary

**Muted sand** supports avatars and neutral informational alerts. Secondary container pairs provide distinction without introducing an unrelated accent.

### Neutral

**Warm canvas** separates the page from the main surface. Container and high-surface tones separate live stages, cards and controls. On-surface text, muted on-surface-variant text and restrained outline roles provide hierarchy. Error/background pairs carry destructive actions and invalid field feedback.

**The Semantic Pair Rule.** Generate colors from the current seed and theme; use each semantic background with its corresponding foreground.

Frontmatter records the default seed's actual runtime light/dark values. Provider-generated CSS properties override the approximate static fallback palette in `styles.css`. Neutral tones are canvas 97/5, surface 100/11, container 95/17 and high surface 91/23 for light/dark respectively. A custom seed regenerates the palette; these snapshots must not become fixed colors in components.

## Typography

**Display and Body Font:** Nunito Variable, with Vazirmatn RD for Persian and sans-serif fallback.

**Code Font:** JetBrains Mono Variable, with monospace fallback.

Rounded Latin forms and Persian letterforms share one restrained hierarchy. Code stays LTR, left aligned and bidi isolated in either locale.

### Hierarchy

- **Display:** component introductions use the frontmatter display ramp; responsive overrides are 46px at 1100px, 40px at 800px and 36px at 480px.
- **Headline:** documentation section headings use the headline role.
- **Title:** card and empty-state headings use the title role; dialog titles use 25px.
- **Body:** controls and normal reading use the body role; introduction copy uses 17px/1.6 with a 58ch measure, then 15px on mobile.
- **Label:** field labels use the label role; small supporting text uses 12–14px. Button text uses weight 750 and normal casing.
- **Code:** usage blocks use the code role, with ligatures disabled.

**The Script Continuity Rule.** Preserve the local Latin, Persian and code font assets and isolate code direction when switching locale.

## Layout

Reusable controls use comfortable control height 48px and gap 16px; compact mode changes these to 44px and 12px. Coarse pointers restore 48px control height. Spacing generally follows the frontmatter scale, while component-specific padding remains explicit.

The showcase has 56 dedicated component pages. Its grouped outer sidebar is 248px wide, with a 20px gap, an 88px topbar and a maximum shell width of 1920px. One large rounded content surface contains the component introduction, live stage, variants and usage/props. Desktop frame padding is 48px 56px 28px; above 1600px inline padding becomes 80px.

At 1100px the sidebar becomes 220px and frame padding 36px 30px 24px. At 800px the layout becomes one column with drawer navigation, a 76px topbar, 12px outer gutters and frame padding 32px 24px 24px. At 480px gutters become 8px and frame padding 28px 18px 20px. Tables and code scroll within their containers. Direction-sensitive layout, range ends and alignment use logical properties or explicit RTL counterparts.

These page measurements describe the showcase, not a required composition for every consuming app. Launcher behavior belongs to PRODUCT.md and VALIDATION.md, outside the visual system.

## Elevation & Depth

No elevation shadows. Depth comes from tonal separation, thin outlines, overlap and a dimmed scrim. Dialogs use surface color; menus and floating content use container color. A 40% scrim separates overlays from the page.

**The Flat Surface Rule.** Keep resting and hovering surfaces flat; the expressive success alert alone may use the existing brief glow, which fades from a 20% primary-colored 18px halo to zero over 0.9 seconds.

## Shapes

All exposed frames and focus affordances are smooth and rounded. A zero-specificity default radius covers buttons, links, inputs, textareas, selects and tabindex targets; specific component silhouettes override it. Focus uses a 3px primary outline with 4px offset. Field wrappers use their own rounded focus-within border and inset outline.

Pill buttons, tabs, navigation items and segments retain pill outlines. Icon controls and day buttons are circular; checkbox corners remain softly rounded. Cards, fields, tables, tooltips, scrollbars and color swatches preserve their established radii. Selected table row ends and Persian calendar range ends use logical rounded corners.

**The Whole Silhouette Rule.** Round the complete visible and focused shape, including all four bottom-sheet corners; bottom sheets, drawers and dialogs use the overlay radius. Floating content has the same CSS radius; the animated Popover component settles at the stage radius through its inline animation value.

## Components

### Buttons

All components share `variant: primary | secondary | tertiary | outline | ghost | danger` and `size: sm | md | lg`. Secondary and tertiary use the generated Material palette roles; danger uses error roles. Action surfaces use paired solid roles, while reading and field surfaces use paired container roles. Outline and ghost floating surfaces remain opaque for readable content. Medium preserves comfortable geometry; Small uses 28px desktop actions, 12px labels, short padding and tight gaps. Coarse pointers retain enlarged targets. Density is absent from showcase settings.

Button variant/accent/theme changes wipe the old color away in a clean circle expanding from the center with the ripple's fast-start easing. Hover uses a short color fade in both motion modes and never triggers a color wipe. Reveal duration and size damping are temporarily tunable under Advanced. Size springs use stiffness 460, damping 40 and mass 1 for a smooth settle, independently configurable through `sizeMotion`. Button size changes spring actual width, height, padding, typography, gaps and leading-icon dimensions; this lets containers and neighboring content follow. Press scaling remains centered on a stable compositing surface. Minimal/reduced motion suppresses geometry springs.

Confident pill controls with flat states. Filled, tonal, outlined and text variants share the frontmatter padding and variable control height. Filled hover mixes 92% primary with its foreground; other variants hover with 75% primary-container against transparency. Focus follows the pill. Expressive press scales uniformly to 0.94 with a symmetric underdamped spring timing curve (stiffness 460, damping 12, mass 1) on press and release, preserving proportions while corners follow actual spring compression proportionally and restore on release; disabled/loading states prevent interaction. Small buttons use 8px 18px padding and 44px minimum height; large buttons use 17px 30px and 58px.

### Chips

Soft outlined tags with rounded inner focus targets. Unselected chips use transparent fill and an outline-variant stroke; selected chips use primary-container with its foreground and a transparent stroke. Chip height is at least 44px, with inner padding from the frontmatter.

### Cards / Containers

Flat tonal blocks use the card radius and padding. Outlined cards use transparent fill and a 1px outline-variant border. Live stages use the stage radius; the larger showcase frame uses the frame radius, becoming frame-mobile at 800px and stage radius at 480px.

### Inputs / Fields

Surface-colored field wrappers use a 1px outline stroke and field radius. Focus changes the wrapper stroke and inset outline to primary. Invalid fields use error strokes and error-colored hint text; disabled wrappers dim. Textareas retain the field radius, 14px padding and a 112px minimum height.

### Navigation

Container-colored navigation uses rounded outer geometry and pill items. Primary-container selection indicators inherit the selected control's radius. Tabs and toggle segments use a shared layout indicator in expressive mode, preserving direction and keyboard behavior. Minimal/reduced modes remove fluid selection travel. Catalogue links remain restrained, with a stronger selected label and tonal hover; mobile catalogue navigation lives in a drawer.

### Overlays and feedback

Dialogs center within the viewport at a maximum width of 500px and retain a 32px viewport margin. Drawers use inset placement; bottom sheets span up to 640px with four rounded corners and an 80dvh maximum height. Growing floating surfaces and brief dialog/sheet entrances use controlled motion. Minimal mode favors short fades; reduced motion disables CSS animation/transitions and respects the Motion provider's user preference.

Google Material Symbols Rounded Filled provides the interface SVGs, including static controls, calendar arrows and the brand mark. Wi-Fi and Bluetooth use the earlier Forma SwitchGlyph stroke geometry with 350ms drawing, 70ms per-strand stagger, and a 150ms delayed slash drawing/retraction. Start only on successful click release or Enter/Space release; hover, focus and hold remain still. Minimal/reduced modes show static final glyphs.

## Do's and Don'ts

### Do:

- **Do** use generated semantic foreground/container pairs in both themes.
- **Do** preserve rounded control silhouettes and matching focus outlines.
- **Do** retain locally packaged Nunito, Vazirmatn RD and JetBrains Mono fonts.
- **Do** respect RTL, density and system reduced-motion preferences.
- **Do** use the existing controlled spring and fluid selection grammar for expressive changes.

### Don't:

- **Don't** add elevation shadows to resting or hovering components.
- **Don't** replace this custom identity with a generic framework or unrelated palette.
- **Don't** introduce square focus targets or square lower corners on bottom sheets.
- **Don't** use text glyphs as replacements for the vendored icon system.
- **Don't** treat automated accessibility checks as manual screen-reader or physical-device acceptance.

Source evidence: `src/kit/theme.ts`, `provider.tsx`, `styles.css`, sampled control/navigation/overlay components, `src/showcase/App.tsx` and `showcase.css`. Review screenshots remain in `.impeccable/review/`; acceptance limits remain in `VALIDATION.md`. The surface contract honestly records that the legacy numeric seed tool produced no seed reference; no missing reference is invented here.

Button showcase includes temporary bilingual sliders for press depth, spring stiffness, damping and mass, plus reset. Button press springs use restDelta 0.0001 and restSpeed 0.001 to reduce the final snap. Glyphs use Material Rounded Filled, with custom Wi-Fi/Bluetooth stroke drawings.

Button ripple expands from the pointer (center for keyboard), remains during a hold, and fades on release/cancellation. Minimal mode retains ripple expansion with radius linked to its expansion and fade; system reduced motion replaces expansion with a brief state wash and suppresses radius morphing. Temporary controls expose radius reduction per 1% depth (default 5%), ripple timing (550ms), and opacity (20%). Radius uses the same motion value as scale, reducing 30% at 6% depth, with a minimum of 6px; there is no separate radius timer. Resting pill radii are measured from the actual button height to avoid interpolating from an artificial 999px radius.

Ripple expansion uses a pronounced fast-start, slow-finish cubic-bezier(0.15, 1, 0.3, 1) over 550ms. A temporary fast-start strength slider adjusts the first control point; opacity defaults to 20%.

Fast-start defaults to 85. A quick release speeds the existing ripple timeline to 2x, preserving its current progress, waits for full expansion, then fades over 160ms. A temporary release-speed slider spans 1x to 5x. Minimal mode retains ripple expansion and links radius to its expansion and fade; system reduced motion retains a static wash without expansion or radius changes.

Repeated presses retain overlapping ripples. Minimal-mode radius follows the maximum active ripple envelope, avoiding a zero-progress reset when a new ripple begins. Keyboard feedback supports Enter and Space, centers synthetic keyboard ripples, suppresses repeated activation while held, and cancels on blur. Slider Arrow, Home and End controls remain native Radix behavior.

Button and Icon Button showcases omit extra disabled/loading/long-content state switches and simulated action messages; Button animation tuning remains available. The Icon Button demo relies on each icon's own interaction listeners, without shared selected state across examples. Library state APIs remain available to consumers.

The dedicated Icons page at #/components/animated-icon lists 4,301 official Rounded symbols plus 21 compatibility aliases, locally bundled. Search supports canonical names and common Persian keywords. A selected glyph has a replay button and copyable imports. Temporary controls tune size, duration, stagger, fill timing, and connection stroke weight/slash delay. The full pack and gallery load only on this route; core controls include 31 defaults.

Filled Material glyphs use one shared center-out circular SVG clip reveal, with no outline tracing or geometric distortion. The circle originates at the viewBox center and expands to cover its diagonal. Default fill time is 400ms with fast-start strength 85%; duration multiplier applies. The gallery shows fill controls for filled glyphs and drawing/stagger/slash controls for connection strokes. All remain release-triggered and static in minimal/reduced mode.

Icon animation classification follows visual construction, not SVG serialization. The generator compares official FILL=0/1 artwork and thinness at 192px, skeletonizes qualifying glyphs, simplifies paths, and measures coverage to construct reveal masks. Original Google vector contours remain visible, preserving the exact resting silhouette. Thin symbols such as menu/check/close draw; solid and mixed pictograms fill from center. A generation report records classification metrics for every canonical name. The current heuristic assigns 950 stroke reveals and 3,351 center-fill reveals; it cannot infer semantic animation choreography. Only Wi-Fi/Bluetooth retain authored state/slash paths. The gallery derives tuning controls from the same data; connection icons alone show stroke weight and slash delay. Generated masks cap cumulative stagger at 600ms.

## Selection-control refinement

Selection controls override the earlier six-variant rule: Toggle is Outline off / Primary on; ToggleGroup is Ghost off / Primary selected; Checkbox is Outline off or partial (minus only) / Primary checked, with filling hooked to press depth like Toggle; RadioGroup is outlined with a centered Primary dot and the same hooked filling; Switch has an Outline track off / Primary track on and a thumb that swaps Primary and Outline colors with its track, with animated connection icons; Slider is Outline with continuous and stepped modes, immediate Free movement, short glides for Snappy values, and press/release feedback. These controls render once in the showcase and expose size rather than action-color variants. Respect minimal and reduced motion. Explicitly enabled icon animations are allowed for Switch while the global default icon pause remains in place elsewhere.

All forms are Outline-only and render once per showcase page, including selects, autocomplete, OTP, file inputs and date/time controls. Text Field and Textarea rest with 8px horizontal padding (6px Small, 10px Large). Focus springs their horizontal content inset outward by 8px without moving their outer boundary. Textarea uses compact vertical padding. Reduced motion applies the inset immediately.

Selection labels transition from weight 500 to 700 when active. Toggle Group supports mouse and touch scrubbing, commits the preview on release, and cancels on a vertical touch scroll or pointer cancellation. Holding enlarges only the inner selection pill with a spring; the outer group does not scale. Icon Button previews share a compact wrapping row. Reduced motion suppresses pill scaling and weight transitions.

Sliders use a slim vertical rounded handle (10 × 44px at Medium), an Outline center, and Primary for both the filled track and handle border. Pressing narrows the handle. Stepped movement uses a smooth 140ms glide; Free movement remains immediate.

Switch dragging snaps the thumb to the nearest endpoint with a short eased transition and no spring or bounce. Slider handles are wider for visibility: 8px Small, 10px Medium, 12px Large.

Toggle Group labels remain stationary while the selection pill slides behind them.

Toggle → Advanced text morph includes Fade (0–100%). Zero keeps text fully opaque during blur; 100 fades it out at the swap. Toggle and FAB text use the same duration, blur and fade settings. Library consumers can share these with `MaterialFluidProvider textMorph={{ duration: 100, blur: 6, fade: 0 }}` (milliseconds, pixels, percent). Reset restores the shared defaults.

Checkbox ticks draw in over 180ms once the fill visibly covers the whole checkbox, without waiting for spring settling. Partial minus marks remain immediate. Radio rings and dots share one SVG coordinate system at every size. Switch thumbs anticipate a click with a small movement on press and complete the snap on release. Sliders initialize at their values without load animation.

Icon source: use Material Symbols Filled Rounded by default for every new icon. Use Material Symbols Outline Rounded only when the filled symbol is unavailable.

Select, Combobox, and MultiSelect share an outlined, rounded dropdown below the field, with 6px gaps between options and a bounded scrollable list. Select no longer expands from the selected row. MultiSelect includes a search field with no visible title (its accessible label remains); selected options use an animated Primary highlight without checkmarks. Combobox always explains whether custom values are allowed and exposes an explicit Add option when enabled. Showcase lists include 16 options for scrolling, with both restricted and custom-value Combobox examples.

Select, Combobox, MultiSelect, and MultiSelect search keep fixed horizontal text spacing on focus; these selection fields do not use the text-field focus gap animation.

DatePicker and TimePicker keep static text insets on focus. DatePicker starts empty with `----/--/--`, animates individual entered digits, and centers its digit overlay in the field. Calendar and year-grid updates wait for committed input; typing in the year editor does not rerender the calendar. TimePicker supports 12/24-hour display, with an AM/PM ToggleGroup in the 12-hour overlay. FileInput scales its button, chips, font, gaps, and padding together across Small, Medium, and Large. TextField/Textarea/custom Combobox values support optional `maxLength` and live counters, hidden via `showCount={false}`.

Forms polish: dropdowns anchor to the visible control rather than label/helper blocks. Option labels wrap inside the menu and reserve space for indicators; selected MultiSelect rows retain a contrasting inset keyboard focus outline. Helper text and counters can wrap onto separate lines at narrow widths, with the counter aligned to the logical end in RTL. Native form reset synchronizes character counters and file chips. Combobox keyboard navigation skips disabled options and respects read-only values. Calendar view width is reserved only while month/year selection is open, so normal day grids can resize with component size changes.

Navigation uses a single treatment per component: Primary selection on neutral tab/navigation surfaces, Ghost breadcrumbs and links, and an Outline app bar. The catalogue sidebar shares animated Primary pills. The 12/24-hour demo selector sizes to its labels. Scrollbars retain native scrolling and dragging, with Primary thumbs, a rounded track over a themed gutter, and instant hover/hold color feedback. The thumb grows only while held; scrollbar transitions are disabled.

Stepper places labels below its circles, with a continuous connector track between neighboring circles. Completed connectors fill Primary in the reading direction, and completed steps reveal an animated Material tick. Minimal and reduced motion apply state changes immediately.

Surfaces and overlays now expose one treatment per component, overriding the earlier six-variant catalogue rule. Cards, lists, accordions, tables, dialogs, drawers, sheets, menus, and popovers share opaque neutral Outline surfaces. Primary communicates selection; Ghost handles secondary and close actions. Avatar initials are unselectable, sizes are 32/44/64px, and AvatarGroup overlaps members with a remaining-count avatar. Badges are thin semantic pills, Primary by default, with distinct neutral/success/warning/info/error states. Accordions use separate rounded items and animated height. Table selection uses the shared Checkbox without header-only dimensions or filling.

The desktop catalogue collapses into a compact family rail. The header measures its available width and moves global controls into a three-dot popover when they no longer fit. Native scrollbar tracks and gutters are transparent; the html/body canvas follows the active surface color and color scheme. Scrollbar thumbs retain instant hover feedback and grow only while held.

Toast and Snackbar share one notification queue per MaterialFluidProvider. The visible toast stack fits a measured viewport-height budget; additional notifications wait behind a count badge and begin their dismissal timers when promoted. Image toasts use compact thumbnails; the center retains full previews. Opening the center closes all overlay notifications and routes new arrivals directly into history. Dismissed toasts remain in NotificationCenter history until cleared. The center is a rounded, scrollable sidebar with timestamps, unread state, image previews, actions, and an optional bounded reply composer. Snackbar remains an API alias and its former catalogue route opens Toast. A dedicated NotificationCenter page replaces its catalogue slot. Progress uses a Primary pill and a droplet traveling from the unfilled end into the current fill; Minimal and reduced motion remain immediate.


Progress droplets use an independent 1800ms CSS timeline, preserving the same animated element across progress updates. Alerts briefly fade a semantic glow back to their resting neutral surface. Small icon-only buttons use 24px glyphs, and embedded actions retain the same glyph scale; number steppers use the shared ButtonGroup. The startup glyph pack includes overflow, collapsed navigation, sorting, and filter symbols without requiring the icon catalogue route.

DataTable has fixed column geometry across sorting and pagination, responsive horizontal scrolling, ascending/descending/unsorted glyphs, and optional per-column search and value filters. Its showcase adds Column filters immediately after Long content. Column-edge grips support pointer dragging, keyboard resizing, and double-click/Enter fitting to loaded data. Date-picker popovers have a stable size per variant, responsive seven-column grids, and bounded scrolling rather than clipping on short screens. Standalone Chip was removed; selectable/removable tags remain inside MultiSelect and FileInput. The catalogue now has 56 pages.


Table anchoring follows the desktop convention: the leading data column fills remaining space from the start edge, while trailing columns align to the end and resize from their leading borders. Resize grips are vertically centered. The stable disabled-filter reference remains unchanged to prevent the pagination update loop.

Avatar names appear in keyboard/hover tooltips. Notification history exposes a per-item read action with an unread bell/read double-check and an icon on Mark all read. EmptyState has an explicit 24px radius. Progress droplets travel the complete track to the far start edge before resetting; alerts flash a fading semantic glow in expressive mode. BottomSheet has a real mouse/touch drag handle and draggable heading, collapsed/expanded heights, direct downward movement, resisted upward movement, release-to-snap/dismiss, cancellation recovery, and keyboard sizing. Its body scrolls independently and its actions remain available.
