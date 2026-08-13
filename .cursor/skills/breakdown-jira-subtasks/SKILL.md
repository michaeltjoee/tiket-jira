---
name: breakdown-jira-subtasks
description: >-
  Analyze a PLAT issue, propose hybrid Dev/E2E Jira Sub-tasks with Dev Effort
  recommendations, create them after one confirmation, then always set Dev
  Assignee to Michael Tjoe (no second ask). Use when the user runs
  /breakdown-jira-subtasks, asks to break down a ticket into subtasks, or after
  /triage reaches ready-for-agent or ready-for-human.
disable-model-invocation: true
argument-hint: '{issue-key}'
---

# Breakdown Jira Subtasks

Analyze a PLAT parent issue, propose Sub-tasks if needed, create after **one** confirmation gate, then **always** set Dev Assignee to Michael Tjoe — **no second ask**.

## Argument

`/breakdown-jira-subtasks {issue-key}` (e.g. `PLAT-57746`).

- If `{issue-key}` is missing, ask for it and stop.
- After `/triage` reaches `ready-for-agent` or `ready-for-human`, **offer** this skill as the next step (still wait for the user to continue).

## Rules (locked)

| Rule                | Value                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Gates               | **(1) only** — Sub-task plan / create. Ask before create writes.                                                            |
| Dev Assignee        | **Always** set after gate 1 (or when covered / create-nothing) — **do not ask**. Michael only (`customfield_10889`)         |
| Existing cover work | Create nothing; still set Dev Assignee on parent + existing Sub-tasks                                                       |
| Slice               | Hybrid `[Dev]` chunks; split Dev only when independent                                                                      |
| E2E Sub-task        | **Always ask** yes/no in analysis (even if `[QA]` exists). If yes → title `E2E test - {parent summary short}`               |
| Dev Effort          | Recommend + confirm per Sub-task (including E2E). Write `customfield_10893` on create. Units: `0.5` = half day, `1` = 1 day |
| QA Effort           | **Ignore** — do not set `customfield_10894`                                                                                 |
| Parent effort       | **Never** update parent Dev Effort                                                                                          |
| Scope               | Parent + **all** Sub-tasks (existing + new) for Dev Assignee                                                                |
| Board Assignee      | **Never** edit                                                                                                              |
| Comments            | **None**                                                                                                                    |
| Sub-task sprint     | **Do not** set `customfield_10005` — subtasks inherit parent sprint                                                         |

Read field IDs and Michael’s accountId from `docs/agents/issue-tracker.md` — do not invent them.

## Steps

1. **Read config** — `docs/agents/issue-tracker.md` (and `docs/agents/triage-labels.md` if labels are relevant).

2. **Fetch parent** — Atlassian MCP `getJiraIssue` for `{issue-key}`: summary, description, sprint, labels, Dev Assignee (`customfield_10889`), Dev Effort (`customfield_10893`), board `assignee`, and existing `subtasks` (summaries + keys).

3. **Explore codebase** — enough to draft a real breakdown. Respect `docs/agents/domain.md` / CONTEXT if present.

4. **Present analysis** (no writes yet):

   - What the work is (current vs desired behavior, key interfaces)
   - Existing Sub-tasks and whether they **already cover** the Dev work
   - Proposed new `[Dev]` Sub-tasks for **gaps**: title, short scope, acceptance criteria
   - **Always ask:** add an E2E / manual-testing Sub-task? If yes, include `E2E test - {parent summary short}` in the plan (skip create if an equivalent already exists and covers it)
   - For **each** proposed Sub-task (Dev + E2E if any): recommend **Dev Effort** in mandays (`0.5`, `1`, …) with a one-line rationale; ask the user to confirm or override
   - If Dev work already covered and user declines E2E: state “create nothing”
   - Note: after approve, Dev Assignee will be set to Michael on parent + all Sub-tasks (no further ask)

   **Gate 1 — stop.** Ask: continue to create Sub-tasks with the confirmed efforts (or confirm skip if covered)?

5. **On gate 1 approve**:

   - **Covered / nothing to create** → skip creates; go to step 6.
   - **Gaps** → for each approved Sub-task, `createJiraIssue` with:
     - `projectKey`: `PLAT`
     - `issueTypeName`: `Sub-task`
     - `parent`: parent key
     - `summary` / `description` from the approved plan
     - `additional_fields` (required PLAT Sub-task fields + effort):
       ```json
       {
         "customfield_10885": { "id": "10955" },
         "customfield_10911": { "id": "11001" },
         "customfield_10912": { "id": "10775" },
         "customfield_10893": <confirmed mandays>
       }
       ```
       - Platforms `Responsive` (`10955`), Tribe `Platform - Sphinx` (`11001`), Subtask type `Dev` (`10775`). Use `10776` for QA only if the approved Sub-task is explicitly QA/E2E-of-type-QA.
       - **Do not** set sprint (`customfield_10005`).
   - Do **not** set board `assignee`, QA Effort, or parent Dev Effort.

6. **Set Dev Assignee immediately (no ask)** — for parent + **all** Sub-task keys (existing + newly created), `editJiraIssue` with **only**:

   ```json
   { "customfield_10889": [{ "accountId": "<Michael from issue-tracker.md>" }] }
   ```

   Never include `assignee`. Never add Jira comments.

7. **Report** — keys created (with Dev Effort), and keys whose Dev Assignee was updated to Michael Tjoe.

## Completion

Done when gate 1 finished and Dev Assignee was set (or the user declined gate 1 — then stop with no writes).

## Out of scope

- Sibling tickets / `/to-tickets` (blocking edges)
- Changing board Assignee, Product Assignee, status, triage labels, or QA Effort
- Updating parent Dev Effort / Total Efforts
- Posting comments on the parent or Sub-tasks
- Asking for a second confirmation before Dev Assignee
