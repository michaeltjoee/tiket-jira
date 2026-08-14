import type { QueryClient } from "@tanstack/react-query";

import type { SprintBoardData, SprintBoardMeta } from "@/lib/jira/types";

import { SPRINT_BOARD_PERSIST_KEY } from "./client";

export const MAX_CACHED_BOARDS = 5;

/** Board body: `["sprint-board", id]` (`"active"` or a number). See `./sprint-board.md`. */
export const SPRINT_BOARD_QUERY_KEY = ["sprint-board"] as const;
/** Picker singleton: `activeNumber` + `recentSprints`. Seeded by board fetches, not fetched itself. See `./sprint-board.md`. */
export const SPRINT_BOARD_META_QUERY_KEY = ["sprint-board-meta"] as const;

export const sprintBoardQueryKey = (id: number | "active") =>
  [...SPRINT_BOARD_QUERY_KEY, id] as const;

type SprintBoardErrorBody = {
  error?: string;
};

export const fetchSprintBoard = async (
  sprintNumber?: number,
): Promise<SprintBoardData> => {
  const url =
    sprintNumber === undefined
      ? "/api/sprint-board"
      : `/api/sprint-board?sprint=${sprintNumber}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => ({}))) as SprintBoardErrorBody;
    throw new Error(
      body.error ?? `Failed to load sprint board (${response.status})`,
    );
  }

  return (await response.json()) as SprintBoardData;
};

const isBoardQueryId = (id: unknown): id is number | "active" =>
  id === "active" || typeof id === "number";

export const pruneSprintBoardQueries = (queryClient: QueryClient) => {
  const queries = queryClient
    .getQueryCache()
    .findAll({ queryKey: SPRINT_BOARD_QUERY_KEY })
    .filter((query) => isBoardQueryId(query.queryKey[1]))
    .toSorted((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt);

  const extra = queries.length - MAX_CACHED_BOARDS;
  if (extra <= 0) return;

  for (let i = 0; i < extra; i += 1) {
    const query = queries[i];
    if (!query) continue;
    queryClient.removeQueries({ queryKey: query.queryKey });
  }
};

/**
 * Write a fetched board into the in-memory QueryClient — not a second store.
 * localStorage is only a snapshot of this cache (PersistQueryClientProvider);
 * the UI always reads QueryClient.
 *
 * React Query only auto-caches under the key that useQuery used. On /sprint
 * with no ?sprint=, that key is ["sprint-board", "active"] because the sprint
 * number is unknown until this response returns — useQuery needs a key on the
 * first paint, before queryFn resolves. This copies the same payload onto
 * ["sprint-board", number] so later numeric navigation (or Active → that
 * sprint) hits memory instead of refetching. After meta.activeNumber exists
 * the hook could always use the numeric key; it currently does not, so both
 * keys stay in play.
 *
 * Then prunes to MAX_CACHED_BOARDS so the persisted snapshot stays bounded.
 */
export const cacheSprintBoardResponse = (
  queryClient: QueryClient,
  data: SprintBoardData,
) => {
  queryClient.setQueryData(sprintBoardQueryKey(data.sprint.number), data);

  // Seed sprint-board-meta once. Meta is not fetched on its own (enabled:
  // false in useSprintBoard); board responses write it. activeNumber is
  // which sprint is current for the picker's "Active sprint" option
  // (state === "active", else first recent, else this board).
  // recentSprints is the dropdown list. The guard means later fetches
  // (an older sprint, a refetch of Active) do not overwrite this —
  // switching to a closed sprint would otherwise replace "what is active"
  // and the picker list. useSprintBoard overlays meta.recentSprints onto
  // the current board so the picker stays stable while the board body changes.
  if (!queryClient.getQueryData(SPRINT_BOARD_META_QUERY_KEY)) {
    const activeNumber =
      data.recentSprints.find((sprint) => sprint.state === "active")?.number ??
      data.recentSprints[0]?.number ??
      data.sprint.number;

    const meta: SprintBoardMeta = {
      activeNumber,
      recentSprints: data.recentSprints,
    };
    queryClient.setQueryData(SPRINT_BOARD_META_QUERY_KEY, meta);
  }

  pruneSprintBoardQueries(queryClient);
};

export const fetchSprintBoardAndCache = async (
  queryClient: QueryClient,
  sprintNumber?: number,
): Promise<SprintBoardData> => {
  const data = await fetchSprintBoard(sprintNumber);
  cacheSprintBoardResponse(queryClient, data);
  return data;
};

/**
 * Hard refresh: wipe in-memory and persisted sprint-board cache, then refetch.
 * Cancels in-flight fetches first so they cannot write stale data after the wipe.
 * Removes meta (seeded by board fetches, not fetched itself) so the next response
 * can write a fresh activeNumber / recentSprints. Deletes the localStorage snapshot.
 * resetQueries keeps observers and marks boards stale so they refetch immediately.
 */
export const clearPersistedSprintBoard = async (queryClient: QueryClient) => {
  await queryClient.cancelQueries({ queryKey: SPRINT_BOARD_QUERY_KEY });
  await queryClient.cancelQueries({ queryKey: SPRINT_BOARD_META_QUERY_KEY });
  queryClient.removeQueries({ queryKey: SPRINT_BOARD_META_QUERY_KEY });
  try {
    localStorage.removeItem(SPRINT_BOARD_PERSIST_KEY);
  } catch {
    // private mode, quota, or disabled storage
  }
  await queryClient.resetQueries({ queryKey: SPRINT_BOARD_QUERY_KEY });
};

/** Persist only successful sprint-board / sprint-board-meta queries to localStorage; skip loading/error and unrelated caches. */
export const shouldDehydrateSprintBoardQuery = (query: {
  queryKey: readonly unknown[];
  state: { status: string };
}): boolean => {
  if (query.state.status !== "success") return false;
  const root = query.queryKey[0];
  return (
    root === SPRINT_BOARD_QUERY_KEY[0] ||
    root === SPRINT_BOARD_META_QUERY_KEY[0]
  );
};
