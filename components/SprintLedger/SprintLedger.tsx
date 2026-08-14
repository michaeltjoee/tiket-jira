import SprintControls from "@/components/SprintControls";
import { formatEffort } from "@/lib/jira/format";
import type { LedgerParent, SprintBoardData } from "@/lib/jira/types";

type Props = {
  data: SprintBoardData;
  isRefreshing: boolean;
  onRefresh: () => void | Promise<void>;
};

const GapCell = ({
  className,
  value,
  label,
}: {
  className: string;
  value: string;
  label: string;
}) => {
  const isGap = !value;
  return (
    <span
      className={`${className}${isGap ? " gap" : ""}`}
      title={isGap ? `Missing ${label}` : undefined}
    >
      {isGap ? "—" : value}
    </span>
  );
};

const ParentBlock = ({ parent }: { parent: LedgerParent }) => {
  const effortLabel = formatEffort(parent.effort);

  return (
    <article className="parent_block">
      <div className="row parent_row">
        <a
          className="key"
          href={parent.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {parent.key}
        </a>
        <a
          className="summary"
          href={parent.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {parent.summary}
        </a>
        <span className="status">{parent.status}</span>
        <GapCell
          className="cell effort_cell"
          value={effortLabel}
          label="effort"
        />
        <GapCell
          className="cell range_cell"
          value={parent.devRangeLabel ?? ""}
          label="dev dates"
        />
      </div>
      {parent.subtasks.map((subtask) => (
        <div className="row subtask_row" key={subtask.key}>
          <a
            className="key"
            href={subtask.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {subtask.key}
          </a>
          <a
            className="summary"
            href={subtask.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {subtask.summary}
          </a>
          <span className="status muted" aria-hidden="true" />
          <span className="cell effort_cell muted" aria-hidden="true" />
          <GapCell
            className="cell range_cell"
            value={subtask.devRangeLabel ?? ""}
            label="dev dates"
          />
        </div>
      ))}
    </article>
  );
};

const SprintLedger = ({ data, isRefreshing, onRefresh }: Props) => {
  const effortDisplay = Number.isInteger(data.totalEffort)
    ? String(data.totalEffort)
    : data.totalEffort.toFixed(1).replace(/\.0$/, "");

  return (
    <div className="ledger">
      <header className="ledger_header">
        <div className="header_copy">
          <p className="eyebrow">Sphinx · PLAT · Michael</p>
          <h1 className="sprint_title">{data.sprint.name}</h1>
          <p className="meta">
            {data.parentCount} parent{data.parentCount === 1 ? "" : "s"}
            <span className="dot" aria-hidden="true">
              ·
            </span>
            {data.subtaskCount} subtask{data.subtaskCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="effort_block">
          <p className="effort_value">
            {effortDisplay}
            <span className="effort_unit">md</span>
          </p>
          <p className="effort_label">Dev effort</p>
        </div>
      </header>

      <SprintControls
        current={data.sprint}
        recentSprints={data.recentSprints}
        fetchedAt={data.fetchedAt}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="column_head" aria-hidden="true">
        <span>Key</span>
        <span>Summary</span>
        <span>Status</span>
        <span>Effort</span>
        <span>Dev</span>
      </div>

      {data.parents.length === 0 ? (
        <p className="empty">
          No Story/Bug with Dev Assignee Michael on {data.sprint.name}.
        </p>
      ) : (
        <div className="parent_list">
          {data.parents.map((parent) => (
            <ParentBlock key={parent.key} parent={parent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SprintLedger;
