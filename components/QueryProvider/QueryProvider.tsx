"use client";

import { useState, type ReactNode } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import {
  createSprintBoardPersister,
  getQueryClient,
  SPRINT_BOARD_PERSIST_BUSTER,
} from "@/lib/query/client";
import { shouldDehydrateSprintBoardQuery } from "@/lib/query/sprint-board";

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();
  const [persister] = useState(() => createSprintBoardPersister());

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: Infinity,
        // Discard the localStorage snapshot if this stamp no longer matches.
        buster: SPRINT_BOARD_PERSIST_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldDehydrateSprintBoardQuery,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

export default QueryProvider;
