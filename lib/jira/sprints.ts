import { jiraFetch, getJiraEnv } from "./client";
import { sphinxSprintName, toSprintRef } from "./format";
import type { JiraSprint, SprintRef } from "./types";

type AgileSprintPage = {
  values: JiraSprint[];
  isLast: boolean;
  startAt: number;
  maxResults: number;
};

const fetchBoardSprints = async (states: string): Promise<JiraSprint[]> => {
  const { boardId } = getJiraEnv();
  const collected: JiraSprint[] = [];
  let startAt = 0;

  for (;;) {
    const page = await jiraFetch<AgileSprintPage>(
      `/rest/agile/1.0/board/${boardId}/sprint`,
      {
        searchParams: {
          state: states,
          startAt,
          maxResults: 50,
        },
      },
    );

    collected.push(...(page.values ?? []));
    if (page.isLast || (page.values?.length ?? 0) === 0) break;
    startAt += page.maxResults;
  }

  return collected;
};

export const listSphinxSprints = async (): Promise<SprintRef[]> => {
  const sprints = await fetchBoardSprints("active,future,closed");
  const refs = sprints
    .map(toSprintRef)
    .filter((sprint): sprint is SprintRef => sprint !== null)
    .sort((a, b) => b.number - a.number);

  const byNumber = new Map<number, SprintRef>();
  for (const sprint of refs) {
    if (!byNumber.has(sprint.number)) byNumber.set(sprint.number, sprint);
  }

  return [...byNumber.values()].sort((a, b) => b.number - a.number);
};

export const resolveActiveSphinxSprint =
  async (): Promise<SprintRef | null> => {
    const active = await fetchBoardSprints("active");
    const sphinx = active
      .map(toSprintRef)
      .filter((sprint): sprint is SprintRef => sprint !== null);
    if (sphinx.length === 0) return null;
    return sphinx.sort((a, b) => b.number - a.number)[0] ?? null;
  };

export const resolveSprint = async (
  sprintNumber?: number,
): Promise<SprintRef> => {
  if (sprintNumber !== undefined) {
    const name = sphinxSprintName(sprintNumber);
    const listed = await listSphinxSprints();
    const found = listed.find((sprint) => sprint.number === sprintNumber);
    if (found) return found;
    return {
      id: 0,
      name,
      number: sprintNumber,
      state: "unknown",
    };
  }

  const active = await resolveActiveSphinxSprint();
  if (active) return active;

  const listed = await listSphinxSprints();
  const fallback = listed[0];
  if (fallback) return fallback;

  throw new Error("No Sphinx Sprint found on the configured board.");
};
