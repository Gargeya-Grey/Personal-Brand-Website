# Mobile layout verification — 29 September 2026

| Before | After | Why |
| --- | --- | --- |
| Reader hover and selected state used the same circle | Only `aria-pressed="true"` gives toggles a circle; hover feedback is limited to pointer devices | A second tap visibly switches larger text off, including while the control retains hover |
| Journal controls were 54px high inside a generously padded panel | 44px mobile controls, tighter panel padding, shorter search placeholder | Keeps touch targets usable while reducing visual weight; search text stays 16px |
| Post count touched the Sunday subscription panel | 64px separation on mobile and 80px on desktop | Keeps the count attached to the article list |
| Mobile editorial header included a separate Blog/X strip | All existing destinations are in the burger menu below 1024px | Notes, Ledger, and Public site remain reachable without crowding the header |
| Full-width editorial thumbnails were forced into a 110px crop | 16:9 mobile frame with `object-fit: contain`, without image zoom | Preserves the full cover image and its proportions |
| Editorial and Notes heroes sat close to the fixed navbar | 32px more page-top padding | Leaves 42px of clear space on tested phones |

## Checks

- **PASS:** development pages at 320, 390, 430, 768, 1024, and 1440px; light theme throughout and dark theme at 390 and 1440px. Touch-enabled Chromium contexts were used below 1024px.
- **PASS:** larger-text button on/off state, border and fill reset, text-size reset, and off-state persistence after reload.
- **PASS:** Journal search, category selection, 44px control heights, 16px search text, post-count spacing, and no horizontal document overflow.
- **PASS:** authenticated editorial menu destinations, Escape, focus return, navigation to Notes, menu dismissal, scroll restoration, thumbnail proportions, and hero spacing. Used the existing development login in an isolated browser context.
- **PASS:** production build repeated the checks at 390px in both themes and 1440px in light theme, including the fully loaded private Notes workspace and public Notes page.
- **PASS:** TypeScript, targeted ESLint, existing `test:articles`, production build, and patch whitespace checks.
- **PASS:** no application runtime or console errors. The local production preview reports expected 404s for Vercel's two hosted analytics scripts; those were recorded separately.
- **NOT CHECKED:** physical phone hardware and Safari; deployed Vercel release.

## Local evidence and cleanup

Screenshots and measurement results are retained in the ignored `.tmp-article-audit/mobile-polish/` and `.tmp-article-audit/mobile-polish-production/` directories. The disposable verification script is `.tmp-article-audit/mobile-polish-check.mjs`. These are local evidence, not part of the public commit. The task's browser sessions and temporary production preview are closed after verification; the pre-existing development preview is preserved.
