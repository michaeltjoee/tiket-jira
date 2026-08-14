# Mission: Sprint ledger data layer

## Why

You maintain this sprint ledger. Changing how boards are fetched or cached without a clear mental model either hits Jira again on every sprint switch, or lets an older sprint rewrite the picker. The goal is to change `lib/query/` with intent — not by guessing what the two query keys are for.

## Success looks like

- Trace a `/sprint` load from URL → React Query → `/api/sprint-board` → Jira → QueryClient without looking the path up.
- Predict, before running the app, what `SPRINT_BOARD_QUERY_KEY` vs `SPRINT_BOARD_META_QUERY_KEY` hold after a first fetch and after switching sprints.
- Know when a navigation will hit memory vs hit the network, and when Refresh is the only way to reseeds meta.

## Constraints

- Teaching is grounded in this repo’s code, plus TanStack Query’s own docs for cache/key behavior.
- Lessons stay short; persist-buster and prune details wait until the two-key split is solid.

## Out of scope

- Jira JQL / field mapping inside `lib/services/server/jira` (how a board _body_ is built).
- Visual design of the ledger table.
- General TanStack Query beyond what this cache split uses.
