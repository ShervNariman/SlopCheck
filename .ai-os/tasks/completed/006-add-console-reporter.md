# Task 006: Add console reporter

## Goal

Extract console output logic from `src/cli.ts` into a dedicated `src/reporters/console.ts`
module, establishing the reporter pattern for JSON/Markdown reporters later — without changing
any observable CLI behavior (output text, exit codes).

## Context

After task 005 (risk scoring), the current source layout relevant to this task is:

```
src/cli.ts                CLI entrypoint: Commander setup, `diff` command orchestration.
                           Still contains two local output functions:
                             printFindings(findings) — prints the findings list (or the
                               "no obvious risky patterns" message when findings is empty)
                             printRiskResult(risk) — prints "Risk score: N/100 (level) — summary"
                           The `diff` action calls getGitDiff → scan → printFindings →
                           scoreRisk → printRiskResult → sets exit code.
src/findings/types.ts       Finding { ruleId, severity, message, line? }
src/scoring/risk-score.ts   scoreRisk(findings): RiskResult
src/engine/scan.ts          scan(diff): Finding[]
```

Per `.ai-os/backlog.md` item 6 and `.ai-os/architecture.md`'s target layout, reporters should
be pure functions that depend only on `Finding` and score types — not on git, rules, or the
engine. Today's console output (findings + risk score line) still lives inline in `cli.ts`,
which violates the "one responsibility per file" principle: `cli.ts` should wire commands and set
exit codes, not format terminal output.

**What stays in `cli.ts` after this task:**
- Commander/CLI definition (`program`, commands, flags)
- Reading the git diff (`getGitDiff`)
- Running the scanner (`scan`)
- Scoring risk (`scoreRisk`)
- Calling the console reporter (`reportConsole(findings, risk)`)
- Setting `process.exitCode` (dual check: high-severity finding OR `risk.level === "high"`)
- The "No git diff found..." message (this is a git-state message, not findings/reporter output)

**What moves to `src/reporters/console.ts`:**
- The `printFindings` logic (findings list header, `[SEVERITY] message` lines, empty-findings
  message within a scanned diff)
- The `printRiskResult` logic (`Risk score: N/100 (level) — summary` line)

**Behavior to preserve byte-for-byte (verified against task 005's recorded output):**

When a diff exists and findings are present:
```
\nSlopCheck found N potential issue(s):\n
[SEVERITY] message
...
Risk score: N/100 (level) — summary
```

When a diff exists but no findings:
```
SlopCheck found no obvious risky AI-generated patch patterns.
Risk score: 0/100 (low) — No risky patterns detected.
```

When no diff at all (handled in `cli.ts`, not the reporter):
```
No git diff found. Make a code change first, then run SlopCheck.
```

## Acceptance Criteria

- [ ] `src/reporters/console.ts` exists and exports a console reporter function (e.g.
      `reportConsole`) that accepts `Finding[]` and `RiskResult` as structured inputs.
- [ ] Finding output logic (`printFindings` equivalent) is moved out of `src/cli.ts` into the
      console reporter — `src/cli.ts` no longer contains per-finding formatting code.
- [ ] Risk score output logic (`printRiskResult` equivalent) is moved out of `src/cli.ts` into
      the console reporter.
- [ ] The console reporter has no dependency on git, rules, or the engine — only on
      `src/findings/types.ts` and `src/scoring/risk-score.ts` (for `RiskResult` type).
- [ ] `src/cli.ts` remains responsible for: defining the CLI, reading the git diff, running
      the scanner, scoring risk, calling the reporter, and setting exit code.
- [ ] Existing console output is identical or intentionally equivalent to task 005's output for
      all tested scenarios (risky diff with 5 findings, clean tree/no-diff).
- [ ] Exit code behavior is unchanged:
      - clean/no-diff case → exit 0
      - low-risk findings only → exit 0
      - high-severity finding present → exit 1 (even if `risk.level` is `"medium"`, e.g. lone
        `@ts-ignore` at score 40)
      - `risk.level === "high"` → exit 1
- [ ] No unnecessary dependencies are added.
- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm tsx src/cli.ts --help` works.
- [ ] `pnpm tsx src/cli.ts diff` works against a clean tree (reports "No git diff found...",
      exit 0).
- [ ] `pnpm tsx src/cli.ts diff` works against a risky diff containing `any`, `TODO`,
      `console.log`, broad `catch`, and `@ts-ignore` — identical per-finding output to task 005,
      plus risk score line, exit 1.

## Done Means

This task is done only when the console reporter module exists, `src/cli.ts` no longer contains
finding/risk formatting logic, all prior behavior is verified unchanged by actually running the
commands, and a completion report is appended below.

## Files likely affected

- New: `src/reporters/console.ts` (console reporter function)
- `src/cli.ts` (remove `printFindings`/`printRiskResult`; import and call `reportConsole`)
- `.ai-os/architecture.md` (update "Current state" to note console reporter exists)
- `src/findings/types.ts`, `src/scoring/risk-score.ts`, `src/engine/scan.ts` (read-only; no
  changes expected)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff` against a clean tree
- `pnpm tsx src/cli.ts diff` against a diff containing `any`, `TODO`, `console.log`, broad
  `catch`, and `@ts-ignore` — confirm output matches task 005's recorded output and exit code 1

## Non-goals

- Do not add a JSON reporter (backlog item 7).
- Do not add a Markdown reporter (backlog item 8).
- Do not change risk scoring logic (`src/scoring/risk-score.ts` is read-only).
- Do not add new rules.
- Do not add LLM calls.
- Do not add backend/auth/dashboard.
- Do not change exit-code derivation logic (keep the dual check from task 005).
- Do not add or upgrade dependencies.

## Suggested agent

Implementation Agent

---

## Completion Report

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `src/reporters/console.ts` exists and exports `reportConsole(findings, risk)` — verified
      by reading the file; accepts `Finding[]` and `RiskResult`, returns `void`.
- [x] Finding output logic moved out of `src/cli.ts` — verified: `printFindings` removed from
      `cli.ts`; equivalent logic now in `reportConsole` (findings header, `[SEVERITY] message`
      lines, empty-findings message).
- [x] Risk score output logic moved out of `src/cli.ts` — verified: `printRiskResult` removed
      from `cli.ts`; `Risk score: N/100 (level) — summary` line now printed by `reportConsole`.
- [x] Console reporter has no dependency on git, rules, or engine — verified: imports only
      `Finding` from `../findings/types.js` and `RiskResult` from `../scoring/risk-score.js`.
- [x] `src/cli.ts` remains responsible for CLI definition, git diff, scan, score, reporter call,
      exit code — verified by reading `cli.ts`: Commander setup, `getGitDiff`, `scan`,
      `scoreRisk`, `reportConsole`, dual exit-code check; only the "no git diff" message remains
      inline (git-state message, not reporter output).
- [x] Existing console output identical to task 005 — verified in live CLI tests below; risky
      diff output byte-for-byte matches task 005's recorded output.
- [x] Exit code behavior unchanged — verified: clean tree exit 0; low-only finding exit 0;
      lone `@ts-ignore` (score 40, level medium) exit 1; all-five-patterns (score 100, level
      high) exit 1.
- [x] No unnecessary dependencies added — verified `git diff --stat -- package.json
      pnpm-lock.yaml` produced no output.
- [x] `pnpm build` passes — exit 0.
- [x] `pnpm typecheck` passes — exit 0.
- [x] `pnpm test` passes — exit 0.
- [x] `pnpm tsx src/cli.ts --help` works — exit 0.
- [x] `pnpm tsx src/cli.ts diff` clean tree — "No git diff found...", exit 0.
- [x] `pnpm tsx src/cli.ts diff` risky diff (all 5 patterns) — identical findings output to
      task 005, risk score line present, exit 1.

### Files changed

- New: `src/reporters/console.ts` — `reportConsole(findings, risk)` with findings and risk
  output logic moved from `cli.ts`.
- `src/cli.ts` — removed `printFindings`/`printRiskResult`; imports `reportConsole`; `diff`
  action calls `reportConsole(findings, risk)` after `scoreRisk`. Exit-code logic unchanged.
- `.ai-os/architecture.md` — "Current state" and "Reporters" sections updated.
- `.ai-os/current-goal.md` — checked off console reporter and task 006.

`src/scoring/risk-score.ts`, `src/findings/types.ts`, `src/engine/scan.ts` unchanged.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts --help
git diff --stat -- package.json pnpm-lock.yaml
```

Isolated temp git repo (`$env:TEMP\slopcheck-006-test`):

```
# Clean tree -> "No git diff found...", exit 0
# All 5 patterns -> identical output to task 005 + risk line, exit 1
# Lone @ts-ignore -> score 40/medium, exit 1
# Lone TODO -> score 10/low, exit 0
```

### Blockers (if any)

None.

### `.ai-os` updates made

- `architecture.md` — current state and reporters section updated for task 006.
- `current-goal.md` — checked off "Console reporter exists" and "006 — Add console reporter".
- `decisions.md` — no changes.
- `backlog.md` — no changes.

### Suggested follow-ups

- **Next task: backlog item 7 — Add JSON reporter** (`src/reporters/json.ts`, `--json` flag).
- Backlog item 9 can unit-test `reportConsole` by mocking `console.log` or by testing a
  `=> string` variant if the reporter is refactored to return a string for testability.
