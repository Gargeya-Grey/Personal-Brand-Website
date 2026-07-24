# X scout playbook (12h loop)

Companion to `data/gargeya-voice.md`. Scouts must follow both.

## Cadence
- **Every 12 hours** (not 6).
- Pack id: `pack-YYYY-MM-DD-tHH` where HH is **00** or **12** UTC  
  `slot = Math.floor(UTC_hour / 12) * 12`
- Two packs/day max stack; UI hides fully cleared runs.

## Goal
Grow @GargeyaS (~40s followers today) via **other people’s distribution** first.  
Human posts from X To-Do at `/editorial?workspace=x`.

---

## PHASE: REPLY-FIRST (current — until originals get real traction)

**Account reality:** small account; pure original posts often sit under ~50 impressions.  
**Strategy:** almost all energy is **replies under already-hot posts** so strangers see critical thinking in the room.

### Ratio (hard rule for Phase 1)
| Type | Share | Per 12h pack (target) |
|------|--------|------------------------|
| **Replies** | **~90%** | **8–10** grounded replies |
| **Originals** (flagship **or** short — not a pile of both) | **~10%** | **0–1** total |
| **Quote** | optional discovery | **0–1** (counts toward discovery, not “originals budget”) |

**Think 1 : 10** → about **one** original for every **ten** replies across a day/week, not 1 flagship + 3 shorts every run.

- **Do not** ship packs that are “1 flagship + 3 shorts + 4 replies.” That is original-heavy and burns time for ~zero reach.
- **mvpDraftIds:** **replies only** (top 4–6 by heat). Original is optional / after MVP.
- **plannedMinutes:** ~40–50 focused on the reply sprint.

### When to leave Phase 1 (manual — Gargeya decides)
Raise original share only when **his own posts** regularly clear a real floor (e.g. hundreds of impressions, not tens) for 1–2 weeks. Until then, keep this ratio.

### What every reply should signal (content lanes)
Show **critical thinking + passion + multi-angle mind** — not product spam:

1. **AI systems honesty** — evals, benches, agents, green tests vs real decisions  
2. **Learning & education** — homework vs thinking, process over output scores  
3. **Ethics & values** — transparency, what we measure shapes people/products, fairness  
4. **Builder curiosity** — “I’m not totally getting…”, ask for re-runnable evidence  

One angle per reply, grounded in **that** source post only.

---

## SOURCE GROUNDING (non-negotiable — higher priority than virality)

A bad factual reply destroys trust faster than a quiet day. **Zero invented claims.**

### Rule of one post
1. **One draft ↔ one source post.**  
   - `meta` = that post’s status URL only.  
   - Every factual claim in `body` must be **literally supportable from that post’s text**.  
2. **Never merge two posts into one reply.**  
3. If CEO QT said “Fable 5” and lab post did not → reply to CEO, or drop Fable from lab reply.

### Verification loop (mandatory before writing body)
1. Fetch the exact status in `meta`.  
2. Note only claims in that text.  
3. Write body from those claims + your angle (path / learning / ethics).  
4. Self-check proper names/numbers.  
5. Fetch fail → **skip** draft.

### `meta` format
- Plain string: `"https://x.com/user/status/123"` only  
- Notes → `tip` / `why`

### Heat (after truth)
```
(min_faves:200 OR min_retweets:50) (AI OR LLM OR agent OR eval OR education OR learning OR ethics)
since:<2d ago>
```
Niche floor `min_faves:80` only if perfect thesis **and** verified.  
≥80% of replies: `hyper` | `viral` | `high`.

---

## Research workflow
1. Search with heat operators (AI + education + ethics + learning + agents).  
2. Fetch each candidate.  
3. Draft **replies first** until 8–10 solid ones.  
4. **At most one** original (short preferred over long flagship in Phase 1).  
5. Optional one QT on a still-hot post.  
6. Validate grounding → merge.

## Pack shape (Phase 1)
- signals: 5–8 verified urls  
- **replies: 8–10**  
- **originals: 0–1** (prefer one short; skip flagship unless a single strong thread is needed)  
- quote: 0–1  
- mvpDraftIds: **reply ids only**  
- skipList: original-heavy habits, mixed-source claims, quiet posts  

## Output
1. `data/x-pack-today.json`  
2. `node scripts/validate-x-pack.mjs data/x-pack-today.json` [+ evidence]  
3. `node scripts/merge-x-pack.mjs data/x-pack-today.json`  

## Chat status (≤8 lines)
pack id · **N replies / M originals** · heat · grounding: pass · local/remote  

If reply:original is worse than ~8:1, **cut originals** before merge.
