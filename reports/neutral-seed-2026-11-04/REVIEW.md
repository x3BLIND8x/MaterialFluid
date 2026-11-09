# Neutral + seed and readability review - 2026-11-04

The shared provider now supports `colorPreset="neutral"` with independent `neutralColors.surfaceTint` and `neutralColors.accentStrength` controls (0-100; defaults 0/100). The showcase selects this preset by default. Original palette and Previous design remain available with their saved tuning; the library provider keeps its original standard default.

The preset uses neutral white/charcoal surfaces and subdued decorative borders, with stronger functional outlines. Primary fills retain HCT tone 86 in light and dark, use dark paired foregrounds, and derive hue/chroma from the seed. Readable accent ink uses its own tone. Zero strength produces grayscale accents. Semantic identity/status colors remain independent, and geometry/motion are unchanged.

## Readability coverage

- All 123 component routes: 58 originals and 65 shadcn entries.
- Four configurations: light/dark, each with desktop English (1440px) and narrow Persian (390px).
- 492 default-state full-page axe text-contrast scans, plus 79 successfully opened-state scans. Five additional opening attempts timed out during the parallel sweep and were queued for focused confirmation. No document overflow was detected.
- Seven failed scans identified two shared issues: selected Calendar date text inherited Ghost ink in dark mode, and Carousel slide numbers used a pale surface accent as text in light mode. Calendar now supplies the selected fill's paired foreground through shared Button variables; slide numbers use the readable primary ink token.
- The palette unit matrix covers six seeds, both modes, and tint/strength extremes: 96 generated palettes. Primary tone stays above 84 after gamut mapping; primary/foreground, neutral text and plain accent ink meet 7:1; functional outlines meet 3:1. Seed-independent neutrals, independent controls and stored preference restoration also pass.
- Initial focused browser checks cover settings persistence, restoring Original palette, light/dark, English/Persian, and actual computed token values. Original consumer examples plus the new preset/provider API typecheck against the packed package.

Raw first-pass evidence: readability.json and browser.json. All 21 focused post-fix checks passed with zero text-contrast violations, including every initially failed configuration, all five timed-out opening attempts, and the original/shared date picker and date-range popup configurations. Evidence is recorded in readability-confirmation.json. The first-pass failures remain in these reports as history.

## Limits

Automated text-contrast scans cover rendered default states and selected opened states, not every possible variant, hover, data set or user palette. They do not establish full WCAG compliance, graphical/non-text contrast for every icon/wave, physical-device, Safari/Firefox or manual screen-reader acceptance. The full runtime sweep used the gold seed; focused dark confirmations use blue. Extreme seed/control coverage is token-level. Existing showcase/full-icon chunk-size warnings remain.

Reference palette structure: [shadcn site theme source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/globals.css). This is a MaterialFluid palette preset with explicit legibility constraints, not an exact copy of upstream tokens.


Final validation: TypeScript and targeted ESLint passed. The neutral palette/preferences plus core suite passed 98 tests; the three palette tests were repeated successfully after the final seed-chroma refinement. Final showcase/library production builds, declaration emission, asset copying and installed-package smoke all passed, including 116 original examples, 34 shadcn examples and the new provider/palette API.
