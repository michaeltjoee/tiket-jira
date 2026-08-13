---
name: create-payment-task
description: >-
  Create a PLAT Payment Story on a Sphinx Sprint via Jira MCP, assigned to the
  Payment backlog owner. Use when the user runs /create-payment-task with a
  sprint number (e.g. /create-payment-task 87) or asks to create a Payment
  backlog task for a Sphinx Sprint.
disable-model-invocation: true
argument-hint: '{sprint-number}'
---

# Create Payment Task

Thin router: resolve the Sphinx Sprint, confirm the issue fields, then create a PLAT **Story** via Jira MCP using `docs/agents/issue-tracker.md`.

## Argument

The user invokes `/create-payment-task {n}` where `{n}` is the sprint number (e.g. `87`).

- Sprint name is always `Sphinx Sprint {n}` (e.g. `Sphinx Sprint 87`).
- If `{n}` is missing or not a number, **ask for it and stop**. Never guess the sprint.
- The **summary** (and optional description) come from the user message. If summary is missing, **ask for it and stop**.
- PLAT requires **description** — if the user did not provide one, use a short sentence derived from the summary (do not block create solely for a missing description).

## Locked defaults (from `docs/agents/issue-tracker.md` + PLAT create meta)

PLAT has **no `Task` issue type**. Payment backlog items are created as **Story** (use `Bug` only if the user explicitly asks).

| Field                       | Value                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| Project                     | `PLAT`                                                                                                 |
| Issue type                  | `Story`                                                                                                |
| Board Assignee              | Rahmat Kurniawan (Iwan) — `60fe6725ae72b2006fdc888b` via `assignee_account_id`                         |
| Product Assignee            | Same Iwan accountId on `customfield_10888` (required by PLAT)                                          |
| Tribe                       | `Platform - Sphinx` — `customfield_10911` option id `11001`                                            |
| Platforms                   | `Responsive` — `customfield_10885` option id `10955`                                                   |
| Journey                     | `Product Backlog` — `customfield_10898` option id `10708`                                              |
| Story Type                  | Default `Tech Stack - Tech Foundation` — `customfield_10904` option id `14383` (override if user asks) |
| Sprint                      | `Sphinx Sprint {n}` on `customfield_10005`                                                             |
| Dev Assignee                | Michael Tjoe — `631808e78d88ec800fbfcabc` on `customfield_10889` (multi-user; override if user asks)   |
| Dev Effort / QA Effort      | **Do not set** unless the user explicitly asks                                                         |
| Board Assignee after create | **Never** change unless the user explicitly asks                                                       |

## Steps

1. **Read tracker config** — load `docs/agents/issue-tracker.md`.

2. **Resolve inputs**

   - Sprint number `{n}` → name `Sphinx Sprint {n}`.
   - Summary (required) and description (optional) from the user.
   - If anything required is missing, ask and stop.

3. **Resolve sprint field ID**

   - Sprint lives on `customfield_10005`.
   - Get the numeric sprint id for `Sphinx Sprint {n}` by reading `customfield_10005` from any open PLAT issue already on that sprint (Sprint-scoped JQL from issue-tracker).
   - If the sprint cannot be found, stop and tell the user — do not create without a sprint.

4. **Confirm before write** — show summary, description, Story type, assignee, Product Assignee, Dev Assignee, Tribe, Platforms, Journey, Story Type, sprint name + id. Ask: create this Story?

5. **On approve** — Atlassian MCP `createJiraIssue`:

   - `cloudId`: `borobudur.atlassian.net`
   - `projectKey`: `PLAT`
   - `issueTypeName`: `Story` (or `Bug` if user asked)
   - `summary` / `description` (markdown)
   - `assignee_account_id`: `60fe6725ae72b2006fdc888b`
   - `additional_fields`:
     ```json
     {
       "customfield_10005": <sprintId>,
       "customfield_10885": { "id": "10955" },
       "customfield_10888": { "accountId": "60fe6725ae72b2006fdc888b" },
       "customfield_10889": [{ "accountId": "631808e78d88ec800fbfcabc" }],
       "customfield_10898": { "id": "10708" },
       "customfield_10904": { "id": "14383" },
       "customfield_10911": { "id": "11001" }
     }
     ```
   - If create fails on required fields, call `getJiraIssueTypeMetaWithFields` for Story and fill only what PLAT requires — do not invent unrelated fields.

6. **Report** — key, URL (`https://borobudur.atlassian.net/browse/{KEY}`), sprint, board assignee, Dev Assignee. No further triage unless the user asks.

## Completion

Done when the Story exists on `Sphinx Sprint {n}` with board Assignee = Iwan and Dev Assignee = Michael Tjoe (unless overridden), or the user declined create / inputs were incomplete.

## Out of scope

- Creating Sub-tasks (`/breakdown-jira-subtasks`)
- Listing backlog (`/list-payment-fe-backlog`)
- Changing Dev Effort, QA Effort, board Assignee, or status unless explicitly requested
- Guessing sprint number
