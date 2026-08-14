import type { QueryClient } from "@tanstack/react-query";

import type { SprintBoardData, SprintBoardMeta } from "@/lib/jira/types";

import { SPRINT_BOARD_PERSIST_KEY } from "./client";

export const MAX_CACHED_BOARDS = 5;

export const SPRINT_BOARD_QUERY_KEY = ["sprint-board"] as const;
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

export const cacheSprintBoardResponse = (
  queryClient: QueryClient,
  data: SprintBoardData,
) => {
  queryClient.setQueryData(sprintBoardQueryKey(data.sprint.number), data);

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
