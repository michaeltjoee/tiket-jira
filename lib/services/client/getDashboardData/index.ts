import "client-only";

import type {
  GetDashboardData,
  SprintBoardData,
} from "@/lib/services/shared/getDashboardData";

export type {
  GetDashboardData,
  GetDashboardDataParams,
  SprintBoardData,
} from "@/lib/services/shared/getDashboardData";

type SprintBoardErrorBody = {
  error?: string;
};

export const getDashboardData: GetDashboardData = async (sprintNumber) => {
  const url =
    sprintNumber === undefined
      ? "/api/sprint-board"
      : `/api/sprint-board?sprint=${sprintNumber}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => ({}))) as SprintBoardErrorBody;
    throw new Error(
      body.error ?? `Failed to load sprint board (${response.status})`,
    );
  }

  return (await response.json()) as SprintBoardData;
};
