# Component presentation policy

The kit and showcase share the exported `componentSizePolicy`. Sizes exist for useful density or hierarchy changes. Unsupported group defaults normalize to Medium; single-size components do not show a redundant selector. Five color treatments belong to action buttons and icon previews. Other components use one coherent treatment, with state or semantic status providing variation.

| Component | Sizes | Treatment and purpose |
| --- | --- | --- |
| Button | xs, sm, md, lg, xl | Filled, Tonal, Outlined, Ghost, Danger; action emphasis. |
| IconButton | sm, md, lg | Filled, Tonal, Outlined, Ghost, Danger; action emphasis. |
| FAB | sm, md, lg | One control treatment; selection and disabled states stay explicit. |
| Toggle | sm, md, lg | One control treatment; selection and disabled states stay explicit. |
| ButtonGroup | sm, md, lg | One control treatment; selection and disabled states stay explicit. |
| ToggleGroup | sm, md, lg | One control treatment; selection and disabled states stay explicit. |
| Checkbox | sm, md, lg | One control treatment; selection and disabled states stay explicit. |
| RadioGroup | sm, md, lg | One control treatment; selection and disabled states stay explicit. |
| Switch | sm, md, lg | One control treatment; selection and disabled states stay explicit. |
| Slider | sm, md, lg | One control treatment; selection and disabled states stay explicit. |
| TextField | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| Textarea | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| PasswordField | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| NumberField | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| SearchField | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| Select | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| Combobox | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| MultiSelect | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| OTPInput | sm, md | Compact and standard digit cells fit six-digit codes on narrow screens. |
| FileInput | sm, md | Compact and standard upload layouts; no Large variant. |
| FormField | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| Calendar | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| DatePicker | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| DateRangePicker | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| TimePicker | sm, md, lg | One Outline treatment; compact, standard and roomy field geometry. |
| Tabs | sm, md, lg | One navigation treatment; row density and hierarchy. |
| Breadcrumbs | sm, md | Supporting navigation stays subordinate to the page heading. |
| Pagination | sm, md, lg | One navigation treatment; row density and hierarchy. |
| TopAppBar | md | One responsive toolbar manages its own overflow. |
| NavigationRail | sm, md, lg | One navigation treatment; row density and hierarchy. |
| SideNavigation | sm, md, lg | One navigation treatment; row density and hierarchy. |
| Tree | sm, md, lg | One navigation treatment; row density and hierarchy. |
| TableOfContents | sm, md, lg | One navigation treatment; row density and hierarchy. |
| Stepper | sm, md, lg | One navigation treatment; row density and hierarchy. |
| Link | sm, md, lg | One navigation treatment; row density and hierarchy. |
| CardGroup | sm, md, lg | One shared surface treatment; text and spacing scale together. |
| Card | sm, md, lg | One shared surface treatment; text and spacing scale together. |
| List | sm, md, lg | One shared surface treatment; text and spacing scale together. |
| Avatar | sm, md, lg | One shared surface treatment; text and spacing scale together. |
| Badge | sm, md | Status labels need compact and standard text, not a large action target. |
| Accordion | sm, md, lg | One shared surface treatment; text and spacing scale together. |
| Divider | md | A separator has one stroke; spacing belongs to its layout. |
| DataTable | sm, md, lg | One shared surface treatment; text and spacing scale together. |
| Alert | sm, md, lg | One feedback treatment; semantic state is separate from size. |
| Toast | sm, md, lg | One feedback treatment; semantic state is separate from size. |
| NotificationCenter | md | One responsive history panel; individual toasts retain size options. |
| Progress | md | Continuous and weighted segmented waves, each with optional status; width follows the container. |
| Spinner | sm, md, lg | One feedback treatment; semantic state is separate from size. |
| Skeleton | md | Placeholder geometry is controlled by width, height, and rounded. |
| EmptyState | md | One responsive content layout adapts to the available space. |
| Dialog | sm, md, lg | One shared floating surface; content and spacing scale together. |
| AlertDialog | sm, md, lg | One shared floating surface; content and spacing scale together. |
| Drawer | sm, md, lg | One shared floating surface; content and spacing scale together. |
| BottomSheet | sm, md, lg | One shared floating surface; content and spacing scale together. |
| Popover | sm, md, lg | One shared floating surface; content and spacing scale together. |
| Menu | sm, md, lg | One shared floating surface; content and spacing scale together. |
| Tooltip | sm, md, lg | One shared floating surface; content and spacing scale together. |
| AnimatedIcon | sm, md, lg | Filled, Tonal, Outlined, Ghost, Danger; action emphasis. |

## Composition and color

Tree is the shared implementation for nested catalogue and document navigation. Navigation text uses neutral ink, with selection shown by its background. Identity colors are stable by name, and semantic badges reuse the miscellaneous palette. Alerts use neutral surface and ink roles, with semantic icons and accessible live-region roles. Toast, popover, dialog and tooltip share raised-surface roles.

The control radius is 14/24/29px for Small/Medium/Large. A frame enclosing controls adds its real content inset and border to that radius so the curves are concentric. Group frames share the same inset token for padding and radius. Keep press/ripple radius compression intact and retain the trigger radius during select expansion.

New component variants require a distinct interaction, semantic meaning, density need, or responsive behavior. Do not add a third size or five action colors automatically. Reuse shared library components and semantic tokens before adding showcase CSS.

## Shared motion and pattern variants

All animated families import the shared motion-engine entry; mixed-unit springs use its settling budgets. Dialog and AlertDialog share the saved playground configuration. Drawer and BottomSheet reuse that configuration with scale disabled. Date/time panels and popovers reuse popup motion. Menu closure releases the interaction layer immediately so rapid reopening works. Tooltip entrances fade and reveal rounded width from the center. Reduced motion bypasses these entrances.

Reference compositions reuse exported controls rather than duplicating fields or dialogs. Chart exposes bar, line, area and pie with hover/focus values. AspectRatio and Attachment accept numeric ratios; image attachments support inline and card layouts. Table/DataTable accept optional row or column striping. Resizable accepts percentage snap points. Progress accepts positive weighted stages with optional labels and alternates wave orientation. Sidebar offers standard, inset and floating compositions; Trace shows operation steps, status, duration and expandable detail.

Calendar has a persistent header. Month/year labels change immediately without text morph or layout animation; date cells reuse Button press and ripple. Fixed-size date cells skip intrinsic Button geometry and color probes.

Shared compositions expose purposeful layout and readability variants at the library boundary: multiple Accordion sections, vertical Tabs/Carousel/Resizable/Separator, responsive Field orientation, explicit ScrollArea axes, muted Item surfaces and independent CodeBlock line numbers/wrapping. Date-range selection reuses DateRangePicker. Badge has label/dot presentations: compact labels are 16px high and Small/Medium dots are 6/8px with accessible names. These indicators are passive, so their visual size is not an action target. See reports/shadcn-review-2026-11-04/REVIEW.md for all 65 decisions.

Trace diagnostic rows reuse Accordion directly, including hidden-content hold preview and authored expansion/reveal. No Button press/ripple is applied to these titles. Timeline connects status nodes and panels; Compact is a divided list without connectors. A step without details is not expandable.

Neutral + seed is implemented at the provider/token boundary. Light primary fills use paired dark text; transparent actions and links use separate readable ink. Neutral container borders may be subdued, while functional field/control boundaries retain the stronger outline role. The preset does not add component-specific color variants or change geometry/motion.

## Active catalogue, 2026-11-08

The showcase uses one ordered 45-entry catalogue in five groups. Supporting components remain exported without adding navigation entries. SplitButton and FABMenu reuse Menu; Chips reuses Toggle; NavigationBar reuses the shared navigation base; Toolbar uses existing actions with directional keyboard focus; SideSheet reuses Drawer. Carousel, CodeBlock and Sidebar are available directly from the package. Shape exposes six geometric forms. The active names Breadcrumb, NavigationDrawer, Table and Loading reuse their existing shared implementations. Carousel, Sidebar, CodeBlock and Shape have one presentation size; their content or dimensions own the layout.

Button and IconButton press feedback animates the surface silhouette and ripple while the content retains its resting size and position. The shared content layer cancels the surface scale on every animation frame. Intrinsic measurement removes this compensation from its unpressed probe. Explicit Small/Medium/Large changes continue to use their authored typography and icon sizes.

Button adds compact XS and prominent XL without changing the existing three sizes. Size aliases s/m/l map to sm/md/lg. The new sizes are Button-specific; other families retain their own policies. There are no Square or Elevated treatments, and Elevated is excluded from every future component. Button configuration uses Example Presets, Appearance, Content and Behavior, with full optional icon selection and synchronized Web Components/React recipes.


## Fixed component motion defaults, 2026-11-08

Component pages have no Advanced panels. Button icons inherit their Appearance size, with no independent icon-size or ripple option in either code format. Button color/size/press/ripple overrides, provider buttonMotion/textMorph overrides, and icon/switch timing knobs are removed from public APIs. Keep all authored default values and animations. Private composition rules retain passive ToggleGroup segments and Calendar/Collapsible sizing behavior. The separate Motion playground retains isolated experiments through a private context. Active is a visual held hover background; it does not select, disable or activate the button.


## Configuration and documentation tabs, 2026-11-08

Catalogue pages open in Configuration with the live component and configuration controls only. Usage code, Web Components/React recipes, API tables, behavior notes, in-page documentation navigation and previous/next links live in the separate Documentation tab. Reuse exported Tabs and keep configuration state when switching tabs; changing component routes returns to Configuration. Button configuration follows the preview, Configuration heading and Example Presets, Appearance, Content and Behavior groups. Remove the preview footer caption and catalogue ordinal from this surface. Keyboard-visible focus on enabled Button and IconButton uses the same surface background as Active while retaining the focus ring. Focus does not change toggle selection. Motion drives authored springs/ripples; CSS owns styling and simple transitions; GSAP is not used.


## Foundation adaptation, 2026-11-08

Neutral + seed must consume the selected Material algorithm's accent families at the shared theme boundary. Keep the existing Tonal Spot default exact, HCT tone-86 fills, paired readable ink, independent tint/strength controls and neutral surface hierarchy. Components must consume these shared roles rather than overriding them locally.

Before the foundation work, a complete source/design snapshot (536 files) was saved and verified in backups/MaterialFluid-before-foundations-20261108-180759.zip. The foundation architecture adapts selected MIT source from Grenish/expressive revision eb96d3df46790079ae5bf7b22d721491260c1485; provenance is in reports/foundations-2026-11-08/upstream-source.json. Keep the owner theme and motion layers authoritative. There is no elevation system, shadow treatment, GSAP dependency, Tailwind migration or component replacement.

The provider uses createFoundationTheme to combine the existing Material/Previous/Neutral + seed color engines, independent status palette and new semantic foundation variables. Tonal Spot remains the default; nine generation algorithms are available without changing saved/default palettes. All 24 pre-migration default color matrices remain exact. Owner fonts, original component metrics and 14/24/29px control radii remain. The exported Foundations namespace adds role-driven type styles, scoped CSS generation, 35 Material shape paths and morphing utilities, shared interaction/a11y policy, color-pair checks and a Motion adapter using the authored press/resize/dialog/popup springs. Effects retain fixed fades rather than spatial overshoot. No new per-component tuning props are added.

The five foundation pages use their own Tree alongside the unchanged 45-component catalogue: Color, Typography, Shape, Motion and Accessibility. Typography/Shape/Accessibility separate Configuration from Documentation. Color keeps the original color page and adds the algorithm/palette explorer. Motion keeps the existing isolated experiments and adds a live overview of owner curves. Reference foundation structure is adapted to MaterialFluid visuals. Individual component copying is deferred to later owner requests. Accessibility checks demonstrate actual active color pairs and focus behavior; do not claim full accessibility certification.

## Owner refinements, 2026-11-09

Foundation navigation has five entries: Color, Typography, Shape, Motion and Accessibility. Typography supports subscript/superscript, line-fragment rounded highlight and keycaps. Shared spatial motion uses the finite owner curves (two endpoint crossings, three for Press); type metrics ease without a spring. Only Tonal, Outlined and Ghost/Text Buttons may toggle, using their own off treatment and Primary when on. Progress uses the same size and position rules as icons. Preserve these behaviors at shared library boundaries and avoid measuring unchanged controls on parent renders.

## Action refinements, 2026-11-09

Button and IconButton expose emphasize as a boolean toggle behavior, independently of Appearance, with paired Primary fill and ink in both states. It requires toggle; it is never an appearance variant. Tonal, Outlined and Ghost/Text retain their own off treatment and Primary on treatment when emphasize is false. Emphasize also permits Filled toggles. Danger remains an ordinary action. IconButton has five sizes and narrow/default/wide widths, with no Square or Elevated option. A nullable selectedIcon uses the same Material symbol, outlined off and filled on through a smooth crossfade between the actual outline and filled artwork; a separate selectedIcon swaps artwork. selectedLabel optionally names the selected action. Do not expose Playback/playing modes or new animation tuning parameters. Both action pages use grouped Example Presets, Appearance, Content and Behavior; React and optional Web Component recipes remain in Documentation.


## Button Group additions, 2026-11-09

ButtonGroup adds standard/connected layouts, action/single/multi selection, required selection, selected-only labels, five owner action sizes, density, orientation, equal widths, per-item disabled states and native keyboard activation. ButtonGroupItem or the buttons list opts into these additions; existing arbitrary-child frames remain compatible. Standard buttons retain their layout width during selection and pressing; selected-only labels reserve their width in Standard groups. Connected selected buttons round all four corners; unselected buttons retain joined corners. All buttons preserve the shared radius press animation with fixed text/icons. Groups use a 16px overflow painting margin so spring overshoot remains visible horizontally and vertically without scrollbars. React and optional Web Component APIs and recipes follow the selected configuration. Keep only grouped Example Presets, Appearance, Content and Behavior in Configuration. No Square, Elevated or public press/ripple timing knobs.


## Button color and ripple sizing, 2026-11-10

All Button color changes use a simple whole-surface fade, including toggle selection, appearance and theme changes. The click ripple stays independent feedback and never becomes the selected color. Remove the color-wave layers and tracking. Active ripples follow the button's current unscaled dimensions, including selected-label and size growth, without restarting their progress or changing the original click point. Preserve press-driven radius deformation, fixed content and reduced motion.


## Split Button additions, 2026-11-10

SplitButton composes the shared Button and Menu: paired owner colors, five owner sizes, 2px gap, press-linked radii, fixed content, inner-corner feedback and a rotating/centering chevron. Opening rounds the trailing half without selecting either half or replacing its appearance. Preserve label/menuLabel and the native leading-button ref. Add text/children, trailingLabel/groupLabel/ariaLabel, items or SplitButtonItem declarations (including nested choices, headings and separators), controlled/default expansion, select/expand/collapse/change and open/close aliases, external expansion without items, native submit/reset, top-layer menus and imperative content/state/lifecycle methods. Small coarse-pointer targets stay enlarged. Keep the 45-entry catalogue unchanged. Configuration contains only Example Presets, Appearance, Content (full optional icon catalogue) and Behavior; React/Web Components recipes and API stay in Documentation. No Elevated, Square or public motion overrides. All ordinary color changes fade; ripples remain independent feedback and track live geometry.


## FAB reference additions, 2026-11-10

FAB adds six paired semantic color roles through color, reference size aliases default/medium/large (56/80/96px with 24/28/32px icons), and 16px fixed logical or physical placement. Explicit placement, including none, overrides the deprecated physical position; removing it restores that alias. Logical corners mirror live RTL. Existing Button variants, sm/md/lg sizes, children/leading slots and native button refs remain compatible. New reference color/container usage defaults to the reference size; ordinary legacy usage retains its inherited size. Preserve owner radii, finite curves, fixed content, shared whole-button color fades and live ripple geometry. Add native form semantics, content/value/state/placement/class/event/lifecycle methods, and the optional mf-fab element. Configuration stays grouped with the full icon picker; working React/Web recipes and API stay in Documentation. No Square, elevation, lower/raise, independent icon sizes or public animation tuning.


## FAB Menu additions, 2026-11-10

FABMenu supports an expressive list below 600px and the shared top-layer Menu above, with explicit list/menu overrides. Auto presentation locks while open and resolves the latest window on close. The list keeps trigger focus, reveals labelled pills nearest-first with the owner's finite popup curve, and transforms the trigger into a round 56px close action with a 20px glyph. Closed actions are inert; Arrow keys wrap, Home/End select ends, Escape and Tab return to the trigger, and outside dismissal leaves outside focus alone. Items preserve the shared fixed-content press/ripple behavior. Colors pair the selected role's container with its ink; close uses the role itself, with ordinary color fades independent of ripple. A private composition radius value combines close-button morphing with the existing press/ripple silhouette; it adds no public tuning API. Logical bottom corners sit 16px from a positioned container, or 24px from 1200px, and mirror RTL. Preserve legacy MenuItem arrays/callbacks and sizes; add declarations, controlled expansion, events, methods, custom menu adapters, and optional mf-fab-menu/mf-fab-menu-item with quiet reflected open attributes. Configuration uses the four established groups and full icon catalogue; both code formats and API stay in Documentation. No Square, Elevated, elevation or public animation controls.


## Extended FAB additions, 2026-11-10

ExtendedFAB is a shared Button composition with six paired FAB color roles and small/medium/large footprints (56/80/96px, 24/28/32px icons). It lives inside the existing FAB showcase Appearance type selector, preserving the ordered 45-entry catalogue. Source width semantics are explicit: fixed is intrinsic content width; fluid fills its containing width and responds to parent resizing. Compact mode matches the selected size's height, hides the label visually while retaining its accessible name, and keeps the icon at its authored size. Visible text names the button unless ariaLabel is explicitly provided. ReactNode labels and native Web Component projected label nodes stay supported. Collapse on window scroll uses direction deltas above 10px; top-of-page expands. Controlled/default compact state, native forms, icon position, logical/physical placement precedence, imperative content/state/event/lifecycle methods and Web Component reflection are supported. Explicit collapse/expand calls each dispatch one DOM/API event; quiet property updates do not synthesize those calls. Ordinary colors fade; all size/press/ripple geometry remains the owner system with fixed pressed content. Owner fonts, weights and 24/29px FAB radii are retained. No elevation/lower/raise, Square, independent icon sizing or public animation tuning. Configuration keeps the four established groups and full icon picker; current React/Web recipes and API stay in Documentation.


## Switch additions, 2026-11-10

Switch retains three owner sizes, the end-label default, native button refs, existing connection/state/language content and RTL drag/cancel interaction. Add optional label/children/ariaLabel, logical start/end label placement, selected/unselected ReactNode or catalogue glyphs, supporting text, independent error state, required/native form ownership, original change-event payloads and source-compatible silent model methods. Supporting text describes the switch without becoming its name; replacing/removing it does not clear error. Space and Enter each activate once. Programmatic input/element/supportingTextElement access, focus/blur/tap/swipe subscriptions and lifecycle cleanup stay available through SwitchHandle. The optional mf-switch uses native default/live checked semantics, quiet setters and form reset. Icon geometry follows component size, with fixed artwork during handle travel and ordinary color fades. Configuration has the four established groups and full optional catalogue choices; React/Web recipes and API live in Documentation. No Square, Elevated, public animation or independent icon-size controls.


## Radio Buttons additions, 2026-11-10

RadioGroup keeps its native div ref, three owner sizes, horizontal default, authored ChoiceFill press/preview/selection geometry and paired semantic colors. Add direction as an orientation alias, logical and per-option label placement, nullable selection APIs, native radio inputs/forms/required/reset, dynamic options, group/per-option enable/disable, typed change payloads and lifecycle methods. Setters and option mutations never emit change; React model callbacks still request controlled state. RadioGroup retains its legacy string callback, including empty-string clearing; the source-compatible Radios alias uses nullable model updates and defaults to vertical. Radio declarations support labels/children, disabled and labelBefore, including arrays/fragments. Arrow keys skip disabled options and respect orientation/RTL. Radios/its Web adapter retain native Enter form submission; legacy RadioGroup continues to suppress Enter selection. Preserve original native change events, one user change notification, and no checkbox-style toggle-off behavior. The optional mf-radios/mf-radio declarations remain in the host and preserve default/live value, dynamic updates and native form reset. Configuration contains only the established four groups; both recipes and API stay in Documentation. Indicators remain semantic circles. No arbitrary indicator icons, ripple settings, public motion tuning, Square or Elevated options.
