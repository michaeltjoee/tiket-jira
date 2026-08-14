import type { LedgerParent, SprintRef } from "@/lib/jira/types";

export type FetchSprintBoardParams = {
  sprintNumber?: number;
};

/** HTTP and hook payload. Picker fields on this type are overlaid by the sprint ledger cache. */
export type SprintBoardData = {
  sprint: SprintRef;
  parents: LedgerParent[];
  totalEffort: number;
  parentCount: number;
  subtaskCount: number;
  recentSprints: SprintRef[];
  /** ISO timestamp when parents/effort were fetched from Jira. */
  fetchedAt: string;
};

export type FetchSprintBoard = (
  sprintNumber?: FetchSprintBoardParams["sprintNumber"],
) => Promise<SprintBoardData>;
