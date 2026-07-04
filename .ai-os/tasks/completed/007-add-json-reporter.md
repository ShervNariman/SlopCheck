# Task 007: Add JSON reporter

## Goal

Add a machine-readable JSON reporter and a `--format` CLI option so SlopCheck can produce
structured output for automation and future CI use, without changing the default console
behavior.

## Context

After task 006 (console reporter), the current source layout relevant to this task is:

```
src/cli.ts                CLI entrypoint: Commander setup, `diff` command orchestration.
                           Calls getGitDiff → scan → scoreRisk → reportConsole → sets exit code.
                           No format flag exists yet — console output is the only mode.
src/reporters/console.ts   reportConsole(findings: Finding[], risk: RiskResult): void
                           Prints findings list (or "no obvious risky patterns" message) and
                           "Risk score: N/100 (level) — summary" line. No git/rules/engine deps.
src/findings/types.ts       Finding { ruleId, severity, message, line? }
src/scoring/risk-score.ts   scoreRisk(findings): RiskResult
                            { score, level, summary, findingCount, highCount, mediumCount,
                              lowCount }
src/engine/scan.ts          scan(diff): Finding[]
```

Per `.ai-os/backlog.md` item 7 and `.ai-os/architecture.md`'s target layout, a
`src/reporters/json.ts` module should exist alongside `console.ts`, following the same reporter
pattern: a function that depends only on `Finding`/`RiskResult` types, no git/rules/engine
imports. `src/cli.ts` needs a `--format`/`--json` flag so callers can choose between the
existing human-readable console output (default, unchanged) and the new JSON output.

**What's added to `cli.ts`:**
- A `--format <format>` option on the `diff` command, accepting `"console"` (default) or
  `"json"`.
- An optional `--json` boolean flag as a convenience alias for `--format json`.
- Branching logic: when the resolved format is `"json"`, call the JSON reporter and print its
  output instead of calling `reportConsole`; otherwise behave exactly as today.

**What's added to `src/reporters/json.ts`:**
- A function (e.g. `reportJson`) that accepts `Finding[]` and `RiskResult` and returns a single
  JSON string (or an object the caller `JSON.stringify`s) containing at least: `findings`,
  `risk`, `findingCount`, `highCount`, `mediumCount`, `lowCount`.

**Output purity for JSON mode:** when `--format json` (or `--json`) is used, stdout must contain
only the JSON payload — no console-formatted findings/risk text mixed in. The one documented
exception is the existing "No git diff found..." message for the no-diff case (see acceptance
criteria below for how this is handled/documented).

**Exit code behavior is unchanged regardless of format** — the same dual check (high-severity
finding present, or `risk.level === "high"`) applies whether the console or JSON reporter is
used; format selection must not affect `process.exitCode`.

## Acceptance Criteria

- [ ] `src/reporters/json.ts` exists and exports a function (e.g. `reportJson`) that accepts
      `Finding[]` and `RiskResult` and produces the JSON payload/string.
- [ ] JSON output includes at least: `findings`, `risk`, `findingCount`, `highCount`,
      `mediumCount`, `lowCount` (as top-level fields, alongside or nested with `risk` — must be
      derivable directly by parsing the printed JSON, not requiring re-computation).
- [ ] The JSON reporter has no dependency on git, rules, or the engine — only on
      `src/findings/types.ts` and `src/scoring/risk-score.ts` (for `RiskResult`).
- [ ] `src/cli.ts`'s `diff` command accepts `--format <format>` with `"console"` (default) and
      `"json"` as valid values.
- [ ] An optional `--json` boolean flag works as a convenience alias for `--format json`.
- [ ] When no format flag is passed, output is identical to today's console output (verified
      against task 006's recorded output) — the default remains console.
- [ ] `slopcheck diff --format json` (and `--json`, if implemented) prints valid, parseable JSON
      (`JSON.parse` succeeds on stdout) containing the risky-diff's findings and risk data.
- [ ] No human-readable console text (findings lines, "Risk score: ..." line) is mixed into
      stdout when JSON format is used — stdout contains only the JSON payload in the
      diff-exists case. The pre-existing "No git diff found..." message for the no-diff case is
      explicitly out of scope for JSON purity in this task (documented here, not a defect): it
      is printed before any reporter is invoked and applies regardless of `--format`, since
      there is nothing to report yet.
- [ ] Exit code behavior is unchanged regardless of format:
      - clean/no-diff case → exit 0 (both formats)
      - low-risk findings only → exit 0 (both formats)
      - high-severity finding present → exit 1 (both formats)
      - `risk.level === "high"` → exit 1 (both formats)
- [ ] No unnecessary dependencies are added (JSON output uses built-in `JSON.stringify`, no new
      package).
- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm tsx src/cli.ts --help` works and documents the new flag(s).
- [ ] `pnpm tsx src/cli.ts diff` (no flag) works against a clean tree and a risky diff
      containing `any`, `TODO`, `console.log`, broad `catch`, and `@ts-ignore` — output and exit
      codes identical to task 006.
- [ ] `pnpm tsx src/cli.ts diff --format json` against the risky diff above outputs valid JSON
      (parseable, contains findings/risk data), exit code 1.
- [ ] `pnpm tsx src/cli.ts diff --json` (if the alias is implemented) produces the same valid
      JSON output as `--format json` on the same risky diff.

## Done Means

This task is done only when the JSON reporter and CLI format flag exist, console output remains
the default and unchanged, JSON output is valid and parseable with no mixed-in console text, exit
code behavior is unchanged regardless of format, all of this is verified by actually running the
commands, and a completion report is appended below.

## Files likely affected

- New: `src/reporters/json.ts` (JSON reporter function)
- `src/cli.ts` (add `--format`/`--json` option(s); branch between `reportConsole` and the new
  JSON reporter; keep exit-code logic format-independent)
- `.ai-os/architecture.md` (update "Current state" and the "Reporters" component section once
  the JSON reporter exists)
- `src/findings/types.ts`, `src/scoring/risk-score.ts`, `src/engine/scan.ts`,
  `src/reporters/console.ts` (read-only; no changes expected)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff` against a clean tree (no flag)
- `pnpm tsx src/cli.ts diff` against a risky diff containing `any`, `TODO`, `console.log`, broad
  `catch`, and `@ts-ignore` (no flag) — confirm identical output/exit code to task 006
- `pnpm tsx src/cli.ts diff --format json` against the same risky diff — confirm valid,
  parseable JSON output and exit code 1
- `pnpm tsx src/cli.ts diff --json` against the same risky diff, if the alias is implemented —
  confirm equivalent JSON output

## Non-goals

- Do not add a Markdown reporter (backlog item 8).
- Do not change risk scoring logic (`src/scoring/risk-score.ts` is read-only).
- Do not change `src/reporters/console.ts`'s existing output or behavior.
- Do not add new rules.
- Do not add LLM calls.
- Do not add backend/auth/dashboard.
- Do not add or upgrade dependencies (use built-in `JSON.stringify`).
- Do not over-engineer the format selection (no plugin-style reporter registry yet — a simple
  flag check/branch in `cli.ts` is sufficient for two formats).

## Suggested agent

Implementation Agent

---

## Completion Report

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `src/reporters/json.ts` exists and exports `reportJson(findings, risk): string` — verified
      by reading the file.
- [x] JSON output includes `findings`, `risk`, `findingCount`, `highCount`, `mediumCount`,
      `lowCount` as top-level fields — verified by reading `JsonReport` interface and by parsing
      live CLI output below (`ConvertFrom-Json` succeeded, all fields present at top level).
- [x] JSON reporter has no dependency on git, rules, or engine — verified: imports only
      `Finding` from `../findings/types.js` and `RiskResult` from `../scoring/risk-score.js`.
- [x] `--format <format>` option accepts `"console"` (default) and `"json"` — verified via
      `diff --help` output and live tests below.
- [x] `--json` boolean alias works — verified: `diff --json` produced output identical to
      `diff --format json` on the same risky diff.
- [x] Default (no flag) output identical to task 006 — verified: risky-diff console output
      matches task 006's recorded output byte-for-byte; clean-tree message unchanged.
- [x] `--format json` produces valid, parseable JSON — verified: `ConvertFrom-Json` succeeded on
      the risky-diff output; contained 5 findings and correct risk data (score 100, level high).
- [x] No console text mixed into JSON-mode stdout when a diff exists — verified: JSON-mode
      output for both the risky diff and the low-only diff was pure JSON, no findings-list text
      or "Risk score: ..." line alongside it. The pre-existing "No git diff found..." message is
      unaffected by `--format`/`--json` and is documented as the one pre-reporter exception (no
      diff exists yet, so there's nothing to format).
- [x] Exit code behavior unchanged regardless of format — verified: clean tree exit 0 (both
      default and `--format json`); low-only finding exit 0 with `--format json`; all-five
      risky diff exit 1 with default, `--format json`, and `--json`.
- [x] No unnecessary dependencies added — verified `git diff --stat -- package.json
      pnpm-lock.yaml` produced no output; JSON output uses only built-in `JSON.stringify`.
- [x] `pnpm build` passes — exit 0.
- [x] `pnpm typecheck` passes — exit 0.
- [x] `pnpm test` passes — exit 0.
- [x] `pnpm tsx src/cli.ts --help` works and documents `diff [options]`; `diff --help` documents
      both `--format <format>` and `--json`.
- [x] `pnpm tsx src/cli.ts diff` (no flag) — clean tree and risky diff (5 patterns) both work,
      output/exit codes identical to task 006.
- [x] `pnpm tsx src/cli.ts diff --format json` on the risky diff — valid JSON, exit 1.
- [x] `pnpm tsx src/cli.ts diff --json` on the risky diff — equivalent JSON output to
      `--format json`, exit 1.

### Files changed

- New: `src/reporters/json.ts` — `reportJson(findings, risk): string`, returns a pretty-printed
  JSON string (`JsonReport` shape: `findings`, `risk`, `findingCount`, `highCount`,
  `mediumCount`, `lowCount`). No git/rules/engine dependency.
- `src/cli.ts` — added `--format <format>` option (default `"console"`) and `--json` boolean
  option to the `diff` command; action resolves `format = options.json ? "json" : options.format`
  and branches between `reportConsole` and `console.log(reportJson(...))`. Exit-code logic
  (`hasHighSeverityFinding || risk.level === "high"`) unchanged and applies regardless of format.
- `.ai-os/architecture.md` — "Current state" and "Reporters" sections updated to describe the
  JSON reporter and CLI format flags.
- `.ai-os/current-goal.md` — checked off "JSON reporter exists" and "007 — Add JSON reporter".

`src/reporters/console.ts`, `src/scoring/risk-score.ts`, `src/findings/types.ts`,
`src/engine/scan.ts` unchanged, as scoped.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts --help
pnpm tsx src/cli.ts diff --help
git diff --stat -- package.json pnpm-lock.yaml
```

All passed/exited 0 as described above.

Isolated temp git repo (`$env:TEMP\slopcheck-007-test`), invoking this project's actual
`src/cli.ts` via the local `tsx` binary:

```
# Clean tree, default format -> "No git diff found...", exit 0
# Clean tree, --format json -> "No git diff found...", exit 0 (documented exception)
# Risky diff (5 patterns), default format -> identical to task 006's output, exit 1
# Risky diff (5 patterns), --format json -> valid JSON (ConvertFrom-Json succeeded),
#   findings.length=5, risk.score=100, risk.level="high", findingCount/highCount/mediumCount/
#   lowCount all present at top level, exit 1
# Risky diff (5 patterns), --json -> byte-identical JSON to --format json, exit 1
# Low-only diff (TODO only), --format json -> valid JSON, risk.score=10, risk.level="low",
#   exit 0, no console text mixed in
```

The temp repo was deleted afterward; this project's working tree was untouched.

### Blockers (if any)

None. All acceptance criteria were met and verified with actual command runs.

### `.ai-os` updates made

- `architecture.md` — "Current state" and "Reporters" sections updated to describe the JSON
  reporter implementation and the new `--format`/`--json` CLI flags.
- `current-goal.md` — checked off "JSON reporter exists" (Definition of Done) and
  "007 — Add JSON reporter" (Progress).
- `decisions.md` — no changes. The JSON shape/format flag design was specified directly in this
  task's brief, not an open architectural choice requiring a new ADR.
- `backlog.md` — no changes.

### Suggested follow-ups

- **Next task: backlog item 8 — Add Markdown reporter** (`src/reporters/markdown.ts`, likely a
  `--format markdown` value added to the same `--format` option, following this task's pattern).
- Backlog item 9 ("Add tests") can now unit-test `reportJson` directly (pure function, easy to
  assert on the parsed object shape) alongside `scoreRisk` and `reportConsole`.
- Consider whether future reporters/format values should move the format branching out of
  `cli.ts`'s inline `if` into a small reporter lookup/registry if a third or fourth format is
  added — not needed yet with only two formats, per this task's non-goals.
