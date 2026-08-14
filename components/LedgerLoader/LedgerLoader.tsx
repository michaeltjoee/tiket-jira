import type { CSSProperties } from "react";

const GHOST_PARENTS = [
  { id: "1", parentStep: 0, subtaskSteps: [1] },
  { id: "2", parentStep: 2, subtaskSteps: [3, 4] },
  { id: "3", parentStep: 5, subtaskSteps: [6] },
] as const;

const GhostRow = ({
  kind,
  step,
}: {
  kind: "parent" | "subtask";
  step: number;
}) => (
  <div
    className={`row loader_row ${kind === "subtask" ? "subtask_row" : "parent_row"}`}
    style={{ "--loader-step": String(step) } as CSSProperties}
    aria-hidden="true"
  >
    <span className="key loader_key">
      <span className="loader_stamp">
        <span className="loader_stamp_mark" />
      </span>
      PLAT-····
    </span>
    <span className="summary loader_rule" />
    {kind === "parent" ? (
      <>
        <span className="status loader_rule loader_rule_short" />
        <span className="cell effort_cell">—</span>
      </>
    ) : (
      <>
        <span className="status muted" />
        <span className="cell effort_cell muted" />
      </>
    )}
    <span className="cell range_cell loader_rule loader_rule_date" />
  </div>
);

const LedgerLoader = () => (
  <main
    className="shell"
    role="status"
    aria-busy="true"
    aria-label="Posting tickets from Jira"
  >
    <div className="ledger">
      <header className="ledger_header">
        <div className="header_copy">
          <p className="eyebrow">Sphinx · PLAT · Michael</p>
          <h1 className="sprint_title">Sprint ledger</h1>
          <p className="meta">Posting tickets from Jira</p>
        </div>
        <div className="effort_block">
          <p className="effort_value">
            —<span className="effort_unit">md</span>
          </p>
          <p className="effort_label">Dev effort</p>
        </div>
      </header>

      <div className="column_head" aria-hidden="true">
        <span>Key</span>
        <span>Summary</span>
        <span>Status</span>
        <span>Effort</span>
        <span>Dev</span>
      </div>

      <div className="loader_post">
        <div className="parent_list">
          {GHOST_PARENTS.map((parent) => (
            <article className="parent_block loader_block" key={parent.id}>
              <GhostRow kind="parent" step={parent.parentStep} />
              {parent.subtaskSteps.map((subtaskStep) => (
                <GhostRow
                  key={`${parent.id}-${subtaskStep}`}
                  kind="subtask"
                  step={subtaskStep}
                />
              ))}
            </article>
          ))}
        </div>
      </div>
    </div>
  </main>
);

export default LedgerLoader;
