# X scout playbook (12h loop)

Companion to `data/gargeya-voice.md`. Scouts must follow both.

## Cadence
- **Every 12 hours** (not 6).
- Pack id: `pack-YYYY-MM-DD-tHH` where HH is **00** or **12** UTC  
  `slot = Math.floor(UTC_hour / 12) * 12`
- Two packs/day max stack; UI hides fully cleared runs.

## Goal
Support **~10k followers in ~3 months** via discovery replies on **already-viral** niche posts + consistent thesis originals — genuine voice, human-in-the-loop posting at `/editorial?workspace=x`.

## Research bars (viral first)
Use X search with heat filters. Prefer:
```
(min_faves:200 OR min_retweets:50) (AI OR LLM OR agent OR eval OR benchmark OR education)
since:<2d ago>
```
Niche floor: `min_faves:80` only if perfect thesis fit.

Reject quiet posts when hotter alternatives exist.

## Output
1. `data/x-pack-today.json` with unique run id  
2. `node scripts/merge-x-pack.mjs data/x-pack-today.json`  
3. Push remote with APP_URL + X_SCOUT_SECRET when possible  

## Draft `meta` (critical for Copy & open X)
- **`meta` must be a plain URL string**, e.g. `"https://x.com/user/status/123"`.
- Do **not** store `meta` as an object like `{ "url": "...", "note": "..." }`.
- Put notes in **`tip`** or **`why`** instead.
- Replies/QTs without a status URL open blank compose — that is a scout bug.

## Chat status (≤8 lines)
pack id · draft count · heat summary · local/remote · voice applied
