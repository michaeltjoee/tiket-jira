export const JIRA_HOST_DEFAULT = "https://borobudur.atlassian.net";
export const JIRA_BOARD_ID_DEFAULT = 691;

export const PROJECT_KEY = "PLAT";
export const DEV_ASSIGNEE_ACCOUNT_ID = "631808e78d88ec800fbfcabc";
export const FIELD_SPRINT = "customfield_10005";
export const FIELD_DEV_EFFORT = "customfield_10893";
export const FIELD_DEV_ASSIGNEE = "customfield_10889";
export const FIELD_DEV_START = "customfield_10301";
export const FIELD_DEV_END = "customfield_10302";

export const SPHINX_SPRINT_PREFIX = "Sphinx Sprint ";
export const SPHINX_SPRINT_NAME_RE = /^Sphinx Sprint (\d+)$/;

export const browseUrl = (key: string, host = JIRA_HOST_DEFAULT) =>
  `${host.replace(/\/$/, "")}/browse/${key}`;
