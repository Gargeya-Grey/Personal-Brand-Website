# SQL scripts (Supabase)

## X To-Do packs

| File | Purpose |
|------|---------|
| `x_content_packs.sql` | Create table + RLS (one-time setup) |
| `x_content_packs_wipe.sql` | **Empty the X To-Do dashboard** |

### Clean slate / weekly cleanup (~every 7–8 days)

1. Supabase → **SQL Editor** → open `x_content_packs_wipe.sql` (or paste its contents).
2. Run it → `packs_after` should be **0**.
3. On your laptop, from the repo root:

```bash
node scripts/merge-x-pack.mjs data/x-pack-today.json
```

(`APP_URL` + `X_SCOUT_SECRET` must be set in `.env.local`.)

4. Refresh https://www.sgargeya.com/editorial?workspace=x — only the new pack remains.

This does **not** delete blog articles or other tables.
