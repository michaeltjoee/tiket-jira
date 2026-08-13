import type { SprintBoardData } from "./types";

const MAX_ENTRIES = 5;

const boardCache = new Map<number, SprintBoardData>();

export const getCachedSprintBoard = (
  sprintNumber: number,
): SprintBoardData | undefined => {
  const cached = boardCache.get(sprintNumber);
  if (!cached) return undefined;

  // Refresh LRU order
  boardCache.delete(sprintNumber);
  boardCache.set(sprintNumber, cached);
  return cached;
};

export const setCachedSprintBoard = (
  sprintNumber: number,
  data: SprintBoardData,
): void => {
  if (boardCache.has(sprintNumber)) {
    boardCache.delete(sprintNumber);
  }
  boardCache.set(sprintNumber, data);

  while (boardCache.size > MAX_ENTRIES) {
    const oldest = boardCache.keys().next().value;
    if (oldest === undefined) break;
    boardCache.delete(oldest);
  }
};

export const clearSprintBoardCache = (): void => {
  boardCache.clear();
};
