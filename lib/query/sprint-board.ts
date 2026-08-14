import type { QueryClient } from "@tanstack/react-query";

import type { SprintBoardData, SprintBoardMeta } from "@/lib/jira/types";

import { SPRINT_BOARD_PERSIST_KEY } from "./client";

export const MAX_CACHED_BOARDS = 5;

export const sprintBoardMetaQueryKey = ["sprint-board-meta"] as const;

export const sprintBoardQueryKey = (id: number | "active") =>
  ["sprint-board", id] as const;

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
    .findAll({ queryKey: ["sprint-board"] })
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

  if (!queryClient.getQueryData(sprintBoardMetaQueryKey)) {
    const activeNumber =
      data.recentSprints.find((sprint) => sprint.state === "active")?.number ??
      data.recentSprints[0]?.number ??
      data.sprint.number;

    const meta: SprintBoardMeta = {
      activeNumber,
      recentSprints: data.recentSprints,
    };
    queryClient.setQueryData(sprintBoardMetaQueryKey, meta);
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

export const clearPersistedSprintBoard = async (queryClient: QueryClient) => {
  await queryClient.cancelQueries({ queryKey: ["sprint-board"] });
  await queryClient.cancelQueries({ queryKey: sprintBoardMetaQueryKey });
  queryClient.removeQueries({ queryKey: sprintBoardMetaQueryKey });
  try {
    localStorage.removeItem(SPRINT_BOARD_PERSIST_KEY);
  } catch {
    // private mode, quota, or disabled storage
  }
  await queryClient.resetQueries({ queryKey: ["sprint-board"] });
};

export const shouldDehydrateSprintBoardQuery = (query: {
  queryKey: readonly unknown[];
  state: { status: string };
}): boolean => {
  if (query.state.status !== "success") return false;
  const root = query.queryKey[0];
  return root === "sprint-board" || root === "sprint-board-meta";
};
