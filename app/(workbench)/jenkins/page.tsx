import type { Metadata } from "next";

import JenkinsLinks from "@/components/JenkinsLinks";
import { JENKINS_LINKS } from "@/lib/jenkins";

export const metadata: Metadata = {
  title: "Jenkins",
};

export default function JenkinsPage() {
  return (
    <main className="shell">
      <header className="ledger_header">
        <div className="header_copy">
          <h1 className="sprint_title">Jenkins</h1>
          <p className="meta">Opens the Jenkins job in a new tab.</p>
        </div>
      </header>
      <JenkinsLinks links={JENKINS_LINKS} />
    </main>
  );
}
