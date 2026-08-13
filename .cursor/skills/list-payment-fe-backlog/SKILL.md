---
name: list-payment-fe-backlog
description: List Payment FE Jira backlog issues for a Sphinx Sprint, then hand off into triage. Use when the user runs /list-payment-fe-backlog with a sprint number (e.g. /list-payment-fe-backlog 87).
disable-model-invocation: true
argument-hint: '{sprint-number}'
---

# List Payment FE Backlog

Thin router: resolve the sprint, list the Payment backlog for that sprint, then continue under `/triage`.

## Argument

The user invokes `/list-payment-fe-backlog {n}` where `{n}` is the sprint number (e.g. `87`).

- Sprint name is always `Sphinx Sprint {n}` (e.g. `Sphinx Sprint 87`).
- If `{n}` is missing or not a number, ask for it and stop.

## Steps

1. **Read tracker config** — load `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`.
2. **Read triage** — load and follow the `/triage` skill (`~/.claude/skills/triage/SKILL.md`).
3. **Execute triage in list mode** with this instruction (substitute `{n}`):

   > list down all issue on payment backlog on sprint {n}

   Concretely:

   - Query Jira via MCP (`user-jira` / `user-atlassian`) using the **Sprint-scoped JQL** from `docs/agents/issue-tracker.md` with sprint name `Sphinx Sprint {n}`.
   - Present the full Payment backlog for that sprint (key, summary, status, triage labels if any), oldest first.
   - Then apply triage's **"Show what needs attention"** bucketing on that same set (Unlabeled / `needs-triage` / `needs-info` with reporter activity).

4. **Hand off** — let the maintainer pick an issue; continue the rest of the session as a normal `/triage` run on their choice.

## Completion

Done when the sprint-scoped list and attention buckets are shown and the maintainer can pick an item. Do not triage a specific issue until they pick one.
