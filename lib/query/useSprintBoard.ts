"use client";

import { useTransition } from "react";
import {
  useQuery,
  useQueryClient,
  useIsRestoring,
} from "@tanstack/react-query";

import {
  ingestSprintBoard,
  overlaySprintBoard,
  refreshSprintLedgerCache,
  sprintBoardFetchQueryKey,
  viewedBoard,
  type SprintLedgerCache,
  SPRINT_BOARD_QUERY_KEY,
} from "@/lib/query/sprint-board";
import { getDashboardData } from "@/lib/services/client/getDashboardData";

export { createSprintBoardPersistAdapter } from "@/lib/query/sprint-board";

export const useSprintBoard = (sprintNumber: number | undefined) => {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();
  const [isRefreshing, startRefresh] = useTransition();

  const { data: cache } = useQuery<SprintLedgerCache>({
    queryKey: SPRINT_BOARD_QUERY_KEY,
    enabled: false,
    queryFn: () => {
      throw new Error("sprint-board document is written by board fetches");
    },
  });

  const board = viewedBoard(cache, sprintNumber);
  const needsFetch = !isRestoring && board === undefined;
  const fetchId = sprintNumber ?? cache?.picker?.activeNumber ?? "active";

  const boardQuery = useQuery({
    queryKey: sprintBoardFetchQueryKey(fetchId),
    queryFn: async () => {
      const data = await getDashboardData(sprintNumber);
      ingestSprintBoard(queryClient, data);
      return data;
    },
    enabled: needsFetch && !isRefreshing,
  });

  const data = overlaySprintBoard(cache, sprintNumber);
  const refresh = () => {
    const task = refreshSprintLedgerCache(
      queryClient,
      getDashboardData,
      sprintNumber,
    );
    startRefresh(async () => {
      await task;
    });
    return task;
  };

  return {
    data,
    isRestoring,
    isPending:
      isRestoring || (data === undefined && !boardQuery.isError && needsFetch),
    isFetching: boardQuery.isFetching || isRefreshing,
    error: boardQuery.error,
    refresh,
  };
};
