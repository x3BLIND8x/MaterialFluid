# Shared component and motion review - 2026-11-03

The original 58-entry catalogue remains. The reference collection contains 65 routes: 36 reuse original exports and 29 are compositions under the Shadcn namespace. Native Select was removed at the owner's request. This extends useful variants and interactions; it does not claim drop-in upstream API parity.

| Family | Shared implementation | Motion/state ownership |
| --- | --- | --- |
| Buttons, action groups, toggles | controls.tsx, button-press.ts, button-geometry.ts | Saved button press settings, shared selection-motion.ts and spring settling |
| Fields and choices | forms.tsx, options-expansion.tsx, field-trigger-icon.tsx | Shared focus padding, connected expansion, height and spring helpers |
| Calendar and pickers | dates.tsx, AutoHeight | Shared picker popup recipe; neutral surface, paired primary selection |
| Tabs and navigation | navigation.tsx, selection-motion.ts, tree.tsx | Shared persistent moving selection, press depth/radius, drag and reduced motion |
| Accordion and layout surfaces | surfaces.tsx, auto-height.tsx | Saved accordion settings, measured height and spring settling |
| Dialog and AlertDialog | overlays.tsx | motionEngine.dialog; playground invokes the exported AlertDialog |
| Drawer, Sheet and BottomSheet | overlays.tsx | Same dialog recipe with scale disabled, native accessible presence |
| Menus and popovers | overlays.tsx | Shared menu/popup settings, nonmodal menu lifecycle; no stale exit focus layer |
| Tooltip and HoverCard | overlays.tsx, patterns.tsx | Fade plus width reveal; HoverCard suppresses nested tooltips and framed Item |
| Progress and Spinner | feedback.tsx, wavy-progress.tsx | Shared wave renderers, extent-aware settling, offscreen pause/reduced motion |
| Notifications | notifications.tsx | Saved toast recipe, newest at top with downward entrance |
| Chart | shadcn/chart.tsx | Shared layout/popup recipe, pointer and keyboard values, four visualizations |
| Resizable | shadcn/patterns.tsx | Same range spring as Slider, pointer/keyboard control and percentage snap points |
| Remaining reference patterns | shadcn/patterns.tsx | Compositions of exported Button, TextField, Menu, Dialog, Popover, Select, SideNavigation and other primitives; expanding/moving patterns use motionEngine |
| Static content | Existing semantic primitives | No gratuitous entrance added to separators, typography or passive containers; their interactive children retain shared motion |

All kit imports of spring settling now pass through motion-engine.ts. spring-rest.ts remains the internal unit-aware implementation. Family-specific saved physics remain distinct: sharing the engine does not overwrite the owner's settings with one universal spring.

Browser evidence is in browser-audit.json (all routes), focused-audit.json (overlays, selection reset and initial column sizing), and interaction-audit.json (menu reopening, variants, input focus, snapping and width reveal). Screenshots document desktop and narrow layouts. Physical touch hardware and other browser engines were not tested in this change.
