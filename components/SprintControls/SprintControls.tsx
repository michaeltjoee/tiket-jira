"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { SprintRef } from "@/lib/jira/types";

type Props = {
  current: SprintRef;
  recentSprints: SprintRef[];
  fetchedAt: string;
  isRefreshing: boolean;
  onRefresh: () => void | Promise<void>;
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

const SprintControls = ({
  current,
  recentSprints,
  fetchedAt,
  isRefreshing,
  onRefresh,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const isForcedSprint = searchParams.has("sprint");
  const isBusy = isPending || isRefreshing;

  const goToSprint = (number: number | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (number === null) {
        params.delete("sprint");
      } else {
        params.set("sprint", String(number));
      }
      const query = params.toString();
      router.push(query ? `/sprint?${query}` : "/sprint");
    });
  };

  const handleRefresh = () => {
    void onRefresh();
  };

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "active") {
      goToSprint(null);
      return;
    }
    goToSprint(Number(value));
  };

  const inPicker = recentSprints.some(
    (sprint) => sprint.number === current.number,
  );
  const selectValue = isForcedSprint ? String(current.number) : "active";

  return (
    <div className="controls">
      <label className="control_label" htmlFor="sprint-select">
        Sprint
      </label>
      <select
        id="sprint-select"
        className="sprint_select"
        value={selectValue}
        onChange={handleSelect}
        disabled={isBusy}
      >
        <option value="active">Active sprint</option>
        {recentSprints.map((sprint) => (
          <option key={sprint.id || sprint.number} value={sprint.number}>
            {sprint.name}
            {sprint.state === "active" ? " · active" : ""}
          </option>
        ))}
        {isForcedSprint && !inPicker ? (
          <option value={current.number} disabled>
            {current.name}
          </option>
        ) : null}
      </select>
      <button
        type="button"
        className="refresh_button"
        onClick={handleRefresh}
        disabled={isBusy}
      >
        {isBusy ? "Loading…" : "Refresh"}
      </button>
      <span className="cache_hint" title={fetchedAt}>
        {formatCachedAt(fetchedAt)}
      </span>
    </div>
  );
};

export default SprintControls;
