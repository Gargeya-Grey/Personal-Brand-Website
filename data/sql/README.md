# SQL scripts (Supabase)

## X To-Do packs

| File | Purpose |
|------|---------|
| `x_content_packs.sql` | Create table + RLS (one-time setup) |
| `x_content_packs_retain_2d.sql` | **Keep only last 2 days** (recommended cleanup) |
| `x_content_packs_wipe.sql` | Full wipe (empty dashboard) |

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

Current scout shape: **2 replies + 1 original**, every **1h IST** (11–22).

These scripts do **not** delete blog articles or other tables.
