# Sprint ledger cache

Callers use `useSprintBoard` and `createSprintBoardPersistAdapter` from `lib/query/useSprintBoard.ts`. The HTTP fetcher is `fetchSprintBoardFromHttp` in `lib/services/sprintBoard`. Params, function type, and `SprintBoardData` live in that folder's `types.ts` and are re-exported from `index.ts`.

One persisted React Query document (`["sprint-board"]`): picker + board bodies. Persist (`sprint-board:v1`) is a snapshot of that document, not a second store. The UI always reads the in-memory QueryClient.

In-flight fetches use `["sprint-board-fetch", id]` and are not dehydrated.

## Picker

Seeded by the first network fetch. `activeNumber` is which sprint “Active sprint” means. `recentSprints` is the dropdown — active and future only, never numbers below active.

Later board fetches do not overwrite the picker. Refresh wipes the document so the next fetch reseeds it.

`useSprintBoard` overlays picker `recentSprints` onto the viewed board so callers still see one `SprintBoardData`.

## Boards

Keyed by sprint number. A miss (viewed number not in the map) shows the loader even if another board is cached. Coming back to a cached number hits memory. The map is pruned to 5, oldest `fetchedAt` first.

`?sprint=40` still loads sprint 40. The picker does not list it.

## Changing the document shape

Bump `SPRINT_BOARD_PERSIST_BUSTER` in `sprint-board.ts`. Persist does not inspect JSON; a mismatch is the only way old `localStorage` is discarded. See `.cursor/rules/sprint-board-persist.mdc`.
