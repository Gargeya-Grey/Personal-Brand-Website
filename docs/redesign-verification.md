# Personal world redesign: verification

## Automated checks

- `npm run build`: passes, including static Playground routes and server-rendered private routes.
- `npm run lint`: no errors. Two existing `no-img-element` warnings remain in `lib/markdown.tsx`.
- `npm run test:ledger`: passes.
- `npm run test:newsletter`: passes.

## Browser checks

Using the local Next.js app and agent-browser:

- 320px: home, About, Playground, idea mixer, Journal, a published article, Notes, Videos, Community, Contact, Privacy, Terms, and the unsubscribe landing. One h1 per page; no document overflow or framework error overlay. The saved-idea delete control was corrected and retested at this width.
- 390px: home in light/dark modes, mobile navigation, published letter, and private ledger. Escape closes the menu and returns focus to its trigger.
- 768px: home, About, Playground, Journal, Notes, Videos, Contact, Editorial, and Ledger. No document overflow or clipped headings/navigation/form inputs.
- 1440px: visual inspection of home, Journal, Notes, Editorial, and Ledger.
- Reduced motion: preference recognized; decorative scroll rotation resolves to `transform: none`.
- Playground: category filter, search, empty state, and reset to the full collection.
- Idea mixer: actual button clicks change the combination; copy reports success; saving persists across reload; removal works.
- Public visitors to `/editorial` and `/ledger` are redirected to sign-in.
- Private screen inspection uses the repository's existing development-only sign-in. Editorial, Notes workspace, and Ledger render without saving, extracting, or publishing content.

## Review in the Vercel preview

Review the overall personality, headline scale, portrait treatment, motion feel, and reading density. Confirm the production Google OAuth round trip using the owner account if the preview callback URL is configured. No real contact message, newsletter subscription, newsletter send, or Notion write was submitted during verification. Physical touch devices and Safari were not available in this run.

## Adding future apps

See `docs/publishing-experiments.md`. Internal apps get their own route; externally hosted apps use an HTTPS link. Both appear through the typed Playground registry.

## Preview feedback follow-up (28 September 2026)

- Removed redundant hero/section numbering, cover slogans, margin copy, and decorative article/social list numbers. Useful metadata uses readable 13px labels; journal category tags use 12px sentence case.
- Replaced the olive/persimmon palette with the journal artwork's midnight navy, cool silver, teal, and mint in both themes. Search, category menus, contact fields, subscription fields, and inverted subscription panels use semantic colors.
- Native modal navigation escapes the transformed header and supplies a full-viewport backdrop and inert background. At 467×1131: close button, backdrop click, Escape, focus return, keyboard movement, and route selection pass. At 667×320: menu scrolls inside the viewport. Resizing to desktop dismisses it and restores body scrolling; the private sign-in navigation passes its 640px breakpoint too.
- Home, About, Community, Playground, Notes, Contact, and Videos fit 320px. Journal controls and the category popup also fit 320px. Light/dark desktop Journal and home were visually inspected at 1308×1131; Notes checked on phone/tablet; reduced-motion menu dismissal checked.
- Journal search for GLM and category Education each render their one matching article. Empty search and reset work. Fixed the previous exclusion of the featured article even when its feature presentation was hidden by filters; pagination counts now include the visible feature.
- WCAG contrast calculations for the new semantic palette: light body 13.64:1, muted 5.38:1, accent 4.82:1, button 5.19:1; dark body 16.76:1, muted on cards 8.70:1, accent on cards 10.57:1, button 11.72:1. This measures these token pairs, not an exhaustive accessibility audit of all legacy components.
- Production build and lint pass (the same two existing markdown image warnings). No browser runtime errors observed. No forms submitted or private data changed in this follow-up.

## Dark reading comfort follow-up (29 September 2026)

The owner reported that near-white text felt harsh against the dark background. Replaced it with cool silver display text, softer reading text, and a slightly lifted navy background. These values supersede the dark contrast figures in the earlier feedback section.

| Base-background contrast | Before | After |
| --- | --- | --- |
| Main headings | 16.76:1 | 11.66:1 |
| Article paragraphs | 12.47:1 | 9.86:1 |

- Dark reading overrides cover article and Notes paragraphs, lists, tables, quotations, and emphasis, including legacy slate utilities. The inverted Journal subscription panel also uses the softer ink.
- Production build passes. Inspected the built site locally: desktop home and article body, mobile Notes at 390px, and Journal subscription panel. Computed colors match the new tokens; mobile Notes has no horizontal overflow and no browser runtime errors were observed.
- Light-mode base, heading, and article colors remain unchanged; light Notes was visually checked. No media dimming or page-wide opacity was applied.
- Tested primary, reading, muted, and accent token colors against the six principal dark surfaces; the lowest pair was 5.28:1. This is a token contrast check, not an exhaustive accessibility audit. Contrast ratios do not measure subjective reading comfort; the owner should judge the preview on their usual screen.

## Project story and discovery follow-up (29 September 2026)

| Before | After | Why |
| --- | --- | --- |
| Odicto, Edudojo, then an agent experiment | Edudojo first; one Odicto family; TwinAatma third | Matches the owner's priorities and connects learning, voice, and memory. |
| Long mobile portrait composition | Compact portrait beside the greeting, shorter introduction | First project starts at 694px instead of approximately 1,336px at a 390px viewport. |
| Text-only Playground directory | Working overlap and idea-pairing samplers, plus project diagrams | Visitors can interact before choosing a project. |
| Repeated latest-letter card and preview | One latest-letter preview, with only older letters in the archive | Reduces repeated content and scrolling. |
| Visible missing-walkthrough panels | Labelled interactive explanations; recording requests in the owner checklist | Explains each project without presenting a sketch as real product footage. |

- Source checks: current public READMEs for Odicto, Odicto-Mobile, and TwinAatma; Edudojo's public site. Desktop local transcription and Android provider-based transcription are distinguished. Edudojo is described as an MVP in testing, not as proven learning efficacy.
- All four existing/new project writeups remain routable; DataClean stays in the Playground and sitemap but is no longer selected on the homepage. TwinAatma uses the public repository's spelling.
- Production build and TypeScript pass. Full lint passes with only the same two existing markdown image warnings; a final lint pass over changed TS/TSX files has no warnings.
- Browser verification on the local production build: changed home, Playground, Notes, and all four project pages fit 320px; home, Playground, Notes, and Edudojo fit 768px. Visually inspected desktop light/dark home, Notes and project layouts, mobile home/Notes, 320px Edudojo, and 390px TwinAatma. Browser errors list is empty.
- Playground: pairing changes; keyboard Home/End on the overlap slider produce 1.00/0.00; Software filter returns Edudojo, Odicto, TwinAatma; unknown search shows an empty state; reset restores the collection.
- Project explanations: Edudojo revision, Odicto platform switch and both repository destinations, TwinAatma accept/reject/reset paths checked. Keyboard focus moves to the selected stage when the decision buttons disappear. These examples use fixed sample content; no microphone, private memory, or model call is involved.
- Mobile menu opens and closes with Escape, returning focus to Open menu. The homepage work anchor leaves its heading below the fixed navigation.
- Light cards gain separation through different surface colors, borders, and restrained shadows. Dark ink retains the softened contrast from the preceding pass. New interactions do not autoplay or depend on motion.
- No real newsletter/contact form, production content change, or private workflow was submitted. Real device testing, unfamiliar-visitor testing, and actual product recordings remain outstanding; a self-assigned 9 is not independent validation.

## Discovery and personal story follow-up (29 September 2026)

| Before | After |
| --- | --- |
| Dark homepage surfaces were visually similar | Mint, blue, lilac, and sand artwork surfaces, lifted research/letter panels, journal thumbnails, and an existing film image. Reading ink stays soft. |
| Social was a thin text directory | Four colored profile cards, clearer invitations, pointer hover feedback, immediate keyboard focus, and reduced-motion support. |
| Latest Notes letter had several competing panels/actions | A short opening passage, one reading link, and collapsed contents/sources. Full sample content remains available when no live letter exists. |
| About history read like a short CV | Six connected chapters based on the owner's account: theatre, university, pandemic self-teaching, research, QMUL, hospitality in London, and current work. |

- The owner supplied the personal story during this pass. The corrected university start year is 2018; the pandemic chapter has no asserted year. Academic rankings, supervisor praise, and uncertain chronology were not published. Existing publication and academic links remain.
- Production build and TypeScript pass. Changed-file ESLint passes; formatting-only cleanup followed the successful build. No browser runtime errors were observed.
- Local production browser checks: all four changed routes fit 320px and 768px in both themes. Desktop light/dark Social, dark homepage work panels, light/dark About timeline and Notes middle, and 390px dark home/About/Notes were visually inspected. The first mobile work card remains at approximately 694px.
- Journal thumbnails and the existing Japan film image load after scrolling. The image link opens the site's film collection.
- Social hover moves the card 4px and its arrow 4px; keyboard focus has a 3px outline. Reduced-motion emulation produces no card or arrow transform.
- Notes details open and close with Enter. The live reading link targets `/notes/2026-09-06`; three source links remain available. The no-live-letter branch was inspected in source, not exercised against a changed database.
- Selected small-text contrast pairs: dark artwork ink 4.94:1 or above; Social descriptions 5.62:1 or above in dark mode and 4.83:1 or above in light mode. This is not an exhaustive accessibility audit.
- Navigation, footer components, Videos, authentication, and publishing logic were not edited. No real form submissions or private-data writes were performed. Physical-device and independent visitor testing remain outstanding.

## Charcoal dark theme (29 September 2026)

The owner approved a neutral charcoal and sea-glass direction after comparing the navy version. Light-mode values and layouts are unchanged.

| Before | After |
| --- | --- |
| Blue-black background and blue reading ink | Charcoal `#191c20`, graphite cards `#242a2d`, silver headings `#d2d5d2`, reading ink `#b5bebc` |
| Bright mint accent | Sea glass `#8acdb5`; blue/lilac reserved for artwork and secondary surfaces |
| Full-width pastel home illustrations | Inset framing and 220px secondary project illustrations, with shorter experiment panels |
| Legacy white Journal titles and emerald article links | Shared silver titles, sea-glass links, and graphite table surfaces in dark mode |

- Final production build and TypeScript pass. CSS-only implementation; no application logic or content changes.
- Visually inspected dark desktop home, selected work, Playground, Journal, article body and Notes closing panel, plus 320px project artwork. Nine public routes fit 320px with no document overflow: home, Playground, Journal, article, Notes, About, Social, Research, Contact. Browser errors list was empty.
- Reduced illustration space initially clipped the Odicto caption at 320px. Tightened its mobile vertical spacing; final bounding-box checks confirm all illustration labels remain inside both visible project panels.
- Light-mode home was visually checked. Computed background/headings remain `#f0f5f6` / `#142936`; work artwork retains zero inset and 260px height. The light-mode inverted Notes panel remains `#102633`.
- Main reading ink contrast is 9.00:1 on the page, 7.66:1 on cards, and at least 6.09:1 across the tested tinted dark surfaces. Small artwork labels are at least 4.52:1. These are selected token checks, not a complete accessibility audit or a measure of subjective comfort.
- Local production build was used for visual checks. No real forms submitted, private content changed, or production merge performed.

## Annotation completion: hover, Social, and About (29 September 2026)

This pass was interrupted before publication. The following implementation and checks complete that local work; the production domain does not receive these changes until the PR is merged.

| Before | After |
| --- | --- |
| Journal cards reverted to blue on hover | Shared semantic surface colors in card, ink-card, and glass hover rules; the featured Journal card stays graphite in dark mode. Article focus/active/hover states use the theme accent. |
| Social repeated four large colored cards | Ruled platform rows with native disclosure previews: real repository links, a personal question, professional context, and an existing Japan film. Direct profile links remain available without expanding. |
| Large decorative arrow in the Social header | Removed. Platform marks identify each destination. |
| About stacked six lengthy timeline cards | A winding six-stop route with selectable chapters, individual SVG scenes, and previous/next controls. The owner's story remains in full. |

Validation on the final local production build:

- PASS: production build, TypeScript, changed-file ESLint, and `git diff --check`.
- PASS: all six About selections update the heading and maintain exactly one selected stop; first/last navigation boundaries; keyboard chapter selection and previous/next.
- PASS: native Social disclosures open and close, keep at most one preview open, and work with Enter. Visible focus rings, 44px mobile direct-link targets, all four destinations, and the existing film thumbnail checked.
- PASS: Journal search empty/reset states. Dark featured-card hover is `rgb(36, 42, 45)`; light hover is `rgb(251, 253, 253)`. Dark category-menu surface is graphite, its selected option is sea glass, and the search surface is charcoal.
- PASS: Social pointer hover moves the platform mark 3px; reduced-motion emulation produces no transform. Chapter content does not autoplay or animate.
- PASS: nine public routes have no document overflow at 320px in either theme: home, Playground, Journal, article, Notes, About, Social, Research, Contact. About and Social also fit 768px. Desktop light/dark home, Social, and About and narrow mobile layouts were visually inspected.
- PASS: no browser runtime errors observed. No form submissions, private-data writes, or production merge.
- Browser automation needed explicit instant scrolling before pointer interaction: automatic scrolling initially reported clicks without changing state. Rechecked with controls visible and with keyboard input; did not count the initial no-op clicks as passes.

Author self-review, not independent user testing: light mode premium UI 8.5/10, clarity 9/10, generic/AI-slop feel 2/10 (lower is better); dark mode premium UI 8.5/10, clarity 9/10, generic/AI-slop feel 2/10. The new journey is more exploratory and Social has meaningful variety, but shared serif/italic typography remains familiar and actual product recordings are still missing. Physical-device and unfamiliar-visitor testing remain outstanding.

## Project hosting, recordings, and covers (29 September 2026)

| Before | After |
| --- | --- |
| Separate browser-app pages and source-only website entry | All seven Playground entries open project pages; shared layout supports story, playable demo, and recordings. |
| Project pages needed custom markup for future media | Typed optional native/hosted demos and multiple recordings, with landscape/portrait layouts, captions, native controls, written walkthroughs, and direct-file fallback. |
| Edudojo used a text diagram | Existing forest-gate image restored on home, Playground, and its project page; owner's gate mark becomes a subtle homepage watermark. |
| Odicto and TwinAatma used flat process diagrams | Custom scalable SVG covers use translucent voice/text and layered-memory forms. They are cover art, not product screenshots. |

- Production build and TypeScript passed; changed-file ESLint and diff checks passed. Browser checks used a local production build.
- All seven project routes plus home and Playground fit 320px in both themes. Desktop covers checked visually in both themes; mobile Edudojo and Odicto inspected. The gate image loaded correctly.
- Overlap lab remains playable inside the shared page: perfect match returns 1.000 and complete miss returns 0.000. The Try it here anchor lands below the fixed nav. Idea mixer changes prompts and keeps saved ideas after reload.
- Missing recordings produce no player or Watch action. Existing illustrative explanations remain explicitly labelled.
- An isolated local development fixture verified both recording orientations, native controls, `preload=none`, inline playback, no autoplay, and the keyboard-operated written walkthrough. A locally generated VP8 WebM played with advancing time. Initial capture yielded no usable frames; explicit frame capture corrected the fixture, with no application-code change needed.
- The same fixture verified no iframe before activation, sandboxed iframe after activation, removal on Close, and focus return to the launch button. The temporary route was removed before commit. No placeholder footage or external demo was published.
- Actual owner recordings, deployed third-party app compatibility, cross-origin captions, and physical-device playback remain to be checked when assets/URLs are supplied. An external demo URL does not deploy its backend.
