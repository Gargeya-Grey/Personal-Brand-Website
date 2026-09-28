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
