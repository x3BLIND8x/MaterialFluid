# MaterialFluid and shadcn/ui

Reference: https://ui.shadcn.com/docs/components (retrieved 2026-11-03). This compares documented component coverage, not drop-in API compatibility. The original 58-entry catalogue is retained; its shared components incorporate the owner-requested refinements. The new expandable collection has 65 entries: 36 reuse original components and 29 add new patterns through the exported Shadcn namespace. No shadcn stylesheet, framework, CLI or dependency was installed.

| shadcn/ui reference | MaterialFluid counterpart | Integration |
| --- | --- | --- |
| Accordion | Accordion | Existing component, reused |
| Alert | Alert | Existing component, reused |
| Alert Dialog | AlertDialog | Existing component, reused |
| Aspect Ratio | Aspect Ratio | New additive pattern |
| Attachment | Attachment | New additive pattern |
| Avatar | Avatar | Existing component, reused |
| Badge | Badge | Existing component, reused |
| Breadcrumb | Breadcrumbs | Existing component, reused |
| Bubble | Bubble | New additive pattern |
| Button | Button | Existing component, reused |
| Button Group | ButtonGroup | Existing component, reused |
| Calendar | Calendar | Existing component, reused |
| Card | Card | Existing component, reused |
| Carousel | Carousel | New additive pattern |
| Chart | Chart | New additive pattern |
| Checkbox | Checkbox | Existing component, reused |
| Code Block | Code Block | New additive pattern |
| Collapsible | Collapsible | New additive pattern |
| Combobox | Combobox | Existing component, reused |
| Command | Command | New additive pattern |
| Context Menu | Context Menu | New additive pattern |
| Data Table | DataTable | Existing component, reused |
| Date Picker | DatePicker | Existing component, reused |
| Dialog | Dialog | Existing component, reused |
| Direction | Direction | New additive pattern |
| Drawer | BottomSheet | Existing component, reused |
| Dropdown Menu | Menu | Existing component, reused |
| Empty | EmptyState | Existing component, reused |
| Field | Field | New additive pattern |
| Hover Card | Hover Card | New additive pattern |
| Input | Input | New additive pattern |
| Input Group | Input Group | New additive pattern |
| Input OTP | OTPInput | Existing component, reused |
| Item | Item | New additive pattern |
| Kbd | Kbd | New additive pattern |
| Label | Label | New additive pattern |
| Marker | Marker | New additive pattern |
| Menubar | Menubar | New additive pattern |
| Message | Message | New additive pattern |
| Message Scroller | Message Scroller | New additive pattern |
| Navigation Menu | Navigation Menu | New additive pattern |
| Pagination | Pagination | Existing component, reused |
| Popover | Popover | Existing component, reused |
| Progress | Progress | Existing component, reused |
| Questionnaire | Questionnaire | New additive pattern |
| Radio Group | RadioGroup | Existing component, reused |
| Resizable | Resizable | New additive pattern |
| Scroll Area | Scroll Area | New additive pattern |
| Select | Select | Existing component, reused |
| Separator | Divider | Existing component, reused |
| Sheet | Drawer | Existing component, reused |
| Sidebar | Sidebar | New additive pattern |
| Skeleton | Skeleton | Existing component, reused |
| Slider | Slider | Existing component, reused |
| Spinner | Spinner | Existing component, reused |
| Switch | Switch | Existing component, reused |
| Table | Table | New additive pattern |
| Tabs | Tabs | Existing component, reused |
| Textarea | Textarea | Existing component, reused |
| Toast | Toast | Existing component, reused |
| Toggle | Toggle | Existing component, reused |
| Toggle Group | ToggleGroup | Existing component, reused |
| Tooltip | Tooltip | Existing component, reused |
| Trace | Trace | New additive pattern |
| Typography | Typography | New additive pattern |

## MaterialFluid-only originals, retained

IconButton, FAB, TextField, PasswordField, NumberField, SearchField, MultiSelect, FileInput, FormField, DateRangePicker, TimePicker, TopAppBar, NavigationRail, SideNavigation, Tree, TableOfContents, Stepper, Link, CardGroup, List, NotificationCenter, AnimatedIcon.

The new routes live under #/shadcn; original routes remain under #/components. Reference names retain MaterialFluid props, palette, fonts, geometry, motion settings and optional icon loading. New patterns illustrate their core interactions; Chart supports bar, line, area and donut variants with hover/focus tooltips, and this is not a claim of every upstream variant or prop.
