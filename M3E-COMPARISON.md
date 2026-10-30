# MaterialFluid compared with M3 Expressive Web

Comparison date: 27 October 2026. Reference: [M3 Expressive Web v1.8.0 component catalogue](https://m3e.kyralabs.dev/components/). MaterialFluid: the current working tree, package version 0.11.0, including its uncommitted prototype work.

This is a comparison of Kyra Labs' published documentation with MaterialFluid's source, public exports, styles and showcase catalogue. It is not a runtime, accessibility, browser-compatibility or performance certification of either project. Features described for M3 Expressive Web are its documented features. MaterialFluid behavior is inferred from the current source and has not been newly tested for this report.

The two catalogues use different boundaries: MaterialFluid has 57 showcase pages; Kyra groups its reference into 40 component categories, some of which contain multiple components. Those counts are not measures of completeness.

**Reading the tables:** “Missing” means there is no matching public, ready-made MaterialFluid component. “Partial” means a related component exists but does not expose all the documented capability. “Covered” means the main use case exists, not that the designs or APIs are identical. Consumers can compose some missing patterns from existing controls, but that still requires application code.

## Largest gaps

The most substantial missing reusable components are adaptive navigation and pane layouts, bottom navigation, floating and docked toolbars, a carousel, pull-to-refresh, a split button, a FAB action menu, and a morphing loading indicator. Kyra also offers standalone chip families. MaterialFluid can approximate some of these through composition, but it does not expose those complete patterns as dedicated APIs.

The biggest feature-depth gaps in existing components are multi-select connected button groups and overflow, selectable/nested menus, selectable segmented lists, expanding full-screen search, nonmodal and adaptive sheets, richer app bars, clock and wheel time pickers, and circular determinate/wavy progress.

## Component-by-component comparison

### Actions and selection

| Kyra component | MaterialFluid status and what is missing |
| --- | --- |
| [Button](https://m3e.kyralabs.dev/components/button/) | **Partial.** MaterialFluid has six action color variants and three sizes. Kyra documents five sizes, round/square shape choices, link buttons, and a toggle-button shape transition. The exact variants differ; adding its raised/elevated look would conflict with MaterialFluid's established flat, no-shadow identity. |
| [Icon button](https://m3e.kyralabs.dev/components/icon-button/) | **Partial.** MaterialFluid has icon buttons and icon-only toggles. Kyra adds five sizes, narrow/default/wide widths, explicit round/square shapes, and a selectable icon-button API with a selected Material Symbols fill. MaterialFluid's three sizes and color choices are deliberate design decisions. |
| [Button group](https://m3e.kyralabs.dev/components/button-group/) | **Partial.** MaterialFluid has action groups and a single-selection ToggleGroup with a moving draggable pill. Kyra additionally documents connected single- and multiple-selection groups, optional nonempty selection, roving focus and automatic overflow into a More menu. CardGroup offers multiple selection in a different presentation; it is not a connected multiple-selection button group. |
| [Split button](https://m3e.kyralabs.dev/components/split-button/) | **Missing dedicated component.** Kyra combines a primary action with a separately operated menu trigger, placement choices and expressive transitions. MaterialFluid can compose a button and menu, but does not provide the integrated component. |
| [FAB and extended FAB](https://m3e.kyralabs.dev/components/fab/) | **Partial.** MaterialFluid exports FAB as a styled button and can show text. Kyra additionally documents an Extended FAB with controlled label expansion and a scroll hook that collapses or expands it, plus its own FAB sizing and color roles. |
| [FAB menu](https://m3e.kyralabs.dev/components/fab-menu/) | **Missing dedicated component.** Kyra has a FAB that expands into a spring-animated set of actions, with menu positioning and dismissal behavior. |
| [Segmented button](https://m3e.kyralabs.dev/components/segmented-button/) | **Partial equivalent.** MaterialFluid's ToggleGroup covers single selection with its own visual treatment; it does not cover connected multiple selection. Kyra marks its older SegmentedButton as deprecated and recommends connected ButtonGroup, so implementing the deprecated API itself is low priority. |
| [Chips](https://m3e.kyralabs.dev/components/chips/) | **Missing standalone family.** Kyra exposes assist, filter, suggestion and input chips, including removable/selectable input chip groups. MaterialFluid has badges, toggles and selected items inside MultiSelect, but not these general-purpose chip APIs. This is optional if chips do not fit the desired system. |
| [Checkbox](https://m3e.kyralabs.dev/components/checkbox/) | **Partial.** MaterialFluid has checked, unchecked and indeterminate states and animated artwork. Kyra exposes a dedicated invalid/error state; MaterialFluid accepts accessibility attributes through the underlying control, but has no corresponding named error prop and treatment in this API. |
| [Radio button](https://m3e.kyralabs.dev/components/radio-button/) | **Covered for the main use case.** Both offer single-choice radio groups; MaterialFluid has its own animated ring and dot. Their composition and styling APIs differ. |
| [Switch](https://m3e.kyralabs.dev/components/switch/) | **Mostly covered.** Both support a switch with icons. Kyra documents label-before and label-after choices; MaterialFluid intentionally keeps its switch label at the end, as requested. |
| [Slider](https://m3e.kyralabs.dev/components/slider/) | **Partial.** MaterialFluid has continuous and stepped sliders, range handles and vertical orientation through its underlying slider, plus its own wheel and spring behavior. Kyra adds a centered track, inset icon and five documented sizes. Its API also exposes separate single/range components. |

### Navigation and layouts

| Kyra component | MaterialFluid status and what is missing |
| --- | --- |
| [Navigation bar](https://m3e.kyralabs.dev/components/navigation-bar/) | **Missing public component.** Kyra provides compact bottom navigation and horizontal/vertical item layouts. MaterialFluid has internal styling concepts for bottom navigation but no exported ready-to-use NavigationBar. |
| [Navigation rail](https://m3e.kyralabs.dev/components/navigation-rail/) | **Partial.** MaterialFluid exports a rail. Kyra also has an expandable wide rail and modal expanded rail with controlled expansion. |
| [Navigation drawer](https://m3e.kyralabs.dev/components/navigation-drawer/) | **Partial.** MaterialFluid has SideNavigation and a modal Drawer. Kyra packages permanent, dismissible in-layout and modal navigation-drawer modes, including the transition between them. |
| [Navigation suite](https://m3e.kyralabs.dev/components/navigation-suite/) | **Missing.** Kyra chooses a bottom bar, rail or drawer by window size while preserving the destination selection. MaterialFluid exposes individual navigation pieces but no equivalent adaptive scaffold. |
| [Tabs](https://m3e.kyralabs.dev/components/tabs/) | **Partial.** MaterialFluid uses tabs with panels and a moving selection pill. Kyra exposes primary/secondary treatments, fixed/scrollable modes and icon-position choices as explicit API options. The different selected-pill appearance is intentional. |
| [Top app bar](https://m3e.kyralabs.dev/components/top-app-bar/) | **Partial.** MaterialFluid has a title, leading content and actions. Kyra adds centered, medium/large flexible and two-row layouts, subtitles, configurable expanded/collapsed heights and scroll behaviors. |
| [Floating toolbar](https://m3e.kyralabs.dev/components/floating-toolbar/) | **Missing dedicated component.** Kyra offers horizontal/vertical action toolbars, an optional integrated FAB and collapse or hide-on-scroll behavior. |
| [Docked toolbar](https://m3e.kyralabs.dev/components/docked-toolbar/) | **Missing dedicated component.** Kyra provides bottom action layout choices, toolbar keyboard navigation and optional hide-on-scroll behavior. |
| [Search](https://m3e.kyralabs.dev/components/search/) | **Partial.** MaterialFluid has SearchField and Combobox. Kyra adds a search bar that expands into docked or full-screen results, result selection and an app-bar search integration. A field plus a custom overlay can approximate it but requires integration work. |
| [Canonical layouts](https://m3e.kyralabs.dev/components/canonical-layouts/) | **Missing.** Kyra supplies responsive list-detail, supporting-pane and feed scaffolds, size-class helpers, pane navigation and optional pane-resize anchors. MaterialFluid consumers currently compose page layouts themselves. |

### Surfaces, feedback and overlays

| Kyra component | MaterialFluid status and what is missing |
| --- | --- |
| [Card](https://m3e.kyralabs.dev/components/card/) | **Partial.** MaterialFluid has Card and selectable CardGroup. Kyra additionally exposes semantic element selection and an integrated card action that makes a card an interactive target. Kyra's elevated card is a stylistic difference from the project's flat direction. |
| [List](https://m3e.kyralabs.dev/components/list/) | **Partial.** MaterialFluid supports item titles, descriptions, leading/trailing content and actions. Kyra adds a selectable listbox with single/multiple selection, keyboard/typeahead behavior, selection indicators, overlines, explicit three-line and segmented item layouts. |
| [Carousel](https://m3e.kyralabs.dev/components/carousel/) | **Missing.** Kyra documents multi-browse, uncontained, hero, centered-hero and full-screen layouts, with snapping and keyboard navigation. |
| [Badge](https://m3e.kyralabs.dev/components/badge/) | **Partial.** MaterialFluid has a general colored Badge. Kyra also packages dot/count behavior, maximum-count display and a BadgedBox for attaching the badge to another control. |
| [Loading indicator](https://m3e.kyralabs.dev/components/loading-indicator/) | **Missing dedicated equivalent.** MaterialFluid has Spinner and Progress; Kyra's separate indicator morphs between polygon shapes, supports determinate or indeterminate progress, and has contained/uncontained forms. |
| [Progress](https://m3e.kyralabs.dev/components/progress/) | **Partial.** MaterialFluid has linear determinate/indeterminate progress and an indeterminate spinner. Kyra also documents determinate circular progress and flat/wavy linear and circular indicators with configurable wave behavior. |
| [Snackbar](https://m3e.kyralabs.dev/components/snackbar/) | **Mostly covered.** MaterialFluid's Snackbar is an alias of Toast, and its notification system supports actions and a notification collection. Kyra separately exposes a queued SnackbarHost and layout controls such as an action on a new line. Exact queue and timing behavior should not be assumed identical. |
| [Dialog](https://m3e.kyralabs.dev/components/dialog/) | **Partial.** MaterialFluid has Dialog and AlertDialog. Kyra also exposes a dedicated full-screen dialog with a top action bar and a basic dialog primitive. |
| [Bottom sheet](https://m3e.kyralabs.dev/components/bottom-sheet/) | **Partial.** MaterialFluid has a modal draggable sheet with collapsed/expanded behavior. Kyra additionally provides a standard nonmodal sheet, configurable peek height, controlled sheet values, optional skipped states and gesture/handle controls. |
| [Side sheet](https://m3e.kyralabs.dev/components/side-sheet/) | **Partial.** MaterialFluid's Drawer covers an overlay from either side. Kyra adds standard in-layout and adaptive side sheets, with optional detached styling, back button, divider and action area. |
| [Divider](https://m3e.kyralabs.dev/components/divider/) | **Partial.** MaterialFluid exposes a horizontal divider. Kyra also documents a vertical orientation; MaterialFluid can style one manually, but has no dedicated orientation prop. |
| [Tooltip](https://m3e.kyralabs.dev/components/tooltip/) | **Partial.** MaterialFluid offers tooltip placement on four sides. Kyra also documents rich tooltips with heading, content and an optional action, as well as caret and additional trigger/placement controls. MaterialFluid Popover can be used to compose interactive content, but it is not a dedicated rich-tooltip component. |
| [Pull to refresh](https://m3e.kyralabs.dev/components/pull-to-refresh/) | **Missing.** Kyra provides a touch/pen pull gesture, threshold, refresh state and indicator, with a keyboard-accessible refresh path. |
| [Primitives](https://m3e.kyralabs.dev/components/primitives/) | **Partial.** MaterialFluid exports its icon and theme facilities and has internal interaction styling. Kyra documents reusable Surface, Material Symbols Icon, state-layer/ripple and focus-ring primitives for building new components. MaterialFluid has no comparable unified public surface/state-layer/focus-ring primitive API. |

### Forms and date/time

| Kyra component | MaterialFluid status and what is missing |
| --- | --- |
| [Text field](https://m3e.kyralabs.dev/components/text-field/) | **Partial.** MaterialFluid has outlined fields, labels, errors, counters, leading/trailing content and a separate Textarea. Kyra adds a filled field, floating/inside and cutout labels, dedicated prefix/suffix props and an automatically growing multiline field. Some content can already be composed in MaterialFluid's slots. Filled fields and alternate label behavior are visual/API options, not defects. |
| [Date picker](https://m3e.kyralabs.dev/components/date-picker/) | **Partial.** MaterialFluid has single-date and range pickers with Gregorian and Persian calendars. Kyra also documents a picker/input mode toggle and configurable date/year selection API. Calendar-only date entry in MaterialFluid is a deliberate user request; typing should not be restored merely for parity. |
| [Time picker](https://m3e.kyralabs.dev/components/time-picker/) | **Partial.** MaterialFluid has a time input with 12/24-hour handling. Kyra additionally offers an analog clock dial, scroll-wheel time selector, picker mode switch and dedicated dialog compositions. |
| [Menu](https://m3e.kyralabs.dev/components/menu/) | **Partial.** MaterialFluid has a command menu with icons, disabled and destructive items. Kyra also exposes nested submenus, labeled sections, single/multiple selectable menu items, supporting/shortcut text and placement/offset control. |

## Foundations and distribution

| Area | What Kyra documents beyond the current MaterialFluid API |
| --- | --- |
| [Color schemes](https://m3e.kyralabs.dev/foundations/color/) and [theming](https://m3e.kyralabs.dev/get-started/theming/) | Nine named Material dynamic scheme variants, selectable 2021/2025 color specifications, contrast presets, per-palette source colors, role overrides and a build-time theme CLI. MaterialFluid already generates themes from a seed and exposes extensive custom hue, saturation, brightness and contrast controls, but its API does not offer the same named scheme/spec options or theme CLI. Kyra itself documents a known issue where scoped component themes may retain page colors. |
| [Motion](https://m3e.kyralabs.dev/foundations/motion/) | Named expressive and standard fast/default/slow spring families for spatial changes and effects, with published CSS easing/duration tokens and JavaScript spring support. MaterialFluid has expressive/minimal modes, spring motion and adjustable button motion, but not that complete named token set as its public motion API. |
| [Shape](https://m3e.kyralabs.dev/foundations/shape/) | A documented corner-token scale, 35 reusable Material polygon presets and a polygon morphing API. MaterialFluid has extensive rounded shapes and its own motion, but not that general polygon library. |
| [Typography](https://m3e.kyralabs.dev/foundations/typography/) | Fifteen named Material type roles with emphasized equivalents and properties for family, size, weight, line height and tracking. MaterialFluid has its own typography and bundled fonts, but does not expose the equivalent complete named Material type-scale API. Changing fonts is a design choice, not a requirement for parity. |
| [Layout tokens](https://m3e.kyralabs.dev/foundations/layout/) | Named window width/height classes, size observers, spacing tokens, state layers and elevation levels used by its adaptive components. MaterialFluid has responsive CSS and interaction treatments, but not the same public size-class/scaffold system. Its no-shadow direction makes elevation shadows an optional difference. |
| [Fonts and icons](https://m3e.kyralabs.dev/get-started/fonts-and-icons/) | Three Google Sans Flex profiles, Material Symbols variable axes and an icon-font subsetting CLI. MaterialFluid ships its own typography and an SVG icon registry with optional icon packs; it does not expose the equivalent font-axis/subsetting workflow. Its SVG approach has different tradeoffs and is not inherently a deficiency. |
| [Web components and CSS](https://m3e.kyralabs.dev/get-started/html/) | Kyra offers custom elements and component-level CSS for non-React use. MaterialFluid's package exports a React library, an icon entry and styles/font assets; it does not ship a comparable custom-element layer. Kyra's guide says its component CSS currently needs bundling for CDN use. |
| [React and Astro](https://m3e.kyralabs.dev/get-started/react/) | Kyra documents per-component CSS and framework integration, including Astro. MaterialFluid ships a React/Vite-oriented package and a combined stylesheet; it has no equivalent documented custom-element/Astro route. Kyra explicitly says its React components are client-only, so server rendering is not an advantage to attribute to it. |
| [Versioning](https://m3e.kyralabs.dev/get-started/versioning/) | Kyra documents synchronized package versions, semver guarantees and deprecation policy. MaterialFluid is currently a 0.11.0 prototype; its package metadata and README exist, but a comparable multi-package compatibility policy is not evident from the inspected public package. |

## What MaterialFluid already has beyond the reference catalogue

The following are MaterialFluid public components or features for which the reference catalogue does not present a directly equivalent dedicated category. This is a catalogue comparison, not proof that Kyra cannot reproduce them through composition:

- Persian language/RTL support and Persian calendar/date controls, alongside English and Gregorian dates.
- Select, Combobox, MultiSelect, PasswordField, NumberField, OTPInput and FileInput. The FileInput supports a drop area and a caller-supplied upload flow with progress, failure and retry; a real upload still depends on the consuming application's uploader.
- CardGroup with single or multiple selection and icon/symbol/emoji content.
- DataTable, Accordion, Avatar/AvatarGroup, Breadcrumbs, Pagination, Stepper, TableOfContents and Link.
- Alert, NotificationCenter, Skeleton and EmptyState, as well as Popover, RollingNumber and IconSwap exports.
- A project-specific moving toggle/navigation pill, configurable button springs and the expressive/minimal motion setting.

MaterialFluid also already includes date-range selection, indeterminate checkboxes, two-handle sliders, vertical slider support, toasts with actions and draggable bottom sheets. These should not be counted as wholly absent just because Kyra names or packages them differently.

## Suggested priorities

1. **Navigation and layout:** public bottom navigation, adaptive navigation scaffold, expandable rail and reusable list-detail/supporting-pane layouts. These add whole application patterns rather than another visual variant.
2. **Controls with meaningful behavior:** selectable/nested menus, multiple-selection connected groups, overflow groups and split buttons. Preserve the existing moving-pill behavior where it applies.
3. **Search and surfaces:** expanding search, standard/adaptive sheets, expressive app-bar scroll behavior and an accessible carousel.
4. **Feedback and input:** determinate circular/wavy progress, morphing loading indicator, clock/wheel time picker and rich tooltip. Add standalone chips or pull-to-refresh when a product use case calls for them.
5. **Shared foundations:** document reusable motion, shape, typography and breakpoint tokens before building many variants independently. A polygon morph library and broader distribution targets are larger optional investments.

Keep the chosen MaterialFluid identity: flat surfaces, its existing color system, three size variants, Persian/RTL support, calendar-only date entry and the user's requested motion. Reference parity does not require copying Kyra's shadows, typography, deprecated segmented button or every Material variant.

## Source locations

Local public exports: [src/kit/index.ts](src/kit/index.ts). Shared appearance and theme: [appearance.tsx](src/kit/appearance.tsx), [theme.ts](src/kit/theme.ts). Components: [controls.tsx](src/kit/controls.tsx), [forms.tsx](src/kit/forms.tsx), [dates.tsx](src/kit/dates.tsx), [navigation.tsx](src/kit/navigation.tsx), [surfaces.tsx](src/kit/surfaces.tsx), [feedback.tsx](src/kit/feedback.tsx), [overlays.tsx](src/kit/overlays.tsx) and [notifications.tsx](src/kit/notifications.tsx). Catalogue: [src/showcase/catalogue.ts](src/showcase/catalogue.ts). Package exports and version: [package.json](package.json).

No tests, build, lint or accessibility audit were run for this comparison, consistent with the current prototype workflow.
