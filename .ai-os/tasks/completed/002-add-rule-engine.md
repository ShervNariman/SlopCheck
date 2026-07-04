# Task 002: Add rule engine

## Goal

Introduce a real rule engine — a `Rule` interface, a rule registry, and an engine that runs
registered rules against a diff — replacing `scanDiff`'s inline if-statements, without changing
any observable SlopCheck behavior.

## Context

After task 001 (clean CLI structure) and task 001a (verification scripts), the current source
layout is:

```
src/cli.ts                CLI entrypoint: Commander setup, printFindings, `diff` command
src/git/diff.ts            getGitDiff() — reads staged diff, falls back to unstaged
src/scan/scanDiff.ts        scanDiff() — still one function with 5 inline if-statements
                             (any, @ts-ignore, TODO/FIXME/HACK, console.log, broad catch)
src/findings/types.ts       Finding = { severity: "high" | "medium" | "low", message: string }
src/example.ts              sample file with intentionally risky patterns (any, TODO,
                             console.log, broad catch — no @ts-ignore)
```

`src/cli.ts` currently imports `scanDiff` from `./scan/scanDiff.js` and calls
`scanDiff(diff)` to get `Finding[]`.

Per `.ai-os/backlog.md` item 2 and `.ai-os/architecture.md`'s target module layout, the target
structure has no `src/scan/` folder at all — it has `src/rules/` (interface + registry + one
file per rule) and `src/engine/scan.ts` (runs the registry against a diff). This task moves the
codebase onto that target shape for rule execution, while leaving `src/findings/types.ts`
(item 3), risk scoring (item 5), and reporters (items 6–8) untouched for now.

**Approach to keep output byte-for-byte identical:** each current inline check's message has
the shape `"<prefix>: <line>"` (e.g. `Added TypeScript "any": <line>`, `Added @ts-ignore: <line>`,
`Added TODO/FIXME/HACK: <line>`, `Added broad catch block: <line>`, `Added console.log: <line>`).
If each `Rule`'s `description` field is set to exactly that prefix (e.g.
`'Added TypeScript "any"'`), the engine can build `` `${rule.description}: ${line}` `` and
reproduce the exact original message text — no special-casing needed, and the `Rule` interface
stays exactly as specified in `architecture.md` (`id`, `description`, `severity`, `check`).

**Since `src/rules/` + `src/engine/` fully replace `src/scan/scanDiff.ts`'s job**, and the
target architecture has no `src/scan/` folder, this task removes `src/scan/scanDiff.ts` (and the
now-empty `src/scan/` folder) rather than keeping it as a thin pass-through wrapper, and updates
`src/cli.ts` to import the engine's scan function directly. This is a small, mechanical change
(one import + one call site in `cli.ts`) and avoids leaving a redundant wrapper module that a
later task would just delete anyway.

## Acceptance Criteria

- [ ] `src/rules/types.ts` exports a `Rule` interface with `id`, `description`, `severity`
      (`"high" | "medium" | "low"`), and `check(line: string): boolean`.
- [ ] `src/rules/index.ts` exports a registry (array) listing all active rules in one place.
- [ ] Five individual rule modules exist under `src/rules/` (one per pattern), each exporting a
      `Rule` matching the interface above, covering exactly the current inline checks:
      TypeScript `any`, `@ts-ignore`, `TODO`/`FIXME`/`HACK`, `console.log`, broad `catch`.
- [ ] `src/engine/scan.ts` exports a function that takes diff text, extracts added lines (same
      logic as today: lines starting with `+` but not `+++`), runs every registered rule against
      each line, and returns `Finding[]`.
- [ ] `src/scan/scanDiff.ts` (and the `src/scan/` folder) is removed; `src/cli.ts` calls the new
      engine function directly instead of `scanDiff`.
- [ ] Existing detection behavior is identical: same lines trigger the same rules with the same
      severities and the same message text, byte-for-byte, as before this task.
- [ ] Existing `slopcheck diff` behavior still works: same console output format, same exit code
      behavior (non-zero only when a high-severity finding exists).
- [ ] No unnecessary dependencies are added.
- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm tsx src/cli.ts --help` works.
- [ ] `pnpm tsx src/cli.ts diff` works against a clean tree (reports "No git diff found...").
- [ ] `pnpm tsx src/cli.ts diff` works against a risky diff containing `any`, `TODO`,
      `console.log`, and a broad `catch`, reporting all four findings with correct severities.

## Done Means

This task is done only when every criterion above has been verified by actually running the
commands (not just by reading the code), and a completion report has been appended below. If
anything can't be verified or doesn't work, that must be documented as a blocker in the
completion report — do not mark it done anyway.

## Files likely affected

- New: `src/rules/types.ts` (Rule interface)
- New: `src/rules/index.ts` (registry)
- New: `src/rules/any-type.ts`, `src/rules/ts-ignore.ts`, `src/rules/todo-fixme.ts`,
  `src/rules/console-log.ts`, `src/rules/broad-catch.ts` (one rule each)
- New: `src/engine/scan.ts` (runs the registry against a diff)
- Removed: `src/scan/scanDiff.ts` (and the `src/scan/` folder)
- `src/cli.ts` (import/call site updated to use the engine instead of `scanDiff`)
- `src/findings/types.ts` (read-only; no changes expected — the `Finding` shape stays as-is,
  formalizing it further is backlog item 3)
- `src/example.ts` (read-only; used as a manual test fixture, should not need changes)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff` against a clean tree
- `pnpm tsx src/cli.ts diff` against a diff containing `any`, `TODO`, `console.log`, and a
  broad `catch` (e.g. via a temporary, reverted edit to `src/example.ts`, as done in tasks
  001/001a) — confirm identical output/severities/exit code to before this task

## Non-goals

- Do not add risk scoring (backlog item 5).
- Do not add JSON or Markdown reporters (backlog items 7–8).
- Do not formalize/expand the `Finding` type beyond its current shape (backlog item 3).
- Do not add LLM calls.
- Do not add backend/auth/dashboard.
- Do not add or upgrade dependencies.
- Do not add automated tests for the rules/engine yet (backlog item 9 — QA Agent).

## Suggested agent

Implementation Agent

---

## Completion Report

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `src/rules/types.ts` exports a `Rule` interface with `id`, `description`, `severity`
      (`"high" | "medium" | "low"`), and `check(line: string): boolean` — verified by reading
      the file; matches `architecture.md`'s target interface exactly.
- [x] `src/rules/index.ts` exports a registry (array) listing all active rules — verified: a
      `rules: Rule[]` array listing all five rules in one place.
- [x] Five individual rule modules exist under `src/rules/`, each exporting a `Rule` — verified:
      `any-type.ts`, `ts-ignore.ts`, `todo-fixme.ts`, `console-log.ts`, `broad-catch.ts`, each
      with the same `check` regex/string logic as the original inline if-statements.
- [x] `src/engine/scan.ts` exports a function that extracts added lines and runs every
      registered rule against each line, returning `Finding[]` — verified by reading the file
      (same added-line extraction logic as the old `scanDiff`, now looping rules from the
      registry instead of inline if-statements) and by the end-to-end CLI tests below.
- [x] `src/scan/scanDiff.ts` and the `src/scan/` folder are removed; `src/cli.ts` calls the
      engine directly — verified: `src/scan/` no longer appears in a full `src/` directory
      listing, and `cli.ts` now imports `{ scan }` from `./engine/scan.js` and calls
      `scan(diff)`.
- [x] Existing detection behavior is identical (same lines → same rules → same severities →
      same message text, byte-for-byte) — verified via an isolated, freshly-initialized temp
      git repo (see "Commands run to verify" for why this approach was used) running the actual
      `src/cli.ts`/`src/engine/scan.ts` code: a diff with `any`, `TODO`, `console.log`, and a
      broad `catch` produced exactly `[MEDIUM] Added TypeScript "any": ...`,
      `[LOW] Added TODO/FIXME/HACK: ...`, `[LOW] Added console.log: ...`,
      `[MEDIUM] Added broad catch block: ...` — identical text to the pre-task output recorded
      in task 001's and 001a's completion reports. A follow-up diff adding `// @ts-ignore` also
      correctly produced `[HIGH] Added @ts-ignore: ...` and flipped the exit code to `1`,
      confirming the fifth rule and the severity-based exit code both still work.
- [x] Existing `slopcheck diff` behavior still works (same output format, same exit code
      rules) — verified: clean-tree case prints "No git diff found. Make a code change first,
      then run SlopCheck.", exit 0; risky-diff cases print the findings list with the same
      `\nSlopCheck found N potential issue(s):\n` / `[SEVERITY] message` format as before, exit
      0 when no high-severity finding, exit 1 when one exists (via `@ts-ignore`).
- [x] No unnecessary dependencies are added — verified `git diff --stat -- package.json
      pnpm-lock.yaml` produced no output.
- [x] `pnpm build` passes — verified, `tsup` builds `dist/cli.js` and `dist/cli.d.ts`
      successfully, exit 0.
- [x] `pnpm typecheck` passes — verified, `tsc --noEmit` exits 0 with no errors.
- [x] `pnpm test` passes — verified, `vitest run --passWithNoTests` exits 0 (no test files yet;
      backlog item 9 adds them).
- [x] `pnpm tsx src/cli.ts --help` works — verified, prints expected usage/commands.
- [x] `pnpm tsx src/cli.ts diff` works against a clean tree — verified using a genuinely clean,
      separate temp git repo (see note below on methodology) running this project's actual
      `src/cli.ts`: prints "No git diff found. Make a code change first, then run SlopCheck.",
      exit 0.
- [x] `pnpm tsx src/cli.ts diff` works against a risky diff containing `any`, `TODO`,
      `console.log`, and a broad `catch` — verified in the same temp repo: all four findings
      reported with correct severities (see above), exit 0 (no high-severity finding in that
      specific diff).

### Files changed

- New: `src/rules/types.ts` — `Rule` interface (`id`, `description`, `severity`, `check`).
- New: `src/rules/any-type.ts` — TypeScript `any` rule (medium).
- New: `src/rules/ts-ignore.ts` — `@ts-ignore` rule (high).
- New: `src/rules/todo-fixme.ts` — `TODO`/`FIXME`/`HACK` rule (low).
- New: `src/rules/console-log.ts` — `console.log` rule (low).
- New: `src/rules/broad-catch.ts` — broad `catch` rule (medium).
- New: `src/rules/index.ts` — rule registry (`rules: Rule[]`).
- New: `src/engine/scan.ts` — `scan(diff: string): Finding[]`; extracts added lines and runs
  every registered rule against each line, building each `Finding`'s message as
  `` `${rule.description}: ${line}` `` (each rule's `description` was deliberately set to the
  exact original message prefix, e.g. `'Added TypeScript "any"'`, so output text is unchanged).
- Removed: `src/scan/scanDiff.ts` and the `src/scan/` folder (fully superseded by
  `src/rules/` + `src/engine/scan.ts`, matching `architecture.md`'s target layout, which has no
  `src/scan/` folder).
- `src/cli.ts` — import changed from `scanDiff` (`./scan/scanDiff.js`) to `scan`
  (`./engine/scan.js`); the one call site (`scanDiff(diff)` → `scan(diff)`) updated to match.
  No other changes — `printFindings`, the `diff` command's clean-tree check, and the exit-code
  logic are byte-for-byte unchanged.
- `.ai-os/architecture.md` — "Current state" section updated to describe the new `rules/` +
  `engine/` structure and the removal of `src/scan/`.
- `.ai-os/current-goal.md` — checked off "Rule engine exists" in the Definition of Done and
  "002 — Add rule engine" in the Progress checklist.

`src/findings/types.ts` and `src/example.ts` are unchanged, as scoped.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts --help
git diff --stat -- package.json pnpm-lock.yaml
```

All passed/exited 0 as described above.

For the "clean tree" and "risky diff" `slopcheck diff` scenarios, a plain `git stash` approach
(used in tasks 001/001a) wasn't viable here: this task's own uncommitted changes (`cli.ts`
modified, `scan/scanDiff.ts` deleted) can't be stashed away without also reverting the very code
being tested, and there was no way to get a truly empty `git diff` in *this* repo while the new
code was in place without committing (which this agent should not do proactively). Instead, a
throwaway, separate git repository was created in the OS temp directory
(`$env:TEMP\slopcheck-clean-test`), initialized with one committed file (so it starts with a
genuinely clean, diff-free state), and this project's real `src/cli.ts` was invoked from inside
that temp repo's directory via the local `tsx` binary
(`node_modules\.bin\tsx.CMD C:\Projects\SlopCheck\src\cli.ts diff`), so `execa`'s `git diff`
calls in `src/git/diff.ts` operated against the temp repo's working tree while running the
exact same source files as this task modified:

```
# Clean-tree case
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> "No git diff found. Make a code change first, then run SlopCheck."  (exit 0)

# Risky-diff case (staged a file with any/TODO/console.log/broad catch)
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> 4 findings: [MEDIUM] any, [LOW] TODO/FIXME/HACK, [LOW] console.log,
     [MEDIUM] broad catch block  (exit 0)

# Follow-up: staged a second file adding // @ts-ignore
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> 5 findings, including [HIGH] Added @ts-ignore: ...  (exit 1)
```

The temp repo was deleted afterward; this project's working tree was untouched by this
methodology (only the earlier, popped `git stash` touched it, and it was fully restored).

### Blockers (if any)

None. All acceptance criteria were met and verified with actual command runs.

### `.ai-os` updates made

- `architecture.md` — "Current state" section rewritten to reflect the new `src/rules/` +
  `src/engine/` structure, the removal of the interim `src/scan/` module, and to note that
  `Finding` still hasn't been formalized (backlog item 3) and risk scoring/reporters are still
  pending (items 5–8).
- `current-goal.md` — checked off "Rule engine exists" (Definition of Done) and
  "002 — Add rule engine" (Progress).
- `decisions.md` — no changes. No new architectural decisions were made; this task followed the
  already-decided target layout from `architecture.md` and `backlog.md` item 2.
- `backlog.md` — no changes.

### Suggested follow-ups

- Backlog item 3 ("Add findings model") is now unblocked: formalize `Finding` to include
  `ruleId` (each rule already has a stable `id` that could be threaded through
  `src/engine/scan.ts`), and update rules/engine/reporters to use the richer shape.
- Backlog item 9 ("Add tests") can now unit-test each rule in `src/rules/` in isolation (pure
  `check(line)` functions) and the engine's aggregation logic, without needing git or the CLI at
  all — this task's rule/engine split was designed specifically to make that easy.
- Consider whether future rules should be able to see more than a single line of context (e.g.
  multi-line broad `catch` blocks); today's `check(line: string): boolean` interface, inherited
  unchanged from `architecture.md`, still only sees one line at a time, matching current
  behavior exactly but a known limitation worth revisiting if false negatives show up later.
