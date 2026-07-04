# Task NNN: <Feature Title>

> Copy this file into `tasks/backlog/NNN-slug.md`, fill in every section, and remove this
> blockquote before assigning it to an agent.

## Goal

<One or two sentences: what new capability does this add, stated as an outcome, not a list of
file changes.>

## Context

<Why this task exists now — link to the relevant `backlog.md` item, and any relevant state of
the code today (e.g. "cli.ts currently has X; this task adds Y on top of it"). Reference
`architecture.md`/`decisions.md` sections if relevant.>

## Acceptance Criteria

<Concrete, checkable statements. Each one should be verifiable by running a specific command or
inspecting specific output — not vague ("works well").>

- [ ] <criterion 1>
- [ ] <criterion 2>
- [ ] <criterion 3>

## Done Means

<Restate plainly: this task is done only when every acceptance criterion above is verified
(commands run, output checked) and a completion report is appended below — not when code has
merely been written.>

## Files likely affected

<Best-guess list of files/modules. The Implementation Agent may need to touch adjacent files,
but should flag anything far outside this list as a scope concern.>

- `<path/to/file>`

## Tests to run

<Exact commands to run before claiming this task is complete.>

- `pnpm build`
- `pnpm test`
- `pnpm tsx src/cli.ts <relevant command>`

## Non-goals

<Explicitly out of scope for this task, even if related. Prevents scope creep.>

- <e.g. "Does not add the JSON reporter — that's a separate backlog item.">

## Suggested agent

<Implementation Agent / QA Agent / Release Agent>

---

## Completion Report

<Appended by the agent once work is done or blocked. Use `templates/completion-report.md`.>
