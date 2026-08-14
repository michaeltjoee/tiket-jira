"use client";

import { useSearchParams } from "next/navigation";

import LedgerLoader from "@/components/LedgerLoader";
import SprintLedger from "@/components/SprintLedger";
import { parseSprintParam } from "@/lib/jira/parse-sprint";
import { useSprintBoard } from "@/lib/query/use-sprint-board";

const SprintShell = ({ children }: { children: React.ReactNode }) => (
  <div className="shell">
    <header className="ledger_header">
      <div className="header_copy">
        <p className="eyebrow">Sphinx · PLAT · Michael</p>
        <h1 className="sprint_title">Sprint ledger</h1>
      </div>
    </header>
    {children}
  </div>
);

const SprintBoard = () => {
  const searchParams = useSearchParams();
  const sprintNumber = parseSprintParam(searchParams.get("sprint"));
  const { data, isPending, isFetching, error, refresh } =
    useSprintBoard(sprintNumber);

  if (isPending) {
    return <LedgerLoader />;
  }

  if (error || !data) {
    return (
      <SprintShell>
        <p className="error_box">
          {error instanceof Error
            ? error.message
            : "Failed to load sprint board."}
        </p>
      </SprintShell>
    );
  }

  return (
    <main className="shell">
      <SprintLedger data={data} isRefreshing={isFetching} onRefresh={refresh} />
    </main>
  );
};

export default SprintBoard;
