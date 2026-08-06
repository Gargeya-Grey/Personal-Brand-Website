# X draft quality gate (pass ≥ 90)

Companion to `data/gargeya-voice.md` + `data/x-scout-playbook.md`.

**Purpose:** Only ship drafts that feel **brilliant and human** — not “good enough AI.”  
Every **reply**, **quote**, and **original** in a pack must be scored **0–100**. **Pass bar: total ≥ 90.** Below 90 → rewrite or drop the candidate. Never merge a failing draft.

This is an **agentic loop** (draft → score → rewrite until ≥90 or abandon), not a one-shot generate.

---

## Pipeline

```
source fetch (grounding)
    → draft body (voice + Venn + shape palette)
    → score vs rubric (all dimensions)
    → if total < 90: rewrite (max 3 attempts) or pick new source
    → if total ≥ 90: attach quality{} on draft
    → validate-x-pack (enforces score + structural floors)
    → merge-x-pack
```

Scouts **must** write the score honestly. Inflating scores is a system failure — structural heuristics in `scripts/score-x-drafts.mjs` will still fail sludge, monotony, and empty hooks.

---

## Dimensions (100 points)

Score each dimension, then **sum**. Do not average then multiply — use the point caps below.

| Key | Max | What “high” looks like |
|-----|-----|-------------------------|
| **lengthFit** | 12 | Right size for the room. Micro when a nod is enough; short when a take is enough; long only if the source earns it. Not a wall of text for a thin post. Not a one-word “nice” on a deep thesis. |
| **clarity** | 15 | One clear idea. Easy to parse once. No fog, no stacked abstractions, no “as an AI / in today’s landscape.” |
| **hook** | 15 | First line earns the next. Stops the scroll in a thread. Not a throat-clear (“I think it’s interesting that…”). |
| **funRead** | 12 | Pleasant to read — rhythm, surprise, light wit, or a clean punch. “Fun” ≠ forced jokes. Serious can score high if it’s vivid and sharp. |
| **relatability** | 15 | Feels like a person who gets the room. Concrete, lived, “yeah that’s real.” Not abstract essay-speak. |
| **voiceMatch** | 15 | Sounds like @GargeyaS (voice file): imperfect English OK, values spine, Venn angle, **not** ghostwriter LinkedIn. Matches chosen **shape** (blunt / values jab / micro / etc.). |
| **humanTexture** | 12 | Human signals: warmth, bluntness, emotion, dry humor, small imperfection, optional light pun **if natural**. Not sterile parallel AI prose. Not emoji spam. |
| **groundingFit** | 4 | Reply/QT: only claims supportable from the source. Original: no fake citations. |

**Total = sum of the eight.** Cap each at its max. **Pass if total ≥ 90.**

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

Replies can be short and sharp. **Originals must feel follow-worthy.**

Honestly fail total **under 90** (or rewrite) if any of these are true:

1. **Pack mashup** — the post only exists as a blend of today’s two reply topics  
2. **No standalone insight** — remove the pack context and nothing valuable remains  
3. **No soul** — clever but cold; no recognition, hope, urgency, or care for learners  
4. **Not save-worthy** — no teacher/student/builder would bookmark it  
5. **Vague fog** — “AI is changing education” with no concrete turn  

`quality.notes` for originals **must** include: (a) independent insight, (b) why someone might bookmark/RT/comment.

Score **funRead / relatability / humanTexture** harder on originals — a 91 with flat emotion is dishonest; aim for real pulse.

---

## How to score (agent method)

1. Read body out loud (mentally).  
2. Mark each dimension 0–max with a one-phrase reason.  
3. Sum.  
4. If **any** dimension is ≤ half its max (e.g. hook ≤ 7, clarity ≤ 7), total rarely reaches 90 honestly — rewrite that weakness.  
5. If total 85–89: usually one weak line — cut, punch the open, or add one concrete image.  
6. If total < 85: full rewrite or new source.  
7. Write `quality` on the draft (schema below).

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

---

## Scout checklist (before merge)

- [ ] All drafts have `quality.total` ≥ 90  
- [ ] Dimensions filled and sum matches  
- [ ] ≥2 shapes in the pack  
- [ ] Grounding + evidence OK  
- [ ] No sludge / monotony auto-fails  
- [ ] You would post each body as Gargeya without cringe  

---

## Last updated
2026-08-05 — initial quality gate (pass ≥ 90).
