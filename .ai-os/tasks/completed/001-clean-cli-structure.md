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

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `src/cli.ts` remains the CLI entrypoint (Commander setup, `diff` command registration) —
      verified by reading `src/cli.ts`: it now only imports `Command`, `getGitDiff`, `scanDiff`,
      and `Finding`, defines `printFindings` (presentation), and wires the `diff` command.
- [x] Git diff logic (`getGitDiff`) is moved out of `cli.ts` into its own module — moved to
      `src/git/diff.ts`, unchanged logic (staged-diff-first, falls back to unstaged).
- [x] Rule scanning logic (`scanDiff` and its pattern checks) is moved out of `cli.ts` into its
      own module — moved to `src/scan/scanDiff.ts`, unchanged regex/pattern logic.
- [x] The `Finding` type/model is defined in its own module, separate from scanning logic —
      moved to `src/findings/types.ts`, imported by `scanDiff.ts` and `cli.ts`.
- [x] Existing `slopcheck diff` behavior still works identically — verified two ways:
      (1) stashed the `cli.ts` change, ran `pnpm tsx src/cli.ts diff` with a clean tree, got
      "No git diff found. Make a code change first, then run SlopCheck.", then restored the
      change (`git stash pop`); (2) ran `pnpm tsx src/cli.ts diff` against the refactor's own
      live (unstaged) diff of `cli.ts` and got "SlopCheck found no obvious risky AI-generated
      patch patterns." with exit code 0 — correct, since the refactor's added lines (imports)
      contain none of the risky patterns.
- [x] Sample scan still detects `any`, `TODO`, `console.log`, and broad `catch` — verified by
      temporarily appending an equivalent risky function (`anotherBadExample`, with `any`,
      `// FIXME:`, `console.log`, and an empty `catch`) to `src/example.ts`, running
      `pnpm tsx src/cli.ts diff`, and confirming all four findings were reported:
      `[MEDIUM] Added TypeScript "any"`, `[LOW] Added TODO/FIXME/HACK`, `[LOW] Added
      console.log`, `[MEDIUM] Added broad catch block`, exit code `0` (no high-severity
      finding, matching pre-refactor behavior for this input). `src/example.ts` was then
      reverted to its original committed state via `git checkout -- src/example.ts` (confirmed
      clean via `git diff --stat`, no changes shown for that file).
- [x] No unnecessary dependencies are added — verified `git diff package.json` produced no
      output; no dependencies were added, removed, or changed.
- [x] `pnpm tsx src/cli.ts --help` works — verified, shows usage, options, and the `diff` and
      `help` commands.
- [x] `pnpm tsx src/cli.ts diff` works — verified in both the empty-diff and risky-diff
      scenarios above.

### Files changed

- `src/cli.ts` — trimmed to CLI entrypoint only: Commander setup, `printFindings` (console
  output), and the `diff` command's orchestration; no longer contains git or scan logic.
- `src/git/diff.ts` — new; `getGitDiff()` moved here unchanged.
- `src/scan/scanDiff.ts` — new; `scanDiff()` and its pattern checks moved here unchanged,
  now importing `Finding` from `../findings/types.js`.
- `src/findings/types.ts` — new; the `Finding` type moved here unchanged.
- `.ai-os/architecture.md` — updated "Current state" section to describe the new interim
  module layout (git/, scan/, findings/) and clarify the full rule engine/registry/reporters
  are still pending (backlog items 2–8).
- `.ai-os/current-goal.md` — checked off "CLI has clean structure" in the Definition of Done
  and "001 — Clean CLI structure" in the Progress checklist.

`src/example.ts` was not permanently changed (used only as a transient, reverted manual test
fixture, per the task's non-goals).

### Commands run to verify

```
pnpm tsx src/cli.ts --help
git stash push -- src/cli.ts ".ai-os/tasks/backlog/001-clean-cli-structure.md"
pnpm tsx src/cli.ts diff                      # clean-tree case
git stash pop
pnpm exec tsc --noEmit                        # typecheck (see note below)
(temporarily edited src/example.ts to add an equivalent risky function)
pnpm tsx src/cli.ts diff                      # risky-diff case
git checkout -- src/example.ts                # revert fixture edit
pnpm build                                    # see note below
git diff package.json
```

- `--help`: prints usage with `diff` and `help` commands. Pass.
- Clean-tree `diff`: prints "No git diff found. Make a code change first, then run SlopCheck.".
  Pass.
- Risky-diff `diff`: prints all 4 expected findings (`any`, `TODO`/`FIXME`, `console.log`, broad
  `catch`), exit code `0`. Pass.
- `pnpm build`: **fails** — no `build` script exists in `package.json` yet. This is a
  pre-existing gap (confirmed the script was never defined, not something this refactor
  removed), explicitly called out as acceptable in this task's "Tests to run" section and
  tracked separately as backlog item 12 (npm publishing prep). Not a regression from this task.
- `pnpm exec tsc --noEmit`: reports one pre-existing error, `Cannot find name 'process'`, at the
  `process.exitCode = 1` line. Confirmed via `git stash` that this identical error exists
  against the original, pre-refactor `src/cli.ts` too (tsconfig.json doesn't include Node type
  definitions) — this is a pre-existing repo gap unrelated to this refactor, not a regression.
- `git diff package.json`: no output — confirms no dependency changes.

### Blockers (if any)

None blocking this task's acceptance criteria — all were met. Two pre-existing gaps were
identified during verification (see above) that are out of this task's scope per its Non-goals
and Tests to run notes:
1. No `pnpm build` script exists yet (tracked as backlog item 12).
2. `tsconfig.json` is missing Node type definitions, causing a `process` type error under
   `tsc --noEmit` (pre-existing on `master` before this task; not introduced by this refactor).

### `.ai-os` updates made

- `architecture.md` — "Current state" section updated to reflect the new `git/`, `scan/`, and
  `findings/` modules and to clarify the full target layout (rule registry, engine, scorer,
  multiple reporters) is still pending.
- `current-goal.md` — checked off the "CLI has clean structure" Definition of Done item and the
  "001 — Clean CLI structure" progress item.
- `decisions.md` — no changes; no new architectural decisions were made (this task followed the
  already-decided minimal split from the task's own Context section).

### Suggested follow-ups

- Backlog item 2 (add rule engine) is now unblocked and is the natural next task: introduce
  `src/rules/types.ts` (Rule interface), `src/rules/index.ts` (registry), and an engine module
  that runs registered rules, replacing `scanDiff`'s inline if-statements.
- Consider fixing the pre-existing `tsconfig.json` Node types gap (`"types": ["node"]` or
  `@types/node` in `include`) as part of or before backlog item 12 (npm publishing prep), since
  a clean `tsc --noEmit` will likely be wanted before publishing.
- Consider adding a real `build` script (`tsup`) sooner rather than later so `pnpm build` in
  future tasks' "Tests to run" sections is actually runnable — this is explicitly backlog item
  12's responsibility, called out here only as a heads-up for planning.
