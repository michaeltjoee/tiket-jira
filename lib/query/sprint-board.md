# `sprint-board` vs `sprint-board-meta`

Two React Query caches, both dehydrated to `localStorage` (`sprint-board:v1`). The UI always reads the in-memory QueryClient; persist is a snapshot of that cache.

## `sprint-board` — the board body

Query key: `["sprint-board", id]` where `id` is `"active"` or a sprint number.

Holds `SprintBoardData`: the sprint currently on screen, parents, effort, timestamps. Fetched from `/api/sprint-board` (optional `?sprint=`).

There can be several of these (capped at `MAX_CACHED_BOARDS`). Switching sprints swaps which board query is observed; the picker must not come from this payload, or an older sprint would rewrite “what is active” and the dropdown.

`"active"` is only a bootstrap key: on `/sprint` with no `?sprint=`, the number is unknown until the response returns. `cacheSprintBoardResponse` then aliases the same payload onto `["sprint-board", number]` so later numeric navigation hits memory.

## `sprint-board-meta` — stable picker state

Query key: `["sprint-board-meta"]` (singleton).

Holds `SprintBoardMeta`: `activeNumber` (which sprint the “Active sprint” option means) and `recentSprints` (the dropdown).

Not fetched on its own (`enabled: false` in `useSprintBoard`). The first successful board response seeds it; later board fetches do not overwrite it. `useSprintBoard` overlays `meta.recentSprints` onto the current board so the picker stays put while the board body changes.

Hard refresh (`clearPersistedSprintBoard`) removes meta so the next fetch can write a fresh `activeNumber` / `recentSprints`.

## Changing either shape

Bump `SPRINT_BOARD_PERSIST_BUSTER` in `client.ts`. Persist does not inspect JSON; a mismatch is the only way old `localStorage` is discarded. See `.cursor/rules/sprint-board-persist.mdc`.
