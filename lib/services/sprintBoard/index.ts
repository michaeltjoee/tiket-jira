import type { FetchSprintBoard, SprintBoardData } from "./types";

export type {
  FetchSprintBoard,
  FetchSprintBoardParams,
  SprintBoardData,
} from "./types";

type SprintBoardErrorBody = {
  error?: string;
};

export const fetchSprintBoardFromHttp: FetchSprintBoard = async (
  sprintNumber,
) => {
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
