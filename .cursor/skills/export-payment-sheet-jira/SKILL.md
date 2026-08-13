---
name: export-payment-sheet-jira
description: >-
  Export a timesheet-style CSV of PLAT Story/Bug parents (and their subtasks)
  for Michael Tjoe on a Sphinx Sprint. Use when the user runs
  /export-payment-sheet-jira with a sprint number (e.g. /export-payment-sheet-jira 87)
  or asks to export a payment Jira sheet / timesheet CSV for a sprint.
disable-model-invocation: true
argument-hint: '{sprint-number}'
---

# Export Payment Sheet Jira

Thin router: resolve `Sphinx Sprint {n}`, query parents with Dev Assignee = Michael Tjoe, emit a CSV matching the timesheet layout (P in col A, S in col B).

## Argument

The user invokes `/export-payment-sheet-jira {n}` where `{n}` is the sprint number (e.g. `87`).

- Sprint name is always `Sphinx Sprint {n}` (e.g. `Sphinx Sprint 87`).
- If `{n}` is missing or not a number, **ask for it and stop**. Never guess the sprint.

## Locked defaults (from `docs/agents/issue-tracker.md`)

| Field        | Value                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Project      | `PLAT`                                                                                          |
| Host         | `https://borobudur.atlassian.net`                                                               |
| Parents      | `Story` and `Bug` only                                                                          |
| Dev Assignee | Michael Tjoe — `631808e78d88ec800fbfcabc` on `customfield_10889` (**hard-locked**, no override) |
| Dev Effort   | Parent only — `customfield_10893` (mandays)                                                     |
| Due date     | Jira `duedate` if set, else empty (manual timesheet fill)                                       |
| Status       | **All** statuses (no Done/open filter)                                                          |
| Output       | `sprints/payment-sheet-sprint-{n}.csv` (overwrite; `sprints/` is gitignored)                    |

## CSV layout

No header row. Columns:

| Col | Parent row                           | Subtask row                           |
| --- | ------------------------------------ | ------------------------------------- |
| A   | Parent browse URL                    | empty                                 |
| B   | empty                                | Subtask browse URL                    |
| C   | Parent Dev Effort (or empty)         | empty                                 |
| D   | Parent `duedate` as `D MMM` or empty | Subtask `duedate` as `D MMM` or empty |

- Browse URL: `https://borobudur.atlassian.net/browse/{KEY}`
- Date format: English `D MMM` (e.g. `4 Aug`, `13 Aug`) — no year
- After each parent group (parent + its subtask rows), insert **one fully empty row**
- If a parent has no subtasks: emit only the parent row, then the spacer

Example shape:

```csv
https://borobudur.atlassian.net/browse/PLAT-57746,,0.5,4 Aug
,https://borobudur.atlassian.net/browse/PLAT-57865,,

https://borobudur.atlassian.net/browse/PLAT-57752,,1.5,
,https://borobudur.atlassian.net/browse/PLAT-57872,,4 Aug
,https://borobudur.atlassian.net/browse/PLAT-57873,,5 Aug
```

## Steps

1. **Read tracker config** — load `docs/agents/issue-tracker.md` (field IDs + Michael accountId). Do not invent them.

2. **Resolve sprint gate** — require numeric `{n}` → `Sphinx Sprint {n}`. If missing/invalid, ask and stop.

3. **Query parents** — Atlassian MCP `searchJiraIssuesUsingJql`:

   - `cloudId`: `borobudur.atlassian.net`
   - JQL:

     ```
     project = PLAT AND sprint = "Sphinx Sprint {n}" AND issuetype in (Story, Bug) AND "Dev Assignee" = "631808e78d88ec800fbfcabc" ORDER BY duedate ASC
     ```

   - `fields`: include at least `key`, `summary`, `issuetype`, `duedate`, `subtasks`, `customfield_10893`, `customfield_10889`
   - Paginate with `nextPageToken` until exhausted (`maxResults` 50–100)

4. **Zero matches** — if no parents: **do not** write a CSV. Stop with: `no Story/Bug with Dev Assignee Michael on Sphinx Sprint {n}`. Never invent another sprint.

5. **Resolve subtasks** — for each parent, collect all `subtasks` (any assignee). Fetch due dates for child keys (batch JQL `key in (...)` or per-issue `getJiraIssue` as needed). Include every subtask; if none, parent-only row.

6. **Sort**

   - Parents: `duedate` ASC; parents with empty due date **last**
   - Within a parent: subtasks `duedate` ASC; empty due date **last**

7. **Write CSV** — create `sprints/` if needed. Overwrite `sprints/payment-sheet-sprint-{n}.csv` silently (no confirm gate). Proper CSV escaping if a value ever contains commas/quotes (URLs/numbers normally do not).

8. **Report** — absolute file path, parent count, subtask count, sum of parent Dev Effort (treat missing effort as 0 for the sum only; still leave col C empty on that row). Done.

## Out of scope

- Creating or editing Jira issues
- Filtering by board Assignee (Iwan)
- Other Dev Assignees / optional second arg
- Pasting full CSV body into chat (file only)
- Committing anything under `sprints/`
