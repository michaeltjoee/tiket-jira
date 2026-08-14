import "server-only";

import { jiraFetch, getJiraEnv } from "./client";
import { sphinxSprintName, toSprintRef } from "./format";
import type { JiraSprint, SprintRef } from "./types";

type AgileSprintPage = {
  values: JiraSprint[];
  isLast: boolean;
  startAt: number;
  maxResults: number;
};

const FORWARD_SPRINT_COUNT = 3;

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

const syntheticSprint = (number: number, state = "unknown"): SprintRef => ({
  id: 0,
  name: sphinxSprintName(number),
  number,
  state,
});

export const resolveActiveSphinxSprint =
  async (): Promise<SprintRef | null> => {
    const active = await fetchBoardSprints("active");
    const sphinx = active
      .map(toSprintRef)
      .filter((sprint): sprint is SprintRef => sprint !== null);
    if (sphinx.length === 0) return null;
    return sphinx.sort((a, b) => b.number - a.number)[0] ?? null;
  };

/** Active sprint plus the next N numbered Sphinx sprints (synthetic). */
export const buildRecentSprintWindow = (active: SprintRef): SprintRef[] => {
  const window: SprintRef[] = [active];
  for (let offset = 1; offset <= FORWARD_SPRINT_COUNT; offset += 1) {
    window.push(syntheticSprint(active.number + offset, "future"));
  }
  return window;
};

export const resolveSprint = async (
  sprintNumber?: number,
): Promise<{ sprint: SprintRef; active: SprintRef }> => {
  const active = await resolveActiveSphinxSprint();
  if (!active) {
    throw new Error("No active Sphinx Sprint found on the configured board.");
  }

  if (sprintNumber === undefined || sprintNumber === active.number) {
    return { sprint: active, active };
  }

  return { sprint: syntheticSprint(sprintNumber), active };
};
