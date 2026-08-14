"use client";

import {
  useQuery,
  useQueryClient,
  useIsRestoring,
} from "@tanstack/react-query";

import type { SprintBoardMeta } from "@/lib/jira/types";
import {
  clearPersistedSprintBoard,
  fetchSprintBoardAndCache,
  SPRINT_BOARD_META_QUERY_KEY,
  sprintBoardQueryKey,
} from "@/lib/query/sprint-board";

export const useSprintBoard = (sprintNumber: number | undefined) => {
  const queryClient = useQueryClient();
  // True while PersistQueryClientProvider hydrates localStorage into QueryClient.
  // Board fetch waits (enabled: !isRestoring) so a reload does not race restore
  // and refetch; isPending stays true so the UI does not flash empty first.
  const isRestoring = useIsRestoring();
  const boardId: number | "active" = sprintNumber ?? "active";

  const { data: meta } = useQuery<SprintBoardMeta>({
    queryKey: SPRINT_BOARD_META_QUERY_KEY,
    enabled: false,
    queryFn: () => {
      throw new Error("sprint-board-meta is written by board fetches");
    },
  });

  const boardQuery = useQuery({
    queryKey: sprintBoardQueryKey(boardId),
    queryFn: () => fetchSprintBoardAndCache(queryClient, sprintNumber),
    enabled: !isRestoring,
  });

  const refresh = () => clearPersistedSprintBoard(queryClient);

  const data = boardQuery.data
    ? {
        ...boardQuery.data,
        recentSprints: meta?.recentSprints ?? boardQuery.data.recentSprints,
      }
    : undefined;

  return {
    data,
    isRestoring,
    isPending: isRestoring || boardQuery.isPending,
    isFetching: boardQuery.isFetching,
    error: boardQuery.error,
    refresh,
  };
};
