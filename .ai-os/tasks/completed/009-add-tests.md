# Task 009: Add tests

## Goal

Add meaningful Vitest coverage for SlopCheck's core MVP behavior — the rule engine, all five
core rules, the structured `Finding` model, risk scoring, and the three reporters — without
changing any product behavior unless a test reveals a real defect.

## Context

After tasks 002–008, `pnpm test` (`vitest run --passWithNoTests`) passes only because no test
files exist yet. The current source layout relevant to this task is:

```
src/engine/scan.ts          scan(diff): Finding[] — extracts added lines, runs every registered
                             rule, returns findings with ruleId/severity/message/line
src/rules/                  5 rule modules, each exporting a Rule { id, description, severity,
                             check(line): boolean }:
  any-type.ts                  any-type, medium, /\bany\b/
  ts-ignore.ts                 ts-ignore, high, line.includes("@ts-ignore")
  todo-fixme.ts                todo-fixme-hack, low, /TODO|FIXME|HACK/i
  console-log.ts                console-log, low, line.includes("console.log")
  broad-catch.ts                broad-catch, medium, /catch\s*\([^)]*\)\s*\{?\s*$/
src/rules/index.ts           registry: rules: Rule[] = [anyTypeRule, tsIgnoreRule,
                              todoFixmeHackRule, consoleLogRule, broadCatchRule]
src/findings/types.ts        Finding { ruleId, severity, message, line? }
src/scoring/risk-score.ts    scoreRisk(findings): RiskResult { score, level, summary,
                              findingCount, highCount, mediumCount, lowCount }. Weights:
                              high=40, medium=20, low=10, capped at 100. Levels: 0-24 low,
                              25-59 medium, 60-100 high. Zero findings short-circuits to
                              { score: 0, level: "low", summary: "No risky patterns detected." }
src/reporters/console.ts     reportConsole(findings, risk): void — prints to console.log
src/reporters/json.ts        reportJson(findings, risk): string — JSON.stringify(report, null, 2)
src/reporters/markdown.ts    reportMarkdown(findings, risk): string — Markdown heading, score,
                              level, count table, per-finding bullets
src/cli.ts                   CLI entrypoint; not a unit-test target for this task (already
                              exercised via manual `pnpm tsx src/cli.ts diff` verification)
```

Per `.ai-os/backlog.md` item 9 and `.ai-os/operating-rules.md` rule 7 ("Run tests/build before
marking complete"), this task establishes the first real automated test suite. No `vitest.config`
file exists — Vitest's default glob (`**/*.{test,spec}.?(c|m)[jt]s?(x)`, excluding
`node_modules`/`.git`) already picks up test files anywhere in the repo, so no new config is
needed; tests can live under a top-level `tests/` directory mirroring `src/`'s structure, per the
suggested layout below.

**Rule severities to test against (must not change unless a test finds a real defect):**
`any-type`→medium, `ts-ignore`→high, `todo-fixme-hack`→low, `console-log`→low,
`broad-catch`→medium.

## Acceptance Criteria

- [x] `tests/engine/scan.test.ts` (or equivalent) tests `scan()`:
      - Aggregates findings from multiple rules correctly (a diff containing lines that trigger
        several different rules produces a finding per rule per matching line).
      - A diff with no risky lines produces an empty `Finding[]`.
- [x] Each of the 5 core rules has at least one positive test (its `check()` returns `true` for
      a representative risky line) and one negative test (`check()` returns `false` for safe
      code that shouldn't trigger it): `any-type`, `ts-ignore`, `todo-fixme-hack`,
      `console-log`, `broad-catch`.
- [x] Tests verify structured `Finding` fields end-to-end (via `scan()`): `ruleId` matches the
      triggering rule's `id`, `severity` matches the rule's severity, `message` is built from
      the rule's `description` and the line, `line` is the cleaned added-line text.
- [x] `tests/scoring/risk-score.test.ts` (or equivalent) tests `scoreRisk()`:
      - No findings → `score: 0`, `level: "low"`.
      - A single low-severity finding → score increases by exactly 10.
      - A single medium-severity finding → score increases by exactly 20.
      - A single high-severity finding → score increases by exactly 40.
      - Score caps at 100 (e.g. 3+ high findings still yields `score: 100`, not higher).
      - Level thresholds: a combination scoring in each band (`0–24`, `25–59`, `60–100`) maps to
        the correct `level`.
- [x] `tests/reporters/json.test.ts` (or equivalent) tests `reportJson()`:
      - Output is valid JSON (`JSON.parse` succeeds).
      - Parsed output includes `findings` (array), `risk` (object), and top-level
        `findingCount`/`highCount`/`mediumCount`/`lowCount`.
- [x] `tests/reporters/markdown.test.ts` (or equivalent) tests `reportMarkdown()`:
      - Output includes the `## SlopCheck` heading.
      - Output includes the risk score and risk level.
      - Output includes the finding-count table/values.
      - Output includes each finding's severity, `ruleId`, and message.
- [x] `tests/reporters/console.test.ts` (optional, only if practical without over-engineering):
      if added, verify `reportConsole()` calls `console.log` with the expected findings header,
      per-finding lines, and risk score line (e.g. via a `vi.spyOn(console, "log")`).
- [x] Tests are focused and maintainable: small, readable test files near the modules they
      verify, minimal setup/mocking, no test framework abstractions beyond what Vitest provides
      out of the box.
- [x] No unnecessary dependencies are added (Vitest is already a dev dependency; no new test
      utility packages).
- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes with the new test files actually executing (not just
      `--passWithNoTests` exiting cleanly on zero files — verify the test run output reports a
      nonzero number of passed tests).
- [x] `pnpm tsx src/cli.ts --help` works.
- [x] `pnpm tsx src/cli.ts diff` works against a clean tree and a risky diff containing `any`,
      `TODO`, `console.log`, broad `catch`, and `@ts-ignore` — output/exit codes unchanged from
      task 008.
- [x] `pnpm tsx src/cli.ts diff --format json` and `pnpm tsx src/cli.ts diff --format markdown`
      still work correctly on the risky diff after tests are added (regression check that adding
      tests didn't require any production code changes that break these).

## Done Means

This task is done only when the test files exist, actually execute and pass under `pnpm test`,
every acceptance criterion above is verified by running the commands (not just by reading the
code), and a completion report is appended below. If a test reveals a real defect in existing
code, document the specific defect and the minimal fix in the completion report — don't silently
change behavior without calling it out.

## Files likely affected

- New: `tests/engine/scan.test.ts`
- New: `tests/rules/*.test.ts` or a single `tests/rules/index.test.ts` covering all 5 rules
  (whichever keeps tests focused and maintainable — Implementation Agent's judgment)
- New: `tests/scoring/risk-score.test.ts`
- New: `tests/reporters/json.test.ts`
- New: `tests/reporters/markdown.test.ts`
- New: `tests/reporters/console.test.ts` (optional)
- `src/engine/scan.ts`, `src/rules/*.ts`, `src/findings/types.ts`, `src/scoring/risk-score.ts`,
  `src/reporters/*.ts` (read-only unless a test reveals a real defect — see Non-goals)
- `.ai-os/architecture.md` (note that tests now exist, once complete)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test` (confirm actual test files run and pass — check the reported test/file counts)
- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff` against a clean tree
- `pnpm tsx src/cli.ts diff` against a risky diff containing `any`, `TODO`, `console.log`, broad
  `catch`, and `@ts-ignore`
- `pnpm tsx src/cli.ts diff --format json` against the same risky diff
- `pnpm tsx src/cli.ts diff --format markdown` against the same risky diff

## Non-goals

- Do not add new product features.
- Do not change reporter output, rule severities, or scoring logic unless a test reveals a real
  defect — if one is found, document it explicitly in the completion report rather than quietly
  fixing it.
- Do not add a GitHub Action example (backlog item 11).
- Do not add a README (backlog item 10).
- Do not add backend/auth/dashboard.
- Do not add a `vitest.config.ts` unless the default test glob genuinely doesn't pick up the new
  files (it should, since it already matches `**/*.{test,spec}.?(c|m)[jt]s?(x)`).
- Do not add new dependencies (test with plain Vitest APIs: `describe`, `it`/`test`, `expect`,
  `vi.spyOn` if needed for the optional console reporter test).

## Suggested agent

Implementation Agent

---

## Completion Report

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `tests/engine/scan.test.ts` covers aggregation across multiple rules and the empty-findings
  case — verified by `pnpm test` (all 4 tests in this file pass).
- [x] All 5 core rules have a positive and negative test in `tests/rules/rules.test.ts` (plus an
  id/severity assertion and a registry-membership test) — verified by `pnpm test`.
- [x] Structured `Finding` fields (`ruleId`, `severity`, `message`, `line`) are asserted
  end-to-end via `scan()` in `tests/engine/scan.test.ts` ("produces structured Finding fields
  matching the triggering rule" test) — verified by `pnpm test`.
- [x] `tests/scoring/risk-score.test.ts` covers zero findings, +10/+20/+40 per severity, the
  100-point cap, and all three level bands, plus a per-severity count check — verified by
  `pnpm test`.
- [x] `tests/reporters/json.test.ts` parses the output with `JSON.parse`, checks `findings`,
  `risk`, and the four top-level counts, plus an empty-findings case — verified by `pnpm test`.
- [x] `tests/reporters/markdown.test.ts` checks the `## SlopCheck` heading, risk score/level
  lines, the count table row values, and per-finding severity/ruleId/message — verified by
  `pnpm test`.
- [x] `tests/reporters/console.test.ts` added (optional criterion), using `vi.spyOn(console,
  "log")` to check the no-findings message, per-finding severity/message lines, and the risk
  score line — verified by `pnpm test`.
- [x] All 6 test files are small (one `describe` block per unit, plain `expect` assertions), no
  shared test helpers beyond a single local `makeFinding()` factory in the risk-score test.
- [x] No new dependencies added — `package.json` `dependencies`/`devDependencies` unchanged;
  tests use only `vitest`'s built-in `describe`/`it`/`expect`/`vi`.
- [x] `pnpm build` — exit 0, `dist/cli.js` and `dist/cli.d.ts` built successfully.
- [x] `pnpm typecheck` (`tsc --noEmit`) — exit 0, no errors.
- [x] `pnpm test` — `vitest run --passWithNoTests` reports **6 test files passed (6), 40 tests
  passed (40)** — confirms real test files are executing, not just an empty pass.
- [x] `pnpm tsx src/cli.ts --help` — exit 0, prints usage/commands as before.
- [x] `pnpm tsx src/cli.ts diff` — verified in an isolated temp git repo
  (`%TEMP%\slopcheck-009-test`, cleaned up afterward): clean tree prints "No git diff found..."
  with exit 0; a staged diff containing `any`, `@ts-ignore`, `TODO`, `console.log` (x2), and a
  broad `catch` reports 6 findings (`[MEDIUM] any-type`, `[HIGH] ts-ignore`, `[LOW]
  todo-fixme-hack`, `[LOW] console-log` x2, `[MEDIUM] broad-catch`), `Risk score: 100/100
  (high)`, and exits 1 — identical to task 008's behavior.
- [x] `pnpm tsx src/cli.ts diff --format json` and `--format markdown` on the same risky diff —
  both printed pure-format output (no console text mixed in), correct counts/heading/score/level
  and per-finding detail, and exited 1. No production code changes were needed.

### Files changed

- `tests/engine/scan.test.ts` — new: `scan()` aggregation, empty-diff, ignored-line, and
  structured-Finding-field tests.
- `tests/rules/rules.test.ts` — new: positive/negative/id/severity tests for all 5 rules plus a
  registry test.
- `tests/scoring/risk-score.test.ts` — new: zero/low/medium/high scoring, 100-point cap, level
  band, and count tests.
- `tests/reporters/json.test.ts` — new: valid-JSON, findings/risk, top-level counts, and
  empty-findings tests.
- `tests/reporters/markdown.test.ts` — new: heading, score/level, count table, per-finding
  detail, and empty-findings tests.
- `tests/reporters/console.test.ts` — new (optional criterion): `console.log` spy-based tests for
  the empty and non-empty findings paths.
- `.ai-os/tasks/active/009-add-tests.md` — checked off all acceptance criteria; this completion
  report.
- `.ai-os/current-goal.md` — checked "Tests exist for core rules" in Definition of Done and
  "009 — Add tests" in Progress.
- `.ai-os/architecture.md` — added a note that an automated Vitest suite now exists under
  `tests/`, covering the engine, rules, scoring, and reporters.

No `src/` production files were changed — every test passed against the existing implementation,
so no defect-driven fixes were needed.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts --help
# isolated temp repo (%TEMP%\slopcheck-009-test):
#   git init + initial commit of a safe foo.ts
node <tsx cli> src/cli.ts diff                     # clean tree
#   staged foo.ts rewritten with any/@ts-ignore/TODO/console.log x2/broad catch
node <tsx cli> src/cli.ts diff                     # console format
node <tsx cli> src/cli.ts diff --format json
node <tsx cli> src/cli.ts diff --format markdown
# temp repo removed afterward
```

- `pnpm build`: exit 0.
- `pnpm typecheck`: exit 0.
- `pnpm test`: exit 0, "Test Files 6 passed (6)", "Tests 40 passed (40)".
- `pnpm tsx src/cli.ts --help`: exit 0, usage text printed.
- Clean-tree `diff`: exit 0, "No git diff found. Make a code change first, then run SlopCheck."
- Risky-diff `diff` (console): exit 1, 6 findings listed with correct severities, "Risk score:
  100/100 (high) — 6 potential issue(s) found."
- Risky-diff `diff --format json`: exit 1, valid JSON with `findings`/`risk`/counts matching the
  console run.
- Risky-diff `diff --format markdown`: exit 1, Markdown with heading/score/level/table/findings
  matching the console run.

(Note: invoking via `pnpm --dir <repo> exec tsx ...` from the temp repo incorrectly reset the
child process's working directory back to the repo root, causing false "No git diff found"
results — a test-harness artifact, not a CLI bug. Switched to invoking `tsx`'s CLI entry directly
via `node <path-to-tsx>/dist/cli.mjs <path-to-src>/cli.ts diff` from the temp repo, which
preserved the correct working directory and produced the results above.)

### Blockers (if any)

None. Task completed fully.

### `.ai-os` updates made

- `current-goal.md`: checked "Tests exist for core rules (...)" under Definition of Done, and
  checked "009 — Add tests" under Progress.
- `architecture.md`: added a short note under "Current state" that a Vitest test suite now
  exists under `tests/` (mirroring `src/`), covering the engine, all 5 rules, risk scoring, and
  all 3 reporters, run via `pnpm test`.

### Suggested follow-ups

- Backlog item 10 (README) is next per `current-goal.md`'s Progress list.
- Consider a `pnpm test -- --coverage` pass later (not required by this task) once the test
  suite grows, to spot any untested branches (e.g. reporter behavior with only-low or only-medium
  findings) — not urgent for the MVP.
