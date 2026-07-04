# Task 003: Add findings model

## Goal

Formalize the `Finding` type in `src/findings/types.ts` into the single shared shape described
in `architecture.md` (including `ruleId` and optional `line`), and thread each rule's `id`
through the engine into every finding — without changing SlopCheck's observable console output.

## Context

After task 002 (rule engine), the current source layout relevant to this task is:

```
src/cli.ts                CLI entrypoint: Commander setup, printFindings, `diff` command
src/git/diff.ts            getGitDiff() — reads staged diff, falls back to unstaged
src/findings/types.ts       Finding = { severity: "high" | "medium" | "low", message: string }
src/rules/types.ts          Rule interface: { id, description, severity, check(line): boolean }
src/rules/index.ts          registry of 5 rules (any-type, ts-ignore, todo-fixme, console-log,
                             broad-catch), each with a stable `id`
src/engine/scan.ts          scan(diff): Finding[] — extracts added lines, runs every rule,
                             pushes { severity: rule.severity,
                                       message: `${rule.description}: ${clean}` }
```

Today's `Finding` only carries `severity` and `message` — it does not carry which rule produced
it (`ruleId`) or the raw offending line (`line`) as separate structured fields. `message` already
happens to *contain* both the rule's description and the line, concatenated as a string
(`"<description>: <line>"`), which is what `src/cli.ts`'s `printFindings` prints today.

Per `.ai-os/backlog.md` item 3 and `.ai-os/architecture.md`'s target `Finding` model:

```ts
export interface Finding {
  ruleId: string;
  severity: "high" | "medium" | "low";
  message: string;
  line?: string;
}
```

This is a prerequisite for risk scoring (item 5) and the JSON/Markdown reporters (items 7–8),
which will want to consume `ruleId`/`line` as structured data instead of parsing them back out
of the `message` string.

**Keeping console output unchanged:** `src/cli.ts`'s `printFindings` only ever reads
`finding.severity` and `finding.message` (see `` `[${finding.severity.toUpperCase()}]
${finding.message}` ``). As long as `message` keeps being built exactly as
`` `${rule.description}: ${clean}` `` in the engine, adding `ruleId` and `line` as additional
fields on `Finding` has no effect on what's printed — `printFindings` doesn't need to change at
all for output to stay identical (it will simply also have `ruleId`/`line` available on each
`finding` it iterates, unused).

## Acceptance Criteria

- [ ] `src/findings/types.ts` defines a structured `Finding` type/interface with at least:
      `ruleId: string`, `severity: "high" | "medium" | "low"`, `message: string`, and
      `line?: string` (optional, "if available").
- [ ] `src/engine/scan.ts` sets `ruleId` to the originating rule's `id` and `line` to the
      cleaned added-line text for every finding it produces (both are always available given
      how the engine currently works, so `line` will always be set in practice).
- [ ] Existing severity behavior is unchanged (same lines still produce the same severities as
      before this task).
- [ ] `src/cli.ts`'s `printFindings` still prints the exact same observable console output as
      before this task (byte-for-byte): the same `"\nSlopCheck found N potential issue(s):\n"`
      header, the same `"[SEVERITY] message"` lines, and the same "no findings"/"no diff" text.
- [ ] Existing `slopcheck diff` behavior still works end-to-end (same output, same exit code
      rules: non-zero only when a high-severity finding exists).
- [ ] No unnecessary dependencies are added.
- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm tsx src/cli.ts --help` works.
- [ ] `pnpm tsx src/cli.ts diff` works against a clean tree (reports "No git diff found...").
- [ ] `pnpm tsx src/cli.ts diff` works against a risky diff containing `any`, `TODO`,
      `console.log`, broad `catch`, and `@ts-ignore` — all five findings reported with correct
      severities.
- [ ] `@ts-ignore` still produces a high-severity finding and the CLI exits with code `1` on
      that diff.

## Done Means

This task is done only when every criterion above has been verified by actually running the
commands (not just by reading the code), and a completion report has been appended below. If
anything can't be verified or doesn't work, that must be documented as a blocker in the
completion report — do not mark it done anyway.

## Files likely affected

- `src/findings/types.ts` (expand `Finding` to include `ruleId` and `line`)
- `src/engine/scan.ts` (set `ruleId`/`line` on each `Finding` it builds)
- `src/cli.ts` (not expected to need changes, since `printFindings` only reads
  `severity`/`message` — but re-check after the `Finding` shape changes to confirm no type
  errors and no accidental output changes)
- `src/rules/*.ts` (read-only; each rule already has a stable `id` — no changes expected)
- `src/example.ts` (read-only; used as a manual test fixture, should not need changes)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff` against a clean tree
- `pnpm tsx src/cli.ts diff` against a diff containing `any`, `TODO`, `console.log`, broad
  `catch`, and `@ts-ignore` — confirm all five findings, identical severities/message text to
  before this task, and exit code `1` (due to the `@ts-ignore` high-severity finding)

## Non-goals

- Do not add risk scoring (backlog item 5).
- Do not add JSON or Markdown reporters (backlog items 7–8).
- Do not add new rules (backlog item 4 already covers formalizing the existing 5; this task
  does not add a 6th).
- Do not change CLI wording/output unless strictly required to keep it working with the new
  `Finding` shape (it shouldn't be — see Context above).
- Do not add LLM calls.
- Do not add backend/auth/dashboard.
- Do not add or upgrade dependencies.

## Suggested agent

Implementation Agent

---

## Completion Report

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `src/findings/types.ts` defines a structured `Finding` interface with `ruleId: string`,
      `severity: "high" | "medium" | "low"`, `message: string`, and `line?: string` — verified
      by reading the file.
- [x] `src/engine/scan.ts` sets `ruleId` (from `rule.id`) and `line` (the cleaned added-line
      text, `clean`) on every finding — verified by reading the file and by the end-to-end CLI
      tests below (the same lines/rules still fire; the new fields are additive).
- [x] Existing severity behavior is unchanged — verified: the risky-diff test below produced the
      same severities as before this task (`any`→medium, `TODO`→low, `console.log`→low,
      broad `catch`→medium, `@ts-ignore`→high).
- [x] `src/cli.ts`'s `printFindings` still prints the exact same observable console output —
      verified: `src/cli.ts` was not modified at all in this task (it only reads
      `finding.severity`/`finding.message`, both unchanged in content), and the actual printed
      output in the tests below is byte-for-byte identical to task 002's recorded output.
- [x] Existing `slopcheck diff` behavior still works end-to-end — verified in both the
      clean-tree and risky-diff scenarios below, including exit code behavior.
- [x] No unnecessary dependencies are added — verified `git diff --stat -- package.json
      pnpm-lock.yaml` produced no output.
- [x] `pnpm build` passes — verified, `tsup` builds `dist/cli.js` + `dist/cli.d.ts`, exit 0.
- [x] `pnpm typecheck` passes — verified, `tsc --noEmit` exits 0 with no errors (the expanded
      `Finding` interface type-checks cleanly against all rule/engine/CLI usages).
- [x] `pnpm test` passes — verified, `vitest run --passWithNoTests` exits 0 (no test files yet;
      backlog item 9 adds them).
- [x] `pnpm tsx src/cli.ts --help` works — verified, prints expected usage/commands.
- [x] `pnpm tsx src/cli.ts diff` works against a clean tree — verified using the same isolated
      temp-git-repo technique as task 002 (see "Commands run to verify" for why): prints
      "No git diff found. Make a code change first, then run SlopCheck.", exit 0.
- [x] `pnpm tsx src/cli.ts diff` works against a risky diff containing `any`, `TODO`,
      `console.log`, broad `catch`, and `@ts-ignore` — verified in the same temp repo: all five
      findings reported with correct severities and identical message text to before this task.
- [x] `@ts-ignore` still produces a high-severity finding and exit code `1` — verified: the
      risky-diff test below produced `[HIGH] Added @ts-ignore: // @ts-ignore` and the process
      exited with code `1`.

### Files changed

- `src/findings/types.ts` — `Finding` changed from a minimal `type` alias
  (`{ severity, message }`) to a structured `interface` with `ruleId: string`,
  `severity: "high" | "medium" | "low"`, `message: string`, `line?: string`, matching
  `architecture.md`'s target `Finding` model exactly.
- `src/engine/scan.ts` — the `findings.push({...})` call now also sets `ruleId: rule.id` and
  `line: clean` on every finding, in addition to the unchanged `severity`/`message`.
- `.ai-os/architecture.md` — "Current state" section updated to note task 003 is complete and
  that `Finding` now matches the target shape.
- `.ai-os/current-goal.md` — checked off "Findings model exists" in the Definition of Done and
  "003 — Add findings model" in the Progress checklist.

`src/cli.ts`, `src/rules/*.ts`, and `src/example.ts` are unchanged, as scoped/expected.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts --help
git diff --stat -- package.json pnpm-lock.yaml
```

All passed/exited 0 as described above.

As with task 002, this project's own uncommitted changes (`src/findings/types.ts`,
`src/engine/scan.ts`) are the code under test, so a plain `git stash` can't produce a genuinely
clean `git diff` in *this* repo without also reverting the code being verified. The same
isolated-temp-repo technique was used again: a throwaway git repo was created in the OS temp
directory (`$env:TEMP\slopcheck-clean-test-003`), initialized with one committed file, and this
project's actual `src/cli.ts` (with its updated `Finding` model) was invoked from inside that
temp repo's directory via the local `tsx` binary:

```
# Clean-tree case
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> "No git diff found. Make a code change first, then run SlopCheck."  (exit 0)

# Risky-diff case (staged a file with any/TODO/console.log/broad catch/@ts-ignore)
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> 5 findings:
     [MEDIUM] Added TypeScript "any": export function badExample(input: any) {
     [LOW] Added TODO/FIXME/HACK: // TODO: fix later
     [LOW] Added console.log: console.log(input);
     [MEDIUM] Added broad catch block: } catch (error) {
     [HIGH] Added @ts-ignore: // @ts-ignore
  (exit 1, due to the high-severity @ts-ignore finding)
```

The temp repo was deleted afterward; this project's working tree was untouched by this
methodology.

### Blockers (if any)

None. All acceptance criteria were met and verified with actual command runs.

### `.ai-os` updates made

- `architecture.md` — "Current state" section updated: task 003 marked complete, `Finding` now
  described as matching the target shape (`ruleId`, `severity`, `message`, optional `line`).
- `current-goal.md` — checked off "Findings model exists" (Definition of Done) and
  "003 — Add findings model" (Progress).
- `decisions.md` — no changes. No new architectural decisions were made; this task implemented
  the `Finding` shape already specified in `architecture.md` and `backlog.md` item 3.
- `backlog.md` — no changes.

### Suggested follow-ups

- Backlog item 4 ("Add core rules") is largely already satisfied by task 002's rule modules
  (`any-type.ts`, `ts-ignore.ts`, `todo-fixme.ts`, `console-log.ts`, `broad-catch.ts`) — the
  Manager Agent should double check its remaining acceptance criteria (e.g. re-confirming
  severities against `backlog.md` item 4's explicit mapping) rather than assuming it's fully
  redundant, then likely move quickly to item 5 (risk scoring), which can now build directly on
  `ruleId`/`line` if it wants per-rule breakdowns.
- Backlog item 9 ("Add tests") can now assert on `ruleId` directly (e.g. "the any-type rule
  produces a finding with `ruleId: 'any-type'`") instead of pattern-matching `message` strings,
  making rule tests more robust to future message wording changes.
- The `line` field is currently always populated (never actually optional in practice, since
  every finding the engine produces comes from a concrete added line). The `line?: string`
  optionality exists for forward-compatibility with `architecture.md`'s "if available" language,
  in case a future rule or data source doesn't have a single line to attach.
