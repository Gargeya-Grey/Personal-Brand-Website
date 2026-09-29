# X growth strategy evidence memo

Reviewed 29 September 2026. Scope: the owner-only Editorial Growth Strategy. Primary sources below were checked on this date. Repository links track `main`; this is a dated reading of published material, not an independent audit of X production or Gargeya's account analytics.

## Findings

1. **Relevance is personal.** X describes recommendations using interests, follows and engagement. Its published For You system retrieves both followed and unfamiliar authors and predicts each viewer's response. **Inference:** a recognizable perspective about learning, judgment and building with AI can help the right people recognize why they should return. The sources do not prove a fixed niche or posting streak receives a bonus. [X recommendations](https://help.x.com/en/rules-and-policies/recommendations), [algorithm overview](https://github.com/xai-org/x-algorithm#overview).

2. **Weights are published, but they are not engagement exchange rates.** The 13 August 2026 release added ranking parameters; the 14 August update clarified their interpretation. Current code includes weights for predicted replies, shares, follows, attention and negative feedback. These multiply viewer-specific predictions, not raw counts: collecting ten likes cannot be translated into a guaranteed score or reach increase. Do not reuse 2023 multiplier folklore as current guidance. [release notes](https://github.com/xai-org/x-algorithm#notable-updates), [parameters and explanatory comments](https://github.com/xai-org/x-algorithm/blob/main/home-mixer/params/param.rs), [scoring implementation](https://github.com/xai-org/x-algorithm/blob/main/xai-value-model/scoring.rs).

3. **Replies and original posts have different discovery paths.** X's Conversations documentation describes personalized reply ranking, including relationships, author responses, verification and predicted engagement. The published For You pipeline includes a filter removing replies/reposts from authors the viewer does not follow. **Recommendation:** useful replies can introduce Gargeya to readers already in a relevant conversation; originals give those readers a reason to follow. This is not evidence that every reply gets amplified into strangers' feeds. [Conversations](https://help.x.com/en/resources/recommender-systems/conversations-recommendations), [reply filter](https://github.com/xai-org/x-algorithm/blob/main/home-mixer/filters/oon_retweet_reply_filter.rs), [pipeline wiring](https://github.com/xai-org/x-algorithm/blob/main/home-mixer/candidate_pipeline/phoenix_candidate_pipeline.rs).

4. **Contribution is compatible with the rules; manufactured popularity is not.** X prohibits irrelevant promotional replies, duplicative bulk content and coordinated engagement exchanges. Recommendation eligibility can also exclude spammy accounts. **Recommendation:** read the source, add a concrete distinction or example, and respond to the person. A small relevant conversation can be more valuable than a large unrelated one. [Authenticity policy, April 2025](https://help.x.com/en/rules-and-policies/authenticity), [recommendation eligibility](https://help.x.com/en/rules-and-policies/recommendations).

5. **The public code is evidence with limits.** X says scheduled updates copy primary production defaults into the repository, while experiments and some unpublished safety components remain. The latest dated README note is 18 September 2026. We cannot establish every viewer's live configuration from this repository. Broad Help Center statements about signals should not override the newer code's explicit scoring parameters. [configuration and omissions](https://github.com/xai-org/x-algorithm#experiments-and-configuration).

6. **The routine is a human constraint, not an algorithm optimum.** None of these sources establishes one original, 3–5 replies, a universal posting time, a blanket link penalty or guaranteed follower growth. Keep the existing two sittings because they make participation sustainable. Concrete build evidence and honest uncertainty are editorial recommendations for earning trust; they are not documented ranking bonuses. [published scoring and configuration](https://github.com/xai-org/x-algorithm#scoring-and-ranking), [Conversations system overview](https://help.x.com/en/resources/recommender-systems/conversations-recommendations).

## Audit of the previous strategy

The 21 August version in `lib/x-growth-strategy.ts` has a sound center: human capability, education as the starting point, source-grounded replies, Edudojo proof and a bounded routine. Retain these. Its many overlapping cadences, rules and checklists make daily writing harder than necessary. Mandatory questions/actions can turn observations into formulaic engagement prompts. Rejecting every small thread confuses audience size with relevance. Profile-photo prescriptions distract from the writing decision.

## Recommended owner-facing strategy

Use one question: **How do we become more capable, and recognize real capability, when AI can produce the work?** Learning is the starting point; Edudojo and personal building supply evidence. Judgment and work are connected examples, not separate identities.

When stuck, spend five minutes answering: What did I actually see or try? What looked impressive but concealed a gap? What choice required judgment? What changed my mind? Write one observation, what it suggests, and one useful implication. Label hypotheses; never invent a student, result or customer.

Keep one strong original and 3–5 relevant replies across 11:30 and 19:00 IST. Twice weekly, make the original concrete with a real artifact, tradeoff or failed experiment. Hold a weak post. Review meaningful conversations and returning relevant people weekly; use available reach/follow data as context, not proof of causation. Evaluate patterns over several weeks before changing the thesis.

No account-level analytics or controlled growth experiment was reviewed. The strategy is a testable editorial direction, not a performance forecast.

## Implementation and verification

The private `/editorial?workspace=strategy` guide now has about 400 visible words, three selectable writing prompts, a four-question exercise, and the existing two-sitting routine. Source notes expand on demand. The scout brief and automated schedule are unchanged.

| Before | After | Why |
| --- | --- | --- |
| Several overlapping plans and checklists | One thesis, a writing exercise, and one routine | Make the next writing decision easy |
| Mandatory questions and blanket rejection of small threads | Complete thoughts and relevant conversations | Encourage honest contribution |
| Long static reference material | Optional source notes and selectable prompts | Keep the daily guide short on a phone |

- PASS: production build, TypeScript, targeted ESLint, and diff whitespace checks.
- PASS: browser checks at 320, 390, 768, and 1440 px; light and dark themes at 390 and 1440 px; no horizontal overflow or browser errors.
- PASS: all writing prompts, second-tap deselection, saved sitting checks, previous-day and open-page IST midnight reset, corrupt-storage recovery, and expandable sources.
- PASS: visual inspection of mobile and desktop screenshots. Verification scripts, results, and screenshots remain in the ignored `.tmp-article-audit/x-strategy*` paths. The simulated clock was installed before loading the page so its interval was tracked correctly.
