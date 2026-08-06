# X scout playbook (1h IST loop)

Companion to `data/gargeya-voice.md`. Scouts must follow both.

## Cadence (hard rule)

| | |
|--|--|
| **Timezone** | **Asia/Kolkata (IST)** |
| **Window** | **11:00 → 22:59 IST** (last scout slot **22:00**) |
| **Interval** | **Every 1 hour** |
| **Slots (IST)** | `11, 12, 13, …, 22` → **up to 12 packs/day** |
| **Off hours** | Do **not** merge a new pack outside the window (sleep / deep work). If a job fires early/late, **skip** (no empty pack). |

### Pack id
```
pack-YYYY-MM-DD-tHH
```
- `YYYY-MM-DD` and `HH` are **IST** (not UTC).  
- `HH` ∈ `11`–`22` (hourly)  
- Use `createRunPackId()` / merge script `runPackId()` — both snap to the current IST hour slot.  
- Legacy ids (even-only 2h slots, or UTC `t00`/`t06`/`t12`/`t18`) may still exist; do not reuse them for new runs.

### Why 1h
Replies must land while the **source post is still climbing**. Hourly keeps heat fresher than 2h or 12h backlogs.

---

## Pack shape (every run — hard rule)

| Type | Count | Notes |
|------|--------|--------|
| **Replies** | **exactly 2** | Most relevant + hottest **fresh** posts in the Venn |
| **Original** | **exactly 1** | **Independent brand post** — soul + informative, NOT a mashup of the two replies. Usually 4–10 lines / 2–4 beats. See voice file **ORIGINALS**. |
| **Quote** | **0** (default) | Skip on 1h packs unless a third source is exceptional — then QT **instead of** the original, not in addition |

**Per day (if all 12 slots posted):** ~**24 replies + 12 originals** — quality gate still ≥90; skip a slot rather than ship mediocre.

- **mvpDraftIds:** all three draft ids (full mini-queue).  
- **plannedMinutes:** ~15–25 total.  
- **Do not** ship 8–10 reply piles anymore.  
- **Do not** skip the original by default — consistency of *his* voice in the feed matters on this cadence. If stuck, one short thesis line still counts.

### Selection quality (the whole point)
1. Prefer sources from the **last ~1–4 hours** (still moving).  
2. Heat still matters: high likes/views on large accounts, but **fresh + Venn fit beats old mega-viral**.  
3. Two replies = two *different* posts (never two drafts on the same status).  
4. **Original is NOT derived from the two replies.** Pick a pillar (AI education, use cases, access, efficiency, psych/cognition, ethics/values, positivity-with-spine) **before** or **apart from** drafting replies. Standalone insight with soul — bookmark/RT/comment test in voice file.

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
6. Values: self-awareness, critical thinking, decision-making  
7. Builder curiosity + evidence asks  

Not product spam. One angle per draft, grounded in **that** source only.

### Voice (anti-monotony — mandatory)
Read `data/gargeya-voice.md` **Anti-monotony rule**.  
Across the 3 drafts in a pack: **≥2 different shapes** (micro / blunt / values jab / system-failure / systems line / resource share / rare thesis).  
Do **not** stamp “You're absolutely right — but…” or “score the path” / mission close on every draft. Same mind, different clothes — or the feed looks AI-written.

### Reply ≠ post (mandatory — enforced by validator)
Replies must sound like **comments in someone's room** (second-person, `yeah` / `this` / reactive).  
If a reply reads fine with the source deleted, it is a **post in disguise** → rewrite.  
`scripts/score-x-drafts.mjs` **auto-fails** long/formal replies without conversational markers.  
Originals stay **standalone** (not a reply-shaped “yeah this is so true” only).

### Quality gate (mandatory — pass ≥ 90)
Full rubric: **`data/x-reply-quality.md`**.

For **every** draft (both replies + original):

1. Draft body (voice + grounding).  
2. Score 0–100 across dimensions: lengthFit, clarity, hook, funRead, relatability, voiceMatch, humanTexture, groundingFit.  
3. If **total < 90** → rewrite (up to 3 attempts) or drop source. **Do not merge fails.**  
4. Attach `quality: { total, shape, dimensions, notes, attempts? }` on the draft.  
5. `node scripts/validate-x-pack.mjs …` enforces scores + anti-sludge / monotony floors.

Honest scoring only — inflating to 91 is a system failure. Prefer skip over mediocre.

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

## Research workflow (per 1h run)
1. Confirm IST slot open (`isScoutWindowOpen` / hour 11–21). Else **exit**.  
2. `createRunPackId()` → id for this slot.  
3. Search heat + **recency** across the Venn.  
4. Fetch candidates; keep top **2 reply targets**.  
5. Draft **2 grounded replies** (voice file) → **score each ≥90** or rewrite.  
6. **Original (strict):** choose an independent pillar idea from voice idea bank — **do not theme it off the two replies**. Draft for soul + teaching + emotion → standalone / bookmark tests → **score ≥90**. If it reads like a pack summary, delete and rewrite.  
7. Varied shapes + quality{} on every draft (`quality.notes` for originals must name the independent insight).  
8. `validate-x-pack` (grounding + quality) → merge/ingest.  
9. Chat status ≤8 lines including **scores** + original pillar.

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
pack id · **2 replies / 1 original** · IST slot · heat · grounding: pass · **quality: 92/94/91** · local/remote  

If shape is wrong or any quality **&lt; 90**, **cut/rewrite** before merge.
