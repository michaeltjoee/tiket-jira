import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SprintRef } from "@/lib/services/shared/jira";
import { MAX_CACHED_BOARDS } from "@/lib/query/sprint-board";
import { useSprintBoard } from "@/lib/query/useSprintBoard";
import { getDashboardData } from "@/lib/services/client/getDashboardData";
import type { SprintBoardData } from "@/lib/services/shared/getDashboardData";

vi.mock("@/lib/services/client/getDashboardData", () => ({
  getDashboardData: vi.fn(),
}));

const sprintRef = (number: number, state: string): SprintRef => ({
  id: number,
  name: `SPHINX Sprint ${number}`,
  number,
  state,
});

const board = (
  number: number,
  recent: number[],
  activeNumber: number,
  fetchedAt: string,
): SprintBoardData => ({
  sprint: sprintRef(
    number,
    number === activeNumber
      ? "active"
      : number > activeNumber
        ? "future"
        : "closed",
  ),
  parents: [],
  totalEffort: 0,
  parentCount: 0,
  subtaskCount: 0,
  recentSprints: recent.map((n) =>
    sprintRef(n, n === activeNumber ? "active" : "future"),
  ),
  fetchedAt,
});

const wrapperWith = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

const setup = (
  fetchBoard: (sprintNumber?: number) => Promise<SprintBoardData>,
) => {
  vi.mocked(getDashboardData).mockImplementation(fetchBoard);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
  return { queryClient };
};

describe("useSprintBoard", () => {
  beforeEach(() => {
    vi.mocked(getDashboardData).mockReset();
  });

  it("seeds the picker once and overlays it onto a later board", async () => {
    const fetchBoard = vi.fn(async (sprintNumber?: number) => {
      if (sprintNumber === 40) {
        return board(40, [39, 40, 41, 42], 41, "2026-08-14T00:01:00.000Z");
      }
      return board(42, [42, 43, 44, 45], 42, "2026-08-14T00:00:00.000Z");
    });
    const { queryClient } = setup(fetchBoard);
    const { result, rerender } = renderHook(
      ({ sprint }: { sprint?: number }) => useSprintBoard(sprint),
      {
        wrapper: wrapperWith(queryClient),
        initialProps: { sprint: undefined as number | undefined },
      },
    );

    await waitFor(() => {
      expect(result.current.data?.sprint.number).toBe(42);
    });
    expect(result.current.data?.recentSprints.map((s) => s.number)).toEqual([
      42, 43, 44, 45,
    ]);

    rerender({ sprint: 40 });
    await waitFor(() => {
      expect(result.current.data?.sprint.number).toBe(40);
    });
    expect(result.current.data?.recentSprints.map((s) => s.number)).toEqual([
      42, 43, 44, 45,
    ]);
    expect(fetchBoard).toHaveBeenCalledTimes(2);
  });

  it("shows a loader when the viewed board is missing", async () => {
    let finish43: ((value: SprintBoardData) => void) | undefined;
    const fetchBoard = vi.fn(async (sprintNumber?: number) => {
      if (sprintNumber === 43) {
        return new Promise<SprintBoardData>((resolve) => {
          finish43 = resolve;
        });
      }
      return board(42, [42, 43, 44, 45], 42, "2026-08-14T00:00:00.000Z");
    });
    const { queryClient } = setup(fetchBoard);
    const { result, rerender } = renderHook(
      ({ sprint }: { sprint?: number }) => useSprintBoard(sprint),
      {
        wrapper: wrapperWith(queryClient),
        initialProps: { sprint: undefined as number | undefined },
      },
    );

    await waitFor(() => {
      expect(result.current.data?.sprint.number).toBe(42);
    });

    rerender({ sprint: 43 });
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
    expect(result.current.data).toBeUndefined();

    await act(async () => {
      finish43?.(board(43, [42, 43, 44, 45], 42, "2026-08-14T00:01:00.000Z"));
    });
    await waitFor(() => {
      expect(result.current.data?.sprint.number).toBe(43);
    });
    expect(result.current.data?.recentSprints.map((s) => s.number)).toEqual([
      42, 43, 44, 45,
    ]);
  });

  it("reseeds the picker on refresh", async () => {
    const fetchBoard = vi
      .fn()
      .mockResolvedValueOnce(
        board(42, [42, 43, 44, 45], 42, "2026-08-14T00:00:00.000Z"),
      )
      .mockResolvedValueOnce(
        board(43, [43, 44, 45, 46], 43, "2026-08-14T00:02:00.000Z"),
      );
    const { queryClient } = setup(fetchBoard);
    const { result } = renderHook(() => useSprintBoard(undefined), {
      wrapper: wrapperWith(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data?.recentSprints[0]?.number).toBe(42);
    });

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.data?.recentSprints.map((s) => s.number)).toEqual([
        43, 44, 45, 46,
      ]);
    });
  });

  it("prunes the oldest board when the map exceeds the cap", async () => {
    const fetchBoard = vi.fn(async (sprintNumber?: number) => {
      const number = sprintNumber ?? 42;
      const offset = number - 42;
      return board(
        number,
        [42, 43, 44, 45],
        42,
        `2026-08-14T00:${String(offset).padStart(2, "0")}:00.000Z`,
      );
    });
    const { queryClient } = setup(fetchBoard);
    const { result, rerender } = renderHook(
      ({ sprint }: { sprint?: number }) => useSprintBoard(sprint),
      {
        wrapper: wrapperWith(queryClient),
        initialProps: { sprint: undefined as number | undefined },
      },
    );

    await waitFor(() => {
      expect(result.current.data?.sprint.number).toBe(42);
    });

    for (let n = 43; n < 42 + MAX_CACHED_BOARDS + 1; n += 1) {
      rerender({ sprint: n });
      await waitFor(() => {
        expect(result.current.data?.sprint.number).toBe(n);
      });
    }

    fetchBoard.mockClear();
    rerender({ sprint: 42 });
    await waitFor(() => {
      expect(fetchBoard).toHaveBeenCalledWith(42);
    });
  });
});
