# Foundation adaptation review — 2026-11-08

MaterialFluid now has an integrated foundation layer and six foundation pages. The reference supplies source algorithms and role structure; the existing MaterialFluid design and authored motion remain authoritative. Individual component migration is deferred.

## Recoverable owner snapshot

Before editing foundations, saved [the source/design backup](../../backups/MaterialFluid-before-foundations-20261108-180759.zip): 536 files, 19,226,883 bytes. Archive SHA-256: `27498d5f5346a8b1b2c5bcfe2042683d8cd9085f6c4cae7830f4f02b21381054`. Every entry was checked against its internal SHA-256 manifest and the ZIP integrity check passed. Dependencies, Git metadata, generated builds, caches and credentials are excluded. Restore into a separate directory first; see [backup instructions](../../backups/README.md). This is a local source snapshot, not a Git-history backup.

## Source and implementation

Reviewed [Expressive](https://expressive.grenishrai.pro), its foundation documentation and [source](https://github.com/Grenish/expressive) at revision `eb96d3df46790079ae5bf7b22d721491260c1485`. [Source provenance](upstream-source.json) records selected upstream paths and hashes. MIT attribution is retained in the source, third-party notices and packaged license. Original Material shape attribution is retained too.

| Foundation | Integrated behavior | Owner design retained |
| --- | --- | --- |
| Color | Nine Material generation algorithms, full role output and six tonal palettes; provider integration and persisted algorithm selection | Tonal Spot default, existing Standard/Previous/Neutral + seed behavior, independent miscellaneous palette, paired fills/ink |
| Typography | Fifteen semantic roles, thirty normal/emphasized styles, CSS utilities and live specimen controls | Nunito Variable, Vazirmatn RD, JetBrains Mono; existing component typography is preserved |
| Shape | Thirty-five named SVG shapes, masks, sampling/alignment and interruptible spring morphing | 14/24/29px control radii; upstream cut/squircle control presets are not installed; new preview frames account for their padding and border |
| Motion | Curve graphs, replay controls, spring math, shared animation adapter and shape animation | Existing press/resize/dialog/popup springs, fixed effect fades, private playground and component animations |
| Interaction | Shared policy tokens and a working interaction page using existing exported controls | Keyboard Active background, focus ring, disabled/toggle behavior, fixed button content during press |
| Accessibility | Contrast helpers and actual active-theme audits, live-announcement and dialog-focus examples, reduced-motion and forced-color handling | Existing native/Radix semantics, English/Persian support and keyboard interactions |

There are no elevations, shadows, GSAP, Tailwind migration, replacement fonts or replacement component designs. Decorative SVG shape names do not introduce Square button variants. Foundation utilities are exported under `Foundations`; no per-component advanced motion props were reintroduced.

The foundation Tree sits alongside the unchanged 45-component catalogue. Typography, Shape, Interaction and Accessibility have separate Configuration/Documentation views. Color and Motion retain their existing pages with additive explorers. Motion uses the Motion dependency for authored animation; CSS supplies styling and simple transitions/keyframes. Physical springs are normalized only for curve sampling; actual animations retain the owner's stiffness, damping and mass.

## Evidence

- All 174 unit tests across 11 files passed. Foundation tests compare complete token maps against [24 pre-migration color snapshots](owner-color-baseline.json), exercise nine algorithms and tonal foreground contrast, verify owner tokens/spring conversion, shapes, and scoped CSS generation.
- Typecheck, production showcase/library builds, declaration emission and asset copying passed. A final showcase build includes the preview-frame radius correction. Existing large showcase/full-icon chunk warnings remain.
- Full ESLint and `git diff --check` passed.
- Fifteen production-preview browser regressions passed in installed Microsoft Edge: four fixed-content press configurations, keyboard Active focus, nested tab independence, four foundation configuration matrices, foundation interactions, motion/reduced-motion, interrupted shape changes/forced colors, isolated playground behavior and all 45 catalogue routes.
- All seven foundation browser tests passed again against the final preview-frame CSS build. The final unit run and full lint also passed after the shape-animation interruption cleanup.
- The four foundation matrices visit all six pages and the four new Documentation views: 40 scoped axe A/AA scans, with no violations, runtime errors or document overflow. Configurations are desktop English/light and Persian/dark, and 390px English/dark and Persian/light. Reduced motion is enabled for these audits; motion behavior is tested separately with animation enabled and with the OS preference changed mid-animation.
- Installed-package smoke passed 77 public exports and server rendering, the Foundation namespace, server-safe optional elements import, complete optional icon pack/assets, 45 default and 45 size examples, 17 Button React examples, 34 compatibility examples and the existing API/type-policy fixtures. New foundation examples typecheck against the installed package.
- Rendered desktop English/light and narrow Persian/dark captures were inspected. Further paired full-page captures are stored alongside this report. Impeccable's detector returned no primary findings and eight advisories. Seven concern existing Motion-page type/radius choices; the new frame advisory was resolved by using the actual padding plus border inset. Authored component motion was preserved.

These are targeted local checks, not the full browser suite or accessibility certification. Physical devices, Safari/Firefox, manual screen-reader use and exhaustive custom-palette combinations remain unverified. The new theme utility is server-safe; SVG path sampling requires a browser and returns no samples in unsupported environments. Existing public component APIs and component counts were preserved rather than migrating all reference components in this stage.

## Follow-up: algorithms reaching Neutral + seed components

The initial integration forwarded the algorithm into the provider, but the Neutral + seed layer then replaced accent families with seed-only palettes. This was a real gap despite the raw explorer and Standard mode changing correctly. The shared theme now keeps the selected algorithm's accent families before applying owner lightness/chroma rules. Tonal Spot remains exact. Regression coverage now includes selector changes followed by actual rendered Button colors and reload persistence, rather than persistence alone. See the follow-up section in [validation](../../VALIDATION.md) for the final evidence.
