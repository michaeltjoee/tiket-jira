import { jiraFetch } from "./client";
import {
  DEV_ASSIGNEE_ACCOUNT_ID,
  FIELD_DEV_END,
  FIELD_DEV_EFFORT,
  FIELD_DEV_START,
  PROJECT_KEY,
  browseUrl,
} from "./constants";
import { compareDateAscEmptyLast, formatDevRangeLabel } from "./format";
import { getCachedSprintBoard, setCachedSprintBoard } from "./board-cache";
import { buildRecentSprintWindow, resolveSprint } from "./sprints";
import type {
  JiraIssue,
  LedgerParent,
  LedgerSubtask,
  SprintBoardData,
} from "./types";

export { resolveSprint } from "./sprints";
export { formatEffort } from "./format";

type SearchResponse = {
  issues: JiraIssue[];
  nextPageToken?: string;
  isLast?: boolean;
};

const PARENT_FIELDS = [
  "summary",
  "status",
  "subtasks",
  FIELD_DEV_EFFORT,
  FIELD_DEV_START,
  FIELD_DEV_END,
];

const CHILD_FIELDS = ["summary", FIELD_DEV_START, FIELD_DEV_END];

const searchAll = async (
  jql: string,
  fields: string[],
): Promise<JiraIssue[]> => {
  const issues: JiraIssue[] = [];
  let nextPageToken: string | undefined;

  for (;;) {
    const page = await jiraFetch<SearchResponse>("/rest/api/3/search/jql", {
      method: "POST",
      body: JSON.stringify({
        jql,
        fields,
        maxResults: 50,
        ...(nextPageToken && { nextPageToken }),
      }),
    });

    issues.push(...(page.issues ?? []));

    if (
      page.isLast ||
      !page.nextPageToken ||
      (page.issues?.length ?? 0) === 0
    ) {
      break;
    }
    nextPageToken = page.nextPageToken;
  }

  return issues;
};

const parentsJql = (sprintName: string) =>
  `project = ${PROJECT_KEY} AND sprint = "${sprintName}" AND issuetype in (Story, Bug) AND "Dev Assignee" = "${DEV_ASSIGNEE_ACCOUNT_ID}" ORDER BY "Dev Start Date" ASC`;

const fetchSubtaskDetails = async (
  keys: string[],
): Promise<Map<string, JiraIssue>> => {
  const map = new Map<string, JiraIssue>();
  if (keys.length === 0) return map;

  const chunkSize = 40;
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);
    const jql = `key in (${chunk.join(",")})`;
    const issues = await searchAll(jql, CHILD_FIELDS);
    for (const issue of issues) {
      map.set(issue.key, issue);
    }
  }

  return map;
};

const toSubtask = (
  key: string,
  summary: string,
  devStartDate: string | null,
  devEndDate: string | null,
): LedgerSubtask => ({
  key,
  summary,
  devStartDate,
  devEndDate,
  devRangeLabel: formatDevRangeLabel(devStartDate, devEndDate),
  url: browseUrl(key),
});

const toParent = (
  issue: JiraIssue,
  subtasks: LedgerSubtask[],
): LedgerParent => {
  const devStartDate = issue.fields.customfield_10301 ?? null;
  const devEndDate = issue.fields.customfield_10302 ?? null;
  const effortRaw = issue.fields.customfield_10893;
  const effort = typeof effortRaw === "number" ? effortRaw : null;

  return {
    key: issue.key,
    summary: issue.fields.summary ?? "",
    status: issue.fields.status?.name ?? "—",
    effort,
    devStartDate,
    devEndDate,
    devRangeLabel: formatDevRangeLabel(devStartDate, devEndDate),
    url: browseUrl(issue.key),
    subtasks,
  };
};

const fetchBoardBody = async (sprintName: string) => {
  const parentIssues = await searchAll(parentsJql(sprintName), PARENT_FIELDS);

  const childKeys = parentIssues.flatMap(
    (issue) => issue.fields.subtasks?.map((subtask) => subtask.key) ?? [],
  );
  const childDetails = await fetchSubtaskDetails(childKeys);

  const parents: LedgerParent[] = parentIssues
    .map((issue) => {
      const subtasks = (issue.fields.subtasks ?? [])
        .map((subtask) => {
          const detail = childDetails.get(subtask.key);
          const devStartDate = detail?.fields.customfield_10301 ?? null;
          const devEndDate = detail?.fields.customfield_10302 ?? null;
          const summary =
            detail?.fields.summary ?? subtask.fields?.summary ?? "";
          return toSubtask(subtask.key, summary, devStartDate, devEndDate);
        })
        .sort((a, b) =>
          compareDateAscEmptyLast(a.devStartDate, b.devStartDate),
        );

      return toParent(issue, subtasks);
    })
    .sort((a, b) => compareDateAscEmptyLast(a.devStartDate, b.devStartDate));

  const totalEffort = parents.reduce(
    (sum, parent) => sum + (parent.effort ?? 0),
    0,
  );
  const subtaskCount = parents.reduce(
    (sum, parent) => sum + parent.subtasks.length,
    0,
  );

  return {
    parents,
    totalEffort,
    parentCount: parents.length,
    subtaskCount,
  };
};

export const loadSprintBoard = async (
  sprintNumber?: number,
): Promise<SprintBoardData> => {
  const { sprint, active } = await resolveSprint(sprintNumber);
  const recentSprints = buildRecentSprintWindow(active);

  const cached = getCachedSprintBoard(sprint.number);
  if (cached) {
    return {
      ...cached,
      sprint,
      recentSprints,
    };
  }

  const body = await fetchBoardBody(sprint.name);
  const data: SprintBoardData = {
    sprint,
    recentSprints,
    fetchedAt: new Date().toISOString(),
    ...body,
  };

  setCachedSprintBoard(sprint.number, data);
  return data;
};
