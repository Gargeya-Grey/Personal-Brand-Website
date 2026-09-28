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
