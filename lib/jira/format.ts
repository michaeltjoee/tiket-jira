import { SPHINX_SPRINT_NAME_RE, SPHINX_SPRINT_PREFIX } from "./constants";
import type { SprintRef } from "./types";

export const parseSphinxSprintNumber = (name: string): number | null => {
  const match = SPHINX_SPRINT_NAME_RE.exec(name);
  if (!match) return null;
  return Number(match[1]);
};

export const sphinxSprintName = (n: number) => `${SPHINX_SPRINT_PREFIX}${n}`;

export const toSprintRef = (sprint: {
  id: number;
  name: string;
  state: string;
}): SprintRef | null => {
  const number = parseSphinxSprintNumber(sprint.name);
  if (number === null) return null;
  return {
    id: sprint.id,
    name: sprint.name,
    number,
    state: sprint.state,
  };
};

export const formatDateLabel = (
  isoDate: string | null | undefined,
): string | null => {
  if (!isoDate) return null;
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
};

export const formatDevRangeLabel = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string | null => {
  const start = formatDateLabel(startDate);
  const end = formatDateLabel(endDate);
  if (!start && !end) return null;
  return `${start ?? "—"} – ${end ?? "—"}`;
};

export const compareDateAscEmptyLast = (
  a: string | null | undefined,
  b: string | null | undefined,
): number => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
};

export const formatEffort = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return Number.isInteger(value) ? String(value) : String(value);
};

export const todayIsoDate = (now = new Date()): string => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTodayLabel = (now = new Date()): string =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(now);

export type DueMark = "due" | "late";

const LATE_ELIGIBLE_STATUSES = new Set([
  "to do",
  "in progress",
  "in development",
]);

export const isLateEligibleStatus = (name: string | null | undefined) =>
  LATE_ELIGIBLE_STATUSES.has((name ?? "").trim().toLowerCase());

export const dueMark = (
  endDate: string | null | undefined,
  status: string | null | undefined,
  today = todayIsoDate(),
): DueMark | null => {
  if (!endDate || !isLateEligibleStatus(status)) return null;
  const day = endDate.slice(0, 10);
  if (day > today) return null;
  return day === today ? "due" : "late";
};

export type StatusTone = "open" | "active" | "review" | "done" | "blocked";

const BLOCKED_RE = /\b(blocked|on hold|impediment)\b/i;
const REVIEW_RE = /qa|review|test|verify|uat|deploy|staging/i;

export const statusTone = (
  name: string,
  category: string | null | undefined,
): StatusTone => {
  if (category === "done") return "done";
  if (BLOCKED_RE.test(name)) return "blocked";
  if (REVIEW_RE.test(name)) return "review";
  if (category === "new") return "open";
  return "active";
};
