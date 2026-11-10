# Component implementation progress

Reference: https://md3.io/components/ . Work proceeds in reference order, completing and verifying one component before starting the next. MaterialFluid identity, owner motion, color fades, fixed button content, full optional icon choices, Configuration/Documentation separation, and exclusion of Elevated/Square remain authoritative. The existing 45-entry catalogue stays intact; reference additions that share an existing family can be documented within that family without dropping any reference component from this checklist.

## Actions

- [x] Button — shared API, configuration and both framework recipes; see VALIDATION.md.
- [x] Icon button — shared API, configuration and both framework recipes; see VALIDATION.md.
- [x] Button group — shared API, configuration, recipes and activation performance; see reports/button-group-2026-11-09/REVIEW.md and reports/button-feedback-2026-11-10/REVIEW.md.
- [x] Split button — complete source/API adaptation and validation; see reports/split-button-2026-11-10/REVIEW.md.
- [x] FAB — shared color/size/placement/API additions, configuration, both recipes and verified package/browser behavior; see reports/fab-2026-11-10/REVIEW.md.
- [x] FAB menu — expressive/baseline presentations, source API, configuration, both recipes and verified package/browser behavior; see reports/fab-menu-2026-11-10/REVIEW.md.
- [x] Extended FAB — shared API, scroll/compact/full-width behavior, both recipes and verified package/browser support in the FAB family; see reports/extended-fab-2026-11-10/REVIEW.md.

## Selection and input

- [x] Checkbox - shared state/form/API, parent/child examples, React/Web recipes and validated package/browser support; see reports/checkbox-2026-11-10/REVIEW.md.
- [x] Switch - shared API, help/error/forms, icons, both recipes and verified browser/package support; see reports/switch-2026-11-10/REVIEW.md.
- [x] Radio buttons - shared API, native forms, declarations, dynamic options, both recipes and verified browser/package support; see reports/radios-2026-11-10/REVIEW.md.
- [ ] Chips.
- [ ] Slider.
- [ ] Text field.
- [ ] Select.
- [ ] Search.
- [ ] Date picker.
- [ ] Time picker.

## Navigation

- [ ] Navigation rail.
- [ ] Navigation bar.
- [ ] Drawer.
- [ ] Tabs.
- [ ] Menu.
- [ ] Top app bar.
- [ ] Bottom app bar.
- [ ] Toolbar.

## Containment

- [ ] Card.
- [ ] List.
- [ ] Carousel.
- [ ] Divider.
- [ ] Dialog.
- [ ] Bottom sheet.
- [ ] Side sheet.

## Communication

- [ ] Badge.
- [ ] Progress.
- [ ] Loading indicator.
- [ ] Snackbar.
- [ ] Tooltip.

Completion requires implementation at the shared library boundary, source/API/usage review, grouped live configuration, current React/Web Components recipes, keyboard/reduced-motion behavior, relevant type/build/unit/browser/package validation, and recorded evidence. Existing compatibility components alone do not count as completed reference adaptations.
