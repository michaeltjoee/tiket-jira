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
  devStartDate: string | null;
  devEndDate: string | null;
  devRangeLabel: string | null;
  url: string;
};

export type LedgerParent = {
  key: string;
  summary: string;
  status: string;
  effort: number | null;
  devStartDate: string | null;
  devEndDate: string | null;
  devRangeLabel: string | null;
  url: string;
  subtasks: LedgerSubtask[];
};

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

export type SprintBoardMeta = {
  activeNumber: number;
  recentSprints: SprintRef[];
};

export type JiraIssueFields = {
  summary?: string;
  status?: { name?: string };
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
