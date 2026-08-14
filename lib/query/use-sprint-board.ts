"use client";

import { useRef } from "react";
import {
  useQuery,
  useQueryClient,
  useIsRestoring,
} from "@tanstack/react-query";

import {
  fetchSprintBoardFromHttp,
  ingestSprintBoard,
  overlaySprintBoard,
  refreshSprintLedgerCache,
  sprintBoardFetchQueryKey,
  viewedBoard,
  type FetchSprintBoard,
  type SprintLedgerCache,
  SPRINT_BOARD_QUERY_KEY,
} from "@/lib/query/sprint-board";

export const createSprintBoardCache = (deps: {
  fetchBoard: FetchSprintBoard;
}) => {
  const useSprintBoard = (sprintNumber: number | undefined) => {
    const queryClient = useQueryClient();
    const isRestoring = useIsRestoring();
    const refreshingRef = useRef(false);

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
        const data = await deps.fetchBoard(sprintNumber);
        ingestSprintBoard(queryClient, data);
        return data;
      },
      enabled: needsFetch && !refreshingRef.current,
    });

    const data = overlaySprintBoard(cache, sprintNumber);
    const refresh = async () => {
      refreshingRef.current = true;
      try {
        await refreshSprintLedgerCache(
          queryClient,
          deps.fetchBoard,
          sprintNumber,
        );
      } finally {
        refreshingRef.current = false;
      }
    };

    return {
      data,
      isRestoring,
      isPending:
        isRestoring ||
        (data === undefined && !boardQuery.isError && needsFetch),
      isFetching: boardQuery.isFetching,
      error: boardQuery.error,
      refresh,
    };
  };

  return { useSprintBoard };
};

export const { useSprintBoard } = createSprintBoardCache({
  fetchBoard: fetchSprintBoardFromHttp,
});
