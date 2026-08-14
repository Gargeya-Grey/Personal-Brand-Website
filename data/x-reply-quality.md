# X draft quality gate (pass ≥ 90)

Companion to `data/gargeya-voice.md` + `data/x-scout-playbook.md`.

**Purpose:** Only ship drafts that feel like a **creative writer** — one feeling, sentences that hold together, easy and a little fun, a click in the reader’s head. Not “good enough AI.” Not a telegram of punches.  
Every **reply**, **quote**, and **original** in a pack must be scored **0–100**. **Pass bar: total ≥ 90.** Below 90 → rewrite or drop the candidate. Never merge a failing draft.

This is an **agentic loop** (draft → score → rewrite until ≥90 or abandon), not a one-shot generate.

---

## Pipeline

```
source fetch (grounding)
    → first draft (strategy + room + part of him)
    → ADVERSARY creative writer (data/x-adversary-writer.md)
         rewrite for easy / felt / relatable / instant tap
         attach quality.adversary { passed, click, change }
    → score vs rubric (all dimensions) ≥ 90
    → validate-x-pack (enforces score + adversary block + choppy/slogan floors)
    → merge-x-pack
```

Scouts **must** write the score honestly. Inflating scores is a system failure — `scripts/score-x-drafts.mjs` still fails sludge, monotony, **post-like replies**, **choppy telegram**, **writer-tweet slogans**, twin essays, house stamps, and empty hooks.

---

## Reply ≠ post (hard split — see voice file)

| | **Reply / quote** | **Original (short / flagship)** |
|--|-------------------|----------------------------------|
| **Job** | Talk *to* OP + add **your take** under their roof | Standalone story that attaches |
| **Voice** | Conversational, personal, additive | Story arc, hook, cross-domain if earned |
| **Fails if** | Paraphrase-only echo of OP **or** post-like thesis | Slogan stack / no story / pack mashup |
| **Auto gate** | `score-x-drafts.mjs` fails post-like replies | Soft: not reply-shaped only |

### How to score replies for this

- **voiceMatch / relatability / humanTexture** = conversational + **opinionated** + **earnest**. For education replies, the owner bar is inspired (spirit of learning, courage, hunger), not a cold clip.  
- Paraphrase of OP’s best line with “so true” → **cap voiceMatch ≤ 7**, **funRead ≤ 6** until rewritten.  
- Polished standalone thesis with no “you/yeah/this” room energy → **cap voiceMatch ≤ 8**, **humanTexture ≤ 6**.  
- Prefer: whatever he actually thinks — raw, polite, biased, passionate — over any shape menu.  
- **Hard fail energy:** “haha this lands hard” + restate OP + forced final-sheet/grade/cheater parallel. Cap **voiceMatch ≤ 5** until rewritten. That is fake Gargeya.  
- **Pattern fail:** if both replies share the same structure (same opener family + same beat count + same moral land), cap **humanTexture ≤ 6** and rewrite one from the gut.  
- **House essay fail:** `yeah … whole argument` + tidy 3 paragraphs + `isn't/it's` or `that's not/that's` closer → cap **voiceMatch ≤ 6**, **humanTexture ≤ 5** until form is broken.  
- **Twin yeah-open fail:** both replies start with `yeah` → hard monotony rewrite.

### Agent self-check (replies)
1. Is there a **take OP did not already say**? If no → rewrite.  
2. Does the **first paragraph retell their post**? If yes → delete it and start from the feeling.  
3. Does it sound proud of being smart (“I would score this as…”, “the skill hiding in…”)? → rewrite like a person.  
4. Does it still sound like you’re **in their thread** (not a blog dump)?  
5. Would this work as his original with zero edits? → fail reply shape.  
6. Read out loud: robotic / corporate / **fake clever** / **templated**? → rewrite.  
6b. Writer-tweet? `The X is the Y part.` / a lone `Fine.` → rewrite.  
6c. Choppy telegram? Three short full-stop sentences that do not hold together → glue them.  
6d. Did the **adversary writer** run? `quality.adversary` present, `passed: true`, a real `click`, and a `change` note? If the line is still clever-hard, they did not do the job.  
7. Is this reply **not** about education, assessment, cognitive development, or offloading? → **hard fail.** Drop the room. Do not write a sweet life comment.  
7b. Did you force **school slogans** under a non-education post? You should not be under that post.  
7c. We shipped `Yeah go do your evening shift` at 94. That is a persona fail, not a pass.  
8. Could someone guess this was “draft 1 of a system”? → rewrite until it sounds like a one-off thought.  
9. Any **em-dash (`—`)**? → remove/rewrite.  
10. Does every sentence start with a **capital letter**? If not → fix.

### Originals self-check
1. Independent of today’s replies?  
2. One of **his parts** from the weekly file (not random, not a third education)?  
3. **Creative writer:** flow + click test. Not chopped punches.  
4. **Generalized** (no invented diary)? Real personal stories are owner-only.  
5. No em-dash; sentence caps.  
6. Would he post this without cringing?

### Strategy self-check (every draft)
1. Creative writer: one feeling, flow, click test? If chopped or cold → rewrite.  
2. **Reply?** Must be education / assessment / cognitive / offloading. **Original?** One of the other parts.  
3. Big **on-thesis** room for replies. No sports-admin. No follow-beg. No scatter.

---

## Dimensions (100 points)

Score each dimension, then **sum**. Do not average then multiply — use the point caps below.

| Key | Max | What “high” looks like |
|-----|-----|-------------------------|
| **lengthFit** | 12 | Right size for the room. Micro when a nod is enough; short when a take is enough; long only if the source earns it. Not a wall of text for a thin post. Not a one-word “nice” on a deep thesis. |
| **clarity** | 15 | One clear idea. Easy to parse once. No fog, no stacked abstractions, no “as an AI / in today’s landscape.” |
| **hook** | 15 | First line earns the next. Stops the scroll in a thread. Not a throat-clear (“I think it’s interesting that…”). **Replies:** hook is reactive (responds to OP), not a cold headline. |
| **funRead** | 12 | Easy, a little fun, they want to stay. Rhythm that holds together. Not three chopped punches. Not forced jokes. |
| **relatability** | 15 | Inclusive. A stranger can see themselves. “Yeah that’s me.” Not abstract essay-speak. **Replies:** in *their* room. |
| **voiceMatch** | 15 | Sounds like @GargeyaS the **creative writer** (voice file). Flow + feeling. Replies still sound like replies. |
| **humanTexture** | 12 | Emotion coming out as text. Warmth, bluntness, small imperfection. Not sterile parallel AI prose. |
| **groundingFit** | 4 | Reply/QT: only claims supportable from the source. Original: no fake citations. |

**Total = sum of the eight.** Cap each at its max. **Pass if total ≥ 90** *and* structural floors pass (including reply≠post).

### Optional bonus (does not break 100)
If a natural pun, twist, or memorable line exists, put that energy into **funRead** / **humanTexture** — do not add a 9th number past 100.

---

## Mode targets (same bar, different distribution)

A **90+ micro** and a **90+ thesis** look different:

| Mode | Length fit | Hook | Texture |
|------|------------|------|---------|
| Micro | 1–2 lines that land | First (only) line is the hit | Warm or dry |
| Blunt tech | Short, sharp | Frustration / reality check up front | Practical, no fluff |
| Values jab | 1–3 sentences | Names the missing skill/value early | Sincere, clear |
| System-failure | Calm blame on system | “wiggly” / system lag energy | Fair, not rant |
| Funny / light | Doesn’t lecture | Surprise or reframe | Wit without cruelty |
| Emotional / warm | Soft open OK | Human glue first | Kind, bold |
| Serious thesis | Earned length | Still hooks line 1 | Human, not whitepaper |
| **Original (short/flagship)** | Enough meat to teach or move (not a thin one-liner) | Line 1 earns a save | **Soul required** — see below |

**Variety rule still holds:** pack of 3 must use ≥2 shapes. Monotone 92s that all open the same way → fail pack-level monotony check.

---

## Originals — extra bar (kind short / flagship)

Replies can be short and sharp. **Originals must feel follow-worthy — and storyteller-first.**

Write as a **short story with a point**: cohesive arc, plain language, relatable scene, pull to finish every line.  
Not slogan stacks, not abstract AI takes, not a one-line punch with no middle.

Honestly fail total **under 90** (or rewrite) if any of these are true:

1. **Pack mashup** — the post only exists as a blend of today’s two reply topics  
2. **No standalone insight** — remove the pack context and nothing valuable remains  
3. **No soul** — clever but cold; no recognition, hope, urgency, or care for learners  
4. **Not finishable** — hard to follow, no pull; reader bounces mid-post  
5. **No story arc** — disconnected claims / bullets with no beginning–middle–end  
6. **Not relatable** — pure abstraction, no human scene or lived moment  
7. **No attachment** — reader never feels “that’s me / I agree rising”  
8. **No comment-seed** — nothing that makes a reader form their own line while reading  
9. **Not save-worthy** — no teacher/student/builder would bookmark it  
10. **Vague fog** — “AI is changing education” with no story turn  

`quality.notes` for originals **must** include: (a) independent insight, (b) **story hook/scene**, (c) why someone would **finish**, **agree/like**, and maybe **comment**.

Score **funRead / relatability / humanTexture / clarity** harder on originals — a 91 that is a dry bullet thesis or unreadable abstraction is dishonest.

---

## How to score (agent method)

1. Read body out loud (mentally).  
2. Mark each dimension 0–max with a one-phrase reason.  
3. Sum.  
4. If **any** dimension is ≤ half its max (e.g. hook ≤ 7, clarity ≤ 7), total rarely reaches 90 honestly — rewrite that weakness.  
5. If total 85–89: usually one weak line — cut, punch the open, or add one concrete image.  
6. If total < 85: full rewrite or new source.  
7. Write `quality` on the draft (schema below).

### Reply vs post test (before you finalize a reply)

- Ask: does this read like **someone replying to *this* post**, or like a standalone post that happens to sit under it?
- Self-check: **delete the source mentally.** If the reply still reads perfectly — that's a red flag. Replies should sound conversational and second-person (`you`, `this`, `yeah`, `love this framing`) and pick up OP's words. Posts sound thesis-y and self-contained.
- For replies scoring **humanTexture / relatability**, be stricter: a post-like cadence can't be 11–12 on those, even if the idea is good.

### Honesty bar
- 95–100: you would post this as your best self that hour  
- 90–94: strong, ship it  
- 80–89: almost — do not ship  
- <80: reject  

Do not invent 93 because the schedule is due. Skip the pack item instead.

---

## Pack schema (`quality` on each draft)

```json
"quality": {
  "total": 93,
  "shape": "values_jab",
  "dimensions": {
    "lengthFit": 11,
    "clarity": 14,
    "hook": 14,
    "funRead": 10,
    "relatability": 14,
    "voiceMatch": 14,
    "humanTexture": 11,
    "groundingFit": 5
  },
  "notes": "Punchy open on scarce skills; cut product bridge; one human cadence snag.",
  "attempts": 2
}
```

- `total` must equal sum of dimensions (validator checks ±1).  
- `shape` from voice palette.  
- `notes` required (what made it pass).  
- `attempts` optional (rewrite count).

---

## Structural floors (auto-fail even if total claims ≥90)

Enforced in `scripts/score-x-drafts.mjs` / `validate-x-pack.mjs`:

1. Missing or incomplete `quality` object  
2. `total` < 90  
3. Dimension sum ≠ total (beyond rounding)  
4. Body empty or whitespace  
5. AI sludge phrases (“here are 3 takeaways”, “let’s dive in”, “game-changer”, “in today’s landscape”, …)  
6. Same opener prefix as another draft in the pack (first 40 chars)  
7. Reply/quote without status URL  
8. Meta is object (must be URL string)  
9. Forced “You're absolutely right — but” on **both** replies  
10. **Post-like reply** — long/formal body without conversational reply markers (`you` / `yeah` / `this` / reactive openers); see `looksLikeStandalonePost`  
11. **Reply wall** — more than ~4 short paragraphs or extreme length in a thread reply  

---

## Rewrite recipes (when score < 90)

| Weak | Fix |
|------|-----|
| Hook low | Kill first sentence; start mid-thought |
| Clarity low | One claim only; delete second idea |
| Length wrong | Cut half, or add one concrete example |
| Fun/relatable low | Swap abstract noun for a real scene (marks, final sheet, Cursor bill) |
| Voice low | Read voice file examples; add one imperfect cadence |
| Texture low | One dry punch or human aside — not emoji wall |
| Grounding low | Delete unearned names/numbers; re-fetch source |
| **Post-like reply** | Second-person; open with `yeah` / `haha` / OP’s phrase; kill standalone headline |
| **Reply wall** | ≤3 short beats; only the lines that answer *them* |

---

## Scout checklist (before merge)

- [ ] All drafts have `quality.total` ≥ 90  
- [ ] Dimensions filled and sum matches  
- [ ] ≥2 shapes in the pack  
- [ ] Grounding + evidence OK  
- [ ] No sludge / monotony auto-fails  
- [ ] **Replies sound like replies** (not standalone posts)  
- [ ] **Originals standalone** (not pure “yeah this is so true”)  
- [ ] You would post each body as Gargeya without cringe  

---

## Last updated
2026-08-05 — initial quality gate (pass ≥ 90).
