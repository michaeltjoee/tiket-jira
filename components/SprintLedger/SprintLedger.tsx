import SprintControls from "@/components/SprintControls";
import {
  dueMark,
  formatDevRangeLabel,
  formatEffort,
  formatTodayLabel,
  statusTone,
  todayIsoDate,
  type DueMark,
  type LedgerParent,
} from "@/lib/services/shared/jira";
import type { SprintBoardData } from "@/lib/services/shared/getDashboardData";

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

const StatusCell = ({ name, category }: { name: string; category: string }) => {
  const tone = statusTone(name, category);
  return (
    <span className={`status status_${tone}`} title={name}>
      <span className="status_mark" aria-hidden="true" />
      <span className="status_name">{name}</span>
    </span>
  );
};

const DateCell = ({
  startDate,
  endDate,
  mark,
}: {
  startDate: string | null;
  endDate: string | null;
  mark: DueMark | null;
}) => {
  const range = formatDevRangeLabel(startDate, endDate);
  const isGap = !range;
  const stamp = mark === "late" ? "Late" : mark === "due" ? "Due" : null;
  const title = isGap
    ? "Missing dev dates"
    : mark === "due"
      ? "Due today"
      : mark === "late"
        ? "Past due"
        : undefined;

  return (
    <span
      className={`cell range_cell${isGap ? " gap" : ""}${mark ? ` ${mark}` : ""}`}
      title={title}
    >
      <span className="range_value">{isGap ? "—" : range}</span>
      {stamp ? <span className="due_stamp">{stamp}</span> : null}
    </span>
  );
};

const tallyDue = (parents: LedgerParent[]) => {
  let dueToday = 0;
  let late = 0;

  for (const parent of parents) {
    const parentMark = dueMark(parent.devEndDate, parent.status);
    if (parentMark === "due") dueToday += 1;
    else if (parentMark === "late") late += 1;

    for (const subtask of parent.subtasks) {
      const subMark = dueMark(subtask.devEndDate, subtask.status);
      if (subMark === "due") dueToday += 1;
      else if (subMark === "late") late += 1;
    }
  }

  return { dueToday, late };
};

const ParentBlock = ({ parent }: { parent: LedgerParent }) => {
  const effortLabel = formatEffort(parent.effort);
  const parentDue = dueMark(parent.devEndDate, parent.status);

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
        <StatusCell
          name={parent.status ?? "—"}
          category={parent.statusCategory ?? "unknown"}
        />
        <GapCell
          className="cell effort_cell"
          value={effortLabel}
          label="effort"
        />
        <DateCell
          startDate={parent.devStartDate}
          endDate={parent.devEndDate}
          mark={parentDue}
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
          <StatusCell
            name={subtask.status ?? "—"}
            category={subtask.statusCategory ?? "unknown"}
          />
          <span className="cell effort_cell muted" aria-hidden="true" />
          <DateCell
            startDate={subtask.devStartDate}
            endDate={subtask.devEndDate}
            mark={dueMark(subtask.devEndDate, subtask.status)}
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
  const today = new Date();
  const todayIso = todayIsoDate(today);
  const todayLabel = formatTodayLabel(today);
  const { dueToday, late } = tallyDue(data.parents);

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
            <span className="dot" aria-hidden="true">
              ·
            </span>
            <time className="today" dateTime={todayIso}>
              {todayLabel}
            </time>
            {dueToday > 0 ? (
              <>
                <span className="dot" aria-hidden="true">
                  ·
                </span>
                <span className="due_meta">{dueToday} due</span>
              </>
            ) : null}
            {late > 0 ? (
              <>
                <span className="dot" aria-hidden="true">
                  ·
                </span>
                <span className="due_meta">{late} late</span>
              </>
            ) : null}
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
