import type { LedgerParent, SprintRef } from "@/lib/services/shared/jira";

export type GetDashboardDataParams = {
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

export type GetDashboardData = (
  sprintNumber?: GetDashboardDataParams["sprintNumber"],
) => Promise<SprintBoardData>;
