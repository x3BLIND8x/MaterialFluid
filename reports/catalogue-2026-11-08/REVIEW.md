# Component catalogue validation — 2026-11-08

One ordered catalogue contains 45 entries across five groups. Tree drives both desktop and mobile navigation; search and sequential links use the same data. Existing MaterialFluid controls and motion are reused. Shared compositions supply the added entries, with direct package exports and compiling usage examples.

The production build was checked in installed Microsoft Edge. All 45 pages rendered; ten added pages were visited in four configurations without document overflow or page errors. The focused accessibility checks passed. The properties region supports keyboard scrolling. Unit tests pass 163/163; the targeted production browser checks pass 16/16 after a test-only local-address correction; build, lint and installed-package smoke pass. The complete evidence and limits are recorded in ../../VALIDATION.md.

| Configuration | Capture |
| --- | --- |
| English, light, 1440px | [Desktop light](en-light-1440.png) |
| Persian, dark, 1440px | [Desktop dark](fa-dark-1440.png) |
| English, dark, 390px | [Narrow dark](en-dark-390.png) |
| Persian, light, 390px | [Narrow light](fa-light-390.png) |

The captures were visually reviewed for catalogue structure, labels, shared control styling, readable type, spacing, RTL order and bounded scrolling. Shared palette/motion defaults remain in place. This check covers the stated configurations and interactions; it does not establish exhaustive variant, browser, physical-device or manual assistive-technology acceptance.
