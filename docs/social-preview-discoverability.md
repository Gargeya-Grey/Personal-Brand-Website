# Social preview and discoverability

Approved by the owner on 29 September 2026. The banner was created with the built-in ChatGPT Images tool using `public/profile.webp` as the portrait source, then resized and encoded as a JPEG without changing the approved composition.

## Banner

- `public/og.jpg`, `app/opengraph-image.jpg`, and `app/twitter-image.jpg` contain the same approved image.
- 1200 × 630 pixels, sRGB JPEG, 147,529 bytes.
- SHA-256: `63ed679e1b772cd65ff3c9e5b514a2e8e3d5041f371ad17e155cc70cb6e63f95`.
- The default metadata URL is `/og.jpg?v=20260929`; Next.js also fingerprints its file-convention image URLs. A new URL helps distinguish the replacement from cached previews, but platforms decide when to refresh cached page metadata.
- Alt text describes the person, headline, and visual. Article-specific covers remain in place for journal links.
- For a future replacement, update all three images, both `.alt.txt` files, and `siteConfig.brand` together. Keep the complete name and portrait away from the edges.

## Discoverability changes

- `lib/page-metadata.ts` supplies consistent page-specific search titles, descriptions, canonical URLs, Open Graph, and X metadata for public pages, projects, and Notes. A shared homepage title previously leaked into their social previews.
- The homepage identifies Gargeya as an AI engineer, founder, and writer. Descriptions match the work and biography visible on the site.
- The Person/WebSite graph uses the current name and portrait. Edudojo is an organization Gargeya works for, not another identity in the person's `sameAs` list.
- The About page has a `ProfilePage` whose main entity is the author. Published Notes have `BlogPosting` data; journal posts expose modification dates. Embedded JSON-LD escapes HTML delimiters.
- The sitemap uses real content dates and omits unknown static modification dates. Published articles and Notes load independently, so failure of one collection does not hide the other.
- The existing `llms.txt` navigation aid now reflects the current biography, projects, and routes. Its URLs match the production canonical host, `www.sgargeya.com`.
- Existing public crawl access and private-route exclusions are retained.

## Why these changes

Google's [AI search guidance](https://developers.google.com/search/docs/appearance/ai-features) emphasizes ordinary search eligibility, accessible text, internal links, and accurate structured data. It does not require a special AI text file or special schema. Treat `llms.txt` as a maintained navigation aid, not a ranking or citation guarantee.

Google documents [ProfilePage for a blog's About page](https://developers.google.com/search/docs/appearance/structured-data/profile-page) and requires [sitemap modification dates to describe real updates](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). OpenAI documents [OAI-SearchBot as the search crawler](https://developers.openai.com/api/docs/bots), separately from training controls. Public access alone does not prove that a site has been indexed or cited.

## Verification

These are local implementation checks, not measurements of ranking or citation performance.

| Check | Result |
| --- | --- |
| TypeScript and lint on edited code | PASS |
| Production build | PASS |
| Titles, descriptions, canonical URLs, and social tags in 25 generated public HTML pages | PASS |
| Rendered metadata and schema on 19 representative local routes, including the dynamic Notes index and a published letter | PASS; home and Journal initially returned a development-server error, then passed on retry |
| All three image routes: HTTP response, dimensions, JPEG type, and matching SHA-256 | PASS |
| Sitemap: 27 public URLs, valid content dates, no fabricated static dates or private URLs | PASS |
| About biography present in the server response to OAI-SearchBot | PASS for a local user-agent request; actual crawler IP/CDN access is not proven by this test |
| Editorial and Ledger redirect to login; login and unsubscribe have noindex | PASS |
| React integration review | PASS; metadata and schema remain server-rendered, with no new client dependency |
| Live production after replacement, platform preview caches, Search Console, and external rich-result validation | NOT CHECKED; requires deployment |

## Release and retention

This change is prepared in the workspace; production deployment and external preview refresh are separate release steps. After deployment, check the live homepage, a project, an essay, and a Note; confirm the banner and metadata, then request recrawling or preview refresh where needed. Search Console indexing and external rich-result eligibility require checking those services after release.

No new server or runtime dependency is needed. The old banner remains recoverable from Git. The generated high-resolution source remains in Codex's generated-images folder; the website depends only on the three committed-path JPEG assets. Unrelated work in the checkout is outside this change.

## Generation prompt

```text
Use case: compositing / identity-preserve.
Asset type: a finished, exceptionally polished personal website Open Graph social preview banner, landscape 1200 by 630 proportions (1.90476:1), full bleed.
Transform the attached portrait into a premium editorial banner for Gargeya Sharma, a person who builds AI tools and writes about learning. The attachment is the portrait source. Preserve the actual person's face, facial proportions, hair, smile, skin tone, blue cardigan, and candid natural character with high fidelity. Use the real portrait rather than inventing another person.
Design a beautiful, intentional graphic identity composition, with the restraint of an independent design journal. The current website uses Instrument Serif and Manrope: elegant slightly narrow expressive serif display typography with clean humanist sans serif supporting text.
Background: cool almost-white paper #f0f5f6, extremely subtle fine paper tactility, deep navy ink #142936, one restrained dark sea-green accent #08796d. No busy UI. Light, personable, creative and confident.
Composition: generous approximately 6% outer margins. Left 60% is a rigorous typographic layout. Very large beautiful navy serif name on two lines, "Gargeya" then "Sharma", dominant and clearly legible at thumbnail size. Below it, medium-sized clean sans serif copy on two lines: "I build tools for" then "how we think." Make the final word "think." an elegant sea-green italic serif detail. Small tasteful domain "sgargeya.com" at lower left, still legible, not microtext.
Right 34% has a beautiful large rectangular editorial photographic print of the supplied person, subtle physical depth, a fine pale border and a slightly offset sea-glass green paper sheet behind it, with gentle natural shadow. The complete face and hair sit comfortably within the print; preserve the source photograph's authenticity. Rectangular paper print, minimally rounded corners, no circle avatar. The bottom of portrait aligns near the subtitle block. Slight optical asymmetry but calm structure. Use a very fine short green rule above the name as the only graphic mark, no invented logo.
Text must be precisely spelled:
"Gargeya"
"Sharma"
"I build tools for"
"how we think."
"sgargeya.com"
Only those words. No extra caption, no buttons, no badges, no ornamental interface, no fabricated claims, no grids, no circuit imagery, no artificial glowing gradients, no watermark.
Typography and face are the hero. Deliver only the finished banner, no device mockup or surrounding frame. Composition must work as an actual social link preview.
```
