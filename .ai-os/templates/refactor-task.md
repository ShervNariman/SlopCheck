# Task NNN: <Refactor Title>

> Copy this file into `tasks/backlog/NNN-slug.md`, fill in every section, and remove this
> blockquote before assigning it to an agent.

## Goal

<One or two sentences: what structural change is being made, and why the current structure is
a problem. Refactors change *shape*, not *behavior* — the observable behavior of the CLI should
be identical before and after, unless explicitly stated otherwise.>

## Context

<What does the code look like today (cite specific files/functions), what's wrong with it per
`architecture.md`, and what should it look like after. Reference the relevant `backlog.md` item
and any `decisions.md` entries this refactor is aligning with.>

## Acceptance Criteria

<Concrete, checkable statements, including explicit "behavior unchanged" checks alongside the
structural ones.>

- [ ] <structural criterion, e.g. "X logic moved out of Y into Z">
- [ ] <behavior-preservation criterion, e.g. "command output is identical to before">
- [ ] <criterion 3>

## Done Means

<This task is done only when the new structure exists, all prior behavior is verified
unchanged, and every acceptance criterion is verified with a completion report appended
below.>

## Files likely affected

<Best-guess list of files being split/moved/created.>

- `<path/to/file>`

## Tests to run

<Exact commands, including a before/after behavior comparison if reasonable
(e.g. run the CLI against a known diff before and after and confirm identical output).>

- `pnpm build`
- `pnpm test`
- `pnpm tsx src/cli.ts <relevant command>`

## Non-goals

<What this refactor explicitly does NOT change, even if tempting.>

- <e.g. "Does not change any rule detection logic or severities.">

## Suggested agent

<Implementation Agent>

---

## Completion Report

<Appended by the agent once work is done or blocked. Use `templates/completion-report.md`.>
