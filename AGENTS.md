# MaterialFluid development policy

Use the global Impeccable skill for every UI change. Read PRODUCT.md, DESIGN.md, and COMPONENT_POLICY.md before changing the system.

- Preserve MaterialFluid APIs and its authored animation system. The owner replaced both old catalogue lists on 2026-11-08 with the active 45-entry catalogue. Do not reapply the compact/HeroUI migration unless explicitly requested.
- The active catalogue is the only visible component list. Navigation, search, counts and previous/next follow its five groups and ordered 45 entries. Reuse existing shared components; retain earlier exports for compatibility.
- Build the showcase from exported kit components. Tree owns nested navigation, including the catalogue and TableOfContents. Reuse library controls rather than creating showcase-only substitutes.
- Fix a defect in its shared component or semantic token. Do not add page-specific color, radius, or interaction patches to compensate for library drift.
- Controls use a 14/24/29px base radius. Framed containers add their real padding inset and border to it for concentric curves; icon actions use half their actual diameter at rest. Preserve the existing press/ripple radius animation. Expanded selects retain their trigger's measured radius.
- Use paired background/foreground roles. Neutral text and transparent actions target 7:1 contrast; all readable content must meet 4.5:1 and interactive boundaries 3:1. Verify light and dark, English and Persian, desktop and narrow screens.
- Use the shared miscellaneous palette for identity and semantic status, independently of the accent seed. Toasts and other floating surfaces share the same surface roles.
- Size options come from componentSizePolicy. Add a variant only when it serves a distinct use case, and implement it at the library boundary as well as in the showcase.
- Preserve passive field labels, accessible naming, keyboard access, reduced-motion behavior, and optional full-icon-pack loading.
- A release needs typecheck, lint, unit tests, browser regressions, a production build, and the installed-package smoke check. Record actual evidence and limits in VALIDATION.md.

## Reference additions, 2026-11-08

When the owner provides a component link and asks to copy it, inspect its source, API and usage cases, then implement additive behavior at the shared library boundary. Organize live controls as Example Presets (never Scenarios), Appearance, Content and Behavior. Content icon choices must cover the full optional icon catalogue. Provide working Web Components and React code that follows the selected controls. Preserve MaterialFluid identity and fixed button content during press animations. Do not introduce Square or Elevated treatments. Elevated is excluded for every component, including future additions.

- Keep authored component motion defaults. Do not expose Advanced component panels, independent Button icon sizing, ripple options, public motion override props or icon timing knobs. Preserve the separate isolated Motion playground.

- Catalogue pages default to Configuration. Put code, API tables, behavior notes and documentation navigation in a separate Documentation tab. Keyboard-visible focus uses the Active action background without changing toggle selection.

- Foundation work adapts Grenish/expressive source under its retained MIT/shape Apache notices while keeping MaterialFluid owner tokens and authored motion. Preserve the verified pre-foundation archive in backups. Keep the five foundation pages separate from the unchanged 45-component catalogue; no elevation or component replacement.

Owner refinements on 2026-11-09 replace open-ended spatial spring tails with the finite two-crossing curves, three for Press. Typography metrics retain smooth non-spring easing. Button toggles are limited to Tonal, Outlined and Ghost/Text, use their own off treatment and Primary when on. Button progress inherits icon size and placement from Appearance. Foundation navigation has five pages; Interaction was removed.

## Action refinements, 2026-11-09

Button and IconButton expose emphasize as a boolean toggle behavior, independently of Appearance, with paired Primary fill and ink in both states. It requires toggle; it is never an appearance variant. Tonal, Outlined and Ghost/Text retain their own off treatment and Primary on treatment when emphasize is false. Emphasize also permits Filled toggles. Danger remains an ordinary action. IconButton has five sizes and narrow/default/wide widths, with no Square or Elevated option. A nullable selectedIcon uses the same Material symbol, outlined off and filled on through the authored reversible reveal; a separate selectedIcon swaps artwork. selectedLabel optionally names the selected action. Do not expose Playback/playing modes or new animation tuning parameters. Both action pages use grouped Example Presets, Appearance, Content and Behavior; React and optional Web Component recipes remain in Documentation.


## Button Group additions, 2026-11-09

ButtonGroup adds standard/connected layouts, action/single/multi selection, required selection, selected-only labels, five owner action sizes, density, orientation, equal widths, per-item disabled states and native keyboard activation. ButtonGroupItem or the buttons list opts into these additions; existing arbitrary-child frames remain compatible. Standard presses redistribute width to neighbors with the authored finite motion curve and fixed text/icons. Connected corner motion uses the shared Button press progress. React and optional Web Component APIs and recipes follow the selected configuration. Keep only grouped Example Presets, Appearance, Content and Behavior in Configuration. No Square, Elevated or public press/ripple timing knobs.
