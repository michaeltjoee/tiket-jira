# Sprint ledger cache Resources

## Knowledge

- [TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
  Official rule: a key uniquely identifies cached data; variables the query function depends on belong in the key. Use for: why `["sprint-board", id]` is a family and `["sprint-board-meta"]` is a singleton.
- [TanStack Query: Disabling/Pausing Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries)
  `enabled: false` still _observes_ cached data; it does not auto-fetch. Use for: why meta has a `queryFn` that throws and is never run.
- [TanStack Query: Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
  Prefix matching: `queryKey: ['todos']` matches `['todos', 1]`. Use for: `pruneSprintBoardQueries` / `resetQueries` against `SPRINT_BOARD_QUERY_KEY`.
- [TanStack Query: persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient)
  Restore is async; `buster` discards snapshots that don’t match; `useIsRestoring` avoids fetch-during-hydrate races. Use for: `QueryProvider` and why the board query waits on restore.
- [TkDodo: Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
  Keys from generic → specific; factories; prefix invalidation. Use for: `SPRINT_BOARD_QUERY_KEY` + `sprintBoardQueryKey(id)` as a small factory.
- [TkDodo: Seeding the Query Cache](https://tkdodo.eu/blog/seeding-the-query-cache)
  `setQueryData` writes a cache entry the next `useQuery` can hit. Use for: aliasing `["sprint-board", number]` after an `"active"` fetch.
- Repo: [`lib/query/sprint-board.md`](../lib/query/sprint-board.md)
  In-tree contract for the two caches. Use for: the intended split, in the same words the code comments use.

## Wisdom (Communities)

- [TanStack Query GitHub Discussions](https://github.com/TanStack/query/discussions)
  High-signal answers from maintainers (including TkDodo). Use for: persist + `enabled: false` edge cases that docs don’t spell out for this app.
- [TkDodo’s React Query series](https://tkdodo.eu/blog/practical-react-query)
  The de facto practitioner canon. Use for: “is this a second store, or just QueryClient?”

## Gaps

- No primary source in this repo for _why_ `"active"` stays as a live key after `activeNumber` is known — the code comments say the hook could switch to numeric keys and currently does not. Treat that as an implementation choice, not a TanStack requirement.
