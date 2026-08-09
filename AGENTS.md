# Memory

## Project Overview
Personal brand site for **Gargeya** (`@GargeyaS` / GitHub `Gargeya-Grey`): Next.js App Router portfolio + blog + Google OAuth CMS at `/editorial`, including **X To-Do** (human-in-the-loop content packs).

- Repo: `https://github.com/Gargeya-Grey/Personal-Brand-Website` (public — never commit secrets; `.env*` is gitignored).
- Live site packs come from **Supabase** `x_content_packs` (jsonb payload), not only from committed JSON.
- See `README.md` and `package.json` for general template notes and npm scripts.

## Owner goals (product)
- Genuine **X growth** toward ~10k followers in ~3 months.
- **1h IST scout cadence**: every **1 hour from 11:00–22:00 IST** (slots t11…t22); pack shape **exactly 2 replies + 1 original** so replies hit **fresh/climbing** posts.
- High **voice fidelity** (`data/gargeya-voice.md`): replies = **personal additive takes** (not echo/paraphrase bots); originals = **cross-domain stories** with hook, attachment, finish/like/comment pull; anti-monotony; pillars AI ed / use cases / access / efficiency / psych / ethics / positivity.
- Source **grounding** for replies (one draft ↔ one real post).
- **Quality gate:** every draft ≥ **90** (`data/x-reply-quality.md`); originals also pass bookmark/RT/soul tests; **replies auto-fail if post-like** (`score-x-drafts.mjs` conversational markers).
- **Topic Venn (not school-only):** social/learning/educational psychology + cognitive behavior + student-centric methods + AI-in-education + process assessment; **open-source AI as access + extreme efficiency** for all. Full map in `gargeya-voice.md` / scout heat queries in `x-scout-playbook.md`.
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
- CMS: `/editorial` — blog tools + **X studio** (`x-studio-client.tsx`).

### X content system
| Piece | Role |
| :--- | :--- |
| `lib/x-content-model.ts` | Pack shape, **IST 1h ids** (`createRunPackId` / `scoutIstSlot` / `isScoutWindowOpen`), sanitize, draft URL helpers, `resolveMvpIds` (full mini-pack: 2R+1O), sessions |
| `lib/x-content-service.ts` | Hydrate packs, meta normalization, Supabase row ↔ pack |
| `lib/x-source-grounding.ts` | Grounding rules / helpers |
| `app/api/x-content/*` | Read + ingest (`X_SCOUT_SECRET`) |
| `scripts/validate-x-pack.mjs` | Validate pack + evidence + **quality ≥90** |
| `scripts/score-x-drafts.mjs` | Quality gate (dimensions, monotony, sludge) |
| `scripts/merge-x-pack.mjs` | Merge local JSON → remote (IST 1h-aware ids) |
| `data/x-scout-playbook.md` | Scout SOPs: 1h IST, 2R+1O, grounding, Venn heat, quality |
| `data/x-reply-quality.md` | Score rubric (pass ≥90) |
| `data/gargeya-voice.md` | Voice + topic Venn + growth |
| `data/sql/x_content_packs.sql` | Schema |
| `data/sql/x_content_packs_wipe.sql` | Full wipe ritual (user runs in Supabase) |
| `data/x-content-packs.json` etc. | Local mirror / evidence; may lag live DB |

**Critical UI rule:** draft `meta` for sources must be a **status URL string** (or normalize to one). Object-shaped `{url, note}` broke **Copy & open** (opened compose instead of source). Always use `draftOpenUrl` / `normalizeDraftMeta`.

**Pack id:** `pack-YYYY-MM-DD-tHH` with **IST** date + hour ∈ {11,13,15,17,19,21}. Legacy UTC t00/t06/t12/t18 may still exist.

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

### X scout → live To-Do (1h IST)
1. Only during **11:00–22:59 IST**; else skip.
2. Pack id via `createRunPackId()` → `pack-…-t11` … `t22`.
3. Scout per `data/x-scout-playbook.md` + voice (Venn + freshness).
4. **2 grounded replies + 1 original short**; fetch each reply source first; **score each ≥90** (rewrite loop).
5. Validate (grounding + quality) → `merge-x-pack` / ingest with secret → Supabase.
6. Optional: commit pack JSON for GitHub mirror (not required for live To-Do).
7. User posts from CMS while threads are still hot.

### Wipe packs (clean slate)
1. User runs `data/sql/x_content_packs_wipe.sql` in Supabase.
2. Confirm empty.
3. Merge a fresh **2R+1O** pack for the current IST slot.

### Public-safe git
- Commit code, playbooks, SQL, non-secret data.
- Never commit `.env`, service roles, or OAuth secrets.
- Uncommitted scout JSON + logo tweaks after a run are normal; live site uses Supabase.

### Durable scout schedule
- Prefer **1h** interval with prompt: if outside IST 11–22, exit without packing; else run full 2R+1O scout + merge.

## Session state (durable)
- Voice refreshed from live X (2026-07-29); Topic Venn added.
- Cadence: **1h IST / 2 replies + 1 original** (was 2h, then earlier 12h mega-packs).
- Do not invent claims; grounding still non-negotiable.
