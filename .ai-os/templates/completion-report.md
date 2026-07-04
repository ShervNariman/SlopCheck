# Completion Report Template

> Append a filled-in copy of this section to the bottom of the task file when work stops,
> whether the task is fully done or blocked. Remove this blockquote in the actual report.

---

## Completion Report

**Status:** Complete / Blocked / Partially Complete

**Agent:** <Manager / Implementation / QA / Release>

**Date:** <date>

### Acceptance criteria results

<Copy each acceptance criterion from the task and mark it, with evidence — not just a
checkmark.>

- [x] <criterion 1> — verified by running `<command>`, output: `<brief actual result>`
- [x] <criterion 2> — verified by <how>
- [ ] <criterion 3> — NOT met: <specific reason>

### Files changed

- `<path>` — <one-line description of the change>

### Commands run to verify

```
<exact commands run, e.g. pnpm build, pnpm test, pnpm tsx src/cli.ts diff>
```

<brief summary of results/output for each, especially pass/fail>

### Blockers (if any)

<If status is Blocked or Partially Complete, describe the concrete blocker precisely: what is
preventing completion, what was tried, and what decision or input is needed to unblock it. A
blocker must be specific and actionable — not "this is hard" but e.g. "criterion X requires a
GitHub Actions secret that doesn't exist in this repo; needs a decision on whether to mock it
or skip that criterion.">

### `.ai-os` updates made

<List any updates made to `architecture.md`, `decisions.md`, or `current-goal.md`'s progress
checklist as a result of this task. Write "None" if not applicable.>

### Suggested follow-ups

<Anything noticed during this task that's out of scope but worth a future backlog item.>
