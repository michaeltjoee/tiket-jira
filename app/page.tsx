import { Suspense } from "react";

import SprintLedger from "@/components/SprintLedger";
import {
  hasJiraCredentials,
  loadSprintBoard,
  JiraApiError,
  JiraConfigError,
} from "@/lib/jira";

type Props = {
  searchParams: Promise<{ sprint?: string }>;
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

const ErrorState = ({ message }: { message: string }) => (
  <div className="shell">
    <header className="ledger_header">
      <div className="header_copy">
        <p className="eyebrow">Sphinx · PLAT · Michael</p>
        <h1 className="sprint_title">Sprint ledger</h1>
      </div>
    </header>
    <p className="error_box">{message}</p>
  </div>
);

const parseSprintParam = (raw: string | undefined): number | undefined => {
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
};

export default async function Home({ searchParams }: Props) {
  if (!hasJiraCredentials()) {
    return <SetupState />;
  }

  const params = await searchParams;
  const sprintNumber = parseSprintParam(params.sprint);

  try {
    const data = await loadSprintBoard(sprintNumber);

    return (
      <main className="shell">
        <Suspense fallback={null}>
          <SprintLedger data={data} />
        </Suspense>
      </main>
    );
  } catch (error) {
    if (error instanceof JiraConfigError || error instanceof JiraApiError) {
      return <ErrorState message={error.message} />;
    }
    if (error instanceof Error) {
      return <ErrorState message={error.message} />;
    }
    return <ErrorState message="Failed to load sprint board." />;
  }
}
