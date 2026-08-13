"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { clearBoardCacheAction } from "@/lib/jira/clear-board-cache";
import type { SprintRef } from "@/lib/jira";

type Props = {
  current: SprintRef;
  recentSprints: SprintRef[];
  fetchedAt: string;
};

const formatCachedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Cached";

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (sameDay) return `Cached ${time}`;

  const day = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);

  return `Cached ${day} ${time}`;
};

const SprintControls = ({ current, recentSprints, fetchedAt }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const isForcedSprint = searchParams.has("sprint");

  const goToSprint = (number: number | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (number === null) {
        params.delete("sprint");
      } else {
        params.set("sprint", String(number));
      }
      const query = params.toString();
      router.push(query ? `/?${query}` : "/");
    });
  };

  const handleRefresh = () => {
    startTransition(async () => {
      await clearBoardCacheAction();
      router.refresh();
    });
  };

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "active") {
      goToSprint(null);
      return;
    }
    goToSprint(Number(value));
  };

  return (
    <div className="controls">
      <label className="control_label" htmlFor="sprint-select">
        Sprint
      </label>
      <select
        id="sprint-select"
        className="sprint_select"
        value={isForcedSprint ? String(current.number) : "active"}
        onChange={handleSelect}
        disabled={isPending}
      >
        <option value="active">Active sprint</option>
        {recentSprints.map((sprint) => (
          <option key={sprint.id || sprint.number} value={sprint.number}>
            {sprint.name}
            {sprint.state === "active" ? " · active" : ""}
          </option>
        ))}
        {!recentSprints.some((sprint) => sprint.number === current.number) && (
          <option value={current.number}>{current.name}</option>
        )}
      </select>
      <button
        type="button"
        className="refresh_button"
        onClick={handleRefresh}
        disabled={isPending}
      >
        {isPending ? "Loading…" : "Refresh"}
      </button>
      <span className="cache_hint" title={fetchedAt}>
        {formatCachedAt(fetchedAt)}
      </span>
    </div>
  );
};

export default SprintControls;
