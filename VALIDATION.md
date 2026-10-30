# MaterialFluid validation

Verified on 2026-10-30 on Linux with Node.js 26.12.1, npm 12.2.1, Chromium through Playwright, and the repository lockfile. Package version remains 0.11.0; these working-tree changes have not been published.

## Automated checks

- Strict TypeScript, ESLint, showcase/library production builds, declarations and asset copying pass.
- All 155 unit/component tests pass across seven files.
- All 121 browser scenarios pass across the final full sweep and focused reruns. The sweep passed 120; the narrow RTL Progress check was updated to wait for the existing responsive button spring to settle, and all five Progress/Spinner checks passed in the focused rerun. The earlier selection-control resize-centering defect was fixed in the shared grid layout and passes in both languages. The previously intermittent continuous-slider scenario passed in the final sweep.
- Browser coverage includes all 58 component pages, keyboard/touch interaction, English/Persian, mobile viewports, reduced motion, connected options expansion, press/radius animation, passive labels, Tree icon modes, shared concentric frame radii, Switch color pairs, circular field icon actions, and centered AM/PM controls in both directions, shared size transitions and interruption, variable calendar week counts, connected date ranges, wavy indicators, and segmented/status-row Progress presentations.
- The earlier default-theme automated color-contrast scans found no violations across all 58 routes in the default light theme and all 58 routes in the default dark theme. Miscellaneous identity/status color pairs meet 4.5:1 in both themes in unit checks.
- A narrow-screen sweep covered all 58 pages in both themes and both languages at 390px: no runtime errors or document overflow. Tabs and pagination intentionally retain internal horizontal scrolling for controls that exceed the available width.
- The packed library installs into a separate consumer fixture. Its 60 checked public exports, server rendering, complete optional icon pack, icon registration, fonts and styles pass smoke checks. All 58 default and 58 size examples, plus the new Progress presentation APIs and FileInput size restriction, typecheck against the installed package.

## Design verification

The shared component policy is documented in COMPONENT_POLICY.md. Controls retain press/radius animation; framed surfaces add their real inset and border to the inner control radius. Icon actions begin circular at their actual diameter. The showcase uses a continuous dotted canvas with a solid, divided variant header. Tree navigation and nested contents share library rendering, neutral text, and optional icons without empty slots. Tonal Spot is the sole scheme; identity/status colors are independent of the seed. Toasts use the shared raised surface.

The time-picker period group is visually centered and its bounding-box center differs from the popover center by less than 1px in English and Persian browser checks.

## Boundaries

These results establish local automated behavior and viewport checks, not physical-device, Safari, Firefox or manual screen-reader acceptance. Automated contrast and accessibility checks do not certify WCAG conformance; custom palette adjustments and untested interaction states need their own review.

Vite reports large-chunk warnings for the main showcase and optional full icon catalogue. The full icon pack remains a separate, lazy-loaded asset. The showcase uses local font/icon assets and illustrative data, with no account or backend. The FileInput example explicitly requires the consumer's own upload endpoint.

## Follow-up component work

All supported size variants share the Button sizing spring, including Spinner and explicit icon dimensions. FileInput exposes only Small and Medium, with inherited unsupported sizes normalized to Medium. Calendar arrows and caption buttons share their size and header alignment, month precedes year, entirely empty weeks are omitted, and date-range selection paints one continuous band. Progress supports Wave, Segmented and With status; the Wave uses the supplied 60/20/31/5/20 tailward incremental configuration. This reference style applies to Progress only. Spinner and loading buttons reuse a circular wave. Visual checks cover all three Progress presentations in light/dark; browser checks cover English/Persian and narrow layouts.
