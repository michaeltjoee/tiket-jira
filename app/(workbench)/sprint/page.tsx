import type { Metadata } from "next";
import { Suspense } from "react";

import LedgerLoader from "@/components/LedgerLoader";
import SprintBoard from "@/components/SprintBoard";
import { hasJiraCredentials } from "@/lib/jira";

export const metadata: Metadata = {
  title: "Sprint ledger",
};

const SetupState = () => (
  <div className="shell">
    <header className="ledger_header">
      <div className="header_copy">
        <p className="eyebrow">Sphinx · PLAT · Michael</p>
        <h1 className="sprint_title">Sprint ledger</h1>
      </div>
    </header>
    <div className="setup">
      <p>Add Jira credentials to load your board.</p>
      <ol className="setup_list">
        <li>
          Copy <code>.env.example</code> to <code>.env.local</code>
        </li>
        <li>
          Set <code>JIRA_EMAIL</code> and <code>JIRA_API_TOKEN</code>
        </li>
        <li>
          Restart <code>pnpm run dev</code>
        </li>
      </ol>
    </div>
  </div>
);

export default function SprintPage() {
  if (!hasJiraCredentials()) {
    return <SetupState />;
  }

  return (
    <Suspense fallback={<LedgerLoader />}>
      <SprintBoard />
    </Suspense>
  );
}
