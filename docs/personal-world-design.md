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

- Palette follows the owner’s journal cover art: cool silver `#f0f5f6`, navy ink `#142936`, readable teal `#08796d`; dark mode uses midnight `#0b141f`, silver-white `#edf5f7`, and sea-glass mint `#83dfc1`. Supporting surfaces use muted blue and mint.
- Instrument Serif for expressive display headlines; Manrope for reading and controls. Decorative section numbers and redundant eyebrow copy are removed; useful metadata stays at a readable size. Unused display-font downloads are removed.
- Fine rules, generous whitespace, modest corner radii, offset paper objects, and one deliberate accent. Different content gets different composition; avoid an endless grid of identical cards.
- Page width 1320px, fluid type, one-column phone layouts, wrapping controls, 44px primary touch targets. Content determines height.
- Motion: one-time 8–16px section entrances, small pointer-only lifts, and a scroll-driven decorative orbit. Transform/opacity only, native scrolling, reduced-motion alternatives, content visible without JavaScript.

## Route plan

| Surface | Treatment |
| --- | --- |
| Home | Personal cover, featured venture, Playground preview, writing and video doors |
| Playground | Filterable registry of apps, websites, and advisory work; an actual local interactive experiment |
| About | Human introduction and existing beliefs/work, shared editorial typography |
| Journal + articles | Preserve live data, search, filters, publishing, and reader tools; restyle shared surfaces |
| Notes + archive + unsubscribe | Preserve subscription and publication behavior; same paper, ink, and form system |
| Videos | Existing click-to-play films with the shared page language |
| Community + contact | Real social destinations and existing contact flow |
| Legal, sign-in, private tools | Shared tokens, navigation, footer, focus and form treatment |

## References

- https://maggieappleton.com/ — discovery through connected work and writing.
- https://rauno.me/ — small, purposeful interaction details.
- https://transitions.dev/ — transition references; adapt the principles rather than copy a whole interface.

## Acceptance

Build and lint; existing ledger/newsletter tests; browser checks at phone, tablet, desktop, dark mode and reduced motion; functional Playground filters and experiment; public routes and protected redirects; personal-account PR and Vercel preview status. Never claim authenticated publishing is verified without an authorized session.
