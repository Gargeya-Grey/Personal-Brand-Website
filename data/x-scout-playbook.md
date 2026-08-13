# X scout playbook (2h IST loop)

Read **`data/gargeya-voice.md` first** (you are Gargeya, a **creative writer**).  
Then **`data/x-adversary-writer.md`** (last-mile rewrite before merge).  
Then **`data/x-weekly-strategy.md`** (how many, when, which parts of him).  
This file is mechanics: slots, rooms, grounding, merge.

**Writing law:** one feeling, sentences that hold together, easy and a little fun, a click (`I believe this` / `he’s right` / `I don’t like this`).  
**Instant rewrite:** recap-then-lecture, tote-bag slogans, or three tiny full-stop punches with no current.

## Cadence (hard rule)

| | |
|--|--|
| **Timezone** | **Asia/Kolkata (IST)** |
| **Window** | **11:00 → 22:59 IST** |
| **He sits** | **11:30** and **19:00 IST** only |
| **When to write a pack** | Only if IST hour is **10–11** (morning pack) or **18–19** (evening pack) |
| **Slots** | `t11` (morning) and `t19` (evening). **Two packs/day.** |
| **If the job wakes at another hour** | One line: `not a sitting — skip`. Do **not** merge. |

### Pack id
```
pack-YYYY-MM-DD-tHH
```
- `YYYY-MM-DD` and `HH` are **IST** (not UTC).  
- `HH` is **11** (morning) or **19** (evening)  
- Use `createRunPackId()` / merge script `runPackId()` — both snap to the current IST 2h slot.  
- Legacy hourly ids (`t12`/`t14`/…) or UTC `t00`/`t06`/`t12`/`t18` may still exist; do not reuse them for new runs.

### Why the loop still wakes, but only writes twice
He only posts twice. Extra packs were drafts nobody used. The job may wake on a 2h clock so it can land **just before** 11:30 and 19:00. If it is not packing hour, it exits. Fresh threads, no pile.

---

## Pack shape (every run — hard rule)

Read **`data/x-weekly-strategy.md`** for this week’s theme, heat gates, and skip list.

| Type | Count | Notes |
|------|--------|--------|
| **Replies** | **exactly 2** | Big climbing rooms. Different moods. Education-coded **at most 1**. |
| **Small own tweets** | **exactly 2** | Different personality parts. 2–5 lines. People should feel a bit better. Education **at most 1**, and **0** if a reply is already education. |
| **Quote** | **0** (default) | May replace one own-tweet on a mega still-hot post. |

**Total drafts per pack:** **4**.  
He posts only at **11:30** and **19:00 IST**. Newest first.

- **mvpDraftIds:** all four.  
- **plannedMinutes:** ~15–22.  
- **Education cap:** max **2 education items in the whole calendar day** across packs he will actually post.

### Replies (big rooms, creative writer)

Job: a stranger in a hot thread feels something and thinks **“I believe this / he’s right / I don’t like this.”** Then they may open the profile.

| Rule | Detail |
|------|--------|
| **Sources** | Prefer **≥20k views or ≥200 likes or ≥50k-follower author**, still climbing (last ~6h). Honest hook or **drop**. Two **different** status URLs. |
| **Length** | As long as the feeling needs. Usually one flowing block or two. Not 3–5 carved paragraphs. Not a telegram of punches. |
| **Write** | Creative writer. One current. Easy. Inclusive. No recap, no tote-bag line, no lecture. |
| **Still a reply** | Under their roof. **No** “follow me”, **no** link spam, **no** product dump. |
| **Differentiation** | Two replies = two moods. |

### Selection quality
1. Prefer last **~1–6 hours**, still moving.  
2. Fresh + human hook beats old mega-viral with nothing to say.  
3. Two replies = two different posts.  
4. Own tweets are not mashups. Two different parts of him. People should feel a bit better.

---

## Rooms to hunt (whole person)

He is not a school account. Hunt **all** of these. Education is a **small** slice.

| Part | Hunt for |
|------|----------|
| Self-awareness | noticing yourself, honesty, slowing down |
| Psychology | fear, freeze, people-pleasing, habit, why we do things (plain language) |
| Care / sales | customers, service, trust, respect, hospitality done honestly |
| Optimism / positivity | hope without lying; people feel a bit better about themselves |
| Empathy | fear, grief, kindness, being seen |
| Ethics / values / philosophy | promises, fairness, what a good life is |
| AI comfort | jobs, “will I be replaced”, the world flipping, staying human |
| Education | how people think, practice, assessment — **at most 2 posts/day** |

Big AI news is fine **if** the reply is comfort, care, ethics, or a human take — not another “process vs final sheet” essay.

### Content lanes (one per draft)
self-awareness · psychology · care · optimism · positivity · ethics · philosophy · empathy · ai-comfort · education (rare)

Tag `quality.shape` or `label` with the lane. Two originals in one pack = **two different lanes**.

### Voice (anti-pattern - mandatory)
Read `data/gargeya-voice.md` first. Humans do **not** reply in patterns.

- **No shape menu.** Do not pick from twist / bridge / mechanism / land. Think, then type.  
- **No shared spine** across the two replies (same opener family, same paragraph count + moral ending = fail; rewrite one cold).  
- **Banned house essay (even if “smart”):**  
  - both replies open with `yeah`  
  - both are exactly 3 short paragraphs  
  - `…is the whole argument` / `…is the part that…`  
  - antithesis lands: `X isn't Y. it's Z.` / `that's not A. that's B.` used as default closer  
- **Form must differ:** one draft can be 1 block; another 2 lines; another a soft hedge then a hard take. Length follows the thought.  
- Energy: **raw opinion**, polite, transparent, humble, a little biased, driven/passionate.  
- **No em-dash (`—`)** anywhere in draft bodies. Use period, comma, colon, or rewrite.  
- **Capitalize sentences** (first letter of each sentence). Not all-lowercase chat. Clean enough that phone keyboards would not need to fix them.  
- Not paraphrase. Not brand template. Not LinkedIn. Not a polished content pack that rhymes with last hour.  
- `score-x-drafts.mjs` auto-fails post-like replies, twin structure, banned stamps, em-dashes, and bad sentence caps.  
- **Originals:** independent, **generalized** (principle/practice/noticing). Never invent personal diary scenes ("Last night I…", fake teammate/cousin). He will share real personal stories himself. Never mashup of the two replies.

### Replies: opinion under their roof (mandatory)
- Fetch one real source; `meta` = status URL.  
- Say what you actually think about **their** post.  
- Length follows the thought (short is fine; forced 3-beat essays are not).  
- If it only works as a polished standalone blog post with zero “you/this/yeah” contact → rewrite.

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

## Research workflow (per 2h run)
1. Confirm IST hour is **10–11** or **18–19**. Else **exit** (`not a sitting — skip`).  
2. Read weekly strategy (which **parts of him** today).  
3. `createRunPackId()`.  
4. Search large climbing rooms: AI comfort, psych, care, ethics, plus some AI news.  
5. Keep **2 reply targets**. Education-coded at most 1.  
6. Draft **2 replies** (strategy + grounding + first pass).  
7. Draft **2 small own tweets**, two different parts.  
8. **ADVERSARY PASS (mandatory):** put on the hat in `data/x-adversary-writer.md`. Rewrite every draft so a stranger feels something in one second. Especially originals. Attach `quality.adversary` on each. Then score ≥90.  
9. Validate → merge. Do **not** validate before the adversary rewrite.

## Pack shape checklist
- replies: **2**  
- small originals: **2** (two lanes)  
- education items in pack: **0 or 1**  
- quote: 0 default  
- mvpDraftIds: all four  
- skipList: stale, mixed-source, tickers, politics, follow-me, empty hype  

## Output
1. First drafts in `data/x-pack-today.json`  
2. Adversary rewrite (see `data/x-adversary-writer.md`) — same file, better bodies + `quality.adversary`  
3. `node scripts/validate-x-pack.mjs data/x-pack-today.json`  
4. `node scripts/merge-x-pack.mjs data/x-pack-today.json`  

## Chat status
pack id · 2 replies + 2 small tweets · **parts used** · first lines · scores · cloud
