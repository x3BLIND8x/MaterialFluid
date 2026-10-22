# MaterialFluid

A Material-inspired React/TypeScript kit with fluid interaction motion, English/Persian support, and a 56-page showcase.

## Open the local showcase

On Linux, run `./Open\ Showcase.sh` from the project folder (or `bash "Open Showcase.sh"`). It installs missing dependencies, starts the showcase, and opens your default browser. Use `bash "Open Showcase.sh" --no-open` to run without opening a browser. Keep the terminal open; press Ctrl+C to stop the server.

On Windows, double-click **Open Showcase.cmd**. It installs dependencies when needed, prints the IP, port and clickable local URL, and opens your **default browser**. Closing the browser leaves the server running. Close the terminal or press Ctrl+C to stop it. If port 5173 is occupied, the launcher chooses the next available port and prints the actual address.

Requires Node.js 22.12 or newer and npm. Initial dependency installation needs internet; normal local use loads fonts/icons from this project.

To prepare a clean transfer archive for another computer, run `npm run handoff`. It creates `MaterialFluid-v0.1.zip` with the source project inside and excludes caches, installed dependencies, build outputs, and test artifacts.

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
npm install /path/to/materialfluid-0.1.0.tgz
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

`MaterialFluidProvider` accepts `locale: 'en' | 'fa'`, `dir: 'ltr' | 'rtl'`, `theme: 'system' | 'light' | 'dark'`, `motion: 'expressive' | 'minimal'`, `density: 'comfortable' | 'compact'`, and a six-digit hex `accentSeed`. Persian defaults to RTL. System reduced-motion preferences override movement in both modes. `useMaterialFluid()` exposes the effective context, including `reducedMotion`.

The provider scopes CSS tokens, including `--mf-primary`, `--mf-on-primary`, `--mf-primary-container`, `--mf-on-primary-container`, `--mf-surface`, `--mf-on-surface`, `--mf-outline`, and `--mf-control-height`. Floating surfaces remain inside the corresponding provider so they inherit theme and direction. Use `className` and `style` where listed by component types; settings are application-controlled. Only the showcase persists settings in localStorage.

All visible surfaces, controls and focus boundaries use rounded geometry, including calendar ranges, table headers, scrolling containers and tooltips. There are no elevation shadows. A brief success glow is the only deliberate halo treatment.

`createTheme(seed, dark)` returns CSS custom properties. `motionTokens` exposes the shared spring and timing defaults. Importing the package does not automatically load fonts. The optional font stylesheet uses relative bundled WOFF2 assets: Nunito for Latin ranges, Vazirmatn **RD** for Persian ranges, JetBrains Mono for code. Application font overrides remain possible.

All controls support conventional native attributes or their documented primitive attributes. Components with state offer controlled and uncontrolled APIs; see the exported TypeScript declarations and individual showcase pages. Icon-only buttons require `label`. `AnimatedIcon` is decorative unless supplied a `label`.

The Icons page contains all **4,301 official Material Symbols Rounded** plus 21 compatibility aliases. Thin, fill-invariant symbols use generated stroke reveal masks over Google's original contours. Solid and mixed pictograms use center-out filling (`fillDuration`, seconds, default 0.4; `fillEaseStrength`, default 0.85). This geometric classification is a heuristic, not a guarantee of semantic interpretation; see `src/kit/icon-generation-report.json`. For example, Rounded Filled `content_copy` includes a solid rectangle and uses center-fill. Wi-Fi/Bluetooth alone retain hand-authored state/slash drawings (350ms, 70ms stagger, 150ms slash delay). Use `<Switch label="Wi-Fi" icon="wifi" />` or `icon="bluetooth"`; `iconMotion` configures timing.

Action-icon previews are currently paused, including click and keyboard activation. Connection-switch icons retain their independent state animations. Minimal/reduced modes show final glyphs. The gallery searches and paginates the complete pack, with temporary timing controls. The full pack loads only on that route. The core package includes 45 default glyphs; register any additional icons before rendering:

```tsx
import { AnimatedIcon, registerMaterialIcons } from 'materialfluid';
import { materialIcons } from 'materialfluid/icons';

registerMaterialIcons({ rocket_launch: materialIcons.rocket_launch });
// Or registerMaterialIcons(materialIcons) for the complete pack.
<AnimatedIcon name="rocket_launch" />;
```

To regenerate, install Python build dependencies with `python -m pip install -r scripts/icon-requirements.txt`, then run `npm run icons:generate`. The script downloads Google's variable font and codepoint list at the revision in `scripts/material-icons.lock.json`, verifies SHA-256, exports every glyph as SVG path data, compares FILL=0/1, and skeletonizes thin shapes into reveal masks. `--offline` uses verified cached sources; `--update` explicitly pins a newer upstream revision. These tools are build-time only; consumers need neither Python nor network access. The visible artwork stays vector-based and locally bundled under Apache-2.0.

## Date and table contracts

Dates use Gregorian **date-only strings**, `YYYY-MM-DD`, regardless of whether the display calendar is Persian or Gregorian. No UTC serialization is used. `Calendar`, `DatePicker`, and `DateRangePicker` accept `calendar: 'gregorian' | 'persian'`; display defaults to Persian for `locale="fa"`. Calendar choice is independent of locale. Date ranges are `{ from?: string; to?: string }` and may be partial while selecting. `DatePicker` is editable as `YYYY/MM/DD` in the display calendar and accepts Latin, Persian, or Arabic digits; Enter or blur validates and commits the date. Its forwarded ref points to the text input. The arrow button opens the calendar. `min` and `max` are inclusive. `parseDateOnly`, `toDateOnly`, and `formatDateOnly` are exported.

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

The same optional settings are accepted by `createTheme(seed, dark, colorBehavior)`.
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

Button and action-icon pages show six variants together; other families use their single approved treatment, with one shared Size selector
and no Variant selector. Button keeps its six-button row without an extra
Create project example. Icons keeps one catalogue and shows all six selected-icon
previews together. Internal icon animations are temporarily disabled globally;
the animation implementation remains available for later reactivation.

Outline uses the neutral theme surface, its paired text, and a subtle outline
border, matching the showcase Variant/Size selectors (white in the default light
theme, dark in dark mode). Ghost remains transparent. The Fluid/Minimal control
uses the kit Toggle (Outline off, Primary on); language uses Icon Button with Ghost. Showcase
search and advanced color-role disclosure share the Outline tokens as well.

Every component accepts `variant="primary|secondary|tertiary|outline|ghost|danger"`
and `size="sm|md|lg"`. Medium is the default. Small uses dense spacing and 28px
desktop action controls, with touch targets enlarged on coarse pointers. Icons and
spinners additionally accept numeric pixel sizes. Existing button/card variant
aliases (`filled`, `tonal`, `outlined`, `text`) remain supported where applicable.

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
on each page. Density has been removed from showcase settings; the provider's
existing density API remains available for compatibility.

Button variant/accent/theme changes reveal the new color in a crisp circle from
the center. Hover does not trigger this reveal. `colorMotion={{duration: 0.55}}`
tunes it (seconds); `false` disables it. Button size changes spring the real layout
dimensions and padding, so surrounding containers follow the transition. These
springs inherit press stiffness/mass with a smoother damping default of 40.
Use `sizeMotion={{stiffness:460,damping:40,mass:1}}` to tune sizing independently.
Hover uses a short color fade in both motion modes. Minimal mode uses
brief fades and immediate geometry; system reduced motion suppresses movement.


## Simplified selection controls

Toggle, ToggleGroup, Checkbox, RadioGroup, Switch and Slider no longer expose action-color variants. Their size options remain Small, Medium and Large.

- Toggle rests in Outline and becomes Primary when pressed.
- ToggleGroup uses Ghost items with a sliding Primary selection.
- Checkbox rests in Outline; checked state fills with Primary, while partial state keeps the outline with a minus and no fill. Checkbox and radio filling follow press depth like Toggle, with physical spring settling.
- RadioGroup stays outlined with a centered, springing Primary dot.
- Switch uses an Outline track off and Primary track on; its Primary thumb swaps to Outline when enabled, with centered animated Wi-Fi/Bluetooth icons. Explicit `animated={true}` enables an AnimatedIcon while the default global pause remains in effect elsewhere.
- Slider uses Outline with immediate Free movement, short glides for Snappy values, and press/release feedback. Use `mode="continuous"` for free movement or `mode="stepped" step={5}` for snapping. Passing `step` alone selects stepped mode; the default is continuous. Free mode has no position easing; stepped mode glides between fixed values over 140ms.

Minimal mode uses restrained feedback; system reduced motion suppresses movement. The showcase renders these controls once per page. A failed example now shows an inline reload action rather than clearing the entire application.

All forms are Outline-only and render once per showcase page, including selects, comboboxes, OTP, file inputs and date/time controls. Text Field and Textarea rest with 12px horizontal padding (10px Small, 14px Large). Focus springs their horizontal content inset outward by 8px without moving their outer boundary. Textarea uses compact vertical padding. Reduced motion applies the inset immediately.

Selection labels transition from weight 500 to 700 when active. Toggle Group supports mouse and touch scrubbing, commits the preview on release, and cancels on a vertical touch scroll or pointer cancellation. Holding enlarges only the inner selection pill with a spring; the outer group does not scale. Icon Button previews share a compact wrapping row. Reduced motion suppresses pill scaling and weight transitions.

Sliders use a slim vertical rounded handle (10 × 44px at Medium), an Outline center, and Primary for both the filled track and handle border. Pressing narrows the handle. Stepped movement uses a smooth 140ms glide; Free movement remains immediate.

Switch dragging snaps the thumb to the nearest endpoint with a short eased transition and no spring or bounce. Slider handles are wider for visibility: 8px Small, 10px Medium, 12px Large.

Toggle Group labels remain stationary while the selection pill slides behind them.

Toggle → Advanced text morph includes Fade (0–100%). Zero keeps text fully opaque during blur; 100 fades it out at the swap. Toggle and FAB text use the same duration, blur and fade settings. Library consumers can share these with `MaterialFluidProvider textMorph={{ duration: 100, blur: 6, fade: 0 }}` (milliseconds, pixels, percent). Reset restores the shared defaults.

Checkbox ticks draw in over 180ms once the fill visibly covers the whole checkbox, without waiting for spring settling. Partial minus marks remain immediate. Radio rings and dots share one SVG coordinate system at every size. Switch thumbs anticipate a click with a small movement on press and complete the snap on release. Sliders initialize at their values without load animation.

NumberField and Slider support the mouse wheel while hovered, consuming the gesture so the page stays still. Wheel up increases, wheel down decreases; sliders also support horizontal wheel movement. Range sliders adjust the handle closest to the pointer and preserve their neighbour bounds. Ctrl+wheel retains browser zoom. NumberField keeps native typing, arrow-key stepping, and explicit decrease/increase actions; its numeric overlay appears only while displaying or stepping values.

NumberField supports `presentation="goal"` and `unit` for large goal-setting values. Text-field focus expands only the text inset, keeping adornments fixed; invalid subtitle/error text wobbles once on validation feedback in Expressive mode. OTP digits roll in from above. FileInput uses a Primary chooser and accepts supported files via drag and drop with bounded feedback. Calendar month transitions, day feedback, and rounded date popovers follow Expressive/Minimal and reduced-motion preferences.

Calendars support wheel month navigation, a month chooser with month numbers, and a goal-style year editor in both Gregorian and Persian systems. OTP showcase verification accepts only `123654`; the reusable OTPInput remains validation-agnostic. Combobox keeps its suggestion list open during input interaction and dismiss on selection or outside interaction.

Select, Combobox, and MultiSelect share an anchored, scrollable menu below the field. Combobox includes optional `allowCustom` entry; the separate Autocomplete component and page have been removed.

MultiSelect renders removable Primary chips with 6px gaps and wraps to additional rows; its border and content height spring together without scaling text. Calendar height also springs when its week rows change. Date ranges use square connected edges and reset to a new start when an earlier date is clicked. TimePicker offers a goal-style hours/minutes overlay (and seconds where needed), with native input values and form submission preserved. FileInput supports removable, shortened filename chips, multiple files, and a full Primary drag surface labelled “Release to upload”; selection remains local until an application handles it.

Select, Combobox, and MultiSelect share bounded, scrollable dropdown lists. MultiSelect offers search with a visually hidden label, highlights selected options without checkmarks and animates adding or removing its selected chips. Combobox accepts listed options by default; set `allowCustom` to enable the explicit Add action. Its helper text communicates this policy in both locales.

`TextField` and `Textarea` accept native `maxLength`; a live character counter appears when a limit is set. Use `showCount={false}` to hide the counter while retaining the limit. `Combobox allowCustom` applies `maxLength` to typed custom values and still permits longer listed options.

`DatePicker` starts with a `----/--/--` numeric mask, supports digit-by-digit entry and paste, and commits on Enter or blur. Its calendar updates after the edit is committed. The calendar year editor applies a new year on Enter or Apply. `TimePicker` accepts `hourFormat={12}` or `{24}` (default); 12-hour mode includes an AM/PM toggle while emitted values remain canonical 24-hour time strings. Both picker fields keep fixed horizontal spacing on focus.

DatePicker and DateRangePicker hide dates outside the displayed month. Standalone Calendar retains its existing behavior and accepts `showOutsideDays={false}` when needed.

The showcase shell uses the kit’s fields, Toggle, links, top app bar, breadcrumbs, and navigation components. Selectable navigation shares Toggle Group’s moving-pill spring without its dragging behavior. Calendars hide adjacent-month dates by default; trailing field actions sit against the field edge in both text directions.

`TableOfContents` replaces Bottom Navigation. Its item values match document section IDs; selecting an item scrolls to that section, and scrolling updates the active heading. Tabs use a fully rounded, content-sized list. The showcase top bar is Ghost. Menu triggers use Primary and keep a stable popup anchor while pressed.
