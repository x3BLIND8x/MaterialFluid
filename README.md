# MaterialFluid

The showcase has one 45-component catalogue grouped into Actions, Selection & input, Navigation, Containment and Communication. Every entry uses MaterialFluid's shared components, theme and fluid motion. Component APIs remain available except for the explicitly removed motion-tuning and independent Button icon-size options.

A Material-inspired React/TypeScript kit with fluid interaction motion, English/Persian support, and a 45-page showcase.

Open **Motion playground** in the sidebar (`#/motion`) for ten interactive animation studies. Tune physics, timing and component parameters with sliders or exact numeric inputs; use presets, replay, reset, copy configuration, or export all settings as JSON. Each example saves separately on the current device. The playground does not change other pages' defaults. Component studies use private preview settings; they do not expose public tuning props.

## Open the local showcase

On Linux, run `./Open\ Showcase.sh` from the project folder (or `bash "Open Showcase.sh"`). It installs missing dependencies, starts the showcase, and opens your default browser. Use `bash "Open Showcase.sh" --no-open` to run without opening a browser. Keep the terminal open; press Ctrl+C to stop the server.

On Windows, double-click **Open Showcase.cmd**. It installs dependencies when needed, prints the IP, port and clickable local URL, and opens your **default browser**. Closing the browser leaves the server running. Close the terminal or press Ctrl+C to stop it. If port 5173 is occupied, the launcher chooses the next available port and prints the actual address.

Requires Node.js 22.12 or newer and npm. Initial dependency installation needs internet; normal local use loads fonts/icons from this project.

To prepare a clean transfer archive for another computer, run `npm run handoff`. It creates `MaterialFluid-v0.2.0.zip` with the source project inside and excludes caches, installed dependencies, build outputs, and test artifacts.

```sh
npm ci --cache .cache/npm
npm run dev
```

The command above runs the development server without automatically opening a browser. `node scripts/launch-showcase.mjs --no-open` runs the managed launcher without browser opening for automation.

## Build and use the package

```sh
npm run build
npm pack
# From another project:
npm install /path/to/materialfluid-0.2.0.tgz
```

The library builds to `dist`; the separate showcase builds to `showcase-dist`. No package is published automatically. React and ReactDOM are peer dependencies.

```tsx
import { useState } from "react";
import {
  MaterialFluidProvider,
  Button,
  Switch,
  AnimatedIcon,
} from "materialfluid";
import "materialfluid/styles.css";
// Optional: include bundled, self-hosted typography.
import "materialfluid/fonts.css";

export default function App() {
  const [enabled, setEnabled] = useState(true);
  return (
    <MaterialFluidProvider
      locale="en"
      theme="system"
      motion="expressive"
      accentSeed="#eedd96"
    >
      <Switch label="Wi-Fi" checked={enabled} onCheckedChange={setEnabled} />
      <AnimatedIcon name={enabled ? "wifi" : "wifi-off"} active={enabled} />
      <Button onClick={() => console.log("Saved")}>Save changes</Button>
    </MaterialFluidProvider>
  );
}
```

## Settings and styling

`MaterialFluidProvider` accepts `locale: 'en' | 'fa'`, `dir: 'ltr' | 'rtl'`, `theme: 'system' | 'light' | 'dark'`, `motion: 'expressive' | 'minimal'`, and a six-digit hex `accentSeed`. Persian defaults to RTL. System reduced-motion preferences override movement in both modes. `useMaterialFluid()` exposes the effective context, including `reducedMotion`.

The provider scopes CSS tokens, including `--mf-primary`, `--mf-on-primary`, `--mf-primary-container`, `--mf-on-primary-container`, `--mf-surface`, `--mf-on-surface`, `--mf-outline`, and `--mf-control-height`. Floating surfaces remain inside the corresponding provider so they inherit theme and direction. Use `className` and `style` where listed by component types; settings are application-controlled. Only the showcase persists settings in localStorage.

All visible surfaces, controls and focus boundaries use rounded geometry, including calendar ranges, table headers, scrolling containers and tooltips. There are no elevation shadows. A brief success glow is the only deliberate halo treatment.

`createTheme(seed, dark)` returns CSS custom properties. `motionTokens` exposes the shared spring and timing defaults. Importing the package does not automatically load fonts. The optional font stylesheet uses relative bundled WOFF2 assets: Nunito for Latin ranges, Vazirmatn **RD** for Persian ranges, JetBrains Mono for code. Application font overrides remain possible.

All controls support conventional native attributes or their documented primitive attributes. Components with state offer controlled and uncontrolled APIs; see the exported TypeScript declarations and individual showcase pages. Icon-only buttons require `label`. `AnimatedIcon` is decorative unless supplied a `label`.

The Icons page contains all **4,301 official Material Symbols Rounded** plus 21 compatibility aliases. Thin, fill-invariant symbols use generated stroke reveal masks over Google's original contours. Solid and mixed pictograms use center-out filling (fixed 0.4s duration and 0.85 easing strength). This geometric classification is a heuristic, not a guarantee of semantic interpretation; see `src/kit/icon-generation-report.json`. For example, Rounded Filled `content_copy` includes a solid rectangle and uses center-fill. Wi-Fi/Bluetooth alone retain hand-authored state/slash drawings (350ms, 70ms stagger, 150ms slash delay). Use `<Switch label="Wi-Fi" icon="wifi" />` or `icon="bluetooth"`; connection timing remains fixed to the authored defaults.

Action-icon previews are currently paused, including click and keyboard activation. Connection-switch icons retain their independent state animations. Minimal/reduced modes show final glyphs. The gallery searches and paginates the complete pack, without temporary timing controls. The full pack loads on demand in the gallery or component icon picker. The core package includes 45 default glyphs; register any additional icons before rendering:

```tsx
import { AnimatedIcon, registerMaterialIcons } from 'materialfluid';
import { materialIcons } from 'materialfluid/icons';

registerMaterialIcons({ rocket_launch: materialIcons.rocket_launch });
// Or registerMaterialIcons(materialIcons) for the complete pack.
<AnimatedIcon name="rocket_launch" />;
```

To regenerate, install Python build dependencies with `python -m pip install -r scripts/icon-requirements.txt`, then run `npm run icons:generate`. The script downloads Google's variable font and codepoint list at the revision in `scripts/material-icons.lock.json`, verifies SHA-256, exports every glyph as SVG path data, compares FILL=0/1, and skeletonizes thin shapes into reveal masks. `--offline` uses verified cached sources; `--update` explicitly pins a newer upstream revision. These tools are build-time only; consumers need neither Python nor network access. The visible artwork stays vector-based and locally bundled under Apache-2.0.

## Date and table contracts

Dates use Gregorian **date-only strings**, `YYYY-MM-DD`, regardless of whether the display calendar is Persian or Gregorian. No UTC serialization is used. `Calendar`, `DatePicker`, and `DateRangePicker` accept `calendar: 'gregorian' | 'persian'`; display defaults to Persian for `locale="fa"`. Calendar choice is independent of locale. Date ranges are `{ from?: string; to?: string }` and may be partial while selecting. `DatePicker` displays `YYYY/MM/DD` in the chosen calendar and selects dates only through its calendar overlay. Its forwarded ref points to the trigger button, matching DateRangePicker. Clicking the field or arrow, or pressing Enter, Space or Arrow Down, opens the calendar; typing and paste do not change its value. `min` and `max` are inclusive. `parseDateOnly`, `toDateOnly`, and `formatDateOnly` are exported.

`DataTable<T>` accepts typed TanStack `ColumnDef<T>[]`, data supplied by the application, `caption`, optional stable `getRowId`, page size, loading state, and row-selection callback. Initial behavior is client-side sorting/filtering/pagination/selection, with all-row selection covering the filtered collection. Network fetching, editable cells, virtualization, and server-side pagination are outside this release.

## Components

- **Controls:** Button, ButtonGroup, IconButton, FAB, Toggle, ToggleGroup, Checkbox, RadioGroup, Switch, Slider.
- **Forms/dates:** TextField, Textarea, PasswordField, NumberField, SearchField, Select, Combobox, MultiSelect, OTPInput, FileInput, FormField, Calendar, DatePicker, DateRangePicker, TimePicker.
- **Navigation:** Tabs, Breadcrumbs, Pagination, TopAppBar, NavigationRail, SideNavigation, TableOfContents, Stepper, Link.
- **Surfaces/data:** Card, List, Avatar, AvatarGroup, Badge, Accordion, Divider, DataTable.
- **Feedback:** Alert, Toast (including Snackbar actions), NotificationCenter, Progress, Spinner, Skeleton, EmptyState.
- **Overlays:** Dialog, AlertDialog, Drawer, BottomSheet, Popover, Menu, Tooltip.
- **Icons:** AnimatedIcon.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run test:browser
npm run build
npm run smoke
```

Browser tests use installed Microsoft Edge. They cover page rendering, language/preferences, focus management, selection, tables, dates, storage failure, reduced motion, and browser-emulated touch. Automated accessibility checks and contrast tests support the WCAG 2.2 AA target; they do not establish full conformance. Manual screen-reader and physical-device testing remain separate acceptance checks. See `VALIDATION.md` for actual results and limitations.

## Licenses

MaterialFluid source is MIT. Third-party code/fonts retain their own notices in `THIRD_PARTY_NOTICES.md`. Example data is illustrative. No external account, tracking service, API, or runtime font/icon CDN is required.
## Palette tuning

Settings has live, locally saved sliders for light/dark action brightness,
primary/secondary/tertiary saturation, secondary/tertiary hue shift, surface tint
and contrast, plus a palette preview and Reset colors. Defaults use the confirmed
gold palette settings. Bright fills automatically select readable text; links and
transparent controls retain separate readable accent colors. Hover fills move
away from the foreground tone to retain contrast.

```tsx
<MaterialFluidProvider colorBehavior={{lightBrightness:80,secondarySaturation:150,surfaceTint:120}}>
  <Button>Brighter gold</Button>
</MaterialFluidProvider>
```

The same optional settings are accepted by `createTheme(seed, dark, colorBehavior, colorScheme)`.

Material color design uses Tonal Spot with the 2025 specification. It is the only supported `colorScheme` (`tonalSpot`); saved choices from older versions migrate to it. Existing color adjustments still apply. The Previous color design retains its original generator.
Brightness values are HCT tones (light default 85; dark default 90). Saturation and
surface tint are percentages of the classic CorePalette chroma values; hue shifts
are degrees relative to the seed (secondary default 0, tertiary 30). Primary,
secondary and tertiary saturation default to 50%, 75% and 100%; surface tint to 100%. Contrast 0
preserves the baseline and higher values strengthen separation. Danger retains
its red hue. Invalid saved values fall back to defaults or are clamped to slider
ranges.

The showcase accent selector adjusts hue only: new choices use HSV saturation
and brightness of 100%, without black/white adjustments. Reset restores the
original `#EEDD96` gold seed. Saved custom seeds remain supported. Theme settings
apply to every component, including selected controls, calendars and table checkboxes;
reading surfaces retain tonal roles and readable foregrounds.

Expand **Advanced color roles** in Settings to tune the other roles independently.
Each pair has separate light/dark controls and is saved locally:

| Role | Provider options | Defaults (light / dark) |
| --- | --- | --- |
| Icons in colored components and related accent text | `lightInkBrightness`, `darkInkBrightness` | 40 / 50 |
| Outline/Ghost, toolbar, search and standalone icons | `lightPlainInkBrightness`, `darkPlainInkBrightness` | 60 / 90 |
| Solid red Danger fill | `lightDangerBrightness`, `darkDangerBrightness` | 49 / 49 |
| Selection backgrounds and colored containers | `lightContainerBrightness`, `darkContainerBrightness` | 90 / 80 |
| Neutral canvas and related surfaces | `lightSurfaceBrightness`, `darkSurfaceBrightness` | 97 / 5 |
| Neutral text and related muted text | `lightTextBrightness`, `darkTextBrightness` | 25 / 90 |
| Borders and related dividers | `lightBorderBrightness`, `darkBorderBrightness` | 20 / 90 |

All options belong to `colorBehavior`. Surface layers and muted/border variants
retain their relative tone spacing. Colored-component icons use direct `*-ink`
tones: 100 is white, 0 is black, with no readability clamp. Readable accent text
uses a separate fitted role, and neutral text uses the nearest readable tone;
foregrounds on fills and colored containers adjust automatically. Outline/Ghost,
toolbar and search icons use the independent `*-plain-ink` role. Danger uses its
solid red fill with a paired white foreground at the default brightness.
An explicit icon variant selects that family's icon role; otherwise it follows
its containing component. Reset colors restores
all role defaults as well as the original nine controls; older saved settings
receive the missing defaults without losing existing tuning.

## Shared variants and sizes

Button and IconButton pages provide grouped Example Presets, Appearance, Content and Behavior. Their five sizes include XS through XL. IconButton adds narrow/default/wide widths. The emphasize boolean is toggle behavior independent of Appearance, keeping Primary colors in both states; Tonal, Outlined and Ghost/Text use Primary when selected. A null selectedIcon animates the same Material symbol from outline to fill; a separate selectedIcon swaps artwork, and IconButton selectedLabel can name the selected action. Working React and optional Web Component code lives in Documentation. Other families use their single approved treatment, with one shared Size selector
and no Variant selector. Icons keeps one catalogue and shows all five selected-icon
previews together. Internal icon animations are temporarily disabled globally;
the animation implementation remains available for later reactivation.

The legacy Outline treatment uses the neutral theme surface and subtle border
for existing controls. The new Outlined action treatment is transparent with an
outline-variant border. Ghost remains transparent. The Fluid/Minimal control
uses the kit Toggle (Outline off, Primary on); language uses Icon Button with Ghost. Showcase
search and advanced color-role disclosure share the Outline tokens as well.

Action components expose `variant="filled|tonal|outlined|ghost|danger"`, using primary,
secondary-container, outline and transparent text treatments respectively. Previous
`primary`, `secondary`, `tertiary`, `outline` and `text` names remain
available for compatibility. Components use `size="sm|md|lg"`. Medium is the default. Small uses dense spacing and 28px
desktop action controls, with touch targets enlarged on coarse pointers. Icons and
spinners additionally accept numeric pixel sizes.

Settings → Action colors provides separate hue, saturation, and light/dark tone adjustments for Filled, Tonal, Outlined, and Ghost. Danger retains its light/dark brightness controls. Tone adjustments are relative to the generated palette; Reset colors restores all of them. Settings persist on this device and missing values in older saved preferences use the defaults.

Settings → Component colors switches between the Material component color redesign and the previous palette and component treatment. The choice is saved separately from the palette controls. Library consumers can set `colorDesign="material"` or `colorDesign="previous"` on `MaterialFluidProvider`; switching leaves the current seed and color adjustments intact.

The shared color roles use the 2025 Material tonal-spot scheme across backgrounds, surfaces, text, borders, selection and actions. Dark Filled defaults to a +10 tone adjustment; dark Tonal defaults to -10 and 150% saturation. The main showcase page retains a separate container tone from its surroundings.

Danger uses a solid red background with white text/icons, following the supplied
reference image. Its brightness has independent light/dark controls. Hover moves
away from the foreground tone to retain contrast. Extreme custom brightness can
switch the paired foreground to keep it readable.

```tsx
<Button variant="tertiary" size="sm">Create project</Button>
<TextField variant="outline" size="sm" label="Project name" />
<ComponentAppearanceProvider variant="secondary" size="sm">
  <Calendar />
  <Select label="Role" options={roles} />
</ComponentAppearanceProvider>
```

Explicit component props override group defaults; popup content retains the same
appearance when rendered through a portal. The showcase has variant/size controls
on each page. Each component exposes its supported sizes from the shared policy; there is no global density setting.

Button variant/accent/theme changes reveal the new color in a crisp circle from the center. Hover uses a short color fade. Size changes spring the real layout dimensions and padding, so surrounding containers follow. Authored defaults are fixed: press depth 8%, stiffness 700, damping 20, mass 1.5, size damping 30, radius-depth ratio 4, color duration 330ms, ripple duration 550ms, opacity 20%, fast-start strength 85% and release speed 2×. Minimal and system reduced-motion behavior remain available. Components expose no per-button or provider motion-tuning API.


## Simplified selection controls

Toggle, ToggleGroup, Checkbox, RadioGroup, Switch and Slider no longer expose action-color variants. Their size options remain Small, Medium and Large.

- Toggle rests in Outline and becomes Primary when pressed.
- ToggleGroup uses Ghost items with one movable Primary selection. The pill shares Button's press-depth and radius animation, stays within its resting size, and glides between snapped items while dragging. Items have no separate press fills or ripple trails. Release commits and cancellation restores the previous selection. ButtonGroup and ToggleGroup fit their contents.
- Checkbox rests in Outline; checked state fills with Primary, while partial state keeps the outline with a minus and no fill. Both the check and minus strokes draw in. Its circular outline springs in scale on every press and release, including the partial state, while its corner radius stays fixed. Quick clicks complete a visible press before the return spring. Checkbox and radio filling follow press depth like Toggle.
- RadioGroup stays outlined with a centered, springing Primary dot. The outer circle also springs on every press and release. Both controls use the shared button spring settings and respect minimal and reduced motion.
- Switch uses an Outline track off and Primary track on; its Primary thumb swaps to Outline when enabled, with centered animated Wi-Fi/Bluetooth icons. Explicit `animated={true}` enables an AnimatedIcon while the default global pause remains in effect elsewhere.
- Slider uses split Primary/neutral tracks with continuous and stepped values, expressive movement, and press/release feedback. Use `mode="continuous"` for free movement or `mode="stepped" step={5}` for snapping. Passing `step` alone selects stepped mode; the default is continuous. Pointer movement follows a continuous physical spring with momentum and gentle overshoot, settling to the committed step on release; keyboard and wheel changes use expressive 340ms glides; held navigation keys retain press feedback throughout repeat events.

Minimal mode uses restrained feedback; system reduced motion suppresses movement. The showcase renders these controls once per page. A failed example now shows an inline reload action rather than clearing the entire application.

All forms are Outline-only and render once per showcase page, including selects, comboboxes, OTP, file inputs and date/time controls. Text Field and Textarea rest with 12px horizontal padding (10px Small, 14px Large). Focus springs their horizontal content inset outward by 8px without moving their outer boundary. Textarea uses compact vertical padding. Reduced motion applies the inset immediately.

Selection labels transition from weight 500 to 700 when active. Toggle Group supports mouse and touch scrubbing, commits the preview on release, and cancels on a vertical touch scroll or pointer cancellation. Holding enlarges only the inner selection pill with a spring; the outer group does not scale. Icon Button previews share a compact wrapping row. Reduced motion suppresses pill scaling and weight transitions.

Sliders use split active/inactive tracks with a gap around each handle, rounded outer caps and an end marker, following the supplied Material Design 3 Expressive reference. Track heights are 12/16/24px and solid handle widths are 3/4/6px for Small/Medium/Large; handle lengths are 32/44/52px, with at least a 44px pointer target. Press/release narrows the handle with expressive easing. The handle and split track share one continuous physical spring for track clicks, dragging and release, inspired by the supplied Image Comparison Spring demo. A damping ratio of 0.7 gives its 0.3 bounce character; changing the pointer target preserves momentum instead of restarting a fixed-duration tween. Values remain quantized while the visual spring can move between steps; release settles onto the committed step. Expressive narrowing and release rebound remain active throughout. Keyboard changes and 5%-of-range wheel changes use a 340ms expressive glide. Held navigation keys keep the pressed handle active and animate each repeated change until release. Mouse selection hides the focus outline throughout the interaction and after release; keyboard navigation restores it. Fully empty/full tracks animate their rounded caps. Range sliders apply press narrowing and gap changes only to the active handle. Values stay in the heading, with no floating tooltip, glow or shadow.

Switch dragging snaps the thumb to the nearest endpoint with a short eased transition and no spring or bounce.

Toggle Group labels remain stationary while the selection pill slides behind them.

Toggle and FAB text share the authored 100ms duration, 6px blur and 0% fade defaults. Component pages expose no Advanced panels or text-morph tuning API.

Checkbox ticks draw in over 180ms once the fill visibly covers the whole checkbox, without waiting for spring settling. Partial minus marks remain immediate. Radio rings and dots share one SVG coordinate system at every size. Switch thumbs anticipate a click with a small movement on press and complete the snap on release. Sliders initialize at their values without load animation.

NumberField and Slider support the mouse wheel while hovered, consuming the gesture so the page stays still. Wheel up increases, wheel down decreases; sliders also support horizontal wheel movement. Free sliders move by one twentieth of the full range per wheel step, with a short glide in expressive mode; stepped sliders use their configured step. Range sliders adjust the handle closest to the pointer and preserve their neighbour bounds. Ctrl+wheel retains browser zoom. NumberField keeps native typing, arrow-key stepping, and explicit decrease/increase actions; its numeric overlay appears only while displaying or stepping values.

NumberField supports `presentation="goal"` and `unit` for large goal-setting values. Text-field focus expands only the text inset, keeping adornments fixed; invalid subtitle/error text wobbles once on validation feedback in Expressive mode. OTP digits roll in from above. FileInput provides a large dashed drop area, a Primary chooser, and separate file rows. Calendar month transitions, day feedback, and rounded date popovers follow Expressive/Minimal and reduced-motion preferences.

Calendars support wheel month navigation, a month chooser with month numbers, and a goal-style year editor in both Gregorian and Persian systems. OTP showcase verification accepts only `123654`; the reusable OTPInput remains validation-agnostic. Combobox keeps its suggestion list open during input interaction and dismiss on selection or outside interaction.

Select, Combobox, and MultiSelect share an anchored, scrollable menu below the field. Combobox includes optional `allowCustom` entry; the separate Autocomplete component and page have been removed.

MultiSelect renders removable Primary chips with 6px gaps and wraps to additional rows; its border and content height spring together without scaling text. Calendar height also springs when its week rows change. Date ranges use square connected edges and reset to a new start when an earlier date is clicked. TimePicker offers a goal-style hours/minutes overlay (and seconds where needed), with native input values and form submission preserved. FileInput supports multiple files, removable filename rows, and per-file progress. Small uses a compact horizontal drop area; Medium stays centered. There is no Large FileInput variant. The visible file limit is enforced for both browsing and dropping: single mode allows one file, while multiple mode defaults to five, configurable with `maxFiles`. Exceeding the limit preserves the previous selection and shows an error. Pass `onUpload={(file, { signal, onProgress }) => uploadFile(file, signal, onProgress)}` to connect your upload transport. Report actual percentages from 0–100; resolve after server confirmation or reject to show retry. Removal, replacement, form reset, and unmount abort outstanding uploads. Without `onUpload`, files remain locally selected and native form submission works. The showcase explicitly simulates upload progress.

Select, Combobox, and MultiSelect share bounded, scrollable dropdown lists. MultiSelect offers search with a visually hidden label, highlights selected options without checkmarks and animates adding or removing its selected chips. Combobox accepts listed options by default; set `allowCustom` to enable the explicit Add action. Its helper text communicates this policy in both locales.

`TextField` and `Textarea` accept native `maxLength`; a live character counter appears when a limit is set. Use `showCount={false}` to hide the counter while retaining the limit. `Combobox allowCustom` applies `maxLength` to typed custom values and still permits longer listed options.

`DatePicker` starts with a `----/--/--` mask and selects dates only through the calendar overlay. Its field uses the same button trigger and icon feedback as DateRangePicker. The calendar year editor applies a new year on Enter or Apply. `TimePicker` accepts `hourFormat={12}` or `{24}` (default); 12-hour mode includes an AM/PM toggle while emitted values remain canonical 24-hour time strings. Both picker fields keep fixed horizontal spacing on focus.

DatePicker and DateRangePicker hide dates outside the displayed month. Standalone Calendar retains its existing behavior and accepts `showOutsideDays={false}` when needed.

The showcase shell uses the kit’s fields, Toggle, links, top app bar, breadcrumbs, and navigation components. Selectable navigation shares Toggle Group’s moving-pill spring without its dragging behavior. Calendars hide adjacent-month dates by default; trailing field actions retain space from the field edge in both text directions, with 20/22/24px glyphs inside separate 32/36/40px action targets at Small/Medium/Large.

`TableOfContents` replaces Bottom Navigation. Its item values match document section IDs; selecting an item scrolls to that section, and scrolling updates the active heading. Tabs use a fully rounded, content-sized list. The showcase top bar is Ghost. Menu triggers use Primary and keep a stable popup anchor while pressed.

Select, Combobox and MultiSelect expand the field outline into a continuous options surface without moving surrounding content. Height and corners morph over 300ms, including filtering, interrupted transitions and collapse; the chevron reverses over 400ms. Option rows rise 8px from a slight scale and 4px blur over 350ms, staggered by 50ms up to 250ms. The surface retains MaterialFluid colors and flat styling, follows upward collision placement, and skips spatial animation in Minimal or reduced-motion mode.

Persian language displays Persian digits in number fields (including editing, steppers, time units and calendar year editors), date fields and both calendar systems. Native number values and date-only callbacks retain their canonical numeric/ISO data. Date ranges use `----/--/-- - ----/--/--` for empty boundaries and zero-padded `yyyy/MM/dd` dates in chronological left-to-right order.


Visible form field labels default to the top and may be placed at the logical start with `labelPosition="start"` or a `ComponentAppearanceProvider` default. For example: `<Select label="Size" labelPosition="start" options={sizes} />`. Start follows the reading direction, and field helpers stay beside the control column. Goal-style NumberField and Slider always keep their labels at the top; Checkbox, RadioGroup and Switch keep captions at the end.


`CardGroup` offers radio-style single selection (`value: string`) and checkbox-style multiple selection (`selectionMode="multiple"`, `value: string[]`). Options accept `label`, `description`, and a decorative `symbol` containing an icon, symbol, or emoji. Native inputs support keyboard selection and named form values. Switch captions stay at End; Slider supports Top, Bottom, Start, and End label positions.

### Shared shapes and hidden labels

Control base radii are: Small 14px, Medium 24px, Large 29px, matching half the standard button height. Standard buttons appear as pills. Framed containers add their padding inset and border to the base radius for concentric curves. Icon actions start circular and retain radius compression during presses. Unscaled surfaces use Medium. Existing press-depth and ripple-linked radius animations remain active.

Use `labelPosition="none"` to hide a field's visible label while retaining its accessible name. The showcase Label selector offers Top, Start, and None; goal-style number fields support Top and None. Continue supplying meaningful label text for assistive technology.

Field labels and checkbox, radio, and switch captions retain accessible naming but do not activate or focus their controls when clicked. Use the control itself to interact.

### Shared identity colors and Tree icons

`Avatar` chooses a stable miscellaneous color from its name. Override it with `color="blue"`, `"teal"`, `"green"`, `"amber"`, `"rose"`, or `"violet"`. `Badge` accepts the same color choices; semantic tones reuse the shared status palette. These colors are independent of the accent seed and have paired foregrounds in both themes.

Tree's `iconMode` accepts `"all"`, `"none"`, or `"parents"` for top-level icons only. Supply icons on the items themselves; hidden or missing icons leave no empty slot. TableOfContents uses Tree and accepts nested `children` plus the same icon mode. See [COMPONENT_POLICY.md](COMPONENT_POLICY.md) for supported sizes and the rationale for each component.

Size changes across the kit share Button’s sizing spring through `MaterialFluidProvider`, including fields, navigation, surfaces, Spinner and icons. Minimal/reduced motion applies sizes immediately. FileInput supports only `sm` and `md`. Progress and Spinner use linear/circular Material Expressive waves, which pause when hidden or offscreen.

Progress supports continuous or segmented waves. Either can show a status row:

```tsx
<Progress label="Upload" value={30} presentation="segmented" segments={8} />
<Progress label="Update" value={30} presentation="wavy" showStatus
  status="Update in progress…" remaining="8s left" />
```

The Wave presentation uses the supplied [wavy-slider reference](https://github.com/mahozad/wavy-slider) settings: a 60px wavelength, 20px height, 31px/s toward the tail, 5px stroke, 20px inactive track, and incremental amplitude. Override these with the `wave` prop (`ProgressWaveOptions`). Remaining time is application-provided; the component does not estimate it.


The shared `motionEngine` exports dialog, popup, tooltip, layout and range-spring recipes. Dialog and AlertDialog use the saved playground defaults; Drawer and BottomSheet use the same dialog configuration without scaling. Range resizing shares Slider physics. Controls, fields, navigation and compositions retain their family-specific motion through shared helpers and unit-aware spring settling.

AspectRatio preserves a numeric width/height ratio (for example `16 / 9` or `3 / 4`) while media crops with `object-fit: cover`. Attachment accepts the same `ratio` with inline/card layouts. Chart offers `variant="bar" | "line" | "area" | "pie"`, optional secondary values, and pointer/focus tooltips. Table and DataTable accept `stripe="none" | "rows" | "columns"`; DataTable auto-fits on data load unless `autoSize={false}`. Resizable accepts `snapPoints={[25, 50, 75]}` in percentages.

```tsx
<Progress label="Processing" value={45} presentation="segmented" showStatus
  segments={[{ value: 20, label: "Initialization" }, { value: 80, label: "Processing" }]} />
```

ToggleGroup uses primary selection colors. Clicking its active value returns to its initial/default value; an optional group without an initial value clears. Controlled groups should use `defaultValue` to specify an explicit reset value.


Carousel supports mouse/touch dragging with spring pagination and `orientation="horizontal" | "vertical"`. Horizontal mode supports RTL and preserves vertical page scrolling. Checkbox changes from rounded rectangular when empty to circular when checked or indeterminate. The collection's Drawer uses BottomSheet with an upward spring entrance from below the viewport and no scale change. Reduced motion opens it at rest.

Additional shared APIs include Accordion `type="multiple"` (array values), Tabs and Separator `orientation`, Field `orientation="vertical" | "horizontal" | "responsive"`, ScrollArea `orientation="vertical" | "horizontal" | "both"`, Item `variant="muted"`, CodeBlock `lineNumbers` / `wrap`, and Resizable `orientation="vertical"`. `Shadcn.DateRangePicker` reuses the original date-range control.

Badge supports compact text and notification dots. Supply a meaningful accessible name for a dot:

```tsx
<Badge size="sm">New</Badge>
<Badge presentation="dot" size="sm" tone="error" aria-label="Unread messages" />
```

Small notification dots measure 6px; Medium dots measure 8px. They inherit Badge's semantic color pairs. Composed `Shadcn.Input` controls with an `id` should have an associated `Shadcn.Label`, explicit `label`, or `aria-label`.

Trace uses the original Accordion for diagnostic expansion, including its spring/blur reveal and small held preview without title press/ripple. Steps without output have no expander. Timeline connects status nodes and panels; Compact uses a flat divided activity list without connectors.


The optional `colorPreset="neutral"` uses neutral light/dark surfaces with high-lightness seed-derived primary fills and paired dark foregrounds. The showcase starts with this preset; choose **Original palette** in preferences to restore the existing color design. The library provider retains its existing `standard` default.

```tsx
<MaterialFluidProvider colorPreset="neutral" accentSeed="#7d9dff"
  neutralColors={{ surfaceTint: 0, accentStrength: 100 }}>
  <Button>Continue</Button>
</MaterialFluidProvider>
```

`neutralColors.surfaceTint` and `accentStrength` range from 0 to 100 and default to 0/100. Surface tint adds a restrained seed tint to neutral layers; accent strength controls primary chroma while retaining an HCT tone of 86 in both themes. Text/link accent roles use darker tones in light mode for readability. Zero accent strength produces grayscale fills. Semantic status colors remain independent. `createNeutralTheme` and `normalizeNeutralColors` are exported for custom integrations. These are MaterialFluid tokens inspired by shadcn's neutral hierarchy, with stronger functional boundaries and readable text rather than exact upstream color parity.

## Button configuration and optional Web Component

Button now supports XS/Small/Medium/Large/XL, registered icon names or React icon nodes, logical icon placement, icon dimensions inherited from the Appearance size, controlled/uncontrolled toggle selection, active/disabled states, loading labels and determinate/indeterminate progress. Square and Elevated variants are excluded. The showcase's Example Presets, Appearance, Content and Behavior controls update both code formats.

```tsx
import { Button } from "materialfluid";
<Button toggle defaultSelected icon="check" onSelectedChange={selected => console.log(selected)}>Save</Button>
<Button progress={65} loading loadingText="Uploading">Upload</Button>
<Button size="xl" icon="check" iconPosition="end">Continue</Button>
```

The optional element entry uses the same implementation and the package's React/React DOM peers. Load styles and fonts once in a bundler-based project, then explicitly register the element:

```js
import { defineMaterialFluidButton } from "materialfluid/elements";
import "materialfluid/styles.css";
import "materialfluid/fonts.css";
defineMaterialFluidButton();
```

```html
<mf-button toggle selected icon="check" value="save">Save</mf-button>
```

Use `registerMaterialIcons` with `materialfluid/icons` when choosing symbols outside the core pack; the showcase generates that registration for the selected symbol. SVG React nodes remain supported; icon strings are registry names rather than unsanitized HTML.

The element exposes reflected `text`, `icon`, `variant`, `size`, `toggle`, `selected`, `disabled`, `loading`, `type`, `name` and `value` properties, alongside their attributes. Additional attributes include `icon-position`, `toggle-on-click`, `active`, `loading-text`, `progress`, `show-progress`, `indeterminate`, `progress-label`, `aria-label`, `form`, `theme`, `locale`, `motion`, `accent-seed` and `color-preset`. `await element.updateComplete` waits for attribute-driven rendering. A toggle emits a bubbling `change` event with `{ selected, value }`; native click and forwarded focus/blur events remain available. `element.focus()` and `element.click()` delegate to the native inner button. Native inner buttons submit/reset their ancestor or explicitly associated forms.

For imperative integrations, the element supplies `getValue/setValue`, `enable/disable/isDisabled`, `getText/setText`, `getIcon/setIcon/hasIcon`, `getVariant/setVariant`, `getSize/setSize`, `setActive`, `setSelected/isSelected`, `setAriaLabel`, `addClass`, `showProgress/hideProgress`, `setProgress`, `setIndeterminate` and `setLoading`. Progress/loading methods have `Sync` counterparts; async methods resolve after rendering. Removing the element cleans up its renderer; `destroy()` removes it. Use standard `addEventListener/removeEventListener` for event subscriptions. React consumers use controlled props, native DOM refs and normal lifecycle/event handlers for the same cases.

Component icon timing and stroke parameters are fixed to their authored defaults. Button icons inherit the selected appearance size; Button has no independent `iconSize` or ripple option. `active` keeps the hover background visible without changing selection or activation.

Catalogue pages separate **Configuration** (live preview and settings) from **Documentation** (React/Web Component code, API and behavior notes). Keyboard-focused Button and IconButton use the Active background with the visible focus ring; selection remains independent. Animation uses Motion (`motion/react`) and CSS transitions/keyframes, with no GSAP dependency.


## Foundations

The sidebar now includes Color, Typography, Shape, Motion and Accessibility. Existing component designs remain, with the same owner fonts, palette presets, radii and motion settings. Tonal Spot is still the default; nine Material color algorithms are available. Motion uses the authored MaterialFluid press/resize/dialog/popup curves and honors system reduced motion, including changes during a running foundation animation. There is no elevation system.

```tsx
import { Foundations, MaterialFluidProvider } from "materialfluid";
const theme = Foundations.createFoundationTheme({seed:"#eedd96", colorPreset:"neutral"});
const css = Foundations.foundationThemeToCss({colorScheme:"tonalSpot"});
<MaterialFluidProvider colorScheme="expressive">
  <p className="mf-type-body-large">Your content</p>
</MaterialFluidProvider>
```

`Foundations` also exposes `foundationTypeScale`, `foundationFonts`, `foundationCorners`, `foundationSpacing`, `foundationInteraction`, `foundationMotionEngine`, `foundationMotionCurve`, `shapeNames`, `shapePaths`, `shapeMask`, `morphFoundationShape`, `contrastRatio`, `foregroundForColor` and `auditFoundationColors`. Shape utilities are additive; the existing Shape component and the other components keep their current designs. `useMaterialFluid().resolvedTheme` reports the active light/dark theme when the configured theme is system. The selected upstream source, license and adaptations are recorded in THIRD_PARTY_NOTICES.md and the foundation report.

Foundation workbenches include smooth non-spring typography, subscript/superscript, per-line rounded highlighting, keycaps, continuous shape morphs, finite spatial curves and functional accessibility examples. Button toggles are limited to Tonal, Outlined and Ghost/Text; progress inherits the icon slot's size and position. Local evidence and limits: [2026-11-09 review](reports/foundation-workbenches-2026-11-09/REVIEW.md).


ButtonGroup supports standard or connected actions, single/multi selection, required selection, labels shown only when selected, density, orientation and equal widths. Use ButtonGroupItem children or the buttons list for the additive API. Existing arbitrary-child ButtonGroup compositions keep their frame. Optional Web Components register through defineMaterialFluidButtonGroup in materialfluid/elements; the matching configuration generates both framework recipes.


### Split Button

`SplitButton` pairs an ordinary primary action with related menu choices. Use `text`, `icon`, `trailingLabel`, `groupLabel`, `items`, five Button sizes, `expanded`/`onExpandedChange` and optional `layer="top"`. Existing `label`, `menuLabel` and native leading-button refs remain compatible. Alternatives accept `text` or `label`, icons, disabled/destructive states, nested `items`, and `kind: "separator" | "label"`; declarative `SplitButtonItem` children are also supported. Without items, expansion callbacks can open a custom surface. The trailing half never submits a form.

`SplitButtonHandle` extends the native leading button with `element`, `leadingElement`, `trailingElement`, `setText/getText`, `setIcon`, `setItems/getItems`, `expand/collapse/isExpanded`, `enable/disable/isDisabled`, `on/off` and `destroy`. React keeps a native `onClick`; state and selection callbacks receive the typed SplitButton event. `open`/`close` alias expansion events. The optional `materialfluid/elements` entry exports `defineMaterialFluidSplitButton`, `MaterialFluidSplitButtonElement` and `MaterialFluidMenuItemElement`; `<mf-split-button>` contains `<mf-menu-item>` declarations and emits leading-only click, expand/collapse/open/close/change/select events. Configuration and working framework recipes are available on the existing Split Button catalogue page.
