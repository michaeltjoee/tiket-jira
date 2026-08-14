export type JiraSprint = {
  id: number;
  name: string;
  state: string;
  boardId?: number;
  startDate?: string;
  endDate?: string;
};

export type SprintRef = {
  id: number;
  name: string;
  number: number;
  state: string;
};

export type LedgerSubtask = {
  key: string;
  summary: string;
  status: string;
  statusCategory: string;
  devStartDate: string | null;
  devEndDate: string | null;
  devRangeLabel: string | null;
  url: string;
};

export type LedgerParent = {
  key: string;
  summary: string;
  status: string;
  statusCategory: string;
  effort: number | null;
  devStartDate: string | null;
  devEndDate: string | null;
  devRangeLabel: string | null;
  url: string;
  subtasks: LedgerSubtask[];
};

/**
 * Persisted sprint-board payload. Changing this shape, `SprintRef`, or
 * `SprintBoardMeta` requires bumping `SPRINT_BOARD_PERSIST_BUSTER` in
 * `lib/query/client.ts` — React Query will not detect the incompatibility.
 */
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

/** Persisted alongside the board. Same buster bump as `SprintBoardData`. */
export type SprintBoardMeta = {
  activeNumber: number;
  recentSprints: SprintRef[];
};

export type JiraIssueFields = {
  summary?: string;
  status?: {
    name?: string;
    statusCategory?: { key?: string; name?: string };
  };
  subtasks?: Array<{
    key: string;
    fields?: { summary?: string };
  }>;
  customfield_10301?: string | null;
  customfield_10302?: string | null;
  customfield_10893?: number | null;
  customfield_10005?: JiraSprint[] | null;
};

export type JiraIssue = {
  key: string;
  fields: JiraIssueFields;
};
