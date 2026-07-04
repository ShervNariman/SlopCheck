# Task 008: Add Markdown reporter

## Goal

Add a Markdown reporter and `--format markdown` CLI support so SlopCheck can produce
human-readable output suitable for pasting into GitHub PR comments and CI summaries, without
changing the default console behavior or existing JSON/console format options.

## Context

After tasks 006 (console reporter) and 007 (JSON reporter), the current source layout relevant
to this task is:

```
src/cli.ts                CLI entrypoint: `diff` command with `--format <format>` (default
                           "console", or "json") and `--json` alias. Branches to reportConsole or
                           reportJson after getGitDiff → scan → scoreRisk.
src/reporters/console.ts   reportConsole(findings, risk): void — human-readable terminal output
src/reporters/json.ts        reportJson(findings, risk): string — pretty-printed JSON payload
src/findings/types.ts       Finding { ruleId, severity, message, line? }
src/scoring/risk-score.ts   scoreRisk(findings): RiskResult
src/engine/scan.ts          scan(diff): Finding[]
```

Per `.ai-os/backlog.md` item 8 and `.ai-os/architecture.md`'s target layout, a
`src/reporters/markdown.ts` module should exist alongside `console.ts` and `json.ts`, following
the same reporter pattern: a function that depends only on `Finding`/`RiskResult` types, no
git/rules/engine imports. `src/cli.ts` needs `"markdown"` added as a valid `--format` value.

**What's added to `src/reporters/markdown.ts`:**
- A function (e.g. `reportMarkdown`) that accepts `Finding[]` and `RiskResult` and returns a
  Markdown string containing at least: a SlopCheck heading, risk score, risk level, finding
  counts, and individual findings with severity, `ruleId`, and message.

**What's added to `src/cli.ts`:**
- `"markdown"` as a valid value for the existing `--format <format>` option (update the option
  description/help text to list it).
- A branch: when `format === "markdown"`, call `reportMarkdown` and `console.log` its output
  (same pattern as JSON mode — stdout contains only the Markdown payload when a diff exists).

**Output purity for Markdown mode:** when `--format markdown` is used, stdout must contain only
the Markdown payload — no console-formatted findings/risk text mixed in. The one documented
exception is the existing "No git diff found..." message for the no-diff case (printed before any
reporter is invoked, same as JSON mode in task 007).

**Exit code behavior is unchanged regardless of format** — the same dual check (high-severity
finding present, or `risk.level === "high"`) applies in all formats.

## Acceptance Criteria

- [ ] `src/reporters/markdown.ts` exists and exports a function (e.g. `reportMarkdown`) that
      accepts `Finding[]` and `RiskResult` and returns a Markdown string.
- [ ] Markdown output includes at least: a SlopCheck heading, risk score, risk level, finding
      counts (total/high/medium/low), and individual findings with severity, `ruleId`, and
      message.
- [ ] The Markdown reporter has no dependency on git, rules, or the engine — only on
      `src/findings/types.ts` and `src/scoring/risk-score.ts` (for `RiskResult`).
- [ ] `src/cli.ts`'s `diff` command accepts `--format markdown` and prints the Markdown reporter
      output when selected.
- [ ] Default format remains `"console"` when no format flag is passed.
- [ ] Existing `--format console`, `--format json`, and `--json` behavior remains unchanged
      (verified against task 006/007 recorded output).
- [ ] Markdown output contains no extra non-Markdown console text before or after the payload
      when a diff exists. The pre-existing "No git diff found..." message for the no-diff case is
      the documented exception (same as task 007).
- [ ] Exit code behavior is unchanged regardless of format:
      - clean/no-diff case → exit 0
      - low-risk findings only → exit 0
      - high-severity finding present → exit 1
      - `risk.level === "high"` → exit 1
- [ ] No unnecessary dependencies are added.
- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm tsx src/cli.ts --help` works.
- [ ] `pnpm tsx src/cli.ts diff --help` documents `--format` including `markdown`.
- [ ] `pnpm tsx src/cli.ts diff` (no flag) works against a clean tree and a risky diff
      containing `any`, `TODO`, `console.log`, broad `catch`, and `@ts-ignore` — output/exit
      codes identical to task 006/007.
- [ ] `pnpm tsx src/cli.ts diff --format markdown` against the risky diff outputs valid,
      readable Markdown containing the required sections/fields, exit code 1.
- [ ] `pnpm tsx src/cli.ts diff --format json` (and `--json`) still outputs valid, parseable JSON
      on the same risky diff — regression check that this task didn't break JSON mode.

## Done Means

This task is done only when the Markdown reporter and `--format markdown` support exist,
console/JSON behavior is verified unchanged, Markdown output is readable and contains the
required fields, exit code behavior is unchanged regardless of format, all of this is verified by
actually running the commands, and a completion report is appended below.

## Files likely affected

- New: `src/reporters/markdown.ts` (Markdown reporter function)
- `src/cli.ts` (add `"markdown"` to `--format` branch; update option description)
- `.ai-os/architecture.md` (update "Current state" and "Reporters" section)
- `src/reporters/console.ts`, `src/reporters/json.ts`, `src/findings/types.ts`,
  `src/scoring/risk-score.ts`, `src/engine/scan.ts` (read-only; no changes expected)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff --help`
- `pnpm tsx src/cli.ts diff` against a clean tree (no flag)
- `pnpm tsx src/cli.ts diff` against a risky diff (no flag) — confirm identical to task 006
- `pnpm tsx src/cli.ts diff --format markdown` against the risky diff — confirm readable Markdown
- `pnpm tsx src/cli.ts diff --format json` against the risky diff — confirm JSON still valid

## Non-goals

- Do not add a GitHub Action example (backlog item 11).
- Do not add automated tests (backlog item 9) unless required to make verification pass.
- Do not change risk scoring logic (`src/scoring/risk-score.ts` is read-only).
- Do not change `src/reporters/console.ts` or `src/reporters/json.ts` behavior.
- Do not add new rules.
- Do not add LLM calls.
- Do not add backend/auth/dashboard.
- Do not add or upgrade dependencies.
- Do not over-engineer format selection (simple `if/else if/else` branch in `cli.ts` is fine).

## Suggested agent

Implementation Agent

---

## Completion Report

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `src/reporters/markdown.ts` exists and exports `reportMarkdown(findings, risk): string` —
      verified by reading the file.
- [x] Markdown output includes SlopCheck heading, risk score, risk level, finding counts, and
      per-finding severity/`ruleId`/message — verified in live CLI output below (heading,
      `**Risk score:**`, `**Risk level:**`, count table, bullet list with `[SEVERITY]`
      (`ruleId`) message).
- [x] Markdown reporter has no dependency on git, rules, or engine — verified: imports only
      `Finding` and `RiskResult`.
- [x] `--format markdown` supported — verified via `diff --help` and live test.
- [x] Default format remains console — verified: risky-diff default output byte-identical to
      task 006/007.
- [x] Existing `--format console`, `--format json`, and `--json` unchanged — verified: console
      output matches prior tasks; JSON and `--json` both parse successfully (`ConvertFrom-Json`).
- [x] Markdown output is pure (no console text mixed in when diff exists) — verified; no-diff
      case still prints "No git diff found..." (documented exception, same as task 007).
- [x] Exit code behavior unchanged — verified: clean tree exit 0; low-only markdown exit 0;
      risky diff exit 1 for console, markdown, and json formats.
- [x] No unnecessary dependencies — verified `git diff --stat -- package.json pnpm-lock.yaml`
      empty.
- [x] `pnpm build`, `pnpm typecheck`, `pnpm test` — all exit 0.
- [x] `pnpm tsx src/cli.ts --help` and `diff --help` — exit 0; `--format` documents markdown.
- [x] `pnpm tsx src/cli.ts diff` clean tree and risky diff (default) — work as before.
- [x] `pnpm tsx src/cli.ts diff --format markdown` — readable Markdown, exit 1 on risky diff.
- [x] `pnpm tsx src/cli.ts diff --format json` and `--json` — valid JSON, exit 1.

### Files changed

- New: `src/reporters/markdown.ts` — `reportMarkdown(findings, risk): string`.
- `src/cli.ts` — added `markdown` branch and updated `--format` description.
- `.ai-os/architecture.md`, `.ai-os/current-goal.md` — updated for task 008.

`src/reporters/console.ts`, `src/reporters/json.ts`, `src/scoring/risk-score.ts` unchanged.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts --help
pnpm tsx src/cli.ts diff --help
```

Temp repo (`$env:TEMP\slopcheck-008-test`): clean tree (default), risky diff (console/markdown/json),
low-only markdown, JSON regression.

### Blockers (if any)

None.

### `.ai-os` updates made

- `architecture.md` — current state and reporters section updated.
- `current-goal.md` — checked off Markdown reporter and task 008.

### Suggested follow-ups

- **Next: backlog item 9 — Add tests** (engine, rules, reporters including `reportMarkdown`).
- **Then: backlog item 10 — README** (document `--format console|json|markdown` and `--json`).
