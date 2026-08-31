# Memory

## Project Overview
Personal brand site for **Gargeya** (`@GargeyaS` / GitHub `Gargeya-Grey`): Next.js App Router portfolio + blog + Google OAuth CMS at `/editorial`, including **X To-Do** (human-in-the-loop content packs) and a private **Finance Ledger** at `/ledger`.

- Repo: `https://github.com/Gargeya-Grey/Personal-Brand-Website` (public — never commit secrets; `.env*` is gitignored).
- Live site packs come from **Supabase** `x_content_packs` (jsonb payload), not only from committed JSON.
- See `README.md` and `package.json` for general template notes and npm scripts.

## Owner goals (product)
- Genuine **X growth**. Owner dashboard: `lib/x-growth-strategy.ts` (updated 21 Aug 2026). Daily: **1 strong original** + **3–5 thoughtful replies** in bigger borrowed rooms. Two sittings, then stop. Twice a week: Edudojo/build proof. No 15–25 reply grind, no several weak originals, no connect-farm.
- Scout wakes **every 4h and always writes** a pack (t11 before 15:00 IST, t19 after). He sits at 11:30 and 19:00 and **picks** what to post.
- **Write brief:** `data/gargeya-voice.md` only. Short. He edits that. No numeric scores. He picks what to post.
- **Gate:** `scripts/score-x-drafts.mjs` is a tiny mechanical check (source URL, em-dash, punch-stack, sports/shift, invented ranking). Not a 90-point rubric.
- **Replies** = useful distinction in live rooms (educators, assessment, AI + capability, students passing without becoming capable, people judged by proxies). Borrow heat. **Own tweets** = beliefs, examples, frameworks, build notes.
- Source **grounding** for replies (one draft ↔ one real post).
- Strategy dashboard: `lib/x-growth-strategy.ts` (he reads it; scout does not).
- Laptop **Grok scout** → merge/ingest → **production Supabase** so live To-Do updates without waiting on git.
- Blog CMS quality + perf (ISR/SSR, image priority, lazy canvas background).

## Code Style Guidelines
- Use descriptive variable names.
- Follow existing patterns in the codebase.
- Extract complex conditions into meaningful boolean variables.
- Prefer public-safe commits; leave local pack JSON dirty if Supabase already has the live pack unless the user wants GitHub mirror.

## Architecture Notes

### Auth / CMS
- Google OAuth + JWT session cookie; allowed email gate in `lib/auth.ts`.
- CMS: `/editorial` — blog tools + **X studio** (`x-studio-client.tsx`) + **X Lab** (`x-lab-client.tsx`, `?workspace=lab`) + **Growth Strategy** (`x-growth-strategy.tsx`, `?workspace=strategy`) + **Notes** (`newsletter-client.tsx`, `?workspace=notes`). Scout brief is `data/gargeya-voice.md`. Notes brief is `data/newsletter-brief.md`. The strategy page is a dashboard, not the brief.
- **Finance Ledger** `/ledger` — invoice extract → review → Notion. Same allowlist. Setup: `data/ledger-setup.md`.

### Finance ledger
| Piece | Role |
| :--- | :--- |
| `lib/ledger-schema.ts` | Enums, entry shape, size limits |
| `lib/ledger-engine.ts` | FY calendar, enum map, operator-note fusion, save validation |
| `lib/ledger-extract.ts` | Two-step extract: untrusted invoice + trusted notes |
| `lib/ledger-ai.ts` | Gemini default (`GEMINI_API_KEY`); OpenRouter via `LEDGER_OPENROUTER_MODEL` |
| `lib/ledger-settings.ts` | Per-email encrypted Notion keys (Supabase) + env fallback |
| `app/api/ledger/*` | extract / notion / settings (session + origin + rate limit) |
| `data/sql/ledger_settings.sql` | Table + deny-all RLS |

**Security:** no invoice storage; Notion tokens encrypted with `X_TOKEN_ENCRYPTION_KEY`; never returned in full; `/ledger` and `/api/ledger` are noindex + proxy-gated. Operator notes outrank OCR when they conflict.

### X content system
| Piece | Role |
| :--- | :--- |
| `lib/x-content-model.ts` | Pack ids t11/t19, sanitize, `resolveMvpIds` (morning 2 replies + 1 original; evening 3 replies + 1 original) |
| `lib/x-content-service.ts` | Hydrate packs, meta normalization, Supabase row ↔ pack |
| `lib/x-source-grounding.ts` | Grounding rules / helpers |
| `app/api/x-content/*` | Read + ingest (`X_SCOUT_SECRET`) |
| `scripts/validate-x-pack.mjs` | Validate pack + evidence + mechanical gate |
| `scripts/score-x-drafts.mjs` | Quality gate (dimensions, monotony, sludge) |
| `scripts/merge-x-pack.mjs` | Merge local JSON → remote (IST 2h-aware ids) |
| `data/gargeya-voice.md` | Only scout brief. Owner edits this. |
| `lib/x-lab-service.ts` / `x-api.ts` / `x-lab-analytics.ts` | X Lab OAuth + warehouse + analytics |
| `app/api/x-lab/*` | Lab refresh / summary / posts / chat / OAuth |
| `data/sql/x_lab.sql` | X Lab warehouse schema |
| `data/sql/x_content_packs.sql` | Pack schema |
| `data/sql/x_content_packs_retain_2d.sql` | Keep only last 2 days (manual Supabase prune) |
| `data/sql/x_content_packs_wipe.sql` | Full wipe ritual (user runs in Supabase) |
| `data/x-content-packs.json` etc. | Local mirror / evidence; may lag live DB |

**Done status:** `posted`/`skipped` always survive scout re-ingest and body polish (same draft identity). Draft ids match with or without `pack-…__` prefix.

**Retention:** max **2 calendar days** of packs (auto-prune on load/ingest + local merge).

**Critical UI rule:** draft `meta` for sources must be a **status URL string** (or normalize to one). Object-shaped `{url, note}` broke **Copy & open** (opened compose instead of source). Always use `draftOpenUrl` / `normalizeDraftMeta`.

**Pack id:** `pack-YYYY-MM-DD-tHH` with **IST** date + hour ∈ {11,13,15,17,19,21}. Legacy UTC t00/t06/t12/t18 may still exist.

### Notes (weekly letter)
| Piece | Role |
| :--- | :--- |
| `data/newsletter-brief.md` | Only Notes bot brief. Owner edits this. |
| `data/gargeya-voice.md` | How it should sound. Bot reads this too. |
| `data/grok-bot-newsletter-prompt.md` | Copy-paste handover for Grok Bot. |
| `lib/newsletter-model.ts` | Week shape, Sunday ids, ingest merge, Sunday 19:00 local send rules. |
| `lib/newsletter-service.ts` | Supabase weeks / subscriber TZ / read pings. |
| `app/api/newsletter/ingest` | Bot GET taste + POST week (`X_SCOUT_SECRET`). |
| `app/editorial?workspace=notes` | Curator: edit, preview, auto-publish checkbox, "I'm happy with this". |
| `/notes` | Public landing + example + archive. |
| Metrics | Subscribers (Resend), unique opens (Resend), median read time (`newsletter_reads`). |

**Cadence (IST):** Saturday 19:00 bot drafts. Sunday 13:00 bot refreshes research. Sunday 19:00 site sends if auto-publish is on (each subscriber's local Sunday 19:00) or immediately when he presses happy with auto-publish off.

**Preserve:** curator body edits, auto-publish, acknowledgment, sent receipts survive bot re-ingest.

### Analytics / social proof (site)
- **Likes**: `localStorage` only, not a shared DB.
- **Views**: Vercel Analytics (not a first-class DB counter).
- Speed Insights / Core Web Vitals: platform metrics; blog perf work used ISR/SSR, `Image` priority, lazy `InteractiveBackground`.

### Deploy
- Vercel deploys this personal repo; wrong Vercel team/MCP credentials have caused confusion — use the personal project, not unrelated orgs.
- Push often blocked for agent auto-mode; **user runs** `git push origin main` when needed.

### Brand
- Nav short name: **Gargeya**.
- Logos under `public/brand/sgargeya-logo-*` (light/dark png/svg).

## Common Workflows

### X scout → live To-Do (two sittings)
1. Always pack. Do not skip for sitting hour.
2. Pack id → `t11` before 15:00 IST, `t19` from 15:00.
3. Read **only** `data/gargeya-voice.md`. Write like a person. No scores.
4. **t11:** 2 replies + 1 original. **t19:** 3 replies (+ original only if morning did not already leave one). Prefer big rooms still in territory.
5. Validate (mechanical) → merge/ingest.
6. He posts at **11:30** and **19:00 IST** if he wants. He picks.

### Prune packs (keep 2 days)
1. Prefer auto-prune (app + merge). Or run `data/sql/x_content_packs_retain_2d.sql` in Supabase.
2. Refresh editorial X To-Do.

### Wipe packs (full clean slate — rare)
1. User runs `data/sql/x_content_packs_wipe.sql` in Supabase.
2. Confirm empty.
3. Merge a fresh sitting pack (morning 2 replies + 1 original, or evening 3 replies).

### Public-safe git
- Commit code, playbooks, SQL, non-secret data.
- Never commit `.env`, service roles, or OAuth secrets.
- Uncommitted scout JSON + logo tweaks after a run are normal; live site uses Supabase.

### Durable scout schedule
- Interval **4h**, durable, **always writes**. He curates in the two sittings.

## Session state (durable)
- Brief is **`data/gargeya-voice.md` only**. No scores. Loop every 4h. He picks at 11:30 and 19:00 IST.
- Notes bot reads **`data/newsletter-brief.md` + voice + ingest taste**. Saturday 19:00 IST draft, Sunday 13:00 IST research refresh. He curates at `/editorial?workspace=notes`.
- Do not invent claims; grounding still non-negotiable.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
