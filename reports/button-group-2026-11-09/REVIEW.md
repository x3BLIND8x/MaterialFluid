# Button Group and toggle emphasis, 2026-11-09

The owner's correction supersedes the earlier Emphasize appearance variant. Button and IconButton now expose the boolean `emphasize` behavior, used with `toggle`; it keeps paired Primary fill/ink in both states regardless of the chosen appearance. Ordinary actions do not change. Filled can toggle when emphasized; Danger remains an ordinary action. Appearance choices and public variant types no longer include Emphasize. React and optional Web Component recipes expose the boolean, and type fixtures reject the old variant.

Reviewed the reference playground, documentation and actual source types/config/constants/implementation. Source URLs and downloaded-file hashes are recorded in source.json. The reference MIT notice is retained in licenses/floor-material-MIT.txt and included in the package.

The shared ButtonGroup adds:

- Standard and connected kinds; action, single and multi selection; required selection; controlled or default values and item-selected defaults; stable button-order output.
- Five owner action sizes, text/Ghost alias support, density, orientation, equal widths with preserved intrinsic content and narrow-screen scrolling, per-item and whole-group disabled state.
- Named icon-only actions, nullable selectedIcon filling, full optional icon choices and selected-only labels with the authored finite resize curve.
- Standard press redistribution, bounded by neighbor padding, using authored finite Press curves. Button content keeps its size. Connected corners follow shared Button press progress and reverse in RTL.
- React ButtonGroupItem children or configured buttons, selection/action callbacks and native-element ref methods. Existing arbitrary-child framed compositions and HTMLDivElement refs remain compatible.
- Optional mf-button-group/mf-button-group-item elements with state/appearance methods, native forms, focus, content mutation, reconnection, change/action events and lifecycle cleanup.

Configuration contains only grouped Example Presets, Appearance, Content and Behavior. Both working code formats, APIs and notes live in Documentation. Square, Elevated and public press/ripple tuning are excluded according to the owner policies; owner colors, typography, dimensions and motion remain authoritative.

The initial focused unit run passed 22 tests. The final full unit run passed 192 tests across 13 files. Production browser coverage passed the four group locale/theme/viewport matrices with axe/overflow, behavior-based Emphasize checks for both action controls, fixed-content press redistribution, keyboard activation, selected-label animation, optional icon choice, reading direction, native date compatibility and fixed button content. The initial four IconButton documentation assertions incorrectly assumed adjacent attributes after the API correction; they were updated to check appearance and behavior independently. Final checks are appended below.

Desktop and narrow captures were inspected in one batched pass and one confirmation. Browser evidence is local Microsoft Edge; automated axe does not establish manual screen-reader or physical-device acceptance. No Git push or package publication is part of this component change.

## Final verification

- Root typecheck and full ESLint passed; final production showcase/library builds passed. Seventy current declaration files are emitted, including the text variant alias and the behavior-only emphasize parameter.
- All 192 unit tests passed. Twenty production browser cases are green across the initial 16 passing cases and four corrected IconButton recipe-assertion reruns. Both final development-server element-adapter cases passed, including content mutation, reconnection, native forms and state/appearance methods.
- Installed-package smoke passed 79 exports/server rendering, foundation utilities and 35 shapes, safe optional element import, full optional icon registration/assets, 45 default and 45 size examples, 17 Button, 26 IconButton and 38 ButtonGroup React examples plus 34 compatibility examples. Matching Web Component recipes are generated, and adapters are covered by browser checks. Consumer fixtures verify the native-div ref compatibility, text alias, group methods and rejected Emphasize/Elevated/Square variants.
- Initial UI checks overlapped source/context updates and caught a transient page reload plus an in-flight color sample; stable production checks passed. Color assertions now compare the semantic Primary target. The four stale IconButton documentation assertions were corrected to test the independently ordered appearance and behavior attributes. No app behavior was changed to satisfy those ordering assertions.
- The optional full icon bundle remains on-demand and retains the existing large-chunk warning. No final full-project browser sweep was repeated for this scoped change; the passing checks cover the modified APIs, paired visual matrices and adjacent regressions.
