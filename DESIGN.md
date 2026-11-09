---
name: MaterialFluid
description: Rounded Material-inspired components with gold tonal surfaces and controlled fluid motion.
palette-note: Material colors use shared semantic roles; examples below are the default seed in Tonal Spot. Other seeds and the Previous design remain configurable. Tonal Spot (2025) is the only Material color scheme.
colors:
  accent-seed: "#eedd96"
  canvas: "#fff9ed"
  surface-container: "#f4eddd"
  surface-high: "#efe8d6"
  on-surface: "#363225"
  on-surface-variant: "#645f4f"
  outline: "#807a6a"
  outline-variant: "#b8b29f"
  primary: "#6c5f1d"
  on-primary: "#fff8eb"
  primary-container: "#f5e393"
  on-primary-container: "#5e5110"
  primary-fill: "#e7d586"
  on-primary-fill: "#211b00"
  secondary: "#665f41"
  secondary-container: "#ede2bc"
  on-secondary-container: "#595235"
  secondary-fill: "#dfd4af"
  error: "#a73b21"
  on-error: "#fff7f6"
  error-container: "#fd795a"
  on-error-container: "#6e1400"
  error-fill: "#c44f34"
  canvas-dark: "#100e08"
  surface-container-dark: "#1c1a10"
  surface-high-dark: "#222015"
  on-surface-dark: "#ede5d1"
  on-surface-variant-dark: "#b1ab99"
  outline-dark: "#7a7565"
  outline-variant-dark: "#4c4839"
  primary-dark: "#d6c789"
  on-primary-dark: "#4a400f"
  primary-container-dark: "#5d5220"
  on-primary-container-dark: "#f3e3a3"
  primary-fill-dark: "#f2e3a2"
  on-primary-fill-dark: "#393001"
  secondary-dark: "#d1c6a2"
  secondary-container-dark: "#423b20"
  on-secondary-container-dark: "#c9bf9b"
  secondary-fill-dark: "#ede2bc"
  error-dark: "#f97758"
  on-error-dark: "#450900"
  error-container-dark: "#85230a"
  on-error-container-dark: "#ff9b82"
  error-fill-dark: "#c44f34"
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

The same component world supports English and Persian, light and dark themes, expressive or minimal motion. System reduced-motion preference overrides animation. Typography and geometry carry the identity across these settings; language and theme are functional modes of the same system.

**Key Characteristics:**

- Rounded flat and outlined surfaces.
- Gold seed with generated semantic foreground/container pairs.
- Nunito Latin, Vazirmatn RD Persian and isolated JetBrains Mono code.
- Fluid selections, growing surfaces and soft controlled springs.
- Keyboard focus follows each control's rounded silhouette.

## Colors

Settings exposes nine live palette controls: separate light/dark solid-action brightness, three role saturation multipliers, secondary/tertiary hue offsets, neutral surface tint and contrast strength. Confirmed defaults are brightness 85/90, saturation 50/75/100, hue shifts 0/30, surface tint 75 and contrast 0. Solid fill tokens (`*-fill`, `on-*-fill`, `*-fill-hover`) are separate from readable accent/Outline/Ghost ink and apply throughout the kit, including checked controls, sliders, calendar selections and progress. Foregrounds use actual gamut-mapped luminance and hover shifts away from the foreground tone. Color tuning persists locally, remains bilingual and has its own reset. The accent hue slider selects fully saturated, fully bright HSV seeds, while Reset retains the original gold seed.

The palette combines a gold primary family, muted sand secondary containers and warm neutral surfaces.

Button and action-icon pages present Filled, Tonal, Outlined, Ghost and Danger together. Other families use their single approved treatment and one Size control. Button retains its existing five-button row and removes the redundant Create project example. The icon catalogue is not duplicated; its selected-icon stage shows five action variants. Internal glyph motion, including Wi-Fi/Bluetooth slash drawing, is temporarily gated off globally while preserving static state changes and the animation code.

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

The showcase has 45 dedicated component pages. Its grouped outer sidebar is 248px wide, with a 20px gap, an 88px topbar and a maximum shell width of 1920px. One large rounded content surface contains the component introduction, live stage, variants and usage/props. Desktop frame padding is 48px 56px 28px; above 1600px inline padding becomes 80px.

At 1100px the sidebar becomes 220px and frame padding 36px 30px 24px. At 800px the layout becomes one column with drawer navigation, a 76px topbar, 12px outer gutters and frame padding 32px 24px 24px. At 480px gutters become 8px and frame padding 28px 18px 20px. Tables and code scroll within their containers. Direction-sensitive layout, range ends and alignment use logical properties or explicit RTL counterparts.

These page measurements describe the showcase, not a required composition for every consuming app. Launcher behavior belongs to PRODUCT.md and VALIDATION.md, outside the visual system.

## Elevation & Depth

No elevation shadows. Depth comes from tonal separation, thin outlines, overlap and a dimmed scrim. Dialogs use surface color; menus and floating content use container color. A 40% scrim separates overlays from the page.

**The Flat Surface Rule.** Keep resting and hovering surfaces flat; the expressive success alert alone may use the existing brief glow, which fades from a 20% primary-colored 18px halo to zero over 0.9 seconds.

## Shapes

All exposed frames and focus affordances are smooth and rounded. A zero-specificity default radius covers buttons, links, inputs, textareas, selects and tabindex targets; specific component silhouettes override it. Focus uses a 3px primary outline with 4px offset. Field wrappers use their own rounded focus-within border and inset outline.

Pill buttons, tabs, navigation items and segments retain pill outlines. Icon controls and day buttons are circular; checkbox corners remain softly rounded. Controls and container surfaces use the shared size radii defined below; roomier surfaces retain the same numeric radius as their buttons. Selected table row ends and Persian calendar range ends use logical rounded corners.

**The Whole Silhouette Rule.** Round the complete visible and focused shape, including all four bottom-sheet corners; bottom sheets, drawers and dialogs use the overlay radius. Floating content has the same CSS radius; the animated Popover component settles at the stage radius through its inline animation value.

## Components

### Buttons

All components share `variant: primary | secondary | tertiary | outline | ghost | danger` and `size: sm | md | lg`. Secondary and tertiary use the generated Material palette roles; danger uses error roles. Action surfaces use paired solid roles, while reading and field surfaces use paired container roles. Outline and ghost floating surfaces remain opaque for readable content. Medium preserves comfortable geometry; Small uses 28px desktop actions, 12px labels, short padding and tight gaps. Coarse pointers retain enlarged targets. There is no global density setting; use component sizes.

Button variant/accent/theme changes wipe the old color away in a clean circle expanding from the center with the ripple's fast-start easing. Hover uses a short color fade in both motion modes and never triggers a color wipe. Reveal duration and size damping are temporarily tunable under Advanced. Size springs use stiffness 460, damping 40 and mass 1 for a smooth settle, independently configurable through `sizeMotion`. Component size changes share the Button spring for actual width, height, padding, typography, gaps and radii; this lets containers and neighboring content follow. Press scaling remains centered on a stable compositing surface. A matching inverse transform keeps the content layer at its resting visual size and position throughout press, hold, release and interruption. Minimal/reduced motion suppresses geometry springs.

Confident pill controls with flat states. Filled, tonal, outlined and text variants share the frontmatter padding and variable control height. Filled hover mixes 92% primary with its foreground; other variants hover with 75% primary-container against transparency. Focus follows the pill. Expressive press compresses the button surface around its center using the configured shared spring. The content layer cancels that scale on each frame, so labels, leading/trailing icons and loading indicators keep their resting size and position. Corners follow the press depth and restore on release; disabled/loading states prevent interaction. Current control heights are 28px, 48px and 58px for Small, Medium and Large; shared appearance tokens own padding and resting radii.

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
- **Do** respect RTL and system reduced-motion preferences.
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

Ripple expansion uses a pronounced fast-start, slow-finish cubic-bezier(0.15, 1, 0.3, 1) over 550ms. Opacity remains at the authored 20% default.

Fast-start defaults to 85. A quick release speeds the existing ripple timeline to 2x, preserving its current progress, waits for full expansion, then fades over 160ms. A temporary release-speed slider spans 1x to 5x. Minimal mode retains ripple expansion and links radius to its expansion and fade; system reduced motion retains a static wash without expansion or radius changes.

Repeated presses retain overlapping ripples. Minimal-mode radius follows the maximum active ripple envelope, avoiding a zero-progress reset when a new ripple begins. Keyboard feedback supports Enter and Space, centers synthetic keyboard ripples, suppresses repeated activation while held, and cancels on blur. Slider Arrow, Home and End controls remain native Radix behavior.

Button and Icon Button showcases omit extra disabled/loading/long-content state switches and simulated action messages; Button animation tuning remains available. The Icon Button demo relies on each icon's own interaction listeners, without shared selected state across examples. Library state APIs remain available to consumers.

The dedicated Icons page at #/components/animated-icon lists 4,301 official Rounded symbols plus 21 compatibility aliases, locally bundled. Search supports canonical names and common Persian keywords. A selected glyph has a replay button and copyable imports. Temporary controls tune size, duration, stagger, fill timing, and connection stroke weight/slash delay. The full pack and gallery load only on this route; core controls include 31 defaults.

Filled Material glyphs use one shared center-out circular SVG clip reveal, with no outline tracing or geometric distortion. The circle originates at the viewBox center and expands to cover its diagonal. Default fill time is 400ms with fast-start strength 85%; duration multiplier applies. The gallery shows fill controls for filled glyphs and drawing/stagger/slash controls for connection strokes. All remain release-triggered and static in minimal/reduced mode.

Icon animation classification follows visual construction, not SVG serialization. The generator compares official FILL=0/1 artwork and thinness at 192px, skeletonizes qualifying glyphs, simplifies paths, and measures coverage to construct reveal masks. Original Google vector contours remain visible, preserving the exact resting silhouette. Thin symbols such as menu/check/close draw; solid and mixed pictograms fill from center. A generation report records classification metrics for every canonical name. The current heuristic assigns 950 stroke reveals and 3,351 center-fill reveals; it cannot infer semantic animation choreography. Only Wi-Fi/Bluetooth retain authored state/slash paths. The gallery derives tuning controls from the same data; connection icons alone show stroke weight and slash delay. Generated masks cap cumulative stagger at 600ms.

## Selection-control refinement

Selection controls override the earlier five-variant rule: Toggle is Outline off / Primary on; ToggleGroup is Ghost off / Primary selected; Checkbox is Outline off or partial (minus only) / Primary checked, with filling hooked to press depth like Toggle; RadioGroup is outlined with a centered Primary dot and the same hooked filling; Switch has an Outline track off / Primary track on and a thumb that swaps Primary and Outline colors with its track, with animated connection icons; Slider uses split Primary/neutral tracks with continuous and stepped values, expressive movement, and press/release feedback. These controls render once in the showcase and expose size rather than action-color variants. Respect minimal and reduced motion. Explicitly enabled icon animations are allowed for Switch while the global default icon pause remains in place elsewhere.

All forms are Outline-only and render once per showcase page, including selects, autocomplete, OTP, file inputs and date/time controls. Text Field and Textarea rest with 8px horizontal padding (6px Small, 10px Large). Focus springs their horizontal content inset outward by 8px without moving their outer boundary. Textarea uses compact vertical padding. Reduced motion applies the inset immediately.

Selection labels transition from weight 500 to 700 when active. Toggle Group supports mouse and touch scrubbing, commits the preview on release, and cancels on a vertical touch scroll or pointer cancellation. Holding enlarges only the inner selection pill with a spring; the outer group does not scale. Icon Button previews share a compact wrapping row. Reduced motion suppresses pill scaling and weight transitions.

Sliders use split active/inactive tracks with a gap around each handle, rounded outer caps and an end marker, following the supplied Material Design 3 Expressive reference. Track heights are 12/16/24px and solid handle widths are 3/4/6px for Small/Medium/Large; handle lengths are 32/44/52px, with at least a 44px pointer target. Press/release narrows the handle with expressive easing. The handle and split track share one continuous physical spring for track clicks, dragging and release, inspired by the supplied Image Comparison Spring demo. A damping ratio of 0.7 gives its 0.3 bounce character; changing the pointer target preserves momentum instead of restarting a fixed-duration tween. Values remain quantized while the visual spring can move between steps; release settles onto the committed step. Expressive narrowing and release rebound remain active throughout. Keyboard changes and 5%-of-range wheel changes use a 340ms expressive glide. Held navigation keys keep the pressed handle active and animate each repeated change until release. Mouse selection hides the focus outline throughout the interaction and after release; keyboard navigation restores it. Fully empty/full tracks animate their rounded caps. Range sliders apply press narrowing and gap changes only to the active handle. Values stay in the heading, with no floating tooltip, glow or shadow.

Switch dragging snaps the thumb to the nearest endpoint with a short eased transition and no spring or bounce.

Toggle Group labels remain stationary while the selection pill slides behind them.

Toggle → Advanced text morph includes Fade (0–100%). Zero keeps text fully opaque during blur; 100 fades it out at the swap. Toggle and FAB text use the same duration, blur and fade settings. Library consumers can share these with `MaterialFluidProvider textMorph={{ duration: 100, blur: 6, fade: 0 }}` (milliseconds, pixels, percent). Reset restores the shared defaults.

Checkbox ticks draw in over 180ms once the fill visibly covers the whole checkbox, without waiting for spring settling. Partial minus marks remain immediate. Radio rings and dots share one SVG coordinate system at every size. Switch thumbs anticipate a click with a small movement on press and complete the snap on release. Sliders initialize at their values without load animation.

Icon source: use Material Symbols Filled Rounded by default for every new icon. Use Material Symbols Outline Rounded only when the filled symbol is unavailable.

Select, Combobox, and MultiSelect share an outlined, rounded dropdown below the field, with 6px gaps between options and a bounded scrollable list. Select no longer expands from the selected row. MultiSelect includes a search field with no visible title (its accessible label remains); selected options use an animated Primary highlight without checkmarks. Combobox always explains whether custom values are allowed and exposes an explicit Add option when enabled. Showcase lists include 16 options for scrolling, with both restricted and custom-value Combobox examples.

Select, Combobox, MultiSelect, and MultiSelect search keep fixed horizontal text spacing on focus; these selection fields do not use the text-field focus gap animation.

DatePicker and TimePicker keep static text insets on focus. DatePicker starts empty with `----/--/--`, selects dates only through its calendar overlay, uses the same button surface and shared icon feedback as DateRangePicker, without an input or caret. Calendar and year-grid updates wait for committed year-editor input; typing in the year editor does not rerender the calendar. TimePicker supports 12/24-hour display, with an AM/PM ToggleGroup in the 12-hour overlay. FileInput has a large dashed drop area and separate file rows with progress, completion, retry, and removal. Small uses an icon/text/action row, with the action wrapping below the text when its container is narrower than 300px; Medium and Large retain the centered dashed drop area. Upload metadata and helper text stay at least 12px. Progress uses a flat Primary fill on a tonal track; success and failure have distinct text colors, and the upload glyph uses On Primary Container for dark-mode contrast. Its target, font, padding, and actions scale across Small, Medium, and Large. The visible file-count limit defaults to one in single mode and five in multiple mode (`maxFiles`); both picker and drop enforce it without discarding the existing selection. Upload progress comes from an application callback; showcase uploads are explicitly simulated. TextField/Textarea/custom Combobox values support optional `maxLength` and live counters, hidden via `showCount={false}`.

Forms polish: dropdowns anchor to the visible control rather than label/helper blocks. Option labels wrap inside the menu and reserve space for indicators; selected MultiSelect rows retain a contrasting inset keyboard focus outline. Helper text and counters can wrap onto separate lines at narrow widths, with the counter aligned to the logical end in RTL. Native form reset synchronizes character counters and file chips. Combobox keyboard navigation skips disabled options and respects read-only values. Calendar view width is reserved only while month/year selection is open, so normal day grids can resize with component size changes.

Navigation uses a single treatment per component: Primary selection on neutral tab/navigation surfaces, Ghost breadcrumbs and links, and an Outline app bar. The catalogue sidebar shares animated Primary pills. The 12/24-hour demo selector sizes to its labels. Scrollbars retain native scrolling and dragging, with Primary thumbs, a rounded track over a themed gutter, and instant hover/hold color feedback. The thumb grows only while held; scrollbar transitions are disabled.

Stepper places labels below its circles, with a continuous connector track between neighboring circles. Completed connectors fill Primary in the reading direction, and completed steps reveal an animated Material tick. Minimal and reduced motion apply state changes immediately.

Surfaces and overlays now expose one treatment per component, overriding the earlier five-variant catalogue rule. Cards, lists, accordions, tables, dialogs, drawers, sheets, menus, and popovers share opaque neutral Outline surfaces. Primary communicates selection; Ghost handles secondary and close actions. Avatar initials are unselectable, sizes are 32/44/64px, and AvatarGroup overlaps members with a remaining-count avatar. Badges are thin semantic pills, Primary by default, with distinct neutral/success/warning/info/error states. Accordions use separate rounded items and animated height. Table selection uses the shared Checkbox without header-only dimensions or filling.

The desktop catalogue collapses into a compact family rail. The header measures its available width and moves global controls into a three-dot popover when they no longer fit. Native scrollbar tracks and gutters are transparent; the html/body canvas follows the active surface color and color scheme. Scrollbar thumbs retain instant hover feedback and grow only while held.

Toast and Snackbar share one notification queue per MaterialFluidProvider. The visible toast stack fits a measured viewport-height budget; additional notifications wait behind a count badge and begin their dismissal timers when promoted. Image toasts use compact thumbnails; the center retains full previews. Opening the center closes all overlay notifications and routes new arrivals directly into history. Dismissed toasts remain in NotificationCenter history until cleared. The center is a rounded, scrollable sidebar with timestamps, unread state, image previews, actions, and an optional bounded reply composer. Snackbar remains an API alias and its former catalogue route opens Toast. A dedicated NotificationCenter page replaces its catalogue slot. Progress uses a Primary pill and a droplet traveling from the unfilled end into the current fill; Minimal and reduced motion remain immediate.


Progress uses a traveling Material Expressive wave with rounded strokes, a separated track and a stop dot. Alerts briefly fade a semantic glow back to their resting neutral surface. Icon-only buttons use centered 20/24/28px glyphs across Small/Medium/Large, with proportionate 16/20/24px loading indicators; embedded field icons use 20/22/24px glyphs inside separate 28/36/40px action surfaces at Small/Medium/Large and retain the field edge inset. Chip remove glyphs stay at 14px rather than inheriting the field action scale. Select chevrons compensate for native glyph whitespace to match number-field icon weight; single-select and range-date trigger icons use the shared button press hook, rounded-corner response and ButtonRipple renderer without nesting buttons. Embedded controls retain the hover tint and Ghost colors used by grouped icon buttons. The Small field retains its 36px resting height while its icon surface is smaller. The showcase Size selector uses the standard Select trigger with an explicitly Start-positioned label. Selection-field icon surfaces match password and combo-box actions; number steppers use the shared ButtonGroup. The startup glyph pack includes overflow, collapsed navigation, sorting, and filter symbols without requiring the icon catalogue route.

DataTable has fixed column geometry across sorting and pagination, responsive horizontal scrolling, ascending/descending/unsorted glyphs, and optional per-column search and value filters. Its showcase adds Column filters immediately after Long content. Column-edge grips support pointer dragging, keyboard resizing, and double-click/Enter fitting to loaded data. Date-picker popovers have a stable size per variant, responsive seven-column grids, and bounded scrolling rather than clipping on short screens. Standalone Chip was removed; selectable/removable tags remain inside MultiSelect, while FileInput uses removable file rows. The active catalogue is defined in the Component catalogue section.


Table anchoring follows the desktop convention: the leading data column fills remaining space from the start edge, while trailing columns align to the end and resize from their leading borders. Resize grips are vertically centered. The stable disabled-filter reference remains unchanged to prevent the pagination update loop.

Avatar names appear in keyboard/hover tooltips. Notification history exposes a per-item read action with an unread bell/read double-check and an icon on Mark all read. EmptyState has an explicit 24px radius. Progress uses continuous wave-phase motion; alerts flash a fading semantic glow in expressive mode. BottomSheet has a real mouse/touch drag handle and draggable heading, collapsed/expanded heights, direct downward movement, resisted upward movement, release-to-snap/dismiss, cancellation recovery, and keyboard sizing. Its body scrolls independently and its actions remain available.

Select, Combobox and MultiSelect expand the field outline into a continuous options surface without moving surrounding content. Height and corners morph over 300ms, including filtering, interrupted transitions and collapse; the chevron reverses over 400ms. Option rows rise 8px from a slight scale and 4px blur over 350ms, staggered by 50ms up to 250ms. The surface retains MaterialFluid colors and flat styling, follows upward collision placement, and skips spatial animation in Minimal or reduced-motion mode.

Persian language displays Persian digits in number fields (including editing, steppers, time units and calendar year editors), date fields and both calendar systems. Native number values and date-only callbacks retain their canonical numeric/ISO data. Date ranges use `----/--/-- - ----/--/--` for empty boundaries and zero-padded `yyyy/MM/dd` dates in chronological left-to-right order.

Calendar reuses a stable date-library adapter and component definitions for both systems. The adapter keeps a bounded date-label cache and localizes digits once, avoiding per-label Intl formatter construction and duplicate Jalali formatting while retaining expressive navigation.

RTL calendar and pagination arrows follow navigation direction. Playback groups keep conventional left-to-right media order, and numeric page ratios are isolated left-to-right while their labels remain localized.


Field labels default to Top, with `labelPosition` Top/Start/None variants and optional ComponentAppearanceProvider defaults. Start follows reading direction and keeps supporting text in the control column. None hides only the visible label and preserves its association. The showcase Size and Label selectors use Start labels; example label placement is adjustable. Compact option rows use 8px gaps, 6px/10px padding, and 32px minimum height to avoid wrapping ordinary labels. Expanded option surfaces keep the captured field radius throughout opening and closing.

Tabs, navigation rail, side navigation, bottom navigation and TOC share ToggleGroup's outlined container, Primary pill, selected ink and bounded press spring. Pagination uses explicit centered square controls and a centered horizontal overflow glyph, with bounded horizontal scrolling on narrow screens rather than wrapping controls onto another row. Stepper highlights live inside their numbered circles, so ink and selection cannot diverge; numbers follow locale digits.

Icon-only action sizing is shared by IconButton, `Toggle iconOnly`, grouped icon actions, and icon-only ToggleGroup segments: 20/24/28px glyphs at Small/Medium/Large. Custom action glyphs use `mf-action-icon`; glyphs beside text use the smaller 16/22/24px inline scale. Toggle no longer relies on showcase-specific surface or heart dimensions.


Slider Start/End layouts use bounded label and track columns so the track retains usable width; Top/Bottom retain full-width tracks. Switch captions are fixed at End, with no placement selector. CardGroup presents native radio or checkbox inputs as outlined selectable cards; selected cards use Primary Container, and optional decorative symbols can be Material icons or emoji. CardGroup keeps its label at Top. Small cards are horizontal rows with a symbol, text, and trailing selection marker; Medium and Large retain vertical card content. Symbols, Material icons, and emoji share a centered 20/24/28px glyph box and independent 36/44/52px surface.

CardGroup emoji use a centered SVG text box with an explicit emoji font stack, avoiding ordinary text-baseline offsets inside the symbol surface.

Checkbox, radio and switch labels remain at the logical end of their controls; slider labels remain at the top. Their positions are fixed even when a surrounding appearance provider sets another label position.

Form field labels offer Top and logical Start only. Goal-style NumberField always uses Top, including when a surrounding provider requests Start.

The whole kit uses seed-derived Material tonal-spot roles for background, surfaces, text, outline, selection, feedback and actions. The showcase keeps its main page in a distinct surface-container-low against the outside background. Filled uses primary/on-primary; Tonal uses secondary-container/on-secondary-container; Outlined uses transparent with outline-variant and on-surface-variant; Ghost uses transparent primary ink; Danger keeps its red semantic treatment. Dark Filled defaults to +10 tone; dark Tonal defaults to -10 tone and 150% saturation. Settings expose independent action adjustments and preserve saved choices after the one-time migration. Foregrounds are fitted for readability. Material Color Utilities now supplies the same 2025 dynamic roles as the reference. Earlier color variant names remain supported.

Component color design applies Material roles to selection controls, fields and dates, navigation, cards and tables, progress, notifications and overlays without changing geometry or motion. Settings offers Material / Previous to restore the component treatment immediately before this redesign; the choice persists independently of the seed and color adjustments. Both designs retain the two-tone showcase frame.

## Shared shape and label policy

Controls share a base resting radius for each size: Small 14px (28px button), Medium 24px (48px button), Large 29px (58px button). Unscaled surfaces use Medium. A standard-height button is a pill. Framed containers add their real padding inset and border to the base radius, so their outer curves follow the controls inside. Icon actions are circular at rest and derive their radius from half their actual diameter. Preserve the existing radius compression linked to press depth and ripple progress. Portalled surfaces inherit the component size, and expanded select outlines retain the trigger's measured resting radius.

Form labels support Top, Start, and None. None visually hides the associated label while preserving the accessible name; hints, errors, counters, and required state still work. Goal-style number fields allow Top or None.

Select, combobox, and multiselect keep the continuous outline spanning the field and list. The popup element itself stays transparent: only the animated outline pseudo-element paints a background, so no full-height rectangle appears behind the list during opening or closing.

Field labels and checkbox, radio, and switch captions retain accessible naming but do not activate or focus their controls when clicked. Use the control itself to interact.

## Readability and shared composition

Tonal Spot remains the accent generator. Default neutral chroma is reduced (surfaceTint 25) so the light theme separates text, actions, and surfaces instead of tinting the whole page gold. Neutral text and transparent-action ink target 7:1 contrast across all neutral surface layers; control boundaries retain 3:1. Color adjustments are clamped to readable ranges. Existing custom values persist; former neutral-tint defaults migrate once.

Tree owns the main catalogue and nested TableOfContents. Their rows use the same size and radius tokens; no generic inline-link rule may override their silhouette. The core icon registry includes the real palette glyph. Example canvases use a 20px dot grid inside the shared rounded stage, with controls and metadata on solid surfaces.

Avatars choose a deterministic miscellaneous color from their name, with an explicit color override. Blue, teal, green, amber, rose and violet are independent of the accent seed and paired for both themes. Badge status meanings reuse these colors. Toasts, tooltips and other floating surfaces use the shared raised surface and its content roles; there is no inverse toast exception.

Tree supports `iconMode="all"`, `"none"`, and `"parents"` (top-level icons only). Missing or hidden icons never reserve a slot. Expansion chevrons appear only on branches. All Tree captions and expand/collapse actions use neutral text; the background carries selection. A single `.showcase-canvas` owns the dot grid across all variant previews, separated from its solid header by a divider. The time picker centers its AM/PM group independently of reading direction.

## Shared size motion and calendar geometry

Every supported size change uses the Button sizing spring (stiffness 460, damping 40, mass 1 by default), including fields, choices, navigation, surfaces, and floating content. The provider animates measured CSS geometry only when a size class changes; Button retains its own geometry/press animation. Explicit Spinner and icon dimensions use the same spring. Initial mounts and responsive layout changes stay natural; interrupted transitions start from the visible dimensions, release their temporary geometry on completion, and respect Minimal/reduced motion.

Calendar header controls share the calendar size. Previous/next arrows flank an aligned month-then-year caption, with direction following the locale. Weeks containing no current-month days are omitted when outside days are hidden. Date ranges paint a continuous cell band with round endpoint controls and mirrored logical direction.

Progress and Spinner use Material Expressive linear and circular waves. Determinate values retain their accessible percentage, zero/completion flatten the linear wave, and unknown values omit aria-valuenow. Rounded strokes, a separated inactive track and a linear stop dot preserve the indicator anatomy. File upload rows reuse Progress. Continuous wave motion pauses offscreen and in hidden documents; Minimal/reduced motion preserves a stationary visible indicator.

Progress has two structural presentations: continuous Wave and Segmented Wave. Either accepts an optional percentage/status/remaining-time row. Segment weights define custom ranges, such as 20% initialization and 80% processing; alternating segments invert the wave. The default wave uses 60px wavelength, 20px height, 31px/s tailward velocity, 5px stroke and 20px inactive track. Spinner retains a circular track with a rotating wavy progress arc. All waves pause offscreen and respect reduced motion.


## Component catalogue, 2026-11-08

The only visible component list contains 45 entries grouped as Actions, Selection & input, Navigation, Containment and Communication. Tree owns desktop and mobile catalogue navigation; filtering, counts and previous/next use the same ordered data. No separate reference branch or comparison page appears. Preserve MaterialFluid's existing fonts, color roles, radius policy, press/ripple feedback and saved motion preferences. Compatibility APIs and direct routes do not add entries to the visible catalogue.

## Motion playground

The #/motion page is an Operate surface for tuning interactions: one large active preview beside grouped parameter controls, stacked on narrow screens. Reuse the existing warm palette, type, compact controls and rounded outlines. Keep examples separate from the original catalogue. Physical spring, duration spring and tween controls appear only where used; interactive hold/release gestures remain direct. Reduced-motion and Minimal modes remove animation while preserving actions. Accordion has a stationary title, an empty hold preview, an opening-only blur reveal and clear content during closing. No alert glow. Experimental settings persist per example without changing kit defaults.

Shared springs use unit-aware stopping tolerances to end at the exact target once residual motion is smaller than the useful visible range. Preserve continuous subpixel movement during the main motion; do not round every frame or alter the owner's selected spring physics to hide the tail. Pixel, scale/progress and angular channels have separate thresholds.

Moving selection pills use Button Press & Ripple's hold-linked depth and radius deformation, returning with the button press spring on release. Travel between items retains its separate selection spring. The playground previews the exported Tabs component and links its depth/radius/press controls to Button Press & Ripple. Mouse and touch dragging select the tab under the pointer; pointer capture keeps the pressed shape across tab changes, cancellation restores the previous selection, and vertical touch scrolling remains available. Alert Dialog's owner-selected defaults are stiffness 500, damping 30, mass 1, entrance scale 0.95 and fade 0.15s, with a centered anchor.

Dropdown menus are non-modal: the page and scrollbar remain usable, with Motion providing their saved entrance/exit. Notifications enter from above and displace the stack downward. Staggered content begins clearing its blur immediately, independently of per-item appearance delays. The owner excluded Stagger/layout from the remaining-default promotion.


Shared components expose orientation, density and readability variants where useful. Badge notification dots use the same semantic palette at 6/8px; compact text badges are 16px high. Existing spring/ripple recipes remain preserved; the active catalogue is the single list defined above.


Neutral + seed is an additional palette preset. It uses white/charcoal neutral layers, quiet decorative borders, contrasting control boundaries, and HCT tone-86 primary fills in both themes with dark paired text. Surface tint and accent strength vary independently. Plain accent ink stays readable on neutral layers. Fonts, radii, motion and the original color designs are preserved. The showcase starts in Neutral + seed; consumers retain the standard provider default unless selected explicitly.

## Button configuration additions, 2026-11-08

The Button page presents one live example with Example Presets, Appearance, Content and Behavior controls underneath. Reuse exported fields, switches, selectors, dialogs and pagination; the icon selector searches the complete optional icon pack. A shared configuration model drives both the preview and Web Components/React code. Configuration controls stack on narrow screens. Manual changes retain the localized label and select Custom; Reset example restores the initial preset. Motion defaults remain fixed.

Button-only XS and XL use 24/96px desktop heights, 12/48px resting radii and 14/32px inline glyphs. Existing 28/48/58px sizes and their 14/24/29px radii remain. XS retains a 44px coarse-pointer target. Five sizes have distinct compact-to-prominent use cases and come from componentSizePolicy. Selected toggles retain rounded shapes and use paired selection roles. There are no Square or Elevated variants on Button or future components. Press compensation remains on the content layer, including progress indicators.


## Fixed component motion defaults, 2026-11-08

Component pages have no Advanced panels. Button icons inherit their Appearance size, with no independent icon-size or ripple option in either code format. Button color/size/press/ripple overrides, provider buttonMotion/textMorph overrides, and icon/switch timing knobs are removed from public APIs. Keep all authored default values and animations. Private composition rules retain passive ToggleGroup segments and Calendar/Collapsible sizing behavior. The separate Motion playground retains isolated experiments through a private context. Active is a visual held hover background; it does not select, disable or activate the button.


## Configuration and documentation tabs, 2026-11-08

Catalogue pages open in Configuration with the live component and configuration controls only. Usage code, Web Components/React recipes, API tables, behavior notes, in-page documentation navigation and previous/next links live in the separate Documentation tab. Reuse exported Tabs and keep configuration state when switching tabs; changing component routes returns to Configuration. Button configuration follows the preview, Configuration heading and Example Presets, Appearance, Content and Behavior groups. Remove the preview footer caption and catalogue ordinal from this surface. Keyboard-visible focus on enabled Button and IconButton uses the same surface background as Active while retaining the focus ring. Focus does not change toggle selection. Motion drives authored springs/ripples; CSS owns styling and simple transitions; GSAP is not used.


## Foundation adaptation, 2026-11-08

The shared accent picker rotates hue using the original gold seed's HSV saturation (88/238) and brightness (238/255), rather than switching to fully saturated RGB colors. Hue labels are rounded to integer degrees; the 48-degree default position preserves the seed's original fractional hue so manually returning to it reproduces #eedd96 and its complete scheme exactly. Other selected hues use the same saturation/brightness profile. This is seed generation, not a per-component color override.

Neutral + seed applies the selected Material algorithm's primary, secondary, tertiary and neutral hue/chroma families before owner lightness, chroma-cap, tint and accent-strength rules. Tonal Spot retains the exact authored seed-derived palette for compatibility. Changing algorithms must update shared component tokens, not only the raw palette explorer. Untinted neutral surfaces and the independent status palette remain stable. The separate Previous design remains the legacy color engine.

Before the foundation work, a complete source/design snapshot (536 files) was saved and verified in backups/MaterialFluid-before-foundations-20261108-180759.zip. The foundation architecture adapts selected MIT source from Grenish/expressive revision eb96d3df46790079ae5bf7b22d721491260c1485; provenance is in reports/foundations-2026-11-08/upstream-source.json. Keep the owner theme and motion layers authoritative. There is no elevation system, shadow treatment, GSAP dependency, Tailwind migration or component replacement.

The provider uses createFoundationTheme to combine the existing Material/Previous/Neutral + seed color engines, independent status palette and new semantic foundation variables. Tonal Spot remains the default; nine generation algorithms are available without changing saved/default palettes. All 24 pre-migration default color matrices remain exact. Owner fonts, original component metrics and 14/24/29px control radii remain. The exported Foundations namespace adds role-driven type styles, scoped CSS generation, 35 Material shape paths and morphing utilities, shared interaction/a11y policy, color-pair checks and a Motion adapter using the authored press/resize/dialog/popup springs. Effects retain fixed fades rather than spatial overshoot. No new per-component tuning props are added.

The five foundation pages use their own Tree alongside the unchanged 45-component catalogue: Color, Typography, Shape, Motion and Accessibility. Typography/Shape/Accessibility separate Configuration from Documentation. Color keeps the original color page and adds the algorithm/palette explorer. Motion keeps the existing isolated experiments and adds a live overview of owner curves. Reference foundation structure is adapted to MaterialFluid visuals. Individual component copying is deferred to later owner requests. Accessibility checks demonstrate actual active color pairs and focus behavior; do not claim full accessibility certification.

## Foundation workbenches and finite motion, 2026-11-09

Typography has smooth 240 ms ease-out metric changes, semantic text/article/MathML/code/quote/keyboard/scientific examples, and bold, italic, underline, strike, per-line rounded highlighting, subscript, superscript and keycap formatting. Shape uses one keyboard-accessible grid with shared selected styling and continuous interrupted morphs. Precomputed samples of the licensed outlines avoid SVG sampling during selection. Interaction is removed from foundation navigation; the five foundation pages remain separate from the 45-component catalogue.

The owner now requests finite spatial curves: two endpoint crossings for Resize, Dialog and Popup, three for Press, followed by a 120 ms monotone finish. Shared spatial animation uses these profiles; typography, opacity and color retain smooth non-spring transitions, and continuous progress/wave animations retain their cycles. The motion overview has synchronized playback, seeking, speed, timestamps and bounded sample travel inside compact filled chips. Reduced motion remains authoritative.

Button configuration uses grouped choices. Only Tonal, Outlined and Ghost/Text accept toggle behavior, with Primary fill/paired ink while selected and their own treatment while off. Filled and Danger remain ordinary actions. Both framework recipes follow this restriction. Progress replaces the icon slot, inherits its size variant and stays centered in either start/end position. Re-rendering a parent must not remeasure unchanged Button geometry or colors. Dialog keyboard traversal includes body controls and restores opener focus. Accessibility presets demonstrate keyboard, validation, repeatable live status, contrast and reduced motion; automation is not screen-reader certification.

## Action refinements, 2026-11-09

Button and IconButton support Emphasize as an ordinary toggle treatment with paired Primary fill and ink in both states. Tonal, Outlined and Ghost/Text retain their own off treatment and Primary on treatment; Filled and Danger do not toggle. IconButton has five sizes and narrow/default/wide widths, with no Square or Elevated option. A nullable selectedIcon uses the same Material symbol, outlined off and filled on through the authored reversible reveal; a separate selectedIcon swaps artwork. selectedLabel optionally names the selected action. Do not expose Playback/playing modes or new animation tuning parameters. Both action pages use grouped Example Presets, Appearance, Content and Behavior; React and optional Web Component recipes remain in Documentation.
