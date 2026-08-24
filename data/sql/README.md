# SQL scripts (Supabase)

## X To-Do packs

| File | Purpose |
|------|---------|
| `x_content_packs.sql` | Create table + RLS (one-time setup) |
| `x_content_packs_retain_2d.sql` | **Keep only last 2 days** (recommended cleanup) |
| `x_content_packs_wipe.sql` | Full wipe (empty dashboard) |

## X Lab (growth analytics)

| File | Purpose |
|------|---------|
| `x_lab.sql` | Warehouse tables: OAuth tokens, account snapshots, posts, metric history, refresh runs |

### Setup

1. Run `x_lab.sql` in Supabase SQL Editor.
2. Set on Vercel + local `.env`: `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_OAUTH_REDIRECT_URI`, `X_TOKEN_ENCRYPTION_KEY`.
3. X Developer Portal: OAuth 2.0 callback = `X_OAUTH_REDIRECT_URI` (prod + localhost if needed).
4. Open `/editorial?workspace=lab` → **Connect X** as @GargeyaS → **Refresh data**.

### Retention (default product rule)

Live X To-Do keeps **at most 2 calendar days** of packs (`pack.date` in IST).

- App auto-prunes older rows on load/ingest (`X_PACK_RETENTION_DAYS = 2` in `lib/x-content-service.ts`).
- `merge-x-pack.mjs` also prunes the local JSON mirror.
- Manual: run `x_content_packs_retain_2d.sql` in Supabase SQL Editor anytime.

### Full clean slate (rare)

1. Supabase → **SQL Editor** → run `x_content_packs_wipe.sql`.
2. Confirm `packs_after` = **0**.
3. Laptop:

```bash
node scripts/merge-x-pack.mjs data/x-pack-today.json
```

(`APP_URL` + `X_SCOUT_SECRET` in `.env.local`.)

4. Refresh https://www.sgargeya.com/editorial?workspace=x

Current scout shape: **t11 = 2 replies + 1 original**, **t19 = 3 replies** (+ original if morning did not leave one). Scout every **4h**. He sits 11:30 and 19:00 IST.

## Finance Ledger (Notion invoice extractor)

| File | Purpose |
| :--- | :--- |
| `ledger_settings.sql` | Per-user encrypted Notion token + database ID |

### Setup

1. Run `ledger_settings.sql` in Supabase SQL Editor.
2. Confirm `X_TOKEN_ENCRYPTION_KEY` is set (same key used by X Lab).
3. Set `GEMINI_API_KEY` (default extractor). Optional OpenRouter: `OPENROUTER_API_KEY` + `LEDGER_OPENROUTER_MODEL`.
4. Optional env fallback (single-user): `NOTION_API_KEY`, `NOTION_DATABASE_ID`.
5. Sign in at `/ledger`, paste your Notion integration token + database ID, Save & test.

Tokens never go in git. The public site cannot reach `/ledger` or `/api/ledger/*`.

These scripts do **not** delete blog articles or other tables.
