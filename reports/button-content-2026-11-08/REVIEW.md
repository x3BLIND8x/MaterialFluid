# Button content during press — 2026-11-08

The shared Button implementation now cancels the surface press transform on its content layer. IconButton reuses Button. Content dimensions and center remain within 0.6 CSS px of their starting values across the sampled press/hold/release frames; the tests also require actual surface compression. Explicit component size changes remain supported.

All four content tests and all eleven existing button motion regressions passed in installed Microsoft Edge. Tests use the current provider spring defaults; the spring settings themselves are unchanged. Unit tests pass 163/163. Complete build and package evidence is recorded in ../../VALIDATION.md.

| Configuration | Button | IconButton |
| --- | --- | --- |
| English / light / 1440px | [Button](button-en-light-1440.png) | [IconButton](icon-button-en-light-1440.png) |
| Persian / dark / 1440px | [Button](button-fa-dark-1440.png) | [IconButton](icon-button-fa-dark-1440.png) |
| English / dark / 390px | [Button](button-en-dark-390.png) | [IconButton](icon-button-en-dark-390.png) |
| Persian / light / 390px | [Button](button-fa-light-390.png) | [IconButton](icon-button-fa-light-390.png) |

The full-page captures show the Small variant after the geometry check. Held desktop and touch-button captures are available under .impeccable/review/. Held desktop and narrow Persian IconButton captures were visually reviewed; motion correctness is established by the frame-by-frame geometry assertions, not by a single screenshot.
