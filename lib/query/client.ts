import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const SPRINT_BOARD_PERSIST_KEY = "sprint-board:v1";
export const SPRINT_BOARD_PERSIST_BUSTER = "v1";

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

export const createSprintBoardPersister = () =>
  createAsyncStoragePersister({
    storage: typeof window === "undefined" ? undefined : window.localStorage,
    key: SPRINT_BOARD_PERSIST_KEY,
  });
