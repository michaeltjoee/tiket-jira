# Sphinx workbench

Personal PLAT workbench: sprint ledger, Jenkins jobs, and log links, gated by a session cookie.

## Language

**Sprint ledger**:
The Sphinx Story/Bug list for one sprint, assigned to Michael.
_Avoid_: board UI, ticket table

**Sprint ledger cache**:
The client store of the picker and of board bodies. Persist is a snapshot of this cache, not a second store.
_Avoid_: query cache, meta cache, localStorage cache

**Picker**:
Which sprint is active and which sprints can be chosen. Seeded once from the first network fetch; determined by the active sprint, not the board on screen. Never includes numbers below the active sprint. Refresh reseeds it.
_Avoid_: meta, sprint-board-meta, dropdown state

**Board**:
The ledger body for one sprint — parents, effort, timestamps. Does not carry picker fields.
_Avoid_: payload, sprint-board query

**Active sprint**:
The current Sphinx sprint on the configured Jira board.

**Refresh**:
Discard the sprint ledger cache and seed the picker again from Jira.
