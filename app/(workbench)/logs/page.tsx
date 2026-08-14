import type { Metadata } from "next";

import LoggerLinks from "@/components/LoggerLinks";
import { LOGGER_LINKS } from "@/lib/logger";

export const metadata: Metadata = {
  title: "Logs",
};

export default function LogsPage() {
  return (
    <main className="shell">
      <header className="ledger_header">
        <div className="header_copy">
          <h1 className="sprint_title">Logs</h1>
          <p className="meta">Opens the logger in a new tab.</p>
        </div>
      </header>
      <LoggerLinks links={LOGGER_LINKS} />
    </main>
  );
}
