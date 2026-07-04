# Task 001: Clean CLI structure

## Goal

Refactor the current SlopCheck CLI into a clean MVP structure: `src/cli.ts` stays the CLI
entrypoint, but git-diff reading, rule scanning, and the finding model move into their own
modules. This is a pure structural refactor — no new features, no behavior changes.

## Context

Today, `src/cli.ts` is a single ~90-line file that does everything: defines the `Finding` type
inline, reads the git diff via `execa`, scans the diff with a hardcoded set of if-statements
(`any`, `@ts-ignore`, `TODO`/`FIXME`/`HACK`, broad `catch`, `console.log`), prints findings, and
wires up the `diff` command via Commander. `src/example.ts` is a sample file with intentionally
risky patterns used to manually verify detection.

This mixing of concerns blocks everything else in the MVP backlog (rule engine, findings model,
risk scoring, multiple reporters, tests) — see `.ai-os/backlog.md` item 1 and
`.ai-os/architecture.md` for the target module layout. This task does **not** need to build the
full target layout (rule engine, registry, multiple rule files) — that's backlog items 2–4. It
only needs to split today's single file into a few clearly-separated modules as a foundation.

A reasonable minimal split for this task:

```
src/
  cli.ts                 CLI entrypoint: Commander setup + the `diff` command's orchestration
  git/diff.ts             getGitDiff() moved here
  scan/scanDiff.ts         scanDiff() moved here (still one function/file is fine for now)
  findings/types.ts        Finding type moved here
```

(Exact file/folder names are flexible as long as the four acceptance criteria below about
separation of concerns are met and the split doesn't contradict `.ai-os/architecture.md`'s
long-term direction.)

## Acceptance Criteria

- [ ] `src/cli.ts` remains the CLI entrypoint (Commander setup, `diff` command registration).
- [ ] Git diff logic (`getGitDiff`) is moved out of `cli.ts` into its own module.
- [ ] Rule scanning logic (`scanDiff` and its pattern checks) is moved out of `cli.ts` into its
      own module.
- [ ] The `Finding` type/model is defined in its own module, separate from scanning logic, and
      imported wherever needed.
- [ ] Existing `slopcheck diff` behavior still works identically: same console output format,
      same exit code behavior (non-zero when a high-severity finding exists).
- [ ] Running the scan against `src/example.ts`'s changes still detects all of: `any`, `TODO`,
      `console.log`, and the broad `catch` (i.e. run `git add src/example.ts` or otherwise get
      it into the diff, then run the CLI, and confirm all four findings appear — `@ts-ignore`
      isn't in `example.ts` today so it doesn't need to appear, but the rule logic for it must
      still exist and be unchanged).
- [ ] No unnecessary dependencies are added — this is a pure internal reorganization using
      what's already in `package.json` (`commander`, `execa`).
- [ ] `pnpm tsx src/cli.ts --help` works and shows the `diff` command.
- [ ] `pnpm tsx src/cli.ts diff` works and produces output consistent with the criteria above.

## Done Means

This task is done only when every criterion above has been verified by actually running the
commands (not just by reading the code), and a completion report has been appended below. If
anything can't be verified or doesn't work, that must be documented as a blocker in the
completion report — do not mark it done anyway.

## Files likely affected

- `src/cli.ts` (trimmed down to entrypoint/orchestration only)
- New: a module for git diff reading (e.g. `src/git/diff.ts`)
- New: a module for scan/rule logic (e.g. `src/scan/scanDiff.ts`)
- New: a module for the `Finding` type (e.g. `src/findings/types.ts`)
- `src/example.ts` (read-only; used as manual test fixture, should not need changes)

## Tests to run

- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff` (with no changes staged/unstaged — should report "no git diff
  found")
- `git add src/example.ts` (or make an equivalent risky edit) then `pnpm tsx src/cli.ts diff` —
  should report findings for `any`, `TODO`, `console.log`, and the broad `catch`, and exit
  non-zero if any finding is high severity (note: with today's severities, none of
  `example.ts`'s findings are `high`, so exit code should be `0` — confirm this matches
  pre-refactor behavior exactly)
- `pnpm build` (if/once a build script exists — if not yet configured, note that as a pre-
  existing gap, not something this task needs to fix)
- No automated test suite exists yet (that's backlog item 9) — verification here is manual CLI
  execution plus a careful diff review confirming logic was moved, not altered

## Non-goals

- Do not build the full rule engine / rule registry / per-rule files (backlog items 2–4).
- Do not add risk scoring (backlog item 5).
- Do not add JSON or Markdown reporters (backlog items 7–8).
- Do not implement the full MVP.
- Do not build a SaaS, backend, or add LLM calls.
- Do not over-engineer the split — a handful of small, clearly-named modules is enough; no
  factories, no dependency injection, no dynamic loading.
- Do not add or upgrade dependencies.

## Suggested agent

Implementation Agent

---

## Completion Report

<To be appended by the Implementation Agent once work is done or blocked, using
`.ai-os/templates/completion-report.md`.>
