import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const SPRINT_BOARD_PERSIST_KEY = "sprint-board:v1";
/**
 * Persist-client cache stamp. Stored next to the localStorage snapshot; on restore,
 * a mismatch discards the snapshot and the board is fetched fresh. React Query does
 * not inspect JSON shape — bump this yourself or old localStorage hydrates as-is.
 *
 * Procedure when changing persisted sprint data (`SprintRef`, `SprintBoardData`,
 * `SprintBoardMeta`), query keys, or `shouldDehydrateSprintBoardQuery`:
 * 1. Make the type / key / dehydrate change.
 * 2. Bump this string (`"v2"` → `"v3"`). Do not rename `SPRINT_BOARD_PERSIST_KEY`
 *    unless you intend to orphan the old storage slot.
 * 3. Skip this bump for UI-only changes (layout, copy, how the same payload is read).
 *
 * Separate from `SPRINT_BOARD_PERSIST_KEY` (the storage slot) and `maxAge` (snapshot age).
 */
export const SPRINT_BOARD_PERSIST_BUSTER = "v2";

export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
};

/** Saves the sprint-board React Query cache to localStorage so it survives reloads. No-ops during SSR (no window). */
export const createSprintBoardPersister = () =>
  createAsyncStoragePersister({
    storage: typeof window === "undefined" ? undefined : window.localStorage,
    key: SPRINT_BOARD_PERSIST_KEY,
  });
