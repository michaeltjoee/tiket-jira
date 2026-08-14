import "server-only";

import {
  fetchBoardBody,
  buildRecentSprintWindow,
  resolveSprint,
} from "@/lib/services/server/jira";
import type { SprintBoardData } from "@/lib/services/shared/getDashboardData";

export const loadSprintBoard = async (
  sprintNumber?: number,
): Promise<SprintBoardData> => {
  const { sprint, active } = await resolveSprint(sprintNumber);
  const recentSprints = buildRecentSprintWindow(active);
  const body = await fetchBoardBody(sprint.name);

  return {
    sprint,
    recentSprints,
    fetchedAt: new Date().toISOString(),
    ...body,
  };
};
