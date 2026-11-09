# Shadcn component review - 2026-11-04

Reviewed all 65 collection entries using Impeccable audit/craft guidance and the MaterialFluid product, design and component policies. Original 58 catalogue entries, ordering, APIs, fonts, semantic palette and saved motion remain the foundation. No framework or stylesheet was imported from shadcn.

## Implemented decisions

Added useful variants to 11 component families: Accordion, Badge, Carousel, Code Block, Date Picker, Field, Item, Resizable, Scroll Area, Separator and Tabs. Existing variants were retained where they already cover the use case; states and arbitrary content do not create extra color/style APIs. Collection previews expose supported original sizes and Button appearances. The 34 pattern usage examples are generated from the actual live examples.

| Component | Shared implementation | Variant decision and rationale |
| --- | --- | --- |
| Accordion | Original shared component (`accordion`) | Added single/multiple expansion; independent open sections reuse the existing spring and reveal. |
| Alert | Original shared component (`alert`) | Retain neutral surface and semantic icon/status; additional colored surfaces conflict with the owner direction. |
| Alert Dialog | Original shared component (`alert-dialog`) | Retain shared confirmation API and saved dialog motion; action composition supplies destructive confirmation. |
| Aspect Ratio | Shared Shadcn pattern | Retain arbitrary positive numeric ratios; the existing ratio selector covers landscape, portrait and square media. |
| Attachment | Shared Shadcn pattern | Retain inline/card layouts and arbitrary preview ratios; file metadata and removal stay independent. |
| Avatar | Original shared component (`avatar`) | Retain supported sizes, image/fallback and stable identity colors; grouping already has AvatarGroup. |
| Badge | Original shared component (`badge`) | Added notification-dot presentation (6px Small, 8px Medium), accessible naming and compact 16px text label. Retain semantic tones. |
| Breadcrumb | Original shared component (`breadcrumbs`) | Retain compact supported sizes and semantic current page; no new style necessary. |
| Bubble | Shared Shadcn pattern | Retain start/end alignment for incoming/outgoing content; content supplies message types. |
| Button | Original shared component (`button`) | Retain supported sizes and five existing action appearances; expose controls rather than duplicating implementations. |
| Button Group | Original shared component (`button-group`) | Retain supported sizes and action composition; selection belongs to ToggleGroup. |
| Calendar | Original shared component (`calendar`) | Retain single/range selection and supported sizes; preserve immediate header text and shared date-cell press/ripple. |
| Card | Original shared component (`card`) | Retain supported sizes and content composition; no blanket action-color variants for a container. |
| Carousel | Shared Shadcn pattern | Added vertical orientation with axis-correct drag, navigation and spring pagination. Horizontal/RTL retained. |
| Chart | Shared Shadcn pattern | Retain bar/line/area/pie, secondary series and hover/focus values; charts have distinct data use cases already. |
| Checkbox | Original shared component (`checkbox`) | Retain unchecked/checked/mixed states and supported sizes; states are not extra appearance variants. |
| Code Block | Shared Shadcn pattern | Added optional line numbers and wrapping, independently combinable; copy continues to use the original source. |
| Collapsible | Shared Shadcn pattern | Controlled/uncontrolled expansion now measures inner height and retains content during close; no closing fade or auto-height interpolation. Multiple sections belong to Accordion. |
| Combobox | Original shared component (`combobox`) | Retain search, optional custom value, error/disabled and sizes; multiselection is the original MultiSelect. |
| Command | Shared Shadcn pattern | Retain filtering, empty results and keyboard activation; modal placement can compose with Dialog. |
| Context Menu | Shared Shadcn pattern | Retain pointer and keyboard activation through shared Menu; item composition supplies groups/actions. |
| Data Table | Original shared component (`data-table`) | Retain row/column striping, automatic sizing, filtering/sorting/selection/pagination and supported sizes. |
| Date Picker | Original shared component (`date-picker`) | Expose existing DateRangePicker in Shadcn and add single/range examples; reuse the original date implementations. |
| Dialog | Original shared component (`dialog`) | Retain shared saved motion and sizes; content/actions compose task variants. |
| Direction | Shared Shadcn pattern | Retain ltr/rtl scope; direction is the meaningful variation and is already explicit. |
| Drawer | Original shared component (`bottom-sheet`) | Retain shared BottomSheet, upward offscreen spring and no scaling; distinct from the side Sheet. |
| Dropdown Menu | Original shared component (`menu`) | Retain shared nonmodal Menu with original sizing and interaction lifecycle. |
| Empty | Original shared component (`empty-state`) | Retain icon/title/description/action composition; different empty reasons need content, not competing surfaces. |
| Field | Shared Shadcn pattern | Added vertical/horizontal/responsive layouts; preserve external label association without a duplicate fallback label. |
| Hover Card | Shared Shadcn pattern | Retain shared anchored surface, hover/focus/activation and single content container. |
| Input | Shared Shadcn pattern | Retain shared TextField with native input types, naming, error/disabled and sizes; external Label now names composed fields correctly. |
| Input Group | Shared Shadcn pattern | Retain shared Input and leading/trailing content/action composition; avoid a second field frame. |
| Input OTP | Original shared component (`otp-input`) | Retain supported compact/standard sizes and configurable length; numeric entry and paste use the original input. |
| Item | Shared Shadcn pattern | Added muted surface alongside outline/plain for nested/supporting rows; semantic surface/foreground pair. |
| Kbd | Shared Shadcn pattern | Retain semantic kbd and grouped-key composition; shortcut content supplies the distinction. |
| Label | Shared Shadcn pattern | Retain native htmlFor association; required/optional meaning belongs to the field content. |
| Marker | Shared Shadcn pattern | Retain labeled conversation boundary; no unrelated status palette or presentation needed. |
| Menubar | Shared Shadcn pattern | Retain compact shared Menu triggers with arrow navigation; menu item composition supplies application actions. |
| Message | Shared Shadcn pattern | Retain start/end alignment; identity, body and delivery status remain composable. |
| Message Scroller | Shared Shadcn pattern | Retain constrained scrolling and jump-to-latest; content provides chat/history use cases. |
| Navigation Menu | Shared Shadcn pattern | Retain direct links and expandable shared popovers; layout follows available width. |
| Pagination | Original shared component (`pagination`) | Retain supported sizes and bounded page navigation; no additional color variants. |
| Popover | Original shared component (`popover`) | Retain anchored shared surface and supported sizes; content defines the small task. |
| Progress | Original shared component (`progress`) | Retain continuous/weighted segmented waves with optional status; completion and start geometry stay authored. |
| Questionnaire | Shared Shadcn pattern | Retain choice/text/optional questions and step flow; these input models already cover distinct tasks. |
| Radio Group | Original shared component (`radio-group`) | Retain supported sizes and one selected value; validation/disabled are states. |
| Resizable | Shared Shadcn pattern | Added vertical panels with axis-correct pointer/keyboard movement and semantic handle; retain snaps and Slider spring. |
| Scroll Area | Shared Shadcn pattern | Added explicit vertical/horizontal/both axes; retain keyboard focus and themed scrollbars. |
| Select | Original shared component (`select`) | Retain shared expanding connected field and supported sizes; native select remains removed. |
| Separator | Original shared component (`divider`) | Added horizontal/vertical orientation and optional decorative semantics; spacing remains layout-owned. |
| Sheet | Original shared component (`drawer`) | Retain shared side Drawer and no dialog scaling; content/tasks compose the presentation. |
| Sidebar | Shared Shadcn pattern | Retain standard/inset/floating, shared navigation and responsive collapsed state. |
| Skeleton | Original shared component (`skeleton`) | Retain width/height/rounded geometry; shapes are content placeholders, not themed action variants. |
| Slider | Original shared component (`slider`) | Retain value/range, quantized steps and supported sizes with original spring follow; no markers/dots restored. |
| Spinner | Original shared component (`spinner`) | Retain circular traveling wave and supported sizes; loading role stays explicit. |
| Switch | Original shared component (`switch`) | Retain checked/unchecked/disabled and sizes; original press anticipation and snap stay unchanged. |
| Table | Shared Shadcn pattern | Retain none/row/column striping and semantic table content; dense data interaction belongs to DataTable. |
| Tabs | Original shared component (`tabs`) | Added vertical orientation with vertical keyboard/drag axis; preserve the primary moving pill and original motion. |
| Textarea | Original shared component (`textarea`) | Retain supported sizes, native multiline field, hint/error/count and disabled states. |
| Toast | Original shared component (`toast`) | Retain shared notification surface, status/actions and top-to-bottom delivery; history is NotificationCenter. |
| Toggle | Original shared component (`toggle`) | Retain supported sizes and pressed/unpressed state; original depth/radius feedback stays shared. |
| Toggle Group | Original shared component (`toggle-group`) | Retain single/multiple selection, nullable/default reset behavior and primary moving pill. |
| Tooltip | Original shared component (`tooltip`) | Retain supported sizes and centered zero-width opening with initial fade; no extra tooltip styles. |
| Trace | Shared Shadcn pattern | Timeline now has connected 32px status nodes and diagnostic panels; Compact uses 24px nodes and flat divided rows without connectors. Steps with output reuse the original Accordion, including its hidden-content press preview, spring, blur reveal and no title ripple. Waiting steps have no expander. Sample output includes check results and an actionable build diagnostic. |
| Typography | Shared Shadcn pattern | Retain semantic headings/body/lists/quotes/code via the shared type system; no decorative font variants. |

## Evidence and limits

The before/after route audits each visited 65 pages in desktop light/English and narrow dark/Persian with reduced motion on the latter (130 visits per sweep). Neither sweep detected JavaScript page errors, document overflow or axe WCAG A/AA violations within the live-example region. This paired matrix does not cover every theme/locale cross-product. Follow-up variant checks cover independent Accordion sections, composed Field naming, Item surface, both scroll axes, raw-code copying, resizer keyboard/drag snaps, vertical separators and Carousel dragging, Button appearance/size, vertical Tabs, date ranges and notification dots. The latest Badge/Tabs/Date Picker additions have focused checks; the full route sweep preceded those additions.

A vertical Carousel test initially attempted dragging while the preceding Radix Select still retained its closing modal layer. The test waits for that Select content to unmount before measuring/dragging. This review does not claim immediate pointer availability during Select exit. Other initial failures exposed duplicate Input labels, insufficient demo content for two-axis overflow, keyboard-focusable resizer panels and asynchronous code-mode rendering; the implementation and test corrections are recorded in the focused runs.

No manual screen-reader, physical device, Safari or Firefox acceptance is claimed. Open overlays, custom palettes, every possible content shape and every error/loading state are not exhaustively axe-scanned. Existing showcase/full-icon large-chunk warnings remain. See VALIDATION.md for actual build, test and package results.

## Reference interpretation

Upstream documentation informs distinct use cases, not appearance or API parity: [Item surfaces](https://ui.shadcn.com/docs/components/base/item), [Field orientation](https://ui.shadcn.com/docs/components/base/field), [Resizable orientation](https://ui.shadcn.com/docs/components/base/resizable), [Scroll Area](https://ui.shadcn.com/docs/components/base/scroll-area), [Separator](https://ui.shadcn.com/docs/components/base/separator). MaterialFluid owns all rendering, controls, colors, geometry and motion.


Trace follow-up: trace.json records passing desktop light/English and narrow dark/Persian checks for independent shared Accordion expansion, the hidden-content short preview (11px expressive, 0px reduced), exact closed height, actual diagnostic content, no ripple, and distinct 32px connected Timeline versus 24px connector-free Compact. Both focused axe scans passed.
