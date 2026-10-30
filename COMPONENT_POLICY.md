# Component presentation policy

The kit and showcase share the exported `componentSizePolicy`. Sizes exist for useful density or hierarchy changes. Unsupported group defaults normalize to Medium; single-size components do not show a redundant selector. Five color treatments belong to action buttons and icon previews. Other components use one coherent treatment, with state or semantic status providing variation.

| Component | Sizes | Treatment and purpose |
| --- | --- | --- |
| Button | sm, md, lg | Filled, Tonal, Outlined, Ghost, Danger; action emphasis. |
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
| Progress | md | Wave, segmented, and status-row presentations; width follows the container. |
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

Tree is the shared implementation for nested catalogue and document navigation. Navigation text uses neutral ink, with selection shown by its background. Identity colors are stable by name, and semantic badges and alerts reuse the miscellaneous palette. Toast, popover, dialog and tooltip share raised-surface roles.

The control radius is 14/24/29px for Small/Medium/Large. A frame enclosing controls adds its real content inset and border to that radius so the curves are concentric. Group frames share the same inset token for padding and radius. Keep press/ripple radius compression intact and retain the trigger radius during select expansion.

New component variants require a distinct interaction, semantic meaning, density need, or responsive behavior. Do not add a third size or five action colors automatically. Reuse shared library components and semantic tokens before adding showcase CSS.
