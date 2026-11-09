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

Button and IconButton support Emphasize as an ordinary toggle treatment with paired Primary fill and ink in both states. Tonal, Outlined and Ghost/Text retain their own off treatment and Primary on treatment; Filled and Danger do not toggle. IconButton has five sizes and narrow/default/wide widths, with no Square or Elevated option. A nullable selectedIcon uses the same Material symbol, outlined off and filled on through the authored reversible reveal; a separate selectedIcon swaps artwork. selectedLabel optionally names the selected action. Do not expose Playback/playing modes or new animation tuning parameters. Both action pages use grouped Example Presets, Appearance, Content and Behavior; React and optional Web Component recipes remain in Documentation.
