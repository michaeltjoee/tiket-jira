import "server-only";

import { JIRA_BOARD_ID_DEFAULT, JIRA_HOST_DEFAULT } from "./constants";

export class JiraConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JiraConfigError";
  }
}

export class JiraApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "JiraApiError";
    this.status = status;
  }
}

type JiraEnv = {
  host: string;
  email: string;
  apiToken: string;
  boardId: number;
};

export const getJiraEnv = (): JiraEnv => {
  const email = process.env.JIRA_EMAIL?.trim();
  const apiToken = process.env.JIRA_API_TOKEN?.trim();
  const host = (process.env.JIRA_HOST?.trim() || JIRA_HOST_DEFAULT).replace(
    /\/$/,
    "",
  );
  const boardRaw = process.env.JIRA_BOARD_ID?.trim();
  const boardId = boardRaw ? Number(boardRaw) : JIRA_BOARD_ID_DEFAULT;

  if (!email || !apiToken) {
    throw new JiraConfigError(
      "Missing JIRA_EMAIL or JIRA_API_TOKEN. Add them to .env.local (see .env.example).",
    );
  }

  if (!Number.isFinite(boardId) || boardId <= 0) {
    throw new JiraConfigError("JIRA_BOARD_ID must be a positive number.");
  }

  return { host, email, apiToken, boardId };
};

export const hasJiraCredentials = () =>
  Boolean(process.env.JIRA_EMAIL?.trim() && process.env.JIRA_API_TOKEN?.trim());

const authHeader = (email: string, apiToken: string) =>
  `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`;

export const jiraFetch = async <T>(
  path: string,
  init?: RequestInit & {
    searchParams?: Record<string, string | number | undefined>;
  },
): Promise<T> => {
  const { host, email, apiToken } = getJiraEnv();
  const url = new URL(path.startsWith("http") ? path : `${host}${path}`);

  if (init?.searchParams) {
    for (const [key, value] of Object.entries(init.searchParams)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const { searchParams: _ignored, ...requestInit } = init ?? {};

  const response = await fetch(url, {
    ...requestInit,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(email, apiToken),
      ...requestInit.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new JiraApiError(
      `Jira ${response.status} on ${path}${body ? `: ${body.slice(0, 240)}` : ""}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
