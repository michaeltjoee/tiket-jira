import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

import type { SprintRef } from "@/lib/jira/types";
import type { SprintBoardData } from "@/lib/services/sprintBoard";

export const MAX_CACHED_BOARDS = 5;

/** Single persisted document: picker + board bodies. See `./sprint-board.md`. */
export const SPRINT_BOARD_QUERY_KEY = ["sprint-board"] as const;

/** In-flight fetch observer. Not persisted. */
export const SPRINT_BOARD_FETCH_QUERY_KEY = ["sprint-board-fetch"] as const;

export const sprintBoardFetchQueryKey = (id: number | "active") =>
  [...SPRINT_BOARD_FETCH_QUERY_KEY, id] as const;

export const SPRINT_BOARD_PERSIST_KEY = "sprint-board:v1";
/**
 * Persist-client cache stamp. Stored next to the localStorage snapshot; on restore,
 * a mismatch discards the snapshot and the board is fetched fresh. React Query does
 * not inspect JSON — bump this yourself or old localStorage hydrates as-is.
 *
 * Procedure when changing the sprint ledger cache document, `SprintRef`,
 * `SprintBoardData`, query keys, or `shouldDehydrateSprintBoardQuery`:
 * 1. Make the type / key / dehydrate change.
 * 2. Bump this string (`"v3"` → `"v4"`). Do not rename `SPRINT_BOARD_PERSIST_KEY`
 *    unless you intend to orphan the old storage slot.
 * 3. Skip this bump for UI-only changes (layout, copy, how the same payload is read).
 */
export const SPRINT_BOARD_PERSIST_BUSTER = "v3";

export type SprintBoardBody = Omit<SprintBoardData, "recentSprints">;

export type SprintBoardPicker = {
  activeNumber: number;
  recentSprints: SprintRef[];
};

export type SprintLedgerCache = {
  picker: SprintBoardPicker | null;
  boards: Record<string, SprintBoardBody>;
};

export const EMPTY_SPRINT_LEDGER_CACHE: SprintLedgerCache = {
  picker: null,
  boards: {},
};

const boardKey = (number: number) => String(number);

const pruneBoards = (
  boards: Record<string, SprintBoardBody>,
  keepKey: string,
) => {
  const keys = Object.keys(boards);
  const extra = keys.length - MAX_CACHED_BOARDS;
  if (extra <= 0) return;

  const oldest = keys
    .filter((key) => key !== keepKey)
    .toSorted(
      (a, b) =>
        Date.parse(boards[a]?.fetchedAt ?? "") -
        Date.parse(boards[b]?.fetchedAt ?? ""),
    );

  for (let i = 0; i < extra; i += 1) {
    const key = oldest[i];
    if (key) delete boards[key];
  }
};

export const mergeSprintLedgerCache = (
  cache: SprintLedgerCache,
  data: SprintBoardData,
): SprintLedgerCache => {
  const { recentSprints, ...body } = data;
  const keepKey = boardKey(body.sprint.number);
  const boards = { ...cache.boards, [keepKey]: body };
  pruneBoards(boards, keepKey);

  if (cache.picker) {
    return { picker: cache.picker, boards };
  }

  const activeNumber =
    recentSprints.find((sprint) => sprint.state === "active")?.number ??
    recentSprints[0]?.number ??
    body.sprint.number;

  return {
    picker: {
      activeNumber,
      recentSprints: recentSprints.filter(
        (sprint) => sprint.number >= activeNumber,
      ),
    },
    boards,
  };
};

/**
 * Write a fetched board into the persisted ledger query. Merges `data` into the
 * current cache (or empty) so the picker stays put and the new body is stored
 * under its sprint number, then pruned to `MAX_CACHED_BOARDS`.
 */
export const ingestSprintBoard = (
  queryClient: QueryClient,
  data: SprintBoardData,
) => {
  queryClient.setQueryData<SprintLedgerCache>(
    SPRINT_BOARD_QUERY_KEY,
    (current) =>
      mergeSprintLedgerCache(current ?? EMPTY_SPRINT_LEDGER_CACHE, data),
  );
};

export const viewedBoard = (
  cache: SprintLedgerCache | undefined,
  sprintNumber: number | undefined,
): SprintBoardBody | undefined => {
  if (!cache) return undefined;
  const wanted = sprintNumber ?? cache.picker?.activeNumber;
  if (wanted === undefined) return undefined;
  return cache.boards[boardKey(wanted)];
};

export const overlaySprintBoard = (
  cache: SprintLedgerCache | undefined,
  sprintNumber: number | undefined,
): SprintBoardData | undefined => {
  const board = viewedBoard(cache, sprintNumber);
  if (!board || !cache?.picker) return undefined;
  return {
    ...board,
    recentSprints: cache.picker.recentSprints,
  };
};

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

/**
 * Server: a new client per call so request caches never leak across users.
 * Browser: one module singleton so React remounts (Strict Mode, PersistQueryClientProvider)
 * keep the same in-memory cache instead of discarding it and rehydrating from localStorage.
 */
export const getQueryClient = () => {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
};

/**
 * Persist adapter for PersistQueryClientProvider: dehydrates the sprint ledger
 * into localStorage under `SPRINT_BOARD_PERSIST_KEY` and restores it on reload.
 * Storage is omitted on the server — `localStorage` is browser-only.
 */
const createSprintBoardPersister = () =>
  createAsyncStoragePersister({
    storage: typeof window === "undefined" ? undefined : window.localStorage,
    key: SPRINT_BOARD_PERSIST_KEY,
  });

export const shouldDehydrateSprintBoardQuery = (query: {
  queryKey: readonly unknown[];
  state: { status: string };
}): boolean => {
  if (query.state.status !== "success") return false;
  return (
    query.queryKey.length === 1 &&
    query.queryKey[0] === SPRINT_BOARD_QUERY_KEY[0]
  );
};

export const createSprintBoardPersistAdapter = () => {
  const queryClient = getQueryClient();
  return {
    queryClient,
    persistOptions: {
      persister: createSprintBoardPersister(),
      maxAge: Infinity,
      buster: SPRINT_BOARD_PERSIST_BUSTER,
      dehydrateOptions: {
        shouldDehydrateQuery: shouldDehydrateSprintBoardQuery,
      },
    },
  };
};

/**
 * Hard-refresh the ledger: cancel in-flight board fetches, drop the
 * localStorage snapshot, reset the in-memory query to empty, then fetch
 * and ingest so picker + boards are rebuilt from the network.
 */
export const refreshSprintLedgerCache = async (
  queryClient: QueryClient,
  fetchBoard: (sprintNumber?: number) => Promise<SprintBoardData>,
  sprintNumber?: number,
) => {
  await queryClient.cancelQueries({ queryKey: SPRINT_BOARD_FETCH_QUERY_KEY });
  try {
    localStorage.removeItem(SPRINT_BOARD_PERSIST_KEY);
  } catch {
    // private mode, quota, or disabled storage
  }
  queryClient.setQueryData(SPRINT_BOARD_QUERY_KEY, EMPTY_SPRINT_LEDGER_CACHE);
  const data = await fetchBoard(sprintNumber);
  ingestSprintBoard(queryClient, data);
};
