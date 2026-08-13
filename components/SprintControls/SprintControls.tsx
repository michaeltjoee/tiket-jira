"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { SprintRef } from "@/lib/jira";

type Props = {
  current: SprintRef;
  recentSprints: SprintRef[];
};

const SprintControls = ({ current, recentSprints }: Props) => {
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
    startTransition(() => {
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
    </div>
  );
};

export default SprintControls;
