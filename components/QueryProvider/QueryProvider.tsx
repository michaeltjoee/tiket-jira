"use client";

import { useState, type ReactNode } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { createSprintBoardPersistAdapter } from "@/lib/query/sprint-board";

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [{ queryClient, persistOptions }] = useState(
    createSprintBoardPersistAdapter,
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

export default QueryProvider;
