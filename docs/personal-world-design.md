# Gargeya: an open notebook and a working playground

## Philosophy

This is a home for a person, not a landing page for a single product. Within the first screen visitors should know whose space this is, what he cares about, and where they can go. Curiosity comes from concrete things to read, watch, and try. Real work takes precedence over claims about the work.

The discovery sequence is person → current work → things to try → ideas to read → ways to stay in touch. Each destination has a useful onward path. No scroll hijacking, autoplay, fake metrics, or content hidden behind decorative interaction.

## Direction check

- First visit: a human introduction, portrait, and three clear paths.
- Returning visit: a stable navigation and a growing Playground index.
- Reading: quiet, high contrast typography and familiar article controls.
- Making: apps have their own URLs and can be added through one typed registry.
- Working privately: the same palette and controls, compact chrome, no decorative entrances around frequently used tools. Existing authentication and persistence stay intact.

## Visual system

The full system is in [DESIGN.md](../DESIGN.md). It is the Edudojo family (v3), so the owner's sites read as one umbrella. In short:

- Warm paper, green-black ink, 1px hairlines, one forest button, leaf green only as a signal. Tokens live in the token block of `app/field.css`.
- Instrument Sans for headings, text and UI; Literata for a person's long writing; IBM Plex Mono for dates and data. A heading's `<em>` is an upright grey second tone.
- Indexes read like a table of contents: a proposition, a dotted process path, a stage. Dot glyphs name entries instead of pictures. Cover artwork stays on project pages.
- Motion is made of dots: the hero word fills with ink dots, the margins gather into a symbol per section, glyphs re-gather on hover. Reduced motion shows the final figure, still. Native scrolling, content visible without JavaScript.
- Page width 1320px, fluid type, one-column phone layouts, 44px primary touch targets.

## Route plan

| Surface | Treatment |
| --- | --- |
| Home | Headline, a "now" card, an index of work and experiments, research and essay ledgers, the Notes band, elsewhere |
| Playground | Filterable index of apps and experiments (dot glyphs, propositions, process); covers on each project page |
| About | Human introduction and existing beliefs/work, shared editorial typography |
| Journal + articles | Preserve live data, search, filters, publishing, and reader tools; restyle shared surfaces |
| Notes + archive + unsubscribe | Preserve subscription and publication behavior; same paper, ink, and form system |
| Videos | Existing click-to-play films with the shared page language |
| Social + contact | Real social destinations and existing contact flow |
| Legal, sign-in, private tools | Shared tokens, navigation, footer, focus and form treatment |

## References

- https://maggieappleton.com/ — discovery through connected work and writing.
- https://rauno.me/ — small, purposeful interaction details.
- https://transitions.dev/ — transition references; adapt the principles rather than copy a whole interface.

## Acceptance

Build and lint; existing ledger/newsletter tests; browser checks at phone, tablet, desktop, dark mode and reduced motion; functional Playground filters and experiment; public routes and protected redirects; personal-account PR and Vercel preview status. Never claim authenticated publishing is verified without an authorized session.
