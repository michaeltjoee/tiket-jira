"use server";

import { clearSprintBoardCache } from "./board-cache";

export const clearBoardCacheAction = async (): Promise<void> => {
  clearSprintBoardCache();
};
