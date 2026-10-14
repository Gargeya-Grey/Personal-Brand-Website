# X workspaces: To-Do, Lab, Growth Strategy

## Sub-features

- Workspace tabs: X To-Do, X Lab, Growth Strategy.
- X To-Do: the pack queue (morning t11 and evening t19 packs), each draft with its source, copy and open, mark posted or skipped.
- X Lab: connect state, refresh, summary metrics, posts, AI analyst chat.
- Growth Strategy: the owner's dashboard from `lib/x-growth-strategy.ts`: sittings, rooms, rules.

## How to get to it (user POV)

Sign in, press "X To-Do" in the private header, then switch with the workspace tabs.

## Driving it with the browser pane

1. `/editorial?workspace=x`: expect the latest local packs and their drafts. Expand one draft.
2. `/editorial?workspace=lab`: without X keys expect the not-connected state with its explanation.
3. `/editorial?workspace=strategy`: expect the sittings and the rules sections; use the section rail.

## Gotchas

- "Copy & open" opens the source post in a new tab; marking posted or skipped writes to the pack store. Do not press them during a visual check.
- Local packs older than two days are pruned on load; an empty queue can be a correct state.
