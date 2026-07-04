# Task 005: Add risk scoring

## Goal

Add patch-level risk scoring to SlopCheck: turn a patch's `Finding[]` into a simple, explainable
numeric score and level (`low`/`medium`/`high`) plus a verdict string, without changing the
existing findings behavior or their console output.

## Context

After tasks 002 (rule engine), 003 (findings model), and 004 (core rules — satisfied by 002),
the current source layout relevant to this task is:

```
src/cli.ts                CLI entrypoint: Commander setup, printFindings, `diff` command.
                           Today it prints findings and sets a non-zero exit code with an ad hoc
                           check: `findings.some((f) => f.severity === "high")`.
src/engine/scan.ts         scan(diff): Finding[] — runs every registered rule against added
                           diff lines, returns findings with ruleId/severity/message/line.
src/findings/types.ts       Finding { ruleId, severity: "high"|"medium"|"low", message, line? }
src/rules/                 5 registered rules: any-type (medium), ts-ignore (high),
                           todo-fixme-hack (low), console-log (low), broad-catch (medium)
src/rules/index.ts          rule registry (rules: Rule[])
```

There is no risk scoring module yet. `src/cli.ts`'s exit-code logic is a one-off check on raw
findings rather than a documented, reusable scoring function. Per `.ai-os/backlog.md` item 5 and
`.ai-os/architecture.md`'s target layout, a `src/scoring/risk-score.ts` module should exist: "A
pure function takes `Finding[]` and returns a score/verdict object... simple and documented...
unit-testable in isolation from the CLI and git."

This task adds that module and wires `src/cli.ts` to use it for both printing a risk
score/verdict and deriving the exit code — replacing the ad hoc severity check with an
equivalent-or-better, now-documented rule.

**Scoring approach (per user direction, simple and deterministic — ADR-008 compliant):**
- Each finding contributes to the score by its severity: `high` = +40, `medium` = +20,
  `low` = +10.
- The sum is capped at 100.
- `level` is derived from the capped score: `0–24` → `"low"`, `25–59` → `"medium"`,
  `60–100` → `"high"`.
- A patch with zero findings must not score `0`/`"low"` in a way that's indistinguishable from a
  patch that was actually scanned and found risky-but-just-barely-below-threshold — per the
  acceptance criteria below, "no findings" is handled as an explicit, clearly-labeled case
  (see the "no findings" acceptance criterion) rather than silently reusing the same
  score/level path as a scored-but-clean patch. (Both end up presenting as low risk to the user,
  but the module's return value / summary text should make it clear there simply were no
  findings, versus findings existed but scored low.)

**Exit code behavior (unchanged intent, now derived from the score):** Today, exit code 1 only
happens when a high-severity finding exists. Since one `high` finding always contributes +40,
and the `medium` threshold for `"high"` level starts at 60, a single high-severity finding alone
would NOT cross into `"high"` level by score/level alone (40 < 60) — so exit-code derivation
must not naively become "exit 1 iff level is `high`", or it would silently loosen today's
behavior (a lone `@ts-ignore` currently always exits 1). To keep "existing findings behavior"
and "exit code behavior remains compatible... high-severity patches should exit 1" both true
simultaneously, the CLI's exit-code check should remain based on the presence of a high-severity
finding (equivalent to today), in addition to (optionally) also exiting non-zero when the
overall `level` is `"high"` from accumulated medium/low findings. Do not weaken the existing
"any high-severity finding → exit 1" guarantee while adding the new score-based reporting.

## Acceptance Criteria

- [ ] `src/scoring/risk-score.ts` exists and exports a pure function (e.g. `scoreRisk` or
      `calculateRiskScore`) that accepts `Finding[]` and returns a structured risk result.
- [ ] The risk result includes at least: `score: number` (0–100), `level: "low" | "medium" |
      "high"`, a summary/verdict string, `findingCount: number`, `highCount: number`,
      `mediumCount: number`, `lowCount: number`.
- [ ] Scoring is deterministic and documented (a code comment and/or a note in
      `architecture.md` explaining the formula): high finding = +40, medium finding = +20, low
      finding = +10, sum capped at 100.
- [ ] `level` thresholds: 0–24 = `"low"`, 25–59 = `"medium"`, 60–100 = `"high"`.
- [ ] High-severity findings materially increase the score more than medium; medium increases
      it more than low (verified directly: 40 > 20 > 10 per finding).
- [ ] A patch with zero findings does not produce the same result shape/summary as a scored
      patch that happens to compute to score 0 — the "no findings" case is clearly distinguished
      (e.g. `findingCount: 0` alongside a summary string that says no issues were found, e.g.
      `"No risky patterns detected."`, versus a scored patch's verdict text).
- [ ] `src/cli.ts` prints the existing findings output unchanged, and additionally prints a
      simple risk score/verdict line(s) after the findings (e.g.
      `Risk score: 40/100 (medium) — ...`).
- [ ] Existing per-finding output (`[SEVERITY] message` lines, the "N potential issue(s)" header,
      the "no obvious risky patterns" message, the "no git diff found" message) is unchanged,
      byte-for-byte, from before this task.
- [ ] Exit code behavior remains at least as strict as before: a diff containing a high-severity
      finding (e.g. `@ts-ignore`) still exits 1. A clean diff (no findings) still exits 0.
- [ ] No unnecessary dependencies are added.
- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm tsx src/cli.ts --help` works.
- [ ] `pnpm tsx src/cli.ts diff` works against a clean tree (still reports "No git diff
      found...", exit 0 — clean tree means no diff at all, so risk scoring isn't invoked).
- [ ] `pnpm tsx src/cli.ts diff` works against a risky diff containing `any`, `TODO`,
      `console.log`, broad `catch`, and `@ts-ignore` — all five findings printed as before, plus
      a risk score/verdict line, exit code 1.

## Done Means

This task is done only when every criterion above has been verified by actually running the
commands (not just by reading the code), and a completion report has been appended below. If
anything can't be verified or doesn't work, that must be documented as a blocker in the
completion report — do not mark it done anyway.

## Files likely affected

- New: `src/scoring/risk-score.ts` (the scoring function + result type)
- `src/cli.ts` (call the scorer after `scan()`, print the score/verdict, derive exit code)
- `.ai-os/architecture.md` (update "Current state" once the scorer exists; the target layout
  already documents `src/scoring/risk-score.ts`, so this is just marking it done)
- `src/findings/types.ts` (read-only; no changes expected — the scorer only needs the existing
  `Finding` shape)
- `src/rules/*.ts`, `src/rules/index.ts`, `src/engine/scan.ts` (read-only; no changes expected)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff` against a clean tree
- `pnpm tsx src/cli.ts diff` against a diff containing `any`, `TODO`, `console.log`, broad
  `catch`, and `@ts-ignore` — confirm identical per-finding output to before this task, a new
  risk score/verdict line, and exit code 1

## Non-goals

- Do not add a JSON reporter (backlog item 7).
- Do not add a Markdown reporter (backlog item 8).
- Do not add new rules (backlog item 4 is already satisfied).
- Do not add LLM calls.
- Do not add backend/auth/dashboard.
- Do not over-engineer the scoring algorithm (no configurable weights, no per-rule score
  overrides, no config file loader — flat per-severity weights as specified above).
- Do not add or upgrade dependencies.

## Suggested agent

Implementation Agent

---

## Completion Report

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `src/scoring/risk-score.ts` exists and exports a pure function (`scoreRisk`) that accepts
      `Finding[]` and returns a structured risk result — verified by reading the file; it has no
      import of `cli.ts`, git, or Commander.
- [x] The risk result includes `score`, `level`, `summary`, `findingCount`, `highCount`,
      `mediumCount`, `lowCount` — verified: the `RiskResult` interface declares exactly these
      fields (plus nothing extra beyond what was asked for).
- [x] Scoring is deterministic and documented — verified: `SEVERITY_WEIGHT` constant
      (`high: 40, medium: 20, low: 10`) and `MAX_SCORE = 100` are named constants with a
      doc comment explaining the intent; `architecture.md`'s risk-scorer section documents the
      same formula.
- [x] `level` thresholds (0–24 low, 25–59 medium, 60–100 high) — verified by reading
      `levelFromScore()` and by direct CLI tests below (score 10 → low, score 40 → medium,
      score 100 → high).
- [x] High > medium > low contribution per finding (40 > 20 > 10) — verified by reading the
      weight table and by the "lone high-severity finding" test below (1 finding → score 40,
      exactly `SEVERITY_WEIGHT.high`).
- [x] Zero-findings case is distinguished from a scored patch — verified: `scoreRisk([])`
      (and any empty `findings` array) short-circuits before the weighted-sum path and returns
      `summary: "No risky patterns detected."`, distinct from the scored-patch summary format
      (`"N potential issue(s) found."`). Confirmed the short-circuit is unreachable by a
      nonzero-finding array (the weighted-sum branch always executes when `findingCount > 0`
      and can only score 0 if `findingCount` were 0, which is excluded by the guard).
- [x] `src/cli.ts` prints existing findings output unchanged, plus a new risk score/verdict
      line after it — verified: `printFindings` function body is byte-for-byte unchanged from
      before this task; a new `printRiskResult()` function and its call site
      (`Risk score: ${score}/100 (${level}) — ${summary}`) were added after the
      `printFindings(findings)` call, confirmed in the live CLI output below.
- [x] Existing per-finding output unchanged byte-for-byte — verified: diffed the printed output
      of the risky-diff test below against task 003's/004's recorded output — identical
      `[SEVERITY] message` lines, identical `"\nSlopCheck found N potential issue(s):\n"`
      header, and the "no git diff found" message (clean-tree case) is unchanged and risk
      scoring correctly isn't invoked at all in that branch (it returns early before `scan()`).
- [x] Exit code behavior remains at least as strict as before — verified with three targeted
      scenarios (see below): (1) a diff with all 5 patterns including `@ts-ignore` → score 100,
      level `"high"`, exit 1; (2) a diff with **only** a lone `@ts-ignore` (`highCount: 1`,
      `mediumCount: 0`, `lowCount: 0`) → score 40, level `"medium"` (not `"high"` — 40 is below
      the 60 threshold), yet the CLI still exits 1 because the original
      "any high-severity finding" check was deliberately kept alongside the new
      `level === "high"` check; (3) a diff with only a low-severity finding → score 10, level
      `"low"`, exit 0; (4) a clean tree (no diff at all) → exit 0, no risk score printed.
      Scenario (2) is the key regression check: relying on `level` alone would have silently
      loosened the pre-existing guarantee, which is exactly why both checks were kept.
- [x] No unnecessary dependencies are added — verified `git diff --stat -- package.json
      pnpm-lock.yaml` produced no output.
- [x] `pnpm build` passes — verified, `tsup` builds `dist/cli.js` (4.19 KB, up from 2.85 KB
      pre-task, consistent with the added scoring module) and `dist/cli.d.ts`, exit 0.
- [x] `pnpm typecheck` passes — verified, `tsc --noEmit` exits 0 with no errors.
- [x] `pnpm test` passes — verified, `vitest run --passWithNoTests` exits 0 (no test files yet;
      backlog item 9 adds them — `scoreRisk` is a pure function and trivially unit-testable
      when that task lands).
- [x] `pnpm tsx src/cli.ts --help` works — verified, prints expected usage/commands.
- [x] `pnpm tsx src/cli.ts diff` works against a clean tree — verified in an isolated temp git
      repo: prints "No git diff found. Make a code change first, then run SlopCheck.", exit 0,
      no risk score line printed (correct — risk scoring only runs once a diff exists).
- [x] `pnpm tsx src/cli.ts diff` works against a risky diff with all five patterns — verified in
      the same temp repo: 5 findings printed exactly as before, plus
      `Risk score: 100/100 (high) — 5 potential issue(s) found.`, exit 1.

### Files changed

- New: `src/scoring/risk-score.ts` — `scoreRisk(findings: Finding[]): RiskResult`. Computes
  `highCount`/`mediumCount`/`lowCount`/`findingCount` by filtering on `severity`, short-circuits
  to a "no findings" result when `findingCount === 0`, otherwise sums per-severity weights
  (`high: 40, medium: 20, low: 10`), caps at 100, and derives `level` via `levelFromScore()`.
- `src/cli.ts` — added `import { scoreRisk, type RiskResult } from "./scoring/risk-score.js"`;
  added a `printRiskResult(risk: RiskResult)` function; in the `diff` command's action, after
  `printFindings(findings)`, now calls `scoreRisk(findings)`, prints the result via
  `printRiskResult`, and sets `process.exitCode = 1` when either a high-severity finding exists
  (original check, unchanged) or `risk.level === "high"` (new, additive). `printFindings` itself
  and the clean-tree early-return branch are untouched.
- `.ai-os/architecture.md` — "Current state" updated to describe task 005 as complete and the
  new scorer/CLI wiring; the "Risk scorer" component section rewritten to describe the actual
  implemented formula, `RiskResult` shape, and the dual exit-code check rationale.
- `.ai-os/current-goal.md` — checked off "Risk scoring exists" (Definition of Done) and
  "005 — Add risk scoring" (Progress).

`src/findings/types.ts`, `src/rules/*.ts`, `src/rules/index.ts`, and `src/engine/scan.ts` are
unchanged, as scoped.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts --help
git diff --stat -- package.json pnpm-lock.yaml
```

All passed/exited 0 as described above.

As with prior tasks, this project's own uncommitted changes (`src/cli.ts`, new
`src/scoring/risk-score.ts`) are the code under test, so a plain `git stash` can't produce a
genuinely clean `git diff` in *this* repo without reverting the code being verified. The same
isolated-temp-repo technique was used again: a throwaway git repo was created in the OS temp
directory (`$env:TEMP\slopcheck-005-test`), initialized with one committed file, and this
project's actual `src/cli.ts` was invoked from inside that temp repo's directory via the local
`tsx` binary, exercising four scenarios:

```
# 1. Clean tree
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> "No git diff found. Make a code change first, then run SlopCheck."  (exit 0, no risk line)

# 2. All five patterns (any, TODO, console.log, broad catch, @ts-ignore)
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> 5 findings (identical text/severities to before this task)
  -> "Risk score: 100/100 (high) — 5 potential issue(s) found."
  -> exit 1

# 3. Lone high-severity finding only (@ts-ignore, nothing else)
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> 1 finding: [HIGH] Added @ts-ignore: // @ts-ignore
  -> "Risk score: 40/100 (medium) — 1 potential issue(s) found."
  -> exit 1   <- confirms the explicit high-severity check still fires even though
                 level is "medium", not "high", at this score

# 4. Lone low-severity finding only (TODO, nothing else)
tsx C:\Projects\SlopCheck\src\cli.ts diff
  -> 1 finding: [LOW] Added TODO/FIXME/HACK: // TODO: fix later
  -> "Risk score: 10/100 (low) — 1 potential issue(s) found."
  -> exit 0
```

The temp repo was deleted afterward; this project's working tree was untouched by this
methodology.

### Blockers (if any)

None. All acceptance criteria were met and verified with actual command runs.

### `.ai-os` updates made

- `architecture.md` — "Current state" updated to mark task 005 complete; "Risk scorer" component
  section rewritten from the aspirational target description to describe the actual
  implementation (formula, `RiskResult` shape, dual exit-code check).
- `current-goal.md` — checked off "Risk scoring exists" (Definition of Done) and
  "005 — Add risk scoring" (Progress).
- `decisions.md` — no changes. The scoring formula was specified directly by the user in this
  task's brief (not an open architectural choice this task needed to make), so no new ADR was
  added.
- `backlog.md` — no changes.

### Suggested follow-ups

- **Next task: backlog item 6 — Add console reporter.** The console output (findings + risk
  score line) currently still lives inline in `cli.ts`'s `printFindings`/`printRiskResult`
  functions. Item 6 asks to extract this into `src/reporters/console.ts` as a pure function of
  `(findings, risk) => void` (or `=> string`), matching the reporter pattern that JSON/Markdown
  reporters (items 7–8) will also follow. This task deliberately left that extraction out of
  scope to keep the diff focused on scoring itself.
- Backlog item 9 ("Add tests") can now unit-test `scoreRisk` directly and in isolation (pure
  function, no git/CLI dependency) — e.g. asserting exact scores/levels for known finding
  combinations, and specifically the zero-findings short-circuit and the
  lone-high-severity-but-medium-level edge case exercised manually in this task.
- Consider whether a future task should surface `risk.level === "high"` vs. "a high-severity
  finding exists" as two visibly distinct reasons in the CLI's own output (right now both can
  independently cause exit code 1, but the printed `Risk score: ...` line doesn't call out
  *which* condition triggered the failure). Not required by this task's acceptance criteria, but
  worth considering for the console reporter (item 6) or JSON reporter (item 7).
