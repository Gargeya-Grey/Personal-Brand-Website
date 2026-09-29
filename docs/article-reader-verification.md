# Article reader verification · 29 September 2026

| Before | After | Why |
| --- | --- | --- |
| Contents positioned outside a narrow centered wrapper | Bounded desktop grid; sticky compact contents on smaller screens | Prevents the left-edge clipping reported by the owner |
| Centered title, crowded metadata, unstructured reading controls | Left-aligned title and summary, author/tool row, shorter reading measure, takeaway panel | Clearer hierarchy and more comfortable reading |
| Document-wide progress and fragile section offsets | Progress measured against the article body; shared heading/anchor extraction | Footer length and embedded-code headings no longer distort navigation |
| Markdown code only | Explicit interactive HTML blocks, CMS insertion, run/reset/stop, theme-aware isolated frame | Lets the author explain ideas with controls, diagrams, and animation |
| Custom image/table overlay | Native modal dialog with Escape and focus return | Keyboard users can enter and leave enlarged content reliably |
| Expanded tables retained navy/slate utilities outside the article's theme overrides | Shared semantic table styles and a compact, theme-aware lightbox | Inline and expanded content use the same colors, typography, and row treatment |

## Checked

- **PASS:** production build, TypeScript, full ESLint (zero errors; the two existing Markdown image warnings remain).
- **PASS:** `test:articles`, `test:newsletter`, and `test:ledger`.
- **PASS:** real `gpt-sol-frontier-best-deal` article, with 15 sections, at 320, 390, 768, 1024, 1199, 1200, 1280, 1440, 1800, and 2239px. No horizontal document overflow; the desktop contents rail remains inside the viewport. Its last section remains reachable in its scrollable rail.
- **PASS:** mobile contents opens, selects a section, updates the URL, closes, and leaves the section below the fixed controls.
- **PASS:** larger-text and device-bookmark preferences survive reload. Native table expansion supports Escape and restores focus to the trigger.
- **PASS:** interactive slider responds to keyboard Home/End; reset restores the starter; stop removes the iframe and returns focus. Light/dark theme and reduced-motion settings reach the frame.
- **PASS:** iframe cannot access parent DOM or local storage; network fetch is blocked by CSP; a forged parent resize message is ignored; content growth resizes the frame (338px to 805px in the exercised example).
- **PASS:** development CMS login, new unsaved article, toolbar insertion, live preview, slider and reset. No article save/publish was submitted. Browser test storage used a disposable context.
- **PASS:** browser checks reported no page runtime errors; a share-link hydration mismatch found during development was fixed by passing the canonical URL from the server.
- **PASS:** the built production article returns 200 and renders its text and 15 contents links with JavaScript disabled. The development-only example returns HTTP 404 in production.

## Expanded-content follow-up

- **PASS:** table header, body, striped rows, and emphasized text have identical computed colors and font sizes inline and expanded, in both themes at 320, 390, 768, and 1440px.
- **PASS:** dialogs fit the viewport without document overflow; mobile tables keep a bounded first column and allow scrolling to the last column. Expanded tables have no inherited article margins.
- **PASS:** Escape and Close dismiss the dialog and restore focus; body scrolling unlocks. Cover images use their full proportions with `object-fit: contain`.
- **PASS:** screenshots inspected in both themes; no browser runtime errors. TypeScript and targeted ESLint passed, with the two existing Markdown image warnings. This follow-up was verified against the local development server; the production build above predates it.

## Full-image desktop opening follow-up

| Before | After | Why |
| --- | --- | --- |
| A 1120px-wide cover below the title consumed 560px of height | A complete, uncropped image capped at 720px beside the summary on desktop | Keeps the title independent and gives the smaller artwork a useful place in the composition |
| Summary appeared below the image | Summary shares the desktop opening; smaller screens retain a single column | On the measured 1440px viewport, article text begins at about 1097px instead of 1510px |
| Expand control covered a corner of the artwork | A labeled 44px control below the image; enlargement requests a larger source | Preserves all image detail and sharpness in the larger view |

- **PASS:** 320, 390, 768, 820, 1024, 1199, 1200, 1440, and 1920px in light and dark themes. No horizontal document overflow; title remains above the artwork; `object-fit: contain` preserves the full image at every width.
- **PASS:** enlarged cover uses a larger image source on desktop; Escape restores focus to the control. Mobile section links close the contents menu and leave the target heading visible below the sticky controls.
- **PASS:** larger reading text, the SVG cover fixture, and a browser-only no-summary layout check. No article content was saved or published.
- **PASS:** targeted ESLint, TypeScript, and `test:articles`. Screenshots were inspected in both themes. These follow-up checks used the development preview; a new production build was not run for the cover change.

## Sticky navigation follow-up

The compact contents bar follows the navbar using the same 280ms motion curve. Its sticky inset uses the measured navbar height, with an 8px gap; when the navbar leaves the screen, the contents bar rests 8px from the top (or below a larger safe-area inset). Only transforms animate. Interruptions resume from the currently painted position, and reduced-motion mode changes both positions immediately.

- **PASS:** scrolling down, scrolling up, and reversing direction during the animation at 320, 390, 639, 640, 768, 1008, 1024, and 1199px, with regular and reduced motion. Frame-by-frame measurements kept the gap within 0.001px of 8px. No horizontal document overflow or browser runtime errors.
- **PASS:** before becoming sticky, the contents bar remains in normal document flow. Navbar-height and viewport changes update its inset.
- **PASS:** contents open/close, section selection with the target below the controls, mobile navigation with Escape, and returning to the journal without a leftover navbar transform. The additional interaction check used dark mode.
- **PASS:** TypeScript and targeted ESLint. Screenshots at the reported 1008px width were inspected with the navbar visible and hidden. This follow-up used the local development server; no new production build was run.

## Main release check

- **PASS:** the standard production build on an isolated `main` checkout, including TypeScript and static page generation; article content tests and targeted ESLint (zero errors, two existing Markdown image warnings).
- **PASS:** the built article at 390, 768, and 1008px keeps an 8px navbar-to-contents gap when shown, settles the contents bar 8px below the top when hidden, and has no horizontal overflow or browser runtime errors.
- **PASS:** the interactive example returns HTTP 404 in production.

## Limits and retention

No live content edit or production publishing/OAuth round trip was performed. The article release was pushed to remote `main`; the host deployment was not separately checked. Physical touch devices and Safari were not tested. The development-only example at `/journal/interactive-preview` is noindex, is absent from the journal/sitemap, and returns 404 in production.

The starter and authoring guide are intentional repository files. Screenshots and temporary browser scripts were kept outside the repository in this chat's visualization directory. Existing unrelated work was preserved.
