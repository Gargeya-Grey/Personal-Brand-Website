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
