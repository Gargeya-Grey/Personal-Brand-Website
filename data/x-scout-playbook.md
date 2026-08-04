# X scout playbook (2h IST loop)

Companion to `data/gargeya-voice.md`. Scouts must follow both.

## Cadence (hard rule)

| | |
|--|--|
| **Timezone** | **Asia/Kolkata (IST)** |
| **Window** | **11:00 → 22:00 IST** (last scout slot **21:00**) |
| **Interval** | **Every 2 hours** |
| **Slots (IST)** | `11, 13, 15, 17, 19, 21` → **6 packs/day** |
| **Off hours** | Do **not** merge a new pack outside the window (sleep / deep work). If a job fires early/late, **skip** (no empty pack). |

### Pack id
```
pack-YYYY-MM-DD-tHH
```
- `YYYY-MM-DD` and `HH` are **IST** (not UTC).  
- `HH` ∈ `11 | 13 | 15 | 17 | 19 | 21`  
- Use `createRunPackId()` / merge script `runPackId()` — both snap to the current IST slot.  
- Legacy ids (`t00` / `t06` / `t12` / `t18` UTC) may still exist in the store; do not reuse them for new runs.

### Why 2h (not 12h)
Replies must land while the **source post is still climbing** (visibility + reply energy). A 12h backlog dumps you into dead threads. Fresh heat > big stale queues.

---

## Pack shape (every run — hard rule)

| Type | Count | Notes |
|------|--------|--------|
| **Replies** | **exactly 2** | Most relevant + hottest **fresh** posts in the Venn |
| **Original** | **exactly 1** | Prefer **short** (2–5 sentences). Flagship only if one tight idea needs it |
| **Quote** | **0** (default) | Skip on 2h packs unless a third source is exceptional — then QT **instead of** the original, not in addition |

**Per day (if all 6 slots posted):** ~**12 replies + 6 originals**.

- **mvpDraftIds:** all three draft ids (full mini-queue).  
- **plannedMinutes:** ~15–25 total.  
- **Do not** ship 8–10 reply piles anymore.  
- **Do not** skip the original by default — consistency of *his* voice in the feed matters on this cadence. If stuck, one short thesis line still counts.

### Selection quality (the whole point)
1. Prefer sources from the **last ~1–4 hours** (still moving).  
2. Heat still matters: high likes/views on large accounts, but **fresh + Venn fit beats old mega-viral**.  
3. Two replies = two *different* posts (never two drafts on the same status).  
4. Original must sit in the **Topic Venn** (psych / learning / AI-ed / open access) — no random noise.

---

## Topic Venn (rooms to hunt)

Full diagram in `data/gargeya-voice.md`. Short form:

| Circle | Hunt for |
|--------|----------|
| **A Mind/psych** | social / learning / educational psychology, cognitive behavior, metacognition, offloading |
| **B Education practice** | student-centric methods, process-based assessment, thinking path vs final score |
| **C AI systems (purposeful)** | AI-in-education, open-source access, efficiency (speed×cost×quality), honest evals/agents |

**Priority:** center (AI × learning/cognition × access) → overlaps → open-source as accessibility → edge model news only with a real Venn hook.

### Content lanes (one angle per reply)
1. Learning / educational / social psych  
2. Cognitive behavior + AI  
3. Student-centric + process assessment  
4. Open efficient AI for access  
5. AI systems honesty (when thinking is at stake)  
6. Builder curiosity + evidence asks  

Not product spam. One angle per draft, grounded in **that** source only.

---

## SOURCE GROUNDING (non-negotiable — higher priority than virality)

A bad factual reply destroys trust faster than a quiet day. **Zero invented claims.**

### Rule of one post
1. **One draft ↔ one source post.**  
   - `meta` = that post’s status URL only (string).  
   - Every factual claim in `body` must be **literally supportable from that post’s text**.  
2. **Never merge two posts into one reply.**  
3. If CEO QT said “X” and lab post did not → reply to CEO, or drop X from lab reply.

### Verification loop (mandatory before writing body)
1. Fetch the exact status in `meta`.  
2. Note only claims in that text.  
3. Write body from those claims + Venn angle.  
4. Self-check proper names/numbers.  
5. Fetch fail → **skip** that candidate and pick another.

### `meta` format
- Plain string: `"https://x.com/user/status/123"` only  
- Notes → `tip` / `why`

### Heat (after truth) — fresher windows
```
(min_faves:100 OR min_retweets:30) (AI OR LLM) (learning OR education OR student OR tutor OR assessment OR cognitive OR psychology OR metacognition)
(min_faves:100 OR min_retweets:30) (open source OR open-weight OR open weights OR open model) (AI OR LLM)
(min_faves:100 OR min_retweets:30) (agent OR eval OR benchmark) (learning OR thinking OR student OR education)
(min_faves:80 OR min_retweets:20) ("cognitive offloading" OR "learning science" OR "educational psychology" OR "student-centered" OR "student-centric")
since:<6h ago>   # prefer last 1–4h when possible
```
Niche floor `min_faves:50` only if **perfect Venn** + verified + still climbing.  
Both replies should be `hyper` | `viral` | `high` when possible; one `mid` OK if thesis is perfect and **fresh**.

---

## Research workflow (per 2h run)
1. Confirm IST slot open (`isScoutWindowOpen` / hour 11–21). Else **exit**.  
2. `createRunPackId()` → id for this slot.  
3. Search heat + **recency** across the Venn.  
4. Fetch candidates; keep top **2 reply targets**.  
5. Draft **2 grounded replies** (voice file).  
6. Draft **1 original short** (Venn thesis — no fake citations).  
7. Validate grounding → merge/ingest.  
8. Chat status ≤8 lines.

## Pack shape checklist
- signals: 2–4 verified urls (the reply targets + optional context)  
- **replies: 2**  
- **originals: 1** (short preferred)  
- quote: 0 default  
- mvpDraftIds: **all three**  
- skipList: stale threads, mixed-source claims, off-Venn pure hype, oversized reply piles  

## Output
1. `data/x-pack-today.json`  
2. `node scripts/validate-x-pack.mjs data/x-pack-today.json` [+ evidence]  
3. `node scripts/merge-x-pack.mjs data/x-pack-today.json`  

## Chat status (≤8 lines)
pack id · **2 replies / 1 original** · IST slot · heat · grounding: pass · local/remote  

If shape is wrong (e.g. 8 replies), **cut** before merge.
