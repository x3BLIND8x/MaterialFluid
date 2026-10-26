# MaterialFluid 0.11 validation

Verified on 2026-10-26 using Windows, Node.js 22.14.0, npm 10.9.2 and the repository lockfile. The package version is 0.11.0 and the Git release tag is v0.11.

## Completed

- All 139 unit/component tests pass across five test files.
- All 89 browser regression scenarios pass across the full sweep and focused reruns: 85 passed the full sweep; four passed after updating obsolete selectors, waiting for keyboard focus before Escape, and recording the slider spring from pointer-down. These checks use system Microsoft Edge through Playwright.
- Browser coverage includes all 56 routes, keyboard/touch interaction, English/Persian, mobile viewports, calendar selection, RTL arrows and playback order, page-ratio order, connected options expansion, sliders and selection controls.
- ESLint and strict TypeScript checks pass.
- The full production build passes, including showcase and library bundles, declarations and asset copying.
- The packed 0.11.0 library installs into the consumer fixture. Its 58 exports, server rendering, optional icon registration, complete icon pack, fonts and styles pass smoke checks. All 56 default and 56 size examples typecheck against the installed package.
- Desktop/mobile visual checks confirm the date picker uses the same native button trigger as the range picker, with no text input/caret. Empty range boundaries use `----/--/-- - ----/--/--`; Persian displays retain Persian digits.

## Persian calendar profile

A local development-browser comparison measured ten month navigations with the same two-frame sampling method. Persian navigation averaged 90.84 ms before the change and 40.77 ms afterward; Gregorian navigation afterward averaged 36.13 ms. Repeated number-formatter construction during those Persian navigations fell from 3,744 instances to zero. The adapter caches date labels and localizes digits once; expressive navigation remains enabled in the component.

## Boundaries

The browser results establish local automated behavior and viewport checks, not physical-phone, Safari, Firefox or manual screen-reader acceptance. Automated accessibility checks support the WCAG 2.2 AA target without certifying conformance.

Vite still reports the existing large-chunk warning for the icon catalogue and main showcase bundle. The showcase uses local font/icon assets and illustrative data, with no account or backend.
