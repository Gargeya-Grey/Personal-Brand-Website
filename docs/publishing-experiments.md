# Publish something to the Playground

The public index is `/playground`. Its single registry is `data/playground.ts`; project writeups come from `data/selected-work.ts`. No database migration is needed for a new coded app.

## An app in this repository

1. Create `app/playground/your-app/page.tsx`. Export page metadata with a title, description, and canonical path.
2. Use `Navigation`, `Footer`, `PageIntro`, and `field-main` for the surrounding page. Put interactive code in a separate client component. The idea mixer is a complete example.
3. Add a `PlaygroundEntry` with a unique `id`, `title`, `description`, `kind: 'In your browser'`, honest `status`, and `href: '/playground/your-app'`. Add a clear `action` label such as “Try the experiment” and optionally a `source` link. Use `Software` for installs/products and `Experiments` for source-only explorations.
4. Add the public route to `app/sitemap.ts`.
5. Run lint and build, then check keyboard, phone, dark mode, and reduced motion in the PR preview before merging.

## An app deployed elsewhere

Add the same registry entry with its full HTTPS URL. The index opens external projects in a new tab. Prefer linking separate applications to embedding them: their authentication, scripts, and performance remain independent. Only use public URLs and public-safe descriptions.

## Content and private data

Keep blog publishing in the existing Editorial CMS. Playground entries describe executable projects and are reviewed with their code in a PR. Do not put private ledger or editorial URLs in this registry. Secrets and API credentials belong in server environment variables, never client components or data entries.

## Shared UI

The palette and reusable layouts live in `app/field.css`; work, research, and lab layouts live in `app/work.css`; design decisions live in `docs/personal-world-design.md`. Primary actions use `field-button`, secondary links use `field-text-link`. Decorative motion is optional, pointer-gated, and respects reduced motion. A project must remain usable without hover.

## A project writeup

Add a record to `data/selected-work.ts` with its problem, design choice, current state, and evidence links. The project page, index entry, homepage selection, and sitemap are derived from the record. Keep `id` URL-safe and unique; it must not collide with an existing app route such as `idea-mixer` or `box-lab`. The `missing` field is an explicit owner-content placeholder. Replace the template panel with actual media once available.
