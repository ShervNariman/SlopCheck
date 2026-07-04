# Task NNN: <Bug Title>

> Copy this file into `tasks/backlog/NNN-slug.md`, fill in every section, and remove this
> blockquote before assigning it to an agent.

## Goal

<One or two sentences describing the bug and the desired correct behavior.>

## Context

<How the bug was found (manual testing, QA report, user report). Include exact
repro steps/input and the actual vs. expected output. Reference the relevant task/file where
the bug lives if known.>

**Repro:**

```
<exact command(s) and input that trigger the bug>
```

**Expected:** <what should happen>

**Actual:** <what actually happens>

## Acceptance Criteria

- [ ] The repro steps above no longer produce the incorrect behavior.
- [ ] A test is added that would have caught this bug (regression test).
- [ ] No other previously-passing behavior regresses (`pnpm test` still fully passes).
- [ ] <any additional criteria specific to this bug>

## Done Means

<This task is done only when the bug is fixed, a regression test exists and passes, the full
test suite still passes, and a completion report is appended below.>

## Files likely affected

- `<path/to/file>`

## Tests to run

- `pnpm build`
- `pnpm test`
- `<exact repro command, re-run to confirm fix>`

## Non-goals

<Explicitly avoid unrelated cleanup/refactoring while fixing this bug, unless necessary to fix
it correctly.>

- <e.g. "Does not refactor surrounding code beyond what's needed to fix this bug.">

## Suggested agent

<Implementation Agent (fix) — QA Agent should verify>

---

## Completion Report

<Appended by the agent once work is done or blocked. Use `templates/completion-report.md`.>
